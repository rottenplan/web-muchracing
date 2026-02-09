import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return NextResponse.json(
                { success: false, message: 'Email and code are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 400 }
            );
        }

        // Check if user is already verified
        if (user.isVerified) {
            // Generate new token for auto-login
            const token = randomUUID();
            user.authToken = token;
            await user.save();

            return NextResponse.json({
                success: true,
                token: token,
                user: { id: user._id, name: user.name, email: user.email }
            });
        }

        // Validate code
        if (user.verificationCode !== code) {
            return NextResponse.json(
                { success: false, message: 'Invalid verification code' },
                { status: 400 }
            );
        }

        // Check expiration
        if (Date.now() > user.codeExpires) {
            return NextResponse.json(
                { success: false, message: 'Verification code expired' },
                { status: 400 }
            );
        }

        // Success: Mark as verified and clear code
        user.isVerified = true;
        user.verificationCode = undefined;
        user.codeExpires = undefined;

        // Generate auth token
        const token = randomUUID();
        user.authToken = token;

        await user.save();

        return NextResponse.json({
            success: true,
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Verification Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
