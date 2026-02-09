import { useState, useEffect } from 'react';

export interface TelemetryData {
    lat: number;
    lng: number;
    speed: number;
    rpm: number;
    trip: number;
    sats: number;
    bat_voltage?: number;
    bat_percent?: number;
    is_charging?: boolean;
}

export function useLiveTelemetry() {
    const [data, setData] = useState<TelemetryData>({ lat: 0, lng: 0, speed: 0, rpm: 0, trip: 0, sats: 0 });
    const [connected, setConnected] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
            const handleOnline = () => setIsOnline(true);
            const handleOffline = () => setIsOnline(false);

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetch(`/api/device/status`) // Fetch from our own API bridge
                .then((res) => res.json())
                .then((json) => {
                    const telemetry = json.data || json;
                    setData({
                        lat: Number(telemetry.lat) || 0,
                        lng: Number(telemetry.lng) || 0,
                        speed: Number(telemetry.speed) || 0,
                        rpm: Number(telemetry.rpm) || 0,
                        trip: Number(telemetry.trip) || 0,
                        sats: Number(telemetry.sats) || 0,
                        bat_voltage: telemetry.bat_voltage,
                        bat_percent: telemetry.bat_percent,
                        is_charging: telemetry.is_charging
                    });
                    setConnected(telemetry.is_live || false);
                })
                .catch(() => setConnected(false));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return { data, connected, isOnline };
}
