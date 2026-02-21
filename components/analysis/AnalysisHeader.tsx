'use client';

import {
    Activity,
    Clock,
    Gauge,
    Hash,
    Map as MapIcon,
    Share2,
    Download,
    Printer,
    Brain,
    BarChart3,
    MapPin
} from 'lucide-react';

interface AnalysisHeaderProps {
    session: any;
    viewMode: 'data' | 'map' | 'ai';
    setViewMode: (mode: 'data' | 'map' | 'ai') => void;
}

export default function AnalysisHeader({ session, viewMode, setViewMode }: AnalysisHeaderProps) {
    const trackName = session?.trackName || "Sentul Internasional Karting Sirkuit";
    const dateStr = session?.startTime ? new Date(session.startTime).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : "Tanggal tidak diketahui";

    return (
        <header className="h-16 glass-header border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-[100] shadow-2xl">
            {/* Left: Track Info */}
            <div className="flex items-center gap-5">
                <div className="flex flex-col">
                    <h1 className="text-white font-racing text-lg uppercase tracking-wider flex items-center gap-3">
                        {trackName}
                        <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] px-2.5 py-0.5 rounded-full font-bold tracking-tighter">OFFICIAL DATA</span>
                    </h1>
                    <div className="text-[10px] text-gray-500 flex items-center gap-4 font-bold tracking-tight">
                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-blue-500/70" /> {dateStr}</span>
                        <span className="flex items-center gap-1.5 text-blue-500/70 uppercase"><MapIcon size={12} /> {session?.location || 'Circuit Layout'}</span>
                    </div>
                </div>
            </div>

            {/* Middle: Actions */}
            <div className="hidden md:flex items-center gap-3">
                <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all" title="Share"><Share2 size={18} /></button>
                <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all" title="Download"><Download size={18} /></button>
                <button className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all" title="Print"><Printer size={18} /></button>
            </div>

            {/* Right: View Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner">
                <button
                    onClick={() => setViewMode('data')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-racing transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'data' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white'}`}
                >
                    <BarChart3 size={14} /> Data Mode
                </button>
                <button
                    onClick={() => setViewMode('map')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-racing transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-gray-400 hover:text-white'}`}
                >
                    <MapPin size={14} /> Map Mode
                </button>
                <button
                    onClick={() => setViewMode('ai')}
                    className={`px-6 py-2 rounded-lg text-[10px] font-racing transition-all flex items-center gap-2 uppercase tracking-widest ${viewMode === 'ai' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-gray-400 hover:text-white'}`}
                >
                    <Brain size={14} /> AI Intelligence
                </button>
            </div>
        </header>
    );
}
