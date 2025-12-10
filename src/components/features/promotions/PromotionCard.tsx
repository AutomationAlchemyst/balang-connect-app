'use client';

import Image from 'next/image';
import type { Promotion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Info, Ticket, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PromotionCardProps {
  promotion: Promotion;
}

export default function PromotionCard({ promotion }: PromotionCardProps) {
  const { toast } = useToast();

  const handleEnterDraw = () => {
    toast({
      title: "You're in the Draw!",
      description: `Successfully entered the "${promotion.title}" lucky draw. Good luck!`,
    });
  };

  return (
    <Card className="glass-panel-wet border-none overflow-hidden h-full flex flex-col group hover:scale-[1.01] transition-transform duration-300">
      <div className="relative w-full h-64 overflow-hidden">
        <Image
          src={promotion.imageUrl}
          alt={promotion.title}
          width={600}
          height={400}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={promotion.dataAiHint || "gift celebration"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/80 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
        <div className="absolute bottom-6 left-6 right-6">
           <h3 className="font-display font-black text-2xl text-white uppercase leading-tight mb-2 shadow-sm">
             {promotion.title}
           </h3>
           {promotion.endDate && (
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               <CalendarDays size={14} className="text-brand-yellow" />
               Ends: {format(new Date(promotion.endDate), 'PPP')}
            </p>
           )}
        </div>
      </div>
      
      <CardContent className="flex-grow p-6 space-y-4">
        <p className="text-brand-blue/80 font-medium leading-relaxed">
           {promotion.description}
        </p>
        
        {promotion.terms && (
          <div className="bg-brand-blue/5 p-3 rounded-xl border border-brand-blue/10">
            <p className="text-xs text-brand-blue/60 flex items-start leading-tight">
              <Info size={12} className="mr-2 mt-0.5 text-brand-cyan shrink-0" />
              <span className="font-medium">{promotion.terms}</span>
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button 
          onClick={handleEnterDraw} 
          className="w-full btn-coast-primary h-12 shadow-md"
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