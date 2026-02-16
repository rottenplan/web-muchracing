import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

        // Send Email using Brevo REST API
        try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.BREVO_API_KEY || '',
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    sender: { name: 'Much Racing', email: 'muchdas@muchracing.com' },
                    to: [{ email: email, name: name || 'Racer' }],
                    subject: 'Much Racing - Verify your account',
                    htmlContent: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px;">
                            <h1 style="color: #dc2626; text-align: center;">MUCH RACING</h1>
                            <p>Hello ${name || 'Racer'},</p>
                            <p>Welcome to the Much Racing team! Use the code below to verify your account:</p>
                            <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0;">
                                <span style="font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #1e293b;">${verificationCode}</span>
                            </div>
                            <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
                        </div>
                    `
                })
            });
        } catch (emailErr) {
            console.error('Failed to send email via Brevo:', emailErr);
        }


    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
