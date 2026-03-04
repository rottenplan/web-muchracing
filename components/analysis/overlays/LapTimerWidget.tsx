import React from 'react';
import { Timer } from 'lucide-react';

interface LapTimerProps {
    currentLapTime: number; // in milliseconds
    bestLapTime?: number; // in seconds
    s1?: number; // in seconds
    s2?: number; // in seconds
    s3?: number; // in seconds
}

export default function LapTimerWidget({ currentLapTime, bestLapTime, s1, s2, s3 }: LapTimerProps) {
    const formatTime = (ms: number) => {
        if (!ms || ms < 0) return "00.00.0";
        const totalSeconds = ms / 1000;
        const m = Math.floor(totalSeconds / 60);
        const s = Math.floor(totalSeconds % 60);
        const msFrac = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 10);
        return `${m.toString().padStart(2, '0')}.${s.toString().padStart(2, '0')}.${msFrac}`;
    };

    const formatSeconds = (sec?: number) => {
        if (!sec) return "--.---";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        const msFrac = Math.floor((sec - Math.floor(sec)) * 1000);
        if (m > 0) return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${msFrac.toString().padStart(3, '0')}`;
        return `${s.toString().padStart(2, '0')}.${msFrac.toString().padStart(3, '0')}`;
    };

    return (
        <div className="flex flex-col rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-slate-800/90 backdrop-blur-md font-sans select-none min-w-[320px]">
            {/* Header row */}
            <div className="flex justify-between items-end px-4 py-2 border-b border-white/10 bg-slate-900/50">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-300 font-bold tracking-wider uppercase">Current</span>
                    <span className="text-3xl font-data font-bold text-white leading-none tracking-tight">
                        {formatTime(currentLapTime)}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-300 font-bold tracking-wider uppercase">Best</span>
                    <span className="text-lg font-data font-bold text-green-500 leading-none">
                        {formatSeconds(bestLapTime)}
                    </span>
                </div>
            </div>

            {/* Sectors row */}
            <div className="flex bg-slate-800/80">
                <div className="flex-1 flex flex-col items-center py-1 border-r border-white/10">
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">S1</span>
                    <span className="text-xs font-mono text-white">{formatSeconds(s1)}</span>
                </div>
                <div className="flex-1 flex flex-col items-center py-1 border-r border-white/10">
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">S2</span>
                    <span className="text-xs font-mono text-white">{formatSeconds(s2)}</span>
                </div>
                <div className="flex-1 flex flex-col items-center py-1">
                    <span className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">S3</span>
                    <span className="text-xs font-mono text-white">{formatSeconds(s3)}</span>
                </div>
            </div>
            {/* Progress bar visual flair */}
            <div className="h-1 w-full bg-slate-700">
                <div className="h-full bg-blue-500 w-full animate-pulse opacity-50"></div>
            </div>
        </div>
    );
}
