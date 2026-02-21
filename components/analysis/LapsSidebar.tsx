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
        <aside className="w-[320px] bg-black/20 glass-card border-r border-white/5 flex flex-col shrink-0 h-full shadow-2xl z-[80] overflow-hidden rounded-3xl">
            {/* Header: Sirkuit Info */}
            <div className="h-44 bg-blue-600 p-6 flex flex-col justify-between text-white relative overflow-hidden shadow-2xl shrink-0">
                <div className="relative z-10">
                    <h2 className="text-2xl font-racing leading-tight uppercase tracking-wider italic">
                        {session?.trackName || 'UNREGISTERED CIRCUIT'}
                    </h2>
                    <p className="text-[10px] font-bold opacity-80 mt-2 uppercase tracking-[0.2em] flex items-center gap-1.5 font-racing">
                        <MapPin size={12} className="text-white/80" /> {session?.location || 'TELEMETRY DATA'}
                    </p>
                </div>
                <div className="text-5xl font-racing self-end relative z-10 italic tracking-tighter opacity-95 drop-shadow-2xl">
                    {session?.stats?.totalDistance?.toFixed(1) || '0.0'}<span className="text-xl not-italic ml-1">KM</span>
                </div>
                {/* Decorative Track Path */}
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-30"></div>
                <svg className="absolute right-[-20px] top-[-20px] w-52 h-52 opacity-10 rotate-12 pointer-events-none" viewBox="0 0 100 100">
                    <path d="M20,80 C20,20 80,20 80,80" fill="none" stroke="white" strokeWidth="15" />
                </svg>
            </div>

            {/* Title Bar */}
            <div className="bg-black/40 px-5 py-3 flex items-center justify-between border-b border-white/5 shrink-0">
                <span className="text-[10px] font-racing text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Trophy size={14} className="text-blue-400" /> TIMING LIST ({laps.length})
                </span>
            </div>

            {/* Laps List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-transparent scrollbar-thin scrollbar-thumb-white/5">
                {/* Session Details Header */}
                <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 text-[9px] font-bold text-gray-500 flex justify-between items-center mb-6 shadow-sm uppercase tracking-[0.1em] font-racing">
                    <span className="flex items-center gap-2 text-gray-300">
                        <History size={14} className="text-blue-500" />
                        {session?.startTime ? new Date(session.startTime).toLocaleDateString('id-ID') : 'NEW SESSION'}
                    </span>
                    <span className="text-blue-400">{session?.name || 'TRACK DATA'}</span>
                </div>

                {laps.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Zero Laps Detected</p>
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
                                    group flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer select-none border
                                    ${!lap.valid ? 'opacity-30 grayscale italic' : ''}
                                    ${isSelected
                                        ? 'bg-white/[0.07] border-white/10 shadow-xl scale-[1.03] -translate-x-1'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.01]'}
                                `}
                                onClick={() => toggleLap(lap.lapNumber)}
                            >
                                {/* Lap Status Indicator */}
                                <div
                                    className={`w-1.5 h-6 rounded-full transition-all duration-300 ${isSelected ? 'opacity-100 scale-110' : 'opacity-30'}`}
                                    style={{ backgroundColor: lapColor }}
                                ></div>

                                <div className="w-5 font-racing text-[10px] text-gray-500 font-bold text-center">
                                    {lap.lapNumber.toString().padStart(2, '0')}
                                </div>

                                <div className="flex-1 font-data font-bold text-sm text-white flex items-center justify-between">
                                    <span className={isBest ? 'text-blue-400 glow-text text-sm' : ''}>{formatLapTime(lap.lapTime)}</span>
                                    {isBest ? (
                                        <span className="text-[8px] font-racing text-blue-400 uppercase italic tracking-widest bg-blue-500/10 px-1.5 py-0.5 rounded">BEST</span>
                                    ) : (
                                        diff && <span className="text-[9px] font-bold text-red-500/60 tracking-tighter">{diff}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Action */}
            <div className="p-5 border-t border-white/5 bg-black/40 shadow-2xl">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white py-4 rounded-xl text-[10px] font-racing uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
                >
                    EXIT ANALYSIS
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
