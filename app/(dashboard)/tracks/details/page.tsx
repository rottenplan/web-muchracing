'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronRight, ChevronDown, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import dynamic from 'next/dynamic';

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

const TRACK_TYPES = ['Circuit', 'Drag Strip', 'Sprint', 'Hill Climb', 'Rally', 'Oval', 'Karting', 'Other'];

export default function TrackDetailsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [tracksByCountry, setTracksByCountry] = useState<{ [key: string]: TrackSummary[] }>({});
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
    const [trackDetail, setTrackDetail] = useState<TrackDetail | null>(null);
    const [loading, setLoading] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editCountry, setEditCountry] = useState('');
    const [editType, setEditType] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

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
        setIsEditing(false);
        setSaveError(null);
        fetch(`/api/tracks/${selectedTrackId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setTrackDetail(data.track);
            })
            .catch(err => console.error("Failed to load track detail", err))
            .finally(() => setLoading(false));
    }, [selectedTrackId]);

    const startEditing = () => {
        if (!trackDetail) return;
        setEditName(trackDetail.name);
        setEditCountry(trackDetail.country);
        setEditType(trackDetail.type || 'Circuit');
        setSaveError(null);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setSaveError(null);
    };

    const saveEdits = async () => {
        if (!trackDetail || !selectedTrackId) return;
        if (!editName.trim()) { setSaveError('Name cannot be empty'); return; }

        setSaving(true);
        setSaveError(null);
        try {
            const res = await fetch(`/api/tracks/${selectedTrackId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName.trim(), country: editCountry.trim(), type: editType }),
            });
            const data = await res.json();
            if (data.success) {
                setTrackDetail(data.track);
                // Also update the sidebar list
                setTracksByCountry(prev => {
                    const newGrouped: { [key: string]: TrackSummary[] } = {};
                    Object.entries(prev).forEach(([c, tracks]) => {
                        newGrouped[c] = tracks.map(t =>
                            t.id === selectedTrackId ? { ...t, name: data.track.name, country: data.track.country } : t
                        );
                    });
                    return newGrouped;
                });
                setIsEditing(false);
            } else {
                setSaveError(data.message || 'Failed to save');
            }
        } catch {
            setSaveError('Network error, please try again');
        } finally {
            setSaving(false);
        }
    };

    const mapCenter = trackDetail?.startLine
        ? [trackDetail.startLine.lat, trackDetail.startLine.lng]
        : [-6.5360, 106.8520];
    const mapPath = trackDetail?.points?.map(p => [p.lat, p.lng]) || [];

    const filteredCountries = Object.keys(tracksByCountry).filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tracksByCountry[c].some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6 relative overflow-hidden">

            {/* Left Sidebar */}
            <aside className="w-[300px] bg-[#1a1e21] flex flex-col border-r border-black/20 z-20">
                <div className="p-2 bg-[#212529] border-b border-white/5">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white text-black px-2 py-1 text-sm rounded-sm focus:outline-none"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredCountries.map((country) => (
                        <div key={country}>
                            <button
                                onClick={() => setSelectedCountry(selectedCountry === country ? null : country)}
                                className="w-full flex items-center justify-between px-3 py-2 border-b border-white/5 hover:bg-white/5 text-left"
                            >
                                <span className="text-[#adb5bd] text-xs font-bold uppercase">
                                    {country} ({tracksByCountry[country].length})
                                </span>
                                {selectedCountry === country
                                    ? <ChevronDown size={14} className="text-[#adb5bd]" />
                                    : <ChevronRight size={14} className="text-[#adb5bd]" />}
                            </button>

                            {selectedCountry === country && (
                                <div className="bg-[#111] py-1">
                                    {tracksByCountry[country]
                                        .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .map(track => (
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

            {/* Main Content */}
            <main className="flex-1 relative bg-[#0f1510]">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white">Loading...</div>
                ) : trackDetail ? (
                    <>
                        {/* Header Info / Edit Panel */}
                        <div className="absolute top-4 left-4 z-[500] min-w-[260px] max-w-[340px]">
                            {isEditing ? (
                                /* ── EDIT MODE ── */
                                <div className="bg-[#1e2428]/95 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-2xl space-y-3">
                                    <p className="text-[10px] text-[#adb5bd] uppercase tracking-widest font-bold mb-1">Edit Track</p>

                                    {/* Name */}
                                    <div>
                                        <label className="text-[10px] text-[#adb5bd] uppercase tracking-wider">Name</label>
                                        <input
                                            className="mt-1 w-full bg-[#0d1117] border border-white/15 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#ff4500]"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            placeholder="Track name"
                                        />
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="text-[10px] text-[#adb5bd] uppercase tracking-wider">Country</label>
                                        <input
                                            className="mt-1 w-full bg-[#0d1117] border border-white/15 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#ff4500]"
                                            value={editCountry}
                                            onChange={e => setEditCountry(e.target.value)}
                                            placeholder="Country"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="text-[10px] text-[#adb5bd] uppercase tracking-wider">Type</label>
                                        <select
                                            className="mt-1 w-full bg-[#0d1117] border border-white/15 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#ff4500]"
                                            value={editType}
                                            onChange={e => setEditType(e.target.value)}
                                        >
                                            {TRACK_TYPES.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Error */}
                                    {saveError && (
                                        <p className="text-[#ff4444] text-xs">{saveError}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-1">
                                        <button
                                            onClick={saveEdits}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-[#ff4500] hover:bg-[#e63e00] disabled:opacity-50 text-white text-xs font-bold py-1.5 rounded transition-colors"
                                        >
                                            <Check size={12} />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            disabled={saving}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 rounded transition-colors"
                                        >
                                            <X size={12} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* ── VIEW MODE ── */
                                <div className="group">
                                    <div className="bg-[#ff4500] px-4 py-2 shadow-lg mb-2 inline-flex items-center gap-2">
                                        <h1 className="text-white font-bold text-lg uppercase tracking-wide">
                                            {trackDetail.name}
                                        </h1>
                                        <button
                                            onClick={startEditing}
                                            title="Edit track details"
                                            className="ml-1 text-white/60 hover:text-white transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    </div>
                                    <div className="text-white drop-shadow-md space-y-0.5 pointer-events-none">
                                        <p className="font-bold text-sm">{trackDetail.country}</p>
                                        <p className="text-sm">Type: <span className="font-bold">{trackDetail.type || 'Circuit'}</span></p>
                                        <p className="text-sm">Points: {trackDetail.points?.length || 0}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <TrackDetailMap center={mapCenter} path={mapPath} />

                        {/* Top Right Controls */}
                        <div className="absolute top-0 right-0 z-[500] bg-[#343a40] flex text-white text-[10px]">
                            <button className="px-3 py-1.5 hover:bg-white/10 border-r border-white/10 flex items-center gap-1">
                                <Plus size={12} /> New
                            </button>
                            <button className="px-3 py-1.5 bg-[#dc3545] hover:bg-[#c82333] flex items-center gap-1">
                                <Trash2 size={12} /> Delete track
                            </button>
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
