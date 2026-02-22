export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';

export async function GET() {
    try {
        let user = await getUserFromRequest().catch(() => null);

        let sessions: any[] = [];
        if (user) {
            await dbConnect();
            sessions = await Session.find({ userId: user._id })
                .sort({ startTime: -1 })
                .limit(50);
        }

        return NextResponse.json({
            success: true,
            data: sessions
        });

    } catch (error) {
        console.error('Sessions API Error:', error);

        return NextResponse.json({ success: true, data: [] });
    }
}
