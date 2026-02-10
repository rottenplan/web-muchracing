'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    Settings,
    Maximize2,
    MapPin,
    BarChart3,
    Activity,
    Thermometer,
    Zap,
    Gauge
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

interface DataModeViewProps {
    session: any;
    selectedLaps: number[];
}

export default function DataModeView({ session, selectedLaps }: DataModeViewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);

    // Process session points into chart data
    const points = session?.points || [];
    const laps = session?.laps || [];

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
            }, 100); // 10Hz playback
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentPointIndex, points.length]);

    const currentPoint = points[currentPointIndex] || {};

    // Map Telemetry Data for Charts
    const chartData = useMemo(() => {
        if (!points || points.length === 0) return [];

        // If laps are selected, we might want to overlay them. 
        // For simplicity now, let's show the whole session or selected portion.
        return points.map((p: any, i: number) => ({
            index: i,
            time: p.time,
            speed: p.speed || 0,
            rpm: p.rpm || 0,
            // Add other fields as needed
        }));
    }, [points]);

    // Format Lap Details for Table
    const lapDetails = useMemo(() => {
        if (!laps) return [];

        const bestTime = Math.min(...laps.map((l: any) => l.lapTime));

        return laps.map((l: any) => ({
            id: l.lapNumber,
            time: formatLapTime(l.lapTime),
            dist: l.distance || 0,
            speed: l.maxSpeed || 0,
            rpm: l.maxRpm || 0,
            water: l.avgWater || 0, // Assuming these fields exist or we calculate them
            egt: l.avgEgt || 0,
            gap: l.lapTime === bestTime ? '0 ms' : `+${Math.round((l.lapTime - bestTime) * 1000)} ms`,
            color: getColorForLap(l.lapNumber)
        }));
    }, [laps]);

    return (
        <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden text-white font-sans">
            {/* Header: Timer & Playback */}
            <div className="bg-[#212529] border-b border-white/5 p-4 shrink-0 shadow-lg">
                <div className="flex items-center justify-between">
                    {/* Professional Timer */}
                    <div className="flex flex-col">
                        <div className="bg-[#f0ad4e] text-black px-5 py-2 font-mono text-3xl font-black rounded shadow-[0_4px_0_0_#b07d32] tracking-widest min-w-[180px] text-center">
                            {currentPoint.time || '00:00.000'}
                        </div>
                        <span className="text-[10px] text-[#adb5bd] mt-1 font-bold uppercase tracking-tighter text-center">Waktu Telemetri</span>
                    </div>

                    {/* Playback Controls */}
                    <div className="bg-[#2c3034] rounded-lg border border-white/10 flex items-center p-1.5 gap-1 shadow-inner">
                        <ControlButton icon={<SkipBack size={18} />} title="Awal" onClick={() => setCurrentPointIndex(0)} />
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 bg-[#f0ad4e] text-black rounded-md flex items-center justify-center shadow-lg hover:bg-orange-400 transition-all active:scale-95"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <ControlButton icon={<SkipForward size={18} />} title="Akhir" onClick={() => setCurrentPointIndex(points.length - 1)} />
                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                        <ControlButton icon={<RotateCcw size={16} />} title="Reset" onClick={() => setCurrentPointIndex(0)} />
                        <ControlButton icon={<Settings size={16} />} title="Pengaturan" />
                        <ControlButton icon={<Maximize2 size={16} />} title="Layar Penuh" />
                    </div>

                    {/* Mini Map Navigation Preview */}
                    <div className="hidden lg:block w-32 h-20 bg-black/40 rounded border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-30 bg-black"></div>
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-2">
                            {/* Simple path logic if we have points */}
                            <polyline
                                points={points.slice(0, 50).map((p: any) => `${(p.lng % 0.01) * 10000},${(p.lat % 0.01) * 10000}`).join(' ')}
                                fill="none" stroke="#5bc0de" strokeWidth="2"
                            />
                        </svg>
                        <div className="absolute bottom-1 right-2 text-[8px] text-[#adb5bd] font-bold uppercase">{session.trackName || 'Sentul Circuit'}</div>
                    </div>
                </div>

                {/* Professional Data Table */}
                <div className="mt-6 border border-white/5 rounded-lg overflow-hidden shadow-2xl overflow-x-auto">
                    <div className="bg-[#2c3034] min-w-[800px] grid grid-cols-8 gap-4 px-4 py-2 font-bold text-[#adb5bd] uppercase tracking-widest text-[10px] border-b border-white/5">
                        <div className="flex items-center gap-2"><Trophy size={10} /> LAP</div>
                        <div className="flex items-center gap-2"><Gauge size={10} /> Waktu</div>
                        <div className="flex items-center gap-2"><MapPin size={10} /> Jarak</div>
                        <div className="flex items-center gap-2"><Zap size={10} /> Speed Max</div>
                        <div className="flex items-center gap-2"><Activity size={10} /> RPM Max</div>
                        <div className="flex items-center gap-2"><Thermometer size={10} /> Water</div>
                        <div className="flex items-center gap-2"><Thermometer size={10} /> EGT</div>
                        <div className="flex items-center gap-2"><BarChart3 size={10} /> Gap</div>
                    </div>

                    <div className="divide-y divide-white/5 min-w-[800px]">
                        {lapDetails.map((lap) => (
                            <div key={lap.id} className={`bg-[#212529] grid grid-cols-8 gap-4 px-4 py-2.5 font-mono items-center hover:bg-white/[0.02] transition-colors group ${selectedLaps.includes(lap.id) ? 'bg-white/[0.03]' : ''}`}>
                                <div className="text-sm font-sans font-bold flex items-center gap-2">
                                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: lap.color }}></div>
                                    <span style={{ color: lap.color }}>LAP {lap.id}</span>
                                </div>
                                <div className="text-white font-bold">{lap.time}</div>
                                <div className="flex flex-col gap-1 text-[10px] text-[#adb5bd]">
                                    <span>{lap.dist.toFixed(1)} km</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-20">
                                        <div className="h-full bg-white/40" style={{ width: `${Math.min(100, (lap.dist / 5) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] text-[#5bc0de]">
                                    <span>{lap.speed.toFixed(1)} Km/h</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-20">
                                        <div className="h-full bg-[#5bc0de]" style={{ width: `${Math.min(100, (lap.speed / 150) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] text-orange-400">
                                    <span>{lap.rpm} RPM</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-20">
                                        <div className="h-full bg-orange-400" style={{ width: `${Math.min(100, (lap.rpm / 12000) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] text-red-500">
                                    <span>{lap.water}°C</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-20">
                                        <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (lap.water / 110) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] text-yellow-400">
                                    <span>{lap.egt || 0}°C</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-20">
                                        <div className="h-full bg-yellow-400" style={{ width: `${Math.min(100, (lap.egt / 900) * 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className={`text-xs font-bold ${lap.gap === '0 ms' ? 'text-[#adb5bd]' : 'text-green-400'}`}>{lap.gap}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Analysis Charts Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#1a1a1a]">
                <AnalysisChart
                    title="Kecepatan (Km/h)"
                    data={chartData}
                    dataKey="speed"
                    color="#5bc0de"
                    unit="Km/h"
                    height={220}
                    currentIndex={currentPointIndex}
                />

                <AnalysisChart
                    title="RPM"
                    data={chartData}
                    dataKey="rpm"
                    color="#f0ad4e"
                    height={180}
                    currentIndex={currentPointIndex}
                />
            </div>
        </div>
    );
}

function ControlButton({ icon, title, onClick }: { icon: React.ReactNode; title: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-white/10 rounded-md text-[#adb5bd] hover:text-white transition-all active:bg-white/5"
            title={title}
        >
            {icon}
        </button>
    );
}

function AnalysisChart({ title, data, dataKey, color, height = 200, unit = '', currentIndex }: any) {
    return (
        <div className="bg-[#212529]/50 rounded-xl border border-white/5 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-widest">{title}</span>
            </div>
            <div style={{ height }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis dataKey="index" hide />
                        <YAxis
                            domain={['auto', 'auto']}
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={9}
                            tickFormatter={(val) => `${val}${unit ? ' ' + unit : ''}`}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                            itemStyle={{ color: color }}
                            labelStyle={{ color: '#adb5bd' }}
                            labelFormatter={() => ''}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                            isAnimationActive={false}
                        />
                        <ReferenceLine x={currentIndex} stroke="#ff4d4d" strokeWidth={1} label={{ value: 'Posisi', fill: '#ff4d4d', fontSize: 10, position: 'top' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function formatLapTime(seconds: number) {
    if (!seconds) return '00:00.000';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

function getColorForLap(index: number) {
    const colors = ['#00aced', '#ff00ff', '#00ffa2', '#f0ad4e', '#ff4d4d', '#7952b3'];
    return colors[index % colors.length];
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    )
}
