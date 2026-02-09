'use client';

import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl } from 'react-leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Info, ArrowRight, Activity, Lightbulb } from 'lucide-react';

// Fix for Leaflet icons in Next.js
const FixLeafletIcon = () => {
    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);
    return null;
};

// Mock Data for Global Tracks
const MOCK_TRACKS = [
    { id: 1, name: "Sentul International Circuit", lat: -6.5360, lng: 106.8520, country: "Indonesia" },
    { id: 2, name: "Mandalika International Street Circuit", lat: -8.8920, lng: 116.2950, country: "Indonesia" },
    { id: 3, name: "Sepang International Circuit", lat: 2.7606, lng: 101.7371, country: "Malaysia" },
    { id: 4, name: "Chang International Circuit", lat: 14.9600, lng: 103.1110, country: "Thailand" },
    { id: 5, name: "Suzuka Circuit", lat: 34.8431, lng: 136.5410, country: "Japan" },
    { id: 6, name: "Fuji Speedway", lat: 35.3700, lng: 138.9270, country: "Japan" },
    { id: 7, name: "Marina Bay Street Circuit", lat: 1.2914, lng: 103.8640, country: "Singapore" },
    { id: 8, name: "Shanghai International Circuit", lat: 31.3390, lng: 121.2220, country: "China" },
    { id: 9, name: "Yas Marina Circuit", lat: 24.4670, lng: 54.6030, country: "UAE" },
    { id: 10, name: "Bahrain International Circuit", lat: 26.0325, lng: 50.5106, country: "Bahrain" },
    { id: 11, name: "Silverstone Circuit", lat: 52.0786, lng: -1.0169, country: "UK" },
    { id: 12, name: "Monza Circuit", lat: 45.6190, lng: 9.2810, country: "Italy" },
    { id: 13, name: "Circuit de Spa-Francorchamps", lat: 50.4372, lng: 5.9714, country: "Belgium" },
    { id: 14, name: "Nürburgring", lat: 50.3356, lng: 6.9475, country: "Germany" },
    { id: 15, name: "Circuit de Barcelona-Catalunya", lat: 41.5700, lng: 2.2611, country: "Spain" },
    { id: 16, name: "Circuit of the Americas", lat: 30.1328, lng: -97.6411, country: "USA" },
    { id: 17, name: "Interlagos Circuit", lat: -23.7036, lng: -46.6997, country: "Brazil" },
    { id: 18, name: "Albert Park Circuit", lat: -37.8497, lng: 144.9680, country: "Australia" },
    { id: 19, name: "Red Bull Ring", lat: 47.2197, lng: 14.7644, country: "Austria" },
    { id: 20, name: "Hungaroring", lat: 47.5817, lng: 19.2486, country: "Hungary" },
];

export default function TracksDatabasePage() {
    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="bg-[#212529] p-3 border-l-4 border-[#e0a800]">
                <h1 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={20} className="text-[#e0a800]" />
                    Karting Tracks database
                </h1>
            </div>

            {/* Stats & Info Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Stats Card */}
                <div className="bg-white rounded-sm p-6 shadow-sm flex items-center gap-6 relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full bg-[#dc3545] flex items-center justify-center shrink-0 shadow-lg z-10">
                        <MapPin className="text-white w-8 h-8" />
                    </div>
                    <div className="z-10">
                        <h2 className="text-[#dc3545] text-3xl font-bold leading-none">48 countries</h2>
                        <h3 className="text-black text-xl font-bold">1743 tracks in the box</h3>
                        <a href="#" className="text-[#007bff] text-xs hover:underline mt-1 block">
                            Automatically detected and Supported tracks
                        </a>
                    </div>
                    {/* Background Pattern */}
                    <MapPin className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-100 z-0" />
                </div>

                {/* Right: Info Banner (Blue) */}
                <div className="bg-[#17a2b8] rounded-sm p-6 text-white shadow-sm flex gap-4 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="z-10">
                        <h2 className="text-lg font-bold mb-1">Auto-learning mode</h2>
                        <p className="text-xs text-white/90 leading-relaxed">
                            Your favorite tracks are not yet included in the FoxLap telemetry recorder? Don't worry, the auto learning mode will allow you to easily create your track. Just drive for 1 lap on it, then the <strong>FoxLap</strong> algorithm will automatically create the track for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden relative min-h-[500px]">
                <MapContainer
                    center={[20, 0] as [number, number]}
                    zoom={2}
                    className="w-full h-full z-0"
                    style={{ background: '#aad3df' }}
                    minZoom={2}
                >
                    <LayersControl position="topright">
                        <LayersControl.BaseLayer checked name="OpenStreetMap">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Satellite">
                            <TileLayer
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                                attribution='&copy; Esri'
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>

                    <FixLeafletIcon />

                    {MOCK_TRACKS.map((track) => (
                        <CircleMarker
                            key={track.id}
                            center={[track.lat, track.lng]}
                            radius={6}
                            pathOptions={{
                                fillColor: '#17a2b8',
                                fillOpacity: 0.8,
                                color: 'white',
                                weight: 2
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <h3 className="font-bold text-sm">{track.name}</h3>
                                    <p className="text-xs text-gray-500">{track.country}</p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

