import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: NextRequest) {
    try {
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await req.json();

        // Update allowed fields only
        const allowedFields = ['driverNumber', 'country', 'category'];
        const updates: any = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        // Update lastConnection whenever profile is updated
        updates.lastConnection = new Date();

        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                username: updatedUser.username || updatedUser.name,
                email: updatedUser.email,
                driverNumber: updatedUser.driverNumber,
                country: updatedUser.country,
                category: updatedUser.category,
                lastConnection: updatedUser.lastConnection,
            },
        });
    } catch (error) {
        console.error('Profile Update API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
        );
    }
}
