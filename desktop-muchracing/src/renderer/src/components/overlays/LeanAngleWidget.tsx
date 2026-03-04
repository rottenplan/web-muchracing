import React from 'react';

interface LeanAngleProps {
    leanAngle?: number; // In degrees, negative is left, positive is right (or vice-versa)
}

export default function LeanAngleWidget({ leanAngle = 0 }: LeanAngleProps) {
    // Determine direction and absolute angle
    const absAngle = Math.abs(leanAngle);
    const direction = leanAngle < 0 ? 'LEFT' : leanAngle > 0 ? 'RIGHT' : 'UP';

    // Rotate the "motorcycle" line
    const rotation = `rotate(${leanAngle}deg)`;

    return (
        <div className="flex flex-col items-center justify-center rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-slate-800/90 backdrop-blur-md font-sans select-none min-w-[180px] p-4">
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4 w-full text-center border-b border-white/10 pb-1">
                Lean Angle
            </div>

            <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Background Arc */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="4 4"
                    />
                    {/* Center tick */}
                    <line x1="50" y1="10" x2="50" y2="5" stroke="#94a3b8" strokeWidth="2" />
                    {/* 45 deg ticks */}
                    <line x1="21.7" y1="21.7" x2="18.1" y2="18.1" stroke="#ef4444" strokeWidth="2" />
                    <line x1="78.3" y1="21.7" x2="81.9" y2="18.1" stroke="#ef4444" strokeWidth="2" />
                </svg>

                {/* Animated Needle / Motor */}
                <div
                    className="absolute w-1 h-20 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-full origin-bottom shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-transform duration-75 ease-linear"
                    style={{ transform: rotation, bottom: '50%' }}
                >
                    {/* Top dot */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-3 h-3 bg-white rounded-full shadow-[0_0_5px_white]"></div>
                </div>

                {/* Ground Line */}
                <div className="absolute bottom-[48%] w-24 h-0.5 bg-gray-500 rounded-full"></div>
                <div className="absolute bottom-[48%] w-4 h-4 bg-gray-800 border-2 border-gray-500 rounded-full transform translate-y-1/2"></div>
            </div>

            <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-data font-bold text-white tabular-nums drop-shadow-md">
                    {absAngle.toFixed(1)}&deg;
                </span>
                <span className={`text-xs font-bold mb-1 ${leanAngle < 0 ? 'text-blue-400' : leanAngle > 0 ? 'text-pink-400' : 'text-gray-400'}`}>
                    {direction}
                </span>
            </div>
        </div>
    );
}
