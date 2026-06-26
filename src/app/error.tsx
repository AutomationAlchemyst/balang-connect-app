'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw, Home, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured Global Crash:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#102022] selection:bg-[#0df2df]/20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 max-w-md text-center p-8 breezy-glass-static border-red-200/50 shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse" />
          <div className="relative bg-red-50 p-5 rounded-[2rem] border border-red-200 text-red-500 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase text-[#041F1C] tracking-tighter leading-none">
            Something went <span className="text-red-500 italic">wrong!</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-wider text-[#041F1C]/40">
            A rendering or data fetching error occurred.
          </p>
        </div>

        <p className="text-xs font-bold text-[#041F1C]/65 dark:text-white/60 leading-relaxed bg-white/40 dark:bg-black/10 p-4 rounded-xl border border-white/60 dark:border-white/5">
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <Button
            onClick={() => reset()}
            className="flex-1 bg-gradient-to-br from-red-500 to-red-600 hover:brightness-110 text-white font-black uppercase tracking-widest rounded-xl shadow-lg h-12 text-xs flex items-center justify-center gap-1.5 border-none"
          >
            <RefreshCcw size={14} className="animate-spin-slow" />
            Try Again
          </Button>

          <Button
            variant="outline"
            asChild
            className="flex-1 rounded-xl border-white/60 bg-white/40 hover:bg-white text-[#041F1C] font-black uppercase tracking-widest text-xs h-12"
          >
            <Link href="/">
              <Home size={14} className="mr-1.5" />
              Go Home
            </Link>
          </Button>
        </div>

        <p className="text-[9px] text-[#041F1C]/40 font-bold flex items-center justify-center gap-1">
          <HelpCircle size={10} />
          If this continues, please contact support.
        </p>
      </div>
    </div>
  );
}
