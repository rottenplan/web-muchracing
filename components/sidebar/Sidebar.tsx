'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AreaChart, Info, Smartphone, Globe, BarChart3, Wrench, Menu } from 'lucide-react';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

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

            <div className={`flex-1 py-4 flex flex-col ${isCollapsed ? 'items-center' : 'items-stretch'} gap-1 group`}>
                <IconNavItem href="/" icon={<Home size={22} />} label="Homepage" active={pathname === '/'} collapsed={isCollapsed} />
                <IconNavItem href="/dashboard" icon={<AreaChart size={22} />} label="Dashboard" active={pathname === '/dashboard'} collapsed={isCollapsed} />
                <IconNavItem href="/account" icon={<Info size={22} />} label="My account" active={pathname === '/account'} collapsed={isCollapsed} />
                <IconNavItem href="/devices" icon={<Smartphone size={22} />} label="My Device" active={pathname === '/devices'} collapsed={isCollapsed} />
                <IconNavItem href="/tracks" icon={<Globe size={22} />} label="Tracks" active={pathname.startsWith('/tracks')} collapsed={isCollapsed} />
                <IconNavItem href="/sessions" icon={<BarChart3 size={22} />} label="My Session" active={pathname.startsWith('/sessions')} collapsed={isCollapsed} />
                <IconNavItem href="/settings/categories" icon={<Wrench size={22} />} label="Tools & settings" active={pathname.startsWith('/settings')} collapsed={isCollapsed} />
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
