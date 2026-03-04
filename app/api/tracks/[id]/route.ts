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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const body = await request.json();
        const { name, country, type } = body;

        // Only allow updating these fields
        const updateData: Record<string, string> = {};
        if (name !== undefined) updateData.name = String(name).trim();
        if (country !== undefined) updateData.country = String(country).trim();
        if (type !== undefined) updateData.type = String(type).trim();

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 });
        }

        const updated = await Track.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        if (!updated) {
            return NextResponse.json({ success: false, message: 'Track not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            track: { ...updated.toObject(), id: updated._id.toString() }
        });
    } catch (e) {
        console.error("Error updating track:", e);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
