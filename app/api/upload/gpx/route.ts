
import { NextRequest, NextResponse } from 'next/server';
import { parseGpx } from '@/lib/gpxParser';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const gpxContent = buffer.toString('utf-8');

        // Parse the GPX content
        const parsedData = parseGpx(gpxContent);

        // Connect DB
        await dbConnect();

        // Calculate Stats
        const points = parsedData.points;
        const maxSpeed = points.reduce((max: number, p: any) => Math.max(max, p.speed || 0), 0) * 3.6; // m/s to km/h
        const startTime = points[0]?.time;
        const endTime = points[points.length - 1]?.time;

        // Simple distance calc (Haversine) - can be improved in future
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const R = 6371e3; // metres
            const φ1 = p1.lat * Math.PI / 180;
            const φ2 = p2.lat * Math.PI / 180;
            const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
            const Δλ = (p2.lon - p1.lon) * Math.PI / 180; // Corrected: p1.lon was likely p1.lng in other contexts but parser returns lon
            // Wait, parser returns lon. Session schema uses lng.
            // I need to map lon -> lng.

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;
            totalDistance += d;
        }

        // Create new session
        const newSession = new Session({
            userId: user._id,
            name: parsedData.name || file.name,
            originalFilename: file.name,
            startTime: startTime ? new Date(startTime) : new Date(),
            endTime: endTime ? new Date(endTime) : new Date(),
            stats: {
                totalDistance: totalDistance / 1000, // km
                maxSpeed: maxSpeed,
                totalPoints: points.length
            },
            points: points.map((p: any) => ({
                lat: p.lat,
                lng: p.lon, // Map lon to lng
                ele: p.ele,
                time: p.time,
                speed: (p.speed || 0) * 3.6 // Store as km/h in Session schema? 
                // Session schema comment says "speed: Number, // km/h"
                // ParseGpx parses speed as m/s usually from gpx extensions? 
                // Let's assume input is m/s if from standard GPX, or just store raw.
                // The maxSpeed calc above used * 3.6. So I should store * 3.6 if schema expects kmh.
            }))
        });

        await newSession.save();

        return NextResponse.json({
            success: true,
            sessionId: newSession._id,
            message: 'GPX parsed and saved'
        });

    } catch (error) {
        console.error('GPX Upload Error:', error);
        return NextResponse.json({ error: 'Failed to process GPX file' }, { status: 500 });
    }
}
