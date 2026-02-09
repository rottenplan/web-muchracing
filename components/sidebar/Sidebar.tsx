'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, AreaChart, Info, Smartphone, Globe, BarChart3, Wrench, Menu } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-[60px] bg-[#212529] flex flex-col h-screen fixed left-0 top-0 border-r border-black/10 z-50">
            {/* Header/Brand */}
            <div className="h-14 flex items-center justify-center bg-[#1a1e21] border-b border-white/5">
                <Menu className="text-[#00aced]" size={20} />
            </div>

            <div className="flex-1 py-4 flex flex-col items-center gap-1 group">
                <IconNavItem href="/" icon={<Home size={22} />} active={pathname === '/'} />
                <IconNavItem href="/dashboard" icon={<AreaChart size={22} />} active={pathname === '/dashboard'} />
                <IconNavItem href="/account" icon={<Info size={22} />} active={pathname === '/account'} />
                <IconNavItem href="/devices" icon={<Smartphone size={22} />} active={pathname === '/devices'} />
                <IconNavItem href="/tracks" icon={<Globe size={22} />} active={pathname.startsWith('/tracks')} />
                <IconNavItem href="/sessions" icon={<BarChart3 size={22} />} active={pathname.startsWith('/sessions')} />
                <IconNavItem href="/settings/categories" icon={<Wrench size={22} />} active={pathname.startsWith('/settings')} />
            </div>
        </div>
    );
}

function IconNavItem({ href, icon, active }: { href: string; icon: React.ReactNode; active: boolean }) {
    return (
        <Link
            href={href}
            className={`
        w-[60px] h-[50px] flex items-center justify-center transition-colors
        ${active
                    ? 'bg-[#2c3034] text-white'
                    : 'text-[#adb5bd] hover:bg-white/5 hover:text-white'
                }
      `}
        >
            {icon}
        </Link>
    );
}
