import React from 'react';
import { Timer } from 'lucide-react';

interface LapData {
    lapNumber: number;
    lapTime: number;
    valid?: boolean;
}

interface LapListProps {
    laps: LapData[];
    bestLapNumber?: number;
    currentLapNumber?: number;
}

export default function LapListWidget({ laps, bestLapNumber, currentLapNumber }: LapListProps) {
    const formatSeconds = (sec?: number) => {
        if (!sec) return "--.---";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        const msFrac = Math.floor((sec - Math.floor(sec)) * 1000);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${msFrac.toString().padStart(3, '0')}`;
    };

    // Color palette for lap bars to match FoxLAP style
    const colors = ['bg-blue-600', 'bg-green-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500'];

    return (
        <div className="flex flex-col rounded-lg overflow-hidden shadow-2xl bg-slate-800/90 backdrop-blur-md font-sans select-none min-w-[200px]">
            {/* Header */}
            <div className="flex flex-col items-center py-2 bg-slate-900 border-b-2 border-red-600">
                <span className="text-sm text-gray-200 font-bold tracking-widest uppercase leading-tight">LAP</span>
                <span className="text-xl font-data font-bold text-white leading-none">
                    {currentLapNumber || '--'} / {laps.length || '--'}
                </span>
            </div>

            {/* List */}
            <div className="flex flex-col py-2 px-3 gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
                {laps.map((lap, idx) => {
                    const isBest = lap.lapNumber === bestLapNumber;
                    const barColor = colors[idx % colors.length];

                    return (
                        <div key={lap.lapNumber} className="flex items-center gap-2 py-0.5">
                            <div className={`w-1.5 h-4 rounded-full ${barColor}`}></div>
                            <span className="text-xs font-mono font-bold text-gray-300 w-6">
                                {lap.lapNumber.toString().padStart(2, '0')}
                            </span>
                            <span className={`text-sm font-data font-bold ${isBest ? 'text-green-500' : 'text-white'}`}>
                                {formatSeconds(lap.lapTime)}
                            </span>
                            {isBest && <Timer size={12} className="text-white ml-auto" />}
                        </div>
                    );
                })}
                {laps.length === 0 && (
                    <div className="text-xs text-center text-gray-500 py-4 italic">No laps recorded</div>
                )}
            </div>
        </div>
    );
}
