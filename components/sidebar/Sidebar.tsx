'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, User, Smartphone, Map, BarChart2, Settings, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [tracksOpen, setTracksOpen] = useState(true);
    const [toolsOpen, setToolsOpen] = useState(false);

    return (
        <div className="w-64 bg-[#212529] text-[#adb5bd] flex flex-col h-screen fixed left-0 top-0 border-r border-black/10 z-50">
            {/* Header/Brand */}
            <div className="h-14 flex items-center px-4 bg-[#1a1e21] border-b border-white/5">
                <span className="font-bold text-white text-lg tracking-wider">Navigation</span>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                <NavItem href="/" icon={<Home size={18} />} label="Homepage" active={pathname === '/'} />
                <NavItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/dashboard'} />
                <NavItem href="/account" icon={<User size={18} />} label="My account" active={pathname === '/account'} />
                <NavItem href="/devices" icon={<Smartphone size={18} />} label="My Device" active={pathname === '/devices'} />

                {/* Tracks Group */}
                <div className="mt-2">
                    <button
                        onClick={() => setTracksOpen(!tracksOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        <div className="flex items-center gap-3">
                            <Map size={18} />
                            <span>Tracks</span>
                        </div>
                        {tracksOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {tracksOpen && (
                        <div className="bg-[#1a1e21] py-1">
                            <SubNavItem href="/tracks" label="Track database" active={pathname === '/tracks'} />
                            <SubNavItem href="/tracks/details" label="Track details" active={pathname === '/tracks/details'} />
                            <SubNavItem href="/tracks/create" label="Create new track" active={pathname === '/tracks/create'} highlight />
                        </div>
                    )}
                </div>

                <NavItem href="/sessions" icon={<BarChart2 size={18} />} label="My Session" active={pathname.startsWith('/sessions')} />

                {/* Tools Group */}
                <div className="mt-1">
                    <button
                        onClick={() => setToolsOpen(!toolsOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-sm font-medium"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={18} />
                            <span>Tools & settings</span>
                        </div>
                        {toolsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {toolsOpen && (
                        <div className="bg-[#1a1e21] py-1">
                            <SubNavItem href="/settings/categories" label="Manage categories" active={pathname === '/settings/categories'} />
                            <SubNavItem href="/tools/gpx-to-geojson" label="GPX To GeoJson" active={pathname === '/tools/gpx-to-geojson'} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-4 py-3 text-sm font-medium border-l-4 transition-colors
        ${active
                    ? 'bg-[#2c3034] text-white border-[#17a2b8]'
                    : 'border-transparent hover:bg-white/5 hover:text-white'
                }
      `}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

function SubNavItem({ href, label, active, highlight }: { href: string; label: string; active: boolean; highlight?: boolean }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-4 py-2 pl-12 text-xs transition-colors
        ${active
                    ? 'text-white font-medium'
                    : 'text-[#adb5bd] hover:text-white'
                }
        ${highlight ? 'text-white' : ''}
      `}
        >
            {highlight && <span className="text-[#17a2b8] font-bold text-lg leading-none mb-1">+</span>}
            <span>{label}</span>
        </Link>
    );
}
