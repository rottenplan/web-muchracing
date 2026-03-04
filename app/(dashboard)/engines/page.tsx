'use client';

import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Check, Clock, Wrench } from 'lucide-react';

interface Engine {
    id: number;
    name: string;
    hours: number;
}

export default function EnginesPage() {
    const [engines, setEngines] = useState<Engine[]>([]);
    const [activeEngine, setActiveEngine] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newName, setNewName] = useState('');
    const [newHours, setNewHours] = useState('0');
    const [isAdding, setIsAdding] = useState(false);

    const fetchEngines = async () => {
        try {
            const res = await fetch('/api/engines');
            const data = await res.json();
            if (data.success) {
                setEngines(data.engines);
                setActiveEngine(data.activeEngine);
            }
        } catch (error) {
            console.error('Failed to load engines', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEngines();
    }, []);

    const handleAction = async (payload: any) => {
        try {
            const res = await fetch('/api/engines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setEngines(data.engines);
                setActiveEngine(data.activeEngine);
                setIsAdding(false);
                setNewName('');
                setNewHours('0');
            }
        } catch (error) {
            console.error('Action failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#1a1a1a] pb-24 font-sans text-white p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-[#212529] p-4 rounded-lg border border-white/10 shadow-lg flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                            <Wrench className="text-[#f0ad4e]" />
                            Engine Management
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Manage maintenance intervals and active engine.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-[#5bc0de] hover:bg-[#46b8da] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 transition"
                    >
                        <Plus size={16} /> Add Engine
                    </button>
                </div>

                {/* Add Engine Form */}
                {isAdding && (
                    <div className="bg-[#2c3034] p-4 rounded-lg border-l-4 border-[#5bc0de] animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-sm font-bold mb-3 uppercase text-[#5bc0de]">New Engine Details</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Engine Name</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm focus:border-[#5bc0de] outline-none"
                                    placeholder="e.g. TM KZ10C"
                                />
                            </div>
                            <div className="w-32">
                                <label className="text-xs text-gray-400 block mb-1">Initial Hours</label>
                                <input
                                    type="number"
                                    value={newHours}
                                    onChange={(e) => setNewHours(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded px-3 py-2 text-sm focus:border-[#5bc0de] outline-none"
                                />
                            </div>
                            <button
                                onClick={() => handleAction({ action: 'ADD', name: newName, hours: newHours })}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-bold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}

                {/* Engines List */}
                <div className="grid gap-4">
                    {engines.map((engine) => (
                        <div
                            key={engine.id}
                            className={`bg-[#2c3034] p-4 rounded-lg border ${activeEngine === engine.id ? 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'border-white/5'} flex items-center justify-between transition-all`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${activeEngine === engine.id ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-gray-400'}`}>
                                    <Settings size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{engine.name}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {engine.hours.toFixed(1)} Hours</span>
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">ID: {engine.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeEngine !== engine.id && (
                                    <button
                                        onClick={() => handleAction({ action: 'SET_ACTIVE', id: engine.id })}
                                        className="text-gray-400 hover:text-green-400 text-xs font-bold px-3 py-1.5 border border-white/10 hover:border-green-400 rounded transition"
                                    >
                                        Select Active
                                    </button>
                                )}
                                {activeEngine === engine.id && (
                                    <span className="text-green-500 text-xs font-bold px-3 py-1.5 border border-green-500 rounded bg-green-500/10 flex items-center gap-1">
                                        <Check size={12} /> Active
                                    </span>
                                )}

                                <button
                                    onClick={() => handleAction({ action: 'DELETE', id: engine.id })}
                                    className="text-gray-500 hover:text-red-500 p-2 hover:bg-red-500/10 rounded transition"
                                    title="Delete Engine"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {engines.length === 0 && !loading && (
                        <div className="text-center p-8 text-gray-500">
                            No engines found. Add one to get started.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
