'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Save, Smartphone, MapPin, Zap, Thermometer, Radio, Cpu, Settings as SettingsIcon } from 'lucide-react';
import Image from 'next/image';

const COUNTRIES = [
    { name: 'My Own tracks', flag: '🏠', tracks: 12 },
    { name: 'Argentina', flag: 'AR', tracks: 45 },
    { name: 'Australia', flag: 'AU', tracks: 88 },
    { name: 'Austria', flag: 'AT', tracks: 32 },
    { name: 'Bahrain', flag: 'BH', tracks: 12 },
    { name: 'Belarus', flag: 'BY', tracks: 8 },
    { name: 'Belgium', flag: 'BE', tracks: 54 },
    { name: 'Bolivia', flag: 'BO', tracks: 15 },
    { name: 'Brazil', flag: 'BR', tracks: 120 },
    { name: 'Bulgaria', flag: 'BG', tracks: 22 },
    { name: 'Canada', flag: 'CA', tracks: 95 },
    { name: 'Chile', flag: 'CL', tracks: 40 },
    { name: 'China', flag: 'CN', tracks: 150 },
];

export default function MyDevicePage() {
    const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

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
                                        // Fallback icon if image not found
                                        (e.target as any).style.display = 'none';
                                    }}
                                />
                                <Smartphone size={32} className="text-white/50" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold leading-tight uppercase tracking-tight">MUCH_ad5918</h2>
                                <p className="text-xs text-white/70 font-mono">80:F3:DA:AD:59:18</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-[10px] uppercase opacity-70">Firmware Version</p>
                                <p className="text-lg font-bold">99935</p>
                            </div>
                        </div>

                        <div className="space-y-1 mb-8">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Memory used: 7 MB / 31992 MB - 0%</span>
                            </div>
                            <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                                <div className="h-full bg-white w-[1%] shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                            </div>
                        </div>

                        <div className="absolute bottom-4 right-4 text-[10px] text-white/70 italic uppercase">
                            Last synchronization: 2025-12-28 06:06:52
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
                            If you click on 'submit', on this form, next time you will synchronize your device, these settings will used on your device, existing settings on your device will be overwritten.
                        </p>

                        <SettingRow label="Speed Units:" value="Kmh" options={['Kmh', 'Mph']} />
                        <SettingRow label="Temperature Units:" value="Celcius" options={['Celcius', 'Fahrenheit']} />
                        <SettingRow label="GNSS mode:" value="GPS + Galileo + GLONASS + SBAS" options={['GPS + Galileo + GLONASS + SBAS', 'GPS Only', 'GPS + GLONASS']} />
                        <SettingRow label="UTC time zone:" value="UTC+07:00" options={['UTC+07:00', 'UTC+08:00', 'UTC+09:00']} />
                        <SettingRow label="Contrast:" value="160" options={['100', '130', '160', '190', '220']} />
                        <SettingRow label="Power save:" value="Sleep mode after 5 minutes inactivity" options={['Off', '1 min', '5 min', '10 min']} />
                        <SettingRow label="RPM max:" value="5000" options={['5000', '8000', '10000', '12000']} />
                        <SettingRow label="Speed max:" value="320" options={['100', '200', '320', '400']} />

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-gray-500 uppercase">GoPro wifi mac:</label>
                            <input
                                type="text"
                                defaultValue="D44169b523a9"
                                className="w-full bg-white dark:bg-[#1a1e21] border border-gray-300 dark:border-white/10 p-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#007bff] transition-colors"
                            />
                        </div>

                        <button className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white py-2 rounded-sm text-sm font-bold transition-colors shadow-sm mt-4">
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Track Selections */}
            <div className="flex-1 space-y-4">
                <div className="bg-white dark:bg-[#212529] p-4 border-l-4 border-gray-300 dark:border-white/20 mb-6">
                    <h3 className="text-lg font-normal text-gray-800 dark:text-gray-100">Tracks loaded on your device</h3>
                    <p className="text-[11px] text-gray-400 mt-1">
                        The more countries you select, longer will be the track detection on your device.
                    </p>
                </div>

                <div className="flex justify-start mb-4">
                    <button className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-4 py-2 rounded-sm text-sm font-bold transition-colors shadow-sm flex items-center gap-2">
                        <Save size={16} />
                        Save Track selection
                    </button>
                </div>

                <div className="space-y-2">
                    {COUNTRIES.map((country) => (
                        <div key={country.name} className="bg-black text-white rounded-sm overflow-hidden border border-white/5 shadow-sm group">
                            <div
                                className="p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedCountry(expandedCountry === country.name ? null : country.name)}
                            >
                                <div className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#fd7e14] focus:ring-[#fd7e14] checked:bg-[#fd7e14]"
                                        onClick={(e) => e.stopPropagation()}
                                        defaultChecked={country.name === 'My Own tracks'}
                                    />
                                    <span className="text-sm font-bold flex items-center gap-2 tracking-wide">
                                        <span className="opacity-70">{country.flag}</span>
                                        {country.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-white/40 uppercase font-mono">{country.tracks} tracks</span>
                                    {expandedCountry === country.name ? <ChevronUp size={14} className="text-white/40" /> : <ChevronDown size={14} className="text-white/40" />}
                                </div>
                            </div>

                            {expandedCountry === country.name && (
                                <div className="bg-[#1a1e21] p-4 text-xs text-white/60 font-mono border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Mock track list for expanded country */}
                                    <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors group">
                                        <input type="checkbox" className="w-3 h-3 rounded" />
                                        <span>Track Alpha - Circuit 1</span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                                        <input type="checkbox" className="w-3 h-3 rounded" />
                                        <span>Track Beta - Urban</span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                                        <input type="checkbox" className="w-3 h-3 rounded" />
                                        <span>Track Gamma - Hill Climb</span>
                                    </div>
                                    <div className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                                        <input type="checkbox" className="w-3 h-3 rounded" />
                                        <span>Track Delta - GP Circuit</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
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
