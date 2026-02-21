import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import TelemetryPoint from '@/models/TelemetryPoint';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest().catch(() => null);

        // Find session in DB if not the mock ID
        let session = null;
        if (id !== 'mock_session_id') {
            try {
                await dbConnect();
                // If we have a user, ensure it belongs to them. Otherwise, just find it (for demo/injection)
                const query = user ? { _id: id, userId: user._id } : { _id: id };
                session = await Session.findOne(query);
            } catch (e) {
                console.error('DB Find error, falling back to mock');
            }
        }

        if (session) {
            // Fetch associated telemetry points
            const points = await TelemetryPoint.find({ sessionId: session._id }).sort({ time: 1 }).lean();

            return NextResponse.json({
                success: true,
                data: {
                    ...session.toObject ? session.toObject() : session,
                    points: points
                }
            });
        }

        // --- HIGH-FIDELITY MOCK DATA GENERATOR ---
        const SENTUL_KARTING_POINTS = [
            { lat: -6.52520, lng: 106.85950 }, // Start/Finish
            { lat: -6.52450, lng: 106.85980 }, // T1 (Right)
            { lat: -6.52400, lng: 106.86050 }, // T2 (Right)
            { lat: -6.52480, lng: 106.86100 }, // T3 (Right)
            { lat: -6.52550, lng: 106.86050 }, // T4 (Straight)
            { lat: -6.52600, lng: 106.85950 }, // T5 (Left Hairpin)
            { lat: -6.52650, lng: 106.85850 }, // T6 (Left)
            { lat: -6.52600, lng: 106.85750 }, // T7 (Right)
            { lat: -6.52500, lng: 106.85850 }, // T8 (Final Straight)
            { lat: -6.52520, lng: 106.85950 }  // Back to start
        ];

        const points = [];
        const laps = [];
        let globalTime = Date.now();

        const NUM_LAPS = 20;
        const POINTS_PER_LAP = 120; // Smoother traces

        for (let l = 0; l < NUM_LAPS; l++) {
            // Realistic variation: Laps get faster as tires warm up
            const tireFactor = Math.max(0.95, 1.05 - (l * 0.005));
            const lapBaseTime = (54000 + Math.random() * 1500) * tireFactor;

            for (let i = 0; i < POINTS_PER_LAP; i++) {
                const progress = i / POINTS_PER_LAP;
                const pathIdx = Math.floor(progress * (SENTUL_KARTING_POINTS.length - 1));
                const p1 = SENTUL_KARTING_POINTS[pathIdx];
                const p2 = SENTUL_KARTING_POINTS[pathIdx + 1];
                const segmentProgress = (progress * (SENTUL_KARTING_POINTS.length - 1)) - pathIdx;

                // Physics Simulation
                const isCorner = (progress > 0.05 && progress < 0.25) || (progress > 0.45 && progress < 0.65) || (progress > 0.80 && progress < 0.95);
                const isFinalStraight = progress > 0.95 || progress < 0.05;

                // Speed logic: Straights 120-145kmh, Corners 45-65kmh
                let targetSpeed = isCorner ? 50 + Math.random() * 10 : 130 + Math.random() * 15;
                if (isFinalStraight) targetSpeed = 155 + Math.random() * 5;

                // Lean logic: Left/Right based on progress
                let targetLean = 0;
                if (progress > 0.1 && progress < 0.3) targetLean = 38; // Right corners
                if (progress > 0.5 && progress < 0.7) targetLean = -42; // Left hairpin
                if (progress > 0.8 && progress < 0.9) targetLean = 25; // Final chicane

                // DECELERATION PROFILE for AI Braking Detection
                const isBrakingZone = (progress > 0.03 && progress < 0.08) || (progress > 0.42 && progress < 0.48);
                const speed = isBrakingZone ? (140 - (progress * 50)) : targetSpeed;

                points.push({
                    time: globalTime.toString(),
                    lat: p1.lat + (p2.lat - p1.lat) * segmentProgress + (Math.random() * 0.00002), // Small GPS jitter
                    lng: p1.lng + (p2.lng - p1.lng) * segmentProgress + (Math.random() * 0.00002),
                    speed: speed,
                    rpm: isBrakingZone ? 5000 + (Math.random() * 1000) : 11000 + (Math.random() * 3000),
                    alt: 20 + Math.random(),
                    lean: targetLean + (Math.random() * 4 - 2), // Some wobble
                    gforce: isBrakingZone ? -1.2 - Math.random() : 0.8 + Math.random(),
                    water: 82 + Math.random() * 5
                });
                globalTime += 100; // 10Hz sampling (Standard)
            }

            laps.push({
                lapNumber: l + 1,
                lapTime: lapBaseTime / 1000,
                pointIndex: points.length - 1,
                valid: true,
                S1: (lapBaseTime / 3000),
                S2: (lapBaseTime / 3000),
                S3: (lapBaseTime / 3000)
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: "mock_session_id",
                name: "Sentul Pro Practice - Phase 3 Demo",
                trackName: "Sentul International Karting Circuit",
                location: "Bogor, Indonesia",
                createdAt: new Date().toISOString(),
                startTime: new Date(Date.now() - 3600000).toISOString(),
                stats: {
                    totalDistance: 1.2 * NUM_LAPS,
                    maxSpeed: Math.max(...points.map(p => p.speed)),
                    avgSpeed: points.reduce((a, b) => a + b.speed, 0) / points.length,
                    bestLap: Math.min(...laps.map(l => l.lapTime)),
                    lapCount: laps.length,
                    maxRpm: 15200
                },
                points: points,
                laps: laps
            }
        });
    } catch (error) {
        console.error('Session Detail API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Ensure session belongs to user
        const sessionToDelete = await Session.findOne({ _id: id, userId: user._id });

        if (!sessionToDelete) {
            return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
        }

        // Delete associated telemetry points
        await TelemetryPoint.deleteMany({ sessionId: id });

        // Delete the session document
        await Session.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: 'Session and telemetry data deleted' });

    } catch (error) {
        console.error('Session Delete API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
