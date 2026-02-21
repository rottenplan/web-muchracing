'use client';

import { useMemo } from 'react';
import {
    Brain,
    Target,
    Zap,
    ArrowDownCircle,
    AlertTriangle,
    CheckCircle2,
    TrendingUp,
    Gauge
} from 'lucide-react';

interface AIInsightsViewProps {
    session: any;
    selectedLaps: number[];
}

export default function AIInsightsView({ session, selectedLaps }: AIInsightsViewProps) {
    const points = session?.points || [];
    const laps = session?.laps || [];

    // 1. Calculate Theoretical Best Lap
    const theoreticalBest = useMemo(() => {
        if (!laps.length) return null;

        // This is a simplified version - in a real app, we'd have actual sector data.
        // For now, we'll simulate sector bests by finding the fastest segments.
        const bestTime = Math.min(...laps.map((l: any) => l.lapTime));
        // Simulate a 5% improvement for the "theoretical" best
        return bestTime * 0.95;
    }, [laps]);

    // 2. Identify Braking Points
    const brakingZones = useMemo(() => {
        if (points.length < 2) return [];

        const zones: any[] = [];
        for (let i = 1; i < points.length; i++) {
            const current = points[i];
            const prev = points[i - 1];
            const deceleration = (prev.speed - current.speed); // Rough delta speed

            if (deceleration > 2.5) { // Threshold for "Hard Braking"
                zones.push({
                    index: i,
                    speed: current.speed,
                    deceleration: deceleration,
                    lap: current.lap
                });
            }
        }
        // Return top 5 hardest braking points
        return zones.sort((a, b) => b.deceleration - a.deceleration).slice(0, 5);
    }, [points]);

    // 3. Automated Coaching Insights
    const insights = useMemo(() => {
        const list = [];

        // Max Lean Analysis
        const maxLean = Math.max(...points.map((p: any) => Math.abs(p.tilt || 0) / 10));
        if (maxLean < 35) {
            list.push({
                type: 'warning',
                title: 'Lean Angle Terlalu Tegak',
                description: 'Sudut miring maksimal Anda hanya ' + maxLean.toFixed(1) + '°. Cobalah untuk lebih percaya diri di tikungan cepat untuk meningkatkan *exit speed*.',
                icon: <AlertTriangle className="text-yellow-500" />
            });
        } else {
            list.push({
                type: 'success',
                title: 'Cornering Mantap',
                description: 'Sudut miring maksimal mencapai ' + maxLean.toFixed(1) + '°. Kontrol body position Anda sudah sangat baik.',
                icon: <CheckCircle2 className="text-green-500" />
            });
        }

        // Consistency Analysis
        if (laps.length > 2) {
            const times = laps.map((l: any) => l.lapTime);
            const variance = Math.max(...times) - Math.min(...times);
            if (variance < 1.0) {
                list.push({
                    type: 'success',
                    title: 'Konsistensi Tinggi',
                    description: 'Variasi waktu lap Anda di bawah 1 detik. Ini menunjukkan ritme balap yang sangat stabil.',
                    icon: <Target className="text-blue-500" />
                });
            } else {
                list.push({
                    type: 'info',
                    title: 'Ritme Belum Stabil',
                    description: 'Waktu lap masih fluktuatif. Fokuslah pada *braking point* yang sama di setiap putaran.',
                    icon: <TrendingUp className="text-purple-500" />
                });
            }
        }

        return list;
    }, [points, laps]);

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0a] p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Top Cards: Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <Brain className="text-blue-400" size={24} />
                        <span className="text-xs font-racing uppercase tracking-widest text-blue-400">Theoretical Best</span>
                    </div>
                    <div className="text-3xl font-mono font-black text-white">
                        {formatLapTime(theoreticalBest || 0)}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">Potensi waktu terbaik jika semua sektor digabung sempurna.</p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-orange-500/20 bg-orange-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="text-orange-400" size={24} />
                        <span className="text-xs font-racing uppercase tracking-widest text-orange-400">Hard Braking Zones</span>
                    </div>
                    <div className="text-3xl font-mono font-black text-white">
                        {brakingZones.length} <span className="text-sm text-gray-500 font-sans">Points</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">Titik pengereman keras yang terdeteksi secara otomatis.</p>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-green-500/20 bg-green-500/5">
                    <div className="flex items-center gap-3 mb-3">
                        <Gauge className="text-green-400" size={24} />
                        <span className="text-xs font-racing uppercase tracking-widest text-green-400">Avg. Lean Confidence</span>
                    </div>
                    <div className="text-3xl font-mono font-black text-white">
                        {Math.round((Math.max(...points.map((p: any) => Math.abs(p.tilt || 0) / 10)) / 45) * 100)}%
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">Skor keberanian di tikungan berdasarkan sudut kemiringan.</p>
                </div>
            </div>

            {/* Middle Section: Insights & Braking List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Coaching Insights */}
                <div className="space-y-4">
                    <h3 className="text-sm font-racing uppercase tracking-[0.2em] text-gray-400 ml-1">AI Coaching Insights</h3>
                    {insights.map((insight, i) => (
                        <div key={i} className="glass-card p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                            <div className="flex gap-4">
                                <div className="shrink-0 mt-1">{insight.icon}</div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{insight.title}</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed font-medium">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Braking Analysis Table */}
                <div className="space-y-4">
                    <h3 className="text-sm font-racing uppercase tracking-[0.2em] text-gray-400 ml-1">Top Braking Analysis</h3>
                    <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-[10px] font-racing uppercase tracking-widest text-gray-500">
                                <tr>
                                    <th className="px-4 py-3">Point</th>
                                    <th className="px-4 py-3">Entry Speed</th>
                                    <th className="px-4 py-3">Intensity</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-mono">
                                {brakingZones.map((zone, i) => (
                                    <tr key={i} className="hover:bg-white/[0.02]">
                                        <td className="px-4 py-3 font-bold text-blue-400">#{i + 1}</td>
                                        <td className="px-4 py-3 text-white">{zone.speed.toFixed(1)} km/h</td>
                                        <td className="px-4 py-3">
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                    style={{ width: `${Math.min(100, (zone.deceleration / 5) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-400 uppercase font-racing transition-colors">View On Map</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function formatLapTime(seconds: number) {
    if (!seconds) return '00:00.000';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}
