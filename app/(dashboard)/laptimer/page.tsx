'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Battery, MapPin, Gauge, Satellite, AlertCircle } from 'lucide-react';

// Dynamically import map to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#2c3034] animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

export default function LivePage() {
    const [data, setData] = useState<any>(null);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/device/status');
            if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                    setData(json.data);
                    setLastSync(json.last_sync);

                    // Check if data is stale (over 10 seconds)
                    const now = Date.now();
                    const lastUpdate = json.data.timestamp || 0;
                    const isFresh = (now - lastUpdate) < 15000; // 15s grace

                    setIsLive(isFresh);
                }
            }
        } catch (err) {
            console.error('Failed to fetch live data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // Poll every 2s
        return () => clearInterval(interval);
    }, []);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center text-white">
                <Activity className="animate-spin mr-2" /> Connecting to Telemetry...
            </div>
        );
    }

    // Defatul values if data is null
    const speed = data?.speed || 0;
    const rpm = data?.rpm || 0;
    const sats = data?.sats || 0;
    const batV = data?.bat_v || 0;
    const batP = data?.bat_p || 0;
    const lat = data?.lat || -6.2088; // Default Jakarta
    const lng = data?.lng || 106.8456;

    return (
        <div className="min-h-screen bg-[#1a1a1a] pb-24 font-sans text-white p-6">
            <div className="flex flex-col space-y-6">

                {/* Header Status */}
                <div className="flex items-center justify-between bg-[#212529] p-4 rounded-lg border border-white/10 shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <h1 className="text-xl font-bold uppercase tracking-wider">
                            Live Telemetry
                            {!isLive && <span className="text-xs text-red-400 ml-2 font-normal">(OFFLINE)</span>}
                        </h1>
                    </div>
                    <div className="text-xs text-gray-400">
                        Last Update: {lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}
                    </div>
                </div>

                {/* Gauges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Speed */}
                    <div className="bg-[#2c3034] p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-md">
                        <Gauge size={32} className="text-[#5bc0de] mb-2" />
                        <span className="text-3xl font-black text-white">{speed.toFixed(1)}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest">KM/H</span>
                    </div>

                    {/* RPM */}
                    <div className="bg-[#2c3034] p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-md">
                        <Activity size={32} className="text-[#f0ad4e] mb-2" />
                        <span className="text-3xl font-black text-white">{rpm}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest">RPM</span>
                    </div>

                    {/* Satellites */}
                    <div className="bg-[#2c3034] p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-md">
                        <Satellite size={32} className="text-[#5cb85c] mb-2" />
                        <span className="text-3xl font-black text-white">{sats}</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest">Sats</span>
                    </div>

                    {/* Battery */}
                    <div className="bg-[#2c3034] p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center shadow-md">
                        <Battery size={32} className={`mb-2 ${batP < 20 ? 'text-red-500' : 'text-green-500'}`} />
                        <span className="text-3xl font-black text-white">{batP}%</span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest">{batV.toFixed(2)}V</span>
                    </div>
                </div>

                {/* Map Section */}
                <div className="w-full h-[500px] min-h-[500px] relative">
                    <LiveMap lat={lat} lng={lng} speed={speed} rpm={rpm} />
                    {!isLive && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-[1000] pointer-events-none">
                            <div className="bg-[#212529] p-4 rounded border border-red-500 text-red-500 flex items-center gap-2">
                                <AlertCircle />
                                <span className="font-bold">DEVICE OFFLINE / NO GPS</span>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
