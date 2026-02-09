import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    color: string;
}

export default function StatCard({ icon, label, value, subtext, color }: StatCardProps) {
    const colorGlows: { [key: string]: string } = {
        primary: 'shadow-glow-blue',
        highlight: 'shadow-glow-green',
        warning: 'shadow-glow-blue', // fallback
    };

    const colorTexts: { [key: string]: string } = {
        primary: 'text-primary',
        highlight: 'text-highlight',
        warning: 'text-warning',
    };

    return (
        <div className={`glass-card rounded-2xl p-4 relative overflow-hidden group hover:border-primary/50 transition duration-500 ${colorGlows[color] ? 'hover:' + colorGlows[color] : ''}`}>
            <div className={`absolute -top-2 -right-2 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${colorTexts[color]}`}>
                {icon}
            </div>
            <div className="text-text-secondary text-[10px] font-racing mb-2 tracking-[0.1em]">{label}</div>
            <div className={`text-2xl font-data font-bold tracking-tighter mb-1 ${colorTexts[color]}`}>{value}</div>
            <div className="text-text-secondary text-[10px] opacity-60 font-medium uppercase">{subtext}</div>
        </div>
    );
}
