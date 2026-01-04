import Image from 'next/image';
import type { EventPackage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, ArrowRight, Star, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PackageCardProps {
  eventPackage: EventPackage;
  isFeatured?: boolean;
}

export default function PackageCard({ eventPackage, isFeatured = false }: PackageCardProps) {
  return (
    <Card className={cn(
      "glass-panel-wet overflow-hidden flex flex-col lg:flex-row group backdrop-blur-2xl transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,40,80,0.1)] relative",
      isFeatured 
        ? "border-4 border-teal-400 bg-teal-50/20 shadow-[0_20px_60px_rgba(20,184,166,0.15)] scale-[1.02]" 
        : "border-white/20 bg-white/40 hover:bg-white/60"
    )}>
      
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-0 right-0 z-30">
          <div className="bg-gradient-to-l from-teal-500 to-emerald-500 text-white font-black uppercase text-[10px] tracking-[0.2em] py-2 pl-6 pr-4 rounded-bl-[2rem] shadow-lg flex items-center gap-2">
            <Crown size={14} fill="currentColor" /> Most Popular Choice
          </div>
        </div>
      )}

      {/* Image Side */}
      <div className="lg:w-[40%] relative min-h-[320px] lg:min-h-auto overflow-hidden">
        <Image
          src={eventPackage.imageUrl}
          alt={eventPackage.name}
          width={800}
          height={800}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          data-ai-hint={eventPackage.dataAiHint || "event celebration"}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 via-transparent to-transparent opacity-60"></div>

        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {eventPackage.isAllInclusive && (
            <div className="bg-brand-coral backdrop-blur-md text-white font-black px-4 py-2 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
              <Sparkles size={14} className="animate-pulse" /> Ultimate Tier
            </div>
          )}
          {eventPackage.pax && (
            <div className="bg-white/90 backdrop-blur-md text-teal-800 font-black px-4 py-2 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-teal-100">
              <Users size={14} /> {eventPackage.pax} Guests
            </div>
          )}
        </div>
      </div>

      {/* Content Side */}
      <div className="lg:w-[60%] p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative Liquid Element */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-brand-aqua/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-aqua/10 transition-colors duration-700"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div className="space-y-2">
              <span className={cn("font-display font-bold text-xs uppercase tracking-[0.4em]", isFeatured ? "text-teal-600" : "text-teal-500")}>
                {isFeatured ? "Our Recommendation" : "Premium Set"}
              </span>
              <h3 className="text-slate-900 text-4xl lg:text-5xl font-display font-black uppercase leading-[0.9] tracking-tighter">
                {eventPackage.name}
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-400 text-[10px] font-display font-black uppercase tracking-[0.2em]">Starting From</span>
              <span className="font-display font-black text-4xl text-teal-600 tracking-tighter">
                ${eventPackage.price.toFixed(0)}
              </span>
            </div>
          </div>

          <p className="text-teal-800/60 text-xl font-body font-medium mb-10 leading-relaxed border-l-4 border-teal-500/30 pl-6 italic">
            "{eventPackage.description}"
          </p>

          <div className={cn("backdrop-blur-sm rounded-[2rem] p-8 mb-10 border", isFeatured ? "bg-white/60 border-teal-100" : "bg-white/40 border-white/60")}>
            <div className="text-[10px] font-display font-black uppercase text-teal-900/40 tracking-[0.3em] mb-6 flex items-center gap-2">
              <div className="w-8 h-px bg-teal-900/10"></div>
              Curated Inclusion List
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {eventPackage.includedItems.map((item, index) => (
                <li key={index} className="flex items-center text-teal-900 font-body font-bold text-sm tracking-tight group/item">
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center mr-3 transition-all duration-300", isFeatured ? "bg-teal-500 text-white" : "bg-teal-100 text-teal-600 group-hover/item:bg-teal-500 group-hover/item:text-white")}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex flex-col sm:flex-row gap-4">
          <Button className={cn("h-16 px-10 rounded-[2rem] text-sm w-full sm:w-auto sm:flex-1", isFeatured ? "bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-900/20" : "btn-coast-primary")}>
            <Link href={`/event-builder?defaultPackageId=${eventPackage.id}`} className="flex items-center gap-3 w-full justify-center font-bold uppercase tracking-wider">
              {isFeatured ? "Select This Plan" : "Secure Date"} <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </Button>

          <Button variant="ghost" className="px-10 h-16 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-sm hover:bg-white hover:scale-105 transition-all duration-300 border border-transparent hover:border-slate-200 text-teal-700 w-full sm:w-auto">
            View Menu
          </Button>
        </div>
      </div>
    </Card>
  );
}
