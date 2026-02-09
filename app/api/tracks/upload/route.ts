import { NextRequest, NextResponse } from 'next/server';
import { parseGpx } from '@/lib/gpxParser';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filename, gpx_data } = body;

        if (!gpx_data) {
            return NextResponse.json({ error: 'No GPX data provided' }, { status: 400 });
        }

        console.log(`Sync: Processing GPX upload from device: ${filename}`);

        // Parse the GPX content
        const parsedData = parseGpx(gpx_data);

        // Create 'data/tracks' directory (Device tracks are stored in tracks)
        const tracksDir = path.join(process.cwd(), 'data', 'tracks');
        if (!fs.existsSync(tracksDir)) {
            fs.mkdirSync(tracksDir, { recursive: true });
        }

        // Create a new track object
        const trackId = Date.now().toString();
        const newTrack = {
            id: trackId,
            name: parsedData.name || filename.replace('.gpx', '').replace(/_/g, ' '),
            originalFilename: filename,
            type: 'Circuit',
            country: 'Unknown',
            startLine: {
                lat: parsedData.points[0]?.lat || 0,
                lng: parsedData.points[0]?.lon || 0,
                bearing: 0,
                width: 20
            },
            points: parsedData.points,
            createdAt: new Date().toISOString()
        };

        // Save to JSON file
        const filePath = path.join(tracksDir, `${trackId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(newTrack, null, 2));

        console.log(`Sync: Saved track to ${filePath}`);

        return NextResponse.json({
            success: true,
            message: 'Track GPX parsed and saved correctly',
            id: trackId
        });

    } catch (error) {
        console.error('Sync Track GPX Upload Error:', error);
        return NextResponse.json({ error: 'Failed to process track GPX' }, { status: 500 });
    }
}
