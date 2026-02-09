'use client';

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackDetailMapProps {
    center: number[];
    path: number[][];
}

const MapController = ({ center }: { center: number[] }) => {
    const map = useMap();
    map.setView(center as [number, number], 17);
    return null;
};

const TrackDetailMap = ({ center, path }: TrackDetailMapProps) => {
    return (
        <MapContainer
            center={center as [number, number]}
            zoom={17}
            className="w-full h-full z-0"
            style={{ background: '#1a1a1a' }}
            zoomControl={false}
        >
            <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
            />
            <MapController center={center} />

            <Polyline
                positions={path as [number, number][]}
                pathOptions={{ color: 'yellow', weight: 6, opacity: 0.8 }}
            />
            <Polyline
                positions={path as [number, number][]}
                pathOptions={{ color: 'white', weight: 2, opacity: 0.5, dashArray: '5, 10' }}
            />
        </MapContainer>
    );
};

export default TrackDetailMap;
