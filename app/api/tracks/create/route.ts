import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Track from '@/models/Track';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { trackName, startLine, points, country, trackType } = body;

        if (!trackName || !startLine) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newTrack = await Track.create({
            name: trackName,
            country: country || 'Unknown',
            type: trackType || 'Circuit',
            startLine: startLine,
            points: points || []
        });

        return NextResponse.json({
            success: true,
            message: 'Track saved successfully',
            track: newTrack
        });

    } catch (error) {
        console.error('Error saving track:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
