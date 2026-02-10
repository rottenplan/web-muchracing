'use client';

import { useState, useMemo } from 'react';
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
    AreaChart,
    Area,
    ReferenceLine
} from 'recharts';

interface DataModeViewProps {
    session: any;
    selectedLaps: number[];
}

export default function DataModeView({ session, selectedLaps }: DataModeViewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);

    // Mock data for charts - in reality this would come from session telemetry
    const chartData = useMemo(() => {
        return Array.from({ length: 100 }).map((_, i) => ({
            time: i,
            speed: 60 + Math.sin(i / 5) * 20 + Math.random() * 5,
            rpm: 8000 + Math.sin(i / 3) * 1500 + Math.random() * 200,
            delta: Math.sin(i / 10) * 200,
            water: 85 + Math.random() * 2,
            egt: 650 + Math.random() * 10,
        }));
    }, []);

    // Mock Laps based on screenshots
    const lapDetails = [
        { id: 2, time: '01:02.405', dist: 249.3, speed: 57.8, rpm: 85, water: 72, egt: 68, gap: '+107 ms', color: '#00aced' },
        { id: 4, time: '01:02.266', dist: 250.5, speed: 56.6, rpm: 70, water: 65, egt: 55, gap: '0 ms', color: '#ff00ff' },
        { id: 5, time: '01:02.397', dist: 248.4, speed: 58.8, rpm: 92, water: 78, egt: 82, gap: '+151 ms', color: '#00ffa2' },
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#1a1a1a] overflow-hidden text-white font-sans">
            {/* Header: Timer & Playback */}
            <div className="bg-[#212529] border-b border-white/5 p-4 shrink-0 shadow-lg">
                <div className="flex items-center justify-between">
                    {/* Professional Timer */}
                    <div className="flex flex-col">
                        <div className="bg-[#f0ad4e] text-black px-5 py-2 font-mono text-3xl font-black rounded shadow-[0_4px_0_0_#b07d32] tracking-widest min-w-[180px] text-center">
                            00:13.397
                        </div>
                        <span className="text-[10px] text-[#adb5bd] mt-1 font-bold uppercase tracking-tighter">Waktu Saat Ini</span>
                    </div>

                    {/* Playback Controls */}
                    <div className="bg-[#2c3034] rounded-lg border border-white/10 flex items-center p-1.5 gap-1 shadow-inner">
                        <ControlButton icon={<SkipBack size={18} />} title="Awal" />
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-10 h-10 bg-[#f0ad4e] text-black rounded-md flex items-center justify-center shadow-lg hover:bg-orange-400 transition-all active:scale-95"
                        >
                            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <ControlButton icon={<SkipForward size={18} />} title="Akhir" />
                        <div className="w-px h-6 bg-white/10 mx-2"></div>
                        <ControlButton icon={<RotateCcw size={16} />} title="Reset" />
                        <ControlButton icon={<Settings size={16} />} title="Pengaturan" />
                        <ControlButton icon={<Maximize2 size={16} />} title="Layar Penuh" />
                    </div>

                    {/* Mini Map Navigation Preview */}
                    <div className="hidden lg:block w-32 h-20 bg-black/40 rounded border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-30 bg-[url('https://mt1.google.com/vt/lyrs=s&x=1&y=1&z=1')] bg-center bg-cover"></div>
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-2">
                            <path d="M20,50 C30,10 70,10 80,40 S 70,80 50,70 S 20,90 20,50" fill="none" stroke="#00aced" strokeWidth="4" />
                            <circle cx="20" cy="50" r="4" fill="white" />
                        </svg>
                        <div className="absolute bottom-1 right-2 text-[8px] text-[#adb5bd] font-bold uppercase">Sentul Ciruit</div>
                    </div>
                </div>

                {/* Professional Data Table */}
                <div className="mt-6 border border-white/5 rounded-lg overflow-hidden shadow-2xl">
                    <div className="bg-[#2c3034] grid grid-cols-8 gap-4 px-4 py-2 font-bold text-[#adb5bd] uppercase tracking-widest text-[10px] border-b border-white/5">
                        <div className="flex items-center gap-2"><Trophy size={10} /> LAP</div>
                        <div className="flex items-center gap-2"><Gauge size={10} /> Waktu</div>
                        <div className="flex items-center gap-2"><MapPin size={10} /> Jarak</div>
                        <div className="flex items-center gap-2"><Zap size={10} /> Kecepatan</div>
                        <div className="flex items-center gap-2"><Activity size={10} /> RPM</div>
                        <div className="flex items-center gap-2"><Thermometer size={10} /> Water</div>
                        <div className="flex items-center gap-2"><Thermometer size={10} /> EGT</div>
                        <div className="flex items-center gap-2"><BarChart3 size={10} /> Gap</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {lapDetails.map((lap) => (
                            <div key={lap.id} className="bg-[#212529] grid grid-cols-8 gap-4 px-4 py-2.5 font-mono items-center hover:bg-white/[0.02] transition-colors group">
                                <div className="text-sm font-sans font-bold flex items-center gap-2">
                                    <div className="w-1 h-4 rounded-full" style={{ backgroundColor: lap.color }}></div>
                                    <span style={{ color: lap.color }}>LAP {lap.id}</span>
                                </div>
                                <div className="text-white font-bold">{lap.time}</div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[#adb5bd]">{lap.dist} m</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-24">
                                        <div className="h-full bg-white/40" style={{ width: `${(lap.dist / 300) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-[#5bc0de]">{lap.speed} Km/h</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-24">
                                        <div className="h-full bg-[#5bc0de]" style={{ width: `${(lap.speed / 80) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-orange-400">{lap.rpm}%</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-24">
                                        <div className="h-full bg-orange-400" style={{ width: `${lap.rpm}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-red-400">{lap.water}%</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-24">
                                        <div className="h-full bg-red-400" style={{ width: `${lap.water}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-yellow-400">{lap.egt}%</span>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden w-24">
                                        <div className="h-full bg-yellow-400" style={{ width: `${lap.egt}%` }}></div>
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
                    showHeader={true}
                />

                <AnalysisChart
                    title="RPM"
                    data={chartData}
                    dataKey="rpm"
                    color="#f0ad4e"
                    height={180}
                />

                <AnalysisChart
                    title="Delta (ms)"
                    data={chartData}
                    dataKey="delta"
                    color="#10b981"
                    unit="ms"
                    height={180}
                    isArea={true}
                />
            </div>
        </div>
    );
}

function ControlButton({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <button
            className="p-2 hover:bg-white/10 rounded-md text-[#adb5bd] hover:text-white transition-all active:bg-white/5"
            title={title}
        >
            {icon}
        </button>
    );
}

function AnalysisChart({ title, data, dataKey, color, height = 200, unit = '', isArea = false, showHeader = false }: any) {
    return (
        <div className="bg-[#212529]/50 rounded-xl border border-white/5 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-widest">{title}</span>
                {showHeader && (
                    <div className="flex gap-4 text-[10px] font-mono">
                        <span className="text-[#00aced]">Lap 2: 57.8</span>
                        <span className="text-[#ff00ff]">Lap 4: 56.6</span>
                        <span className="text-[#00ffa2]">Lap 5: 58.8</span>
                    </div>
                )}
            </div>
            <div style={{ height }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="time"
                            hide
                        />
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
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <ReferenceLine x={40} stroke="#ff4d4d" strokeWidth={1} label={{ value: 'Posisi', fill: '#ff4d4d', fontSize: 10, position: 'top' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
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
