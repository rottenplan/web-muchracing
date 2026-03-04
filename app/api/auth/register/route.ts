import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        let { email, password, name, username } = body;

        // Basic validation
        if (!email || !password || !username) {
            return NextResponse.json(
                { success: false, message: 'Email, password, and username are required' },
                { status: 400 }
            );
        }

        // Normalize inputs
        email = email.toLowerCase().trim();
        username = username.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
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
        await User.create({
            name: name || 'Racer',
            username,
            email,
            password: hashedPassword,
            verificationCode,
            codeExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Send Email using Nodemailer
        try {
            console.log(`[VERIFICATION CODE DEBUG] User: ${email} | Code: ${verificationCode}`);
            await sendVerificationEmail(email, name || 'Racer', verificationCode);
        } catch (mailError: any) {
            console.error('[Mail Error during registration]:', mailError);
            // We don't return error here because the user is already created in DB.
            // But we log it clearly.
        }

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            email,
            message: 'Registration successful. Please check your email for the verification code.'
        });

    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
