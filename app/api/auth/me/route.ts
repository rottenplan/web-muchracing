import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Return user profile data (excluding sensitive fields if any)
        return NextResponse.json({
            success: true,
            user: {
                username: user.username || user.name || 'User',
                email: user.email,
                driverNumber: user.driverNumber,
                country: user.country,
                category: user.category,
                lastConnection: user.lastConnection,
            },
        });
    } catch (error) {
        console.error('Profile API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
