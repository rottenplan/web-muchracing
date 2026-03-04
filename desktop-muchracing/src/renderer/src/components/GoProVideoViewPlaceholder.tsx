export default function GoProVideoViewPlaceholder({ videoUrl, session }: { videoUrl: string | null, session: any }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
            <h2 className="text-2xl font-black italic tracking-tighter text-blue-400 uppercase mb-4">Dashboard Engine Starting...</h2>
            <p className="text-slate-400 mb-8 max-w-lg text-center">Phase 2 will migrate the real GoProVideoView and its 60FPS overlay engine to this placeholder.</p>

            <div className="w-full max-w-4xl aspect-video bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center">
                {videoUrl ? (
                    <video src={videoUrl} controls className="w-full h-full object-contain opacity-50" />
                ) : (
                    <span>No Video Mounted</span>
                )}

                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded-lg border border-white/10">
                    <span className="text-emerald-400 font-mono text-xs">Telemetry Points Loaded: {session?.points?.length || 0}</span>
                </div>
            </div>
        </div>
    )
}
