import React from 'react';

interface LiveDeltaProps {
    delta?: number; // In seconds. Negative = faster (green), Positive = slower (red)
}

export default function LiveDeltaWidget({ delta = 0 }: LiveDeltaProps) {
    const isFaster = delta < 0;
    const isSlower = delta > 0;

    const displayColor = isFaster ? 'text-green-500' : isSlower ? 'text-red-500' : 'text-gray-400';
    const bgColor = isFaster ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
        : isSlower ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
            : 'bg-slate-800 border-white/10';

    const sign = isFaster ? '-' : isSlower ? '+' : '';
    const formattedDelta = Math.abs(delta).toFixed(2);

    return (
        <div className={`flex items-center gap-3 rounded-lg overflow-hidden border px-4 py-3 backdrop-blur-md font-sans select-none min-w-[160px] transition-colors duration-300 ${bgColor}`}>
            <div className="flex flex-col">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest shadow-black drop-shadow-md">
                    Live Delta
                </span>
                <span className={`text-2xl font-data font-bold tabular-nums drop-shadow-md ${displayColor}`}>
                    {sign}{formattedDelta}
                </span>
            </div>
        </div>
    );
}
