import React from 'react';

interface GForceProps {
    gLat?: number; // Lateral G-force (X-axis)
    gLon?: number; // Longitudinal G-force (Y-axis: +Accel, -Brake)
    maxG?: number; // The scale limit of the circle (e.g., 2.0g)
}

export default function GForceWidget({ gLat = 0, gLon = 0, maxG = 1.5 }: GForceProps) {
    // Constrain the dot within the maximum G radius
    const rawX = gLat / maxG;
    const rawY = -gLon / maxG; // Y axis is inverted on screen (up is negative Y in CSS)

    // Ensure it doesn't escape the circle visually if it spikes
    const distance = Math.sqrt(rawX * rawX + rawY * rawY);
    let scaleX = rawX;
    let scaleY = rawY;
    if (distance > 1) {
        scaleX = rawX / distance;
        scaleY = rawY / distance;
    }

    // Convert to percentage for CSS absolute positioning (-50% to +50%)
    // Center is 50%, so we span from 0% to 100%
    const dotX = `${50 + (scaleX * 50)}%`;
    const dotY = `${50 + (scaleY * 50)}%`;

    const totalG = Math.sqrt(gLat * gLat + gLon * gLon);

    return (
        <div className="flex flex-col items-center justify-center rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-slate-800/90 backdrop-blur-md font-sans select-none min-w-[200px] p-4">
            <div className="flex justify-between items-center w-full mb-3 border-b border-white/10 pb-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">G-Force</span>
                <span className="text-sm font-data font-bold text-yellow-500">{totalG.toFixed(2)} G</span>
            </div>

            <div className="relative w-36 h-36 bg-slate-900 rounded-full border-4 border-slate-700 shadow-inner overflow-hidden flex items-center justify-center">
                {/* Friction Circle Rings */}
                <div className="absolute w-[66%] h-[66%] rounded-full border border-white/10"></div>
                <div className="absolute w-[33%] h-[33%] rounded-full border border-white/10"></div>

                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-white/20"></div>
                <div className="absolute h-full w-[1px] bg-white/20"></div>

                {/* Labels */}
                <span className="absolute top-1 text-[8px] text-gray-500 font-bold">ACCEL</span>
                <span className="absolute bottom-1 text-[8px] text-gray-500 font-bold">BRAKE</span>
                <span className="absolute left-1 text-[8px] text-gray-500 font-bold rotate-[-90deg]">L</span>
                <span className="absolute right-1 text-[8px] text-gray-500 font-bold rotate-90">R</span>

                {/* The Dot */}
                <div
                    className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.8)] transition-all duration-75 ease-linear z-10"
                    style={{ left: dotX, top: dotY, transform: 'translate(-50%, -50%)' }}
                ></div>

                {/* Trail Effect (Optional visual flair) */}
                <div
                    className="absolute w-4 h-4 rounded-full bg-red-500/30 blur-sm transition-all duration-300 ease-out z-0"
                    style={{ left: dotX, top: dotY, transform: 'translate(-50%, -50%)' }}
                ></div>
            </div>

            <div className="w-full flex justify-between mt-3 px-2 text-[9px] font-mono text-gray-400">
                <span>Lat: {Math.abs(gLat).toFixed(2)}</span>
                <span>Lon: {Math.abs(gLon).toFixed(2)}</span>
            </div>
        </div>
    );
}
