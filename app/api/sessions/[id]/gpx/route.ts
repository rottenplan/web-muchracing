import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Session from '@/models/Session';

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    try {
        // 1. Authenticate
        const user = await getUserFromRequest();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 2. Fetch Session
        const session = await Session.findOne({ _id: params.id, userId: user._id });

        if (!session) {
            return NextResponse.json({ success: false, message: 'Session not found' }, { status: 404 });
        }

        // 3. Build GPX XML Manually
        const creator = 'MuchRacing';
        const time = session.startTime ? new Date(session.startTime).toISOString() : new Date().toISOString();
        const name = session.name || 'Racing Session';

        let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="${creator}" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <metadata>
    <name>${name}</name>
    <time>${time}</time>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
`;

        if (session.points && Array.isArray(session.points)) {
            for (const pt of session.points) {
                // Essential fields
                gpx += `      <trkpt lat="${pt.lat}" lon="${pt.lng}">\n`;

                // Elevation
                if (pt.ele !== undefined && pt.ele !== null) {
                    gpx += `        <ele>${pt.ele}</ele>\n`;
                }

                // Time
                if (pt.time) {
                    // Ensure time is ISO string
                    try {
                        const ptTime = new Date(pt.time).toISOString();
                        gpx += `        <time>${ptTime}</time>\n`;
                    } catch (e) { }
                }

                // Speed Extension (convert km/h to m/s for standard compliance if needed, but many apps read extension directly)
                // Strava/Garmin use m/s in extensions usually.
                // session.speed is likely km/h based on previous code.
                if (pt.speed !== undefined && pt.speed !== null) {
                    const speedMps = pt.speed / 3.6;
                    gpx += `        <extensions>\n`;
                    gpx += `          <gpxtpx:TrackPointExtension>\n`;
                    gpx += `            <gpxtpx:speed>${speedMps.toFixed(2)}</gpxtpx:speed>\n`;
                    gpx += `          </gpxtpx:TrackPointExtension>\n`;
                    gpx += `        </extensions>\n`;
                }
                gpx += `      </trkpt>\n`;
            }
        }

        gpx += `    </trkseg>
  </trk>
</gpx>`;

        // 4. Return as file download
        const filename = `${(session.name || 'session').replace(/[^a-z0-9]/gi, '_')}.gpx`;

        return new NextResponse(gpx, {
            status: 200,
            headers: {
                'Content-Type': 'application/gpx+xml',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('GPX Download Error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
