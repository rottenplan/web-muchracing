'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { notFound } from 'next/navigation';
import axios from 'axios';

import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import LapsSidebar from '@/components/analysis/LapsSidebar';
import DataModeView from '@/components/analysis/DataModeView';
import MapModeView from '@/components/analysis/MapModeView';

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for View Mode
    const [viewMode, setViewMode] = useState<'data' | 'map'>('data');
    const [selectedLaps, setSelectedLaps] = useState<number[]>([]);

    // Playback State (Lifted for cross-view synchronization)
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);

    // Fetch Session Data
    useEffect(() => {
        const fetchSession = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/sessions/${id}`);
                if (response.data.success) {
                    const sessionData = response.data.data;
                    setSession(sessionData);

                    // Default select the best lap if it exists
                    if (sessionData.laps && sessionData.laps.length > 0) {
                        const bestLap = [...sessionData.laps].sort((a, b) => a.lapTime - b.lapTime)[0];
                        setSelectedLaps([bestLap.lapNumber]);
                    } else if (sessionData.points.length > 0) {
                        setSelectedLaps([1]);
                    }
                } else {
                    setError(response.data.message || 'Gagal memuat sesi');
                }
            } catch (err: any) {
                console.error('Fetch session error:', err);
                setError(err.response?.data?.message || 'Terjadi kesalahan saat memuat data');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [id]);

    // Playback Ticker
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const points = session?.points || [];

        if (isPlaying && currentPointIndex < points.length - 1) {
            interval = setInterval(() => {
                setCurrentPointIndex(prev => {
                    if (prev >= points.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentPointIndex, session?.points]);

    const toggleLap = (lapNumber: number) => {
        if (selectedLaps.includes(lapNumber)) {
            setSelectedLaps(selectedLaps.filter(l => l !== lapNumber));
        } else {
            setSelectedLaps([...selectedLaps, lapNumber]);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-[#1a1a1a] items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5bc0de] mb-4"></div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#adb5bd]">Memuat Data Sesi...</p>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="flex flex-col h-screen bg-[#1a1a1a] items-center justify-center text-white p-6 text-center">
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-xl max-w-md">
                    <h2 className="text-xl font-black text-red-500 uppercase italic mb-2">Error!</h2>
                    <p className="text-[#adb5bd] text-sm mb-6">{error || 'Sesi tidak ditemukan'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-[#5bc0de] text-white px-6 py-2 rounded font-black uppercase text-xs tracking-widest hover:bg-[#46a3bf] transition-all"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#1a1a1a] text-white font-sans overflow-hidden">
            <AnalysisHeader
                session={session}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <div className="flex-1 flex overflow-hidden">
                <LapsSidebar
                    session={session}
                    selectedLaps={selectedLaps}
                    toggleLap={toggleLap}
                />

                <main className="flex-1 flex flex-col overflow-hidden">
                    {viewMode === 'data' ? (
                        <DataModeView
                            session={session}
                            selectedLaps={selectedLaps}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            currentPointIndex={currentPointIndex}
                            setCurrentPointIndex={setCurrentPointIndex}
                        />
                    ) : (
                        <MapModeView
                            session={session}
                            selectedLaps={selectedLaps}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            currentPointIndex={currentPointIndex}
                            setCurrentPointIndex={setCurrentPointIndex}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
