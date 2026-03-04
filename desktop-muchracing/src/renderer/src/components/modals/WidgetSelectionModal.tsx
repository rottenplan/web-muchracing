import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Activity, Navigation2, Map as MapIcon, Gauge, Satellite, Mountain } from 'lucide-react';

interface WidgetDef {
    id: string;
    name: string;
    description: string;
    category: 'performance' | 'sensors' | 'maps' | 'utility';
    icon: ReactNode;
}

const ALL_WIDGETS: WidgetDef[] = [
    { id: 'speed', name: 'Speedometer', description: 'Digital & Analog speed display', category: 'performance', icon: <Gauge size={24} /> },
    { id: 'lean', name: 'Lean Angle', description: 'Motorcycle lean angle visualization', category: 'performance', icon: <Zap size={24} /> },
    { id: 'gforce', name: 'G-Force Radar', description: 'Lateral and longitudinal G-forces', category: 'performance', icon: <Activity size={24} /> },
    { id: 'minimap', name: 'Dynamic Map', description: 'GPS track tracing and position', category: 'maps', icon: <MapIcon size={24} /> },
    { id: 'gear', name: 'Gear Indicator', description: 'Current gear & RPM bar', category: 'performance', icon: <Navigation2 size={24} className="rotate-90" /> },
    { id: 'heart', name: 'Heart Rate', description: 'Live BPM from sensor data', category: 'sensors', icon: <Activity size={24} className="text-red-500" /> },
    { id: 'altitude', name: 'Altitude', description: 'Elevation and vertical speed', category: 'sensors', icon: <Mountain size={24} /> },
    { id: 'compass', name: 'Compass', description: 'Directional heading dial', category: 'maps', icon: <Navigation2 size={24} /> },
    { id: 'satellites', name: 'Satellites', description: 'GPS signal and satellite count', category: 'utility', icon: <Satellite size={24} /> },
];

interface WidgetSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeWidgets: Record<string, boolean>;
    onToggleWidget: (id: string) => void;
}

export default function WidgetSelectionModal({
    isOpen,
    onClose,
    activeWidgets,
    onToggleWidget
}: WidgetSelectionModalProps) {
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
                        className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div>
                                <h2 className="text-2xl font-black text-white italic tracking-widest uppercase">Widget Overlay Selection</h2>
                                <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-bold">Select the instruments you want to display on your dashboard</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search & Filter (Placeholder for pro look) */}
                        <div className="px-6 py-4 bg-black/20 flex gap-4">
                            <div className="px-4 py-2 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest text-white cursor-pointer">All Instruments</div>
                            <div className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white cursor-pointer transition-colors">Performance</div>
                            <div className="px-4 py-2 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white cursor-pointer transition-colors">Sensors</div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {ALL_WIDGETS.map((widget) => {
                                const isActive = activeWidgets[widget.id];
                                return (
                                    <motion.div
                                        key={widget.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onToggleWidget(widget.id)}
                                        className={`relative group cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center ${isActive
                                            ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                            : 'bg-slate-800/40 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                                            }`}>
                                            {widget.icon}
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black uppercase tracking-widest text-white">{widget.name}</div>
                                            <div className="text-[9px] text-slate-500 mt-1 leading-tight">{widget.description}</div>
                                        </div>

                                        {isActive && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                                                <X size={10} className="text-white rotate-45" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all shadow-xl shadow-red-900/20"
                            >
                                Close Selection
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
