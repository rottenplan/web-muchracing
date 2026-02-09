import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY || 're_GrxyR5YY_3TvmHe9DHcUU2iRP9PDucNir');

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password, name } = body;

        // Basic validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { name }]
        });

        if (existingUser) {
            const isEmailTaken = existingUser.email === email;
            return NextResponse.json(
                {
                    success: false,
                    message: isEmailTaken ? 'Email already exists' : 'Username already exists'
                },
                { status: 400 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Create new user
        const newUser = await User.create({
            name: name || 'Racer',
            email,
            password: hashedPassword,
            verificationCode,
            codeExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Send Email using Resend
        try {
            await resend.emails.send({
                from: 'Much Racing <onboarding@resend.dev>',
                to: email,
                subject: 'Much Racing - Verify your account',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
                        <h1 style="color: #dc2626; text-align: center;">MUCH RACING</h1>
                        <p>Hello ${name || 'Racer'},</p>
                        <p>Welcome to the Much Racing team! use the code below to verify your account:</p>
                        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1e293b;">${verificationCode}</span>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
                    </div>
                `
            });
        } catch (emailErr) {
            console.error('Failed to send email:', emailErr);
            // Continue even if email fails - user can resend later
        }

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            email: email,
            debugCode: verificationCode,
            message: 'Verification code sent to your email'
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
