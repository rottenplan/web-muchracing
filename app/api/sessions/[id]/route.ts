import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';
import TelemetryPoint from '@/models/TelemetryPoint';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest().catch(() => null);

        // Find session in DB if not the mock ID
        let session = null;
        if (id !== 'mock_session_id') {
            try {
                await dbConnect();
                // If we have a user, ensure it belongs to them. Otherwise, just find it (for demo/injection)
                const query = user ? { _id: id, userId: user._id } : { _id: id };
                session = await Session.findOne(query);
            } catch (e) {
                console.error('DB Find error, falling back to mock');
            }
        }

        if (session) {
            // Fetch associated telemetry points
            const points = await TelemetryPoint.find({ sessionId: session._id }).sort({ time: 1 }).lean();

            return NextResponse.json({
                success: true,
                data: {
                    ...session.toObject ? session.toObject() : session,
                    points: points
                }
            });
        }

        return NextResponse.json(
            { success: false, message: 'Session not found' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Session Detail API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Ensure session belongs to user
        const sessionToDelete = await Session.findOne({ _id: id, userId: user._id });

        if (!sessionToDelete) {
            return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
        }

        // Delete associated telemetry points
        await TelemetryPoint.deleteMany({ sessionId: id });

        // Delete the session document
        await Session.deleteOne({ _id: id });

        return NextResponse.json({ success: true, message: 'Session and telemetry data deleted' });

    } catch (error) {
        console.error('Session Delete API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
