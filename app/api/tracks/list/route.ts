import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Track from '@/models/Track';

export async function GET(request: Request) {
    try {
        await dbConnect();

        const tracks = await Track.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            tracks: tracks.map(track => ({
                id: track._id.toString(),
                name: track.name,
                lat: track.startLine.lat,
                lng: track.startLine.lng,
                lon: track.startLine.lng, // Compatibility with Firmware (expects lon)
                country: track.country,
                pathFile: "/tracks/" + track._id.toString() + ".csv", // Tell device where to look/save
                type: track.type,
                // Assuming length and location might be derived or added later, keeping structure compatible
                location: `${track.startLine.lat.toFixed(4)}, ${track.startLine.lng.toFixed(4)}`
            }))
        });

    } catch (error) {
        console.error('Error listing tracks:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
