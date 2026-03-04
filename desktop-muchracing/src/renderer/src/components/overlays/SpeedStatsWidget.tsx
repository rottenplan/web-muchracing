import React from 'react';

interface SpeedStatsProps {
    peakSpeed: number;
    minSpeed: number;
}

export default function SpeedStatsWidget({ peakSpeed, minSpeed }: SpeedStatsProps) {
    return (
        <div className="flex flex-col gap-2 font-sans select-none min-w-[220px]">
            {/* Peak Speed Bar */}
            <div className="flex items-center bg-green-600/90 backdrop-blur-md rounded-full px-4 py-2 border border-green-400/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <span className="text-sm text-white font-bold tracking-wide mr-2 shadow-black drop-shadow-md">
                    Speed peak.
                </span>
                <span className="text-xl font-data font-bold text-white shadow-black drop-shadow-md">
                    {peakSpeed.toFixed(1)} <span className="text-xs uppercase">Km/h</span>
                </span>
            </div>

            {/* Min Speed Bar */}
            <div className="flex items-center bg-red-600/90 backdrop-blur-md rounded-full px-4 py-2 border border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <span className="text-sm text-white font-bold tracking-wide mr-2 shadow-black drop-shadow-md">
                    Speed min.
                </span>
                <span className="text-xl font-data font-bold text-white shadow-black drop-shadow-md">
                    {minSpeed.toFixed(1)} <span className="text-xs uppercase">Km/h</span>
                </span>
            </div>
        </div>
    );
}
