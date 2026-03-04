"use client";

import {
    BookOpen,
    ChevronLeft,
    MapPin,
    Search,
    PlusCircle,
    Save,
    CheckCircle,
    Layout
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManualPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background text-foreground pb-24">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-background/80 backdrop-blur-md z-50 sticky top-0 border-b border-white/5">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-text-secondary hover:text-primary transition-colors">
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <h1 className="text-lg font-racing tracking-widest uppercase text-white">USER MANUAL</h1>
                <div className="w-8"></div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl space-y-12">

                {/* Intro Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <BookOpen className="w-6 h-6" />
                        <h2 className="text-xl font-racing tracking-wider">TRACK MANAGEMENT</h2>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        Follow these steps to manage your racing tracks and sector configurations.
                    </p>
                </section>

                {/* Steps Section */}
                <div className="space-y-8">

                    {/* Step 1 & 2 */}
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">1</div>
                            <div className="w-px h-full bg-border-color/30 my-2"></div>
                        </div>
                        <div className="flex-1 pb-8">
                            <h3 className="text-white font-racing text-sm mb-2 uppercase">Locate or Search</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                                Locate your track in the list or use the search bar to find a specific circuit in our database.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">2</div>
                            <div className="w-px h-full bg-border-color/30 my-2"></div>
                        </div>
                        <div className="flex-1 pb-8">
                            <h3 className="text-white font-racing text-sm mb-2 uppercase">Create New Track</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                                If the track does not exist, click <span className="text-primary font-bold">Create Track</span> and follow the track creation tutorial to add it to the system.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-highlight/20 border border-highlight/40 flex items-center justify-center text-highlight font-bold text-sm">3</div>
                            <div className="w-px h-full bg-border-color/30 my-2"></div>
                        </div>
                        <div className="flex-1 pb-8">
                            <h3 className="text-white font-racing text-sm mb-2 uppercase">Adding Sectors</h3>
                            <p className="text-text-secondary text-xs leading-relaxed mb-3">
                                To add a sector for precise time analysis:
                            </p>
                            <ul className="space-y-2 text-xs text-text-secondary list-disc pl-4">
                                <li>Click the track thumbnail, then drag the sector marker along the circuit map to the desired split point.</li>
                                <li>Click <span className="text-highlight font-bold">Add Sector</span>. Repeat for each split you wish to define.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">4</div>
                            <div className="w-px h-full bg-border-color/30 my-2"></div>
                        </div>
                        <div className="flex-1 pb-8">
                            <h3 className="text-white font-racing text-sm mb-2 uppercase">Save Configuration</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                                After placing all markers, click <span className="text-primary font-bold">Save</span>, enter a name for your configuration, and confirm.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-success/20 border border-success/40 flex items-center justify-center text-success font-bold text-sm">5</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-racing text-sm mb-2 uppercase">Set as Default</h3>
                            <p className="text-text-secondary text-xs leading-relaxed">
                                In the configurations list, select your new setup and click <span className="text-success font-bold">Set as Default</span> (marked in green).
                            </p>
                            <div className="mt-4 p-3 carbon-bg border border-warning/20 rounded-lg">
                                <p className="text-[10px] text-warning italic leading-relaxed">
                                    Note: This sector configuration is the default setting and will be used by the online tool and for track database retrieval.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Action */}
                <div className="pt-8 border-t border-white/5 flex justify-center">
                    <Link href="/tracks" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-racing tracking-widest transition shadow-lg shadow-primary/20 text-sm">
                        GO TO TRACKS
                    </Link>
                </div>
            </div>
        </main>
    );
}
