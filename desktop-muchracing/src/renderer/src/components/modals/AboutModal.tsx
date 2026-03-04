import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Mail } from 'lucide-react';
import logo from '../../assets/logo.png';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'About' | 'License' | 'OpenSSL';

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('About');

    const tabs: Tab[] = ['About', 'License', 'OpenSSL'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#3d4451] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Title Bar (Mac-like) */}
                        <div className="h-8 bg-[#2d333d] flex items-center px-3 gap-2 border-b border-black/20">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                            </div>
                            <span className="flex-1 text-center text-[11px] font-bold text-slate-400 uppercase tracking-tighter">About Much GPX Analysis</span>
                        </div>

                        {/* Logo Section */}
                        <div className="p-8 flex flex-col items-center">
                            <img src={logo} alt="Much Racing Logo" className="h-24 w-auto object-contain drop-shadow-2xl mb-4" />

                            <div className="flex flex-col items-center gap-2 mb-6">
                                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Much GPX <span className="text-blue-500">Analysis</span></h1>
                                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">FoxLAP Studio</span>
                            </div>

                            <div className="w-full flex justify-between items-end mb-8">
                                <div className="flex flex-col gap-1">
                                    <a href="https://muchracing.com" target="_blank" rel="noreferrer" className="text-blue-400 text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4">
                                        https://muchracing.com
                                        <ExternalLink size={12} />
                                    </a>
                                    <a href="mailto:support@muchracing.com" className="text-slate-300 text-sm font-bold flex items-center gap-1 hover:text-white transition-colors">
                                        support@muchracing.com
                                        <Mail size={12} />
                                    </a>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">Development: Much Racing Team</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white/90 tracking-tighter italic">V1.5.0</span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="w-full flex rounded-md overflow-hidden bg-black/20 p-0.5 mb-6">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex-1 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="w-full h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {activeTab === 'About' && (
                                    <div className="space-y-4 text-[13px] leading-relaxed text-slate-200">
                                        <p>
                                            <strong className="text-white">Much GPX Analysis – FoxLAP Studio</strong> is a powerful and intuitive telemetry overlay software designed for motorsport enthusiasts, track day drivers, and competitive karting teams.
                                        </p>
                                        <p>
                                            Originally developed to complement the Much Racing lap timer, <strong className="text-blue-400">Much GPX</strong> makes it easy to superimpose rich performance data directly onto your racing videos.
                                        </p>
                                        <p>
                                            Whether you're looking to <strong className="text-white underline underline-offset-4">analyze your driving</strong>, share your progress on social media, or simply relive your best laps with detailed data, FoxLAP Studio empowers you to create professional-quality dashboards and video overlays in just a few clicks.
                                        </p>
                                    </div>
                                )}
                                {activeTab === 'License' && (
                                    <div className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-tight">
                                        MIT License
                                        {"\n\n"}
                                        Copyright (c) 2026 Much Racing Team
                                        {"\n\n"}
                                        Permission is hereby granted, free of charge, to any person obtaining a copy
                                        of this software and associated documentation files (the "Software"), to deal
                                        in the Software without restriction, including without limitation the rights
                                        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                                        copies of the Software, and to permit persons to whom the Software is
                                        furnished to do so, subject to the following conditions...
                                    </div>
                                )}
                                {activeTab === 'OpenSSL' && (
                                    <div className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-tight">
                                        This product includes software developed by the OpenSSL Project for use in the OpenSSL Toolkit (http://www.openssl.org/)
                                        {"\n\n"}
                                        Copyright (c) 1998-2026 The OpenSSL Project.  All rights reserved.
                                        {"\n\n"}
                                        Redistribution and use in source and binary forms, with or without
                                        modification, are permitted provided that the following conditions
                                        are met: ...
                                    </div>
                                )}
                            </div>

                            {/* OK Button */}
                            <button
                                onClick={onClose}
                                className="mt-8 px-12 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] text-[13px] rounded shadow-lg shadow-blue-900/40 transition-all hover:scale-105"
                            >
                                Ok
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
