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

import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from 'react-leaflet';

function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
    });
}

interface MapModeViewProps {
    session: any;
    selectedLaps: number[];
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentPointIndex: number;
    setCurrentPointIndex: (index: number) => void;
}

export default function MapModeView({
    session,
    selectedLaps,
    isPlaying,
    setIsPlaying,
    currentPointIndex,
    setCurrentPointIndex
}: MapModeViewProps) {
    const [showLayers, setShowLayers] = useState(false);
    const [selectedLayer, setSelectedLayer] = useState('Satellite');
    const [heatmapMode, setHeatmapMode] = useState<'none' | 'speed' | 'braking'>('speed');

    const points = useMemo(() => session?.points || [], [session?.points]);
    const laps = session?.laps || [];

    // Map Layers
    const layers: Record<string, { url: string; attribution: string }> = {
        'Satellite': {
            url: 'https://mt{s}.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
            attribution: '&copy; Google Maps'
        },
        'OpenStreetMap': {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; OpenStreetMap contributors'
        },
        'Dark Matter': {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; CartoDB'
        },
    };

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
                        {Object.keys(layers).map((layer: string) => (
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
            <div className="flex-1 relative z-[1]" style={{ height: '400px', minHeight: '400px' }}>
                <MapContainer
                    center={center as any}
                    zoom={17}
                    style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        key={selectedLayer}
                        url={layers[selectedLayer].url}
                        attribution={layers[selectedLayer].attribution}
                        subdomains={selectedLayer === 'Satellite' ? ['0', '1', '2', '3'] : ['a', 'b', 'c']}
                    />
                    <MapController center={center as [number, number]} />

                    {/* Heatmap Segments (Speed) */}
                    {useMemo(() => {
                        const segments = [];
                        for (let i = 1; i < points.length; i++) {
                            const p1 = points[i - 1];
                            const p2 = points[i];
                            // Map speed (0-160) to a color gradient (Blue -> Green -> Yellow -> Red)
                            const speed = p2.speed || 0;
                            let color = '#5bc0de'; // Default blue
                            if (speed > 120) color = '#ff4d4d'; // Red
                            else if (speed > 80) color = '#f0ad4e'; // Orange/Yellow
                            else if (speed > 40) color = '#00ffa2'; // green

                            segments.push(
                                <Polyline
                                    key={`seg-${i}`}
                                    positions={[[p1.lat, p1.lng], [p2.lat, p2.lng]] as any}
                                    color={color}
                                    weight={6}
                                    opacity={0.8}
                                />
                            );
                        }
                        return segments;
                    }, [points])}

                    {/* Ghost Laps (Selected Laps logic) */}
                    {selectedLaps.length > 1 && (
                        laps.filter((l: any) => selectedLaps.includes(l.lapNumber)).map((lap: any) => {
                            // Find points for this lap
                            const lapStartIdx = laps.indexOf(lap) === 0 ? 0 : laps[laps.indexOf(lap) - 1].pointIndex + 1;
                            const lapPoints = points.slice(lapStartIdx, lap.pointIndex + 1);
                            const path = lapPoints.map((p: any) => [p.lat, p.lng]);

                            return (
                                <Polyline
                                    key={`ghost-lap-${lap.lapNumber}`}
                                    positions={path as any}
                                    color={lap.lapNumber === 1 ? '#00aced' : '#ff00ff'} // Cycle colors
                                    weight={2}
                                    opacity={0.4}
                                    dashArray="5, 10"
                                />
                            );
                        })
                    )}

                    {currentPoint.lat && (
                        <CircleMarker
                            center={[currentPoint.lat, currentPoint.lng]}
                            radius={10}
                            fillColor="#f0ad4e"
                            color="white"
                            weight={3}
                            fillOpacity={1}
                        >
                            <Tooltip permanent direction="top" offset={[0, -15]}>
                                <div className="bg-black/90 p-1.5 rounded border border-[#f0ad4e] text-[10px] font-black text-white shadow-2xl backdrop-blur-md">
                                    {currentPoint.speed?.toFixed(1) || 0} <span className="text-[8px] text-[#adb5bd]">KM/H</span>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    )}
                </MapContainer>
            </div>

            {/* Professional Scrubber & Playback Bar */}
            <div className="bg-[#212529] border-t border-white/10 flex flex-col relative z-[1001] shadow-2xl">
                {/* Visual Scrubber */}
                <div
                    className="h-12 relative overflow-hidden bg-black/40 group cursor-pointer hover:bg-black/60 transition-colors"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percent = x / rect.width;
                        setCurrentPointIndex(Math.floor(percent * points.length));
                    }}
                >
                    {/* Telemetry Waveform (Simplified) */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <svg className="w-full h-full" preserveAspectRatio="none">
                            <path
                                d={`M${points.map((p: any, i: number) => `${(i / points.length) * 100},${48 - (p.speed / 2)}`).join(' L ')}`}
                                fill="none" stroke="#5bc0de" strokeWidth="1"
                            />
                        </svg>
                    </div>

                    {/* Progress Bar */}
                    <div
                        className="absolute top-0 bottom-0 left-0 bg-[#5bc0de]/20 border-r border-[#5bc0de] transition-all duration-100"
                        style={{ width: `${(currentPointIndex / points.length) * 100}%` }}
                    />

                    {/* Scrub Handle */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-30 pointer-events-none transition-all duration-100"
                        style={{ left: `${(currentPointIndex / points.length) * 100}%` }}
                    >
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-lg border border-black/20"></div>
                    </div>
                </div>

                {/* Control Bar */}
                <div className="h-20 bg-[#1a1a1a] flex items-center px-8 justify-between border-t border-white/5">
                    <div className="flex items-center gap-8">
                        {/* Play Button */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${isPlaying ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#5bc0de] text-white hover:bg-[#46a3bf] hover:scale-105'}`}
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        {/* Large Modern Timer */}
                        <div className="flex flex-col">
                            <div className="text-3xl font-black font-mono text-white tracking-tighter leading-none tabular-nums italic">
                                {currentPoint.time || '00:00.000'}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <span className="text-[10px] text-[#adb5bd] font-black uppercase tracking-widest">{isPlaying ? 'Live Tracking' : 'Paused'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Live Snapshot Data */}
                    <div className="flex gap-10">
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] text-[#adb5bd] font-black uppercase tracking-[0.2em] mb-1">Kecepatan</span>
                            <span className="text-xl font-black text-[#5bc0de] font-mono tabular-nums italic">{currentPoint.speed?.toFixed(1) || 0}<span className="text-[10px] ml-1 uppercase not-italic text-white/50">Km/h</span></span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] text-[#adb5bd] font-black uppercase tracking-[0.2em] mb-1">RPM</span>
                            <span className="text-xl font-black text-orange-400 font-mono tabular-nums italic">{Math.round((currentPoint.rpm || 0) / 10) * 10}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] text-[#adb5bd] font-black uppercase tracking-[0.2em] mb-1">Suhu Air</span>
                            <span className="text-xl font-black text-red-500 font-mono tabular-nums italic">{Math.round(currentPoint.water || 0)}°<span className="text-[10px] ml-0.5 uppercase not-italic text-white/50">C</span></span>
                        </div>
                    </div>

                    {/* Session Info */}
                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 italic">Sesi: {session.name || 'Latihan Sentul'}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#5bc0de] uppercase tracking-widest">{session.trackName || 'Sentul Circuit'}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                            <span className="text-[10px] text-[#adb5bd] font-bold uppercase tracking-widest">Lap {currentPoint.lapNumber || 1}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
