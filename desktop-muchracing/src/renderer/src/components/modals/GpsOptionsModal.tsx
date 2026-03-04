import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, CheckCircle2, Circle, FileText } from 'lucide-react';

interface GpsOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (options: GpsFilterOptions) => void;
}

export interface GpsFilterOptions {
    filterMode: 'fixed' | 'all' | 'none';
    transparentExport: boolean;
}

export default function GpsOptionsModal({
    isOpen,
    onClose,
    onConfirm
}: GpsOptionsModalProps) {
    const [filterMode, setFilterMode] = useState<'fixed' | 'all' | 'none'>('fixed');
    const [transparentExport, setTransparentExport] = useState(false);

    const handleConfirm = () => {
        onConfirm({ filterMode, transparentExport });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-lg bg-[#3d4451] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                    >
                        {/* Header */}
                        <div className="p-5 bg-[#4b5563] flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 via-emerald-500 to-blue-500 p-0.5 shadow-lg">
                                <div className="w-full h-full bg-[#3d4451] rounded-[10px] flex items-center justify-center">
                                    <Settings size={24} className="text-white animate-[spin_4s_linear_infinite]" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">GPS options</h2>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest mt-1">GPS data found</span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 bg-[#3d4451]">
                            <p className="text-sm font-bold text-white mb-2">This video contains GPS information</p>

                            {/* Options */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => setFilterMode('fixed')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    {filterMode === 'fixed' ? <CheckCircle2 size={24} className="text-blue-400" /> : <Circle size={24} className="text-slate-500 group-hover:text-slate-400" />}
                                    <span className={`text-[13px] font-bold text-left ${filterMode === 'fixed' ? 'text-blue-400' : 'text-slate-300'}`}>Read only fixed GPS and ignore non fixed GPS data</span>
                                </button>

                                <button
                                    onClick={() => setFilterMode('all')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    {filterMode === 'all' ? <CheckCircle2 size={24} className="text-blue-400" /> : <Circle size={24} className="text-slate-500 group-hover:text-slate-400" />}
                                    <span className={`text-[13px] font-bold text-left ${filterMode === 'all' ? 'text-blue-400' : 'text-slate-300'}`}>Read all GPS data, even if not fixed</span>
                                </button>

                                <button
                                    onClick={() => setFilterMode('none')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                    {filterMode === 'none' ? <CheckCircle2 size={24} className="text-blue-400" /> : <Circle size={24} className="text-slate-500 group-hover:text-slate-400" />}
                                    <span className={`text-[13px] font-bold text-left ${filterMode === 'none' ? 'text-blue-400' : 'text-slate-300'}`}>Don't read GPS data</span>
                                </button>
                            </div>

                            {/* Transparent Checkbox */}
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={transparentExport}
                                        onChange={(e) => setTransparentExport(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${transparentExport ? 'border-red-500 bg-red-500' : 'border-slate-600 bg-transparent'}`}>
                                        {transparentExport && <X size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-wider ${transparentExport ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-300'}`}>
                                        I only want to export Gauges on a transparent background
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-white/5 bg-[#2d333d] flex justify-center">
                            <button
                                onClick={handleConfirm}
                                className="px-16 py-3 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase tracking-[0.3em] text-xs rounded shadow-lg transition-all flex items-center gap-3"
                            >
                                <FileText size={16} />
                                Open
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
