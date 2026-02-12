'use client';

import Sidebar from '@/components/sidebar/Sidebar';
import TopBar from '@/components/topbar/TopBar';
import { SidebarProvider, useSidebar } from '@/components/sidebar/SidebarContext';
import ModuleTile from '@/components/ModuleTile';
import { Trophy, Zap, Activity, Gauge, History, Satellite, Settings, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

// Main Content Component that uses Sidebar context
function HomeContent() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex font-sans text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-[240px]'} flex flex-col min-h-screen`}>
        <TopBar />

        <main className="flex-1 p-6 relative">
          <div className="container mx-auto space-y-8">
            {/* Welcome/Header Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-white">Dashboard Utama</h1>
              <p className="text-sm text-[#adb5bd]">Selamat datang kembali di Much Racing Pro Racing System.</p>
            </div>

            {/* PRO HUB - Fast Access Logic */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-wider uppercase italic">PRO HUB</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ModuleTile icon={<Trophy className="w-6 h-6" />} label="LAP TIMER" href="/laptimer" color="highlight" />
                <ModuleTile icon={<Zap className="w-6 h-6" />} label="DRAG METER" href="/dashboard" color="primary" />
                <ModuleTile icon={<Activity className="w-6 h-6" />} label="RPM SENSOR" href="/rpm" color="highlight" />
                <ModuleTile icon={<Gauge className="w-6 h-6" />} label="CHART" href="/analysis" color="primary" />
                <ModuleTile icon={<History className="w-6 h-6" />} label="MY SESSIONS" href="/sessions" color="warning" />
                <ModuleTile icon={<Satellite className="w-6 h-6" />} label="GPS STATUS" href="/gps" color="highlight" />
                <ModuleTile icon={<Settings className="w-6 h-6" />} label="MY DEVICE" href="/devices" color="text-secondary" />
                <ModuleTile icon={<RefreshCw className="w-6 h-6" />} label="SYNC" href="/setup-device" color="primary" />
              </div>
            </div>

            {/* Recent Activity or Quick Overview */}
            <div className="bg-[#212529] p-8 rounded-2xl border border-white/5 text-center shadow-lg">
              <History className="w-12 h-12 mx-auto mb-4 text-[#adb5bd] opacity-10" />
              <p className="text-sm font-semibold text-[#adb5bd] tracking-widest uppercase">Pilih modul di atas untuk memulai</p>
            </div>
          </div>
        </main>

        <footer className="p-4 text-xs text-[#6c757d] border-t border-white/5 ml-4">
          Nearby Application SAS - 2026 - Hubungi kami
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <HomeContent />
    </SidebarProvider>
  );
}
