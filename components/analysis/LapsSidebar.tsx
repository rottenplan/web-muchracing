'use client';

import { Check, Eye, MapPin, Trophy, History } from 'lucide-react';

interface LapsSidebarProps {
    session: any;
    selectedLaps: number[];
    toggleLap: (lapNumber: number) => void;
}

export default function LapsSidebar({ session, selectedLaps, toggleLap }: LapsSidebarProps) {
    const laps = session?.laps || [];

    const formatLapTime = (seconds: number) => {
        if (!seconds) return '00:00.000';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.round((seconds % 1) * 1000);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    };

    const getDiff = (lapTime: number, bestTime: number) => {
        if (!lapTime || !bestTime) return '';
        const diff = lapTime - bestTime;
        return diff > 0 ? `+${diff.toFixed(3)}s` : '';
    };

    const bestLapTime = laps.length > 0 ? Math.min(...laps.map((l: any) => l.lapTime)) : 0;

    return (
        <aside className="w-[320px] bg-[#212529] border-r border-white/5 flex flex-col shrink-0 h-full shadow-2xl z-[80]">
            {/* Header: Sirkuit Info */}
            <div className="h-44 bg-[#5bc0de] p-5 flex flex-col justify-between text-white relative overflow-hidden shadow-lg shrink-0">
                <div className="relative z-10">
                    <h2 className="text-xl font-black leading-tight uppercase tracking-tighter italic drop-shadow-md">
                        {session?.trackName || 'Sirkuit Tidak Diketahui'}
                    </h2>
                    <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> {session?.location || 'Indonesia'}
                    </p>
                </div>
                <div className="text-5xl font-black self-end relative z-10 italic tracking-tighter opacity-90 drop-shadow-xl">
                    {session?.stats?.totalDistance?.toFixed(1) || '0.0'}km
                </div>
                {/* Decorative Track Path */}
                <svg className="absolute right-[-20px] top-[-20px] w-52 h-52 opacity-10 rotate-12 pointer-events-none" viewBox="0 0 100 100">
                    <path d="M20,80 C20,20 80,20 80,80" fill="none" stroke="white" strokeWidth="15" />
                </svg>
            </div>

            {/* Title Bar */}
            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-white/5 shrink-0">
                <span className="text-[10px] font-black text-[#5bc0de] uppercase tracking-[0.2em] flex items-center gap-2">
                    <Trophy size={12} /> Daftar Lap ({laps.length})
                </span>
            </div>

            {/* Laps List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#1a1a1a]">
                {/* Session Details Header */}
                <div className="bg-[#2c3034] p-2.5 rounded-md border border-white/5 text-[9px] font-black text-white/50 flex justify-between items-center mb-4 shadow-sm uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-white">
                        <History size={12} className="text-[#5bc0de]" />
                        {session?.startTime ? new Date(session.startTime).toLocaleDateString('id-ID') : 'Tanggal Baru'}
                    </span>
                    <span className="text-[#5bc0de]">{session?.name || 'Sesi Latihan'}</span>
                </div>

                {laps.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-[10px] text-[#adb5bd] uppercase font-bold tracking-widest">Tidak ada data lap terdeteksi</p>
                    </div>
                ) : (
                    laps.map((lap: any) => {
                        const isSelected = selectedLaps.includes(lap.lapNumber);
                        const isBest = lap.lapTime === bestLapTime;
                        const diff = getDiff(lap.lapTime, bestLapTime);
                        const lapColor = getColorForLap(lap.lapNumber);

                        return (
                            <div
                                key={lap.lapNumber}
                                className={`
                                    group flex items-center gap-3 p-2 rounded-md transition-all cursor-pointer select-none border border-transparent
                                    ${!lap.valid ? 'opacity-30 grayscale italic' : ''}
                                    ${isSelected ? 'bg-[#2c3034] border-white/5 shadow-md scale-[1.02]' : 'hover:bg-white/[0.03]'}
                                `}
                                onClick={() => toggleLap(lap.lapNumber)}
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

                                <div className="w-5 font-mono text-[10px] text-white/40 font-black text-center">{lap.lapNumber.toString().padStart(2, '0')}</div>

                                <div className="flex-1 font-mono font-black text-[13px] text-white flex items-center justify-between">
                                    <span className={isBest ? 'text-[#5bc0de]' : ''}>{formatLapTime(lap.lapTime)}</span>
                                    {diff && !isBest && <span className="text-[9px] font-bold text-red-500/80 tracking-tighter">({diff})</span>}
                                    {isBest && <span className="text-[9px] font-black text-[#5bc0de] uppercase italic tracking-tighter">Terbaik</span>}
                                </div>

                                <div className={`w-1 h-3 rounded-full transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundColor: lapColor }}></div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-white/5 bg-[#1a1a1a] shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-[#5bc0de] hover:bg-[#46a3bf] text-white py-3 rounded-lg text-xs font-black uppercase tracking-[0.1em] transition-all active:scale-95 shadow-lg shadow-[#5bc0de]/10"
                >
                    Kembali ke Sesi
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
