import React from 'react';
import { Mountain } from 'lucide-react';

interface AltitudeProps {
    altitude?: number;
}

export default function AltitudeWidget({ altitude = 0 }: AltitudeProps) {
    return (
        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl min-w-[160px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Mountain size={20} />
            </div>

            <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Altitude</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-data font-black text-white tabular-nums">
                        {altitude.toFixed(0)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">m</span>
                </div>
            </div>
        </div>
    );
}
