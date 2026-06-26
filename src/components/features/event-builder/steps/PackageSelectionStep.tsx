'use client';

import type { EventPackage } from '@/lib/types';
import NextImage from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageSelectionStepProps {
  packages: EventPackage[];
  selectedPackage: EventPackage | null;
  onSelectPackage: (pkg: EventPackage | null) => void;
  isDeliveryRequested: boolean;
  onDeliveryRequestedChange: (requested: boolean) => void;
}

const PACKAGE_IMAGES: Record<string, string> = {
  'pkg_wedding_corporate': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800',
  'pkg_opt1': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800',
  'pkg_charlies_angels': 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800',
  'pkg_opt2': 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800',
  'pkg_bongo_player': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800',
  'pkg_opt3': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800',
  'pkg_17l_self_pickup': 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=800'
};

export default function PackageSelectionStep({
  packages,
  selectedPackage,
  onSelectPackage,
  isDeliveryRequested,
  onDeliveryRequestedChange,
}: PackageSelectionStepProps) {
  return (
    <section className="px-4 mb-12">
      <div className="flex flex-col mb-8">
        <h3 className="text-[#0d1c1b] dark:text-white tracking-light text-3xl font-black leading-tight mb-2 font-display uppercase italic">
          1. Foundation
        </h3>
        <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold">Choose the base for your coastal event.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg: EventPackage) => {
          const isSelected = selectedPackage?.id === pkg.id;

          return (
            <div
              key={pkg.id}
              className={cn(
                'p-1 rounded-[2.5rem] transition-all duration-500 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]',
                isSelected
                  ? 'bg-gradient-to-br from-primary to-orange-200 shadow-2xl shadow-primary/20 scale-[1.02]'
                  : 'bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/40 shadow-sm'
              )}
              onClick={() => onSelectPackage(pkg)}
            >
              <div className="bg-white dark:bg-[#1a2e2d] flex flex-col items-stretch justify-start rounded-[2.25rem] overflow-hidden border border-white/50 relative">
                <div className="w-full h-48 relative overflow-hidden">
                  <NextImage
                    src={PACKAGE_IMAGES[pkg.id] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800'}
                    alt={pkg.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {pkg.isAllInclusive && (
                    <div className="absolute top-4 right-4 bg-primary text-[#0d1c1b] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl animate-pulse">
                      Featured Choice
                    </div>
                  )}
                  <div className="absolute bottom-4 left-6">
                    <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-1 drop-shadow-md">
                      {pkg.setupFee > 0 ? 'Full Service' : 'Self Service'}
                    </p>
                    <h4 className="text-white text-2xl font-black font-display uppercase leading-tight drop-shadow-lg">
                      {pkg.name}
                    </h4>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-end mb-6">
                    <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold italic max-w-[70%]">
                      "{pkg.description}"
                    </p>
                    <p className="text-3xl font-black text-[#0d1c1b] dark:text-primary font-display">${pkg.price}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-8 py-4 border-y border-[#0d1c1b]/5 dark:border-white/5">
                    {pkg.includedItems.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-primary" />
                        <p className="text-[#0d1c1b]/80 dark:text-white/80 text-xs font-bold uppercase tracking-tight line-clamp-1">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  {pkg.id === 'pkg_17l_self_pickup' && (
                    <div className="flex items-center space-x-3 mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-left-4">
                      <Checkbox
                        id="delivery-opt-in"
                        checked={isDeliveryRequested}
                        onCheckedChange={(checked) => onDeliveryRequestedChange(checked === true)}
                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-[#0d1c1b]"
                      />
                      <Label
                        htmlFor="delivery-opt-in"
                        className="text-sm font-black uppercase tracking-tight text-[#0d1c1b] dark:text-white cursor-pointer select-none"
                      >
                        Request Delivery <span className="text-primary ml-1">(+$20.00)</span>
                      </Label>
                    </div>
                  )}

                  <Button
                    className={cn(
                      'w-full h-14 rounded-2xl font-black uppercase text-base transition-all active:scale-95 tracking-widest border-none shadow-xl',
                      isSelected
                        ? 'bg-primary text-[#0d1c1b] hover:bg-primary/90 shadow-primary/30'
                        : 'bg-[#0d1c1b] text-white hover:bg-[#0d1c1b]/90 shadow-black/20'
                    )}
                  >
                    {isSelected ? 'Foundation Selected' : 'Choose Foundation'}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
