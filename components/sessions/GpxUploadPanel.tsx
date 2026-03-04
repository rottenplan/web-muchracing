'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GpxUploadPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
            setUploadStatus(null);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadStatus(null);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload/gpx', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            if (failCount === 0) {
                setUploadStatus({ type: 'success', message: `Successfully uploaded ${successCount} session(s).` });
                setSelectedFiles([]);
                router.refresh(); // Refresh specific server component data
            } else {
                setUploadStatus({
                    type: 'error',
                    message: `Upload complete. ${successCount} success, ${failCount} failed.`
                });
            }
        } catch (error) {
            setUploadStatus({ type: 'error', message: 'An error occurred during upload.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#212529] shadow-sm rounded-sm border border-gray-200 dark:border-white/5 overflow-hidden">
            {/* Header - Light Blue (FoxLap Style) */}
            <div
                className="bg-[#5bc0de] px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-[#46b8da] transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-white text-base font-normal m-0 flex items-center gap-2" style={{ fontFamily: 'sans-serif' }}>
                    Upload GPX sessions
                </h3>
                {isOpen ? <ChevronUp className="text-white" size={18} /> : <ChevronDown className="text-white" size={18} />}
            </div>

            {/* Body */}
            {isOpen && (
                <div className="p-4 space-y-4 border-t border-gray-100 dark:border-white/5">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px]">
                                Select GPX Files
                            </label>
                            <div className="flex-1 flex items-center gap-2">
                                <label className="cursor-pointer bg-white dark:bg-[#1a1e21] border border-gray-300 dark:border-white/10 px-3 py-1.5 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2">
                                    <Upload size={14} />
                                    Choose Files
                                    <input
                                        type="file"
                                        multiple
                                        accept=".gpx"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                    />
                                </label>
                                <span className="text-xs text-gray-500 italic">
                                    {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'No file chosen'}
                                </span>
                            </div>
                        </div>

                        {/* File Preview List */}
                        {selectedFiles.length > 0 && (
                            <div className="bg-gray-50 dark:bg-[#1a1e21] rounded p-3 space-y-2 border border-gray-200 dark:border-white/5">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 py-1 border-b border-gray-100 dark:border-white/5 last:border-0">
                                        <div className="flex items-center gap-2 truncate">
                                            <FileText size={14} className="text-gray-400" />
                                            <span className="truncate">{file.name}</span>
                                            <span className="text-[10px] opacity-60">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => removeFile(idx)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            disabled={isUploading}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Status Messages */}
                        {uploadStatus && (
                            <div className={`p-3 rounded text-sm flex items-center gap-3 ${uploadStatus.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {uploadStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                <span>{uploadStatus.message}</span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || isUploading}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors
                                    ${selectedFiles.length === 0 || isUploading
                                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#5cb85c] hover:bg-[#4cae4c] text-white'
                                    }
                                `}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Upload Sessions
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
