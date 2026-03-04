import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Track from '@/models/Track';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const track = await Track.findById(id);

        if (!track) {
            return NextResponse.json({ success: false, message: 'Track not found' }, { status: 404 });
        }

        // Return the document as a plain object, ensuring _id is handled if needed
        return NextResponse.json({
            success: true,
            track: {
                ...track.toObject(),
                id: track._id.toString()
            }
        });
    } catch (e) {
        console.error("Error fetching track detail:", e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
