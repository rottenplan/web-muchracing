'use client';

import { MapPin, Info, ArrowRight, Activity, Lightbulb } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the Map component with SSR disabled
const TracksDatabaseMap = dynamic(() => import('@/components/TracksDatabaseMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#aad3df] flex items-center justify-center text-gray-500">Loading Tracks Map...</div>
});

import { useState, useEffect } from 'react';

export default function TracksDatabasePage() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const res = await fetch('/api/tracks/list');
                const data = await res.json();
                if (data.success) {
                    setTracks(data.tracks);
                }
            } catch (error) {
                console.error('Failed to load tracks', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTracks();
    }, []);

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header */}
            <div className="bg-[#212529] p-3 border-l-4 border-[#e0a800]">
                <h1 className="text-white font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={20} className="text-[#e0a800]" />
                    Karting Tracks database
                </h1>
            </div>

            {/* Stats & Info Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Stats Card */}
                <div className="bg-white rounded-sm p-6 shadow-sm flex items-center gap-6 relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full bg-[#dc3545] flex items-center justify-center shrink-0 shadow-lg z-10">
                        <MapPin className="text-white w-8 h-8" />
                    </div>
                    <div className="z-10">
                        <h2 className="text-[#dc3545] text-3xl font-bold leading-none">Global</h2>
                        <h3 className="text-black text-xl font-bold">{loading ? 'Loading...' : `${tracks.length} tracks in the box`}</h3>
                        <a href="#" className="text-[#007bff] text-xs hover:underline mt-1 block">
                            Automatically detected and Supported tracks
                        </a>
                    </div>
                    {/* Background Pattern */}
                    <MapPin className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-100 z-0" />
                </div>

                {/* Right: Info Banner (Blue) */}
                <div className="bg-[#17a2b8] rounded-sm p-6 text-white shadow-sm flex gap-4 relative overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Lightbulb className="w-6 h-6 text-white" />
                    </div>
                    <div className="z-10">
                        <h2 className="text-lg font-bold mb-1">Auto-learning mode</h2>
                        <p className="text-xs text-white/90 leading-relaxed">
                            Your favorite tracks are not yet included in the FoxLap telemetry recorder? Don't worry, the auto learning mode will allow you to easily create your track. Just drive for 1 lap on it, then the <strong>FoxLap</strong> algorithm will automatically create the track for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden relative min-h-[500px]">
                <TracksDatabaseMap tracks={tracks} />
            </div>
        </div>
    );
}
