import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendNewCodeEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        let { email } = body;

        if (!email) {
            return NextResponse.json(
                { success: false, message: 'Email is required' },
                { status: 400 }
            );
        }

        // Normalize email
        email = email.toLowerCase().trim();

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`[RESEND ERROR]: User not found for email: ${email}`);
            return NextResponse.json(
                { success: false, message: 'User not found. Please register again.' },
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
        console.log(`[RESEND CODE DEBUG] User: ${email} | Code: ${verificationCode}`);
        try {
            await sendNewCodeEmail(email, user.name || 'Racer', verificationCode);
        } catch (mailError: any) {
            console.error('[SMTP Error during Resend]:', mailError);
            return NextResponse.json(
                { success: false, message: 'Failed to send email. please check SMTP settings.', error: mailError.message },
                { status: 500 }
            );
        }

        // Update user
        user.verificationCode = verificationCode;
        user.codeExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`[RESEND NEW CODE SUCCESS] To: ${email} | Code: ${verificationCode}`);

        return NextResponse.json({
            success: true,
            message: 'A new verification code has been sent'
        });

    } catch (error: any) {
        console.error('Resend Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
