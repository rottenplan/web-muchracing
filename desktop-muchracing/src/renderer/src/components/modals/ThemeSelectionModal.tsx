import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layout, Maximize2, Map, Zap, Plane, Activity } from 'lucide-react';

interface ThemePreset {
    id: string;
    name: string;
    description: string;
    icon: ReactNode;
    layout: string;
}

const THEMES: ThemePreset[] = [
    { id: 'kart', name: 'Car - GoKart Race', description: 'Laps, sectors, speed and lean angle focus', icon: <Zap size={24} />, layout: 'Race Layout' },
    { id: 'running', name: 'Running', description: 'Map and heart rate centered layout', icon: <Activity size={24} />, layout: 'Health Layout' },
    { id: 'pro', name: 'Race Like a Pro', description: 'Advanced telemetry with G-Force radar', icon: <Maximize2 size={24} />, layout: 'Pro Layout' },
    { id: 'map_only', name: 'Map Only', description: 'Fullscreen satellite view with track tracing', icon: <Map size={24} />, layout: 'Geography Layout' },
    { id: 'drone', name: 'Drone (aerial)', description: 'Altitude and compass focus for FPV', icon: <Plane size={24} />, layout: 'Aviation Layout' },
    { id: 'split', name: 'Split Screen', description: 'Dashboard and video side-by-side', icon: <Layout size={24} />, layout: 'Productivity Layout' },
];

interface ThemeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTheme: (themeId: string) => void;
}

export default function ThemeSelectionModal({
    isOpen,
    onClose,
    onSelectTheme
}: ThemeSelectionModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div>
                                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Select a Theme</h1>
                                <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">New themes will be added if I'm not the only one using this software :-)</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {THEMES.map((theme) => (
                                <motion.div
                                    key={theme.id}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelectTheme(theme.id)}
                                    className="group cursor-pointer relative aspect-video bg-slate-800/40 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all shadow-xl hover:shadow-blue-500/10"
                                >
                                    {/* Placeholder for theme preview image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black flex items-center justify-center opacity-40 group-hover:opacity-20 transition-opacity" />

                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all group-hover:scale-110 shadow-lg">
                                            <div className="text-white">
                                                {theme.icon}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-white italic tracking-wider uppercase bg-black/40 px-3 py-1 rounded backdrop-blur-sm">{theme.name}</h3>
                                        <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-widest font-bold leading-relaxed">{theme.description}</p>
                                    </div>

                                    {/* Layout Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-[8px] font-black text-blue-400 uppercase tracking-widest">
                                            {theme.layout}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Custom Themes placeholder */}
                        <div className="p-4 bg-red-500 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-white">Custom themes:</span>
                            <X size={16} className="text-white cursor-pointer" />
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center">
                            <button
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl transition-all shadow-xl shadow-blue-900/20 flex items-center gap-3"
                            >
                                <Layout size={16} />
                                Load selected custom theme
                            </button>
                            <button
                                onClick={onClose}
                                className="px-10 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl transition-all shadow-xl shadow-red-900/20"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
