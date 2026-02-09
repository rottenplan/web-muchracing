'use client';

import Link from 'next/link';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';
import StatCard from '@/components/StatCard';
import ModuleTile from '@/components/ModuleTile';
import { Clock, TrendingUp, MapPin, Search, Edit, Trash2, Upload, ChevronLeft, ChevronRight, Zap, Trophy, Activity, Satellite, Gauge, History, Settings, RefreshCw, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import MapWrapper from '@/components/MapWrapper';
import Speedometer from '@/components/Speedometer';
import DragModeView from '@/components/DragModeView';

// Types
interface Session {
  _id: string;
  name: string;
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
  const { data, connected } = useLiveTelemetry();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'track' | 'drag'>('track');

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
    (session.originalFilename || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSessions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedSessions = filteredSessions.slice(startIndex, startIndex + rowsPerPage);

  // Calculated Stats
  const totalLaps = sessions.reduce((acc, s) => acc + (s.stats?.lapCount || 0), 0);
  const bestLapEver = sessions.reduce((best, s) => {
    const sBest = s.stats?.bestLap || 9999;
    return sBest < best && sBest > 0 ? sBest : best;
  }, 9999);
  const bestLapDisplay = bestLapEver === 9999 ? '--' : bestLapEver.toFixed(3);

  const totalDistanceKm = sessions.reduce((acc, s) => acc + (s.stats?.totalDistance || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Stats Grid - High Contrast Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="BEST LAP"
            value={bestLapDisplay}
            subtext="Lifetime Best"
            color="highlight"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="TOTAL LAPS"
            value={totalLaps.toString()}
            subtext="All Sessions"
            color="primary"
          />
          <StatCard
            icon={<MapPin className="w-5 h-5" />}
            label="LIFETIME"
            value={`${totalDistanceKm.toFixed(1)} km`}
            subtext="Driven Distance"
            color="warning"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="ENGINE"
            value="-- h"
            subtext="Active Time"
            color="primary"
          />
        </div>

        {/* Live Telemetry Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-racing flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              LIVE TELEMETRY
            </h2>
            {/* View Toggle */}
            <div className="flex bg-background-secondary rounded-lg p-1 border border-border-color">
              <button
                onClick={() => setViewMode('track')}
                className={`px-3 py-1 rounded text-xs font-racing transition-all ${viewMode === 'track' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
              >
                TRACK
              </button>
              <button
                onClick={() => setViewMode('drag')}
                className={`px-3 py-1 rounded text-xs font-racing transition-all ${viewMode === 'drag' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white'}`}
              >
                DRAG
              </button>
            </div>
          </div>

          <div className="h-[400px]">
            {viewMode === 'track' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                {/* Map - Takes up 2 columns on large screens */}
                <div className="lg:col-span-2 carbon-bg rounded-xl overflow-hidden border border-border-color shadow-lg relative">
                  <MapWrapper />
                </div>
                {/* Speedometer - Compact side panel */}
                <div className="carbon-bg rounded-xl border border-border-color shadow-lg flex items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-background-secondary to-background">
                  <Speedometer speed={data.speed} rpm={data.rpm} />
                  {/* Live Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connected ? 'bg-success' : 'bg-error'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${connected ? 'bg-success' : 'bg-error'}`}></span>
                    </span>
                    <span className={`text-xs font-bold ${connected ? 'text-success' : 'text-error'}`}>{connected ? 'LIVE' : 'OFFLINE'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Drag Mode View - Full Width */
              <div className="w-full h-full carbon-bg rounded-xl border border-border-color shadow-lg relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-background">
                <DragModeView />
              </div>
            )}
          </div>
        </div>

        {/* 8-Module HUB Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-racing text-primary tracking-[0.2em] italic">PRO HUB</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ModuleTile icon={<Trophy className="w-6 h-6" />} label="LAP TIMER" href="/tracks" color="highlight" />
            <ModuleTile icon={<Zap className="w-6 h-6" />} label="DRAG METER" href="#" onClick={() => { setViewMode('drag'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} color="primary" />
            <ModuleTile icon={<Activity className="w-6 h-6" />} label="RPM SENSOR" href="/rpm" color="highlight" />
            <ModuleTile icon={<Gauge className="w-6 h-6" />} label="SPEEDO" href="#" onClick={() => { setViewMode('track'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} color="primary" />
            <ModuleTile icon={<History className="w-6 h-6" />} label="HISTORY" href="/sessions" color="warning" />
            <ModuleTile icon={<Satellite className="w-6 h-6" />} label="GPS STATUS" href="/gps" color="highlight" />
            <ModuleTile icon={<Settings className="w-6 h-6" />} label="SETTINGS" href="/devices" color="text-secondary" />
            <ModuleTile icon={<RefreshCw className="w-6 h-6" />} label="SYNC" href="/setup-device" color="primary" />
          </div>
        </div>

        {/* GPX Upload Widget */}
        <div className="carbon-bg border border-border-color rounded-xl p-4">
          <h2 className="text-xl font-racing mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            UPLOAD GPX
          </h2>

          <div className="border-2 border-dashed border-border-color rounded-xl p-6 text-center hover:border-primary/50 transition cursor-pointer group relative">
            <input
              type="file"
              multiple
              accept=".gpx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={async (e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  const progressBar = document.getElementById('progress_bar');
                  const progressText = document.getElementById('progress_text');

                  if (progressBar && progressText) {
                    progressBar.style.width = '10%';
                    progressText.innerText = 'Uploading...';
                  }

                  for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const formData = new FormData();
                    formData.append('file', file);

                    try {
                      const res = await fetch('/api/upload/gpx', { method: 'POST', body: formData });
                      const data = await res.json();

                      if (res.ok) {
                        if (progressBar) progressBar.style.width = '100%';
                        if (progressText) progressText.innerText = 'Done!';
                        setTimeout(() => alert(`Uploaded: ${file.name}`), 100);
                        // Refresh sessions
                        const sessionsRes = await fetch('/api/sessions');
                        if (sessionsRes.ok) {
                          const json = await sessionsRes.json();
                          setSessions(json.data || []);
                        }
                      } else {
                        alert(`Failed to upload ${file.name}: ${data.error}`);
                      }
                    } catch (err) {
                      console.error(err);
                      alert(`Error uploading ${file.name}`);
                    }
                  }
                }
              }}
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="bg-background-secondary p-3 rounded-full mb-3 group-hover:bg-card-bg transition">
                <Upload className="w-6 h-6 text-text-secondary group-hover:text-primary transition" />
              </div>
              <p className="text-base text-foreground font-racing mb-1">
                DRAG & DROP GPX
              </p>
              <p className="text-text-secondary text-xs">
                or click to select
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-xs font-medium">Upload Status</span>
              <span id="progress_text" className="text-primary text-xs font-data font-bold"></span>
            </div>
            <div className="w-full bg-background-secondary rounded-full h-2 overflow-hidden">
              <div id="progress_bar" className="bg-gradient-to-r from-primary to-highlight h-full rounded-full transition-all duration-200" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>

        {/* All My Sessions Table */}
        <div className="carbon-bg border border-border-color rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-racing">ALL SESSIONS</h2>
            <button className="bg-primary hover:bg-primary-hover text-white px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-racing">
              <Upload className="w-4 h-4" />
              UPLOAD
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background-secondary border border-border-color rounded-lg pl-10 pr-4 py-2 text-foreground placeholder-text-secondary focus:outline-none focus:border-primary transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-color">
                  <th className="text-left text-text-secondary font-racing text-xs py-2 px-2">DATE</th>
                  <th className="text-left text-text-secondary font-racing text-xs py-2 px-2">NAME</th>
                  <th className="text-left text-text-secondary font-racing text-xs py-2 px-2">LAPS</th>
                  <th className="text-left text-text-secondary font-racing text-xs py-2 px-2">BEST</th>
                  <th className="text-left text-text-secondary font-racing text-xs py-2 px-2">SPEED</th>
                  <th className="text-left text-text-secondary font-racing text-xs py-2 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-4">Loading sessions...</td></tr>
                ) : displayedSessions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-4">No sessions found. Upload one!</td></tr>
                ) : (
                  displayedSessions.map((session) => (
                    <tr key={session._id} className="border-b border-border-color/50 hover:bg-card-bg transition">
                      <td className="py-2 px-2 text-text-secondary text-xs">
                        <Link href={`/sessions/${session._id}`} className="text-primary hover:text-primary-hover transition">
                          {new Date(session.startTime).toLocaleDateString()}
                        </Link>
                      </td>
                      <td className="py-2 px-2 text-foreground font-medium">{session.name}</td>
                      <td className="py-2 px-2 text-foreground font-data">{session.stats?.lapCount || 0}</td>
                      <td className="py-2 px-2 text-highlight font-data font-bold">
                        {session.stats?.bestLap ? session.stats.bestLap.toFixed(3) : '--'}
                      </td>
                      <td className="py-2 px-2 text-foreground font-data">
                        {session.stats?.maxSpeed ? session.stats.maxSpeed.toFixed(0) : 0} km/h
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <a
                            href={`/api/sessions/${session._id}/gpx`}
                            className="text-primary hover:text-primary-hover transition flex items-center justify-center"
                            title="Download GPX"
                            download
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button className="text-text-secondary hover:text-primary transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-warning hover:text-foreground transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Show</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-background-secondary border border-border-color rounded px-2 py-1 text-foreground focus:outline-none focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-background-secondary border border-border-color rounded hover:border-primary transition disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <span className="text-text-secondary font-data">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-background-secondary border border-border-color rounded hover:border-primary transition disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
