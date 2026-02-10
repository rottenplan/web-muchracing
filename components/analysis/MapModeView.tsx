'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Layers,
    Maximize,
    Play,
    Pause,
    Grid3X3,
    MousePointer2,
    Search
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet elements to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

interface MapModeViewProps {
    session: any;
    selectedLaps: number[];
}

export default function MapModeView({ session, selectedLaps }: MapModeViewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [showLayers, setShowLayers] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState('Google Satellite');

    const points = session?.points || [];
    const laps = session?.laps || [];

    // Map Layers
    const layers = {
        'Google Satellite': 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        'OpenStreetMap': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'Dark Matter': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };

    // Playback Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && currentPointIndex < points.length - 1) {
            interval = setInterval(() => {
                setCurrentPointIndex(prev => {
                    if (prev >= points.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentPointIndex, points.length]);

    const currentPoint = points[currentPointIndex] || {};

    // Process Track Path
    const trackPath = useMemo(() => {
        return points.map((p: any) => [p.lat, p.lng]);
    }, [points]);

    // Center Map
    const center = trackPath.length > 0 ? trackPath[0] : [-6.398, 106.878]; // Sentul default

    if (typeof window === 'undefined') return null;

    return (
        <div className="flex-1 relative bg-black overflow-hidden flex flex-col font-sans">
            {/* Top Toolbar Overlay */}
            <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2">
                <div className="bg-[#212529]/90 backdrop-blur-md rounded-md p-1 border border-white/10 shadow-xl flex items-center gap-2">
                    <span className="bg-[#f0ad4e] text-black px-3 py-1 text-[10px] font-black rounded uppercase tracking-widest">{selectedLayer}</span>
                    <div className="w-px h-4 bg-white/10"></div>
                    <button className="p-1.5 text-white/50 hover:text-white transition-all"><Search size={14} /></button>
                </div>
            </div>

            {/* Map Interaction Tools */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                <div className="bg-[#212529]/90 backdrop-blur-md rounded-md p-1 border border-white/10 shadow-xl flex flex-col">
                    <button className="w-8 h-8 text-white hover:bg-white/10 rounded flex items-center justify-center transition-all"><Maximize size={16} /></button>
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
                    <div className="bg-[#212529] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[150px]">
                        {Object.keys(layers).map((layer) => (
                            <button
                                key={layer}
                                onClick={() => {
                                    setSelectedLayer(layer);
                                    setShowLayers(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest transition-colors border-b border-white/5 last:border-0 ${selectedLayer === layer ? 'bg-[#5bc0de] text-white' : 'text-[#adb5bd] hover:bg-white/5 hover:text-white'}`}
                            >
                                {layer}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Layer */}
            <div className="flex-1 relative z-[1]">
                <MapContainer center={center as any} zoom={16} style={{ height: '100%', width: '100%', background: '#0a0a0a' }}>
                    <TileLayer url={(layers as any)[selectedLayer]} />

                    {trackPath.length > 0 && (
                        <Polyline
                            positions={trackPath as any}
                            color="#5bc0de"
                            weight={3}
                            opacity={0.8}
                        />
                    )}

                    {currentPoint.lat && (
                        <CircleMarker
                            center={[currentPoint.lat, currentPoint.lng]}
                            radius={8}
                            fillColor="#f0ad4e"
                            color="white"
                            weight={2}
                            fillOpacity={1}
                        >
                            <Tooltip permanent direction="top" offset={[0, -10]}>
                                <div className="bg-black/90 p-1 rounded border border-[#f0ad4e] text-[9px] font-black text-white">
                                    {currentPoint.speed?.toFixed(1) || 0} Km/h
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )}
                </MapContainer>
            </div>

            {/* Advanced Professional Scrubber */}
            <div className="h-56 bg-[#212529] border-t border-white/5 flex flex-col relative z-[1001] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                {/* Visual Telemetry Scrubber Area */}
                <div className="flex-1 relative overflow-hidden bg-black/20 group cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    setCurrentPointIndex(Math.floor(percent * points.length));
                }}>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-full h-px bg-white/5"></div>
                    </div>

                    {/* Telemetry Graph Series */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <path
                            d={`M${points.map((p: any, i: number) => `${(i / points.length) * 1000},${150 - (p.speed || 0)}`).join(' L ')}`}
                            fill="none" stroke="#5bc0de" strokeWidth="2" strokeOpacity="0.4"
                        />
                    </svg>

                    {/* Active Scrubber Line */}
                    <div className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_10px_white] z-30 transition-all duration-100" style={{ left: `${(currentPointIndex / points.length) * 100}%` }}>
                        <div className="absolute -top-1 -left-1.5 w-3 h-3 bg-white rounded-full shadow-lg"></div>

                        {/* Current Value Tooltip */}
                        <div className="absolute top-4 -left-12 bg-black/90 border border-[#5bc0de] px-2 py-1 rounded text-[10px] font-black text-[#5bc0de] shadow-xl backdrop-blur-sm whitespace-nowrap tabular-nums">
                            {currentPoint.speed?.toFixed(1) || 0} Km/h
                        </div>
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
                            <span className="text-white font-black font-mono text-sm leading-none tabular-nums">{currentPoint.time || '00:00.000'}</span>
                            <span className="text-[8px] text-[#adb5bd] font-bold uppercase tracking-tighter mt-1 tabular-nums">Status: {isPlaying ? 'BERJALAN' : 'BERHENTI'}</span>
                        </div>
                    </div>

                    {/* Timeline Markers */}
                    <div className="hidden md:flex gap-12 text-[10px] text-white/30 font-bold uppercase tracking-widest tabular-nums">
                        <span>Poin: {currentPointIndex} / {points.length}</span>
                        <span>RPM: {currentPoint.rpm || 0}</span>
                        <span>ALT: {currentPoint.alt?.toFixed(1) || 0}m</span>
                    </div>

                    {/* Total Duration/Info */}
                    <div className="flex flex-col items-end">
                        <span className="text-white/60 font-black font-mono text-xs leading-none uppercase tracking-widest">{session.name || 'Sesi Latihan'}</span>
                        <span className="text-[8px] text-[#adb5bd] font-bold uppercase tracking-tighter mt-1 italic">{session.trackName || 'Sentul Circuit'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
