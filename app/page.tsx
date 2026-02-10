"use client";

import { History } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-50 glass-header px-4 h-16 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center border border-primary/20">
            <History className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-racing text-foreground tracking-widest italic">RACING FEED</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-highlight/10 border border-highlight/20 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-highlight rounded-full animate-pulse"></span>
            <span className="text-[10px] font-racing text-highlight tracking-wider">Cloud Connected</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-20 opacity-20">
        <History className="w-12 h-12 mb-4" />
        <p className="text-sm font-racing tracking-widest">FEED CLEARED</p>
      </div>
    </main>
  );
}
