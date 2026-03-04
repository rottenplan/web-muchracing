import { useState } from 'react';
import {
    CheckSquare,
    Settings,
    Save,
    Trash2,
    Maximize2
} from 'lucide-react';

import { Lap, formatDuration } from '../../utils/telemetryUtils';

interface LapListSidebarProps {
    laps: Lap[];
}

export default function LapListSidebar({ laps }: LapListSidebarProps) {
    const [selectedLapIdx, setSelectedLapIdx] = useState<number>(laps.length > 0 ? laps.length - 1 : 0);
    const [activeLaps, setActiveLaps] = useState<number[]>(laps.map((_, i) => i));

    const toggleLap = (idx: number) => {
        if (activeLaps.includes(idx)) {
            setActiveLaps(activeLaps.filter(l => l !== idx));
        } else {
            setActiveLaps([...activeLaps, idx]);
        }
    };

    const colors = ['bg-blue-600', 'bg-green-500', 'bg-pink-500', 'bg-cyan-500', 'bg-yellow-500', 'bg-purple-500', 'bg-lime-500', 'bg-red-500', 'bg-blue-800', 'bg-green-600'];

    const displayLaps = laps.length > 0 ? laps.map((lap, i) => ({
        idx: i,
        num: lap.number,
        time: formatDuration(lap.duration),
        color: colors[i % colors.length]
    })) : [
        { idx: 0, num: 1, time: 'No Laps Detected', color: 'bg-slate-400' }
    ];

    const selectedLap = laps[selectedLapIdx];

    return (
        <div className="w-64 bg-slate-900 border-l border-white/10 flex flex-col shrink-0 select-none">

            {/* Track Details Header */}
            <div className="h-8 bg-slate-950 flex items-center px-3 gap-2 shrink-0 border-l border-white/10 border-b border-white/5">
                <CheckSquare size={14} className="text-blue-400" />
                <span className="flex-1 text-[10px] font-black uppercase text-slate-100 italic tracking-tighter">Track details</span>
                <div className="flex items-center gap-1.5 opacity-60">
                    <Save size={14} className="text-slate-400 hover:text-white transition-colors" />
                    <Trash2 size={14} className="text-slate-400 hover:text-white transition-colors" />
                    <Settings size={14} className="text-slate-400 hover:text-white transition-colors" />
                    <Maximize2 size={14} className="text-slate-400 hover:text-white transition-colors" />
                </div>
            </div>

            {/* Lap List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/50">
                {displayLaps.map((lap) => (
                    <div
                        key={lap.idx}
                        onClick={() => setSelectedLapIdx(lap.idx)}
                        className={`flex items-center gap-2 px-2 py-1.5 border-b border-white/5 cursor-pointer transition-colors ${selectedLapIdx === lap.idx ? 'bg-blue-600/20 shadow-inner' : 'hover:bg-white/5'}`}
                    >
                        <input
                            type="checkbox"
                            checked={activeLaps.includes(lap.idx)}
                            onChange={(e) => { e.stopPropagation(); toggleLap(lap.idx); }}
                            className="w-3 h-3 rounded border-white/20 bg-slate-800 accent-blue-500"
                        />
                        <div className={`w-3 h-3 rounded-sm ${lap.color} shadow-sm`} />
                        <span className={`text-[10px] font-bold uppercase tracking-tighter shrink-0 w-12 ${selectedLapIdx === lap.idx ? 'text-blue-400' : 'text-slate-400'}`}>LAP {lap.num}</span>
                        <span className="text-[10px] font-mono text-slate-500">- {lap.time}</span>
                    </div>
                ))}
            </div>

            {/* Selected Lap Stats */}
            <div className="bg-slate-950/80 backdrop-blur-md p-3 text-white border-y border-white/10">
                <div className="flex flex-col mb-2">
                    <span className="text-[11px] font-black uppercase italic tracking-tighter text-blue-400">LAP {selectedLap?.number || 1}</span>
                    <span className="text-[9px] font-bold text-slate-500">2026-02-24 09.23.05</span>
                </div>
                <div className="space-y-0.5">
                    <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Max Speed:</span>
                        <span className="text-[11px] font-black italic text-slate-100">{selectedLap?.maxSpeed.toFixed(2) || '0.00'} km/h</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Min Speed:</span>
                        <span className="text-[11px] font-black italic text-slate-100">{selectedLap?.minSpeed.toFixed(2) || '0.00'} km/h</span>
                    </div>
                    <div className="flex justify-between items-center text-green-400">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Avg Speed:</span>
                        <span className="text-[11px] font-black italic underline underline-offset-2 decoration-green-500/50">
                            {(selectedLap ? (selectedLap.distance / (selectedLap.duration / 3600)) / 1000 : 0).toFixed(2)} km/h
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Distance:</span>
                        <span className="text-[11px] font-black italic text-slate-100">{selectedLap?.distance.toFixed(2) || '0.00'} m</span>
                    </div>
                </div>
            </div>

            {/* Property Editor */}
            <div className="h-48 overflow-y-auto bg-slate-900 border-t border-white/10">
                <div className="bg-slate-950 px-2 py-0.5 border-b border-white/5">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Property / Value</span>
                </div>

                {/* Section: Speed */}
                <div className="bg-white/5 px-2 py-0.5 border-b border-white/5 flex items-center justify-between">
                    <ChevronIcon />
                    <span className="flex-1 text-[9px] font-black uppercase text-slate-500 tracking-tighter ml-1">Speed Unit Properties</span>
                </div>
                <PropertyRow label="Speed Source" value="Km/h" />
                <PropertyRow label="Speed Display" value="Km/h" />

                {/* Section: Distance */}
                <div className="bg-white/5 px-2 py-0.5 border-b border-white/5 flex items-center justify-between">
                    <ChevronIcon />
                    <span className="flex-1 text-[9px] font-black uppercase text-slate-500 tracking-tighter ml-1">Distance Unit Properties</span>
                </div>
                <PropertyRow label="Distance Source" value="Meter" />
                <PropertyRow label="Distance Display" value="Meter" />

                {/* Section: Map */}
                <div className="bg-white/5 px-2 py-0.5 border-b border-white/5 flex items-center justify-between">
                    <ChevronIcon />
                    <span className="flex-1 text-[9px] font-black uppercase text-slate-500 tracking-tighter ml-1">Map Properties</span>
                </div>
                <PropertyRow label="Map Provider" value="GoogleSatellite" />
                <PropertyRow label="Track width" value="Auto" />
                <PropertyRow label="Trace filter" value="Kalman filter" />
            </div>
        </div>
    );
}

function PropertyRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid grid-cols-2 border-b border-white/5 text-[10px]">
            <div className="px-5 py-1 border-r border-white/5 text-slate-500 font-bold tracking-tighter overflow-hidden truncate">{label}</div>
            <div className="px-2 py-1 text-slate-300 font-bold tracking-tight bg-white/5">{value}</div>
        </div>
    );
}

function ChevronIcon() {
    return (
        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" className="text-slate-500"><path d="M7 10l5 5 5-5z" /></svg>
    );
}
