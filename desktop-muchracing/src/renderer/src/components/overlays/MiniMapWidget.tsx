import React, { useMemo } from 'react';

interface TelemetryPoint {
    lat?: number;
    lng?: number;
}

interface MiniMapProps {
    points: TelemetryPoint[];
    currentIndex: number;
    currentPoint?: TelemetryPoint;
    width?: number;
    height?: number;
}

export default function MiniMapWidget({ points, currentIndex, currentPoint, width = 250, height = 250 }: MiniMapProps) {
    // Filter out invalid points
    const validPoints = useMemo(() => {
        if (!points) return [];
        return points.filter(p => p.lat !== undefined && p.lng !== undefined) as { lat: number, lng: number }[];
    }, [points]);

    // Calculate bounding box for SVG viewbox
    const { minLat, maxLat, minLng, maxLng } = useMemo(() => {
        if (validPoints.length === 0) {
            return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 };
        }
        let minLat = validPoints[0].lat;
        let maxLat = minLat;
        let minLng = validPoints[0].lng;
        let maxLng = minLng;

        for (const p of validPoints) {
            if (p.lat < minLat) minLat = p.lat;
            if (p.lat > maxLat) maxLat = p.lat;
            if (p.lng < minLng) minLng = p.lng;
            if (p.lng > maxLng) maxLng = p.lng;
        }
        return { minLat, maxLat, minLng, maxLng };
    }, [validPoints]);

    const latDiff = maxLat - minLat || 1;
    const lngDiff = maxLng - minLng || 1;

    // Expand bounding box slightly for padding
    const padding = 0.1; // 10%
    const paddedMinLat = minLat - latDiff * padding;
    const paddedMaxLat = maxLat + latDiff * padding;
    const paddedMinLng = minLng - lngDiff * padding;
    const paddedMaxLng = maxLng + lngDiff * padding;

    const viewBox = `${paddedMinLng} ${paddedMinLat} ${paddedMaxLng - paddedMinLng} ${paddedMaxLat - paddedMinLat}`;

    // SVG coordinate system is Y-down, but Latitude is Y-up.
    // We need to mirror the Y axis using transform.
    const transformScale = `scale(1, -1) translate(0, -${paddedMinLat + paddedMaxLat})`;

    // Prevent rendering if no valid points
    if (validPoints.length === 0) return null;

    // Calculate map path
    const pathD = useMemo(() => {
        return validPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.lng} ${p.lat}`).join(' ');
    }, [validPoints]);

    // Current dot position
    const currentRawPoint = currentPoint || points[currentIndex];
    const activePoint = (currentRawPoint && currentRawPoint.lat !== undefined && currentRawPoint.lng !== undefined)
        ? currentRawPoint
        : validPoints[Math.min(currentIndex, validPoints.length - 1)] || validPoints[0];

    return (
        <div
            className="rounded-lg overflow-hidden border-2 border-slate-700/50 shadow-2xl bg-black/80 backdrop-blur-md relative"
            style={{ width, height }}
        >
            <div className="absolute top-2 left-2 text-white/50 text-xs font-racing uppercase tracking-widest z-10 px-2 py-1 bg-black/50 rounded">
                Track Map
            </div>

            <svg
                width="100%"
                height="100%"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0"
            >
                <g transform={transformScale}>
                    <path
                        d={pathD}
                        fill="none"
                        stroke="#4b5563"
                        strokeWidth={(paddedMaxLng - paddedMinLng) * 0.015} // dynamic stroke width based on scale
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {activePoint && (
                        <circle
                            cx={activePoint.lng}
                            cy={activePoint.lat}
                            r={(paddedMaxLng - paddedMinLng) * 0.03}
                            fill="#22c55e"
                            className="drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                        />
                    )}
                </g>
            </svg>
        </div>
    );
}
