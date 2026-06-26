'use client';

import type { Flavor } from '@/lib/types';
import { Plus, Minus } from 'lucide-react';
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
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-baseline pb-4 pt-4 border-t border-[#f2eee4] dark:border-white/5">
        <h2 className="text-[#0d1a1b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
          Step 2: Curation
        </h2>
        <span className="text-brand-stitch-structured-primary text-xs font-bold uppercase tracking-widest bg-brand-stitch-structured-primary/10 px-2 py-1 rounded">
          {selectedPackageFlavors.length}/{requiredFlavorCount}
        </span>
      </div>
      <p className="text-[#0d1a1b]/60 dark:text-white/60 text-sm font-medium leading-relaxed mb-6">
        Select your premium Balang flavors.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {flavors.map((flavor) => {
          const qty = selectedPackageFlavors.filter((id) => id === flavor.id).length;
          const isSelected = qty > 0;
          const isLimitReached = selectedPackageFlavors.length >= requiredFlavorCount;

          return (
            <div
              key={flavor.id}
              className={cn(
                'group flex items-center justify-between p-3 bg-white dark:bg-[#0d1a1b]/40 rounded-xl border transition-all duration-300 shadow-sm',
                isSelected
                  ? 'border-brand-stitch-structured-primary ring-1 ring-brand-stitch-structured-primary shadow-brand-stitch-structured-primary/20'
                  : 'border-[#f2eee4] dark:border-white/5 hover:border-brand-stitch-structured-primary/50'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-lg bg-cover bg-center shrink-0 border border-[#0d1a1b]/5"
                  style={{ backgroundImage: `url('${flavor.imageUrl}')` }}
                ></div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[#0d1a1b] dark:text-white font-bold text-sm line-clamp-1">
                    {flavor.name}
                  </span>
                  <span className="text-[#0d1a1b]/50 dark:text-white/40 text-[9px] uppercase font-bold tracking-wider">
                    Premium Mix
                  </span>
                </div>
              </div>

              {qty === 0 ? (
                <button
                  onClick={() => {
                    if (!isLimitReached) onAddFlavor(flavor.id);
                  }}
                  disabled={isLimitReached}
                  className={cn(
                    'size-8 rounded-full flex items-center justify-center transition-all',
                    isLimitReached
                      ? 'bg-transparent border border-[#0d1a1b]/10 text-[#0d1a1b]/20 cursor-not-allowed'
                      : 'bg-brand-stitch-structured-primary/10 text-brand-stitch-structured-primary hover:bg-brand-stitch-structured-primary hover:text-white'
                  )}
                >
                  <Plus size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-[#f9f7f2] dark:bg-white/5 p-1 rounded-full border border-brand-stitch-structured-primary/20">
                  <button
                    onClick={() => onRemoveFlavorIndex(selectedPackageFlavors.indexOf(flavor.id))}
                    className="size-6 rounded-full bg-white dark:bg-[#102221] text-[#0d1a1b] dark:text-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-xs w-3 text-center">{qty}</span>
                  <button
                    onClick={() => {
                      if (!isLimitReached) onAddFlavor(flavor.id);
                    }}
                    disabled={isLimitReached}
                    className={cn(
                      'size-6 rounded-full flex items-center justify-center transition-colors shadow-md',
                      isLimitReached
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-stitch-structured-primary text-white hover:brightness-110'
                    )}
                  >
                    <Plus size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
