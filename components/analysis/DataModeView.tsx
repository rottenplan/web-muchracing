'use client';

import { Play, Pause, SkipBack, SkipForward, Maximize2, RotateCcw, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useState } from 'react';

// Placeholder Recharts component - in real implementation this would hold the <ResponsiveContainer>...
function MockChart({ title, color, height }: { title: string, color: string, height: number }) {
    return (
        <div className="w-full bg-[#1a1a1a] border border-white/5 relative overflow-hidden flex flex-col" style={{ height }}>
            <div className="absolute top-2 left-2 text-[10px] uppercase font-bold text-white/30 -rotate-90 origin-top-left translate-y-full">{title}</div>

            {/* Fake Graph Lines */}
            <div className="flex-1 flex items-end px-8 pb-4">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,10 Q20,2 40,15 T80,5 T100,10" fill="none" stroke={color} strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                    <path d="M0,12 Q20,5 40,18 T80,8 T100,12" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
                </svg>
            </div>

            {/* X-Axis Labels (Time or Dist) */}
            <div className="h-4 border-t border-white/5 flex justify-between px-2 text-[9px] text-white/20 font-mono">
                <span>00:00.000</span>
                <span>00:10.000</span>
                <span>00:20.000</span>
                <span>00:30.000</span>
                <span>00:40.000</span>
            </div>
        </div>
    )
}

interface DataModeViewProps {
    session: any;
    selectedLaps: number[];
}

export default function DataModeView({ session, selectedLaps }: DataModeViewProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0a] overflow-hidden">
            {/* Top Stats Banner */}
            <div className="bg-[#1a1a1a] border-b border-black/20 p-4 shrink-0">
                <div className="flex items-start justify-between">
                    {/* Timer */}
                    <div className="bg-[#E0A800] text-black px-4 py-2 font-mono text-2xl font-bold rounded shadow-lg tracking-widest min-w-[160px] text-center border-b-4 border-black/20">
                        00:20.508
                    </div>

                    {/* Playback Controls */}
                    <div className="bg-[#212529] rounded border border-white/10 flex items-center p-1 gap-1">
                        <button className="p-1 hover:bg-[#E0A800] hover:text-black rounded text-white transition-colors" title="Start"><SkipBack size={16} /></button>
                        <button className="p-1 hover:bg-[#E0A800] hover:text-black rounded text-white transition-colors" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        </button>
                        <button className="p-1 hover:bg-[#E0A800] hover:text-black rounded text-white transition-colors" title="End"><SkipForward size={16} /></button>
                        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                        <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors"><RotateCcw size={14} /></button>
                        <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors"><Settings size={14} /></button>
                        <button className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                    </div>
                </div>

                {/* Lap Data Grid */}
                <div className="mt-4 grid gap-px bg-white/5 border border-white/5 text-white text-xs">
                    <div className="bg-[#1a1a1a] grid grid-cols-7 gap-4 p-2 font-bold text-[#adb5bd] uppercase tracking-wider text-[10px]">
                        <div>Lap</div>
                        <div>Time</div>
                        <div>Distance</div>
                        <div>Speed Km/h</div>
                        <div>RPM</div>
                        <div>Water Temp</div>
                        <div>Gap</div>
                    </div>
                    {/* Rows */}
                    {[2, 4, 5].map((lapNum) => (
                        <div key={lapNum} className="bg-[#212529] grid grid-cols-7 gap-4 p-2 font-mono items-center hover:bg-white/5 transition-colors">
                            <div className="text-[#adb5bd] font-sans font-bold">LAP {lapNum}</div>
                            <div className="text-purple-400">01:02.{400 + lapNum * 10}</div>
                            <div className="text-blue-400">380.{lapNum}</div>
                            <div className="text-cyan-400">80.{lapNum} Km/h</div>
                            <div>
                                <div className="h-1 bg-gray-700 rounded-full w-16 overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{ width: `${60 + Math.random() * 30}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="h-1 bg-gray-700 rounded-full w-16 overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${40 + Math.random() * 20}%` }}></div>
                                </div>
                            </div>
                            <div className="text-green-400">+{200 + lapNum * 5} ms</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <MockChart title="Speed (Km/h)" color="#00bcd4" height={200} />
                <MockChart title="RPM" color="#e83e8c" height={150} />
                <MockChart title="Delta (ms)" color="#28a745" height={150} />
            </div>
        </div>
    );
}
