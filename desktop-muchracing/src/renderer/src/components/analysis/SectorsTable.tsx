import { motion } from 'framer-motion';

import { Lap, formatDuration, calculateSectors } from '../../utils/telemetryUtils';

interface SectorsTableProps {
    laps: Lap[];
}

export default function SectorsTable({ laps }: SectorsTableProps) {
    const displayLaps = laps.slice(0, 10).map(lap => {
        const sectors = calculateSectors(lap);
        return {
            id: lap.number.toString().padStart(2, '0'),
            s1: sectors[0]?.time || '--',
            s2: sectors[1]?.time || '--',
            s3: sectors[2]?.time || '--',
            s4: sectors[3]?.time || '--'
        };
    });

    const theoreticalBestMs = laps.length > 0 ? Array.from({ length: 4 }).reduce((sum: number, _, i) => {
        const sectorTimes = laps.map(l => {
            const secs = calculateSectors(l);
            // Rough ms conversion for calculation
            const [m, s] = secs[i].time.split(':');
            const [sec, ms] = s.split('.');
            return (parseInt(m) * 60 + parseInt(sec)) * 1000 + parseInt(ms);
        });
        return sum + Math.min(...sectorTimes);
    }, 0) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 min-w-[300px] bg-slate-950/80 backdrop-blur-md rounded-sm border border-white/10 shadow-2xl overflow-hidden pointer-events-auto"
        >
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900 text-[10px] uppercase font-black tracking-widest text-slate-500 border-b border-white/5">
                        <th className="px-3 py-1.5"></th>
                        <th className="px-3 py-1.5 text-blue-400 italic">Sector 01</th>
                        <th className="px-3 py-1.5 text-pink-500 italic">Sector 02</th>
                        <th className="px-3 py-1.5 text-purple-500 italic">Sector 03</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {displayLaps.map((row) => (
                        <tr key={row.id} className="text-[11px] font-mono tracking-tighter hover:bg-white/5 transition-colors">
                            <td className="px-3 py-1 font-bold text-blue-400 bg-white/5">{row.id}</td>
                            <td className="px-3 py-1 font-black text-slate-100">{row.s1}</td>
                            <td className="px-3 py-1 font-black text-slate-100">{row.s2}</td>
                            <td className="px-3 py-1 font-black text-slate-100">{row.s3}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-slate-900">
                        <td colSpan={4} className="px-3 py-2 text-[11px] font-black italic tracking-tighter text-slate-300">
                            Theoretical best. <span className="text-green-500 ml-2">{formatDuration(theoreticalBestMs)}</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </motion.div>
    );
}
