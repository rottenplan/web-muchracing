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
        const user = await getUserFromRequest();

        await dbConnect();

        // Find session and ensure it belongs to the user
        const session = await Session.findOne({
            _id: id,
            userId: user._id
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: session
        });

    } catch (error) {
        console.error('Session Detail API Error:', error);

        // MOCK DATA FALLBACK (For demo purposes)
        const SENTUL_POINTS = [
            { lat: -6.5355, lng: 106.8580 }, { lat: -6.5360, lng: 106.8590 },
            { lat: -6.5370, lng: 106.8595 }, { lat: -6.5380, lng: 106.8585 },
            { lat: -6.5385, lng: 106.8570 }, { lat: -6.5380, lng: 106.8550 },
            { lat: -6.5370, lng: 106.8540 }, { lat: -6.5360, lng: 106.8540 },
            { lat: -6.5350, lng: 106.8550 }, { lat: -6.5355, lng: 106.8580 }
        ];

        // Generate 3 laps of mock data
        const points = [];
        const laps = [];
        let time = Date.now();

        for (let l = 0; l < 3; l++) {
            for (let i = 0; i < 100; i++) {
                const t = i / 100;
                const idx = Math.floor(t * SENTUL_POINTS.length);
                const p1 = SENTUL_POINTS[idx];
                const p2 = SENTUL_POINTS[(idx + 1) % SENTUL_POINTS.length];
                const factor = (t * SENTUL_POINTS.length) - idx;

                points.push({
                    time: time.toString(),
                    lat: p1.lat + (p2.lat - p1.lat) * factor,
                    lng: p1.lng + (p2.lng - p1.lng) * factor,
                    speed: 60 + Math.random() * 60,
                    rpm: 6000 + Math.random() * 4000
                });
                time += 1000;
            }
            laps.push({
                lapNumber: l + 1,
                lapTime: 100 + Math.random() * 5,
                pointIndex: (l + 1) * 100 - 1,
                valid: true,
                S1: 30, S2: 40, S3: 30
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: "mock_session_id",
                name: "Simulated Session (Sentul)",
                createdAt: new Date().toISOString(),
                stats: {
                    totalDistance: 12.0,
                    maxSpeed: 145,
                    avgSpeed: 98,
                    bestLap: 102.5,
                    lapCount: 3
                },
                points: points,
                laps: laps
            }
        });
    }
}
