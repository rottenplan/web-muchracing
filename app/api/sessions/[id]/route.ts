import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest();

        await dbConnect();

        // Find session and ensure it belongs to the user
        const session = await Session.findOne({
            _id: id,
            userId: user._id
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: 'Session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: session
        });

    } catch (error) {
        console.error('Session Detail API Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
