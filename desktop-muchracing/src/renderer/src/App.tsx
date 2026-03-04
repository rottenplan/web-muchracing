import { useState, useRef } from 'react'
import { Video } from 'lucide-react'
import logo from './assets/logo.png'

// Components
import TopNavbar from './components/TopNavbar'
import RightSidebar from './components/RightSidebar'
import BottomTimeline from './components/BottomTimeline'

// Hooks & Overlays
import { useInterpolatedPoint } from './hooks/useInterpolatedPoint'
import DraggableWidget from './components/overlays/DraggableWidget'
import Speedometer from './components/overlays/Speedometer'
import LeanAngleWidget from './components/overlays/LeanAngleWidget'
import GForceWidget from './components/overlays/GForceWidget'
import GearIndicator from './components/overlays/GearIndicator'
import HeartRateWidget from './components/overlays/HeartRateWidget'
import AltitudeWidget from './components/overlays/AltitudeWidget'
import AdvancedLapTimer from './components/widgets/AdvancedLapTimer'
import AdvancedMapWidget from './components/widgets/AdvancedMapWidget'
import CompassWidget from './components/overlays/CompassWidget'
import SatellitesWidget from './components/overlays/SatellitesWidget'

import WidgetSelectionModal from './components/modals/WidgetSelectionModal'
import ThemeSelectionModal from './components/modals/ThemeSelectionModal'
import GpsOptionsModal, { GpsFilterOptions } from './components/modals/GpsOptionsModal'
import AboutModal from './components/modals/AboutModal'
import GpsAnalysisView from './components/analysis/GpsAnalysisView'
import { detectLaps, Lap, formatDuration, normalizeGpsPoints, getBounds, normalizePoint, Bounds, calculateSectors } from './utils/telemetryUtils'

import html2canvas from 'html2canvas'

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)

  const [videoFile, setVideoFile] = useState<string | null>(null)
  const [telemetryFile, setTelemetryFile] = useState<string | null>(null)
  const [parsedTelemetry, setParsedTelemetry] = useState<any[]>([])
  const [isError, setIsError] = useState('')
  const [activeTab, setActiveTab] = useState<'video' | 'gps'>('video')
  const [laps, setLaps] = useState<Lap[]>([])
  const [telemetryBounds, setTelemetryBounds] = useState<Bounds | null>(null)

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [offsetSeconds] = useState(0)

  // Export State
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  // Widget Visibility & Config
  const [activeWidgets, setActiveWidgets] = useState<Record<string, boolean>>({
    speed: true,
    lean: true,
    gforce: true,
    minimap: true,
    laptimer: true,
    gear: false,
    heart: false,
    altitude: false,
    compass: false,
    satellites: false
  })

  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false)
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false)
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [pendingTelemetryPath, setPendingTelemetryPath] = useState<string | null>(null)
  const [isTransparentMode, setIsTransparentMode] = useState(false)

  const [widgetConfigs, setWidgetConfigs] = useState<Record<string, any>>({
    speed: { id: 'speed', scale: 1.2, opacity: 0.9, x: 50, y: 50 },
    lean: { id: 'lean', scale: 1.0, opacity: 0.8, x: 300, y: 50 },
    gforce: { id: 'gforce', scale: 1.0, opacity: 0.8, x: 500, y: 50 },
    minimap: { id: 'minimap', scale: 1.0, opacity: 0.8, x: 50, y: 300 },
    gear: { id: 'gear', scale: 1.0, opacity: 1.0, x: 700, y: 50 },
    heart: { id: 'heart', scale: 1.0, opacity: 1.0, x: 50, y: 600 },
    altitude: { id: 'altitude', scale: 1.0, opacity: 1.0, x: 300, y: 600 },
    compass: { id: 'compass', scale: 1.0, opacity: 1.0, x: 500, y: 600 },
    satellites: { id: 'satellites', scale: 1.0, opacity: 1.0, x: 700, y: 600 },
    laptimer: { id: 'laptimer', scale: 1.0, opacity: 1.0, x: 50, y: 500 }
  })

  // 60FPS Interpolation Engine
  const { interpolatedPoint } = useInterpolatedPoint(
    parsedTelemetry,
    videoRef,
    isPlaying,
    parsedTelemetry.length > 0,
    offsetSeconds
  )

  const handleUpdateWidgetConfig = (id: string, updates: any) => {
    setWidgetConfigs(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }))
  }

  const handleToggleWidget = (id: string) => {
    setActiveWidgets(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleSelectTheme = (themeId: string) => {
    setIsThemeModalOpen(false)

    // Define Theme Presets
    switch (themeId) {
      case 'kart':
        setActiveWidgets({
          speed: true, lean: true, gforce: true, minimap: true, gear: true,
          heart: false, altitude: false, compass: false, satellites: false
        })
        break
      case 'running':
        setActiveWidgets({
          speed: true, lean: false, gforce: false, minimap: true, gear: false,
          heart: true, altitude: true, compass: false, satellites: true
        })
        break
      case 'drone':
        setActiveWidgets({
          speed: true, lean: false, gforce: false, minimap: false, gear: false,
          heart: false, altitude: true, compass: true, satellites: true
        })
        break
      case 'pro':
        setActiveWidgets({
          speed: true, lean: true, gforce: true, minimap: true, gear: true,
          heart: true, altitude: true, compass: true, satellites: true
        })
        break
      case 'map_only':
        setActiveWidgets({
          speed: false, lean: false, gforce: false, minimap: true, gear: false,
          heart: false, altitude: false, compass: false, satellites: false
        })
        setWidgetConfigs(prev => ({
          ...prev,
          minimap: { ...prev.minimap, scale: 2.0, x: 100, y: 100 }
        }))
        break
      case 'split':
        // Custom split logic could go here
        break
    }
  }

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleExport = async () => {
    if (!videoRef.current || isExporting) return

    const outputPath = await window.api.saveFile({
      title: 'Export Merged Video',
      defaultPath: 'much-gpx-export.mp4',
      filters: [{ name: 'Videos', extensions: ['mp4'] }]
    })

    if (!outputPath) return

    setIsExporting(true)
    setExportProgress(0)

    try {
      const fps = 30
      const duration = videoRef.current.duration
      const totalFrames = Math.floor(duration * fps)
      const frameInterval = 1 / fps

      const widgetContainer = document.getElementById('widget-overlay-layer')
      if (!widgetContainer) throw new Error('Widget layer not found')

      console.log('Starting export to:', outputPath, 'isTransparentMode:', isTransparentMode)
      await window.api.exportStart({
        outputPath,
        fps,
        width: 1920, // Default to HD
        height: 1080,
        hasTransparentBg: isTransparentMode
      })

      // Pause playback during export
      const wasPlaying = isPlaying
      if (isPlaying) videoRef.current.pause()

      for (let i = 0; i < totalFrames; i++) {
        const time = i * frameInterval
        videoRef.current.currentTime = time
        setCurrentTime(time) // Force update state for interpolation

        // Wait a bit for interpolation to settle and DOM to update
        await new Promise(r => setTimeout(r, 64))

        // Capture widgets
        const canvas = await html2canvas(widgetContainer, {
          backgroundColor: null, // Transparent
          scale: 1, // Capture at layout size
          logging: false
        })

        const frameBase64 = canvas.toDataURL('image/png')
        const success = await window.api.exportFrame(frameBase64)
        if (!success) {
          throw new Error(`Failed to write frame ${i} to export pipe. FFmpeg may have crashed or closed.`)
        }

        setExportProgress(Math.round((i / totalFrames) * 100))
      }

      await window.api.exportFinish()
      alert('Export successfully completed!')

      if (wasPlaying) videoRef.current.play()
    } catch (err: any) {
      console.error('Export failed:', err)
      setIsError('Export failed: ' + err.message)
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handleSelectVideo = async () => {
    const filePath = await window.api.openFile({
      title: 'Select GoPro Video',
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'mkv', 'webm'] }]
    })
    if (filePath) setVideoFile(filePath)
  }

  const handleSelectTelemetry = async () => {
    const filePath = await window.api.openFile({
      title: 'Select Telemetry Data',
      properties: ['openFile'],
      filters: [{ name: 'JSON/CSV Data', extensions: ['json', 'csv'] }]
    })

    if (filePath) {
      setPendingTelemetryPath(filePath)
      setIsGpsModalOpen(true)
    }
  }

  const handleConfirmGpsOptions = async (options: GpsFilterOptions) => {
    setIsGpsModalOpen(false)
    setIsTransparentMode(options.transparentExport)

    if (!pendingTelemetryPath) return

    setTelemetryFile(pendingTelemetryPath)
    const content = await window.api.readFile(pendingTelemetryPath)

    if (content) {
      try {
        const data = JSON.parse(content)
        let points = Array.isArray(data) ? data : data.points || []

        // Apply GPS Filtering
        if (options.filterMode === 'fixed') {
          points = points.filter((p: any) => p.fix === 1 || p.fix === true || (typeof p.fix === 'number' && p.fix > 0))
        } else if (options.filterMode === 'none') {
          points = points.map((p: any) => ({ ...p, lat: 0, lng: 0, alt: 0 }))
        }

        // Map 'lon' to 'lng' for consistency with Widgets/Hooks
        points = points.map((p: any) => ({
          ...p,
          lng: p.lng ?? p.lon ?? 0
        }))

        setParsedTelemetry(points)

        // Detect Laps immediately
        const detectedLaps = detectLaps(points)
        setLaps(detectedLaps)

        // Calculate Bounds for normalization
        const bounds = getBounds(points)
        setTelemetryBounds(bounds)

        setIsError('')
      } catch (e) {
        setIsError('Failed to parse telemetry data.')
      }
    }
  }

  // Always show the 3-Pane GPXRender-style Professional Layout
  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col font-sans overflow-hidden text-slate-200 select-none">

      {/* 1. Top Navbar (Tabs, Files & Selection) */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        videoFile={videoFile}
        telemetryFile={telemetryFile}
        onSelectVideo={handleSelectVideo}
        onSelectTelemetry={handleSelectTelemetry}
        onExport={handleExport}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        isExporting={isExporting}
      />

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'video' ? (
          <>
            {/* Main Center Area (Video + Timeline) */}
            <div className="flex-1 flex flex-col min-w-0">

              {/* Main Content Area */}
              <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                <div ref={videoContainerRef} className="relative aspect-video max-h-full bg-black shadow-2xl rounded-lg overflow-hidden flex items-center justify-center">
                  {videoFile ? (
                    <>
                      <video
                        ref={videoRef}
                        src={`file://${videoFile}`}
                        className="w-full h-full object-contain"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                        onEnded={() => setIsPlaying(false)}
                        onClick={handleTogglePlay}
                      />

                      {/* Overlay Widgets Layer */}
                      <div id="widget-overlay-layer" className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                        {isExporting && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center pointer-events-auto">
                            <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${exportProgress}%` }}
                              />
                            </div>
                            <span className="text-emerald-500 font-black italic tracking-widest text-lg uppercase animate-pulse">Rendering Video... {exportProgress}%</span>
                            <span className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.2em]">Please do not close the application</span>
                          </div>
                        )}
                        {activeWidgets.speed && (
                          <DraggableWidget
                            id="speed"
                            config={widgetConfigs.speed}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <Speedometer speed={interpolatedPoint?.speed || 0} />
                          </DraggableWidget>
                        )}

                        {activeWidgets.lean && (
                          <DraggableWidget
                            id="lean"
                            config={widgetConfigs.lean}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <LeanAngleWidget leanAngle={interpolatedPoint?.lean || 0} />
                          </DraggableWidget>
                        )}

                        {activeWidgets.gforce && (
                          <DraggableWidget
                            id="gforce"
                            config={widgetConfigs.gforce}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <GForceWidget gLat={interpolatedPoint?.gLat || 0} gLon={interpolatedPoint?.gLon || 0} />
                          </DraggableWidget>
                        )}

                        {activeWidgets.minimap && (() => {
                          const currentLapData = laps.find(l => (interpolatedPoint?.timestamp || 0) <= l.endTime);
                          return (
                            <DraggableWidget
                              id="minimap"
                              config={widgetConfigs.minimap}
                              isExporting={isExporting}
                              constraintsRef={videoContainerRef}
                              onUpdateConfig={handleUpdateWidgetConfig}
                            >
                              <AdvancedMapWidget
                                speed={interpolatedPoint?.speed || 0}
                                distance={interpolatedPoint?.distance || 0}
                                gpsPath={normalizeGpsPoints(parsedTelemetry)}
                                currentPoint={interpolatedPoint && telemetryBounds ? normalizePoint(interpolatedPoint, telemetryBounds) : null}
                                peakSpeed={currentLapData?.maxSpeed || 0}
                                minSpeed={currentLapData?.minSpeed || 0}
                              />
                            </DraggableWidget>
                          );
                        })()}

                        {activeWidgets.laptimer && (() => {
                          const currentLapIdx = laps.findIndex(l => (interpolatedPoint?.timestamp || 0) <= l.endTime);
                          const currentLap = laps[currentLapIdx];
                          const startTime = currentLap?.startTime || parsedTelemetry[0]?.timestamp || 0;
                          const elapsed = (interpolatedPoint?.timestamp || 0) - startTime;

                          return (
                            <DraggableWidget
                              id="laptimer"
                              config={widgetConfigs.laptimer}
                              isExporting={isExporting}
                              constraintsRef={videoContainerRef}
                              onUpdateConfig={handleUpdateWidgetConfig}
                            >
                              <AdvancedLapTimer
                                currentLap={currentLapIdx + 1 || 1}
                                totalLaps={laps.length || 1}
                                currentTime={formatDuration(elapsed)}
                                bestTime={laps.length > 0 ? formatDuration(Math.min(...laps.map(l => l.duration))) : '00:00.000'}
                                sectors={currentLap ? calculateSectors(currentLap) : []}
                              />
                            </DraggableWidget>
                          );
                        })()}

                        {activeWidgets.gear && (
                          <DraggableWidget
                            id="gear"
                            config={widgetConfigs.gear}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <GearIndicator
                              gear={interpolatedPoint?.gear || 0}
                              rpm={interpolatedPoint?.rpm || 0}
                            />
                          </DraggableWidget>
                        )}

                        {activeWidgets.heart && (
                          <DraggableWidget
                            id="heart"
                            config={widgetConfigs.heart}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <HeartRateWidget bpm={interpolatedPoint?.heartRate || 0} />
                          </DraggableWidget>
                        )}

                        {activeWidgets.altitude && (
                          <DraggableWidget
                            id="altitude"
                            config={widgetConfigs.altitude}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <AltitudeWidget altitude={interpolatedPoint?.altitude || 0} />
                          </DraggableWidget>
                        )}

                        {activeWidgets.compass && (
                          <DraggableWidget
                            id="compass"
                            config={widgetConfigs.compass}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <CompassWidget heading={interpolatedPoint?.heading || 0} />
                          </DraggableWidget>
                        )}

                        {activeWidgets.satellites && (
                          <DraggableWidget
                            id="satellites"
                            config={widgetConfigs.satellites}
                            isExporting={isExporting}
                            constraintsRef={videoContainerRef}
                            onUpdateConfig={handleUpdateWidgetConfig}
                          >
                            <SatellitesWidget
                              count={interpolatedPoint?.satCount || 0}
                              precision={interpolatedPoint?.hdop || 1.0}
                            />
                          </DraggableWidget>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 group cursor-pointer" onClick={handleSelectVideo}>
                      <div className="mb-12 opacity-50 group-hover:opacity-100 transition-opacity duration-700 scale-125">
                        <img src={logo} alt="Much Racing Logo" className="h-16 w-auto grayscale group-hover:grayscale-0 transition-all" />
                      </div>
                      <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 mb-6 border-2 border-dashed border-slate-800 group-hover:border-solid group-hover:border-white shadow-2xl relative overflow-hidden">
                        <Video size={48} className="relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-[0.3em] font-sans italic">Much GPX Analysis</h2>
                      <p className="text-slate-700 text-[10px] mt-4 group-hover:text-blue-400 uppercase tracking-widest font-bold">Touch here to select a GoPro source file</p>
                    </div>
                  )}
                  {isError && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-xl text-sm z-50 animate-bounce">
                      {isError}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Bottom Panel (Timeline & Controls) */}
              <BottomTimeline
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
            </div>

            {/* 3. Right Sidebar (Widget List & Properties) */}
            <RightSidebar
              activeWidgets={activeWidgets}
              setActiveWidgets={setActiveWidgets}
              widgetConfigs={widgetConfigs}
              onUpdateConfig={handleUpdateWidgetConfig}
              onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
            />
          </>
        ) : (
          <GpsAnalysisView telemetryData={parsedTelemetry} laps={laps} />
        )}
      </div>

      <WidgetSelectionModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        activeWidgets={activeWidgets}
        onToggleWidget={handleToggleWidget}
      />

      <ThemeSelectionModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onSelectTheme={handleSelectTheme}
      />

      <GpsOptionsModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        onConfirm={handleConfirmGpsOptions}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

    </div>
  )
}

export default App
