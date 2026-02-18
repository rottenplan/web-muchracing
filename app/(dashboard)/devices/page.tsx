'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, Smartphone, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Track {
    id: string;
    name: string;
    country: string;
    createdBy?: string;
    pathFile: string;
}

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    settings: any;
    lastConnection: string;
    tracks: {
        countries: string[];
    };
}

export default function MyDevicePage() {
    const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    // Determine which countries define "My Own Tracks" (usually none, it's a special category)
    // We will separate tracks into "My Own" and "By Country"

    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User
                const userRes = await fetch('/api/auth/me');
                const userData = await userRes.json();

                // Fetch Tracks
                const tracksRes = await fetch('/api/tracks/list');
                const tracksData = await tracksRes.json();

                if (userData.success) {
                    setUser(userData.user);
                    setSelectedCountries(userData.user.tracks?.countries || []);
                }

                if (tracksData.success) {
                    setTracks(tracksData.tracks);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Group Tracks
    const myTracks = user ? tracks.filter(t => t.createdBy === user._id) : [];
    const otherTracks = user ? tracks.filter(t => t.createdBy !== user._id) : tracks;

    // Group other tracks by country
    const countriesMap: { [key: string]: Track[] } = {};
    otherTracks.forEach(t => {
        const c = t.country || 'Unknown';
        if (!countriesMap[c]) countriesMap[c] = [];
        countriesMap[c].push(t);
    });

    const sortedCountries = Object.keys(countriesMap).sort();

    const handleSaveSelection = async () => {
        alert("Saving track selection is not yet implemented on the API side, but frontend logic is ready.");
        // Logic to save selectedCountries to user profile would go here
    };

    const toggleCountrySelection = (countryName: string) => {
        if (selectedCountries.includes(countryName)) {
            setSelectedCountries(selectedCountries.filter(c => c !== countryName));
        } else {
            setSelectedCountries([...selectedCountries, countryName]);
        }
    };

    if (loading) return <div className="p-8 text-center text-text-secondary">Loading devices...</div>;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column: Stats & Settings */}
            <div className="w-full lg:w-1/3 space-y-6">
                {/* Device Status Banner */}
                <div className="bg-[#17a2b8] rounded-sm shadow-sm overflow-hidden text-white relative h-64">
                    <div className="p-6">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 overflow-hidden shrink-0">
                                <Image
                                    src="/images/device_avatar.png"
                                    alt="Device"
                                    width={64}
                                    height={64}
                                    className="object-cover opacity-80"
                                    onError={(e) => {
                                        (e.target as any).style.display = 'none';
                                    }}
                                />
                                <Smartphone size={32} className="text-white/50" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold leading-tight uppercase tracking-tight">
                                    {user?.username || 'GUEST'}
                                </h2>
                                <p className="text-xs text-white/70 font-mono">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-[10px] uppercase opacity-70">Status</p>
                                <p className="text-lg font-bold">
                                    {user?.lastConnection && new Date(user.lastConnection).getTime() > Date.now() - 86400000 ? 'ONLINE' : 'OFFLINE'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1 mb-8">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Track Storage: {selectedCountries.length} Countries Selected</span>
                            </div>
                            <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                                <div className="h-full bg-white transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${Math.min(100, (selectedCountries.length / 10) * 100)}%` }} />
                            </div>
                        </div>

                        <div className="absolute bottom-4 right-4 text-[10px] text-white/70 italic uppercase">
                            Last sync: {user?.lastConnection ? new Date(user.lastConnection).toLocaleString() : 'Never'}
                        </div>
                    </div>
                </div>

                {/* Device Settings Form */}
                <div className="bg-white dark:bg-[#212529] rounded-sm shadow-sm border border-gray-200 dark:border-white/5">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">Device settings</h3>
                        <SettingsIcon size={14} className="text-gray-400" />
                    </div>
                    <div className="p-5 space-y-4">
                        <p className="text-[10px] text-gray-400 italic mb-2">
                            Settings are synced automatically when the device connects.
                        </p>

                        {/* Read-only view of settings for now, as editing is in Account or separate page */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col">
                                <span className="text-gray-500 uppercase font-bold text-[10px]">Speed Units</span>
                                <span className="text-foreground">{user?.settings?.units || 'Kmh'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 uppercase font-bold text-[10px]">Temp Units</span>
                                <span className="text-foreground">{user?.settings?.temperature || 'Celsius'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 uppercase font-bold text-[10px]">GNSS</span>
                                <span className="text-foreground">{user?.settings?.gnss || 'GPS'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 uppercase font-bold text-[10px]">Refresh Rate</span>
                                <span className="text-foreground">10 Hz</span>
                            </div>
                        </div>

                        <button className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white py-2 rounded-sm text-sm font-bold transition-colors shadow-sm mt-4 opacity-50 cursor-not-allowed">
                            Edit Settings (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Track Selections */}
            <div className="flex-1 space-y-4">
                <div className="bg-white dark:bg-[#212529] p-4 border-l-4 border-gray-300 dark:border-white/20 mb-6">
                    <h3 className="text-lg font-normal text-gray-800 dark:text-gray-100">Tracks loaded on your device</h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                        Select which countries/categories of tracks you want to sync to your device.
                    </p>
                </div>

                <div className="flex justify-start mb-4">
                    <button
                        onClick={handleSaveSelection}
                        className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-2 rounded-sm text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Save size={16} />
                        Save Track selection
                    </button>
                </div>

                <div className="space-y-2">
                    {/* MY OWN TRACKS SECTION */}
                    <div className="bg-black text-white rounded-sm overflow-hidden border border-white/5 shadow-sm group">
                        <div
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedCountry(expandedCountry === 'MY_TRACKS' ? null : 'MY_TRACKS')}
                        >
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    checked={true} // Always checked for My Tracks? Or configurable
                                    readOnly
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#fd7e14] focus:ring-[#fd7e14] checked:bg-[#fd7e14]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm font-bold flex items-center gap-2 tracking-wide">
                                    <span className="opacity-70">🏠</span>
                                    My Own tracks
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-white/40 uppercase font-mono">{myTracks.length} tracks</span>
                                {expandedCountry === 'MY_TRACKS' ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                            </div>
                        </div>

                        {expandedCountry === 'MY_TRACKS' && (
                            <div className="bg-[#1a1e21] p-4 text-xs text-white/60 font-mono border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {myTracks.length > 0 ? myTracks.map(track => (
                                    <div key={track.id} className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors group">
                                        <div className="w-1.5 h-1.5 rounded-full bg-highlight"></div>
                                        <span>{track.name}</span>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-white/30 italic">No custom tracks created yet.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* DYNAMIC COUNTRIES */}
                    {sortedCountries.length > 0 ? sortedCountries.map((country) => (
                        <div key={country} className="bg-black text-white rounded-sm overflow-hidden border border-white/5 shadow-sm group">
                            <div
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedCountry(expandedCountry === country ? null : country)}
                            >
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#fd7e14] focus:ring-[#fd7e14] checked:bg-[#fd7e14]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCountrySelection(country);
                                        }}
                                        checked={selectedCountries.includes(country)}
                                    />
                                    <span className="text-sm font-bold flex items-center gap-2 tracking-wide">
                                        <span className="opacity-70">🏳️</span>
                                        {country}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-white/40 uppercase font-mono">{countriesMap[country].length} tracks</span>
                                    {expandedCountry === country ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                                </div>
                            </div>

                            {expandedCountry === country && (
                                <div className="bg-[#1a1e21] p-4 text-xs text-white/60 font-mono border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {countriesMap[country].map(track => (
                                        <div key={track.id} className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors group">
                                            <input type="checkbox" className="w-3 h-3 rounded opacity-50" disabled checked />
                                            <span>{track.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="p-4 text-center text-text-secondary italic">No other tracks found in database.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingRow({ label, value, options }: { label: string; value: string; options: string[] }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/5 pb-2">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</label>
            <select className="bg-white dark:bg-[#1a1e21] border border-gray-300 dark:border-white/10 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 focus:outline-none transition-colors min-w-[150px]">
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}
