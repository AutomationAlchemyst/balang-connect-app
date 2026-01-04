import SectionTitle from '@/components/ui/SectionTitle';
import PackageCard from '@/components/features/packages/PackageCard';
import { mockPackages } from '@/lib/data';
import { PackageOpen, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Event Packages - BalangConnect',
  description: 'Browse our specially curated event packages for weddings, birthdays, corporate events, and more.',
};

export default function PackagesPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-20">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 space-y-24">

        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm transition-transform duration-700 hover:rotate-2">
            <PackageOpen size={14} className="text-teal-500" strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">Curated Experiences</span>
          </div>

          <h1 className="font-black text-5xl md:text-7xl lg:text-9xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Event <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">Tiers</span>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto border-t border-teal-100/50 pt-8">
            From intimate gatherings to massive corporate festivals. We have the perfect "Liquid Paradise" set for your occasion.
          </p>
        </div>

        {/* Packages List */}
        <div className="flex flex-col gap-12 lg:gap-20 max-w-6xl mx-auto">
          {mockPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className="animate-in fade-in slide-in-from-bottom-20 duration-1000 fill-mode-both"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <PackageCard eventPackage={pkg} isFeatured={index === 1} />
            </div>
          ))}
        </div>

        <div className="text-center py-12">
          <div className="glass-panel-static inline-block px-10 py-8 shadow-2xl bg-white/60">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="text-teal-500 w-6 h-6 animate-pulse" />
              <h3 className="font-black uppercase text-xl text-slate-800 tracking-tight">Need Customization?</h3>
            </div>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Use our <Link href="/event-builder" className="text-teal-600 font-black underline decoration-2 underline-offset-4 hover:text-teal-800 transition-all">Event Builder</Link> to mix and match flavors manually.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
