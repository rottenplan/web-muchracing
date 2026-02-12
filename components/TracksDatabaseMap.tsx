'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
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

interface TracksDatabaseMapProps {
    tracks: Array<{
        id: number;
        name: string;
        lat: number;
        lng: number;
        country: string;
    }>;
}

const TracksDatabaseMap = ({ tracks }: TracksDatabaseMapProps) => {
    return (
        <MapContainer
            center={[20, 0] as [number, number]}
            zoom={2}
            className="w-full h-full z-0"
            style={{ background: '#aad3df' }}
        >
            <FixLeafletIcon />
            <TileLayer
                attribution='&copy; Google Maps'
                url="http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}"
            />

            {tracks.map(track => (
                <CircleMarker
                    key={track.id}
                    center={[track.lat, track.lng]}
                    radius={5}
                    pathOptions={{ color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.8 }}
                >
                    <Popup>
                        <div className="text-center">
                            <MapPin className="mx-auto text-[#dc3545] mb-1" size={16} />
                            <strong className="block text-sm">{track.name}</strong>
                            <span className="text-xs text-gray-500">{track.country}</span>
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
};

export default TracksDatabaseMap;
