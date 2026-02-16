import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const dataDir = path.join(process.cwd(), 'data', 'tracks');

        if (!fs.existsSync(dataDir)) {
            return NextResponse.json({ success: true, tracks: [] });
        }

        const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));
        const tracks = [];

        for (const file of files) {
            try {
                const filePath = path.join(dataDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);

                // Format for frontend map component
                // Component expects: id, name, lat, lng, country
                tracks.push({
                    id: file.replace('.json', ''), // Use filename as ID
                    name: data.name,
                    lat: data.startLine.lat,
                    lng: data.startLine.lng, // Change from 'lon' to 'lng' to fix map crash
                    country: data.country || 'Unknown',
                    length: data.length,
                    location: data.location
                });
            } catch (e) {
                console.error(`Error reading track file ${file}:`, e);
            }
        }

        return NextResponse.json({
            success: true,
            tracks: tracks
        });

    } catch (error) {
        console.error('Error listing tracks:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
