import SectionTitle from '@/components/ui/SectionTitle';
import PackageCard from '@/components/features/packages/PackageCard';
import { mockPackages } from '@/lib/data';
import { PackageOpen } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Packages - BalangConnect',
  description: 'Browse our specially curated event packages for weddings, birthdays, corporate events, and more.',
};

export default function PackagesPage() {
  return (
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24">
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
           <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-2">
              <PackageOpen size={14} /> Curated Sets
           </div>
           <h1 className="text-coast-heading text-5xl md:text-7xl drop-shadow-sm text-brand-blue">
             Event <span className="text-brand-cyan">Packages</span>
           </h1>
           <p className="text-xl text-brand-blue/70 font-medium leading-relaxed">
             Choose from our thoughtfully designed packages. We cater to all types of events, ensuring a memorable experience.
           </p>
        </div>

        {/* Packages List */}
        <div className="flex flex-col gap-8 max-w-5xl mx-auto"> 
          {mockPackages.map((pkg) => (
            <PackageCard key={pkg.id} eventPackage={pkg} />
          ))}
        </div>
        
        <div className="text-center pt-12">
           <p className="text-brand-blue/40 text-sm font-medium">
             Need something custom? Use our <a href="/event-builder" className="text-brand-cyan font-bold underline hover:text-brand-blue transition-colors">Event Builder</a> to mix and match.
           </p>
        </div>

      </div>
    </div>
  );
}
