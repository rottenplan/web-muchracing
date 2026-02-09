
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';
import Link from 'next/link';
import { ChevronLeft, Flag, Gauge, Activity, Clock, Map as MapIcon, Settings, Download } from 'lucide-react';
import TelemetryChart from '@/components/TelemetryChart';

async function getSession(id: string) {
    if (!id) return null;
    await dbConnect();
    const user = await getUserFromRequest();
    // In a real app, strict user check needed. For now, we assume user access or public if needed, 
    // but better to filter by userId if possible.
    try {
        const session = await SessionModel.findById(id).lean();
        if (!session) return null;
        return {
            id: session._id.toString(),
            ...session
        };
    } catch (e) {
        return null;
    }
}

export default async function AnalysisDashboard({ params }: { params: { id: string } }) {
    // Need to await params to avoid sync/await issues in newer Next.js
    const { id } = await params;
    const session = await getSession(id);

    if (!session) {
        return <div className="min-h-screen bg-[#111] text-white flex items-center justify-center font-racing">Session Not Found</div>
    }

    const trackName = session.trackName || "Unknown Track";
    const dateStr = new Date(session.startTime || session.createdAt).toLocaleDateString();
    const carName = session.carName || "My Car";

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans">
            {/* Top Bar - Session Info */}
            <header className="h-14 bg-black border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/sessions" className="p-1 hover:bg-white/10 rounded transition">
                        <ChevronLeft className="w-5 h-5 text-white/50 hover:text-white" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                            <Flag className="w-4 h-4 text-primary" />
                            {trackName}
                        </h1>
                        <div className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span>{carName}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[10px] font-racing uppercase tracking-widest transition flex items-center gap-2">
                        <Settings className="w-3 h-3" /> Settings
                    </button>
                    <button className="px-3 py-1.5 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 rounded text-[10px] font-racing uppercase tracking-widest transition flex items-center gap-2">
                        <Download className="w-3 h-3" /> Export
                    </button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* 1. Left Sidebar: Laps */}
                <aside className="w-64 bg-[#111] border-r border-white/5 flex flex-col shrink-0">
                    <div className="p-3 border-b border-white/5 bg-black/50">
                        <div className="text-[10px] font-racing uppercase text-white/40 tracking-widest">Lap History</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {/* Mock Laps */}
                        {[1, 2, 3, 4, 5].map((lap) => (
                            <div key={lap} className={`p-2 rounded border ${lap === 3 ? 'bg-primary/10 border-primary/30' : 'bg-transparent border-transparent hover:bg-white/5'} cursor-pointer transition flex items-center justify-between group`}>
                                <div>
                                    <div className={`text-xs font-bold ${lap === 3 ? 'text-primary' : 'text-white'}`}>Lap {lap}</div>
                                    <div className="text-[10px] text-white/30 flex gap-2">
                                        <span>S1: 32.1</span>
                                        <span>S2: 24.5</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-sm font-bold text-white">1:45.{230 + lap * 10}</div>
                                    {lap === 3 && <div className="text-[9px] text-primary uppercase font-bold tracking-wider">Fastest</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 2. Center: Telemetry Charts */}
                <main className="flex-1 bg-[#0a0a0a] flex flex-col relative">
                    {/* Toolbar */}
                    <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 bg-black/20">
                        <div className="text-[10px] text-white/40 uppercase tracking-widest font-racing">Charts:</div>
                        <button className="text-[10px] text-primary font-bold px-2 py-0.5 bg-primary/10 rounded hover:bg-primary/20 transition">Speed</button>
                        <button className="text-[10px] text-white/60 font-bold px-2 py-0.5 hover:bg-white/10 rounded transition">RPM</button>
                        <button className="text-[10px] text-white/60 font-bold px-2 py-0.5 hover:bg-white/10 rounded transition">Throttle</button>
                        <button className="text-[10px] text-white/60 font-bold px-2 py-0.5 hover:bg-white/10 rounded transition">Brake</button>
                    </div>

                    {/* Chart Area Placeholder */}
                    {/* Chart Area */}
                    <div className="flex-1 p-4 relative min-h-[300px] flex flex-col">
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
                            {Array.from({ length: 24 }).map((_, i) => <div key={i} className="border border-white/20"></div>)}
                        </div>

                        <div className="flex-1 w-full min-h-0">
                            <TelemetryChart />
                        </div>

                        {/* Overlay Info */}
                        <div className="absolute top-6 right-6 z-10 bg-black/80 px-4 py-2 rounded border border-white/10 backdrop-blur pointer-events-none">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-white/80 text-[10px] uppercase">Speed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-white/80 text-[10px] uppercase">RPM</span>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 3. Right: Map & Stats */}
                <aside className="w-80 bg-[#111] border-l border-white/5 flex flex-col shrink-0">
                    {/* Track Map */}
                    <div className="h-64 bg-[#151515] border-b border-white/5 relative overflow-hidden">
                        <div className="absolute top-2 left-3 z-10 text-[10px] font-racing uppercase text-white/40 tracking-widest">Track Map</div>
                        {/* Simple SVG Track Map Placeholder - Ideally render real Leaflet map here */}
                        <div className="w-full h-full flex items-center justify-center p-8 opacity-80">
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">
                                <path d="M20,80 L20,30 L50,10 L80,30 L80,80 L50,60 Z" fill="none" stroke="#22c55e" strokeWidth="3" />
                                <circle cx="20" cy="80" r="2" fill="white" />
                            </svg>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-3 border-b border-white/5 bg-black/50">
                            <div className="text-[10px] font-racing uppercase text-white/40 tracking-widest">Lap Statistics</div>
                        </div>
                        <div className="grid grid-cols-2 gap-px bg-white/5">
                            <StatTile label="Max Speed" value="184" unit="km/h" icon={<Gauge className="w-3 h-3 text-primary" />} />
                            <StatTile label="Avg Speed" value="121" unit="km/h" icon={<Activity className="w-3 h-3 text-blue-400" />} />
                            <StatTile label="Max RPM" value="8,400" unit="rpm" icon={<Activity className="w-3 h-3 text-red-500" />} />
                            <StatTile label="Lap Time" value="1:45.23" unit="min" icon={<Clock className="w-3 h-3 text-white" />} />
                            <StatTile label="G-Force Lat" value="1.2" unit="G" />
                            <StatTile label="G-Force Lon" value="0.9" unit="G" />
                        </div>

                        <div className="p-4 mt-4">
                            <div className="bg-white/5 rounded p-3 border border-white/5">
                                <div className="text-[10px] text-white/40 uppercase mb-2">Theoretical Best</div>
                                <div className="text-xl font-mono font-bold text-white">1:44.890</div>
                                <div className="text-[10px] text-primary mt-1">Based on best sectors</div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function StatTile({ label, value, unit, icon }: { label: string, value: string, unit: string, icon?: React.ReactNode }) {
    return (
        <div className="bg-[#111] p-4 flex flex-col justify-center items-center hover:bg-[#151515] transition">
            <div className="flex items-center gap-1 mb-1 opacity-50">
                {icon}
                <span className="text-[9px] uppercase tracking-wider">{label}</span>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-data text-white">{value}</span>
                <span className="text-[9px] text-white/40">{unit}</span>
            </div>
        </div>
    )
}
