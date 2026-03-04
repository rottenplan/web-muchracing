import { NextRequest, NextResponse } from 'next/server';
import { parseGpx } from '@/lib/gpxParser';
import fs from 'fs';
import path from 'path';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Track from '@/models/Track';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // --- 1. Basic Auth ---
        const authHeader = req.headers.get('authorization');
        let user = null;

        if (authHeader && authHeader.startsWith('Basic ')) {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
            const [username, password] = credentials.split(':');

            if (username && password) {
                user = await User.findOne({
                    $or: [
                        { email: username.toLowerCase() },
                        { username: username.toLowerCase() }
                    ]
                });

                if (user) {
                    let isMatch = false;
                    try {
                        isMatch = await bcrypt.compare(password, user.password);
                    } catch (e) { }

                    if (!isMatch && user.password === password) {
                        // Migration logic (if needed, consistent with sync API)
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(password, salt);
                        await user.save();
                        isMatch = true;
                    }

                    if (!isMatch) user = null;
                }
            }
        }

        // --- 2. Process Upload ---
        const body = await req.json();
        const { filename, gpx_data } = body;

        if (!gpx_data) {
            return NextResponse.json({ error: 'No GPX data provided' }, { status: 400 });
        }

        console.log(`Sync: Processing GPX upload from device: ${filename} (User: ${user ? user.username : 'Unknown'})`);

        // Parse the GPX content
        const parsedData = parseGpx(gpx_data);

        // --- 3. Save to MongoDB (Track Model) ---
        // Check if track name already exists for this user to avoid duplicates?
        // For now, we'll append timestamp if needed or just create new.

        const newTrack = await Track.create({
            name: parsedData.name || filename.replace('.gpx', '').replace(/_/g, ' '),
            country: 'My Own Tracks', // Or 'Unknown', but 'My Own Tracks' makes it clear via API list logic
            type: 'Circuit',
            startLine: {
                lat: parsedData.points[0]?.lat || 0,
                lng: parsedData.points[0]?.lon || 0,
                bearing: 0,
                width: 20
            },
            points: parsedData.points.map(p => ({
                lat: p.lat,
                lng: p.lon // GPX parser uses lon
            })),
            createdBy: user ? user._id : undefined
        });

        // --- 4. Save JSON file (Legacy/Backup - Optional but good for download consistency) ---
        // The firmware might expect to download it back as [id].csv, but the new API handles conversion.
        // We can skip saving legacy JSON if we trust Mongo.
        // But let's keep the file system clean and rely on DB.

        console.log(`Sync: Created Track ${newTrack._id} in DB`);

        return NextResponse.json({
            success: true,
            message: 'Track saved to database',
            id: newTrack._id.toString()
        });

    } catch (error) {
        console.error('Sync Track GPX Upload Error:', error);
        return NextResponse.json({
            error: 'Failed to process track GPX',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
