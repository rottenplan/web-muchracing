import { useRef } from 'react'
import { Play, Pause, Search, ChevronDown, Video, Settings, Maximize } from 'lucide-react'

interface BottomTimelineProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}

export default function BottomTimeline({
    isPlaying,
    onTogglePlay,
    currentTime,
    duration,
    onSeek,
}: BottomTimelineProps) {

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const trackRef = useRef<HTMLDivElement>(null);

    const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if (trackRef.current) {
            const rect = trackRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));
            onSeek(newTime);
        }
    };

    return (
        <div className="h-56 bg-slate-950 border-t border-white/5 flex flex-col shrink-0 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">

            {/* Video Control Bar - MATCHING REFERENCE */}
            <div className="h-16 bg-black/90 border-b border-white/5 flex items-center px-6 gap-6 shrink-0 relative overflow-hidden">
                {/* Background Scrubber Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-orange-600/5 pointer-events-none" />

                {/* Play Toggle */}
                <button
                    onClick={onTogglePlay}
                    className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 shrink-0 z-10"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                </button>

                {/* Scrubber Area */}
                <div className="flex-1 flex flex-col gap-1.5 z-10">
                    <div className="flex justify-between items-end mb-0.5">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest tabular-nums">{formatTime(currentTime)}</span>
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                <span className="text-[9px] font-bold text-slate-500">SYNC</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="text-slate-500 hover:text-white transition-colors"><Search size={12} /></button>
                            <span className="text-[10px] font-black text-slate-500 tabular-nums">/ {formatTime(duration)}</span>
                        </div>
                    </div>
                    <div
                        ref={trackRef}
                        className="h-1.5 bg-slate-900 rounded-full relative cursor-pointer group"
                        onClick={handleScrub}
                    >
                        {/* Scrubber Base */}
                        <div className="absolute inset-0 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600/10 w-full" />
                        </div>

                        {/* Progress */}
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"
                            style={{ width: `${progress}%` }}
                        />

                        {/* Handle */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-2xl transition-transform duration-200 border-2 border-blue-600 z-20"
                            style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 shrink-0 z-10">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded transition-all border border-white/5">
                        1280p
                        <ChevronDown size={10} />
                    </button>

                    <button className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded shadow-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 group">
                        <Video size={12} className="group-hover:rotate-12 transition-transform" />
                        Generate video
                    </button>

                    <div className="w-px h-6 bg-white/10 mx-2" />

                    <button className="text-slate-500 hover:text-white transition-colors"><Settings size={16} /></button>
                    <button className="text-slate-500 hover:text-white transition-colors"><Maximize size={16} /></button>
                </div>
            </div>

            {/* Graph Toolbar */}
            <div className="h-8 bg-[#0f1115] border-b border-white/5 flex items-center px-4 gap-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] overflow-x-auto scrollbar-hide">
                <button className="text-blue-400 border-b-2 border-blue-500 h-full px-2">Speed (KPH)</button>
                <button className="hover:text-white transition-colors h-full px-2">Altitude (M)</button>
                <button className="hover:text-white transition-colors h-full px-2 text-rose-500/70">G-Force (XY)</button>
                <button className="hover:text-white transition-colors h-full px-2 text-emerald-500/70">Lean Angle</button>
                <button className="hover:text-white transition-colors h-full px-2 text-amber-500/70">RPM / Engine</button>
            </div>

            {/* Graph Area */}
            <div
                className="flex-1 bg-black/60 relative overflow-hidden flex items-end group cursor-crosshair"
                onClick={handleScrub}
            >
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-5 pointer-events-none">
                    {[...Array(4)].map((_, i) => <div key={i} className="w-full h-px bg-white" />)}
                </div>

                {/* Scrubber Background Line */}
                <div className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 shadow-[0_0_10px_rgba(59,130,246,0.8)]" style={{ left: `${progress}%` }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-xl" />
                </div>

                {/* SVG Graph (Simplified Mock Path) */}
                <svg className="w-full h-full pl-0 pb-0" preserveAspectRatio="none" viewBox="0 0 500 100">
                    <defs>
                        <linearGradient id="graphGradientFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,90 Q50,20 100,60 T200,30 T300,70 T400,20 T500,80 L500,100 L0,100 Z"
                        fill="url(#graphGradientFill)"
                    />
                    <path
                        d="M0,90 Q50,20 100,60 T200,30 T300,70 T400,20 T500,80"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    )
}
