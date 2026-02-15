import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';
import bcrypt from 'bcryptjs';

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
        const [username, password] = credentials.split(':'); // username here is email

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid credentials' },
                { status: 401 }
            );
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: username }, { name: username }]
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

        // Return user's device settings
        return NextResponse.json({
            success: true,
            data: {
                settings: user.settings,
                tracks: user.tracks,
                engines: user.engines,
                activeEngine: user.activeEngine
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
            $or: [{ email: username }, { name: username }]
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

        // Handle Session Upload
        if (body.type === 'upload_session') {
            const { filename, csv_data } = body;
            console.log(`Receiving session: ${filename} for user ${user.email}`);

            const lines = csv_data.split('\n');
            const points = [];
            const laps = [];

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line || line.startsWith('Time')) continue;

                const parts = line.split(',');

                if (line.startsWith('LAP,')) {
                    // Format: LAP,Count,Time_ms
                    laps.push({
                        lapNumber: parseInt(parts[1]),
                        lapTime: parseFloat(parts[2]) / 1000.0,
                        pointIndex: points.length - 1, // Store the last index
                        valid: true
                    });
                    continue;
                }

                if (parts.length >= 5 && !isNaN(parseFloat(parts[0]))) {
                    points.push({
                        time: parts[0],
                        lat: parseFloat(parts[1]),
                        lng: parseFloat(parts[2]),
                        speed: parseFloat(parts[3]),
                        rpm: parseFloat(parts[4])
                    });
                }
            }

            // Calculate stats
            const maxSpeed = points.length > 0 ? Math.max(...points.map((p: any) => p.speed)) : 0;
            const avgSpeed = points.length > 0 ? points.reduce((acc: number, p: any) => acc + p.speed, 0) / points.length : 0;
            const maxRpm = points.length > 0 ? Math.max(...points.map((p: any) => p.rpm)) : 0;

            // Total distance (Simplified calc on server)
            let totalDistance = 0;
            for (let j = 1; j < points.length; j++) {
                const p1 = points[j - 1];
                const p2 = points[j];
                const d = haversine(p1.lat, p1.lng, p2.lat, p2.lng);
                if (d < 1) totalDistance += d; // threshold to filter jumps
            }

            const bestLap = laps.length > 0 ? Math.min(...laps.map(l => l.lapTime)) : 0;

            const isDrag = filename.toUpperCase().includes('DRAG') || body.session_type === 'DRAG';

            // Save to MongoDB
            const newSession = await Session.create({
                userId: user._id,
                name: filename.replace('.csv', ''),
                originalFilename: filename,
                sessionType: isDrag ? 'DRAG' : 'TRACK',
                startTime: (() => {
                    if (points.length === 0) return new Date();
                    const ts = parseInt(points[0].time);
                    // Check if timestamp is before Jan 1 2000 (likely millis or 1970 bug)
                    if (isNaN(ts) || ts < 946684800000) {
                        console.warn(`[Sync] Fixed invalid/1970 timestamp: ${ts} -> using current time`);
                        return new Date();
                    }
                    return new Date(ts);
                })(),
                stats: {
                    totalPoints: points.length,
                    maxSpeed,
                    avgSpeed,
                    maxRpm,
                    totalDistance: totalDistance / 1000.0, // to KM
                    lapCount: laps.length,
                    bestLap,
                    // Drag splits if provided in body or calculated
                    time0to60: body.time0to60 || 0,
                    time0to100: body.time0to100 || 0,
                    time100to200: body.time100to200 || 0,
                    time400m: body.time400m || 0,
                },
                points: points,
                laps: laps
            });

            console.log(`Saved ${isDrag ? 'DRAG' : 'TRACK'} session ${newSession._id} with ${points.length} points`);

            return NextResponse.json({
                success: true,
                message: 'Session uploaded and saved',
                id: newSession._id
            });
        }

        // Handle Telemetry Push
        if (body.type === 'telemetry') {
            const { lat, lon, speed, rpm, sats, bat_v, bat_p } = body.data;

            user.liveStatus = {
                lat,
                lng: lon, // Map lon to lng
                speed,
                rpm,
                sats,
                bat_v,
                bat_p,
                is_live: true,
                lastUpdate: new Date()
            };

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
            // ... map other settings as needed

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
