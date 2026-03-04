import { useState } from 'react';
import {
    Gauge,
    Mountain,
    Zap,
    Settings,
    Activity,
    Thermometer,
    Radio,
    Navigation2,
    Milestone,
    Play,
    RotateCcw,
    Plus
} from 'lucide-react';

interface TelemetryGraphProps {
    telemetryData: any[];
}

export default function TelemetryGraph({ telemetryData }: TelemetryGraphProps) {
    const [activeGraphs, setActiveGraphs] = useState<string[]>(['speed']);

    // Simple downsampling for the graph (max 500 points)
    const step = Math.max(1, Math.floor(telemetryData.length / 500));
    const plotData = telemetryData.filter((_, i) => i % step === 0);

    const maxSpeed = Math.max(...plotData.map(p => p.speed)) || 100;

    const speedPath = plotData.length > 0
        ? "M " + plotData.map((p, i) => {
            const x = (i / (plotData.length - 1)) * 1000;
            const y = 100 - (p.speed / maxSpeed) * 100;
            return `${x} ${y}`;
        }).join(" L ")
        : "";

    const toggleGraph = (id: string) => {
        if (activeGraphs.includes(id)) {
            setActiveGraphs(activeGraphs.filter(g => g !== id));
        } else {
            setActiveGraphs([...activeGraphs, id]);
        }
    };

    const graphOptions = [
        { id: 'speed', label: 'Speed', icon: <Gauge size={12} /> },
        { id: 'elevation', label: 'Elevation', icon: <Mountain size={12} /> },
        { id: 'rpm', label: 'Rpm', icon: <Zap size={12} /> },
        { id: 'gear', label: 'Gear', icon: <Settings size={12} /> },
        { id: 'heartrate', label: 'HeartRate', icon: <Activity size={12} /> },
        { id: 'temp', label: 'Temperature', icon: <Thermometer size={12} /> },
        { id: 'cadency', label: 'Cadency', icon: <Radio size={12} /> },
        { id: 'distance', label: 'Distance', icon: <Milestone size={12} /> },
        { id: 'pace', label: 'Race Pace', icon: <Navigation2 size={12} /> },
    ];

    return (
        <div className="h-64 bg-slate-950 border-t border-white/10 flex flex-col shrink-0 select-none">

            {/* Playback Controls & Graph Selector */}
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 bg-slate-900">
                <div className="flex items-center gap-1 border-r border-white/10 pr-4">
                    <span className="text-[12px] font-mono font-black text-slate-100 tracking-tighter w-16">00:00.000</span>
                    <button className="p-1 hover:bg-white/5 rounded group"><Play size={16} className="fill-blue-400 text-blue-400 group-hover:scale-110 transition-transform" /></button>

                    <div className="h-5 w-40 bg-slate-950 border border-white/10 rounded relative mx-2 overflow-hidden shadow-inner">
                        <div className="absolute top-0 bottom-0 left-0 w-1/4 bg-blue-500/30 border-r border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                    </div>

                    <div className="flex gap-0.5">
                        <button className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors"><RotateCcw size={14} className="scale-x-[-1]" /></button>
                        <button className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors"><RotateCcw size={14} /></button>
                    </div>
                </div>

                {/* Graph Toggles */}
                <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                    {graphOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => toggleGraph(opt.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all border ${activeGraphs.includes(opt.id)
                                ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                                : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                                }`}
                        >
                            {opt.icon}
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1 border-l border-white/10 pl-4">
                    <button className="p-1 bg-cyan-600/20 text-cyan-400 border border-cyan-600/30 rounded hover:bg-cyan-600/30 transition-colors"><Plus size={14} /></button>
                    <button className="h-7 bg-blue-600 text-white rounded text-[9px] font-bold px-3 uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">Lap Settings</button>
                    <button className="h-7 bg-slate-800 text-slate-300 border border-white/5 rounded text-[9px] font-bold px-4 uppercase tracking-widest hover:bg-slate-700 transition-colors">Sectors</button>
                    <button className="h-7 bg-green-600/20 text-green-400 border border-green-600/30 rounded text-[9px] font-bold px-3 uppercase tracking-widest hover:bg-green-600/30 transition-colors">Only Best</button>
                </div>
            </div>

            {/* Main Graph Area */}
            <div className="flex-1 relative p-4 bg-slate-950/50">
                {/* Y Axis Mock */}
                <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between items-end pr-2 py-4 border-r border-white/5">
                    <span className="text-[9px] font-mono text-slate-600">90</span>
                    <span className="text-[9px] font-mono text-slate-600">70</span>
                    <span className="text-[9px] font-mono text-slate-600">50</span>
                    <span className="text-[9px] font-mono text-slate-600">30</span>
                    <span className="text-[9px] font-mono text-slate-600">10</span>
                    <span className="text-[9px] font-mono text-slate-600">00</span>
                </div>

                {/* Graph Legend */}
                <div className="absolute left-1 bottom-10 -rotate-90 origin-left text-[9px] font-black text-slate-700 uppercase tracking-widest">
                    Speed [Km/h]
                </div>

                {/* Main Trace Background */}
                <div className="absolute inset-0 left-10 overflow-hidden pointer-events-none p-4">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        {[0, 20, 40, 60, 80, 100].map(p => (
                            <line key={p} x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        ))}
                        {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => (
                            <line key={p} x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                        ))}

                        {/* Trace 1 (Speed - Blue) */}
                        <path
                            d={speedPath}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            className="opacity-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-300"
                        />
                        {/* Trace 2 (RPM - Red) */}
                        <path
                            d="M 0 75 Q 60 15, 110 65 T 210 35 T 310 85 T 410 25 T 510 75 T 610 15 T 710 65 T 810 45 T 910 80 T 1010 55"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            className="opacity-30"
                        />
                        {/* Trace 3 (Lean - Green) */}
                        <path
                            d="M 0 85 Q 40 20, 90 75 T 190 45 T 290 95 T 390 35 T 490 85 T 590 25 T 690 75 T 790 55 T 890 90 T 990 65"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="1.5"
                            className="opacity-30"
                        />
                    </svg>

                    {/* Scrubber Line */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-[1px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] font-mono text-red-100 font-bold bg-red-600 px-1 border border-red-500 rounded-sm">
                            00:00.0
                        </div>
                    </div>
                </div>

                {/* X Axis Mock */}
                <div className="absolute bottom-0 left-10 right-0 h-6 flex justify-between items-center px-4 border-t border-white/5 bg-slate-900/50">
                    {[0, 10, 20, 30, 40, 50, 60].map(s => (
                        <span key={s} className="text-[9px] font-mono text-slate-600">00:{s.toString().padStart(2, '0')}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
