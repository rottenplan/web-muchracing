import Link from 'next/link';
import { MapPin, Edit, Trash2, ChevronLeft, ChevronRight, Search, Download, Activity, History } from 'lucide-react';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';
import GpxUploadPanel from '@/components/sessions/GpxUploadPanel';

export const dynamic = 'force-dynamic';

// Helper to get sessions
async function getSessions() {
    try {
        await dbConnect();
        const user = await getUserFromRequest().catch(() => null);
        if (!user) throw new Error('No user found, falling back to mock');

        const sessions = await SessionModel.find({ userId: user._id })
            .sort({ startTime: -1 })
            .limit(50) // Adjust as needed
            .lean();

        return sessions.map((s: any) => ({
            id: s._id.toString(),
            ...s
        }));
    } catch (error) {
        console.error('Error fetching real sessions, falling back to mock:', error);
        return [];
    }
}

export default async function SessionsPage() {
    const sessions = await getSessions();

    return (
        <div className="space-y-6 bg-[#1a1a1a] min-h-screen text-white p-6 font-sans">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#adb5bd] uppercase tracking-widest mb-4">
                <Link href="/dashboard" className="hover:text-[#5bc0de]">Dashboard</Link>
                <span>/</span>
                <span className="text-white">Semua Sesi</span>
            </div>

            {/* Sessions Table Card */}
            <div className="bg-[#212529] rounded shadow-xl overflow-hidden border border-white/5">
                <div className="bg-[#17a2b8] px-4 py-3 flex justify-between items-center shadow-lg">
                    <h2 className="text-white text-sm font-black m-0 uppercase tracking-widest flex items-center gap-2">
                        <History size={16} /> All my sessions
                    </h2>
                    <div className="flex items-center gap-2">
                        <button className="text-white hover:text-white/80 transition-all" title="Unduh Semua"><Download size={16} /></button>
                    </div>
                </div>

                {/* Table Content */}
                <div className="p-4">
                    <div className="overflow-x-auto border border-white/5 rounded-lg bg-[#1a1a1a]">
                        <table className="w-full text-[11px] text-left border-collapse">
                            <thead>
                                <tr className="bg-[#2c3034] border-b border-white/5">
                                    <th className="p-4 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter w-16">ID</th>
                                    <th className="p-4 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter">Tanggal & Waktu</th>
                                    <th className="p-4 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter">Nama Sesi / Sirkuit</th>
                                    <th className="p-4 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter text-center">Lap</th>
                                    <th className="p-4 font-black text-[#6c757d] border-r border-white/5 uppercase tracking-tighter text-center">Terbaik</th>
                                    <th className="p-4 font-black text-[#6c757d] text-center uppercase tracking-tighter">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-[#adb5bd] font-bold uppercase tracking-widest italic opacity-50">
                                            Belum ada sesi yang tersinkronisasi.
                                        </td>
                                    </tr>
                                ) : (
                                    sessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 border-r border-white/5 text-[#adb5bd] font-mono">{session.id.slice(-4)}</td>
                                            <td className="p-4 border-r border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Link href={`/analysis/${session.id}`} className="text-[#5bc0de] hover:underline font-bold transition-all">
                                                        {new Date(session.startTime).toLocaleString('id-ID', {
                                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </Link>
                                                    <MapPin size={12} className="text-[#5bc0de] opacity-50" />
                                                </div>
                                            </td>
                                            <td className="p-4 border-r border-white/5">
                                                <Link href={`/analysis/${session.id}`} className="text-white hover:text-[#5bc0de] font-black uppercase tracking-tighter transition-all italic">
                                                    {session.name || 'Sesi Latihan'}
                                                </Link>
                                                <div className="text-[9px] text-[#adb5bd] mt-0.5 font-bold uppercase tracking-widest opacity-60">
                                                    {session.originalFilename || 'Manual Upload'}
                                                </div>
                                            </td>
                                            <td className="p-4 border-r border-white/5 text-center font-black text-white">{session.stats?.lapCount || 0}</td>
                                            <td className="p-4 border-r border-white/5 text-center font-mono font-black text-[#5bc0de]">
                                                {session.stats?.bestLap ? `${session.stats.bestLap.toFixed(3)}s` : '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <Link href={`/analysis/${session.id}`} className="bg-[#5bc0de]/10 hover:bg-[#5bc0de] text-[#5bc0de] hover:text-white px-3 py-1.5 rounded border border-[#5bc0de]/20 transition-all flex items-center gap-2" title="Analisis Lintasan">
                                                        <Activity size={14} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Analisis</span>
                                                    </Link>
                                                    <button className="p-1.5 text-[#adb5bd] hover:text-white hover:bg-white/10 rounded transition-all"><Edit size={14} /></button>
                                                    <button className="p-1.5 text-[#ff4d4d]/60 hover:text-[#ff4d4d] hover:bg-white/10 rounded transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Bottom Section: GpxUploadPanel */}
            <div className="mt-12 bg-[#212529] rounded shadow-xl border border-white/5 overflow-hidden">
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
