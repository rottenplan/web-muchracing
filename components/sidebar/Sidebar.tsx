'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AreaChart, Info, Smartphone, Globe, BarChart3, Wrench, Menu, ChevronDown, MapPin, PlusCircle } from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [isTracksOpen, setIsTracksOpen] = useState(false);

    // Auto-open sections if a sub-route is active
    useEffect(() => {
        if (pathname.startsWith('/settings') || pathname.startsWith('/tools')) {
            setIsToolsOpen(true);
        }
        if (pathname.startsWith('/tracks')) {
            setIsTracksOpen(true);
        }
    }, [pathname]);

    return (
        <div className={`transition-all duration-300 ${isCollapsed ? 'w-[60px]' : 'w-[240px]'} bg-[#212529] flex flex-col h-screen fixed left-0 top-0 border-r border-black/10 z-[100] overflow-hidden`}>
            {/* Header/Brand */}
            <div className={`h-14 flex items-center ${isCollapsed ? 'justify-center' : 'px-4 justify-between'} bg-[#1a1e21] border-b border-white/5`}>
                {!isCollapsed && <span className="font-bold text-white text-lg tracking-wider">Navigation</span>}
                <button
                    onClick={toggleSidebar}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                >
                    <Menu className="text-[#00aced]" size={20} />
                </button>
            </div>

            <div className={`flex-1 py-4 flex flex-col ${isCollapsed ? 'items-center' : 'items-stretch'} gap-1 group overflow-y-auto`}>
                <IconNavItem href="/" icon={<Home size={22} />} label="Homepage" active={pathname === '/'} collapsed={isCollapsed} />
                <IconNavItem href="/dashboard" icon={<AreaChart size={22} />} label="Dashboard" active={pathname === '/dashboard'} collapsed={isCollapsed} />
                <IconNavItem href="/account" icon={<Info size={22} />} label="My account" active={pathname === '/account'} collapsed={isCollapsed} />
                <IconNavItem href="/devices" icon={<Smartphone size={22} />} label="My Device" active={pathname === '/devices'} collapsed={isCollapsed} />

                {/* Tracks Expandable */}
                <div className="flex flex-col">
                    <button
                        onClick={() => !isCollapsed && setIsTracksOpen(!isTracksOpen)}
                        className={`
                            h-[50px] flex items-center ${isCollapsed ? 'w-[60px] justify-center' : 'px-4 gap-3'} transition-colors
                            ${pathname.startsWith('/tracks')
                                ? 'bg-[#2c3034] text-white'
                                : 'text-[#adb5bd] hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <div className="flex-shrink-0"><Globe size={22} /></div>
                        {!isCollapsed && (
                            <>
                                <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">Tracks</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isTracksOpen ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </button>

                    {!isCollapsed && isTracksOpen && (
                        <div className="bg-[#1a1e21] py-1">
                            <SubNavItem href="/tracks" icon={<Globe size={18} />} label="Track database" active={pathname === '/tracks'} />
                            <SubNavItem href="/tracks/details" icon={<MapPin size={18} />} label="Track details" active={pathname.startsWith('/tracks/details')} />
                            <SubNavItem href="/tracks/create" icon={<PlusCircle size={18} />} label="Create new track" active={pathname === '/tracks/create'} />
                        </div>
                    )}
                </div>

                <IconNavItem href="/sessions" icon={<BarChart3 size={22} />} label="My Session" active={pathname.startsWith('/sessions')} collapsed={isCollapsed} />

                {/* Tools & Settings Expandable */}
                <div className="flex flex-col">
                    <button
                        onClick={() => !isCollapsed && setIsToolsOpen(!isToolsOpen)}
                        className={`
                            h-[50px] flex items-center ${isCollapsed ? 'w-[60px] justify-center' : 'px-4 gap-3'} transition-colors
                            ${pathname.startsWith('/settings') || pathname.startsWith('/tools')
                                ? 'bg-[#2c3034] text-white'
                                : 'text-[#adb5bd] hover:bg-white/5 hover:text-white'
                            }
                        `}
                    >
                        <div className="flex-shrink-0"><Wrench size={22} /></div>
                        {!isCollapsed && (
                            <>
                                <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">Tools & settings</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
                            </>
                        )}
                    </button>

                    {!isCollapsed && isToolsOpen && (
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

function IconNavItem({ href, icon, label, active, collapsed }: { href: string; icon: React.ReactNode; label: string; active: boolean; collapsed: boolean }) {
    return (
        <Link
            href={href}
            className={`
        h-[50px] flex items-center ${collapsed ? 'w-[60px] justify-center' : 'px-4 gap-3'} transition-colors
        ${active
                    ? 'bg-[#2c3034] text-white'
                    : 'text-[#adb5bd] hover:bg-white/5 hover:text-white'
                }
      `}
        >
            <div className="flex-shrink-0">{icon}</div>
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
        </Link>
    );
}

function SubNavItem({ href, label, active, icon }: { href: string; label: string; active: boolean; icon?: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`
                h-10 flex items-center px-6 gap-3 text-sm transition-colors
                ${active ? 'text-[#00aced]' : 'text-[#adb5bd] hover:text-white hover:bg-white/5'}
            `}
        >
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    );
}
