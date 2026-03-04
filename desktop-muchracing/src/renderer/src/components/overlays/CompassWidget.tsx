import { Navigation2 } from 'lucide-react';

interface CompassProps {
    heading?: number;
}

export default function CompassWidget({ heading = 0 }: CompassProps) {
    // Round heading for display
    const displayHeading = Math.round(heading % 360);

    // Determine cardinal direction
    const getCardinal = (angle: number) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
        return directions[index];
    };

    return (
        <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-white/10 shadow-2xl min-w-[140px]">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Compass</div>

            <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Dial Background */}
                <div className="absolute inset-0 border-2 border-white/5 rounded-full" />

                {/* Graduation Ticks (Simplified) */}
                {[0, 90, 180, 270].map((deg) => (
                    <div
                        key={deg}
                        className="absolute w-0.5 h-2 bg-slate-700"
                        style={{ transform: `rotate(${deg}deg) translateY(-46px)` }}
                    />
                ))}

                {/* Rotating Needle */}
                <div
                    className="relative transition-transform duration-300 ease-out"
                    style={{ transform: `rotate(${heading}deg)` }}
                >
                    <Navigation2
                        size={32}
                        className="text-blue-500 fill-blue-500/20 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                    />
                </div>

                {/* Center Heading Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                        <span className="text-[10px] font-black text-white">{getCardinal(displayHeading)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-2 text-xl font-data font-black text-white tabular-nums">
                {displayHeading.toString().padStart(3, '0')}&deg;
            </div>
        </div>
    );
}
