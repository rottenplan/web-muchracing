'use client';

import { useState } from 'react';
import {
    Layers,
    Maximize,
    Play,
    Pause,
    ChevronLeft,
    ChevronRight,
    Map as MapIcon,
    Satellite,
    Grid3X3,
    MousePointer2,
    Search
} from 'lucide-react';

export default function MapModeView() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showLayers, setShowLayers] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState('Google');

    const mapLayers = ['Google', 'Bing', 'ESRI', 'Black', 'White'];

    return (
        <div className="flex-1 relative bg-black overflow-hidden flex flex-col font-sans">
            {/* Top Toolbar Overlay */}
            <div className="absolute top-4 left-4 z-[40] flex items-center gap-2">
                <button className="bg-[#f0ad4e] text-black px-4 py-2 text-xs font-black rounded shadow-[0_4px_0_0_#b07d32] flex items-center gap-2 uppercase tracking-widest hover:bg-orange-400 transition-all active:translate-y-0.5 active:shadow-none">
                    <Grid3X3 size={14} /> Data Mode
                </button>

                <div className="flex bg-[#212529]/80 backdrop-blur-md rounded-md p-1 border border-white/5 shadow-xl">
                    <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all"><Search size={16} /></button>
                    <button className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded transition-all"><MousePointer2 size={16} /></button>
                </div>
            </div>

            {/* Map Interaction Tools */}
            <div className="absolute top-4 right-4 z-[40] flex flex-col gap-2">
                <div className="bg-[#212529]/80 backdrop-blur-md rounded-md p-1 border border-white/5 shadow-xl flex flex-col">
                    <button className="w-8 h-8 text-white hover:bg-white/10 rounded flex items-center justify-center transition-all"><Maximize size={16} /></button>
                    <div className="h-px bg-white/5 mx-1 my-1"></div>
                    <button className="w-8 h-8 text-white hover:bg-white/10 rounded flex items-center justify-center font-black transition-all">+</button>
                    <button className="w-8 h-8 text-white hover:bg-white/10 rounded flex items-center justify-center font-black transition-all">-</button>
                    <div className="h-px bg-white/5 mx-1 my-1"></div>
                    <button
                        onClick={() => setShowLayers(!showLayers)}
                        className={`w-8 h-8 rounded flex items-center justify-center transition-all ${showLayers ? 'bg-[#5bc0de] text-white' : 'text-white hover:bg-white/10'}`}
                    >
                        <Layers size={16} />
                    </button>
                </div>

                {/* Layer Picker Dropdown */}
                {showLayers && (
                    <div className="bg-[#212529] border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-2 duration-200">
                        {mapLayers.map((layer) => (
                            <button
                                key={layer}
                                onClick={() => {
                                    setSelectedLayer(layer);
                                    setShowLayers(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors border-b border-white/5 last:border-0 ${selectedLayer === layer ? 'bg-[#5bc0de] text-white' : 'text-[#adb5bd] hover:bg-white/5 hover:text-white'}`}
                            >
                                {layer}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Layer (Styled Placeholder) */}
            <div className="flex-1 bg-[#0f1510] relative">
                {/* 3D Satellite Map Effect */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=2000')] bg-cover bg-center mix-blend-luminosity brightness-[0.4] contrast-[1.2] grayscale-[0.5]"
                    style={{ transform: 'perspective(1000px) rotateX(20deg) scale(1.2)', transformOrigin: 'bottom' }}
                ></div>

                {/* Track Path Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(91,192,222,0.8)]" style={{ transform: 'perspective(1000px) rotateX(20deg) scale(1.1)', transformOrigin: 'bottom' }}>
                    <path
                        d="M200,600 C300,200 800,200 1000,400 T 800,800 T 400,700 T 200,600"
                        fill="none"
                        stroke="#5bc0de"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="opacity-80"
                    />
                    {/* Heat Map Points */}
                    <path d="M200,600 L300,450" stroke="#ff4d4d" strokeWidth="8" strokeOpacity="0.6" strokeLinecap="round" />
                    <path d="M500,250 L700,250" stroke="#10b981" strokeWidth="8" strokeOpacity="0.6" strokeLinecap="round" />

                    {/* Active Position Indicator */}
                    <circle cx="500" cy="250" r="10" fill="#f0ad4e" stroke="white" strokeWidth="3" className="shadow-2xl animate-pulse" />
                    <text x="520" y="240" fill="white" className="text-[12px] font-black italic drop-shadow-md">85.2 Km/h</text>
                </svg>

                {/* Satellite Label */}
                <div className="absolute bottom-52 left-4 text-[10px] text-white/30 font-bold tracking-widest uppercase">
                    Pemandangan Satelit Aktif: {selectedLayer}
                </div>
            </div>

            {/* Advanced Professional Scrubber */}
            <div className="h-56 bg-[#212529] border-t border-white/5 flex flex-col relative z-[50] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                {/* Visual Telemetry Scrubber Area */}
                <div className="flex-1 relative overflow-hidden bg-black/20 group">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-px bg-white/5"></div>
                    </div>

                    {/* Fake Mini Graph Series */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0,80 L50,75 L100,90 L150,60 L200,100 L250,40 L300,85 L350,70 L400,110 L450,55 L500,95 L550,65 L600,105 L650,45 L700,90 L750,70 L800,115 L850,50 L900,95 L1000,75" fill="none" stroke="#5bc0de" strokeWidth="2" strokeOpacity="0.4" />
                        <path d="M0,100 L50,90 L100,110 L150,80 L200,120 L250,60 L300,105 L350,90 L400,130 L450,75 L500,115 L550,85 L600,125 L650,65 L700,110 L750,90 L800,135 L850,70 L900,115 L1000,95" fill="none" stroke="#ff00ff" strokeWidth="1.5" strokeOpacity="0.3" />
                    </svg>

                    {/* Active Scrubber Line */}
                    <div className="absolute top-0 bottom-0 left-[45%] w-px bg-white shadow-[0_0_10px_white] z-30">
                        <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rounded-full shadow-lg"></div>

                        {/* Current Value Tooltip */}
                        <div className="absolute top-4 -left-12 bg-black/90 border border-[#5bc0de] px-2 py-1 rounded text-[10px] font-black text-[#5bc0de] shadow-xl backdrop-blur-sm whitespace-nowrap">
                            85.2 Km/h
                        </div>
                    </div>

                    {/* Scrubber Interaction Bar */}
                    <div className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/10"></div>
                    </div>
                </div>

                {/* Timeline Controls */}
                <div className="h-14 bg-[#1a1a1a] flex items-center px-6 justify-between border-t border-white/5">
                    {/* Start Play/Time */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-[#5bc0de] text-white hover:scale-105'}`}
                        >
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-white font-black font-mono text-sm leading-none tabular-nums">00:13.397</span>
                            <span className="text-[8px] text-[#adb5bd] font-bold uppercase tracking-tighter mt-1">Status: {isPlaying ? 'BERJALAN' : 'BERHENTI'}</span>
                        </div>
                    </div>

                    {/* Timeline Markers */}
                    <div className="hidden md:flex gap-12 text-[10px] text-white/30 font-bold uppercase tracking-widest tabular-nums">
                        <span className="hover:text-white/60 cursor-pointer transition-colors">00:00.000</span>
                        <span className="hover:text-white/60 cursor-pointer transition-colors">00:10.000</span>
                        <span className="hover:text-white/60 cursor-pointer transition-colors">00:20.000</span>
                        <span className="hover:text-white/60 cursor-pointer transition-colors">00:30.000</span>
                    </div>

                    {/* Total Duration */}
                    <div className="flex flex-col items-end">
                        <span className="text-white/60 font-black font-mono text-sm leading-none tabular-nums">01:02.405</span>
                        <span className="text-[8px] text-[#adb5bd] font-bold uppercase tracking-tighter mt-1">Durasi Total</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
