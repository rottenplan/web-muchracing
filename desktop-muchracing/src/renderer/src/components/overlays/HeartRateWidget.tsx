import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface HeartRateProps {
    bpm?: number;
}

export default function HeartRateWidget({ bpm = 0 }: HeartRateProps) {
    return (
        <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl min-w-[200px]">
            <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [1, 0.8, 1]
                    }}
                    transition={{
                        duration: bpm > 0 ? 60 / bpm : 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-red-500"
                >
                    <Activity size={32} />
                </motion.div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse rounded-full" />
            </div>

            <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Heart Rate</span>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-data font-black text-white tabular-nums">
                        {Math.round(bpm)}
                    </span>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">BPM</span>
                </div>
            </div>
        </div>
    );
}
