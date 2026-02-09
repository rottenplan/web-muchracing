'use client';

import { useState } from 'react';
import { Home, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';

const CATEGORIES = [
    { id: 0, name: 'unknown', isSystem: true },
    { id: 1, name: '4T Subaru mini', isSystem: true },
    { id: 2, name: '4T Subaru 211', isSystem: true },
    { id: 3, name: '4T Subaru 400', isSystem: true },
    { id: 4, name: '4T Subaru 400 master', isSystem: true },
    { id: 5, name: '4T MINIKART Honda GX 120', isSystem: true },
    { id: 6, name: 'Rotax 125 Mini Max', isSystem: true },
    { id: 7, name: 'Vortex MINI 60', isSystem: true },
    { id: 8, name: 'Rotax j125 Max & EVO', isSystem: true },
    { id: 9, name: 'IAME X30 RL Tag - C / 125cc', isSystem: true },
    { id: 10, name: 'IAME X30 RL Tag - C / 125cc', isSystem: true },
    { id: 11, name: 'OK-j 125cc 35cv', isSystem: true },
    { id: 12, name: 'KZ2', isSystem: true },
    { id: 13, name: 'KZ2 Master', isSystem: true },
    { id: 14, name: 'KZ2 Gentleman', isSystem: true },
    { id: 15, name: 'IAME KF5 100cc', isSystem: true },
    { id: 16, name: 'IAME Redjet KA100 - Tag', isSystem: true },
    { id: 17, name: 'IAME X30 Junior 125cc', isSystem: true },
    { id: 18, name: 'IAME X30 Spec EU', isSystem: true },
    { id: 19, name: 'Rotax 125 Max DD2 Evo', isSystem: true },
    { id: 35, name: 'Rotax Max', isSystem: true },
    { id: 104, name: 'Vespa Tune Up', isSystem: false },
    { id: 105, name: 'Vespa Tune Up', isSystem: false },
    { id: 106, name: 'Vespa Standart', isSystem: false },
    { id: 107, name: 'Vespa Tune Up', isSystem: false },
];

export default function CategoriesPage() {
    const [isTableOpen, setIsTableOpen] = useState(true);

    return (
        <div className="space-y-6">
            {/* Breadcrumbs & Header */}
            <div className="flex justify-between items-center bg-[#1a1e21] -m-6 mb-6 px-6 py-2 border-b border-white/5">
                <h1 className="text-white text-lg font-normal mb-0">Categories</h1>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Home size={12} className="text-gray-400" />
                    <span>/</span>
                    <span>Categories</span>
                </div>
            </div>

            {/* Categories Manager Card */}
            <div className="bg-white dark:bg-[#212529] shadow-sm rounded-sm border border-gray-200 dark:border-white/5 overflow-hidden">
                {/* Header */}
                <div
                    className="bg-[#5bc0de] px-4 py-2 flex justify-between items-center cursor-pointer hover:bg-[#46b8da] transition-colors"
                    onClick={() => setIsTableOpen(!isTableOpen)}
                >
                    <h3 className="text-white text-sm font-normal m-0">Categories manager</h3>
                    <ChevronDown className={`text-white transition-transform ${isTableOpen ? '' : '-rotate-90'}`} size={16} />
                </div>

                {/* Content */}
                {isTableOpen && (
                    <div className="p-4 space-y-4">
                        <button className="bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1.5 rounded-sm text-xs flex items-center gap-1 transition-colors">
                            <Plus size={14} />
                            Add a category
                        </button>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                                        <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 w-16">Index</th>
                                        <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400">Category name</th>
                                        <th className="py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CATEGORIES.map((cat, idx) => (
                                        <tr
                                            key={`${cat.id}-${idx}`}
                                            className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300">{cat.id}</td>
                                            <td className="py-2 px-3 text-xs text-gray-700 dark:text-gray-300">{cat.name}</td>
                                            <td className="py-2 px-3 text-xs text-right">
                                                {cat.isSystem ? (
                                                    <span className="text-gray-400 italic">system category</span>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                                            <Edit2 size={12} />
                                                        </button>
                                                        <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
