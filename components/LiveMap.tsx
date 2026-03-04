'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for Leaflet icons in Next.js
const FixLeafletIcon = () => {
    useEffect(() => {
        // @ts-ignore
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);
    return null;
};

// Component to center map on new coordinates
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

interface LiveMapProps {
    lat: number;
    lng: number;
    speed: number;
    rpm: number;
}

export default function LiveMap({ lat, lng, speed, rpm }: LiveMapProps) {
    const position: [number, number] = [lat || 0, lng || 0];

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-white/10 shadow-xl">
            <MapContainer
                center={position}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <FixLeafletIcon />
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
                />
                <Marker position={position}>
                    <Popup>
                        <div className="text-center">
                            <strong>Much Racing Pro</strong><br />
                            Speed: {speed.toFixed(1)} km/h<br />
                            RPM: {rpm}
                        </div>
                    </Popup>
                </Marker>
                <MapUpdater center={position} />
            </MapContainer>
        </div>
    );
}
