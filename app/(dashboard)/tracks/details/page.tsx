'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, ChevronRight, ChevronDown, Flag, Plus, Trash2, RotateCcw, Save } from 'lucide-react';
import dynamic from 'next/dynamic';

// Mock Data for Sidebar
const COUNTRIES = [
    { name: "My Own tracks", count: 1, flag: "🟠", tracks: ["Sentul International Karting"] },
    { name: "Argentina", count: 28, flag: "🇦🇷", tracks: [] },
    { name: "Australia", count: 133, flag: "🇦🇺", tracks: [] },
    { name: "Austria", count: 13, flag: "🇦🇹", tracks: [] },
    { name: "Bahrain", count: 4, flag: "🇧🇭", tracks: [] },
    { name: "Belarus", count: 5, flag: "🇧🇾", tracks: [] },
    { name: "Belgium", count: 13, flag: "🇧🇪", tracks: [] },
    { name: "Bolivia", count: 6, flag: "🇧🇴", tracks: [] },
    { name: "Brazil", count: 139, flag: "🇧🇷", tracks: [] },
];

const SELECTED_TRACK = {
    name: "Sirkuit Sentul Internasional Karting Cirkuit",
    location: "16810 BOGOR",
    length: "1211m",
    sectors: "no",
    center: [-6.5360, 106.8520],
    path: [
        [-6.5360, 106.8520], [-6.5358, 106.8525], [-6.5355, 106.8530], // Mock path
        [-6.5350, 106.8528], [-6.5348, 106.8522], [-6.5352, 106.8515],
        [-6.5360, 106.8520]
    ]
};

const MapController = ({ center }: { center: number[] }) => {
    const map = useMap();
    map.setView(center as [number, number], 17);
    return null;
};

export default function TrackDetailsPage() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>("My Own tracks");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6 relative overflow-hidden">
            {/* Left Sidebar: Track Browser */}
            <aside className="w-[300px] bg-[#1a1e21] flex flex-col border-r border-black/20 z-20">
                {/* Search Header */}
                <div className="p-2 bg-[#212529] border-b border-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder=""
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-white text-black px-2 py-1 text-sm rounded-sm focus:outline-none"
                        />
                        <button className="bg-[#28a745] text-white px-3 py-1 text-xs font-bold rounded-sm uppercase">
                            Filter
                        </button>
                    </div>
                </div>

                {/* Country List */}
                <div className="flex-1 overflow-y-auto">
                    {COUNTRIES.map((country) => (
                        <div key={country.name}>
                            <button
                                onClick={() => setSelectedCountry(selectedCountry === country.name ? null : country.name)}
                                className="w-full flex items-center justify-between px-3 py-2 border-b border-white/5 hover:bg-white/5 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="text-[#adb5bd] text-xs font-bold uppercase">{country.name} ({country.count})</span>
                                </div>
                            </button>

                            {/* Tracks Expansion */}
                            {selectedCountry === country.name && country.tracks.length > 0 && (
                                <div className="bg-[#111] py-1">
                                    {country.tracks.map(track => (
                                        <div key={track} className="px-8 py-2 text-xs text-white hover:bg-white/10 cursor-pointer flex items-center gap-2">
                                            <MapPin size={12} className="text-[#ff4500]" />
                                            {track}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative bg-[#0f1510]">
                {/* Header Overlay */}
                <div className="absolute top-8 left-8 z-[500] pointer-events-none">
                    <div className="bg-[#ff4500] px-4 py-2 shadow-lg mb-2 inline-block">
                        <h1 className="text-white font-bold text-lg uppercase tracking-wide">
                            {SELECTED_TRACK.name}
                        </h1>
                    </div>
                    <div className="text-white drop-shadow-md space-y-0.5">
                        <p className="font-bold text-sm">{SELECTED_TRACK.location}</p>
                        <p className="text-sm">Track length: <span className="font-bold">{SELECTED_TRACK.length}</span></p>
                        <p className="text-sm">[Sectors: {SELECTED_TRACK.sectors}]</p>
                    </div>
                </div>

                {/* Map */}
                <MapContainer
                    center={SELECTED_TRACK.center as [number, number]}
                    zoom={17}
                    className="w-full h-full z-0"
                    style={{ background: '#1a1a1a' }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                    />
                    <MapController center={SELECTED_TRACK.center} />

                    <Polyline
                        positions={SELECTED_TRACK.path as [number, number][]}
                        pathOptions={{ color: 'yellow', weight: 6, opacity: 0.8 }}
                    />
                    <Polyline
                        positions={SELECTED_TRACK.path as [number, number][]}
                        pathOptions={{ color: 'white', weight: 2, opacity: 0.5, dashArray: '5, 10' }}
                    />
                </MapContainer>

                {/* Bottom Sector Toolbar */}
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 p-2 z-[500] flex flex-col gap-2 border-t border-black/10">
                    <div className="flex items-center justify-between">
                        <span className="text-[#333] font-bold text-sm">Sectors:</span>
                        <span className="text-[10px] text-gray-500">Map tiles by Google</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-[#007bff] rounded-sm overflow-hidden">
                            <button className="px-3 py-1 hover:bg-white/10 text-white"><ChevronDown className="rotate-90" size={14} /></button>
                            <button className="px-3 py-1 hover:bg-white/10 text-white"><ChevronRight size={14} /></button>
                        </div>
                        <button className="bg-[#28a745] text-white px-4 py-1.5 text-xs font-bold rounded-sm hover:bg-[#218838]">Add</button>
                        <button className="bg-[#dc3545] text-white px-4 py-1.5 text-xs font-bold rounded-sm hover:bg-[#c82333]">delete</button>
                        <button className="bg-[#28a745] text-white px-4 py-1.5 text-xs font-bold rounded-sm hover:bg-[#218838]">Save</button>
                    </div>

                    {/* Timeline Slider */}
                    <div className="relative h-4 w-full bg-gray-200 rounded-full mt-1 cursor-pointer">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#007bff] rounded-full shadow-sm hover:scale-125 transition-transform" />
                    </div>
                </div>

                {/* Top Right Controls */}
                <div className="absolute top-0 right-0 z-[500] bg-[#343a40] flex text-white text-[10px]">
                    <button className="px-3 py-1.5 hover:bg-white/10 border-r border-white/10 flex items-center gap-1">
                        <Plus size={12} /> No sectors
                    </button>
                    <button className="px-3 py-1.5 hover:bg-white/10 border-r border-white/10">Delete</button>
                    <button className="px-3 py-1.5 bg-[#28a745] hover:bg-[#218838] border-r border-white/10">Default</button>
                    <button className="px-3 py-1.5 bg-[#dc3545] hover:bg-[#c82333] border-r border-white/10">Delete track</button>
                    <button className="px-3 py-1.5 hover:bg-white/10">New</button>
                </div>
            </main>
        </div>
    );
}
