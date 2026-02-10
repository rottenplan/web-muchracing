"use client";

import { useState, useEffect } from "react";
import { History, TrendingUp, Trophy, ChevronRight, Activity, Zap, Calendar, MapPin, Timer } from "lucide-react";
import Link from "next/link";


export default function Home() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const json = await res.json();
          setSessions(json.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch sessions', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const totalRuns = sessions.length;
  const topSpeed = sessions.length > 0 ? Math.max(...sessions.map(s => s.stats?.maxSpeed || 0)) : 0;

  // Find best time across all sessions (drag results or best lap)
  const bestTime = sessions.reduce((min, s) => {
    const time = s.stats?.bestLap || 0;
    if (time > 0 && time < min) return time;
    return min;
  }, 999);

  return (
    <main className="min-h-screen pb-24 bg-background text-foreground">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-50 glass-header px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center border border-primary/20">
            <History className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-racing text-foreground tracking-widest italic">RACING FEED</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-highlight/10 border border-highlight/20 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-highlight rounded-full animate-pulse"></span>
            <span className="text-[10px] font-racing text-highlight tracking-wider">Cloud Connected</span>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="p-4 bg-gradient-to-b from-background-secondary to-background border-b border-white/5">
        <div className="grid grid-cols-3 gap-2">
          <QuickStat label="TOTAL RUNS" value={String(totalRuns)} icon={<Zap className="w-3 h-3" />} />
          <QuickStat label="BEST TIME" value={bestTime === 999 ? "--" : `${bestTime.toFixed(2)}s`} icon={<Trophy className="w-3 h-3 text-warning" />} />
          <QuickStat label="TOP SPEED" value={topSpeed > 0 ? `${topSpeed.toFixed(0)}` : "--"} icon={<TrendingUp className="w-3 h-3 text-primary" />} />
        </div>
      </div>

      {/* Feed Content */}
      <div className="px-4 py-6 space-y-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-racing tracking-widest">NO SESSIONS YET</p>
            <p className="text-[10px] mt-2 italic">SYNC YOUR DEVICE TO START</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-racing text-text-secondary tracking-[0.2em]">RECENT SESSIONS</span>
              <div className="h-px flex-1 bg-border-color/30"></div>
            </div>

            {sessions.map((session) => (
              <div key={session._id} className="carbon-bg rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative group">
                <div className={`absolute top-0 left-0 w-1 h-full ${session.stats.lapCount > 0 ? 'bg-highlight' : 'bg-primary'} group-hover:w-2 transition-all`}></div>

                <div className="p-4 bg-background-secondary/50 flex justify-between items-start border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-racing text-white uppercase">{session.name || 'Untitled Session'}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 ${session.stats.lapCount > 0 ? 'bg-highlight/20 text-highlight border-highlight/30' : 'bg-primary/20 text-primary border-primary/30'} border rounded uppercase font-bold`}>
                        {session.stats.lapCount > 0 ? 'Lap Timer' : 'Drag Meter'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-secondary font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary" />
                        {new Date(session.startTime).toLocaleDateString()}
                      </span>
                      <span className="w-1 h-1 bg-border-color rounded-full"></span>
                      <span>{session.stats.lapCount > 0 ? `${session.stats.lapCount} LAPS` : `1 RUN`}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-racing text-text-secondary tracking-tighter uppercase mb-1">
                      {session.stats.lapCount > 0 ? 'Fastest' : 'Best Result'}
                    </div>
                    <div className={`text-2xl font-data font-bold ${session.stats?.lapCount > 0 ? 'text-highlight' : 'text-primary'} tracking-tighter shadow-glow`}>
                      {session.stats?.bestLap > 0 ? session.stats.bestLap.toFixed(3) : '--.---'}
                    </div>
                  </div>
                </div>

                <Link href={`/sessions/${session._id}`} className="flex items-center justify-between p-4 hover:bg-white/5 transition group/item">
                  <div className="flex gap-4 items-center">
                    <Activity className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-racing text-white">Full Session Data</p>
                      <p className="text-[10px] text-text-secondary">
                        {new Date(session.startTime).toLocaleTimeString()} • {(session.stats?.totalDistance || 0).toFixed(2)} KM
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-secondary group-hover/item:translate-x-1 transition" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>


    </main>
  );
}

function QuickStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="carbon-bg rounded-xl border border-white/5 p-2 flex flex-col items-center">
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-[8px] font-racing text-text-secondary tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-data font-bold text-white tracking-tighter">{value}</div>
    </div>
  );
}
