import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import * as htmlToImage from 'html-to-image';

export interface ExportProgress {
    status: 'idle' | 'loading_ffmpeg' | 'processing_video' | 'extracting_frames' | 'rendering_overlays' | 'muxing' | 'complete' | 'error';
    progress: number; // 0 to 1
    message?: string;
}

export function useVideoExporter() {
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const [exportState, setExportState] = useState<ExportProgress>({ status: 'idle', progress: 0 });

    const loadFFmpeg = async () => {
        if (ffmpegRef.current) return ffmpegRef.current;

        setExportState({ status: 'loading_ffmpeg', progress: 0, message: 'Loading FFmpeg Core...' });

        const ffmpeg = new FFmpeg();
        ffmpeg.on('progress', ({ progress, time }) => {
            setExportState(prev => ({ ...prev, progress: Math.max(0, Math.min(1, progress)) }));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegRef.current = ffmpeg;
        return ffmpeg;
    };

    /**
     * Start the export process
     * @param videoUrl The original GoPro video Blob URL or path
     * @param overlayContainerRef The React ref to the `div` containing all widgets
     * @param videoElement The original video element to sync time
     * @param duration Video duration in seconds to process (or use actual video duration)
     * @param fps Target FPS (default 30 for performance vs 60 for smoothness)
     */
    const exportVideo = useCallback(async (
        videoUrl: string,
        overlayContainerRef: React.RefObject<HTMLDivElement | null>,
        videoElement: HTMLVideoElement,
        duration: number,
        fps: number = 30
    ) => {
        try {
            const ffmpeg = await loadFFmpeg();
            setExportState({ status: 'processing_video', progress: 0, message: 'Preparing video...' });

            // 1. Write the original video to FFmpeg filesystem
            await ffmpeg.writeFile('input.mp4', await fetchFile(videoUrl));

            // Determine dimensions based on original video (or scaled down for performance if needed)
            const width = videoElement.videoWidth;
            const height = videoElement.videoHeight;
            const totalFrames = Math.floor(duration * fps);
            const frameDuration = 1 / fps;

            setExportState({ status: 'extracting_frames', progress: 0, message: 'Extracting audio & preprocessing...' });

            // Extract audio to keep it
            await ffmpeg.exec(['-i', 'input.mp4', '-q:a', '0', '-map', 'a', 'audio.aac']);

            setExportState({ status: 'rendering_overlays', progress: 0, message: 'Rendering overlay frames...' });

            // Pause video and take control
            const wasPlaying = !videoElement.paused;
            videoElement.pause();

            // Create a transparent video of JUST the overlays
            // We do this frame by frame using html-to-image
            if (!overlayContainerRef.current) throw new Error("Overlay container not found");

            // Hide the actual video element temporarily inside the container so html-to-image doesn't capture it
            // We just want to capture the widgets on a transparent background
            const ogVideoDisplayStyle = videoElement.style.display;
            videoElement.style.display = 'none';

            for (let i = 0; i < totalFrames; i++) {
                const currentTime = i * frameDuration;
                videoElement.currentTime = currentTime;

                // Wait for seek to complete (in a real app, we might need to wait for a 'seeked' event or a small timeout to let React render the widgets matching the data)
                await new Promise(resolve => setTimeout(resolve, 50)); // Small yield to allow React state to settle if it depends on video time

                const dataUrl = await htmlToImage.toPng(overlayContainerRef.current, {
                    width: overlayContainerRef.current.clientWidth,
                    height: overlayContainerRef.current.clientHeight,
                    pixelRatio: 1, // Keep it 1 for performance, or increase for crispiness
                    // Ensure background is transparent
                    style: { background: 'transparent' }
                });

                // Write frame to ffmpeg
                const frameName = `frame_${i.toString().padStart(5, '0')}.png`;
                await ffmpeg.writeFile(frameName, await fetchFile(dataUrl));

                setExportState({
                    status: 'rendering_overlays',
                    progress: i / totalFrames,
                    message: `Rendering overlays: Frame ${i}/${totalFrames}`
                });
            }

            videoElement.style.display = ogVideoDisplayStyle;

            setExportState({ status: 'muxing', progress: 0, message: 'Compositing video and overlays...' });

            // 2. ffmpeg command to overlay the image sequence onto the video
            // -i input.mp4 (video)
            // -framerate 30 -i frame_%05d.png (overlay sequence)
            // -i audio.aac (audio)
            // filter_complex to scale overlay to video width/height and overlay it
            await ffmpeg.exec([
                '-i', 'input.mp4',
                '-framerate', fps.toString(), '-i', 'frame_%05d.png',
                '-i', 'audio.aac',
                '-filter_complex', '[1:v]scale=1920:1080[ovrl];[0:v][ovrl]overlay=0:0', // Adjust scale to match video
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-c:a', 'aac',
                'output.mp4'
            ]);

            setExportState({ status: 'complete', progress: 1, message: 'Export Complete!' });

            // 3. Read the output file and trigger download
            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([new Uint8Array(data as any)], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `muchracing_pro_export_${Date.now()}.mp4`;
            a.click();

            // Cleanup
            URL.revokeObjectURL(url);
            if (wasPlaying) videoElement.play();

            setTimeout(() => setExportState({ status: 'idle', progress: 0 }), 3000);

        } catch (error: any) {
            console.error("FFmpeg Export Error:", error);
            setExportState({ status: 'error', progress: 0, message: error.message || 'Export failed' });
        }
    }, []);

    return { exportState, exportVideo };
}
