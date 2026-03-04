import { TelemetryPoint } from '../hooks/useInterpolatedPoint';

export interface Lap {
    number: number;
    startTime: number;
    endTime: number;
    duration: number;
    maxSpeed: number;
    minSpeed: number;
    distance: number;
    startPoint: TelemetryPoint;
    endPoint: TelemetryPoint;
}

export interface Sector {
    id: string;
    time: string;
    delta: number;
}

/**
 * Detects laps from a telemetry point array based on a finish line position.
 */
export function detectLaps(points: TelemetryPoint[]): Lap[] {
    if (points.length < 2) return [];

    const laps: Lap[] = [];
    const finishLineFinishRadius = 50; // meters

    // For now, we'll use a simpler heuristic: finding the point where the distance "resets" 
    // or using the first point as the reference beacon if no explicit beacon is provided.
    const beacon = points[0];
    let lastCrossingIdx = 0;

    for (let i = 1; i < points.length; i++) {
        const p = points[i];

        // Check if we crossed back into the beacon radius
        // This is a placeholder for more advanced distance/intersect logic
        const distToBeacon = calculateDistance(beacon.lat || 0, beacon.lng || 0, p.lat || 0, p.lng || 0);

        // Simple lap detection logic (every X meters as a mock if no GPS)
        // In a real app, we'd look for the closest point to the finish line
        if (distToBeacon < finishLineFinishRadius && i - lastCrossingIdx > 100) {
            const lapPoints = points.slice(lastCrossingIdx, i);
            const startTime = points[lastCrossingIdx].timestamp;
            const endTime = p.timestamp;

            laps.push({
                number: laps.length + 1,
                startTime,
                endTime,
                duration: endTime - startTime,
                maxSpeed: Math.max(...lapPoints.map(lp => lp.speed)),
                minSpeed: Math.min(...lapPoints.map(lp => lp.speed)),
                distance: p.distance - points[lastCrossingIdx].distance,
                startPoint: points[lastCrossingIdx],
                endPoint: p
            });
            lastCrossingIdx = i;
        }
    }

    return laps;
}

/**
 * Calculates Haversine distance between two points in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export interface Bounds {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    latRange: number;
    lngRange: number;
}

/**
 * Calculates bounds for a telemetry point array.
 */
export function getBounds(points: TelemetryPoint[]): Bounds {
    if (points.length === 0) return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0, latRange: 1, lngRange: 1 };

    const lats = points.map(p => p.lat || 0);
    const lngs = points.map(p => p.lng || 0);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    return {
        minLat,
        maxLat,
        minLng,
        maxLng,
        latRange: maxLat - minLat || 1,
        lngRange: maxLng - minLng || 1
    };
}

/**
 * Normalizes a single GPS point to 0-100 coordinates.
 */
export function normalizePoint(p: TelemetryPoint, bounds: Bounds): { x: number; y: number } {
    return {
        x: ((p.lng || 0) - bounds.minLng) / bounds.lngRange * 100,
        y: 100 - (((p.lat || 0) - bounds.minLat) / bounds.latRange * 100)
    };
}

/**
 * Normalizes GPS points to 0-100 coordinates for SVG rendering.
 */
export function normalizeGpsPoints(points: TelemetryPoint[]): { x: number; y: number }[] {
    const bounds = getBounds(points);
    return points.map(p => normalizePoint(p, bounds));
}

/**
 * Generates dummy sectors for a lap by dividing it into equal segments.
 */
export function calculateSectors(lap: Lap): Sector[] {
    const numSectors = 4;
    const sectorDuration = lap.duration / numSectors;

    return Array.from({ length: numSectors }, (_, i) => ({
        id: (i + 1).toString().padStart(2, '0'),
        time: formatDuration(sectorDuration),
        delta: 0 // Mock delta for now
    }));
}

/**
 * Formats duration in ms to MM:SS.mmm
 */
export function formatDuration(ms: number): string {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const mmm = Math.floor(ms % 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${mmm.toString().padStart(3, '0')}`;
}
