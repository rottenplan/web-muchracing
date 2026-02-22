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
    timestamp?: number;
}

export function useLiveTelemetry() {
    const [data, setData] = useState<TelemetryData>({ lat: 0, lng: 0, speed: 0, rpm: 0, trip: 0, sats: 0 });
    const [connected, setConnected] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
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
                                is_charging: telemetry.is_charging,
                                timestamp: Number(telemetry.timestamp) || Date.now()
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
            const client = mqtt.connect(brokerUrl, {
                reconnectPeriod: 2000, // 2s
                connectTimeout: 5000,
                keepalive: 30,
                clientId: `web-${deviceId}-${Math.random().toString(16).slice(2)}`
            });
            mqttClientRef.current = client;

            client.on('connect', () => {
                console.log('[MQTT] Connected to broker');
                client.subscribe(topic);
                setConnected(true);
                setError(null);
                setRetryCount(0);
            });

            client.on('message', (t, message) => {
                try {
                    const msg = JSON.parse(message.toString());
                    setData({
                        lat: Number(msg.lat) || 0,
                        lng: Number(msg.lng ?? msg.lon) || 0,
                        speed: Number(msg.speed) || 0,
                        rpm: Number(msg.rpm) || 0,
                        trip: 0, // Trip not yet in MQTT broadcast
                        sats: Number(msg.sats) || 0,
                        bat_voltage: Number(msg.vbat),
                        bat_percent: Number(msg.pbat),
                        timestamp: Number(msg.ts ?? msg.timestamp) || Date.now()
                    });
                    setConnected(true);
                    setError(null);
                } catch (e) {
                    console.warn('[MQTT] Parse error', e);
                }
            });

            client.on('error', (err) => {
                console.error('[MQTT] Error', err);
                setConnected(false);
                setError('MQTT error: ' + (err?.message || 'unknown'));
            });

            client.on('reconnect', () => {
                setConnected(false);
                setRetryCount((c) => c + 1);
            });

            client.on('close', () => {
                setConnected(false);
            });

            return () => {
                console.log('[MQTT] Disconnecting');
                client.end();
                mqttClientRef.current = null;
            };
        } catch (err) {
            console.error('[MQTT] Connection failed', err);
            setError('MQTT connection failed');
        }
    }, [deviceId]);

    return { data, connected, isOnline, error, retryCount };
}
