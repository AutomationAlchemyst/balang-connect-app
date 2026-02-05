'use client';

import Image from 'next/image';
import type { Promotion } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, Ticket, Info, Zap, ChevronRight, Truck, GlassWater, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CountdownTimer } from '@/components/ui/countdown-timer';

interface PromotionCardProps {
  promotion: Promotion;
  variant?: 'featured' | 'exclusive' | 'flash';
}

export default function PromotionCard({ promotion, variant: forcedVariant }: PromotionCardProps) {
  const { toast } = useToast();

  // Heuristic for variant if not forced
  const variant = forcedVariant || (
    promotion.title.toLowerCase().includes('draw') ? 'featured' :
      promotion.title.toLowerCase().includes('discount') || promotion.title.toLowerCase().includes('wedding') ? 'exclusive' :
        'flash'
  );

  const handleAction = () => {
    toast({
      title: variant === 'featured' ? "You're in the Draw!" : "Offer Claimed!",
      description: `Successfully entered/claimed the "${promotion.title}". Good luck!`,
    });
  };

  if (variant === 'featured') {
    return (
      <div className="flex flex-col items-stretch justify-start rounded-2xl shadow-2xl bg-white dark:bg-[#2d2218] border border-orange-500/20 overflow-hidden group transition-all duration-500 hover:shadow-orange-500/10 hover:border-orange-500/40">
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            src={promotion.imageUrl}
            alt={promotion.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
            <Star size={14} className="text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Grand Prize</span>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch justify-center gap-4 p-6">
          <div className="space-y-1">
            <p className="text-orange-600 text-[10px] font-black leading-normal tracking-[0.2em] uppercase">Lucky Draw Entry</p>
            <h3 className="text-slate-900 dark:text-white text-2xl font-black leading-tight tracking-tighter uppercase">{promotion.title}</h3>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
            {promotion.description}
          </p>

          {promotion.endDate && (
            <div className="pt-2">
              <CountdownTimer targetDate={promotion.endDate} variant="featured" />
            </div>
          )}

          <Button
            onClick={handleAction}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex gap-2 border-none mt-2"
          >
            <Ticket size={20} strokeWidth={3} />
            <span>Enter Lucky Draw</span>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'exclusive') {
    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative bg-white dark:bg-[#2d2218] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 border border-amber-200/50 shadow-xl overflow-hidden">
          <div className="absolute -right-4 -top-4 size-24 bg-orange-500/10 rounded-full blur-2xl"></div>

          <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden shrink-0 border-2 border-amber-400">
            <Image
              src={promotion.imageUrl}
              alt={promotion.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 space-y-1.5 text-center sm:text-left w-full">
            <div className="flex items-center gap-1.5">
              <Crown size={12} className="text-amber-500 fill-amber-500" />
              <p className="text-amber-600 text-[9px] font-black uppercase tracking-[0.2em]">Premium Offer</p>
            </div>
            <h3 className="text-lg font-black leading-tight tracking-tight uppercase text-slate-900 dark:text-white">{promotion.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">{promotion.description}</p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-teal-600 font-black text-lg tracking-tighter">20% OFF</span>
              <Button
                onClick={handleAction}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] h-8 px-4 font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange-500/20 active:scale-95 transition-all border-none"
              >
                Claim
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Flash variant
  const isDelivery = promotion.title.toLowerCase().includes('delivery');

  return (
    <div className="bg-white dark:bg-[#2d2218] rounded-2xl p-5 flex items-center gap-4 shadow-xl border border-slate-100 dark:border-white/5 group transition-all duration-300 hover:translate-x-1">
      <div className={cn(
        "size-12 rounded-full flex items-center justify-center shrink-0",
        isDelivery ? "bg-teal-500/10 text-teal-600" : "bg-orange-500/10 text-orange-600"
      )}>
        {isDelivery ? <Truck size={20} /> : <GlassWater size={20} />}
      </div>

      <div className="flex-1 space-y-0.5">
        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{promotion.title}</h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{promotion.description}</p>
      </div>

      <Button
        onClick={handleAction}
        variant="ghost"
        size="icon"
        className="text-orange-500 hover:bg-orange-500/10 rounded-full h-10 w-10 shrink-0"
      >
        <ChevronRight size={24} strokeWidth={3} />
      </Button>
    </div>
  );
}