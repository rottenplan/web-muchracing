'use client';

import { useState } from 'react';
import {
    MapPin,
    Plus,
    Layout,
    Compass,
    ArrowRight
} from 'lucide-react';
import TrackCreatorMapWrapper from '@/components/TrackCreatorMapWrapper';

interface TrackPoint {
    lat: number;
    lng: number;
}

export default function CreateTrack() {
    // Track Points & Sectors
    const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([]);
    const [sectors, setSectors] = useState<{ lat: number, lng: number }[]>([]);
    const [currentMarkerPos, setCurrentMarkerPos] = useState<TrackPoint | null>(null);

    // Form States
    const [country, setCountry] = useState('Indonesia');
    const [address, setAddress] = useState('');
    const [trackType, setTrackType] = useState('Race track');
    const [trackName, setTrackName] = useState('');
    const [phone, setPhone] = useState('');
    const [postCode, setPostCode] = useState('');
    const [city, setCity] = useState('');
    const [uid, setUid] = useState('{' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 6) + '-4a17-f55004e05d9b2}');
    const [startLineWidth, setStartLineWidth] = useState(12);
    const [startLineBearing, setStartLineBearing] = useState(0);

    const handlePointAdd = (lat: number, lng: number) => {
        setTrackPoints([...trackPoints, { lat, lng }]);
        setCurrentMarkerPos({ lat, lng });
    };

    const handleAddSector = () => {
        if (currentMarkerPos) {
            setSectors([...sectors, currentMarkerPos]);
        } else {
            alert("Klik peta terlebih dahulu untuk menentukan titik.");
        }
    };

    const handleRemoveLastPoint = () => {
        if (trackPoints.length > 0) {
            setTrackPoints(trackPoints.slice(0, -1));
        }
    };

    const handleNewTrack = () => {
        if (confirm("Reset pembuatan lintasan?")) {
            setTrackPoints([]);
            setSectors([]);
            setTrackName('');
            setAddress('');
        }
    };

    const handlePublishTrack = async () => {
        if (trackPoints.length < 3) {
            alert("Lintasan harus memiliki setidaknya 3 titik koordinat.");
            return;
        }
        alert("Lintasan berhasil dipublikasikan!");
    };

    return (
        <div className="flex h-[calc(100vh-64px)] -m-6"> {/* Undoing padding from layout */}
            {/* Control Panel Column */}
            <aside className="w-[300px] border-r border-black/20 bg-[#1a1e21] flex flex-col text-[#adb5bd] text-xs">
                <div className="h-14 bg-[#212529] flex items-center px-4 border-b border-black/10 shrink-0">
                    <MapPin className="mr-2 text-white" size={16} />
                    <span className="font-bold text-white text-sm">Track Creator</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <FormGroup label="Select a country:">
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        >
                            <option>Indonesia</option>
                        </select>
                    </FormGroup>

                    <FormGroup label="Address:">
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                        <button className="mt-2 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded font-bold transition-colors w-max">
                            Map update
                        </button>
                    </FormGroup>

                    <FormGroup label="Track type:">
                        <select
                            value={trackType}
                            onChange={(e) => setTrackType(e.target.value)}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        >
                            <option>Race track</option>
                            <option>Karting</option>
                            <option>Street</option>
                        </select>
                    </FormGroup>

                    <FormGroup label="Track name:">
                        <input
                            value={trackName}
                            onChange={(e) => setTrackName(e.target.value)}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                    </FormGroup>

                    <FormGroup label="Phone:">
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                    </FormGroup>

                    <FormGroup label="Post code:">
                        <input
                            value={postCode}
                            onChange={(e) => setPostCode(e.target.value)}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                    </FormGroup>

                    <FormGroup label="City:">
                        <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500" />
                    </FormGroup>

                    <FormGroup label="uid:">
                        <input
                            value={uid}
                            disabled
                            className="w-full bg-gray-100 text-gray-500 border border-gray-300 rounded px-2 py-1.5 cursor-not-allowed"
                        />
                    </FormGroup>

                    <FormGroup label="Start line width (meters):">
                        <input
                            type="number"
                            value={startLineWidth}
                            onChange={(e) => setStartLineWidth(Number(e.target.value))}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                    </FormGroup>

                    <FormGroup label="Start line bearing (degree):">
                        <input
                            type="number"
                            value={startLineBearing}
                            onChange={(e) => setStartLineBearing(Number(e.target.value))}
                            className="w-full bg-white text-black border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                        />
                    </FormGroup>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-1">
                        <button
                            onClick={handleRemoveLastPoint}
                            className="flex-1 bg-[#dc3545] hover:bg-[#c82333] text-white py-2 rounded font-bold transition-colors"
                        >
                            Remove Last Point
                        </button>
                        <button
                            onClick={handleNewTrack}
                            className="flex-1 bg-[#fd7e14] hover:bg-[#e96b02] text-white py-2 rounded font-bold transition-colors"
                        >
                            New track
                        </button>
                        <button
                            onClick={handlePublishTrack}
                            className="flex-1 bg-[#28a745] hover:bg-[#218838] text-white py-2 rounded font-bold transition-colors"
                        >
                            Save track
                        </button>
                    </div>

                    {/* Sectors */}
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-white">Sectors: {sectors.length}</span>
                            <button onClick={handleAddSector} className="text-[#17a2b8] hover:text-white flex items-center gap-1">
                                <Plus size={12} /> Add Sector
                            </button>
                        </div>
                    </div>

                </div>
            </aside>

            {/* Map Area */}
            <main className="flex-1 relative bg-[#0f1510]">
                <TrackCreatorMapWrapper
                    points={trackPoints}
                    sectors={sectors}
                    onPointAdd={handlePointAdd}
                />

                {/* Map Overlays (Mock controls matching screenshot) */}
                <div className="absolute top-16 right-4 flex flex-col gap-1 z-[1000]">
                    <MapControlBtn icon={<Layout size={16} />} />
                    <MapControlBtn icon={<Plus size={16} />} />
                    <MapControlBtn icon={<div className="h-0.5 w-3 bg-black"></div>} /> {/* Minus */}
                </div>

                <div className="absolute bottom-4 right-4 bg-white/80 px-2 py-0.5 text-[10px] text-black rounded z-[1000]">
                    Leaflet | Map data © Google
                </div>
            </main>
        </div>
    );
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <label className="block text-[#adb5bd]">{label}</label>
            {children}
        </div>
    );
}

function MapControlBtn({ icon }: { icon: React.ReactNode }) {
    return (
        <button className="w-8 h-8 bg-white border border-gray-300 rounded shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50">
            {icon}
        </button>
    )
}
