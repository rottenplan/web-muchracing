import { useState, useEffect, RefObject } from 'react';

export interface TelemetryPoint {
    timestamp: number;
    speed: number;
    rpm?: number;
    lat?: number;
    lng?: number;
    lean?: number;
    gLat?: number;
    gLon?: number;
    [key: string]: any;
}

/**
 * Custom hook to provide a smooth 60FPS interpolated telemetry point
 * based on the current video playback time.
 */
export function useInterpolatedPoint(
    points: TelemetryPoint[],
    videoRef: RefObject<HTMLVideoElement | null>,
    isPlaying: boolean,
    isSyncing: boolean,
    offsetSeconds: number
) {
    const [interpolatedPoint, setInterpolatedPoint] = useState<TelemetryPoint | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let animationFrameId: number;

        const updatePoint = () => {
            if (!videoRef.current || points.length === 0 || !isSyncing) return;

            const videoCurrentTime = videoRef.current.currentTime;
            const targetTelemetryTime = (videoCurrentTime - offsetSeconds) * 1000;
            const startTime = points[0].timestamp;
            const absoluteTargetTime = startTime + targetTelemetryTime;

            // Find the two surrounding points for interpolation using binary search for performance
            let low = 0;
            let high = points.length - 1;
            let p1Index = 0;

            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (points[mid].timestamp <= absoluteTargetTime) {
                    p1Index = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }

            const p1 = points[p1Index];
            const p2Index = Math.min(p1Index + 1, points.length - 1);
            const p2 = points[p2Index];

            // If we are out of bounds or exact match
            if (p1Index === p2Index || absoluteTargetTime <= p1.timestamp || absoluteTargetTime >= p2.timestamp) {
                setInterpolatedPoint(p1);
                setCurrentIndex(p1Index);
            } else {
                // Linear Interpolation
                const timeDiff = p2.timestamp - p1.timestamp;
                const ratio = timeDiff === 0 ? 0 : (absoluteTargetTime - p1.timestamp) / timeDiff;

                const interpolated: TelemetryPoint = {
                    timestamp: absoluteTargetTime,
                    speed: p1.speed + (p2.speed - p1.speed) * ratio,
                    rpm: (p1.rpm || 0) + ((p2.rpm || 0) - (p1.rpm || 0)) * ratio,
                    lat: (p1.lat || 0) + ((p2.lat || 0) - (p1.lat || 0)) * ratio,
                    lng: (p1.lng || 0) + ((p2.lng || 0) - (p1.lng || 0)) * ratio,
                    lean: (p1.lean || 0) + ((p2.lean || 0) - (p1.lean || 0)) * ratio,
                    gLat: (p1.gLat || 0) + ((p2.gLat || 0) - (p1.gLat || 0)) * ratio,
                    gLon: (p1.gLon || 0) + ((p2.gLon || 0) - (p1.gLon || 0)) * ratio,
                };

                setInterpolatedPoint(interpolated);
                setCurrentIndex(p1Index); // Base index for non-interpolatable loops
            }

            if (isPlaying) {
                animationFrameId = requestAnimationFrame(updatePoint);
            }
        };

        if (isPlaying && isSyncing) {
            animationFrameId = requestAnimationFrame(updatePoint);
        } else if (!isPlaying && isSyncing) {
            // Run exactly once if paused but we just scrubbed the video
            updatePoint();
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [points, videoRef, isPlaying, isSyncing, offsetSeconds]);

    return { interpolatedPoint, currentIndex };
}
