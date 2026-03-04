import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';
import TelemetryPoint from '@/models/TelemetryPoint';
import bcrypt from 'bcryptjs';

// Constants for binary LogPacket parsing
const PACKET_HEADER = 0xAA55;
const PACKET_SIZE = 32;
const MAGIC_BMCR = 0x52434D42; // "BMCR" reversed for little-endian

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// GET: Retrieve user settings for the device
export async function GET(request: Request) {
    try {
        await dbConnect();

        // Basic authentication check
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return NextResponse.json(
                { error: 'Unauthorized - Missing credentials' },
                { status: 401 }
            );
        }

        // Decode Basic Auth
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':'); // username here is identifier

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid credentials' },
                { status: 401 }
            );
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: username.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) { }

        // Migration logic
        if (!isMatch && user.password === password) {
            console.log(`Migrating device sync password for user: ${username}`);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            isMatch = true;
        }

        if (!isMatch) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid credentials' },
                { status: 401 }
            );
        }

        // Capture Device ID from query params if not linked
        const { searchParams } = new URL(request.url);
        const deviceId = searchParams.get('deviceId');
        if (deviceId && !user.deviceId) {
            user.deviceId = deviceId;
            console.log(`Linked device ${deviceId} to user ${user.email} (via GET)`);
        }

        // Update lastConnection timestamp
        user.lastConnection = new Date();
        await user.save();

        // Return user's device settings and profile info
        return NextResponse.json({
            success: true,
            data: {
                settings: user.settings,
                tracks: user.tracks,
                engines: user.engines,
                activeEngine: user.activeEngine,
                deviceId: user.deviceId, // Return stored identifier
                profile: {
                    username: user.username || user.name,
                    driverNumber: user.driverNumber || 0
                }
            },
            syncTime: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Upload session or update settings
export async function POST(request: Request) {
    try {
        await dbConnect();

        // Basic authentication check
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        const user = await User.findOne({
            $or: [
                { email: username.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify password
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) { }

        // Migration logic
        if (!isMatch && user.password === password) {
            console.log(`Migrating device sync (POST) password for user: ${username}`);
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            isMatch = true;
        }

        if (!isMatch) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Capture Device ID if provided
        if (body.deviceId && !user.deviceId) {
            user.deviceId = body.deviceId;
            await user.save();
            console.log(`Linked device ${body.deviceId} to user ${user.email}`);
        }

        // Handle Session Upload
        if (body.type === 'upload_session') {
            const { filename, is_base64 } = body;
            let { csv_data } = body;

            if (is_base64) {
                csv_data = Buffer.from(csv_data, 'base64');
            } else {
                csv_data = Buffer.from(csv_data, 'utf-8');
            }

            console.log(`Receiving session: ${filename} for user ${user.email} (${csv_data.length} bytes)`);

            const points = [];
            const laps = [];

            // Check for Binary Format (BMCR)
            const isBinary = csv_data.length >= 4 && csv_data.readUInt32LE(0) === MAGIC_BMCR;

            if (isBinary) {
                console.log(`Processing binary session: ${filename}`);
                let offset = 4;
                while (offset + PACKET_SIZE <= csv_data.length) {
                    const header = csv_data.readUInt16LE(offset);
                    if (header === PACKET_HEADER) {
                        const packet = {
                            timestamp: csv_data.readUInt32LE(offset + 2),
                            lat: csv_data.readInt32LE(offset + 6) / 1e7,
                            lon: csv_data.readInt32LE(offset + 10) / 1e7,
                            speed: csv_data.readUInt16LE(offset + 14) / 10.0,
                            rpm: csv_data.readUInt16LE(offset + 16),
                            accX: csv_data.readInt16LE(offset + 18) / 100.0,
                            accY: csv_data.readInt16LE(offset + 20) / 100.0,
                            accZ: csv_data.readInt16LE(offset + 22) / 100.0,
                            sats: csv_data.readUInt8(offset + 24),
                            fix: csv_data.readUInt8(offset + 25),
                            battery: csv_data.readUInt8(offset + 26),
                            tilt: csv_data.readInt16LE(offset + 27) / 10.0
                        };

                        points.push({
                            time: packet.timestamp.toString(),
                            lat: packet.lat,
                            lng: packet.lon,
                            speed: packet.speed,
                            rpm: packet.rpm,
                            lean: packet.tilt,
                            accX: packet.accX,
                            accY: packet.accY,
                            accZ: packet.accZ
                        });
                        offset += PACKET_SIZE;
                    } else {
                        // Metadata or string in binary file?
                        // Read until next newline or next AA55
                        const sub = csv_data.subarray(offset);
                        const lineEnd = sub.indexOf(10); // \n
                        if (lineEnd !== -1) {
                            const line = sub.subarray(0, lineEnd).toString().trim();
                            if (line.startsWith('LAP,')) {
                                const parts = line.split(',');
                                laps.push({
                                    lapNumber: parseInt(parts[1]),
                                    lapTime: parseFloat(parts[2]) / 1000.0,
                                    pointIndex: points.length - 1,
                                    valid: true
                                });
                            }
                            offset += lineEnd + 1;
                        } else {
                            offset++; // Skip byte and search
                        }
                    }
                }
            } else {
                // Legacy CSV parsing
                const lines = csv_data.toString().split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line || line.startsWith('Time')) continue;

                    const parts = line.split(',');

                    if (line.startsWith('LAP,')) {
                        laps.push({
                            lapNumber: parseInt(parts[1]),
                            lapTime: parseFloat(parts[2]) / 1000.0,
                            pointIndex: points.length - 1,
                            valid: true
                        });
                        continue;
                    }

                    if (parts.length >= 4 && !isNaN(parseFloat(parts[0]))) {
                        const point: any = {
                            time: parts[0],
                            lat: parseFloat(parts[1]),
                            lng: parseFloat(parts[2]),
                            speed: parseFloat(parts[3]),
                        };
                        if (parts.length >= 6) point.alt = parseFloat(parts[5]);
                        if (parts.length >= 8) point.rpm = parseFloat(parts[7]);
                        if (parts.length >= 11) point.lean = parseFloat(parts[10]);
                        points.push(point);
                    }
                }
            }

            // Calculate stats
            const maxSpeed = points.length > 0 ? Math.max(...points.map((p: any) => p.speed)) : 0;
            const avgSpeed = points.length > 0 ? points.reduce((acc: number, p: any) => acc + p.speed, 0) / points.length : 0;
            const maxRpm = points.length > 0 ? Math.max(...points.map((p: any) => p.rpm || 0)) : 0;

            // Total distance (Simplified calc on server)
            let totalDistance = 0;
            for (let j = 1; j < points.length; j++) {
                const p1 = points[j - 1];
                const p2 = points[j];
                const d = haversine(p1.lat, p1.lng, p2.lat, p2.lng);
                if (d < 1000) totalDistance += d; // threshold to filter jumps (max 1000m between points)
            }

            const bestLap = laps.length > 0 ? Math.min(...laps.map(l => l.lapTime)) : 0;

            const isDrag = filename.toUpperCase().includes('DRAG') || body.session_type === 'DRAG';

            // Save Session metadata to MongoDB
            const newSession = await Session.create({
                userId: user._id,
                name: filename.replace('.csv', ''),
                originalFilename: filename,
                sessionType: isDrag ? 'DRAG' : 'TRACK',
                startTime: (() => {
                    if (points.length === 0) return new Date();
                    const ts = parseInt(points[0].time);
                    if (isNaN(ts) || ts < 946684800000) {
                        return new Date();
                    }
                    return new Date(ts);
                })(),
                stats: {
                    totalPoints: points.length,
                    maxSpeed,
                    avgSpeed,
                    maxRpm,
                    totalDistance: totalDistance / 1000.0,
                    lapCount: laps.length,
                    bestLap,
                    time0to60: body.time0to60 || 0,
                    time0to100: body.time0to100 || 0,
                    time100to200: body.time100to200 || 0,
                    time400m: body.time400m || 0,
                },
                laps: laps
            });

            // Bulk Insert Telemetry Points
            if (points.length > 0) {
                const pointsToInsert = points.map(p => ({
                    sessionId: newSession._id,
                    time: parseInt(p.time),
                    lat: p.lat,
                    lng: p.lng,
                    speed: p.speed,
                    rpm: p.rpm,
                    alt: p.alt,
                    lean: p.lean,
                    sats: p.sats,
                    vbat: p.vbat
                }));

                // Use bulkWrite or insertMany for efficiency
                await TelemetryPoint.insertMany(pointsToInsert, { ordered: false });
                console.log(`Bulk inserted ${pointsToInsert.length} telemetry points for session ${newSession._id}`);
            }

            console.log(`Saved ${isDrag ? 'DRAG' : 'TRACK'} session metadata ${newSession._id}`);

            // --- UPDATE ENGINE HOURS ---
            if (user.activeEngine) {
                // Calculate duration in Hours
                const durationMs = newSession.stats.totalTime || (points.length > 0 ? (new Date(points[points.length - 1].time).getTime() - new Date(points[0].time).getTime()) : 0);

                if (durationMs > 0) {
                    const durationHours = durationMs / (1000 * 60 * 60);

                    // Find and update the active engine
                    if (user.engines && user.engines.length > 0) {
                        const engineIndex = user.engines.findIndex((e: any) => e.id === user.activeEngine);
                        if (engineIndex !== -1) {
                            user.engines[engineIndex].hours = (user.engines[engineIndex].hours || 0) + durationHours;

                            // Mongoose Mixed/Array detection often needs this
                            user.markModified('engines');

                            console.log(`Updated Engine ${user.activeEngine} hours: +${durationHours.toFixed(4)}h`);
                        }
                    }
                }
            }

            await user.save();

            return NextResponse.json({
                success: true,
                message: 'Session uploaded and saved',
                id: newSession._id
            });
        }

        // Handle Telemetry Push
        if (body.type === 'telemetry') {
            const { lat, lon, lng, speed, rpm, sats, bat_v, bat_p } = body.data;

            user.liveStatus = {
                lat: lat || 0,
                lng: lng || lon || 0, // Handle both potential key names
                speed: speed || 0,
                rpm: rpm || 0,
                sats: sats || 0,
                bat_v: bat_v || 0,
                bat_p: bat_p || 0,
                is_live: true,
                lastUpdate: new Date()
            };

            // Update lastConnection on telemetry push
            user.lastConnection = new Date();

            await user.save();

            return NextResponse.json({
                success: true,
                message: 'Telemetry updated'
            });
        }

        // Handle Settings Update (e.g. sync back from device)
        if (body.settings) {
            console.log('Updating settings for user:', user.email);
            // Update fields if present
            if (body.settings.units) user.settings.units = body.settings.units;
            if (body.settings.brightness) user.settings.brightness = body.settings.brightness;

            await user.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            syncTime: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
