'use client';

import { Activity, Clock, Gauge, Hash, Map as MapIcon } from 'lucide-react';

interface AnalysisHeaderProps {
    session: any;
    viewMode: 'data' | 'map';
    setViewMode: (mode: 'data' | 'map') => void;
}

export default function AnalysisHeader({ session, viewMode, setViewMode }: AnalysisHeaderProps) {
    const trackName = session?.trackName || "Unknown Track";
    const dateStr = session?.startTime ? new Date(session.startTime).toLocaleString('id-ID') : "Unknown Date";

    return (
        <header className="h-14 bg-[#1a1a1a] border-b border-black/20 flex items-center justify-between px-4 shrink-0">
            {/* Left: Track Info */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-white font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                        {trackName}
                        <span className="bg-[#17a2b8] text-[9px] px-1.5 py-0.5 rounded text-white hidden sm:inline-block">OFFICIAL</span>
                    </h1>
                    <div className="text-[11px] text-[#adb5bd] flex items-center gap-2">
                        <span>{dateStr}</span>
                    </div>
                </div>
            </div>

            {/* Right: View Switcher */}
            <div className="flex bg-[#212529] rounded p-0.5 border border-white/5">
                <button
                    onClick={() => setViewMode('data')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'data'
                            ? 'bg-[#E0A800] text-black shadow-sm'
                            : 'text-[#adb5bd] hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Activity size={14} />
                    <span>Data Mode</span>
                </button>
                <button
                    onClick={() => setViewMode('map')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'map'
                            ? 'bg-[#E0A800] text-black shadow-sm'
                            : 'text-[#adb5bd] hover:text-white hover:bg-white/5'
                        }`}
                >
                    <MapIcon size={14} />
                    <span>Map view</span>
                </button>
            </div>
        </header>
    );
}
