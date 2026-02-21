import { useState, useEffect, useRef } from 'react';
import mqtt from 'mqtt';

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
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const mqttClientRef = useRef<mqtt.MqttClient | null>(null);

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

    // Initial Fetch & Fallback Polling
    useEffect(() => {
        const fetchStatus = () => {
            fetch(`/api/device/status`)
                .then((res) => res.json())
                .then((json) => {
                    if (json.deviceId) {
                        setDeviceId(json.deviceId);
                    }

                    const telemetry = json.data;
                    if (telemetry) {
                        // Only update data from HTTP if MQTT is not active
                        if (!mqttClientRef.current?.connected) {
                            setData({
                                lat: Number(telemetry.lat) || 0,
                                lng: Number(telemetry.lng) || 0,
                                speed: Number(telemetry.speed) || 0,
                                rpm: Number(telemetry.rpm) || 0,
                                trip: Number(telemetry.trip) || 0,
                                sats: Number(telemetry.sats) || 0,
                                bat_voltage: telemetry.bat_v,
                                bat_percent: telemetry.bat_p,
                                is_charging: telemetry.is_charging
                            });
                            setConnected(telemetry.is_live || false);
                        }
                    }
                })
                .catch(() => {
                    if (!mqttClientRef.current?.connected) setConnected(false);
                });
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    // MQTT Logic
    useEffect(() => {
        if (!deviceId) return;

        // Use WebSockets for browser compatibility
        const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
        const topic = `muchracing/telemetry/${deviceId}`;

        console.log(`[MQTT] Connecting to ${brokerUrl} for device ${deviceId}`);

        try {
            const client = mqtt.connect(brokerUrl);
            mqttClientRef.current = client;

            client.on('connect', () => {
                console.log('[MQTT] Connected to broker');
                client.subscribe(topic);
            });

            client.on('message', (t, message) => {
                try {
                    const msg = JSON.parse(message.toString());
                    setData({
                        lat: msg.lat,
                        lng: msg.lng,
                        speed: msg.speed,
                        rpm: msg.rpm,
                        trip: 0, // Trip not yet in MQTT broadcast
                        sats: msg.sats,
                        bat_voltage: msg.vbat,
                        bat_percent: msg.pbat
                    });
                    setConnected(true);
                } catch (e) {
                    console.warn('[MQTT] Parse error', e);
                }
            });

            client.on('error', (err) => {
                console.error('[MQTT] Error', err);
            });

            return () => {
                console.log('[MQTT] Disconnecting');
                client.end();
                mqttClientRef.current = null;
            };
        } catch (err) {
            console.error('[MQTT] Connection failed', err);
        }
    }, [deviceId]);

    return { data, connected, isOnline };
}
