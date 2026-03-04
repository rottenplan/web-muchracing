import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Track from '@/models/Track';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const track = await Track.findById(id);
        if (!track || !track.points || track.points.length === 0) {
            return new NextResponse('Track not found or empty', { status: 404 });
        }

        // Generate CSV: lat,lon
        const csv = track.points.map((p: any) => `${p.lat},${p.lng}`).join('\n');

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain', // Simple text for device
                'Content-Disposition': `attachment; filename="${track.name}.csv"`,
            },
        });
    } catch (e) {
        return new NextResponse('Error', { status: 500 });
    }
}
