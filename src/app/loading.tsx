'use client';

import { Loader2, Waves, Sparkles } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#102022] selection:bg-[#0df2df]/20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 max-w-md text-center p-8 breezy-glass-static shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-[#0df2df]/20 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-[#0df2df]/10 p-5 rounded-[2rem] border border-[#0df2df]/30 text-[#09a093] flex items-center justify-center">
            <Waves className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-[#041F1C] dark:text-white tracking-tighter leading-none flex items-center justify-center gap-1.5">
            Balang<span className="breezy-text-gradient italic">Kepalang</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#041F1C]/40 dark:text-white/40 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-[#0df2df] animate-spin" />
            Pouring Refreshment...
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#09a093]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading page content...</span>
        </div>
      </div>
    </div>
  );
}
