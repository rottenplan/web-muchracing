import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const body = await request.json();
        const { email, password, name, username } = body;

        // Basic validation
        if (!email || !password || !username) {
            return NextResponse.json(
                { success: false, message: 'Email, password, and username are required' },
                { status: 400 }
            );
        }

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
            username: username.toLowerCase(),
            email,
            password: hashedPassword,
            verificationCode,
            codeExpires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Send Email using Nodemailer
        console.log(`[VERIFICATION CODE DEBUG] User: ${email} | Code: ${verificationCode}`);
        await sendVerificationEmail(email, name || 'Racer', verificationCode);

        return NextResponse.json({
            success: true,
            requiresVerification: true,
            email: email,
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
