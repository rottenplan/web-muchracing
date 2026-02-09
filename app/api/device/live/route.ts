import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        await dbConnect();

        // 1. Basic Auth Verification
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        const user = await User.findOne({
            $or: [{ email: username }, { name: username }]
        });

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify password
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (e) { }

        if (!isMatch && user.password === password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();
            isMatch = true;
        }

        if (!isMatch) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Process Telemetry Data
        const telemetry = await request.json();

        // Update User liveStatus in MongoDB
        user.liveStatus = {
            lat: telemetry.lat || 0,
            lng: telemetry.lng || 0,
            speed: telemetry.speed || 0,
            rpm: telemetry.rpm || 0,
            sats: telemetry.sats || 0,
            bat_v: telemetry.bat_v || 0,
            bat_p: telemetry.bat_p || 0,
            is_live: true,
            lastUpdate: new Date()
        };
        await user.save();

        return NextResponse.json({ success: true, message: 'Telemetry received' });

    } catch (error) {
        console.error('Live Telemetry API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
