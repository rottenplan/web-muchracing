'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Clock, Timer, Zap } from "lucide-react";
import { useLiveTelemetry } from '@/hooks/useLiveTelemetry';
import Speedometer from "./Speedometer";

function formatSecs(secs: number | null) {
    if (!secs || secs <= 0) return "--.--";
    return secs.toFixed(2);
}

export default function DragModeView() {
    const { data, connected } = useLiveTelemetry();
    const [ip, setIp] = useState('192.168.4.1');
    const [zeroToSixty, setZeroToSixty] = useState<string>("--.--");
    const [zeroToHundred, setZeroToHundred] = useState<string>("--.--");
    const [hundredToTwoHundred, setHundredToTwoHundred] = useState<string>("--.--");
    const [eighthMile, setEighthMile] = useState<string>("--.--");
    const [quarterMile, setQuarterMile] = useState<string>("--.--");

    const runRef = useRef<{
        active: boolean;
        startTs?: number;
        start100Ts?: number | null;
        lastTs?: number;
        lastSpeedKmh?: number;
        distanceM: number;
    }>({
        active: false,
        startTs: undefined,
        start100Ts: null,
        lastTs: undefined,
        lastSpeedKmh: undefined,
        distanceM: 0
    });

    useEffect(() => {
        const ts = data.timestamp || Date.now();
        const speedKmh = Math.max(0, Number(data.speed) || 0);

        // Initialize time base
        if (!runRef.current.lastTs) {
            runRef.current.lastTs = ts;
            runRef.current.lastSpeedKmh = speedKmh;
            return;
        }

        // Integrate distance
        const dtSec = Math.max(0, (ts - (runRef.current.lastTs || ts)) / 1000);
        const speedMS = speedKmh * (1000 / 3600);
        runRef.current.distanceM += speedMS * dtSec;
        runRef.current.lastTs = ts;
        runRef.current.lastSpeedKmh = speedKmh;

        // Detect start (debounce from idle)
        if (!runRef.current.active) {
            const prev = runRef.current.lastSpeedKmh || 0;
            if (prev < 3 && speedKmh >= 5) {
                runRef.current.active = true;
                runRef.current.startTs = ts;
                runRef.current.start100Ts = null;
                runRef.current.distanceM = 0;
                setZeroToSixty("--.--");
                setZeroToHundred("--.--");
                setHundredToTwoHundred("--.--");
                setEighthMile("--.--");
                setQuarterMile("--.--");
            }
            return;
        }

        // Auto stop/reset condition (vehicle back to idle)
        if (runRef.current.active && speedKmh < 3) {
            runRef.current.active = false;
            runRef.current.startTs = undefined;
            runRef.current.start100Ts = null;
            runRef.current.distanceM = 0;
            return;
        }

        const startTs = runRef.current.startTs || ts;
        const elapsedSec = Math.max(0, (ts - startTs) / 1000);

        // 0-60
        if (zeroToSixty === "--.--" && speedKmh >= 60) {
            setZeroToSixty(formatSecs(elapsedSec));
        }

        // 0-100
        if (zeroToHundred === "--.--" && speedKmh >= 100) {
            setZeroToHundred(formatSecs(elapsedSec));
        }

        // 100-200
        if (!runRef.current.start100Ts && speedKmh >= 100) {
            runRef.current.start100Ts = ts;
        }
        if (hundredToTwoHundred === "--.--" && runRef.current.start100Ts && speedKmh >= 200) {
            const delta = (ts - runRef.current.start100Ts) / 1000;
            setHundredToTwoHundred(formatSecs(delta));
        }

        // 1/8 mile (201m) and 1/4 mile (402m)
        if (eighthMile === "--.--" && runRef.current.distanceM >= 201) {
            setEighthMile(formatSecs(elapsedSec));
        }
        if (quarterMile === "--.--" && runRef.current.distanceM >= 402) {
            setQuarterMile(formatSecs(elapsedSec));
        }
    }, [data.speed, data.timestamp]);

    return (
        <div className="w-full h-full flex flex-col p-4 relative">
            {/* Connection Status & IP Control (Top Right Aboslute) */}
            <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
                <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-[10px] text-white/70 font-data">{data.timestamp ? `${Math.max(0, Math.floor((Date.now() - data.timestamp) / 1000))}s` : ''}</span>
                <input
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="bg-black/50 text-white px-2 py-1 rounded border border-gray-700 w-28 text-xs backdrop-blur-sm"
                    placeholder="Device IP"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                {/* Left Side: BIG Speedometer */}
                <div className="flex flex-col items-center justify-center relative p-6 bg-background-secondary/30 rounded-2xl border border-white/5">
                    <Speedometer speed={data.speed} rpm={data.rpm} />
                </div>

                {/* Right Side: Drag Times Grid */}
                <div className="grid grid-cols-1 gap-3 content-center">
                    <DragStatRow label="0 - 60 KM/H" time={zeroToSixty} icon={<Zap className="w-4 h-4 text-warning" />} />
                    <DragStatRow label="0 - 100 KM/H" time={zeroToHundred} icon={<Activity className="w-4 h-4 text-primary" />} active />
                    <DragStatRow label="100 - 200 KM/H" time={hundredToTwoHundred} icon={<Timer className="w-4 h-4 text-highlight" />} />
                    <div className="my-2 border-t border-white/10"></div>
                    <DragStatRow label="201m (1/8 Mile)" time={eighthMile} icon={<Clock className="w-4 h-4 text-text-secondary" />} />
                    <DragStatRow label="402m (1/4 Mile)" time={quarterMile} icon={<Clock className="w-4 h-4 text-text-secondary" />} />
                </div>
            </div>
        </div>
    );
}

function DragStatRow({ label, time, icon, active = false }: { label: string, time: string, icon: React.ReactNode, active?: boolean }) {
    return (
        <div className={`
            flex items-center justify-between p-4 rounded-xl border transition-all duration-300
            ${active
                ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'bg-background-secondary/50 border-white/5 hover:border-white/10'
            }
        `}>
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${active ? 'bg-primary/20' : 'bg-black/30'}`}>
                    {icon}
                </div>
                <span className={`font-racing text-sm ${active ? 'text-white' : 'text-text-secondary'}`}>
                    {label}
                </span>
            </div>
            <div className={`font-data text-2xl font-bold ${active ? 'text-primary' : 'text-white'}`}>
                {time} <span className="text-xs text-text-secondary font-normal ml-1">s</span>
            </div>
        </div>
    );
}
