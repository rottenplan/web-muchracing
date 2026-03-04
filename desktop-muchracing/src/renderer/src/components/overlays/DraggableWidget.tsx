import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings2, X } from 'lucide-react';

export interface WidgetConfig {
    id: string;
    scale: number;
    opacity: number;
    x: number;
    y: number;
}

interface DraggableWidgetProps {
    id: string;
    config: WidgetConfig;
    isExporting: boolean;
    constraintsRef: React.RefObject<HTMLDivElement | null>;
    onUpdateConfig: (id: string, updates: Partial<WidgetConfig>) => void;
    className?: string;
    children: React.ReactNode;
}

export default function DraggableWidget({
    id,
    config,
    isExporting,
    constraintsRef,
    onUpdateConfig,
    className = "",
    children
}: DraggableWidgetProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            drag={!isExporting}
            dragConstraints={constraintsRef}
            dragElastic={0}
            dragMomentum={false}
            whileHover={!isExporting ? { zIndex: 50 } : {}}
            onDragEnd={(event, info) => {
                // For a true layout save, we save the offset point
                onUpdateConfig(id, {
                    x: info.point.x,
                    y: info.point.y
                });
            }}
            style={{
                x: config.x,
                y: config.y,
                scale: config.scale,
                opacity: config.opacity
            }}
            animate={{ scale: config.scale, opacity: config.opacity }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`absolute z-10 ${className} ${!isExporting ? 'cursor-grab active:cursor-grabbing' : ''}`}
            onMouseEnter={() => !isExporting && setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setShowSettings(false);
            }}
        >
            {/* Widget Content */}
            <div style={{ pointerEvents: showSettings ? 'auto' : 'none' }}>
                {children}
            </div>

            {/* Customization Toolbar (Only visible on hover when NOT exporting) */}
            {!isExporting && isHovered && (
                <div className="absolute -top-10 right-0 flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                        className="p-1.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-300 hover:text-white shadow-xl backdrop-blur-md"
                        title="Widget Settings"
                    >
                        {showSettings ? <X size={14} /> : <Settings2 size={14} />}
                    </button>
                </div>
            )}

            {/* Settings Popover */}
            {!isExporting && showSettings && (
                <div
                    className="absolute -top-[120px] right-0 w-48 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 cursor-default"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-3">
                        {/* Scale Slider */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                                <span>Size</span>
                                <span>{Math.round(config.scale * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.5" max="2" step="0.1"
                                value={config.scale}
                                onChange={(e) => onUpdateConfig(id, { scale: parseFloat(e.target.value) })}
                                className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Opacity Slider */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                                <span>Opacity</span>
                                <span>{Math.round(config.opacity * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.2" max="1" step="0.1"
                                value={config.opacity}
                                onChange={(e) => onUpdateConfig(id, { opacity: parseFloat(e.target.value) })}
                                className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
