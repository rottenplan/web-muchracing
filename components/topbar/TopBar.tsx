'use client';

import { Menu, Home, ChevronRight, User, ChevronDown, LayoutDashboard, Smartphone, Info, Power } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function TopBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="h-14 bg-[#212529] border-b border-black/10 flex items-center justify-between px-4 sticky top-0 z-40">
            {/* Left: Breadcrumb / Title */}
            <div className="flex items-center gap-4">
                <button className="text-[#adb5bd] hover:text-white transition-colors">
                    <Menu size={20} />
                </button>

                <div className="flex items-center gap-2 text-sm text-[#adb5bd]">
                    <span className="font-semibold text-white">FoxLap - Dashboard</span>
                </div>
            </div>

            {/* Right: User Profile */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-4 hover:bg-white/5 p-1 rounded transition-colors"
                >
                    <div className="flex items-center gap-2 text-right">
                        <div className="hidden sm:block">
                            <div className="text-xs font-bold text-white">Muchdas</div>
                            <div className="text-[10px] text-[#adb5bd]">faisalmuchdas@gmail.com</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#17a2b8] flex items-center justify-center text-white border border-white/10 overflow-hidden">
                            {/* Use a helmet icon or placeholder if image fails, but user requested visual match so let's try to match the style */}
                            <img src="/helmet-avatar.png" alt="M" className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerText = 'M';
                                }}
                            />
                        </div>
                        <ChevronDown size={14} className={`text-[#adb5bd] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 animate-in fade-in zoom-in-95 duration-100">
                        {/* Header in Dropdown (Mobile/Compact view or just visual match) */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                {/* Placeholder for the yellow helmet in screenshot */}
                                <div className="w-full h-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-black border-b-4 border-black/20">
                                    RUN
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-800">Muchdas</div>
                                <div className="text-xs text-gray-500">faisalmuchdas@gmail.com</div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600">
                                <ChevronDown size={16} className="rotate-180" />
                            </button>
                        </div>

                        <div className="py-1">
                            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#17a2b8] transition-colors">
                                <LayoutDashboard size={16} />
                                <span>Dashboard</span>
                            </Link>
                            <Link href="/devices" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#17a2b8] transition-colors">
                                <Smartphone size={16} />
                                <span>My Device</span>
                            </Link>
                            <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#17a2b8] transition-colors">
                                <Info size={16} />
                                <span>My account</span>
                            </Link>
                        </div>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                            <button
                                onClick={() => {
                                    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                                    window.location.href = '/login';
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors text-left"
                            >
                                <Power size={16} />
                                <span>Disconnect</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
