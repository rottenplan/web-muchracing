import Session, { ISession } from '../../models/Session';
import { parseGpx } from '../gpxParser';

export class GpxService {
    /**
     * Process GPX content and create a session
     */
    static async processGpx(userId: string, gpxContent: string, originalFilename: string): Promise<ISession> {
        const parsedData = await parseGpx(gpxContent);
        const points = parsedData.points;

        if (!points || points.length === 0) {
            throw new Error('No GPS points found in GPX file');
        }

        // Calculate Stats
        const maxSpeed = points.reduce((max: number, p: any) => Math.max(max, p.speed || 0), 0) * 3.6; // m/s to km/h
        const startTime = points[0]?.time;
        const endTime = points[points.length - 1]?.time;

        const totalDistance = this.calculateTotalDistance(points);

        // Create new session
        const newSession = new Session({
            userId,
            name: parsedData.name || originalFilename,
            originalFilename: originalFilename,
            startTime: startTime ? new Date(startTime) : new Date(),
            endTime: endTime ? new Date(endTime) : new Date(),
            stats: {
                totalDistance: totalDistance / 1000, // km
                maxSpeed: maxSpeed,
                totalPoints: points.length
            },
            points: points.map((p: any) => ({
                lat: p.lat,
                lng: p.lon,
                ele: p.ele,
                time: p.time,
                speed: (p.speed || 0) * 3.6 // Ensure stored as km/h
            }))
        });

        await newSession.save();
        return newSession;
    }

    /**
     * Calculate total distance using Haversine formula
     */
    private static calculateTotalDistance(points: any[]): number {
        let totalDistance = 0;
        for (let i = 1; i < points.length; i++) {
            const p1 = points[i - 1];
            const p2 = points[i];
            const R = 6371e3; // Earth radius in metres
            const φ1 = p1.lat * Math.PI / 180;
            const φ2 = p2.lat * Math.PI / 180;
            const Δφ = (p2.lat - p1.lat) * Math.PI / 180;
            const Δλ = (p2.lon - p1.lon) * Math.PI / 180;

            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            totalDistance += R * c;
        }
        return totalDistance;
    }
}
