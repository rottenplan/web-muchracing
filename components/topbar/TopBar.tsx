'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, AreaChart, Smartphone, Info, Power, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TopBar() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const handleDisconnect = async () => {
        try {
            // Call logout API
            await fetch('/api/auth/logout', { method: 'POST' });

            // Clear cookie client-side
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

            // Close dropdown and redirect
            setIsOpen(false);
            router.push('/login');
            router.refresh(); // Ensure server components refresh
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-14 bg-[#212529] border-b border-white/5 px-6 flex items-center justify-between sticky top-0 z-[90]">
            {/* Branding */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#ff4d4d] rounded-md flex items-center justify-center p-1.5 shadow-lg shadow-black/20">
                    <svg viewBox="0 0 24 24" className="w-full h-full text-white fill-current">
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="#ffffff" />
                    </svg>
                </div>
                <span className="font-extrabold text-white text-lg tracking-wider">Much Racing</span>
            </div>

            {/* Profile Section */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 hover:bg-black/5 px-3 py-1.5 rounded-md transition-colors"
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5">
                        <Image
                            src="/images/helmet_avatar.png"
                            alt="Muchdas"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <div className="hidden md:flex flex-col items-start leading-tight">
                        <span className="text-sm font-semibold text-[#343a40]">Muchdas</span>
                        <span className="text-[11px] text-[#6c757d]">faisalmuchdas@gmail.com</span>
                    </div>
                    {isOpen ? <ChevronUp size={14} className="text-[#adb5bd]" /> : <ChevronDown size={14} className="text-[#adb5bd]" />}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-black/10 rounded-lg shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-3 border-b border-black/5 mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5">
                                <Image
                                    src="/images/helmet_avatar.png"
                                    alt="Muchdas"
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#343a40]">Muchdas</span>
                                <span className="text-xs text-[#6c757d]">faisalmuchdas@gmail.com</span>
                            </div>
                        </div>

                        <DropdownItem href="/dashboard" icon={<AreaChart size={18} />} label="Dashboard" onClick={() => setIsOpen(false)} />
                        <DropdownItem href="/devices" icon={<Smartphone size={18} />} label="My Device" onClick={() => setIsOpen(false)} />
                        <DropdownItem href="/account" icon={<Info size={18} />} label="My account" onClick={() => setIsOpen(false)} />

                        <div className="h-px bg-black/5 my-2 mx-2" />

                        <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#ff4d4d] hover:bg-red-50 transition-colors"
                            onClick={handleDisconnect}
                        >
                            <Power size={18} />
                            <span className="font-medium">Disconnect</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#495057] hover:bg-black/5 hover:text-[#00aced] transition-colors"
        >
            <span className="text-[#adb5bd]">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
