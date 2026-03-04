import { motion } from 'framer-motion';

interface GearIndicatorProps {
    gear?: number;
    rpm?: number;
    maxRpm?: number;
}

export default function GearIndicator({ gear = 0, rpm = 0, maxRpm = 14000 }: GearIndicatorProps) {
    const rpmPercentage = (rpm / maxRpm) * 100;
    const isOverRev = rpmPercentage > 90;

    return (
        <div className="flex flex-col items-center bg-slate-900/90 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-w-[140px]">
            {/* RPM Progress Bar Top */}
            <div className="w-full h-2 bg-slate-800 flex overflow-hidden">
                <motion.div
                    className={`h-full shadow-[0_0_15px_rgba(37,99,235,0.5)] ${isOverRev ? 'bg-red-500 shadow-red-500/50' : 'bg-blue-500'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${rpmPercentage}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>

            <div className="p-4 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Gear</span>
                <div className="relative">
                    <span className={`text-7xl font-data font-black tabular-nums transition-colors duration-200 ${gear === 0 ? 'text-emerald-500' : 'text-white'}`}>
                        {gear === 0 ? 'N' : gear}
                    </span>

                    {/* Shift Light animation when high RPM */}
                    {isOverRev && (
                        <motion.div
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                            className="absolute inset-0 bg-red-600/20 blur-xl rounded-full"
                        />
                    )}
                </div>

                <div className="mt-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {Math.round(rpm)} <span className="opacity-50">RPM</span>
                </div>
            </div>
        </div>
    );
}
