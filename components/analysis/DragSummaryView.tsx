'use client';

import { Activity, Clock, Gauge, Zap, Timer, MapPin } from 'lucide-react';

interface DragSummaryViewProps {
    session: any;
}

export default function DragSummaryView({ session }: DragSummaryViewProps) {
    const stats = session?.stats || {};

    const metrics = [
        { label: '0-60 KM/H', value: stats.time0to60, color: 'text-white', icon: <Zap size={16} className="text-white/60" /> },
        { label: '0-100 KM/H', value: stats.time0to100, color: 'text-orange-400', icon: <Activity size={16} className="text-orange-400/60" /> },
        { label: '100-200 KM/H', value: stats.time100to200, color: 'text-cyan-400', icon: <Timer size={16} className="text-cyan-400/60" /> },
    ];

    const formatSec = (val: number) => (val > 0 ? `${(val / 1000).toFixed(2)}s` : '--.--s');

    return (
        <div className="flex flex-col gap-6 p-6 overflow-y-auto scrollbar-hide">
            {/* Hero Section: 402m Result */}
            <div className="bg-[#5bc0de]/10 border border-[#5bc0de]/30 rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5bc0de] to-transparent opacity-50"></div>
                <span className="text-xs font-black uppercase tracking-widest text-[#5bc0de] mb-2 opacity-80">Primary Result</span>
                <h2 className="text-2xl font-black italic uppercase text-white mb-4">402m (1/4 Mile)</h2>
                <div className="text-7xl font-black text-yellow-400 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]">
                    {formatSec(stats.time400m)}
                </div>
            </div>

            {/* Grid: Speed Splits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-[#2c3034] border border-white/5 rounded-xl p-5 flex flex-col items-center gap-3 transition-all hover:bg-white/[0.04] hover:border-white/10 group">
                        <div className="p-2 rounded-lg bg-black/40 group-hover:scale-110 transition-transform">
                            {m.icon}
                        </div>
                        <span className="text-[10px] font-bold text-[#adb5bd] uppercase tracking-widest">{m.label}</span>
                        <div className={`text-3xl font-black font-mono ${m.color}`}>
                            {formatSec(m.value)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer: Stats Summary */}
            <div className="bg-[#212529] border border-white/5 rounded-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatItem label="Top Speed" value={`${(stats.maxSpeed || 0).toFixed(1)} km/h`} icon={<Gauge size={14} />} color="text-red-500" />
                <StatItem label="Distance" value={`${(stats.totalDistance || 0).toFixed(2)} km`} icon={<MapPin size={14} />} color="text-[#5bc0de]" />
                <StatItem label="Avg Speed" value={`${(stats.avgSpeed || 0).toFixed(1)} km/h`} icon={<Activity size={14} />} color="text-[#adb5bd]" />
                <StatItem label="Max RPM" value={`${stats.maxRpm || 0}`} icon={<Activity size={14} />} color="text-orange-400" />
            </div>
        </div>
    );
}

function StatItem({ label, value, icon, color }: { label: string, value: string, icon: any, color: string }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[9px] font-bold text-[#adb5bd] uppercase tracking-widest opacity-60">
                {icon}
                {label}
            </div>
            <div className={`text-sm font-black italic uppercase ${color}`}>{value}</div>
        </div>
    );
}
