import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendNewCodeEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 400 }
            );
        }

        if (user.isVerified) {
            return NextResponse.json(
                { success: false, message: 'Account is already verified' },
                { status: 400 }
            );
        }

        // Generate new 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Send Email using Nodemailer
        await sendNewCodeEmail(email, user.name || 'Racer', verificationCode);

        // Update user
        user.verificationCode = verificationCode;
        user.codeExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`[RESEND NEW CODE] To: ${email} | Code: ${verificationCode}`);

        return NextResponse.json({
            success: true,
            message: 'A new verification code has been sent'
        });

    } catch (error) {
        console.error('Resend Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
