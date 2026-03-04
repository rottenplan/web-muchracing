import { useState, useRef, useEffect } from 'react';
import {
    Target,
    Activity,
    Database,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LapListSidebar from './LapListSidebar';
import SectorsTable from './SectorsTable';
import TelemetryGraph from './TelemetryGraph';

import { Lap, getBounds, normalizePoint } from '../../utils/telemetryUtils';

interface GpsAnalysisViewProps {
    telemetryData: any[];
    laps: Lap[];
}

type SubTab = 'data' | 'sectors' | 'brake';
type AnalysisMode = 'Race Mode' | 'Navigation Mode' | 'Static Mode';

export default function GpsAnalysisView({ telemetryData, laps }: GpsAnalysisViewProps) {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('sectors');
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('Navigation Mode');
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Calculate GPS Track Path
    const bounds = getBounds(telemetryData);
    const gpsPath = telemetryData.length > 0
        ? "M " + telemetryData.map(p => {
            const pos = normalizePoint(p, bounds);
            return `${pos.x} ${pos.y}`;
        }).join(" L ")
        : "";

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsModeMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">

            {/* Sub-Tabs Bar */}
            <div className="h-10 bg-slate-900 flex items-center px-2 gap-1 shrink-0 border-b border-white/5">
                <button
                    onClick={() => setActiveSubTab('data')}
                    className={`h-8 px-6 text-[11px] font-bold uppercase tracking-wider transition-all rounded-t-lg ${activeSubTab === 'data' ? 'bg-slate-950 text-blue-400 border-x border-t border-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    data View
                </button>
                <button
                    onClick={() => setActiveSubTab('sectors')}
                    className={`h-8 px-6 text-[11px] font-bold uppercase tracking-wider transition-all rounded-t-lg ${activeSubTab === 'sectors' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Sectors View
                </button>
                <button
                    onClick={() => setActiveSubTab('brake')}
                    className={`h-8 px-6 text-[11px] font-bold uppercase tracking-wider transition-all rounded-t-lg ${activeSubTab === 'brake' ? 'bg-slate-950 text-blue-400 border-x border-t border-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                    Brake View
                </button>
            </div>

            {/* Map Toolbar */}
            <div className="h-12 bg-slate-900 border-b border-white/10 flex items-center px-4 gap-6 shrink-0">
                <button className="flex items-center gap-1 p-1 px-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-all">
                    <ChevronDown size={14} className="text-slate-400" />
                </button>

                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-100 transition-colors">
                    <Target size={16} />
                    Center
                </button>

                <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 leading-none">Rotation:</span>
                        <input type="range" className="w-24 accent-blue-600 h-1 bg-slate-800 rounded-full appearance-none" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 leading-none">tilt:</span>
                        <input type="range" className="w-24 accent-blue-600 h-1 bg-slate-800 rounded-full appearance-none" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-slate-500 leading-none">Fov:</span>
                        <input type="range" className="w-24 accent-blue-600 h-1 bg-slate-800 rounded-full appearance-none" />
                    </div>
                </div>

                <div className="flex-1" />

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                        className="flex items-center gap-2 bg-white/5 p-1 px-3 rounded border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{analysisMode}</span>
                        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-200 ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isModeMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 5, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-full z-50 w-48 bg-slate-900 border border-white/10 shadow-2xl rounded-sm overflow-hidden"
                            >
                                {(['Race Mode', 'Navigation Mode', 'Static Mode'] as AnalysisMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            setAnalysisMode(mode);
                                            setIsModeMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-[12px] font-bold transition-colors ${analysisMode === mode
                                            ? 'bg-slate-800 text-blue-400 cursor-default shadow-inner'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex min-h-0 bg-slate-900 relative">

                {/* Map Area */}
                <div className="flex-1 bg-slate-950 relative overflow-hidden">
                    {/* Map Background (Using real SVG path) */}
                    <div className="absolute inset-0 p-12">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                            <path
                                d={gpsPath}
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-80 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                            />
                        </svg>
                    </div>

                    {/* Sectors Table Overlay */}
                    <SectorsTable laps={laps} />

                    {/* Track Labels */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md rounded p-4 border border-white/10 shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white text-2xl font-black italic tracking-tighter shadow-[0_0_20px_rgba(37,99,235,0.4)]">83</div>
                        <div className="flex flex-col">
                            <h3 className="text-xl font-black text-slate-100 leading-none uppercase tracking-tighter italic">Chemin d'en Hill</h3>
                            <span className="text-xs font-bold text-slate-500 -mt-0.5">40600 Biscarrosse</span>
                        </div>
                        <div className="flex items-center gap-4 ml-6 border-l border-white/10 pl-6">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-blue-400 transition-colors">
                                <input type="checkbox" className="w-3 h-3 rounded border-white/20 bg-slate-800 accent-blue-500" /> Follow
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-blue-400 transition-colors">
                                <input type="checkbox" className="w-3 h-3 rounded border-white/20 bg-slate-800 accent-blue-500" /> Position
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-blue-400 transition-colors">
                                <input type="checkbox" className="w-3 h-3 rounded border-white/20 bg-slate-800 accent-blue-500" /> Bearing
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-blue-400 transition-colors">
                                <input type="checkbox" className="w-3 h-3 rounded border-white/20 bg-slate-800 accent-blue-500" /> Info
                            </label>
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-blue-400 transition-colors">
                                <input type="checkbox" className="w-3 h-3 rounded border-white/20 bg-slate-800 accent-blue-500" /> Peaks
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Laps & Details) */}
                <LapListSidebar laps={laps} />
            </div>

            {/* Bottom Timeline & Graph Area */}
            <TelemetryGraph telemetryData={telemetryData} />

            {/* Bottom Status Bar */}
            <div className="h-8 bg-[#2d333d] flex items-center px-4 gap-4 shrink-0 border-t border-black/40">
                <span className="text-[10px] font-bold text-slate-500 flex-1">Much GPX - Analysis Edition</span>

                <button className="flex items-center gap-2 px-4 h-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-[10px] font-bold uppercase tracking-widest border-x border-black/20">
                    <Activity size={12} />
                    Synchronize device
                </button>

                <button className="flex items-center gap-2 px-4 h-full bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 text-[10px] font-bold uppercase tracking-widest border-r border-black/20">
                    <Database size={12} />
                    Open Stored sessions
                </button>
            </div>
        </div>
    );
}
