import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_GrxyR5YY_3TvmHe9DHcUU2iRP9PDucNir');

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

        // Send Email using Resend
        try {
            await resend.emails.send({
                from: 'Much Racing <onboarding@resend.dev>',
                to: email,
                subject: 'Much Racing - New Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
                        <h1 style="color: #dc2626; text-align: center;">MUCH RACING</h1>
                        <p>Hello ${user.name || 'Racer'},</p>
                        <p>As requested, here is your new verification code:</p>
                        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1e293b;">${verificationCode}</span>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
                        <hr style="border: 0; border-top: 1px solid #e1e1e1; margin: 25px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Jika anda tidak meminta kode baru, abaikan email ini.</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Failed to resend email:', emailErr);
        }

        // Update user
        user.verificationCode = verificationCode;
        user.codeExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log(`[RESEND NEW CODE] To: ${email} | Code: ${verificationCode}`);

        return NextResponse.json({
            success: true,
            debugCode: verificationCode,
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
