import logo from '../assets/logo.png'

interface TopNavbarProps {
    activeTab: 'video' | 'gps'
    setActiveTab: (tab: 'video' | 'gps') => void
    videoFile: string | null
    telemetryFile: string | null
    onSelectVideo: () => void
    onSelectTelemetry: () => void
    onExport: () => void
    onOpenThemeModal: () => void
    onOpenAboutModal: () => void
    isExporting?: boolean
}

export default function TopNavbar({
    activeTab,
    setActiveTab,
    videoFile,
    telemetryFile,
    onSelectVideo,
    onSelectTelemetry,
    onExport,
    onOpenThemeModal,
    onOpenAboutModal,
    isExporting = false
}: TopNavbarProps) {
    return (
        <div className="h-14 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 shrink-0 shadow-2xl relative z-50">

            {/* Much Racing Branding */}
            <button
                onClick={onOpenAboutModal}
                className="flex items-center gap-3 mr-8 group cursor-pointer hover:opacity-80 transition-all outline-none"
            >
                <div className="h-8 w-auto flex items-center">
                    <img src={logo} alt="Much Racing Logo" className="h-full w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105 duration-300" />
                </div>
                <div className="flex flex-col border-l border-white/10 pl-3 text-left">
                    <span className="font-black text-white text-sm leading-none italic tracking-tighter uppercase">Much GPX <span className="text-blue-500 font-black">Analysis</span></span>
                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold leading-none mt-1">Professional Edition</span>
                </div>
            </button>

            {/* Tabs */}
            <div className="flex h-full gap-1">
                <button
                    onClick={() => setActiveTab('video')}
                    className={`h-full flex items-center gap-2 px-6 font-bold text-[11px] uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'video' ? 'bg-white/5 text-blue-400 border-blue-500' : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300'}`}
                >
                    Video Mode
                </button>
                <button
                    onClick={() => setActiveTab('gps')}
                    className={`h-full flex items-center gap-2 px-6 font-bold text-[11px] uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'gps' ? 'bg-white/5 text-emerald-400 border-emerald-500' : 'bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300'}`}
                >
                    GPS Data
                </button>
            </div>

            {/* File Path Display */}
            <div className="mx-8 flex-1 flex items-center gap-4">
                {videoFile && (
                    <div className="bg-black/40 border border-white/5 rounded-full px-4 py-1 flex items-center gap-2 min-w-0 shadow-inner">
                        <span className="text-[9px] font-black text-blue-500 uppercase shrink-0 tracking-tighter">Video</span>
                        <span className="text-[10px] font-mono text-slate-400 truncate">{videoFile.replace('file://', '').split('/').pop()}</span>
                    </div>
                )}
                {telemetryFile && (
                    <div className="bg-black/40 border border-white/5 rounded-full px-4 py-1 flex items-center gap-2 min-w-0 shadow-inner">
                        <span className="text-[9px] font-black text-emerald-500 uppercase shrink-0 tracking-tighter">Data</span>
                        <span className="text-[10px] font-mono text-slate-400 truncate">{telemetryFile.split('/').pop()}</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onSelectVideo}
                    className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2 hover:text-white"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 7 16 12 23 17 23 7Z" /><rect width="15" height="14" x="1" y="5" rx="2" ry="2" /></svg>
                    Load Video
                </button>
                <button
                    onClick={onSelectTelemetry}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                    Load Data
                </button>
                <button
                    onClick={onOpenThemeModal}
                    className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/5 transition-all flex items-center gap-2 hover:text-white"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>
                    Themes
                </button>
                <button
                    onClick={onExport}
                    disabled={isExporting || (!videoFile && !telemetryFile)}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={isExporting ? 'animate-bounce' : ''}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    {isExporting ? 'Exporting...' : 'Export'}
                </button>
            </div>

        </div>
    )
}
