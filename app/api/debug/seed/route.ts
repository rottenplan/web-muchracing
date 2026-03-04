import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Sentul International Karting Circuit Coordinates (Approximate loop)
        const centerLat = -6.535;
        const centerLng = 106.858;

        // Generate valid points simulating a lap
        const points = [];
        const totalPoints = 600; // 1 minute at 10hz (approx)
        const radius = 0.003; // degrees

        for (let i = 0; i < totalPoints; i++) {
            const angle = (i / totalPoints) * 2 * Math.PI;

            // Create a somewhat complex track shape (figure 8-ish distorted)
            const r = radius * (0.8 + 0.2 * Math.sin(3 * angle));
            const lat = centerLat + r * Math.sin(angle);
            const lng = centerLng + r * Math.cos(angle) * 1.5;

            // Simulate speed (slower in corners/curves)
            const curvature = Math.abs(Math.sin(3 * angle));
            const speed = 40 + (100 * (1 - curvature * 0.5)) + (Math.random() * 5); // 40-140 km/h

            // Simulate RPM based on speed
            const rpm = 3000 + (speed * 80) + (Math.random() * 200);

            points.push({
                time: `00:00.${i.toString().padStart(3, '0')}`, // Simplified time string
                lat,
                lng,
                speed,
                rpm: Math.round(rpm),
                alt: 200 + Math.random(),
                lean: (Math.random() - 0.5) * 45 // Lean angle
            });
        }

        // Create 2 laps
        const lapTime = 60; // seconds approx
        const bestLap = lapTime * 0.98; // Slightly faster best lap

        const laps = [
            {
                lapNumber: 1,
                lapTime: 62.1,
                pointIndex: totalPoints, // End of points
                S1: 20.5,
                S2: 21.0,
                S3: 20.6,
                valid: true,
                maxSpeed: 135.5,
                maxRpm: 12500,
                avgWater: 85,
                avgEgt: 750,
                distance: 1.2
            },
            {
                lapNumber: 2,
                lapTime: bestLap, // 58.8s
                pointIndex: totalPoints, // Reuse points for simplicity or extend
                S1: 19.5,
                S2: 20.0,
                S3: 19.3,
                valid: true,
                maxSpeed: 142.0,
                maxRpm: 12800,
                avgWater: 88,
                avgEgt: 780,
                distance: 1.2
            },
            {
                lapNumber: 3,
                lapTime: 65.4,
                pointIndex: totalPoints,
                S1: 21.5,
                S2: 22.0,
                S3: 21.9,
                valid: false, // Invalid lap
                maxSpeed: 110.0,
                maxRpm: 10000,
                avgWater: 90,
                avgEgt: 700,
                distance: 1.2
            }
        ];

        const session = await SessionModel.create({
            userId: user._id,
            deviceId: 'DUMMY-DEVICE-001',
            name: 'Latihan Sentul Sore (Dummy)',
            originalFilename: 'sentul_dummy.gpx',
            startTime: new Date(),
            endTime: new Date(Date.now() + 1000 * 60 * 15),
            stats: {
                totalDistance: 15.4,
                maxSpeed: 142.0,
                avgSpeed: 85.5,
                maxRpm: 12800,
                totalTime: 900, // 15 mins
                lapCount: 3,
                bestLap: bestLap
            },
            points: points, // In reality, points would extend for all laps
            laps: laps,
            trackName: 'Sentul International Karting Circuit', // Custom field we added
            city: 'Bogor',
            category: 'Matic 130cc Tune Up'
        });

        return NextResponse.json({ success: true, message: 'Dummy session created', id: session._id });

    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to seed' }, { status: 500 });
    }
}
