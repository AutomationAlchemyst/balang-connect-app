'use client';

import type { Flavor } from '@/lib/types';
import NextImage from 'next/image';
import { Plus, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlavorSelectionStepProps {
  flavors: Flavor[];
  selectedPackageFlavors: string[];
  requiredFlavorCount: number;
  onAddFlavor: (flavorId: string) => void;
  onRemoveFlavorIndex: (index: number) => void;
}

export default function FlavorSelectionStep({
  flavors,
  selectedPackageFlavors,
  requiredFlavorCount,
  onAddFlavor,
  onRemoveFlavorIndex,
}: FlavorSelectionStepProps) {
  return (
    <section id="step-flavors" className="px-4 mt-12 mb-12">
      <div className="flex items-baseline justify-between pt-5 pb-2">
        <h3 className="text-[#0d1c1b] dark:text-white tracking-light text-2xl font-black leading-tight font-display uppercase italic">
          2. Curation
        </h3>
        <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
          {selectedPackageFlavors.length}/{requiredFlavorCount} Selected
        </span>
      </div>
      <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold mb-8">
        Pick signature Balang flavors for your guests.
      </p>

      {/* Selected Slots Visualizer */}
      <div className="flex flex-wrap gap-3 mb-10 justify-center animate-in fade-in slide-in-from-top-4 duration-700">
        {Array.from({ length: requiredFlavorCount }).map((_, idx) => {
          const selectedFlavorId = selectedPackageFlavors[idx];
          const flavor = selectedFlavorId ? flavors.find((f) => f.id === selectedFlavorId) : null;
          return (
            <div
              key={idx}
              className={cn(
                'group relative w-24 h-24 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all duration-500',
                flavor
                  ? 'border-primary bg-white dark:bg-[#1a2e2d] shadow-lg shadow-primary/10 border-solid'
                  : 'border-[#0d1c1b]/10 dark:border-white/10 bg-black/5 dark:bg-white/5'
              )}
            >
              {flavor ? (
                <>
                  <div className="relative w-10 h-10 mb-1">
                    <NextImage
                      src={flavor.imageUrl || 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=100'}
                      alt={flavor.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <span className="text-[8px] font-black uppercase leading-[1.1] text-[#0d1c1b] dark:text-white line-clamp-2 px-1">
                    {flavor.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFlavorIndex(idx);
                    }}
                    className="absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg active:scale-90"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="size-6 rounded-full border-2 border-[#0d1c1b]/5 dark:border-white/5 flex items-center justify-center">
                    <Plus size={10} className="text-[#0d1c1b]/20 dark:text-white/20" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-[#0d1c1b]/20 dark:text-white/20 tracking-tighter">
                    Slot {idx + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Grid of Available Flavors */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {flavors.map((flavor) => {
          const count = selectedPackageFlavors.filter((id) => id === flavor.id).length;
          const isSelected = count > 0;
          const canAdd = selectedPackageFlavors.length < requiredFlavorCount;

          return (
            <div key={flavor.id} className="group relative">
              <div
                className={cn(
                  'aspect-square rounded-[2rem] bg-white dark:bg-[#1a2e2d] border-2 transition-all duration-500 p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden',
                  isSelected
                    ? 'border-primary shadow-xl shadow-primary/10'
                    : 'border-transparent dark:border-white/5 hover:border-primary/30'
                )}
              >
                {/* Count Badge */}
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-primary text-[#0d1c1b] size-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg animate-in zoom-in duration-300">
                    {count}
                  </div>
                )}

                {/* Flavor Image */}
                <div className="relative w-20 h-20 mb-4 transition-transform duration-500 group-hover:scale-110">
                  <NextImage
                    src={flavor.imageUrl || 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=200'}
                    alt={flavor.name}
                    fill
                    className="object-cover rounded-2xl shadow-md"
                  />
                </div>

                <div className="mb-4">
                  <p className="text-[#0d1c1b] dark:text-white font-black text-sm uppercase leading-tight tracking-tight">
                    {flavor.name}
                  </p>
                  <p className="text-[#0d1c1b]/50 dark:text-white/50 text-[10px] font-bold mt-1 uppercase">
                    Premium Choice
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const lastIdx = selectedPackageFlavors.lastIndexOf(flavor.id);
                      if (lastIdx !== -1) onRemoveFlavorIndex(lastIdx);
                    }}
                    disabled={!isSelected}
                    className={cn(
                      'size-10 rounded-full flex items-center justify-center border-2 transition-all',
                      isSelected
                        ? 'border-primary text-primary hover:bg-primary hover:text-[#0d1c1b]'
                        : 'border-[#0d1c1b]/5 dark:border-white/5 text-[#0d1c1b]/20 dark:text-white/20 cursor-not-allowed'
                    )}
                  >
                    <Minus size={18} strokeWidth={3} />
                  </button>

                  <button
                    onClick={() => onAddFlavor(flavor.id)}
                    disabled={!canAdd}
                    className={cn(
                      'size-10 rounded-full flex items-center justify-center bg-primary text-[#0d1c1b] shadow-lg transition-all active:scale-90',
                      !canAdd && 'opacity-30 cursor-not-allowed grayscale'
                    )}
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
