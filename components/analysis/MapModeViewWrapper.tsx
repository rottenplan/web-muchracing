'use client';

import dynamic from 'next/dynamic';

const MapModeView = dynamic(() => import('./MapModeView'), {
    ssr: false,
    loading: () => (
        <div className="flex-1 min-h-[400px] bg-[#0a0a0a] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0de]"></div>
                <p className="text-[10px] font-black text-[#5bc0de] uppercase tracking-[0.3em]">Initializing Map Engine...</p>
            </div>
        </div>
    )
});

interface MapModeViewProps {
    session: any;
    selectedLaps: number[];
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentPointIndex: number;
    setCurrentPointIndex: (index: number) => void;
}

export default function MapModeViewWrapper(props: MapModeViewProps) {
    return <MapModeView {...props} />;
}
