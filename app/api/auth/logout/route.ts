import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (token) {
            await dbConnect();
            // Optional: Invalidate token in DB
            await User.findOneAndUpdate({ authToken: token }, { $unset: { authToken: 1 } });
        }

        // Clear cookie
        // Note: We can't strictly clear a client-set cookie from server if parameters differ, 
        // but we can try to overwrite it. 
        // Best practice is to have client handle cookie removal if client set it, 
        // or have server set it as httpOnly.
        // We will return success and let client also cleanup.

        return NextResponse.json({ success: true, message: 'Logged out' });

    } catch (error) {
        console.error('Logout Error:', error);
        return NextResponse.json({ success: false, message: 'Logout failed' }, { status: 500 });
    }
}
