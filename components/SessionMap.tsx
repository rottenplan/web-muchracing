"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix Leaflet Icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface SessionMapProps {
    points: { lat: number; lng: number }[];
    startPoint?: { lat: number; lng: number };
    currentIdx?: number;
    lapMarkers?: number[]; // indices of lap markers
}

// Sentul Circuit Approx Coords (Placeholder default)
const SENTUL_COORDS: [number, number] = [-6.535, 106.858];

export default function SessionMap({ points, startPoint, currentIdx, lapMarkers }: SessionMapProps) {
    const [center, setCenter] = useState<[number, number]>(SENTUL_COORDS);
    const validPoints = points.filter(p => p.lat && p.lng && p.lat !== 0 && p.lng !== 0);

    useEffect(() => {
        if (validPoints.length > 0) {
            // Calculate center of the bounds
            const lats = validPoints.map(p => p.lat);
            const lngs = validPoints.map(p => p.lng);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            setCenter([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
        }
    }, [points]);

    const polylinePositions = validPoints.map(p => [p.lat, p.lng] as [number, number]);

    return (
        <div className="w-full h-full rounded-xl overflow-hidden relative z-0">
            <MapContainer center={center} zoom={16} style={{ height: "100%", width: "100%" }}>
                {/* Google Satellite */}
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
                    maxZoom={20}
                />

                {/* Racing Line */}
                <Polyline
                    positions={polylinePositions}
                    pathOptions={{ color: '#00f2ff', weight: 4, opacity: 0.8 }}
                />

                {/* Lap/Sector Markers (Red Lines) */}
                {lapMarkers?.map((idx, i) => {
                    const p = validPoints[idx];
                    if (!p) return null;
                    // Draw a small red line across the track
                    return (
                        <CircleMarker
                            key={i}
                            center={[p.lat, p.lng]}
                            radius={8}
                            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.5 }}
                        >
                            <Popup>Sector {i + 1}</Popup>
                        </CircleMarker>
                    );
                })}

                {/* Start/Finish Marker */}
                {validPoints.length > 0 && (
                    <Marker position={[validPoints[0].lat, validPoints[0].lng]}>
                        <Popup>Start/Finish</Popup>
                    </Marker>
                )}

                {/* Current Playback Position */}
                {currentIdx !== undefined && validPoints[currentIdx] && (
                    <Marker
                        position={[validPoints[currentIdx].lat, validPoints[currentIdx].lng]}
                        icon={L.divIcon({
                            className: "bg-white border-2 border-red-500 rounded-full w-4 h-4 shadow-lg",
                            html: `<div class="w-2 h-2 bg-red-500 rounded-full m-0.5 animate-pulse"></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        })}
                    />
                )}
            </MapContainer>

            {/* Map Overlay Label */}
            <div className="absolute top-4 left-4 z-[400] bg-black/80 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#ef4444]" />
                <span className="text-white">Telemetry Trajectory Overlay</span>
            </div>
        </div>
    );
}
