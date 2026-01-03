import SectionTitle from '@/components/ui/SectionTitle';
import PackageCard from '@/components/features/packages/PackageCard';
import { mockPackages } from '@/lib/data';
import { PackageOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Packages - BalangConnect',
  description: 'Browse our specially curated event packages for weddings, birthdays, corporate events, and more.',
};

import { WavyBackground } from '@/components/ui/wavy-background';

export default function PackagesPage() {
  return (
    <div className="relative min-h-screen">
      <WavyBackground
        className="fixed inset-0 z-0"
        colors={["#004F59", "#00E0C6", "#FF6F61", "#F4EBD0", "#FFB347"]}
        waveWidth={60}
        speed="slow"
      />

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-32 space-y-24">

        {/* Header Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-brand-teal text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl -rotate-1">
            <PackageOpen size={16} className="text-brand-aqua" strokeWidth={4} />
            Curated Experiences
          </div>

          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter text-brand-teal drop-shadow-2xl">
            Event<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua to-brand-cyan">Tiers</span>
          </h1>

          <p className="text-xl md:text-2xl text-brand-teal/60 font-bold leading-relaxed max-w-2xl mx-auto border-t border-brand-teal/10 pt-8 uppercase tracking-widest">
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
              <PackageCard eventPackage={pkg} />
            </div>
          ))}
        </div>

        <div className="text-center py-12">
          <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 px-10 py-6 rounded-[2rem] shadow-2xl">
            <p className="text-white/60 text-lg font-bold">
              Need something custom? Use our <a href="/event-builder" className="text-brand-aqua font-black underline hover:text-white transition-all">Event Builder</a> to mix and match.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
