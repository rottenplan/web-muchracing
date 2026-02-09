'use client';

import { Check, Eye, EyeOff } from 'lucide-react';

interface LapsSidebarProps {
    session: any;
    selectedLaps: number[];
    toggleLap: (lapIndex: number) => void;
}

export default function LapsSidebar({ session, selectedLaps, toggleLap }: LapsSidebarProps) {
    // Generate dummy laps if none (for visualization)
    const laps = session?.laps?.length ? session.laps : Array.from({ length: 10 }).map((_, i) => ({
        index: i + 1,
        time: 60000 + Math.random() * 5000,
        valid: Math.random() > 0.2, // Randomly invalid
        sectors: [20000 + Math.random() * 1000, 20000 + Math.random() * 1000, 20000 + Math.random() * 1000]
    }));

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const msPart = Math.floor((ms % 1000));
        return `${m}:${s.toString().padStart(2, '0')}.${msPart.toString().padStart(3, '0')}`;
    };

    const getDiff = (lapTime: number, bestTime: number) => {
        const diff = lapTime - bestTime;
        return diff > 0 ? `+${(diff / 1000).toFixed(3)}s` : '';
    };

    const bestLapTime = Math.min(...laps.map((l: any) => l.time));

    return (
        <aside className="w-[350px] bg-[#212529] border-r border-black/20 flex flex-col shrink-0 flex-1">
            <div className="h-40 bg-[#17a2b8] p-4 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold leading-tight">Sentul Internasional<br />Karting Sirkuit</h2>
                    <p className="text-xs opacity-80 mt-1">16111 BOGOR - Indonesia</p>
                </div>
                <div className="text-4xl font-racing font-bold self-end relative z-10">
                    1181m
                </div>
                {/* Decorative Track Path */}
                <svg className="absolute right-[-20px] top-[-20px] w-48 h-48 opacity-20 rotate-12" viewBox="0 0 100 100">
                    <path d="M20,80 C20,20 80,20 80,80" fill="none" stroke="white" strokeWidth="15" />
                </svg>
            </div>

            <div className="bg-[#1a1a1a] p-2 flex items-center justify-between border-b border-black/20">
                <span className="text-sm font-bold text-white px-2">Laps</span>
                <div className="flex gap-1">
                    {/* Tool icons placeholder */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#212529]">
                {/* Laps Dropdown Header (Fake) */}
                <div className="bg-[#17a2b8] p-2 rounded text-xs font-bold text-white flex justify-between items-center mb-2">
                    <span>{new Date().toLocaleString('id-ID')} (FARS)</span>
                </div>

                {laps.map((lap: any) => {
                    const isSelected = selectedLaps.includes(lap.index);
                    const isBest = lap.time === bestLapTime;
                    const diff = getDiff(lap.time, bestLapTime);

                    return (
                        <div
                            key={lap.index}
                            className={`
                                group flex items-center gap-2 p-1.5 rounded text-sm transition-colors cursor-pointer select-none
                                ${!lap.valid ? 'opacity-50 grayscale' : ''}
                                hover:bg-white/5
                            `}
                            onClick={() => toggleLap(lap.index)}
                        >
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                                ${isSelected
                                        ? `bg-[${getColorForLap(lap.index)}] border-transparent text-black`
                                        : 'border-white/20 bg-transparent'}
                                `}
                                style={{ backgroundColor: isSelected ? getColorForLap(lap.index) : 'transparent' }}
                            >
                                {isSelected && <Check size={10} />}
                            </div>

                            <div className="w-6 font-mono text-white/50 text-xs text-center">{lap.index.toString().padStart(2, '0')}</div>

                            <div className="flex-1 font-mono font-bold text-white">
                                {formatTime(lap.time)}
                                {diff && <span className={`ml-2 text-xs font-normal ${lap.valid ? 'text-red-400' : 'text-gray-500'}`}>({diff})</span>}
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/40">
                                <Eye size={12} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-2 border-t border-black/20 text-center">
                <button className="w-full bg-[#17a2b8] hover:bg-[#138496] text-white py-2 rounded text-sm font-bold uppercase transition-colors">
                    Load Another session
                </button>
            </div>
        </aside>
    );
}

// Helper for lap colors (FoxLap style neon colors)
function getColorForLap(index: number) {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[index % colors.length];
}
