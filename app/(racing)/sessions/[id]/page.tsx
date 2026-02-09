'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { ChevronLeft, Share2, Download, Clock, Zap, MapPin, Gauge, Activity, Maximize2, Layout } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import SessionMapWrapper from '@/components/SessionMapWrapper';
import LapSummaryTable from '@/components/LapSummaryTable';

interface SessionData {
  _id: string;
  name: string;
  startTime: string;
  stats: {
    maxSpeed: number;
    avgSpeed: number;
    maxRpm: number;
    totalDistance: number;
    lapCount?: number;
    bestLap?: number;
  };
  points: {
    time: string;
    speed: number;
    rpm: number;
    lat: number;
    lng: number;
  }[];
  laps: {
    lapNumber: number;
    lapTime: number;
    pointIndex: number;
    valid: boolean;
  }[];
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedLapIdx, setSelectedLapIdx] = useState<number>(-1);
  const [compareLapIdx, setCompareLapIdx] = useState<number>(-1);
  const [viewMode, setViewMode] = useState<'standard' | 'map'>('standard');

  useEffect(() => {
    fetch(`/api/sessions/${resolvedParams.id}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setSession(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resolvedParams.id]);

  // Enhanced Lap Data with Stats
  const enhancedLaps = useMemo(() => {
    if (!session) return [];
    return (session.laps || []).map((lap, idx) => {
      const start = idx === 0 ? 0 : session.laps[idx - 1].pointIndex + 1;
      const end = lap.pointIndex;
      const points = session.points.slice(start, end + 1);

      return {
        ...lap,
        maxSpeed: points.length > 0 ? Math.max(...points.map(p => p.speed || 0)) : 0,
        maxRpm: points.length > 0 ? Math.max(...points.map(p => p.rpm || 0)) : 0,
        distance: points.length * 10, // Rough estimate if missing
      };
    });
  }, [session]);

  const currentPoint = session?.points[currentIdx] || { speed: 0, rpm: 0, time: '', lat: 0, lng: 0 };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && session && currentIdx < session.points.length - 1) {
      interval = setInterval(() => {
        setCurrentIdx(prev => {
          let next = prev + 1;
          if (selectedLapIdx !== -1 && session.laps[selectedLapIdx]) {
            const start = selectedLapIdx === 0 ? 0 : session.laps[selectedLapIdx - 1].pointIndex + 1;
            const end = session.laps[selectedLapIdx].pointIndex;
            if (next > end) next = start;
          } else {
            if (next >= session.points.length - 1) {
              setIsPlaying(false);
              return prev;
            }
          }
          return next;
        });
      }, 100 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, session, currentIdx, playbackSpeed, selectedLapIdx]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#ef4444] border-t-transparent rounded-full animate-spin" />
          <p className="font-serif tracking-widest text-[#525252] text-xs uppercase">Initializing Race Data...</p>
        </div>
      </div>
    );
  }

  if (!session || !session.points) return null;

  const getLapPoints = (lapIdx: number) => {
    if (!session || lapIdx === -1) return [];
    const start = lapIdx === 0 ? 0 : session.laps[lapIdx - 1].pointIndex + 1;
    const end = session.laps[lapIdx].pointIndex;
    return session.points.slice(start, end + 1).map((p, i) => ({
      ...p,
      relTime: i * 0.1,
    }));
  };

  const chartData = selectedLapIdx === -1 ? session.points : getLapPoints(selectedLapIdx);
  const compareData = compareLapIdx !== -1 ? getLapPoints(compareLapIdx) : [];

  const mergedChartData = chartData.map((p, i) => {
    const d: any = { ...p };
    d.relIndex = i;
    if (compareData[i]) {
      d.speedCompare = compareData[i].speed;
      d.rpmCompare = compareData[i].rpm;
      d.delta = (p.speed || 0) - (compareData[i].speed || 0);
    }
    return d;
  });

  const syncX = selectedLapIdx === -1 ? currentIdx : (currentIdx - (selectedLapIdx === 0 ? 0 : session.laps[selectedLapIdx - 1].pointIndex + 1));

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      {/* Header */}
      <header className="bg-[#050505] border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition">
              <ChevronLeft className="w-6 h-6 text-[#ef4444]" />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic text-white leading-none">{session.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.5 rounded italic">RC-ENGINEER</span>
                <span className="text-[#525252] text-[10px] font-mono">{new Date(session.startTime).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Playback Mini Controls in Header */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <button onClick={() => setIsPlaying(!isPlaying)} className="text-[#ef4444]">
                {isPlaying ? <div className="flex gap-1"><div className="w-1 h-3 bg-current"></div><div className="w-1 h-3 bg-current"></div></div> : <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-current border-b-[6px] border-b-transparent"></div>}
              </button>
              <span className="text-[10px] font-mono text-[#525252]">{Math.floor(currentIdx / 10)}s / {Math.floor(session.points.length / 10)}s</span>
            </div>

            <button onClick={() => setViewMode(viewMode === 'standard' ? 'map' : 'standard')} className="p-2 bg-white/5 border border-white/5 rounded-full text-[#a3a3a3] hover:text-white">
              {viewMode === 'standard' ? <Maximize2 className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
            </button>
            <a href={`/api/sessions/${resolvedParams.id}/gpx`} className="p-2 bg-[#ef4444]/10 text-[#ef4444] rounded-full hover:bg-[#ef4444] hover:text-white transition" download>
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {viewMode === 'standard' ? (
          <>
            {/* Lap Summary Explorer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black tracking-widest uppercase text-[#525252]">LAP EXPLORER SYSTEM</h2>
                <button onClick={() => setSelectedLapIdx(-1)} className={`text-[10px] font-bold px-3 py-1 rounded-full border transition ${selectedLapIdx === -1 ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-white/5 text-[#a3a3a3] border-white/5'}`}>FULL SESSION</button>
              </div>
              <LapSummaryTable
                laps={enhancedLaps}
                selectedLapIdx={selectedLapIdx}
                onSelectLap={(idx) => {
                  setSelectedLapIdx(idx);
                  const start = idx === 0 ? 0 : (session.laps?.[idx - 1]?.pointIndex || 0) + 1;
                  setCurrentIdx(start);
                  setIsPlaying(false);
                }}
                bestLap={session.stats?.bestLap || 0}
              />
            </div>

            {/* Main Data Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Visualizer Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl h-[300px] relative overflow-hidden shadow-2xl">
                  <SessionMapWrapper
                    points={session.points}
                    currentIdx={currentIdx}
                    lapMarkers={session.laps.map(l => l.pointIndex)}
                  />
                  <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase text-white tracking-widest">Live Track Explorer</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ProStatCard label="Live Speed" value={(currentPoint.speed || 0).toFixed(1)} unit="KMH" icon={<Gauge className="w-3 h-3 text-[#ef4444]" />} />
                  <ProStatCard label="Live RPM" value={Math.round(currentPoint.rpm || 0).toString()} unit="RPM" icon={<Activity className="w-3 h-3 text-blue-400" />} />
                </div>
              </div>

              {/* Telemetry Column */}
              <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[10px] font-black tracking-widest text-[#ef4444] uppercase italic">Stacked Telemetry Analysis</h2>
                    {compareLapIdx !== -1 && (
                      <span className="text-[9px] font-bold text-white bg-white/10 px-2 py-0.5 rounded uppercase">Comparison Active</span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-[#525252]">SYNCED AT 10HZ</div>
                </div>

                <div className="space-y-4">
                  <StackedChartBlock title="SPEED" height={160} data={mergedChartData} dataKey="speed" compareKey="speedCompare" color="#ef4444" syncIdx={syncX} />
                  <StackedChartBlock title="RPM" height={120} data={mergedChartData} dataKey="rpm" color="#3b82f6" syncIdx={syncX} />
                  {compareLapIdx !== -1 && (
                    <StackedChartBlock title="DELTA (DIFF)" height={100} data={mergedChartData} dataKey="delta" color="#ffffff" syncIdx={syncX} isDelta />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Pro Map View */
          <div className="h-[calc(100vh-180px)] bg-[#0a0a0a] rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
            <SessionMapWrapper
              points={session.points}
              currentIdx={currentIdx}
              lapMarkers={session.laps.map(l => l.pointIndex)}
            />
            <div className="absolute bottom-6 left-6 right-6 h-32 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex gap-6 shadow-2xl">
              <div className="flex flex-col justify-center items-center w-32 border-r border-white/10 pr-6">
                <span className="text-[10px] font-bold text-[#ef4444] italic uppercase">Lap {selectedLapIdx !== -1 ? session.laps[selectedLapIdx].lapNumber : '--'}</span>
                <span className="text-3xl font-black italic tracking-tighter text-white">{(currentPoint.speed || 0).toFixed(0)}</span>
                <span className="text-[10px] text-[#525252] font-black uppercase">KM/H</span>
              </div>
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mergedChartData}>
                    <Area type="monotone" dataKey="speed" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.1} dot={false} isAnimationActive={false} />
                    <ReferenceLine x={syncX} stroke="#fff" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Playback Bar */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 py-4 px-6 z-40">
        <div className="container mx-auto flex items-center gap-6">
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 flex items-center justify-center bg-[#ef4444] text-white rounded-full shadow-lg shadow-[#ef4444]/20 hover:scale-105 transition-all">
            {isPlaying ? <div className="flex gap-1.5"><div className="w-1.5 h-5 bg-current rounded-full"></div><div className="w-1.5 h-5 bg-current rounded-full"></div></div> : <div className="ml-1 w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-current border-b-[10px] border-b-transparent"></div>}
          </button>

          <div className="flex-1 group">
            <input
              type="range"
              min={selectedLapIdx === -1 ? 0 : (selectedLapIdx === 0 ? 0 : session.laps[selectedLapIdx - 1].pointIndex + 1)}
              max={selectedLapIdx === -1 ? session.points.length - 1 : session.laps[selectedLapIdx].pointIndex}
              value={currentIdx}
              onChange={(e) => {
                setCurrentIdx(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#ef4444] hover:h-3 transition-all"
            />
          </div>

          <div className="flex items-center gap-4">
            <select value={compareLapIdx} onChange={(e) => setCompareLapIdx(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-white uppercase outline-none focus:border-[#ef4444]">
              <option value="-1">NO COMPARE</option>
              {session.laps.map((l, i) => (
                <option key={i} value={i} disabled={i === selectedLapIdx}>LAP {l.lapNumber}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 bg-white/5 rounded-lg border border-white/5 px-2 py-1">
              {[1, 2, 5, 10].map(s => (
                <button key={s} onClick={() => setPlaybackSpeed(s)} className={`px-2 py-0.5 rounded text-[9px] font-black tracking-tighter ${playbackSpeed === s ? 'bg-[#ef4444] text-white' : 'text-[#525252]'}`}>{s}X</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function ProStatCard({ label, value, unit, icon }: { label: string, value: string, unit: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 flex flex-col shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-white/5 rounded-lg">{icon}</div>
        <span className="text-[9px] font-black uppercase text-[#525252] tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black italic tracking-tighter text-white">{value}</span>
        <span className="text-[9px] font-bold text-[#525252] uppercase">{unit}</span>
      </div>
    </div>
  );
}

function StackedChartBlock({ title, height, data, dataKey, compareKey, color, syncIdx, isDelta }: {
  title: string, height: number, data: any[], dataKey: string, compareKey?: string, color: string, syncIdx: number, isDelta?: boolean
}) {
  return (
    <div className="relative group">
      <div className="absolute top-0 right-0 text-[10px] font-black italic text-[#525252] group-hover:text-[#ef4444] transition-colors">{title}</div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="relIndex" hide />
            <YAxis stroke="#333" fontSize={9} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />

            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#grad-${dataKey})`} />
            {compareKey && (
              <Line type="monotone" dataKey={compareKey} stroke="#ffffff" strokeWidth={1} strokeDasharray="4 4" dot={false} />
            )}
            {isDelta && <ReferenceLine y={0} stroke="#333" />}
            <ReferenceLine x={syncIdx} stroke="#fff" strokeWidth={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-2 rounded shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-[#525252] mb-1 uppercase tracking-widest">Live Probe</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }}></div>
            <span className="text-[11px] font-bold text-white italic capitalize">{p.name}: {(Number(p.value) || 0).toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
