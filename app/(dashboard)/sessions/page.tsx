import Link from 'next/link';
import { MapPin, Edit, Trash2, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import SessionModel from '@/models/Session';
import GpxUploadPanel from '@/components/sessions/GpxUploadPanel';

// Helper to get sessions
async function getSessions() {
    await dbConnect();
    const user = await getUserFromRequest();
    if (!user) return [];

    const sessions = await SessionModel.find({ userId: user._id })
        .sort({ startTime: -1 })
        .lean();

    return sessions.map((s: any) => ({
        id: s._id.toString(),
        ...s
    }));
}

export default async function SessionsPage() {
    const sessions = await getSessions();

    return (
        <div className="space-y-6">
            {/* Sessions Card */}
            {/* ... (rest of sessions card stays same) ... */}
            <div className="bg-white dark:bg-[#212529] shadow-sm rounded-sm border-t-4 border-[#17a2b8]">
                {/* ... (sessions table and content) ... */}
                <div className="bg-[#17a2b8] px-4 py-3 flex justify-between items-center">
                    <h2 className="text-white text-base font-normal m-0" style={{ fontFamily: 'sans-serif' }}>All my sessions</h2>
                    <div className="flex items-center gap-2">
                        <button className="text-white hover:text-white/80"><Download size={16} /></button>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                    {/* ... (existing table and pagination content) ... */}
                </div>
            </div>

            {/* Upload Panel */}
            <GpxUploadPanel />
        </div>
    );
}
