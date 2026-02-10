'use client';

import { Check, Eye, MapPin, Trophy, History } from 'lucide-react';

interface LapsSidebarProps {
    session: any;
    selectedLaps: number[];
    toggleLap: (lapIndex: number) => void;
}

export default function LapsSidebar({ session, selectedLaps, toggleLap }: LapsSidebarProps) {
    // Generate dummy laps if none (for visualization)
    const laps = session?.laps?.length ? session.laps : Array.from({ length: 12 }).map((_, i) => ({
        index: i + 1,
        time: 60000 + Math.random() * 5000,
        valid: Math.random() > 0.1,
        sectors: [20000 + Math.random() * 500, 20000 + Math.random() * 500, 20000 + Math.random() * 500]
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
        <aside className="w-[320px] bg-[#212529] border-r border-white/5 flex flex-col shrink-0 h-full shadow-2xl z-[80]">
            {/* Header: Sirkuit Info */}
            <div className="h-44 bg-[#5bc0de] p-5 flex flex-col justify-between text-white relative overflow-hidden shadow-lg shrink-0">
                <div className="relative z-10">
                    <h2 className="text-xl font-black leading-tight uppercase tracking-tighter italic drop-shadow-md">
                        Sentul Internasional<br />Karting Sirkuit
                    </h2>
                    <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> 16111 BOGOR - Indonesia
                    </p>
                </div>
                <div className="text-5xl font-black self-end relative z-10 italic tracking-tighter opacity-90 drop-shadow-xl">
                    1181m
                </div>
                {/* Decorative Track Path */}
                <svg className="absolute right-[-20px] top-[-20px] w-52 h-52 opacity-10 rotate-12 pointer-events-none" viewBox="0 0 100 100">
                    <path d="M20,80 C20,20 80,20 80,80" fill="none" stroke="white" strokeWidth="15" />
                </svg>
            </div>

            {/* Title Bar */}
            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
                <span className="text-[10px] font-black text-[#5bc0de] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Trophy size={12} /> Daftar Lap
                </span>
            </div>

            {/* Laps List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#1a1a1a]">
                {/* Session Details Header */}
                <div className="bg-[#2c3034] p-2.5 rounded-md border border-white/5 text-[9px] font-black text-white/50 flex justify-between items-center mb-4 shadow-sm uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-white">
                        <History size={12} className="text-[#5bc0de]" />
                        {new Date().toLocaleDateString('id-ID')}
                    </span>
                    <span className="text-[#5bc0de]">Fars Racing</span>
                </div>

                {laps.map((lap: any) => {
                    const isSelected = selectedLaps.includes(lap.index);
                    const isBest = lap.time === bestLapTime;
                    const diff = getDiff(lap.time, bestLapTime);
                    const lapColor = getColorForLap(lap.index);

                    return (
                        <div
                            key={lap.index}
                            className={`
                                group flex items-center gap-3 p-2 rounded-md transition-all cursor-pointer select-none border border-transparent
                                ${!lap.valid ? 'opacity-30 grayscale italic' : ''}
                                ${isSelected ? 'bg-[#2c3034] border-white/5 shadow-md scale-[1.02]' : 'hover:bg-white/[0.03]'}
                            `}
                            onClick={() => toggleLap(lap.index)}
                        >
                            {/* Lap Checkbox/Color Indicator */}
                            <div
                                className={`w-4 h-4 rounded flex items-center justify-center transition-all border
                                ${isSelected
                                        ? `border-transparent shadow-lg text-black`
                                        : 'border-white/10 bg-black/20'}
                                `}
                                style={{ backgroundColor: isSelected ? lapColor : 'transparent' }}
                            >
                                {isSelected && <Check size={10} strokeWidth={4} />}
                            </div>

                            <div className="w-5 font-mono text-[10px] text-white/40 font-black text-center">{lap.index.toString().padStart(2, '0')}</div>

                            <div className="flex-1 font-mono font-black text-[13px] text-white flex items-center justify-between">
                                <span className={isBest ? 'text-[#5bc0de]' : ''}>{formatTime(lap.time)}</span>
                                {diff && !isBest && <span className="text-[9px] font-bold text-red-500/80 tracking-tighter">({diff})</span>}
                                {isBest && <span className="text-[9px] font-black text-[#5bc0de] uppercase italic tracking-tighter">Terbaik</span>}
                            </div>

                            <div className={`w-1 h-3 rounded-full transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: lapColor }}></div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-white/5 bg-[#1a1a1a] shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                <button className="w-full bg-[#5bc0de] hover:bg-[#46a3bf] text-white py-3 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg shadow-[#5bc0de]/10">
                    Muat Sesi Lain
                </button>
            </div>
        </aside>
    );
}

// Helper for lap colors
function getColorForLap(index: number) {
    const colors = ['#00aced', '#ff00ff', '#00ffa2', '#f0ad4e', '#ff4d4d', '#7952b3'];
    return colors[index % colors.length];
}
