import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Session from '@/models/Session';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(request: Request) {
    try {
        await dbConnect();

        // 1. Authenticate user from request (uses cookies helper internally)
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = user._id;

        // 2. Cascade Delete: Remove all sessions belonging to the user
        await Session.deleteMany({ userId });

        // 3. Delete the User document
        await User.findByIdAndDelete(userId);

        // 4. Return success and instruct client to clear cookies
        const response = NextResponse.json({
            success: true,
            message: 'Account and all associated data have been permanently removed'
        });

        // Set the auth_token cookie to expire immediately
        response.cookies.set('auth_token', '', {
            path: '/',
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return response;

    } catch (error) {
        console.error('Account Removal Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
