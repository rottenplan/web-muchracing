import { Timer, Trophy, ChevronRight } from 'lucide-react';

interface SectorTime {
    id: string;
    time: string;
    delta: number;
}

interface AdvancedLapTimerProps {
    currentLap: number;
    totalLaps: number;
    currentTime: string;
    bestTime: string;
    sectors?: SectorTime[];
}

export default function AdvancedLapTimer({
    currentLap = 1,
    totalLaps = 1,
    currentTime = '00:00.0',
    bestTime = '00:00.0',
    sectors = []
}: AdvancedLapTimerProps) {
    return (
        <div className="flex flex-col gap-1 font-sans">
            {/* Top Header: Lap Info */}
            <div className="flex items-start gap-1">
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center min-w-[120px] shadow-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">LAP</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white italic tracking-tighter leading-none">{currentLap}</span>
                        <span className="text-xl font-bold text-slate-500 italic leading-none">/{totalLaps}</span>
                    </div>
                </div>

                {/* Current & Best Times */}
                <div className="flex-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 flex flex-col gap-1 min-w-[180px] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <div className="flex items-center gap-1.5">
                            <Timer size={10} className="text-blue-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current</span>
                        </div>
                        <span className="text-sm font-black text-white italic tabular-nums">{currentTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Trophy size={10} className="text-emerald-400" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Best</span>
                        </div>
                        <span className="text-sm font-black text-emerald-400 italic tabular-nums">{bestTime}</span>
                    </div>

                    {/* Visual Delta Bar (Optional but cool) */}
                    <div className="h-1 bg-slate-900 rounded-full overflow-hidden mt-1 mt-auto">
                        <div className="h-full bg-blue-500 w-[60%] rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>
            </div>

            {/* Sectors Table */}
            <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-2xl">
                {sectors.map((sector, idx) => (
                    <div
                        key={sector.id}
                        className={`flex items-center px-3 py-1.5 border-b border-white/5 last:border-0 ${idx === sectors.length - 1 ? 'bg-blue-600/20' : ''}`}
                    >
                        <span className="text-[10px] font-black text-blue-400 w-6 italic">{sector.id}</span>
                        <span className="text-[11px] font-bold text-white tabular-nums flex-1 tracking-tighter">{sector.time}</span>
                        <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black italic ${sector.delta > 0 ? 'text-red-400' : sector.delta < 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {sector.delta !== 0 && (sector.delta > 0 ? '+' : '')}
                            {sector.delta === 0 ? '--' : sector.delta.toFixed(3)}
                            {idx === 1 && <ChevronRight size={10} className="ml-1" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
