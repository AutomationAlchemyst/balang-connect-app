'use client';

import type { Addon, Flavor } from '@/lib/types';
import { Plus, Minus, ChevronRight } from 'lucide-react';

interface AddonSelectionStepProps {
  addons: Addon[];
  flavors: Flavor[];
  selectedAddons: Record<string, number>;
  addonFlavorSelections: Record<string, (string | undefined)[]>;
  onAddonToggle: (addonId: string, checked: boolean) => void;
  onAddonQuantityChange: (addonId: string, change: number) => void;
  onUpdateAddonFlavor: (addonId: string, index: number, flavorId: string) => void;
}

export default function AddonSelectionStep({
  addons,
  flavors,
  selectedAddons,
  addonFlavorSelections,
  onAddonToggle,
  onAddonQuantityChange,
  onUpdateAddonFlavor,
}: AddonSelectionStepProps) {
  return (
    <section className="pb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
      <h2 className="text-[#0d1a1b] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-2 pt-4 border-t border-[#f2eee4] dark:border-white/5 mt-6">
        Step 3: Add-ons
      </h2>
      <p className="text-[#0d1a1b]/60 dark:text-white/60 text-sm font-medium leading-relaxed mb-6">
        Enhance your event with our premium service extras.
      </p>

      <div className="flex flex-col gap-4">
        {addons.map((addon) => {
          const qty = selectedAddons[addon.id] || 0;
          return (
            <div
              key={addon.id}
              className="group flex flex-col p-4 bg-white dark:bg-[#0d1a1b]/30 rounded-xl border border-[#f2eee4] dark:border-white/5 hover:border-brand-stitch-structured-primary/50 transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col flex-1 pr-4">
                  <span className="text-[#0d1a1b] dark:text-white font-bold text-base">{addon.name}</span>
                  <span className="text-[#0d1a1b]/50 dark:text-white/40 text-xs line-clamp-1">{addon.description}</span>
                  <span className="text-brand-stitch-structured-primary font-bold text-sm mt-1">${addon.price}</span>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => onAddonToggle(addon.id, true)}
                    className="size-10 rounded-full bg-brand-stitch-structured-primary/10 text-brand-stitch-structured-primary flex items-center justify-center hover:bg-brand-stitch-structured-primary hover:text-white transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                ) : (
                  <div className="flex items-center gap-3 bg-[#f9f7f2] dark:bg-white/5 p-1 rounded-full border border-brand-stitch-structured-primary/20">
                    <button
                      onClick={() => onAddonQuantityChange(addon.id, -1)}
                      className="size-8 rounded-full bg-white dark:bg-[#102221] text-[#0d1a1b] dark:text-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm w-4 text-center">{qty}</span>
                    <button
                      onClick={() => onAddonQuantityChange(addon.id, 1)}
                      className="size-8 rounded-full bg-brand-stitch-structured-primary text-white flex items-center justify-center hover:brightness-110 transition-colors shadow-md"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Flavor Selection for Add-ons requiring it */}
              {qty > 0 && addon.requiresFlavor && (
                <div className="mt-4 pl-4 border-l-2 border-brand-stitch-structured-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0d1a1b]/40 dark:text-white/40 mb-2">
                    Select Flavors
                  </p>
                  {Array.from({ length: qty }).map((_, idx) => (
                    <div key={`${addon.id}-flavor-${idx}`} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-[#0d1a1b]/60 dark:text-white/60 w-6">#{idx + 1}</span>
                      <div className="relative flex-1">
                        <select
                          className="w-full h-10 rounded-lg text-sm bg-white dark:bg-white/5 border border-[#f2eee4] dark:border-white/10 px-3 appearance-none focus:ring-1 focus:ring-brand-stitch-structured-primary outline-none text-[#0d1a1b] dark:text-white"
                          value={addonFlavorSelections[addon.id]?.[idx] || ''}
                          onChange={(e) => onUpdateAddonFlavor(addon.id, idx, e.target.value)}
                        >
                          <option value="" disabled>
                            Choose a flavor...
                          </option>
                          {flavors.map((flavor) => (
                            <option key={flavor.id} value={flavor.id}>
                              {flavor.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#0d1a1b]/40 dark:text-white/40">
                          <ChevronRight className="rotate-90 size-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
