/// <reference types="vite/client" />

interface Window {
    api: {
        openFile: (options: any) => Promise<string | null>
        saveFile: (options: any) => Promise<string | null>
        readFile: (path: string) => Promise<string | null>
        exportStart: (options: any) => Promise<boolean>
        exportFrame: (frameData: string) => Promise<boolean>
        exportFinish: () => Promise<boolean>
    }
}
