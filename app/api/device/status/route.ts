import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch fresh user data to get liveStatus
        const userData = await User.findById(user._id).select('liveStatus').lean();

        if (!userData || !userData.liveStatus) {
            return NextResponse.json({
                last_sync: null,
                data: { is_live: false }
            });
        }

        const status = userData.liveStatus;

        // Check if live data is stale (over 10 seconds old)
        if (status.is_live && status.lastUpdate) {
            const now = Date.now();
            const diff = now - new Date(status.lastUpdate).getTime();
            if (diff > 10000) { // 10 seconds
                // In a real app, we might want to update the DB here to set is_live = false
                // but for a GET request, we can just return the modified object
                status.is_live = false;
                status.speed = 0;
                status.rpm = 0;
            }
        }

        return NextResponse.json({
            success: true,
            user: user.email,
            last_sync: status.lastUpdate,
            data: {
                ...status,
                timestamp: status.lastUpdate ? new Date(status.lastUpdate).getTime() : Date.now()
            }
        });

    } catch (error) {
        console.error('Status API Error:', error);
        return NextResponse.json({ error: 'Failed to read status' }, { status: 500 });
    }
}
