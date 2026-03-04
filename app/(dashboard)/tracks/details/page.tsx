'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, ChevronRight, ChevronDown, Plus, Trash2, Save } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the Map component with SSR disabled
const TrackDetailMap = dynamic(() => import('@/components/TrackDetailMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-gray-500">Loading Map...</div>
});

interface TrackSummary {
    id: string;
    name: string;
    country: string;
    length?: number;
    location?: string;
}

interface TrackDetail {
    id: string;
    name: string;
    country: string;
    startLine: { lat: number; lng: number; bearing: number; width: number };
    points: { lat: number; lng: number }[];
    type?: string;
}

export default function TrackDetailsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [tracksByCountry, setTracksByCountry] = useState<{ [key: string]: TrackSummary[] }>({});
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const [trackDetail, setTrackDetail] = useState<TrackDetail | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch Track List
    useEffect(() => {
        fetch('/api/tracks/list')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const grouped: { [key: string]: TrackSummary[] } = {};
                    data.tracks.forEach((t: any) => {
                        const country = t.country || "Unknown";
                        if (!grouped[country]) grouped[country] = [];
                        grouped[country].push(t);
                    });
                    setTracksByCountry(grouped);

                    // Auto-expand first country if available
                    const countries = Object.keys(grouped);
                    if (countries.length > 0) setSelectedCountry(countries[0]);
                }
            })
            .catch(err => console.error("Failed to load tracks", err));
    }, []);

    // Fetch Track Detail when selected
    useEffect(() => {
        if (!selectedTrackId) return;

        setLoading(true);
        fetch(`/api/tracks/${selectedTrackId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTrackDetail(data.track);
                }
            })
            .catch(err => console.error("Failed to load track detail", err))
            .finally(() => setLoading(false));
    }, [selectedTrackId]);

    // Prepare map data
    const mapCenter = trackDetail?.startLine ? [trackDetail.startLine.lat, trackDetail.startLine.lng] : [-6.5360, 106.8520];
    const mapPath = trackDetail?.points?.map(p => [p.lat, p.lng]) || [];

    const filteredCountries = Object.keys(tracksByCountry).filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tracksByCountry[c].some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6 relative overflow-hidden">
            {/* Left Sidebar: Track Browser */}
            <aside className="w-[300px] bg-[#1a1e21] flex flex-col border-r border-black/20 z-20">
                {/* Search Header */}
                <div className="p-2 bg-[#212529] border-b border-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-white text-black px-2 py-1 text-sm rounded-sm focus:outline-none"
                        />
                    </div>
                </div>

                {/* Country List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredCountries.map((country) => (
                        <div key={country}>
                            <button
                                onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                                className="w-full flex items-center justify-between px-3 py-2 border-b border-white/5 hover:bg-white/5 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[#adb5bd] text-xs font-bold uppercase">{country} ({tracksByCountry[country].length})</span>
                                </div>
                                {selectedCountry === country ? <ChevronDown size={14} className="text-[#adb5bd]" /> : <ChevronRight size={14} className="text-[#adb5bd]" />}
                            </button>

                            {/* Tracks Expansion */}
                            {selectedCountry === country && (
                                <div className="bg-[#111] py-1">
                                    {tracksByCountry[country].filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(track => (
                                        <button
                                            key={track.id}
                                            onClick={() => setSelectedTrackId(track.id)}
                                            className={`w-full px-8 py-2 text-xs text-left hover:bg-white/10 cursor-pointer flex items-center gap-2 ${selectedTrackId === track.id ? 'bg-white/10 text-white' : 'text-[#adb5bd]'}`}
                                        >
                                            <MapPin size={12} className={selectedTrackId === track.id ? "text-[#ff4500]" : "text-gray-500"} />
                                            <span className="truncate">{track.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative bg-[#0f1510]">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white">Loading...</div>
                ) : trackDetail ? (
                    <>
                        {/* Header Overlay */}
                        <div className="absolute top-8 left-8 z-[500] pointer-events-none">
                            <div className="bg-[#ff4500] px-4 py-2 shadow-lg mb-2 inline-block">
                                <h1 className="text-white font-bold text-lg uppercase tracking-wide">
                                    {trackDetail.name}
                                </h1>
                            </div>
                            <div className="text-white drop-shadow-md space-y-0.5">
                                <p className="font-bold text-sm">{trackDetail.country}</p>
                                <p className="text-sm">Type: <span className="font-bold">{trackDetail.type || 'Circuit'}</span></p>
                                <p className="text-sm">Points: {trackDetail.points?.length || 0}</p>
                            </div>
                        </div>

                        {/* Map */}
                        <TrackDetailMap
                            center={mapCenter}
                            path={mapPath}
                        />

                        {/* Top Right Controls */}
                        <div className="absolute top-0 right-0 z-[500] bg-[#343a40] flex text-white text-[10px]">
                            <button className="px-3 py-1.5 hover:bg-white/10 border-r border-white/10 flex items-center gap-1">
                                <Plus size={12} /> New
                            </button>
                            <button className="px-3 py-1.5 bg-[#dc3545] hover:bg-[#c82333]">Delete track</button>
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#adb5bd]">
                        Select a track to view details
                    </div>
                )}
            </main>
        </div>
    );
}
