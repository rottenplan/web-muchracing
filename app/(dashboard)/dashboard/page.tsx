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
    <div className="min-h-screen bg-[#f4f6f9] pb-24 font-sans text-[#333]">
      <div className="space-y-6">

        {/* All My Sessions - Main Table Section */}
        <div className="bg-white rounded shadow-sm overflow-hidden">
          <div className="bg-[#5bc0de] px-4 py-2 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm tracking-wide uppercase">All my sessions</h2>
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
                  className="border border-gray-300 rounded px-2 py-1 bg-[#fff]"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-gray-500">records per page</span>
              </div>

              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#5bc0de]"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#f9f9f9] border-b border-gray-200">
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200">ID</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200">Driver</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200">Date</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200">Track</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200">City</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200">Category</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200 text-center">Laps</th>
                    <th className="p-2 font-bold text-gray-600 border-r border-gray-200 text-center">Best Lap</th>
                    <th className="p-2 font-bold text-gray-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={9} className="p-10 text-center text-gray-400">Loading sessions...</td></tr>
                  ) : displayedSessions.length === 0 ? (
                    <tr><td colSpan={9} className="p-10 text-center text-gray-400">No sessions found.</td></tr>
                  ) : (
                    displayedSessions.map((session, idx) => (
                      <tr key={session._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-2 border-r border-gray-100 text-gray-500">{session._id.slice(-4)}</td>
                        <td className="p-2 border-r border-gray-100 font-medium">{session.driver || 'FARIS'}</td>
                        <td className="p-2 border-r border-gray-100 text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#337ab7] hover:underline cursor-pointer font-medium">{new Date(session.startTime).toLocaleString()}</span>
                            <MapPin size={12} className="text-[#337ab7]" />
                            <Link href={`/sessions/${session._id}`} className="text-[#337ab7] hover:underline">(map)</Link>
                          </div>
                        </td>
                        <td className="p-2 border-r border-gray-100 text-[#337ab7] hover:underline cursor-pointer">{session.name || 'unknown'}</td>
                        <td className="p-2 border-r border-gray-100 text-gray-400">{session.city || '-'}</td>
                        <td className="p-2 border-r border-gray-100 text-gray-400 italic">{session.category || 'Vespa Tune Up'}</td>
                        <td className="p-2 border-r border-gray-100 text-center font-medium">{session.stats?.lapCount || 0}</td>
                        <td className="p-2 border-r border-gray-100 text-center font-bold text-gray-700">
                          {session.stats?.bestLap ? session.stats.bestLap.toFixed(3) : '00.000'}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button className="text-gray-400 hover:text-gray-600"><Edit size={14} /></button>
                            <button className="text-gray-400 hover:text-gray-600"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-xs text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredSessions.length)} of {filteredSessions.length} entries
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-l text-[#337ab7] hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="flex">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1.5 border-t border-b border-r border-gray-300 text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-[#337ab7] text-white' : 'text-[#337ab7] hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border-t border-b border-r border-gray-300 rounded-r text-[#337ab7] hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Orange Secondary Bar */}
        <div className="bg-[#f0ad4e] rounded shadow-sm overflow-hidden h-10 px-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm tracking-wide uppercase">All my sessions</h2>
          <button className="text-white"><ChevronLeft size={14} className="-rotate-90" /></button>
        </div>

        {/* Upload GPX Section */}
        <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200">
          <div className="bg-[#5bc0de] px-4 py-2 flex items-center justify-between">
            <h2 className="text-white font-bold text-sm tracking-wide uppercase">Upload GPX sessions</h2>
            <button className="text-white"><ChevronLeft size={14} className="-rotate-90" /></button>
          </div>

          <div className="p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600 font-bold">Select GPX Files</span>
                <div className="flex items-center">
                  <label className="bg-[#efefef] hover:bg-gray-200 border border-gray-300 px-4 py-1 text-xs cursor-pointer text-gray-700">
                    Choose Files
                    <input type="file" className="hidden" multiple />
                  </label>
                  <span className="bg-[#007cb2] text-white px-3 py-1 text-xs border border-[#007cb2] border-l-0">No file chosen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
