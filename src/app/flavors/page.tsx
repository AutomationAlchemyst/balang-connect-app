'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockFlavors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Waves, Droplets, Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// THEME CONSTANTS
const PRIMARY_GRADIENT = "bg-gradient-to-r from-teal-600 to-emerald-500";
const TEXT_GRADIENT = "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600";
// REMOVED local constants in favor of globals.css classes: GLASS_PANEL, BUTTON_PRIMARY

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
        description: 'Choose at least one flavor to start your journey.',
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
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-20">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-60 animate-blob" />
        <div className="absolute top-[30%] right-[-20%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 space-y-20">

        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <Droplets size={14} className="text-teal-500" strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">Pure Hydration</span>
          </div>

          <h1 className="font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Iced <br />
            <span className={TEXT_GRADIENT}>Paradise</span>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Hand-crafted, cold-pressed, and ice-blended. Choose your flavors below to build your custom Balang experience.
          </p>
        </div>

        {/* Sticky Selection Bar */}
        <div className={cn(
          "sticky top-28 z-40 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
          canProceed ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}>
          <div className="bg-white/80 backdrop-blur-2xl p-3 pl-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 max-w-2xl mx-auto border border-white/50 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-teal-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-md">
                {selectedFlavorIds.length}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-teal-800 uppercase text-xs tracking-wider">Flavors Selected</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Ready to build</span>
              </div>
            </div>

            <Button onClick={handleProceedToEventBuilder} className={cn("h-12 px-8 text-sm w-full sm:w-auto btn-coast-primary")}>
              Build Event <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockFlavors.map((flavor, index) => {
            const isSelected = selectedFlavorIds.includes(flavor.id);

            return (
              <div
                key={flavor.id}
                onClick={() => handleToggleFlavorSelection(flavor.id)}
                className={cn(
                  "group relative glass-panel-wet overflow-hidden cursor-pointer",
                  isSelected ? "ring-4 ring-teal-400 shadow-2xl scale-[1.02]" : ""
                )}
              >
                <div className="aspect-[4/5] relative">
                  <Image
                    src={flavor.imageUrl}
                    alt={flavor.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-t transition-all duration-300",
                    isSelected ? "from-teal-900/90 via-teal-900/40 to-transparent" : "from-slate-900/60 to-transparent group-hover:from-teal-900/60"
                  )}></div>

                  {/* Selection Indicator */}
                  <div className={cn(
                    "absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                    isSelected ? "bg-teal-500 text-white scale-100" : "bg-white/30 backdrop-blur-md text-white scale-90 opacity-0 group-hover:opacity-100"
                  )}>
                    {isSelected ? <Check size={20} strokeWidth={4} /> : <Plus size={20} strokeWidth={4} />}
                  </div>

                  <div className="absolute bottom-0 left-0 p-8 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3 inline-block">
                      Premium Series
                    </span>
                    <h3 className="font-black text-3xl uppercase leading-none mb-2">{flavor.name}</h3>
                    <p className="text-white/80 text-sm font-medium line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      {flavor.description}
                    </p>
                    <div className={cn("h-1 w-12 rounded-full transition-all duration-500", isSelected ? "bg-teal-400 w-full" : "bg-white/50 group-hover:bg-teal-400")}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-10">
          <p className="text-slate-400 font-medium text-sm uppercase tracking-widest">
            More flavors coming soon
          </p>
        </div>

      </div>
    </div>
  );
}
