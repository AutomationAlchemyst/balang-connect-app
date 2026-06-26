'use client';

import type { Addon, Flavor } from '@/lib/types';
import NextImage from 'next/image';
import { MinusCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AddonSelectionStepProps {
  addons: Addon[];
  flavors: Flavor[];
  selectedAddons: Record<string, number>;
  addonFlavorSelections: Record<string, (string | undefined)[]>;
  setAddonFlavorSelections: React.Dispatch<React.SetStateAction<Record<string, (string | undefined)[]>>>;
  activeCategory: 'Drinks' | 'Equipment' | 'Services' | 'Live Stations';
  setActiveCategory: (category: 'Drinks' | 'Equipment' | 'Services' | 'Live Stations') => void;
  onAddonQuantityChange: (addonId: string, change: number) => void;
}

export default function AddonSelectionStep({
  addons,
  flavors,
  selectedAddons,
  addonFlavorSelections,
  setAddonFlavorSelections,
  activeCategory,
  setActiveCategory,
  onAddonQuantityChange,
}: AddonSelectionStepProps) {
  return (
    <section id="step-addons" className="px-4 mt-6 mb-12">
      <div className="flex flex-col mb-8 pt-5">
        <h3 className="text-[#0d1c1b] dark:text-white tracking-light text-2xl font-black leading-tight font-display uppercase italic">
          3. Amplification
        </h3>
        <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold mt-1">
          Add the finishing touches to your coastal event.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#0d1c1b]/5 dark:border-white/5 px-2 gap-8 mb-8 overflow-x-auto custom-scrollbar">
        {(['Drinks', 'Equipment', 'Services', 'Live Stations'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'flex flex-col items-center justify-center border-b-[3px] pb-4 pt-2 transition-all duration-300 min-w-max',
              activeCategory === category
                ? 'border-primary text-primary'
                : 'border-transparent text-[#0d1c1b]/60 dark:text-white/60 hover:text-primary/60'
            )}
          >
            <p className="text-sm font-black uppercase tracking-widest">{category}</p>
          </button>
        ))}
      </div>

      {/* Add-on Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {addons
          .filter((a) => a.category === activeCategory || (activeCategory === 'Equipment' && a.category === 'Food'))
          .map((addon) => {
            const qty = selectedAddons[addon.id] || 0;
            const isSelected = qty > 0;
            const isBalangAddon =
              addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l' || addon.id === 'addon_infused_water_23l';

            return (
              <div
                key={addon.id}
                className={cn(
                  'flex flex-col bg-white dark:bg-[#1a2e2d] rounded-3xl transition-all duration-500 border overflow-hidden',
                  isSelected ? 'border-primary bg-white shadow-xl shadow-primary/5' : 'border-[#0d1c1b]/5 dark:border-white/5 shadow-sm'
                )}
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-[#f4efeb] dark:bg-white/5 relative">
                    <NextImage
                      src={addon.imageUrl || 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=300'}
                      alt={addon.name}
                      fill
                      className="object-cover opacity-80"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between min-h-24">
                    <div>
                      <h4 className="font-black text-base leading-tight uppercase text-[#0d1c1b] dark:text-white">
                        {addon.name}
                      </h4>
                      <p className="text-[10px] font-bold text-[#0d1c1b]/60 dark:text-white/60 mt-1 uppercase tracking-tight">
                        {addon.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-primary text-xl">${addon.price.toFixed(2)}</span>
                      <div className="flex items-center gap-4 bg-[#fdfaf5] dark:bg-white/5 p-1 rounded-full border border-[#0d1c1b]/5 dark:border-white/10">
                        <button
                          onClick={() => onAddonQuantityChange(addon.id, -1)}
                          className="size-10 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:border-primary/30 disabled:text-primary/30"
                          disabled={qty === 0}
                        >
                          <MinusCircle className="h-5 w-5" />
                        </button>
                        <span className="text-base font-black w-6 text-center text-[#0d1c1b] dark:text-white">{qty}</span>
                        <button
                          onClick={() => onAddonQuantityChange(addon.id, 1)}
                          className="size-10 flex items-center justify-center rounded-full bg-primary text-[#0d1c1b] shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flavor Selection for add-ons */}
                {isSelected &&
                  isBalangAddon &&
                  Array.from({ length: qty }).map((_, idx) => (
                    <div key={idx} className="px-4 pb-4 animate-in slide-in-from-top-2">
                      <div className="bg-[#fdfaf5] dark:bg-black/20 p-4 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-4">
                        <Label className="uppercase text-[10px] font-black text-primary tracking-widest pl-1">
                          Balang #{idx + 1} Flavor
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-10 rounded-full bg-white dark:bg-white/5 border-primary/20 text-[#0d1c1b] dark:text-white font-black text-xs uppercase tracking-wide px-6 hover:bg-primary/10 hover:border-primary shadow-sm transition-all"
                            >
                              {addonFlavorSelections[addon.id]?.[idx] || 'Select Flavor'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[240px] p-2 bg-white/95 dark:bg-[#1a2e2d]/95 backdrop-blur-xl border-primary/20 rounded-2xl shadow-2xl">
                            <div className="grid grid-cols-1 gap-1">
                              {flavors.map((f) => (
                                <button
                                  key={f.id}
                                  onClick={() =>
                                    setAddonFlavorSelections((prev) => {
                                      const newSelections = { ...prev };
                                      const currentSelections = [...(prev[addon.id] || [])];
                                      currentSelections[idx] = f.name;
                                      newSelections[addon.id] = currentSelections;
                                      return newSelections;
                                    })
                                  }
                                  className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0d1c1b] dark:text-white hover:bg-primary hover:text-[#0d1c1b] transition-colors"
                                >
                                  {f.name}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })}
      </div>
    </section>
  );
}
