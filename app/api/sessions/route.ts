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

        // Always prepend mock data for Phase 3 Demo
        const demoSessions = [
            {
                _id: "mock_session_id",
                name: "Sentul Pro Practice - Phase 3 Demo",
                createdAt: new Date().toISOString(),
                trackName: "Sentul International Karting Circuit",
                stats: {
                    totalDistance: 24.0,
                    maxSpeed: 155.2,
                    avgSpeed: 78.5,
                    bestLap: 52.8,
                    lapCount: 20
                },
                startTime: new Date(Date.now() - 3600000).toISOString(),
                endTime: new Date().toISOString()
            },
            {
                _id: "mock_drag_id",
                name: "0-100m Performance Test",
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                trackName: "Sentul Drag Strip",
                sessionType: "DRAG",
                stats: {
                    totalDistance: 0.1,
                    maxSpeed: 102.3,
                    bestLap: 6.42,
                    lapCount: 1
                },
                startTime: new Date(Date.now() - 86400000).toISOString(),
                endTime: new Date(Date.now() - 86400000 + 10000).toISOString()
            }
        ];

        return NextResponse.json({
            success: true,
            data: [...demoSessions, ...sessions]
        });

    } catch (error) {
        console.error('Sessions API Error:', error);

        // MOCK DATA FALLBACK (For demo purposes)
        return NextResponse.json({
            success: true,
            data: [
                {
                    _id: "mock_session_id",
                    name: "Sentul Pro Practice - Phase 3 Demo",
                    createdAt: new Date().toISOString(),
                    trackName: "Sentul International Karting Circuit",
                    stats: {
                        totalDistance: 24.0,
                        maxSpeed: 155.2,
                        avgSpeed: 78.5,
                        bestLap: 52.8,
                        lapCount: 20
                    },
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    endTime: new Date().toISOString()
                },
                {
                    _id: "mock_drag_id",
                    name: "0-100m Performance Test",
                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                    trackName: "Sentul Drag Strip",
                    sessionType: "DRAG",
                    stats: {
                        totalDistance: 0.1,
                        maxSpeed: 102.3,
                        bestLap: 6.42,
                        lapCount: 1
                    },
                    startTime: new Date(Date.now() - 86400000).toISOString(),
                    endTime: new Date(Date.now() - 86400000 + 10000).toISOString()
                }
            ]
        });
    }
}
