'use client';

import Image from 'next/image';
import type { Promotion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Info, Ticket, Sparkles, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface PromotionCardProps {
  promotion: Promotion;
  isFeatured?: boolean;
}

export default function PromotionCard({ promotion, isFeatured = false }: PromotionCardProps) {
  const { toast } = useToast();

  const handleEnterDraw = () => {
    toast({
      title: "You're in the Draw!",
      description: `Successfully entered the "${promotion.title}" lucky draw. Good luck!`,
    });
  };

  return (
    <Card className={cn(
      "glass-panel-wet overflow-hidden h-full flex flex-col group transition-all duration-300",
      isFeatured 
        ? "border-4 border-teal-400/50 shadow-[0_20px_50px_rgba(20,184,166,0.15)] scale-[1.02] bg-teal-50/30" 
        : "border-none hover:scale-[1.01]"
    )}>
      
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-0 right-0 z-30">
          <div className="bg-gradient-to-bl from-teal-500 to-emerald-500 text-white font-black uppercase text-[10px] tracking-[0.2em] py-2 pl-6 pr-4 rounded-bl-[2rem] shadow-lg flex items-center gap-2">
            <Crown size={14} fill="currentColor" /> Featured Offer
          </div>
        </div>
      )}

      <div className="relative w-full h-64 overflow-hidden">
        <Image
          src={promotion.imageUrl}
          alt={promotion.title}
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={promotion.dataAiHint || "gift celebration"}
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t opacity-80 group-hover:opacity-60 transition-opacity", isFeatured ? "from-teal-900/90 to-transparent" : "from-slate-900/80 to-transparent")}></div>
        <div className="absolute bottom-6 left-6 right-6">
           <h3 className="font-display font-black text-2xl text-white uppercase leading-tight mb-2 shadow-sm">
             {promotion.title}
           </h3>
           {promotion.endDate && (
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <CalendarDays size={14} className="text-teal-300" />
               Ends: {format(new Date(promotion.endDate), 'PPP')}
            </p>
           )}
        </div>
      </div>
      
      <CardContent className="flex-grow p-6 space-y-4">
        <p className="text-slate-600 font-medium leading-relaxed">
           {promotion.description}
        </p>
        
        {promotion.terms && (
          <div className={cn("p-3 rounded-xl border", isFeatured ? "bg-teal-50 border-teal-100" : "bg-slate-50 border-slate-100")}>
            <p className="text-xs text-slate-500 flex items-start leading-tight">
              <Info size={12} className="mr-2 mt-0.5 text-teal-500 shrink-0" />
              <span className="font-medium">{promotion.terms}</span>
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button 
          onClick={handleEnterDraw} 
          className={cn("w-full h-12 shadow-md uppercase font-bold tracking-wider", isFeatured ? "bg-teal-600 hover:bg-teal-700 text-white" : "btn-coast-primary")}
        >
          {promotion.title.toLowerCase().includes('draw') ? (
             <><Ticket className="mr-2 h-5 w-5" /> Enter Lucky Draw</>
          ) : (
             <><Sparkles className="mr-2 h-5 w-5" /> Claim Offer</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}