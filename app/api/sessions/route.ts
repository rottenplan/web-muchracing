export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function GET() {
    try {
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const sessions = await Session.find({ userId: user._id })
            .sort({ startTime: -1 })
            .limit(50);

        console.log(`[Sessions API] Found ${sessions.length} sessions for user ${user.email}`);

        return NextResponse.json({
            success: true,
            data: sessions
        });

    } catch (error) {
        console.error('Sessions API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
