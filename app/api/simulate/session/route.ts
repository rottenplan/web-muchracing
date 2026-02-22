
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';
import TelemetryPoint from '@/models/TelemetryPoint';

// Simple helper to generate points around a loop
// Sentul International Circuit approximation
const SENTUL_POINTS = [
    { lat: -6.5355, lng: 106.8580 }, // Start/Finish
    { lat: -6.5360, lng: 106.8590 }, // T1
    { lat: -6.5370, lng: 106.8595 },
    { lat: -6.5380, lng: 106.8585 },
    { lat: -6.5385, lng: 106.8570 },
    { lat: -6.5380, lng: 106.8550 },
    { lat: -6.5370, lng: 106.8540 }, // Back straight start
    { lat: -6.5360, lng: 106.8540 },
    { lat: -6.5350, lng: 106.8550 },
    { lat: -6.5355, lng: 106.8580 }  // Back to start
];

export async function GET() {
    try {
        await dbConnect();

        const user = await User.findOne({});
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        // Cleanup: delete previous sessions and their telemetry points
        const oldSessions = await Session.find({ userId: user._id }).select('_id').lean();
        if (oldSessions.length > 0) {
            const oldIds = oldSessions.map(s => s._id);
            await TelemetryPoint.deleteMany({ sessionId: { $in: oldIds } });
            await Session.deleteMany({ _id: { $in: oldIds } });
            console.log(`Deleted ${oldIds.length} old sessions for user: ${user.email}`);
        }

        console.log(`Generating session for user: ${user.email}`);

        const sessionPoints = [];
        const laps = [];
        const startTime = Date.now();
        let currentTime = startTime;
        let totalDistance = 0;

        const NUM_LAPS = 5;
        const POINTS_PER_LAP = 100; // Interpolated resolution

        // Interpolate points
        function getPointAt(t: number) {
            const index = Math.floor(t * (SENTUL_POINTS.length));
            const p1 = SENTUL_POINTS[index % SENTUL_POINTS.length];
            const p2 = SENTUL_POINTS[(index + 1) % SENTUL_POINTS.length];
            const factor = (t * SENTUL_POINTS.length) - index;

            return {
                lat: p1.lat + (p2.lat - p1.lat) * factor,
                lng: p1.lng + (p2.lng - p1.lng) * factor
            };
        }

        for (let l = 0; l < NUM_LAPS; l++) {
            const lapStartIndex = sessionPoints.length;
            const lapBaseTime = 90000 + Math.random() * 5000; // ~1:30 to 1:35 lap times

            for (let i = 0; i < POINTS_PER_LAP; i++) {
                const t = i / POINTS_PER_LAP;
                const pos = getPointAt(t);

                // Simulate speed based on "corners" (simplified)
                const isCorner = (i > 10 && i < 30) || (i > 50 && i < 70);
                const speed = isCorner ? 60 + Math.random() * 20 : 120 + Math.random() * 40;
                const rpm = isCorner ? 6000 + Math.random() * 2000 : 10000 + Math.random() * 2000;

                sessionPoints.push({
                    time: currentTime.toString(),
                    lat: pos.lat,
                    lng: pos.lng,
                    speed: speed,
                    rpm: Math.floor(rpm),
                    alt: 200,
                    lean: 0
                });

                // Advance time based on speed (simplified)
                const dt = (lapBaseTime / POINTS_PER_LAP);
                currentTime += dt;

                if (i > 0) {
                    // rough distance accum
                    totalDistance += (speed * (dt / 1000) / 3.6);
                }
            }

            // Record Lap
            laps.push({
                lapNumber: l + 1,
                lapTime: lapBaseTime / 1000,
                pointIndex: sessionPoints.length - 1,
                valid: true,
                S1: lapBaseTime * 0.3 / 1000,
                S2: lapBaseTime * 0.4 / 1000,
                S3: lapBaseTime * 0.3 / 1000
            });
        }

        const stats = {
            totalPoints: sessionPoints.length,
            maxSpeed: Math.max(...sessionPoints.map(p => p.speed)),
            avgSpeed: sessionPoints.reduce((a, b) => a + b.speed, 0) / sessionPoints.length,
            maxRpm: Math.max(...sessionPoints.map(p => p.rpm)),
            totalDistance: totalDistance / 1000, // km
            lapCount: laps.length,
            bestLap: Math.min(...laps.map(l => l.lapTime))
        };

        const session = await Session.create({
            userId: user._id,
            name: `Simulated Session Sentul ${new Date().toLocaleTimeString()}`,
            originalFilename: 'simulated_data.csv',
            startTime: new Date(startTime),
            endTime: new Date(currentTime),
            stats: stats,
            points: sessionPoints,
            laps: laps
        });

        return NextResponse.json({
            success: true,
            message: 'Session created',
            sessionId: session._id,
            stats
        });

    } catch (error) {
        console.error('Session Sim Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
