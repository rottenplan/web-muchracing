'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Battery, MapPin, Gauge, Satellite, AlertCircle } from 'lucide-react';
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';

// Dynamically import map to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#2c3034] animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

export default function LivePage() {
    const { data, connected, error, retryCount } = useLiveTelemetry();
    const [loading, setLoading] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const pointsRef = useRef<Array<{ time: number; lat: number; lng: number; speed: number; rpm?: number }>>([]);
    const [recordCount, setRecordCount] = useState(0);

    useEffect(() => {
        const fetchDeviceId = async () => {
            try {
                const res = await fetch('/api/device/status');
                if (res.ok) {
                    const json = await res.json();
                    if (json.deviceId) setDeviceId(json.deviceId);
                }
            } catch (e) { }
        };
        fetchDeviceId();
    }, []);

    // Collect points while recording
    useEffect(() => {
        if (!recording) return;
        const ts = Number((data as any)?.timestamp) || Date.now();
        const lat = Number(data?.lat) || 0;
        const lng = Number(data?.lng) || 0;
        const speed = Number(data?.speed) || 0;
        const rpm = Number(data?.rpm) || 0;
        // push with placeholders-compatible format
        pointsRef.current.push({ time: ts, lat, lng, speed, rpm });
        setRecordCount(pointsRef.current.length);
    }, [data]);

    const startRecording = () => {
        pointsRef.current = [];
        setRecordCount(0);
        setRecording(true);
    };

    const stopAndSaveRecording = async () => {
        setRecording(false);
        if (pointsRef.current.length === 0) return;
        // Build CSV with indices to match parser expectations:
        // time(0),lat(1),lng(2),speed(3),""(4),alt(5),""(6),rpm(7)
        const header = 'Time,Lat,Lng,Speed,,Alt,,Rpm';
        const csvLines = [header];
        for (const p of pointsRef.current) {
            const alt = ''; // not available live now
            csvLines.push(`${p.time},${p.lat},${p.lng},${p.speed},,${alt},,${p.rpm ?? ''}`);
        }
        const csv = csvLines.join('\n');
        try {
            const res = await fetch('/api/device/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'upload_session',
                    filename: `live_${new Date().toISOString()}.csv`,
                    is_base64: false,
                    csv_data: csv,
                    session_type: 'TRACK'
                })
            });
            if (!res.ok) {
                console.error('Save session failed', await res.text());
            }
        } catch (e) {
            console.error('Save session error', e);
        } finally {
            pointsRef.current = [];
            setRecordCount(0);
        }
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">
                <Activity className="animate-spin mr-2" /> Connecting to Telemetry...
            </div>
        );
    }

    // Defatul values if data is null
    const speed = Number(data?.speed) || 0;
    const rpm = Number(data?.rpm) || 0;
    const sats = Number(data?.sats) || 0;
    const batV = Number((data as any)?.bat_voltage ?? (data as any)?.bat_v) || 0;
    const batP = Number((data as any)?.bat_percent ?? (data as any)?.bat_p) || 0;
    const lat = Number(data?.lat) || -6.2088; // Default Jakarta
    const lng = Number(data?.lng) || 106.8456;
    const lastTs = Number((data as any)?.timestamp) || 0;
    const isLive = connected && (Date.now() - (lastTs || Date.now())) < 15000;

    return (
        <div className="min-h-screen bg-[#141414] racing-gradient-bg pb-24 font-sans text-white p-6">
            <div className="max-w-7xl mx-auto flex flex-col space-y-6">

                {/* Header Status */}
                <div className="flex items-center justify-between glass-header p-5 rounded-xl border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={`w-3.5 h-3.5 rounded-full ${isLive ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                        </div>
                        <h1 className="text-2xl font-racing tracking-widest text-white flex items-center gap-2">
                            LIVE TELEMETRY
                            {!isLive && <span className="text-[10px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-bold ml-2">STATIONARY / OFFLINE</span>}
                            {deviceId && (
                                <span className="ml-3 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-400/20 font-bold uppercase tracking-widest">
                                    {deviceId}
                                </span>
                            )}
                        </h1>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-tighter">Frequency: <span className="text-blue-400">10Hz via MQTT</span></span>
                        <div className="text-[11px] font-data text-gray-400">
                            {lastTs ? `Last update: ${Math.max(0, Math.floor((Date.now() - lastTs) / 1000))}s ago` : 'WAITING FOR DATA...'}
                        </div>
                        {error && <div className="text-[10px] text-red-400">MQTT: {error} {retryCount ? `(retry ${retryCount})` : ''}</div>}
                    </div>
                </div>

                {/* Gauges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Speed Gauge */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Gauge size={48} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-racing glow-text text-white mb-2 leading-none">{speed.toFixed(0)}</span>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Speed</span>
                                <span className="text-xs text-blue-400 font-bold">KM/H</span>
                            </div>
                        </div>
                    </div>

                    {/* RPM Gauge */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={48} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className={`text-5xl font-racing mb-2 leading-none ${rpm > 12000 ? 'text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-orange-400 shadow-[0_0_15px_rgba(240,173,78,0.3)]'}`}>
                                {rpm}
                            </span>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Engine</span>
                                <span className="text-xs text-orange-400 font-bold uppercase">RPM</span>
                            </div>
                        </div>
                    </div>

                    {/* GPS Status */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Satellite size={48} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-5xl font-racing text-white mb-2 leading-none glow-text-highlight">{sats}</span>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Position</span>
                                <span className="text-xs text-green-500 font-bold uppercase">SATS FIX</span>
                            </div>
                        </div>
                    </div>

                    {/* Battery Status */}
                    <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Battery size={48} />
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-racing mb-2 leading-none ${batP < 30 ? 'text-red-500' : 'text-white'}`}>{batP}</span>
                                <span className="text-sm font-racing text-gray-500">%</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] text-gray-500 font-bold tracking-[0.3em] uppercase">Voltage</span>
                                <span className={`text-xs font-bold ${batP < 30 ? 'text-red-500' : 'text-gray-300'}`}>{batV.toFixed(2)}V</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="w-full h-[600px] relative rounded-3xl overflow-hidden border border-white/5 shadow-2xll shadow-black flex group">
                    <LiveMap lat={lat} lng={lng} speed={speed} rpm={rpm} />
                    {!isLive && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] pointer-events-none">
                            <div className="glass-card p-8 rounded-2xl border-red-500/50 text-red-500 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                                <AlertCircle size={48} className="animate-pulse" />
                                <div className="text-center">
                                    <h3 className="text-xl font-racing tracking-widest">SIGNAL LOST</h3>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-1 uppercase">Checking MQTT Stream...</p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Recording Controls */}
                    <div className="absolute top-4 right-4 z-[1001] flex items-center gap-2">
                        {!recording ? (
                            <button
                                onClick={startRecording}
                                className="px-3 py-2 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold uppercase tracking-widest"
                            >
                                Record
                            </button>
                        ) : (
                            <>
                                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-400/20 font-bold">{recordCount} pts</span>
                                <button
                                    onClick={stopAndSaveRecording}
                                    className="px-3 py-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold uppercase tracking-widest"
                                >
                                    Stop & Save
                                </button>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
