
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { GpxService } from '@/lib/services/gpxService';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const gpxContent = buffer.toString('utf-8');

        // Connect DB
        await dbConnect();

        // Use the new Service
        const session = await GpxService.processGpx(user._id.toString(), gpxContent, file.name);

        return NextResponse.json({
            success: true,
            sessionId: session._id,
            message: 'GPX parsed and saved'
        });

    } catch (error: any) {
        console.error('GPX Upload Error:', error);
        return NextResponse.json({
            error: 'Failed to process GPX file',
            details: error.message
        }, { status: 500 });
    }
}
