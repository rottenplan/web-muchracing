'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  MapPin,
  Save,
  Trash2,
  Plus,
  Layout,
  User,
  Settings,
  Database,
  MonitorSmartphone,
  History,
  Home,
  Search,
  RefreshCw,
  Compass,
  Menu,
  ChevronDown
} from 'lucide-react';
import TrackCreatorMapWrapper from '@/components/TrackCreatorMapWrapper';

interface TrackPoint {
  lat: number;
  lng: number;
}

export default function CreateTrack() {
  // Track Points & Sectors
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([]);
  const [sectors, setSectors] = useState<{ lat: number, lng: number }[]>([]);
  const [currentMarkerPos, setCurrentMarkerPos] = useState<TrackPoint | null>(null);

  // Form States
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [trackType, setTrackType] = useState('');
  const [trackName, setTrackName] = useState('');
  const [phone, setPhone] = useState('');
  const [postCode, setPostCode] = useState('');
  const [city, setCity] = useState('');
  const [uid, setUid] = useState('{' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 6) + '-4a17-f55004e05d9b2}');
  const [startLineWidth, setStartLineWidth] = useState(12);
  const [startLineBearing, setStartLineBearing] = useState(0);

  const handlePointAdd = (lat: number, lng: number) => {
    setTrackPoints([...trackPoints, { lat, lng }]);
    setCurrentMarkerPos({ lat, lng });
  };

  const handleAddSector = () => {
    if (currentMarkerPos) {
      setSectors([...sectors, currentMarkerPos]);
    } else {
      alert("Klik peta terlebih dahulu untuk menentukan titik.");
    }
  };

  const handleDeleteSector = () => {
    if (sectors.length > 0) {
      setSectors(sectors.slice(0, -1));
    }
  };

  const handleRemoveLastPoint = () => {
    if (trackPoints.length > 0) {
      setTrackPoints(trackPoints.slice(0, -1));
    }
  };

  const handleNewTrack = () => {
    if (confirm("Reset pembuatan lintasan?")) {
      setTrackPoints([]);
      setSectors([]);
      setTrackName('');
      setAddress('');
    }
  };

  const handleSaveDraft = async () => {
    alert("Draf lintasan berhasil disimpan!");
  };

  const handlePublishTrack = async () => {
    if (trackPoints.length < 3) {
      alert("Lintasan harus memiliki setidaknya 3 titik koordinat.");
      return;
    }
    alert("Lintasan berhasil dipublikasikan!");
  };

  return (
    <div className="flex flex-col h-screen bg-[#111] text-white overflow-hidden overflow-y-auto">
      {/* Header Area */}
      <header className="h-14 border-b border-white/10 bg-black flex items-center justify-between px-4 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <MapPin className="text-white w-5 h-5" />
            </div>
            <h1 className="font-racing tracking-widest text-lg uppercase hidden md:block">Track Creator</h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-4 text-[10px] font-racing tracking-widest text-text-secondary uppercase">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <span>/</span>
            <Link href="/dashboard" className="hover:text-primary transition">Much Racing</Link>
            <span>/</span>
            <span className="text-white">Race Track</span>
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-racing">Muchdas</div>
              <div className="text-[10px] text-text-secondary">faisalmuchdas@gmail.com</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-highlight flex items-center justify-center border border-white/20">
              <User className="w-4 h-4 text-white" />
            </div>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden overflow-y-auto">
        {/* Sidebar Column */}
        <aside className="w-12 border-r border-white/10 bg-black flex flex-col items-center py-4 gap-6 shrink-0 h-full overflow-y-auto">
          <NavItem icon={<Home className="w-5 h-5" />} href="/" />
          <NavItem icon={<MonitorSmartphone className="w-5 h-5" />} href="/dashboard" />
          <NavItem icon={<User className="w-5 h-5" />} href="/account" />
          <NavItem icon={<Database className="w-5 h-5" />} href="/tracks" active />
          <NavItem icon={<History className="w-5 h-5" />} href="/sessions" />
          <NavItem icon={<Settings className="w-5 h-5" />} href="/settings" />
        </aside>

        {/* Control Panel Column */}
        <aside className="w-72 border-r border-white/10 bg-[#1a1a1a] flex flex-col h-full overflow-y-auto">
          <div className="p-4 space-y-4 flex-1 h-full overflow-y-auto">
            <FormGroup label="Select a country:">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
              >
                <option value="" disabled>Select Country</option>
                <option>Indonesia</option>
                {/* Add more countries as needed */}
              </select>
            </FormGroup>

            <FormGroup label="Address:">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
              <button className="mt-2 bg-success/80 hover:bg-success text-white px-3 py-1 rounded text-[10px] font-racing transition">
                Map update
              </button>
            </FormGroup>

            <FormGroup label="Track type:">
              <select
                value={trackType}
                onChange={(e) => setTrackType(e.target.value)}
                className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
              >
                <option value="" disabled>Select Type</option>
                <option>Race track</option>
                <option>Karting</option>
                <option>Street</option>
              </select>
            </FormGroup>

            <FormGroup label="Track name:">
              <input
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
              />
            </FormGroup>

            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Phone:">
                <input className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary" />
              </FormGroup>
              <FormGroup label="Post code:">
                <input className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary" />
              </FormGroup>
            </div>

            <FormGroup label="City:">
              <input className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary" />
            </FormGroup>

            <FormGroup label="uid:">
              <input
                value={uid}
                disabled
                className="w-full bg-[#222] border border-white/5 rounded px-2 py-1.5 text-xs text-text-secondary cursor-not-allowed"
              />
            </FormGroup>

            <div className="pt-4 mt-4 border-t border-white/5 space-y-4 overflow-y-auto">
              <FormGroup label="Start line width (meters):">
                <input
                  type="number"
                  value={startLineWidth}
                  onChange={(e) => setStartLineWidth(Number(e.target.value))}
                  className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary font-data"
                />
              </FormGroup>
              <FormGroup label="Start line bearing (degree):">
                <input
                  type="number"
                  value={startLineBearing}
                  onChange={(e) => setStartLineBearing(Number(e.target.value))}
                  className="w-full bg-[#333] border border-white/10 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary font-data"
                />
              </FormGroup>
            </div>

            {/* Sectors Display */}
            <div className="pt-4 border-t border-white/5 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-racing text-text-secondary uppercase">Sectors: {sectors.length}</span>
                <div className="flex gap-1">
                  <button onClick={handleAddSector} className="bg-success/80 hover:bg-success p-1 rounded text-white"><Plus className="w-3 h-3" /></button>
                  <button onClick={handleDeleteSector} className="bg-danger/80 hover:bg-danger p-1 rounded text-white"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2 pb-8 overflow-y-auto">
              <button
                onClick={handleRemoveLastPoint}
                className="w-full bg-danger hover:bg-danger/90 text-white py-2 rounded text-[10px] font-racing uppercase tracking-widest transition"
              >
                Remove Last Point
              </button>
              <button
                onClick={handleNewTrack}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-[10px] font-racing uppercase tracking-widest transition"
              >
                New track
              </button>
              <button
                onClick={handlePublishTrack}
                className="w-full bg-success hover:bg-success/90 text-white py-2 rounded text-[10px] font-racing uppercase tracking-widest transition"
              >
                Save track
              </button>
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative h-full">
          <TrackCreatorMapWrapper
            points={trackPoints}
            sectors={sectors}
            onPointAdd={handlePointAdd}
          />

          {/* Map Overlays */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <MapControlButton icon={<Layout className="w-4 h-4" />} />
            <MapControlButton icon={<Plus className="w-4 h-4" />} />
            <MapControlButton icon={<Plus className="w-4 h-4 scale-y-[-1]" />} />
            <MapControlButton icon={<Compass className="w-4 h-4" />} />
          </div>
        </main>
      </div>

      {/* Bottom Sector Info & Timeline Placeholder */}
      <div className="h-12 bg-black border-t border-white/10 flex items-center px-6 shrink-0 h-full overflow-y-auto">
        <div className="text-[10px] font-racing tracking-widest text-text-secondary uppercase flex items-center gap-2">
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
          System Ready
        </div>
        <div className="flex-1 max-w-md mx-auto h-1.5 bg-white/5 rounded-full relative">
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, href, active = false }: { icon: React.ReactNode; href: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`p-2 rounded transition-colors ${active ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
    >
      {icon}
    </Link>
  );
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-racing text-text-secondary uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function MapControlButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-8 h-8 bg-black/80 backdrop-blur-md border border-white/10 rounded flex items-center justify-center text-white hover:bg-primary hover:border-primary transition shadow-xl">
      {icon}
    </button>
  );
}
