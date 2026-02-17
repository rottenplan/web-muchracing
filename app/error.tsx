'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Page Error:', error);
    }, [error]);

    return (
        <div className="p-4 bg-red-50 text-red-900 border border-red-200 m-4 rounded">
            <h2 className="font-bold">Something went wrong!</h2>
            <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded border border-red-100">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
            </pre>
            <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    );
}
