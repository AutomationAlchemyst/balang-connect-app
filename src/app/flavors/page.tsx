'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FlavorCard from '@/components/features/flavors/FlavorCard';
import { mockFlavors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Waves, Droplets } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { WavyBackground } from '@/components/ui/wavy-background';

export default function FlavorsPage() {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleFlavorSelection = (flavorId: string) => {
    setSelectedFlavorIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(flavorId)) {
        return prevSelectedIds.filter((id) => id !== flavorId);
      } else {
        return [...prevSelectedIds, flavorId];
      }
    });
  };

  const handleProceedToEventBuilder = () => {
    if (selectedFlavorIds.length === 0) {
      toast({
        title: 'Selection Required',
        description: 'Choose at least one flavor to start your paradise journey.',
        variant: 'destructive',
      });
      return;
    }
    const queryParams = new URLSearchParams();
    queryParams.append('defaultPackageId', 'pkg_opt1');
    queryParams.append('addFlavorIds', selectedFlavorIds.join(','));
    router.push(`/event-builder?${queryParams.toString()}`);
  };

  const canProceed = selectedFlavorIds.length > 0;

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
          <div className="inline-flex items-center gap-3 bg-brand-teal text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl rotate-1">
            <Droplets size={16} className="text-brand-aqua" strokeWidth={4} />
            Pure Hydration
          </div>

          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter text-brand-teal drop-shadow-2xl">
            Iced<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua to-brand-cyan">Paradise</span>
          </h1>

          <p className="text-xl md:text-2xl text-brand-teal/60 font-bold leading-relaxed max-w-2xl mx-auto border-t border-brand-teal/10 pt-8 uppercase tracking-widest">
            Hand-crafted, cold-pressed, and ice-blended to perfection. Choose your oceanic flavors below.
          </p>
        </div>

        {/* Sticky Selection Bar */}
        <div className={`sticky top-28 z-40 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform ${canProceed ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95 pointer-events-none'}`}>
          <div className="bg-white/40 backdrop-blur-2xl p-3 rounded-[3rem] flex flex-col sm:flex-row justify-between items-center gap-4 max-w-3xl mx-auto border border-white/60 shadow-[0_40px_80px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-4 px-6">
              <div className="bg-brand-teal text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg rotate-3 overflow-hidden relative">
                <div className="absolute inset-0 bg-brand-aqua/20 animate-pulse"></div>
                <span className="relative z-10">{selectedFlavorIds.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-brand-teal uppercase text-sm tracking-widest">Liquid Selection</span>
                <span className="text-brand-teal/50 text-xs font-bold uppercase tracking-tight">Ready for deployment</span>
              </div>
            </div>

            <button
              onClick={handleProceedToEventBuilder}
              className="bg-brand-teal text-white h-14 px-10 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3 hover:bg-brand-aqua hover:scale-105 transition-all duration-300 shadow-xl w-full sm:w-auto"
            >
              Build Event <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {mockFlavors.map((flavor, index) => (
            <div
              key={flavor.id}
              className="animate-in fade-in slide-in-from-bottom-12 duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FlavorCard
                flavor={flavor}
                isSelected={selectedFlavorIds.includes(flavor.id)}
                onToggleSelect={handleToggleFlavorSelection}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-20">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-16 rounded-[4rem] max-w-4xl mx-auto space-y-10 shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-black text-white uppercase leading-tight">
              Ready to make <br /> a <span className="text-brand-aqua">Splash?</span>
            </h2>
            <p className="text-white/60 text-xl font-medium max-w-xl mx-auto">
              Combine your favorite flavors and let us handle the chill. Perfect for any scale of event.
            </p>
            <button
              onClick={handleProceedToEventBuilder}
              className={cn(
                "h-20 px-16 text-xl rounded-[3rem] font-display font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl inline-flex items-center gap-4",
                canProceed
                  ? "bg-brand-coral text-white hover:scale-105 hover:bg-white hover:text-brand-coral"
                  : "bg-white/10 text-white/20 cursor-not-allowed border border-white/5"
              )}
              disabled={!canProceed}
            >
              {canProceed ? (
                <>
                  <ShoppingCart size={28} strokeWidth={3} />
                  Start Building
                </>
              ) : (
                "Select Flavors Above"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
