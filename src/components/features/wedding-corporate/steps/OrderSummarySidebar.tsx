'use client';

import type { EventPackage, Addon, Flavor } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

interface OrderSummarySidebarProps {
  selectedPackage: EventPackage | null;
  flavors: Flavor[];
  selectedPackageFlavors: string[];
  selectedAddons: Record<string, number>;
  addons: Addon[];
  displayDeliveryFee: number;
  totalPrice: number;
  canProceed: boolean;
  onProceedToBook: () => void;
}

export default function OrderSummarySidebar({
  selectedPackage,
  flavors,
  selectedPackageFlavors,
  selectedAddons,
  addons,
  displayDeliveryFee,
  totalPrice,
  canProceed,
  onProceedToBook,
}: OrderSummarySidebarProps) {
  const hasAddons = Object.keys(selectedAddons).length > 0;

  return (
    <div className="bg-white dark:bg-[#102221] border border-[#f2eee4] dark:border-white/10 rounded-[2rem] p-6 xl:p-8 shadow-xl shadow-black/5 animate-in slide-in-from-right-8 duration-700">
      <h3 className="text-lg font-black uppercase tracking-tight text-[#0d1a1b] dark:text-white mb-6 flex items-center gap-2">
        <div className="h-6 w-1 bg-brand-stitch-structured-primary rounded-full"></div>
        Order Summary
      </h3>

      <div className="space-y-6">
        {/* Package Summary */}
        {selectedPackage ? (
          <div className="flex justify-between items-start pb-4 border-b border-[#f2eee4] dark:border-white/5">
            <div>
              <p className="font-bold text-[#0d1a1b] dark:text-white">{selectedPackage.name}</p>
              <p className="text-xs text-[#0d1a1b]/50 dark:text-white/50">{selectedPackage.includedItems.length} items included</p>
              {selectedPackageFlavors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedPackageFlavors.map((fid) => {
                    const f = flavors.find((fl) => fl.id === fid);
                    return f ? (
                      <span
                        key={fid}
                        className="text-[9px] bg-[#f9f7f2] dark:bg-white/10 px-1.5 py-0.5 rounded text-[#0d1a1b]/60 dark:text-white/60 uppercase font-bold"
                      >
                        {f.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
            <span className="font-bold text-brand-stitch-structured-primary">${selectedPackage.price.toFixed(2)}</span>
          </div>
        ) : (
          <div className="p-4 border border-dashed border-[#f2eee4] dark:border-white/10 rounded-xl text-center">
            <p className="text-xs font-bold text-[#0d1a1b]/30 dark:text-white/30 uppercase tracking-widest">
              No Package Selected
            </p>
          </div>
        )}

        {/* Add-ons Summary */}
        {hasAddons && (
          <div className="space-y-2 pb-4 border-b border-[#f2eee4] dark:border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0d1a1b]/40 dark:text-white/40">Add-ons</p>
            {Object.entries(selectedAddons).map(([id, qty]) => {
              if (qty <= 0) return null;
              const addon = addons.find((a) => a.id === id);
              if (!addon) return null;
              return (
                <div key={id} className="flex justify-between text-sm">
                  <span className="text-[#0d1a1b]/80 dark:text-white/80">
                    {qty}x {addon.name}
                  </span>
                  <span className="font-medium text-[#0d1a1b]/80 dark:text-white/80">
                    ${(addon.price * qty).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Delivery Fee */}
        {displayDeliveryFee > 0 && (
          <div className="flex justify-between text-sm pb-4 border-b border-[#f2eee4] dark:border-white/5">
            <span className="text-[#0d1a1b]/60 dark:text-white/60">Delivery Fee</span>
            <span className="font-medium text-[#0d1a1b]/80 dark:text-white/80">${displayDeliveryFee.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-bold uppercase tracking-widest text-[#0d1a1b]/60 dark:text-white/60">Total Est.</span>
          <span className="text-3xl font-black text-brand-stitch-structured-primary px-4 py-2 bg-brand-stitch-structured-primary/5 rounded-lg border border-brand-stitch-structured-primary/10">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={onProceedToBook}
          disabled={!canProceed && !hasAddons}
          className="w-full bg-brand-stitch-structured-primary text-white h-14 rounded-xl font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-brand-stitch-structured-primary/30 disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] hover:brightness-110"
        >
          Continue to Payment
          <ArrowRight size={18} />
        </button>

        <p className="text-[10px] text-center text-[#0d1a1b]/40 dark:text-white/40 leading-relaxed max-w-xs mx-auto">
          By proceeding, you agree to our booking terms and cancellation policy.
        </p>
      </div>
    </div>
  );
}
