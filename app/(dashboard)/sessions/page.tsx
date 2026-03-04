import Link from 'next/link';
import { MapPin, Edit, Trash2, Download, Activity, History, Timer, Gauge } from 'lucide-react';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';
import GpxUploadPanel from '@/components/sessions/GpxUploadPanel';

export const dynamic = 'force-dynamic';

async function getSessions() {
    try {
        await dbConnect();
        const user = await getUserFromRequest().catch(() => null);
        if (!user) throw new Error('No user found');

        const sessions = await SessionModel.find({ userId: user._id })
            .sort({ startTime: -1 })
            .limit(100)
            .lean();

        return sessions.map((s: any) => ({
            id: s._id.toString(),
            ...s
        }));
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
}

function TypeBadge({ type }: { type: string }) {
    const isDrag = type === 'DRAG';
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${isDrag
                    ? 'bg-[#ff4500]/15 text-[#ff4500] border-[#ff4500]/30'
                    : 'bg-[#17a2b8]/15 text-[#17a2b8] border-[#17a2b8]/30'
                }`}
        >
            {isDrag ? <Gauge size={9} /> : <Timer size={9} />}
            {isDrag ? 'DRAG' : 'LAP'}
        </span>
    );
}

function BestTime({ session }: { session: any }) {
    const isDrag = session.sessionType === 'DRAG';

    if (isDrag) {
        // Show best drag metric (bestLap is repurposed as drag time in ms)
        const t = session.stats?.bestLap;
        if (!t) return <span className="text-[#adb5bd]">-</span>;
        return (
            <span className="font-mono font-black text-[#ff4500]">
                {(t / 1000).toFixed(3)}s
            </span>
        );
    } else {
        const t = session.stats?.bestLap;
        if (!t) return <span className="text-[#adb5bd]">-</span>;
        return (
            <span className="font-mono font-black text-[#5bc0de]">
                {t.toFixed(3)}s
            </span>
        );
    }
}

export default async function SessionsPage() {
    const sessions = await getSessions();

    const lapSessions = sessions.filter((s: any) => s.sessionType !== 'DRAG');
    const dragSessions = sessions.filter((s: any) => s.sessionType === 'DRAG');

    return (
        <div className="space-y-6 bg-[#1a1a1a] min-h-screen text-white p-6 font-sans">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#adb5bd] uppercase tracking-widest mb-4">
                <Link href="/dashboard" className="hover:text-[#5bc0de]">Dashboard</Link>
                <span>/</span>
                <span className="text-white">Semua Sesi</span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#212529] rounded border border-white/5 p-4 flex items-center gap-3">
                    <History size={20} className="text-[#adb5bd]" />
                    <div>
                        <p className="text-[10px] text-[#adb5bd] uppercase tracking-widest">Total Sesi</p>
                        <p className="text-2xl font-black">{sessions.length}</p>
                    </div>
                </div>
                <div className="bg-[#212529] rounded border border-[#17a2b8]/20 p-4 flex items-center gap-3">
                    <Timer size={20} className="text-[#17a2b8]" />
                    <div>
                        <p className="text-[10px] text-[#17a2b8] uppercase tracking-widest">Lap Timer</p>
                        <p className="text-2xl font-black text-[#17a2b8]">{lapSessions.length}</p>
                    </div>
                </div>
                <div className="bg-[#212529] rounded border border-[#ff4500]/20 p-4 flex items-center gap-3">
                    <Gauge size={20} className="text-[#ff4500]" />
                    <div>
                        <p className="text-[10px] text-[#ff4500] uppercase tracking-widest">Drag Meter</p>
                        <p className="text-2xl font-black text-[#ff4500]">{dragSessions.length}</p>
                    </div>
                </div>
            </div>

            {/* Sessions Table Card */}
            <div className="bg-[#212529] rounded shadow-xl overflow-hidden border border-white/5">
                <div className="bg-[#17a2b8] px-4 py-3 flex justify-between items-center shadow-lg">
                    <h2 className="text-white text-sm font-black m-0 uppercase tracking-widest flex items-center gap-2">
                        <History size={16} /> All Sessions
                    </h2>
                    <button className="text-white hover:text-white/80 transition-all" title="Download All">
                        <Download size={16} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="overflow-x-auto border border-white/5 rounded-lg bg-[#1a1a1a]">
                        <table className="w-full text-[11px] text-left border-collapse">
                            <thead>
                                <tr className="bg-[#2c3034] border-b border-white/5">
                                    <th className="p-3 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter w-12">ID</th>
                                    <th className="p-3 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter w-24">
                                        <div className="flex items-center gap-1">Tipe</div>
                                    </th>
                                    <th className="p-3 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter">Tanggal & Waktu</th>
                                    <th className="p-3 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter">Nama Sesi</th>
                                    <th className="p-3 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter text-center">Lap</th>
                                    <th className="p-3 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter text-center">Best</th>
                                    <th className="p-3 font-black text-[#6c757d] text-center uppercase tracking-tighter">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center text-[#adb5bd] font-bold uppercase tracking-widest italic opacity-50">
                                            Belum ada sesi yang tersinkronisasi.
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session: any) => {
                                        const isDrag = session.sessionType === 'DRAG';
                                        return (
                                            <tr
                                                key={session.id}
                                                className={`hover:bg-white/[0.02] transition-colors group border-l-2 ${isDrag ? 'border-l-[#ff4500]/40' : 'border-l-[#17a2b8]/40'
                                                    }`}
                                            >
                                                {/* ID */}
                                                <td className="p-3 border-r border-white/5 text-[#adb5bd] font-mono">
                                                    {session.id.slice(-4)}
                                                </td>

                                                {/* Type Badge */}
                                                <td className="p-3 border-r border-white/5">
                                                    <TypeBadge type={session.sessionType || 'TRACK'} />
                                                </td>

                                                {/* Date */}
                                                <td className="p-3 border-r border-white/5">
                                                    <Link
                                                        href={`/analysis/${session.id}`}
                                                        className={`hover:underline font-bold transition-all ${isDrag ? 'text-[#ff4500]' : 'text-[#5bc0de]'
                                                            }`}
                                                    >
                                                        {new Date(session.startTime).toLocaleString('id-ID', {
                                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </Link>
                                                </td>

                                                {/* Session Name */}
                                                <td className="p-3 border-r border-white/5">
                                                    <Link
                                                        href={`/analysis/${session.id}`}
                                                        className="text-white hover:text-[#5bc0de] font-black uppercase tracking-tighter transition-all italic"
                                                    >
                                                        {session.name || (isDrag ? 'Drag Run' : 'Sesi Latihan')}
                                                    </Link>
                                                    <div className="text-[9px] text-[#adb5bd] mt-0.5 font-bold uppercase tracking-widest opacity-60">
                                                        {session.originalFilename || '—'}
                                                    </div>
                                                </td>

                                                {/* Lap Count */}
                                                <td className="p-3 border-r border-white/5 text-center font-black text-white">
                                                    {isDrag ? (
                                                        <span className="text-[#adb5bd]">—</span>
                                                    ) : (
                                                        session.stats?.lapCount || 0
                                                    )}
                                                </td>

                                                {/* Best Time / Drag Time */}
                                                <td className="p-3 border-r border-white/5 text-center">
                                                    <BestTime session={session} />
                                                    {isDrag && (
                                                        <div className="text-[8px] text-[#ff4500]/60 uppercase tracking-widest mt-0.5">drag time</div>
                                                    )}
                                                    {!isDrag && session.stats?.bestLap && (
                                                        <div className="text-[8px] text-[#5bc0de]/60 uppercase tracking-widest mt-0.5">best lap</div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="p-3 text-center">
                                                    <div className="flex justify-center gap-1.5">
                                                        <Link
                                                            href={`/analysis/${session.id}`}
                                                            className={`px-2.5 py-1.5 rounded border flex items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-widest ${isDrag
                                                                    ? 'bg-[#ff4500]/10 hover:bg-[#ff4500] text-[#ff4500] hover:text-white border-[#ff4500]/20'
                                                                    : 'bg-[#5bc0de]/10 hover:bg-[#5bc0de] text-[#5bc0de] hover:text-white border-[#5bc0de]/20'
                                                                }`}
                                                        >
                                                            <Activity size={12} />
                                                            Analisis
                                                        </Link>
                                                        <button className="p-1.5 text-[#adb5bd] hover:text-white hover:bg-white/10 rounded transition-all">
                                                            <Edit size={12} />
                                                        </button>
                                                        <button className="p-1.5 text-[#ff4d4d]/60 hover:text-[#ff4d4d] hover:bg-white/10 rounded transition-all">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Upload */}
            <div className="mt-6 bg-[#212529] rounded shadow-xl border border-white/5 overflow-hidden">
                <div className="bg-[#5bc0de] px-4 py-2 flex items-center gap-2">
                    <Download size={14} className="text-white" />
                    <h3 className="text-white text-xs font-black uppercase tracking-widest">Sinkronisasi / Upload GPX</h3>
                </div>
                <div className="p-6 bg-black/20">
                    <GpxUploadPanel />
                </div>
            </div>
        </div>
    );
}
