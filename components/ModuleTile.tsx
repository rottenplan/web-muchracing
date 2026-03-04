import React from 'react';
import Link from 'next/link';

interface ModuleTileProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    onClick?: () => void;
    color?: string;
}

export default function ModuleTile({ icon, label, href, onClick, color = 'primary' }: ModuleTileProps) {
    const colorTexts: { [key: string]: string } = {
        primary: 'text-primary',
        highlight: 'text-highlight',
        warning: 'text-warning',
        'text-secondary': 'text-text-secondary',
    };

    const content = (
        <div
            onClick={onClick}
            className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-all duration-300 group cursor-pointer aspect-square sm:aspect-auto sm:h-32 border border-white/5"
        >
            <div className={`p-4 rounded-2xl bg-background-secondary group-hover:bg-white/5 transition-all duration-500 ${colorTexts[color] || 'text-primary'} group-hover:scale-110 shadow-inner`}>
                {icon}
            </div>
            <span className="text-[10px] font-racing text-white group-hover:text-primary transition-colors tracking-[0.2em]">{label}</span>
        </div>
    );

    if (href === "#") return content;
    return <Link href={href} className="block">{content}</Link>;
}
