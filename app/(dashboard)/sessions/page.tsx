import Link from 'next/link';
import { MapPin, Edit, Trash2, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';

// Helper to get sessions
async function getSessions() {
    await dbConnect();
    const user = await getUserFromRequest();
    if (!user) return [];

    const sessions = await SessionModel.find({ userId: user._id })
        .sort({ startTime: -1 })
        .lean();

    return sessions.map((s: any) => ({
        id: s._id.toString(),
        ...s
    }));
}

export default async function SessionsPage() {
    const sessions = await getSessions();

    return (
        <div className="space-y-6">
            {/* Sessions Card */}
            <div className="bg-white dark:bg-[#212529] shadow-sm rounded-sm border-t-4 border-[#17a2b8]">
                {/* Card Header - Blue */}
                <div className="bg-[#17a2b8] px-4 py-3 flex justify-between items-center">
                    <h2 className="text-white text-base font-normal m-0" style={{ fontFamily: 'sans-serif' }}>All my sessions</h2>
                    <div className="flex items-center gap-2">
                        <button className="text-white hover:text-white/80"><Download size={16} /></button>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex items-center gap-2 text-sm text-[#495057] dark:text-[#ced4da]">
                            <select className="form-select border border-[#ced4da] dark:border-[#495057] rounded px-2 py-1 bg-white dark:bg-[#212529] focus:outline-none focus:border-[#80bdff]">
                                <option>10</option>
                                <option>25</option>
                                <option>50</option>
                                <option>100</option>
                            </select>
                            <span>records per page</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="border border-[#ced4da] dark:border-[#495057] rounded px-3 py-1 bg-white dark:bg-[#212529] text-[#495057] dark:text-[#ced4da] focus:outline-none focus:border-[#80bdff] w-48"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse border border-[#dee2e6] dark:border-[#343a40]">
                            <thead className="bg-white dark:bg-[#212529] text-[#212529] dark:text-[#e9ecef] font-bold border-b-2 border-[#dee2e6] dark:border-[#343a40]">
                                <tr>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">Driver</th>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">Date</th>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">Track</th>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">City</th>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">Category</th>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">Laps</th>
                                    <th className="p-3 border-r border-[#dee2e6] dark:border-[#343a40]">Best Lap</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-4 text-center text-muted-foreground">No sessions data available</td>
                                    </tr>
                                ) : (
                                    sessions.map((session, i) => {
                                        const dateObj = new Date(session.startTime);
                                        const dateStr = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
                                        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <tr key={session.id} className={`${i % 2 === 0 ? 'bg-[#f9f9f9] dark:bg-[#2c3034]' : 'bg-white dark:bg-[#343a40]'} hover:bg-[#e9ecef] dark:hover:bg-[#3d4246] transition-colors border-b border-[#dee2e6] dark:border-[#495057]`}>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057] font-bold text-[#212529] dark:text-[#f8f9fa] uppercase">
                                                    FARIS
                                                </td>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-[#212529] dark:text-[#f8f9fa]">{dateStr} {timeStr}</span>
                                                        <Link href={`/analysis/${session.id}`} className="text-[#17a2b8] hover:underline flex items-center gap-0.5 text-xs font-bold">
                                                            <MapPin size={10} />
                                                            (map)
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057] text-[#17a2b8] hover:underline cursor-pointer">
                                                    {session.trackName || "Sentul Internasional Karting Cirkuit"}
                                                </td>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057] text-[#6c757d] dark:text-[#adb5bd]">
                                                    {/* City Placeholder */}
                                                </td>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057] text-[#6c757d] dark:text-[#adb5bd] uppercase text-xs">
                                                    {session.carName || "Vespa Tune Up"}
                                                </td>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057] text-[#6c757d] dark:text-[#adb5bd]">
                                                    {session.stats?.totalLaps || 0}
                                                </td>
                                                <td className="p-3 border-r border-[#dee2e6] dark:border-[#495057] font-bold text-[#212529] dark:text-[#f8f9fa]">
                                                    {session.stats?.bestLap ? session.stats.bestLap.toFixed(3) : '00.000'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2 text-[#6c757d]">
                                                        <button className="hover:text-[#17a2b8]"><Edit size={14} /></button>
                                                        <button className="hover:text-[#dc3545]"><Trash2 size={14} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-between items-center text-sm text-[#6c757d]">
                        <div>Showing 1 to {sessions.length} of {sessions.length} entries</div>
                        <div className="flex items-center gap-1">
                            <button className="px-2 py-1 border border-[#dee2e6] rounded hover:bg-[#e9ecef] disabled:opacity-50"><ChevronLeft size={14} /></button>
                            <button className="px-3 py-1 border border-[#dee2e6] bg-[#17a2b8] text-white rounded">1</button>
                            <button className="px-3 py-1 border border-[#dee2e6] rounded hover:bg-[#e9ecef]">2</button>
                            <button className="px-2 py-1 border border-[#dee2e6] rounded hover:bg-[#e9ecef]"><ChevronRight size={14} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Panel: Upload GPX (Collapsed style to match screenshot) */}
            <div className="bg-[#fd7e14] shadow-sm rounded-sm p-3 mt-8 cursor-pointer">
                <h3 className="text-white text-base font-normal m-0" style={{ fontFamily: 'sans-serif' }}>All my sessions</h3>
            </div>

            <div className="bg-[#17a2b8] shadow-sm rounded-sm p-3 mt-4 flex justify-between items-center cursor-pointer">
                <h3 className="text-white text-base font-normal m-0" style={{ fontFamily: 'sans-serif' }}>Upload GPX sessions</h3>
                <ChevronDown className="text-white" size={16} />
            </div>
        </div>
    );
}

function ChevronDown({ className, size }: { className?: string; size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
    )
}
