'use client';

import { Layers, Maximize, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MapModeView() {
    return (
        <div className="flex-1 relative bg-black overflow-hidden flex flex-col">
            {/* Toolbar Overlay */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className="bg-[#E0A800] text-black px-3 py-1 text-xs font-bold rounded shadow border border-black/20 flex items-center gap-2">
                    Data Mode
                </div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button className="w-8 h-8 bg-white text-black rounded shadow flex items-center justify-center hover:bg-gray-100"><Maximize size={16} /></button>
                <button className="w-8 h-8 bg-white text-black rounded shadow flex items-center justify-center hover:bg-gray-100 font-bold">+</button>
                <button className="w-8 h-8 bg-white text-black rounded shadow flex items-center justify-center hover:bg-gray-100 font-bold">-</button>
            </div>

            {/* Map Placeholder (Leaflet would go here) */}
            <div className="flex-1 bg-[#0f1510] relative">
                {/* Fake Satellite Map Image Placeholder */}
                <div className="absolute inset-0 opacity-50 bg-[url('https://mt1.google.com/vt/lyrs=s&x=1&y=1&z=1')] bg-cover filter grayscale sepia brightness-50 contrast-125"></div>

                {/* Fake Track Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                    <path
                        d="M200,500 C300,100 600,100 800,300 S 600,700 400,600 S 200,800 200,500"
                        fill="none"
                        stroke="#00bcd4"
                        strokeWidth="6"
                        strokeLinecap="round"
                    />
                    {/* Active Position */}
                    <circle cx="200" cy="500" r="8" fill="#E0A800" stroke="white" strokeWidth="2" />
                </svg>
            </div>

            {/* Bottom Controls Overlay */}
            <div className="h-48 bg-[#1a1a1a] border-t border-white/10 flex flex-col relative z-20">
                <div className="flex-1 relative">
                    {/* Mini Chart */}
                    <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none">
                        <path d="M0,50 Q200,10 400,80 T800,40 T1000,60" fill="none" stroke="#e83e8c" strokeWidth="2" />
                        <path d="M0,60 Q200,20 400,90 T800,50 T1000,70" fill="none" stroke="#20c997" strokeWidth="2" />
                    </svg>

                    {/* Scrubber */}
                    <div className="absolute top-0 bottom-0 left-[20%] w-[2px] bg-red-500 z-30">
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    </div>
                </div>

                <div className="h-8 bg-[#0a0a0a] flex items-center px-4 justify-between border-t border-white/5">
                    <span className="text-red-500 font-mono text-xs font-bold">00:00.000</span>
                    <div className="flex gap-4 text-[10px] text-white/50 uppercase">
                        <span>00:10.000</span>
                        <span>00:20.000</span>
                        <span>00:30.000</span>
                    </div>
                    <span className="text-white/50 font-mono text-xs">01:02.405</span>
                </div>
            </div>
        </div>
    );
}
