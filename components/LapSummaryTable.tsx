import React from 'react';

interface LapData {
    lapNumber: number;
    lapTime: number;
    pointIndex: number;
    valid: boolean;
    maxSpeed?: number;
    maxRpm?: number;
    distance?: number;
    gap?: number; // Delta to best lap
}

interface LapSummaryTableProps {
    laps: LapData[];
    selectedLapIdx: number;
    onSelectLap: (idx: number) => void;
    bestLap?: number;
}

export default function LapSummaryTable({ laps, selectedLapIdx, onSelectLap, bestLap }: LapSummaryTableProps) {
    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr className="text-[#525252] border-b border-white/5 uppercase bg-white/2">
                            <th className="py-2 px-4 font-bold tracking-widest">LAP</th>
                            <th className="py-2 px-4 font-bold tracking-widest text-[#ef4444]">Time</th>
                            <th className="py-2 px-4 font-bold tracking-widest">Distance</th>
                            <th className="py-2 px-4 font-bold tracking-widest">Speed Max</th>
                            <th className="py-2 px-4 font-bold tracking-widest">RPM Max</th>
                            <th className="py-2 px-4 font-bold tracking-widest text-right">Gap</th>
                        </tr>
                    </thead>
                    <tbody>
                        {laps.map((lap, i) => {
                            const isSelected = selectedLapIdx === i;
                            const gapValue = lap.lapTime - (bestLap || 0);
                            const isBest = lap.lapTime === bestLap;

                            return (
                                <tr
                                    key={i}
                                    onClick={() => onSelectLap(i)}
                                    className={`border-b border-white/5 cursor-pointer transition-all duration-200 group ${isSelected ? 'bg-[#ef4444]/15' : 'hover:bg-white/5'}`}
                                >
                                    <td className={`py-4 px-4 font-bold ${isSelected ? 'text-[#ef4444]' : 'text-[#a3a3a3]'}`}>
                                        {lap.lapNumber}
                                    </td>
                                    <td className="py-4 px-4 font-mono text-white text-sm font-bold">
                                        {(lap.lapTime || 0).toFixed(3)}s
                                        {isBest && <span className="ml-2 text-[10px] text-yellow-500">★</span>}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#a3a3a3] font-mono">{(lap.distance || 0).toFixed(1)}m</span>
                                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500/60"
                                                    style={{ width: `${Math.min(100, ((lap.distance || 0) / 500) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#a3a3a3] font-mono">{(lap.maxSpeed || 0).toFixed(1)} <span className="text-[8px]">KMH</span></span>
                                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[#ef4444]/60"
                                                    style={{ width: `${Math.min(100, ((lap.maxSpeed || 0) / 100) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[#a3a3a3] font-mono">{Math.round(lap.maxRpm || 0)}</span>
                                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500/60"
                                                    style={{ width: `${Math.min(100, ((lap.maxRpm || 0) / 12000) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right font-mono">
                                        {isBest ? (
                                            <span className="text-green-500/80 font-bold">Best</span>
                                        ) : (
                                            <span className={`${gapValue > 0 ? 'text-[#ef4444]' : 'text-green-400'}`}>
                                                {gapValue > 0 ? `+${(gapValue || 0).toFixed(3)}` : (gapValue || 0).toFixed(3)}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
