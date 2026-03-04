
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function getUserFromRequest() {
    try {
        const cookieStore = await cookies();
        const tokenToken = cookieStore.get('auth_token');
        const token = tokenToken?.value;

        if (!token) {
            return null;
        }

        await dbConnect();

        // Find user by auth token
        const user = await User.findOne({ authToken: token }).select('-password');

        if (!user) {
            console.warn(`Auth: Token provided but no user found for token hash: ${token.substring(0, 8)}...`);
            return null;
        }

        return user;
    } catch (error) {
        console.error('Auth Error:', error);
        return null;
    }
}
