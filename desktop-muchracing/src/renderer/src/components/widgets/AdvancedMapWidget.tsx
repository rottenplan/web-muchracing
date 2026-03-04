import { Map, Zap, Gauge } from 'lucide-react';

interface AdvancedMapWidgetProps {
    speed?: number;
    peakSpeed?: number;
    minSpeed?: number;
    distance?: number;
    time?: string;
    gpsPath?: { x: number; y: number }[];
    currentPoint?: { x: number; y: number } | null;
}

export default function AdvancedMapWidget({
    speed = 0,
    peakSpeed = 0,
    minSpeed = 0,
    distance = 0,
    time = '00:00.0',
    gpsPath = [],
    currentPoint = null
}: AdvancedMapWidgetProps) {
    return (
        <div className="w-[320px] flex flex-col gap-1 font-sans">
            {/* Map Container */}
            <div className="aspect-square bg-slate-900 rounded-lg border border-white/10 overflow-hidden relative shadow-2xl">
                {/* Track Path SVG */}
                <svg className="absolute inset-0 w-full h-full p-8 overflow-visible" viewBox="0 0 100 100">
                    {/* Full Track Ghost Path */}
                    <path
                        d={gpsPath.length > 0 ? "M" + gpsPath.map(p => `${p.x},${p.y}`).join(" L") : "M20,50 Q30,20 50,20 T80,50 T50,80 T20,50"}
                        fill="none"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        className="opacity-10"
                    />

                    {/* Active Track Path (Up to current point - optional improvement) */}
                    <path
                        d={gpsPath.length > 0 ? "M" + gpsPath.map(p => `${p.x},${p.y}`).join(" L") : "M20,50 Q30,20 50,20 T80,50"}
                        fill="none"
                        stroke="rgba(59,130,246,1)"
                        strokeWidth="3"
                        className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] opacity-60"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Current Position Marker */}
                    {currentPoint && (
                        <>
                            <circle cx={currentPoint.x} cy={currentPoint.y} r="4" fill="rgba(59,130,246,1)" className="animate-pulse shadow-2xl" />
                            <circle cx={currentPoint.x} cy={currentPoint.y} r="8" fill="rgba(59,130,246,0.3)" />
                        </>
                    )}
                </svg>

                {/* Speed Overlay (Top Left inside map) */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full shadow-xl">
                    <Zap size={12} className="text-blue-400" />
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-white italic tabular-nums leading-none">{speed.toFixed(1)}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Km/h</span>
                    </div>
                    <div className="flex flex-col ml-2 pl-2 border-l border-white/10">
                        <span className="text-[7px] font-black text-emerald-400 uppercase leading-tight">+2.30 m/s²</span>
                    </div>
                </div>

                {/* Dynamic Map Label */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-40">
                    <Map size={10} className="text-white" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Satellite Source</span>
                </div>
            </div>

            {/* Stats Panel (Below Map) */}
            <div className="grid grid-cols-2 gap-1">
                {/* Left Side: Time & Dist */}
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 flex flex-col gap-1.5 shadow-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center">
                            <Gauge size={10} className="text-slate-400" />
                        </div>
                        <span className="text-sm font-black text-white italic tabular-nums">{time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center">
                            <Map size={10} className="text-slate-400" />
                        </div>
                        <span className="text-sm font-black text-white italic tabular-nums">{distance.toFixed(1)} m</span>
                    </div>
                </div>

                {/* Right Side: Speed Range */}
                <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2 flex flex-col gap-1 shadow-2xl">
                    <div className="flex items-center justify-between bg-emerald-500/10 rounded px-2 py-0.5">
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter">Speed peak</span>
                        <span className="text-[10px] font-black text-white italic">{peakSpeed} Km/h</span>
                    </div>
                    <div className="flex items-center justify-between bg-red-500/10 rounded px-2 py-0.5">
                        <span className="text-[8px] font-black text-red-400 uppercase tracking-tighter">Speed min</span>
                        <span className="text-[10px] font-black text-white italic">{minSpeed} Km/h</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
