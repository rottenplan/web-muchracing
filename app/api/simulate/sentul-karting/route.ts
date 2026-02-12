import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';

// Sentul International Karting Circuit approximation
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

export async function GET() {
    try {
        await dbConnect();

        const user = await User.findOne({});
        if (!user) {
            return NextResponse.json({ error: 'No user found' }, { status: 404 });
        }

        const sessionPoints = [];
        const laps = [];
        const startTime = Date.now();
        let currentTime = startTime;
        let totalDistance = 0;

        const NUM_LAPS = 12;
        const POINTS_PER_LAP = 80;

        function getPointAt(t: number) {
            const index = Math.floor(t * (SENTUL_KARTING_POINTS.length));
            const p1 = SENTUL_KARTING_POINTS[index % SENTUL_KARTING_POINTS.length];
            const p2 = SENTUL_KARTING_POINTS[(index + 1) % SENTUL_KARTING_POINTS.length];
            const factor = (t * SENTUL_KARTING_POINTS.length) - index;

            return {
                lat: p1.lat + (p2.lat - p1.lat) * factor,
                lng: p1.lng + (p2.lng - p1.lng) * factor
            };
        }

        for (let l = 0; l < NUM_LAPS; l++) {
            const lapBaseTime = 55000 + Math.random() * 2000; // ~55s to 57s lap times (typical for Karting)

            for (let i = 0; i < POINTS_PER_LAP; i++) {
                const t = i / POINTS_PER_LAP;
                const pos = getPointAt(t);

                // Simulate speed for karting (km/h)
                const isCorner = (i > 5 && i < 15) || (i > 30 && i < 45) || (i > 60 && i < 75);
                const speed = isCorner ? 45 + Math.random() * 15 : 85 + Math.random() * 25;
                const rpm = isCorner ? 7000 + Math.random() * 2000 : 12000 + Math.random() * 2000;

                sessionPoints.push({
                    time: currentTime.toString(),
                    lat: pos.lat,
                    lng: pos.lng,
                    speed: speed,
                    rpm: Math.floor(rpm),
                    alt: 20,
                    lean: isCorner ? (Math.random() > 0.5 ? 25 : -25) : 0
                });

                const dt = (lapBaseTime / POINTS_PER_LAP);
                currentTime += dt;

                if (i > 0) {
                    totalDistance += (speed * (dt / 1000) / 3.6);
                }
            }

            laps.push({
                lapNumber: l + 1,
                lapTime: lapBaseTime / 1000,
                pointIndex: sessionPoints.length - 1,
                valid: true,
                S1: (lapBaseTime / 3) / 1000,
                S2: (lapBaseTime / 3) / 1000,
                S3: (lapBaseTime / 3) / 1000
            });
        }

        const stats = {
            totalPoints: sessionPoints.length,
            maxSpeed: Math.max(...sessionPoints.map(p => p.speed)),
            avgSpeed: sessionPoints.reduce((a, b) => a + b.speed, 0) / sessionPoints.length,
            maxRpm: Math.max(...sessionPoints.map(p => p.rpm)),
            totalDistance: totalDistance / 1000,
            lapCount: laps.length,
            bestLap: Math.min(...laps.map(l => l.lapTime))
        };

        const session = await Session.create({
            userId: user._id,
            name: `Sentul Karting Practice - 12 Laps`,
            originalFilename: 'sentul_karting_12laps.csv',
            startTime: new Date(startTime),
            endTime: new Date(currentTime),
            stats: stats,
            points: sessionPoints,
            laps: laps
        });

        return NextResponse.json({
            success: true,
            message: 'Sentul Karting Simulation data injected successfully',
            sessionId: session._id,
            stats
        });

    } catch (error) {
        console.error('Sentul Sim Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
