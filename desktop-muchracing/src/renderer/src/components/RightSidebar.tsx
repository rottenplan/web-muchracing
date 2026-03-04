import { Plus, Settings, Sliders, Palette, MousePointer2 } from 'lucide-react'
import { useState } from 'react'

// Comprehensive widget list matching our components and Modal
const availableWidgets = [
    { id: 'speed', name: 'Speedometer', icon: 'M12 22A10 10 0 0 1 12 2a10 10 0 0 1 10 10c0 4.19-2.58 7.78-6.19 9.3' },
    { id: 'lean', name: 'Lean Angle', icon: 'M12 2L2 22h20L12 2z' },
    { id: 'gforce', name: 'G-Force Radar', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
    { id: 'minimap', name: 'Advanced Map', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
    { id: 'laptimer', name: 'Lap Counter', icon: 'M12 2l3.5 10H8.5L12 2z' },
    { id: 'gear', name: 'Gear Indicator', icon: 'M12 2l3.5 10H8.5L12 2z' },
    { id: 'heart', name: 'Heart Rate', icon: 'M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0l-.8.8-.8-.8c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5l7.3 7.3 7.3-7.3c1.8-1.8 1.8-4.7 0-6.5z' },
    { id: 'altitude', name: 'Altitude', icon: 'M8 20l4-9 4 9H8zm0 0l4-3 4 3' },
    { id: 'compass', name: 'Compass', icon: 'M12 2L8 22l4-4 4 4-4-20z' },
    { id: 'satellites', name: 'Satellites', icon: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z' }
]

interface RightSidebarProps {
    activeWidgets: Record<string, boolean>;
    setActiveWidgets: (update: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
    widgetConfigs: Record<string, any>;
    onUpdateConfig: (id: string, updates: any) => void;
    onOpenWidgetModal: () => void;
}

export default function RightSidebar({
    activeWidgets,
    setActiveWidgets,
    widgetConfigs,
    onUpdateConfig,
    onOpenWidgetModal
}: RightSidebarProps) {

    // We'll track which widget's properties are being edited
    const [editingId, setEditingId] = useState(availableWidgets[0].id);

    const toggleWidget = (id: string) => {
        setActiveWidgets(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const selectedConfig = widgetConfigs[editingId] || {};
    const selectedWidget = availableWidgets.find(w => w.id === editingId);

    return (
        <div className="w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0 h-full overflow-hidden shadow-2xl z-10 relative select-none">

            {/* Header / Tabs */}
            <div className="h-10 bg-black/60 border-b border-white/5 flex items-center px-1 shrink-0">
                <button className="flex-1 h-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-white/5 rounded mx-1 shadow-inner">
                    <Sliders size={12} />
                    Widget list
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button className="flex-1 h-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                    <Palette size={12} />
                    Themes
                </button>
            </div>

            {/* Widget List Section */}
            <div className="flex-1 overflow-y-auto flex flex-col p-2 space-y-1">
                <div className="bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                    {availableWidgets.map((widget) => (
                        <div
                            key={widget.id}
                            onClick={() => { setEditingId(widget.id); }}
                            className={`group flex items-center px-3 py-2 transition-all cursor-pointer border-b border-white/5 last:border-0 ${editingId === widget.id ? 'bg-blue-600/20' : 'hover:bg-white/5'}`}
                        >
                            <input
                                type="checkbox"
                                checked={!!activeWidgets[widget.id]}
                                onChange={(e) => { e.stopPropagation(); toggleWidget(widget.id); }}
                                className="w-3.5 h-3.5 rounded border-slate-700 bg-black/40 text-blue-500 accent-blue-500 mr-3"
                            />
                            <span className={`text-[11px] font-bold transition-colors flex-1 ${activeWidgets[widget.id] ? 'text-white' : 'text-slate-500'}`}>{widget.name}</span>
                            {editingId === widget.id && <MousePointer2 size={10} className="text-blue-400 animate-pulse" />}
                        </div>
                    ))}
                </div>

                <button
                    onClick={onOpenWidgetModal}
                    className="w-full mt-2 py-2 flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-blue-500/20 transition-all shadow-lg shadow-blue-900/10"
                >
                    <Plus size={12} />
                    More widgets
                </button>
            </div>

            {/* Properties Section (High Fidelity Table) */}
            <div className="h-[45%] border-t border-white/10 bg-[#1a1c23] shrink-0 flex flex-col">
                <div className="bg-black/40 border-b border-white/5 flex items-center px-4 py-2 shrink-0">
                    <Settings size={12} className="text-slate-500 mr-2" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-1">Property Editor</span>
                    <span className="text-[10px] font-black text-blue-400 uppercase italic">{selectedWidget?.name}</span>
                </div>

                {/* Table Header */}
                <div className="flex bg-black/20 border-b border-white/5 px-4 py-1.5 shrink-0">
                    <span className="flex-1 text-[9px] font-black text-slate-500 uppercase tracking-tighter">Property</span>
                    <span className="flex-1 text-[9px] font-black text-slate-500 uppercase tracking-tighter border-l border-white/5 pl-4">Value</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {editingId && (
                        <div className="flex flex-col">
                            {/* General Category */}
                            <div className="px-4 py-1 bg-white/5 text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 border-b border-white/5">
                                <ChevronDown size={8} /> Layout Options
                            </div>

                            {/* Scale Row */}
                            <div className="flex items-center px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <span className="flex-1 text-[10px] font-bold text-slate-400">Scaling Factor</span>
                                <div className="flex-1 flex items-center gap-3 border-l border-white/5 pl-4">
                                    <input
                                        type="range"
                                        min="0.5" max="2.5" step="0.1"
                                        value={selectedConfig.scale || 1}
                                        onChange={(e) => onUpdateConfig(editingId, { scale: parseFloat(e.target.value) })}
                                        className="flex-1 h-1 bg-slate-800 rounded-full appearance-none accent-blue-600 cursor-pointer"
                                    />
                                    <span className="text-[10px] font-mono text-blue-400 w-8">{(selectedConfig.scale || 1).toFixed(1)}</span>
                                </div>
                            </div>

                            {/* Opacity Row */}
                            <div className="flex items-center px-4 py-2 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                <span className="flex-1 text-[10px] font-bold text-slate-400">Layer Opacity</span>
                                <div className="flex-1 flex items-center gap-3 border-l border-white/5 pl-4">
                                    <input
                                        type="range"
                                        min="0" max="1" step="0.1"
                                        value={selectedConfig.opacity || 1}
                                        onChange={(e) => onUpdateConfig(editingId, { opacity: parseFloat(e.target.value) })}
                                        className="flex-1 h-1 bg-slate-800 rounded-full appearance-none accent-blue-600 cursor-pointer"
                                    />
                                    <span className="text-[10px] font-mono text-blue-400 w-8">{Math.round((selectedConfig.opacity || 1) * 100)}%</span>
                                </div>
                            </div>

                            {/* Color Category */}
                            <div className="px-4 py-1 bg-white/5 text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 border-b border-white/5 mt-2">
                                <ChevronDown size={8} /> Styles & Colors
                            </div>

                            <div className="flex items-center px-4 py-2 border-b border-white/5 hover:bg-white/5">
                                <span className="flex-1 text-[10px] font-bold text-slate-400">Accent Color</span>
                                <div className="flex-1 flex items-center gap-2 border-l border-white/5 pl-4">
                                    <div className="w-12 h-4 rounded bg-blue-500 border border-white/20 shadow-lg" />
                                    <span className="text-[10px] font-mono text-slate-500 uppercase">#3b82f6</span>
                                </div>
                            </div>

                            <div className="flex items-center px-4 py-2 border-b border-white/5 hover:bg-white/5">
                                <span className="flex-1 text-[10px] font-bold text-slate-400">Background</span>
                                <div className="flex-1 flex items-center gap-2 border-l border-white/5 pl-4">
                                    <div className="w-12 h-4 rounded bg-black/80 border border-white/20 shadow-lg" />
                                    <span className="text-[10px] font-mono text-slate-500 uppercase">#000000</span>
                                </div>
                            </div>

                            {/* Advanced Category */}
                            <div className="px-4 py-1 bg-white/5 text-[9px] font-black text-slate-500 uppercase flex items-center gap-2 border-b border-white/5 mt-2">
                                <ChevronDown size={8} /> Advanced
                            </div>

                            <div className="flex items-center px-4 py-2 border-b border-white/5 hover:bg-white/5">
                                <span className="flex-1 text-[10px] font-bold text-slate-400">Interpolation</span>
                                <div className="flex-1 border-l border-white/5 pl-4 overflow-hidden text-ellipsis">
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Enabled (60FPS)</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function ChevronDown({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
