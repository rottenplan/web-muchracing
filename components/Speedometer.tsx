"use client";
import React from 'react';

interface SpeedometerProps {
    speed?: number;
    rpm?: number;
    maxSpeed?: number;
    maxRpm?: number;
}

export default function Speedometer({
    speed = 0,
    rpm = 0,
    maxSpeed = 200,
    maxRpm = 12000
}: SpeedometerProps) {

    // Safety clamp with NaN check
    const validSpeed = isNaN(speed) ? 0 : speed;
    const validRpm = isNaN(rpm) ? 0 : rpm;
    const safeSpeed = Math.min(Math.max(0, validSpeed), maxSpeed);
    const safeRpm = Math.min(Math.max(0, validRpm), maxRpm);

    // SVG Gauge Calculations
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (safeSpeed / maxSpeed) * circumference;

    // RPM Bar Width
    const rpmPercent = (safeRpm / maxRpm) * 100;

    return (
        <div className="flex items-center justify-center p-4">
            <div className="relative w-64 h-64 flex items-center justify-center">

                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-background-secondary opacity-30"></div>

                {/* SVG Gauge */}
                <svg
                    height={radius * 2}
                    width={radius * 2}
                    className="absolute transform -rotate-90"
                >
                    <circle
                        stroke="currentColor"
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, strokeLinecap: 'round' }}
                        r={normalizedRadius}
                        cx={radius}
                        cy={radius}
                        className="text-primary transition-all duration-100 ease-linear"
                    />
                </svg>

                {/* Center Digital Display */}
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-data font-bold text-foreground tabular-nums">
                        {Math.round(safeSpeed)}
                    </span>
                    <span className="text-xs font-racing text-text-secondary">KM/H</span>
                </div>

                {/* RPM Bar (Bottom) */}
                <div className="absolute bottom-4 w-48 h-2 bg-background-secondary rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-success via-warning to-error transition-all duration-100 ease-linear"
                        style={{ width: `${rpmPercent}%` }}
                    ></div>
                </div>
                <div className="absolute bottom-0 text-[10px] text-text-secondary font-mono">
                    {Math.round(safeRpm)} RPM
                </div>
            </div>
        </div>
    );
}
