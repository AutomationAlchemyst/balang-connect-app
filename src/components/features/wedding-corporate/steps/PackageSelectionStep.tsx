'use client';

import type { EventPackage } from '@/lib/types';
import { ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PackageSelectionStepProps {
  packages: EventPackage[];
  selectedPackage: EventPackage | null;
  onSelectPackage: (pkg: EventPackage | null) => void;
  isDeliveryRequested: boolean;
  onDeliveryRequestedChange: (requested: boolean) => void;
}

export default function PackageSelectionStep({
  packages,
  selectedPackage,
  onSelectPackage,
  isDeliveryRequested,
  onDeliveryRequestedChange,
}: PackageSelectionStepProps) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="pb-6">
        <h2 className="text-[#0d1a1b] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-2 pt-2">
          Step 1: Select Package
        </h2>
        <p className="text-[#0d1a1b]/60 dark:text-white/60 text-sm font-medium leading-relaxed">
          Choose a curated experience or build your own bespoke event.
        </p>
      </div>

      {/* Dropdown UI for Package Selection */}
      <div className="flex flex-col gap-4 py-3">
        <label className="flex flex-col w-full">
          <p className="text-[#0d1a1b] dark:text-white text-base font-semibold leading-normal pb-2">
            Pre-defined Packages
          </p>
          <div className="relative group">
            <select
              className="w-full rounded-xl text-[#0d1a1b] dark:text-white border border-[#f2eee4] dark:border-white/10 bg-white dark:bg-[#0d1a1b]/40 h-14 px-4 text-base font-normal focus:ring-2 focus:ring-brand-stitch-structured-primary focus:border-brand-stitch-structured-primary transition-all shadow-sm appearance-none"
              onChange={(e) => {
                const pkg = packages.find((p) => p.id === e.target.value);
                onSelectPackage(pkg || null);
              }}
              value={selectedPackage?.id || ''}
            >
              <option value="" disabled>
                Select from premium options
              </option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id} className="text-[#0d1a1b] dark:text-white bg-white dark:bg-[#102022]">
                  {pkg.name} (${pkg.price})
                </option>
              ))}
            </select>
            {/* Custom Arrow Icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#0d1a1b]/50 dark:text-white/50">
              <ChevronRight className="rotate-90" size={20} />
            </div>
          </div>
        </label>
      </div>

      {/* Selected Package Details (If any) */}
      {selectedPackage && (
        <div className="mt-2 mb-6 bg-white dark:bg-[#102221] border border-brand-stitch-structured-primary/20 rounded-xl p-5 shadow-lg shadow-brand-stitch-structured-primary/5 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-lg text-[#0d1a1b] dark:text-white">{selectedPackage.name}</h4>
            <span className="font-bold text-brand-stitch-structured-primary">${selectedPackage.price}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedPackage.includedItems.slice(0, 3).map((item, i) => (
              <span
                key={i}
                className="text-[10px] font-bold uppercase tracking-wider bg-[#0d1a1b]/5 dark:bg-white/10 px-2 py-1 rounded text-[#0d1a1b]/60 dark:text-white/60"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#0d1a1b]/50 dark:text-white/50 italic">{selectedPackage.description}</p>

          {/* Delivery Opt-in for Self-Pickup 17L Package */}
          {selectedPackage.id === 'pkg_17l_self_pickup' && (
            <div className="mt-4 pt-4 border-t border-[#f2eee4] dark:border-white/5">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="delivery-opt-in"
                  checked={isDeliveryRequested}
                  onCheckedChange={(checked) => onDeliveryRequestedChange(!!checked)}
                  className="border-2 border-brand-stitch-structured-primary data-[state=checked]:bg-brand-stitch-structured-primary data-[state=checked]:text-black"
                />
                <Label
                  htmlFor="delivery-opt-in"
                  className="text-xs font-bold uppercase tracking-widest text-[#0d1a1b]/60 dark:text-white/60 cursor-pointer"
                >
                  Add Delivery & Support (+$20)
                </Label>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
