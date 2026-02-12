import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

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
            return NextResponse.json({
                success: true,
                data: session
            });
        }

        // --- MOCK DATA FALLBACK ---
        console.log('Returning mock session data for ID:', id);
        const SENTUL_KARTING_POINTS = [
            { lat: -6.5252, lng: 106.8595 }, // Start/Finish
            { lat: -6.5245, lng: 106.8598 }, // T1
            { lat: -6.5240, lng: 106.8605 }, // T2
            { lat: -6.5248, lng: 106.8610 }, // T3
            { lat: -6.5255, lng: 106.8605 }, // T4
            { lat: -6.5260, lng: 106.8595 }, // T5
            { lat: -6.5265, lng: 106.8585 }, // T6
            { lat: -6.5260, lng: 106.8575 }, // T7
            { lat: -6.5250, lng: 106.8585 }, // T8
            { lat: -6.5252, lng: 106.8595 }  // Back to start
        ];

        const points = [];
        const laps = [];
        let time = Date.now();

        const NUM_LAPS = 12;
        const POINTS_PER_LAP = 100;

        for (let l = 0; l < NUM_LAPS; l++) {
            const lapBaseTime = 55000 + Math.random() * 2000; // ~55s to 57s lap times

            for (let i = 0; i < POINTS_PER_LAP; i++) {
                const t = i / POINTS_PER_LAP;
                const idx = Math.floor(t * SENTUL_KARTING_POINTS.length);
                const p1 = SENTUL_KARTING_POINTS[idx % SENTUL_KARTING_POINTS.length];
                const p2 = SENTUL_KARTING_POINTS[(idx + 1) % SENTUL_KARTING_POINTS.length];
                const factor = (t * SENTUL_KARTING_POINTS.length) - idx;

                const isCorner = (i > 5 && i < 15) || (i > 30 && i < 45) || (i > 60 && i < 75);
                const speed = isCorner ? 45 + Math.random() * 15 : 85 + Math.random() * 25;
                const rpm = isCorner ? 7000 + Math.random() * 2000 : 12000 + Math.random() * 2000;

                points.push({
                    time: time.toString(),
                    lat: p1.lat + (p2.lat - p1.lat) * factor,
                    lng: p1.lng + (p2.lng - p1.lng) * factor,
                    speed: speed,
                    rpm: Math.floor(rpm),
                    alt: 20,
                    lean: isCorner ? (Math.random() > 0.5 ? 25 : -25) : 0
                });
                time += 500; // 2Hz sample rate for mock
            }
            laps.push({
                lapNumber: l + 1,
                lapTime: lapBaseTime / 1000,
                pointIndex: points.length - 1,
                valid: true,
                S1: (lapBaseTime / 3000), S2: (lapBaseTime / 3000), S3: (lapBaseTime / 3000)
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: "mock_session_id",
                name: "Sentul Karting Practice - 12 Laps",
                trackName: "Sentul International Karting Circuit",
                location: "Bogor, Indonesia",
                createdAt: new Date().toISOString(),
                startTime: new Date(Date.now() - (NUM_LAPS * 60000)).toISOString(),
                stats: {
                    totalDistance: 1.2 * NUM_LAPS,
                    maxSpeed: Math.max(...points.map(p => p.speed)),
                    avgSpeed: points.reduce((a, b) => a + b.speed, 0) / points.length,
                    bestLap: Math.min(...laps.map(l => l.lapTime)),
                    lapCount: laps.length,
                    maxRpm: 14500
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
