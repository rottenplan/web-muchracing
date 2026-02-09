import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function getUserFromRequest() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        await dbConnect();

        // Find user by auth token
        const user = await User.findOne({ authToken: token });

        if (!user) {
            return null;
        }

        return user;
    } catch (error) {
        console.error('Auth Error:', error);
        return null;
    }
}
