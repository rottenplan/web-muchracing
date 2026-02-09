import Link from 'next/link';
import { Clock, MapPin, Calendar, TrendingUp, Gauge, Activity, Zap } from 'lucide-react';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';

// Helper to get sessions from MongoDB
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
    <div className="min-h-screen bg-[#111] text-white pb-24 font-sans">
      {/* Header */}
      <div className="border-b border-white/5 bg-black sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-racing tracking-widest uppercase">Sessions</h1>
          <Link href="/devices" className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded text-[10px] font-racing uppercase tracking-wider transition">
            Upload Session
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="text-text-secondary font-racing uppercase tracking-wider">No sessions found</p>
              <p className="text-text-secondary text-sm mt-2 opacity-60">Sync your device to populate this list.</p>
            </div>
          ) : (
            sessions.map((session: any) => (
              <SessionListItem key={session.id} session={session} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SessionListItem({ session }: { session: any }) {
  const dateObj = new Date(session.startTime || session.createdAt);
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Mock data for display if missing (FoxLap style needs dense data)
  const trackName = session.trackName || "Unknown Track";
  const carName = session.carName || "My Car";
  const bestLap = session.stats?.bestLap || "--:--.--";

  return (
    <div className="group bg-[#1a1a1a] hover:bg-[#222] border border-white/5 hover:border-primary/50 rounded-lg p-4 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Track & Date */}
      <div className="flex items-center gap-4 min-w-[200px]">
        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-text-secondary group-hover:text-primary transition">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-racing tracking-wider text-base text-white">{trackName}</h3>
          <div className="text-[10px] text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <span>{dateStr}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Middle: Details */}
      <div className="flex items-center gap-8 md:flex-1 md:justify-center">
        <div className="text-center">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Car</div>
          <div className="font-bold text-sm text-white/80">{carName}</div>
        </div>
        <div className="text-center min-w-[100px]">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Best Lap</div>
          <div className="font-data font-bold text-xl text-primary tracking-tight">{bestLap}</div>
        </div>
        <div className="text-center hidden sm:block">
          <div className="text-[10px] text-text-secondary uppercase tracking-widest mb-1">Laps</div>
          <div className="font-bold text-sm text-white/80">{session.stats?.totalLaps || 0}</div>
        </div>
      </div>

      {/* Right: Action */}
      <div className="flex items-center justify-end">
        <Link
          href={`/analysis/${session.id}`}
          className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-white px-6 py-2 rounded text-[10px] font-racing uppercase tracking-widest transition whitespace-nowrap"
        >
          View Analysis
        </Link>
      </div>
    </div>
  );
}
