'use client';

import Link from 'next/link';
import { Search, Edit, Trash2, Upload, ChevronLeft, ChevronRight, MapPin, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

// Types
interface Session {
  _id: string;
  name: string;
  driver?: string;
  city?: string;
  category?: string;
  originalFilename: string;
  startTime: string;
  endTime: string;
  stats: {
    totalDistance: number;
    maxSpeed: number;
    avgSpeed: number;
    maxRpm: number;
    totalTime: number;
    lapCount: number;
    bestLap: number;
  };
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const json = await res.json();
          setSessions(json.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch sessions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(session =>
    (session.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.originalFilename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (session.driver || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSessions.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedSessions = filteredSessions.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="min-h-screen bg-[#1a1a1a] pb-24 font-sans text-white">
      <div className="space-y-6">

        {/* All My Sessions - Main Table Section */}
        <div className="bg-[#212529] rounded shadow-xl overflow-hidden border border-white/5">
          <div className="bg-[#5bc0de] px-4 py-2.5 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm tracking-wide uppercase">Semua Sesi Saya</h2>
            <div className="flex gap-2">
              <button className="text-white/80 hover:text-white"><div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center text-[10px]">?</div></button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2 text-xs">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="bg-[#1a1a1a] border border-white/10 rounded px-2 py-1.5 focus:outline-none focus:border-[#5bc0de] text-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-[#adb5bd]">data per halaman</span>
              </div>

              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#5bc0de] text-white placeholder-white/30"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-lg bg-[#1a1a1a]">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#2c3034] border-b border-white/5">
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5">ID</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5">Driver</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5">Tanggal</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5">Sirkuit</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5">Kota</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5">Kategori</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5 text-center">Lap</th>
                    <th className="p-3 font-bold text-[#adb5bd] border-r border-white/5 text-center">Best Lap</th>
                    <th className="p-3 font-bold text-[#adb5bd] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={9} className="p-10 text-center text-[#adb5bd]">Memuat sesi...</td></tr>
                  ) : displayedSessions.length === 0 ? (
                    <tr><td colSpan={9} className="p-10 text-center text-[#adb5bd]">Sesi tidak ditemukan.</td></tr>
                  ) : (
                    displayedSessions.map((session, idx) => (
                      <tr key={session._id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-3 border-r border-white/5 text-[#adb5bd]">{session._id.slice(-4)}</td>
                        <td className="p-3 border-r border-white/5 text-white font-medium">{session.driver || 'FALAH'}</td>
                        <td className="p-3 border-r border-white/5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#5bc0de] hover:underline cursor-pointer font-medium">{new Date(session.startTime).toLocaleString('id-ID')}</span>
                            <MapPin size={12} className="text-[#5bc0de]" />
                            <Link href={`/sessions/${session._id}`} className="text-[#5bc0de] hover:underline">(peta)</Link>
                          </div>
                        </td>
                        <td className="p-3 border-r border-white/5 text-[#5bc0de] hover:underline cursor-pointer">{session.name || 'unknown'}</td>
                        <td className="p-3 border-r border-white/5 text-[#adb5bd]">{session.city || '-'}</td>
                        <td className="p-3 border-r border-white/5 text-[#adb5bd] italic">{session.category || 'Vespa Tune Up'}</td>
                        <td className="p-3 border-r border-white/5 text-center text-white">{session.stats?.lapCount || 0}</td>
                        <td className="p-3 border-r border-white/5 text-center font-bold text-[#5bc0de]">
                          {session.stats?.bestLap ? session.stats.bestLap.toFixed(3) : '00.000'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button className="text-[#adb5bd] hover:text-white p-1 hover:bg-white/10 rounded transition-all"><Edit size={14} /></button>
                            <button className="text-[#ff4d4d]/70 hover:text-[#ff4d4d] p-1 hover:bg-white/10 rounded transition-all"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
              <div className="text-xs text-[#6c757d]">
                Menampilkan {startIndex + 1} sampai {Math.min(startIndex + rowsPerPage, filteredSessions.length)} dari {filteredSessions.length} entri
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-white/10 rounded-l text-[#5bc0de] hover:bg-white/5 disabled:opacity-20"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 border-t border-b border-r border-white/10 text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#5bc0de] text-white' : 'text-[#5bc0de] hover:bg-white/5'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border-t border-b border-r border-white/10 rounded-r text-[#5bc0de] hover:bg-white/5 disabled:opacity-20"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orange Secondary Bar */}
        <div className="bg-[#f0ad4e] rounded shadow-lg h-11 px-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">Sesi Terbaru</h2>
          <button className="text-white hover:bg-white/10 p-1 rounded transition-all"><ChevronLeft size={16} className="-rotate-90" /></button>
        </div>

        {/* Upload GPX Section */}
        <div className="bg-[#212529] rounded shadow-xl overflow-hidden border border-white/5">
          <div className="bg-[#5bc0de] px-4 py-2.5 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm tracking-wide uppercase">Upload Sesi GPX</h2>
            <button className="text-white hover:bg-white/10 p-1 rounded transition-all"><ChevronLeft size={16} className="-rotate-90" /></button>
          </div>

          <div className="p-12">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <span className="text-sm text-[#adb5bd] font-bold tracking-wider uppercase">Pilih File GPX</span>
                <div className="flex items-center shadow-lg shadow-black/40 rounded overflow-hidden border border-white/10">
                  <label className="bg-[#2c3034] hover:bg-[#343a40] px-6 py-2 text-xs cursor-pointer text-white font-medium transition-all">
                    Pilih File
                    <input type="file" className="hidden" multiple />
                  </label>
                  <span className="bg-[#007cb2] text-white px-5 py-2 text-xs font-medium border-l border-white/10">Tidak ada file terpilih</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
