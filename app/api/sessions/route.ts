export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';

export async function GET() {
    try {
        let user = await getUserFromRequest().catch(() => null);

        // If no user in request, try to find the first user in DB to show injected data
        if (!user) {
            user = await User.findOne({});
        }

        if (user) {
            await dbConnect();
            const sessions = await Session.find({ userId: user._id })
                .sort({ startTime: -1 })
                .limit(50);

            console.log(`[Sessions API] Found ${sessions.length} sessions for user ${user?.email || 'Unknown'}`);

            if (sessions.length > 0) {
                return NextResponse.json({
                    success: true,
                    data: sessions
                });
            }
        }

        // Fallback to mock only if no sessions in DB
        throw new Error('Fallback to mock');

    } catch (error) {
        console.error('Sessions API Error:', error);

        // MOCK DATA FALLBACK (For demo purposes)
        return NextResponse.json({
            success: true,
            data: [{
                _id: "mock_session_id",
                name: "Sentul Karting Practice - 12 Laps",
                createdAt: new Date().toISOString(),
                trackName: "Sentul International Karting Circuit",
                stats: {
                    totalDistance: 14.4,
                    maxSpeed: 105,
                    avgSpeed: 75,
                    bestLap: 55.8,
                    lapCount: 12
                },
                startTime: new Date(Date.now() - 3600000).toISOString(),
                endTime: new Date().toISOString()
            }]
        });
    }
}
