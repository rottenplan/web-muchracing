 'use client';
 
 import { useState } from 'react';
 import Link from 'next/link';
 import { ChevronLeft, Upload, FileText, Download } from 'lucide-react';
 import { parseGpx, ParsedTrack } from '@/lib/gpxParser';
 
 interface GeoJSONFeature {
   type: 'Feature';
   properties: Record<string, any>;
   geometry: {
     type: 'LineString' | 'Point';
     coordinates: number[] | number[][];
   };
 }
 
 interface GeoJSON {
   type: 'FeatureCollection';
   features: GeoJSONFeature[];
 }
 
 function toGeoJSON(parsed: ParsedTrack): GeoJSON {
   const lineFeature: GeoJSONFeature = {
     type: 'Feature',
     properties: {
       name: parsed.name || 'GPX Track',
     },
     geometry: {
       type: 'LineString',
       coordinates: parsed.points.map((p) => [p.lon, p.lat, p.ele ?? 0]),
     },
   };
 
   return {
     type: 'FeatureCollection',
     features: [lineFeature],
   };
 }
 
 export default function GpxToGeoJsonPage() {
   const [fileName, setFileName] = useState<string>('');
   const [geojson, setGeojson] = useState<GeoJSON | null>(null);
   const [pointsCount, setPointsCount] = useState<number>(0);
   const [trackName, setTrackName] = useState<string>('');
 
   const handleFile = async (file: File) => {
     setFileName(file.name);
     const buffer = await file.arrayBuffer();
     const content = new TextDecoder('utf-8').decode(buffer);
 
     const parsed = parseGpx(content);
     setPointsCount(parsed.points.length);
     setTrackName(parsed.name || file.name.replace('.gpx', ''));
 
     const gj = toGeoJSON(parsed);
     setGeojson(gj);
   };
 
   const handleDownload = () => {
     if (!geojson) return;
     const blob = new Blob([JSON.stringify(geojson, null, 2)], {
       type: 'application/geo+json',
     });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     const base = fileName ? fileName.replace(/\.gpx$/i, '') : (trackName || 'track');
     a.download = `${base}.geojson`;
     document.body.appendChild(a);
     a.click();
     a.remove();
     URL.revokeObjectURL(url);
   };
 
   return (
     <main className="min-h-screen bg-background text-foreground">
       <header className="w-full h-16 glass-header px-4 flex items-center justify-between sticky top-0 z-50">
         <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition border border-transparent hover:border-white/5">
           <ChevronLeft className="w-5 h-5 text-primary" />
         </Link>
         <h1 className="text-lg font-racing tracking-[0.2em] italic">GPX TO GEOJSON</h1>
         <div className="w-2 h-2 rounded-full bg-primary"></div>
       </header>
 
       <div className="p-6 max-w-3xl mx-auto space-y-6">
         <div className="glass-card rounded-2xl border border-white/5 p-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Upload className="w-5 h-5 text-primary" />
               <span className="text-sm font-racing uppercase tracking-widest text-text-secondary">Upload GPX</span>
             </div>
             <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm cursor-pointer transition">
               Pilih File
               <input
                 type="file"
                 accept=".gpx,application/gpx+xml"
                 className="hidden"
                 onChange={(e) => {
                   const f = e.target.files?.[0];
                   if (f) handleFile(f);
                 }}
               />
             </label>
           </div>
 
           {fileName && (
             <div className="mt-4 flex items-center gap-3 text-xs text-text-secondary">
               <FileText className="w-4 h-4" />
               <span className="font-data">{fileName}</span>
               <span className="opacity-50">•</span>
               <span>{pointsCount} points</span>
               {trackName && (
                 <>
                   <span className="opacity-50">•</span>
                   <span className="font-racing uppercase tracking-widest">{trackName}</span>
                 </>
               )}
             </div>
           )}
         </div>
 
         <div className="glass-card rounded-2xl border border-white/5 p-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
               <Download className="w-5 h-5 text-primary" />
               <span className="text-sm font-racing uppercase tracking-widest text-text-secondary">Export GeoJSON</span>
             </div>
             <button
               className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-lg text-sm text-white transition disabled:opacity-50"
               disabled={!geojson}
               onClick={handleDownload}
             >
               Unduh .geojson
             </button>
           </div>
 
           <div className="mt-4">
             <pre className="text-xs bg-black/40 border border-white/10 rounded-lg p-4 overflow-auto max-h-72">
               {geojson ? JSON.stringify(geojson, null, 2) : '// Unggah file GPX untuk melihat preview GeoJSON di sini'}
             </pre>
           </div>
         </div>
       </div>
     </main>
   );
 }
