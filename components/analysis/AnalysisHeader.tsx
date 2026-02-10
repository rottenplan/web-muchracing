'use client';

import { Activity, Clock, Gauge, Hash, Map as MapIcon, Share2, Download, Printer } from 'lucide-react';

interface AnalysisHeaderProps {
    session: any;
    viewMode: 'data' | 'map';
    setViewMode: (mode: 'data' | 'map') => void;
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
        <header className="h-14 bg-[#212529] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-[100] shadow-md">
            {/* Left: Track Info */}
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <h1 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2 italic">
                        {trackName}
                        <span className="bg-[#5bc0de]/20 border border-[#5bc0de]/30 text-[#5bc0de] text-[8px] px-2 py-0.5 rounded-full font-black not-italic">RESMI</span>
                    </h1>
                    <div className="text-[10px] text-[#adb5bd] flex items-center gap-3 font-bold">
                        <span className="flex items-center gap-1"><Clock size={10} /> {dateStr}</span>
                        <span className="flex items-center gap-1 text-[#5bc0de] uppercase tracking-tighter"><MapIcon size={10} /> Jawa Barat</span>
                    </div>
                </div>
            </div>

            {/* Middle: Actions */}
            <div className="hidden md:flex items-center gap-2">
                <button className="p-2 text-[#adb5bd] hover:text-[#5bc0de] hover:bg-white/5 rounded-md transition-all" title="Bagikan"><Share2 size={16} /></button>
                <button className="p-2 text-[#adb5bd] hover:text-[#5bc0de] hover:bg-white/5 rounded-md transition-all" title="Unduh"><Download size={16} /></button>
                <button className="p-2 text-[#adb5bd] hover:text-[#5bc0de] hover:bg-white/5 rounded-md transition-all" title="Cetak"><Printer size={16} /></button>
            </div>

            {/* Right: View Switcher */}
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/5 shadow-inner">
                <button
                    onClick={() => setViewMode('data')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === 'data'
                        ? 'bg-[#5bc0de] text-white shadow-lg'
                        : 'text-[#adb5bd] hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Activity size={14} />
                    <span>Mode Data</span>
                </button>
                <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === 'map'
                        ? 'bg-[#5bc0de] text-white shadow-lg'
                        : 'text-[#adb5bd] hover:text-white hover:bg-white/5'
                        }`}
                >
                    <MapIcon size={14} />
                    <span>Mode Peta</span>
                </button>
            </div>
        </header>
    );
}
