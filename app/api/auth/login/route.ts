import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: email },
        { name: email } // 'email' variable here holds the input identifier
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Verify password
    let isMatch = false;

    // 1. Try bcrypt comparison
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      // If error (e.g. password is not a hash), isMatch stays false
    }

    // 2. Migration: If bcrypt fails, try plain text comparison
    if (!isMatch && user.password === password) {
      console.log(`Migrating password for user: ${email}`);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Check verification status
    if (!user.isVerified) {
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email address'
      });
    }

    // Generate and save auth token
    const authToken = randomUUID();
    user.authToken = authToken;
    await user.save();

    // Successful login
    return NextResponse.json({
      success: true,
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
