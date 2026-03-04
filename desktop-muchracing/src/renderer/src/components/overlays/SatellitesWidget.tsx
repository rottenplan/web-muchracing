import { Satellite } from 'lucide-react';

interface SatellitesProps {
    count?: number;
    precision?: number; // HDOP
}

export default function SatellitesWidget({ count = 0, precision = 1.0 }: SatellitesProps) {
    // Determine signal quality
    const getQuality = (dop: number) => {
        if (dop <= 1.0) return { label: 'Excellent', color: 'bg-emerald-500' };
        if (dop <= 2.0) return { label: 'Good', color: 'bg-blue-500' };
        if (dop <= 5.0) return { label: 'Moderate', color: 'bg-yellow-500' };
        return { label: 'Poor', color: 'bg-red-500' };
    };

    const quality = getQuality(precision);

    return (
        <div className="flex flex-col p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl min-w-[180px]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Satellite size={16} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">GPS Signal</span>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white shadow-lg ${quality.color}`}>
                    {quality.label}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Satellites</span>
                    <span className="text-2xl font-data font-black text-white tabular-nums leading-none">
                        {count.toString().padStart(2, '0')}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none mb-1">Precision</span>
                    <span className="text-2xl font-data font-black text-white tabular-nums leading-none italic">
                        {precision.toFixed(1)}
                    </span>
                </div>
            </div>

            {/* Visual Signal Bars */}
            <div className="mt-3 flex gap-1 h-1.5 items-end">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-full transition-all duration-500 ${i <= (count > 0 ? Math.min(5, Math.ceil(count / 4)) : 0)
                            ? quality.color
                            : 'bg-slate-800'
                            }`}
                        style={{ height: `${20 + i * 20}%` }}
                    />
                ))}
            </div>
        </div>
    );
}
