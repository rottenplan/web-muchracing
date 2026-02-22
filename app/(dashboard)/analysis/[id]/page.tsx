'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { notFound } from 'next/navigation';
import axios from 'axios';

import AnalysisHeader from '@/components/analysis/AnalysisHeader';
import LapsSidebar from '@/components/analysis/LapsSidebar';
import DataModeView from '@/components/analysis/DataModeView';
import MapModeView from '@/components/analysis/MapModeViewWrapper';
import DragSummaryView from '@/components/analysis/DragSummaryView';
import AIInsightsView from '@/components/analysis/AIInsightsView';

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for View Mode
    const [viewMode, setViewMode] = useState<'data' | 'map' | 'ai'>('data');
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
            <div className="flex flex-col h-screen bg-[#111] racing-gradient-bg items-center justify-center text-white">
                <div className="glass-card p-12 rounded-3xl flex flex-col items-center shadow-2xl scale-110">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-sm font-racing glow-text uppercase tracking-[0.3em] text-white">Syncing Telemetry...</p>
                    <div className="mt-4 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 animate-pulse w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !session) {
        return (
            <div className="flex flex-col h-screen bg-[#111] racing-gradient-bg items-center justify-center text-white p-6 text-center">
                <div className="glass-card border-red-500/20 p-10 rounded-2xl max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <div className="text-red-500 text-3xl font-bold italic">!</div>
                    </div>
                    <h2 className="text-2xl font-racing text-red-500 uppercase tracking-widest mb-3">Analysis Error</h2>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-tighter mb-8 leading-relaxed">
                        {error || 'The requested telemetry session could not be retrieved from the cloud storage.'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3 rounded-xl font-racing text-xs tracking-[0.2em] transition-all hover:scale-[1.02]"
                    >
                        RETRY SYNC
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0a0a0a] racing-gradient-bg text-white font-sans overflow-hidden">
            <AnalysisHeader
                session={session}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                <div className="w-80 h-full">
                    <LapsSidebar
                        session={session}
                        selectedLaps={selectedLaps}
                        toggleLap={toggleLap}
                    />
                </div>

                <main className="flex-1 glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl relative bg-black/40">
                    {viewMode === 'data' ? (
                        session.sessionType === 'DRAG' ? (
                            <DragSummaryView session={session} />
                        ) : (
                            <DataModeView
                                session={session}
                                selectedLaps={selectedLaps}
                                isPlaying={isPlaying}
                                setIsPlaying={setIsPlaying}
                                currentPointIndex={currentPointIndex}
                                setCurrentPointIndex={setCurrentPointIndex}
                            />
                        )
                    ) : viewMode === 'map' ? (
                        <MapModeView
                            session={session}
                            selectedLaps={selectedLaps}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            currentPointIndex={currentPointIndex}
                            setCurrentPointIndex={setCurrentPointIndex}
                        />
                    ) : (
                        <AIInsightsView
                            session={session}
                            selectedLaps={selectedLaps}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
