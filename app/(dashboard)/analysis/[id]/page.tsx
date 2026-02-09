'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';

import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import LapsSidebar from '@/components/analysis/LapsSidebar';
import DataModeView from '@/components/analysis/DataModeView';
import MapModeView from '@/components/analysis/MapModeView';

// Dummy data fetcher for now, replace with database call later
async function getSession(id: string) {
    // Mock
    return {
        id,
        trackName: "Sentul Internasional Karting Sirkuit",
        startTime: new Date().toISOString(),
        laps: []
    };
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
    // Note: in Nextjs 15+ we might need to await params, usually it's passed as prop though
    const { id } = params;

    // State for View Mode
    const [viewMode, setViewMode] = useState<'data' | 'map'>('data');
    const [selectedLaps, setSelectedLaps] = useState<number[]>([1, 2, 3]); // Default select first few

    // This would be async in server component part, but we are mixing client state here.
    // Ideally we fetch data in a parent layout or server component then pass down.
    // For now using static stub data.
    const session = {
        id,
        trackName: "Sentul Internasional Karting Sirkuit",
        startTime: new Date().toISOString(),
    };

    const toggleLap = (idx: number) => {
        if (selectedLaps.includes(idx)) {
            setSelectedLaps(selectedLaps.filter(l => l !== idx));
        } else {
            setSelectedLaps([...selectedLaps, idx]);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
            <AnalysisHeader
                session={session}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Always visible in Data Mode? Or toggleable? Screenshot shows it in Data Mode */}
                {viewMode === 'data' && (
                    <LapsSidebar
                        session={session}
                        selectedLaps={selectedLaps}
                        toggleLap={toggleLap}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 flex">
                    {viewMode === 'data' ? (
                        <DataModeView session={session} selectedLaps={selectedLaps} />
                    ) : (
                        <MapModeView />
                    )}
                </main>
            </div>
        </div>
    );
}
