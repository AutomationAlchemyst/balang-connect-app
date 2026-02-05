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
      "overflow-hidden flex flex-col lg:flex-row group backdrop-blur-2xl transition-all duration-700 hover:shadow-[0_40px_100px_rgba(13,242,223,0.15)] relative rounded-[2.5rem] border hover:-translate-y-2 hover:rotate-1",
      isFeatured
        ? "border-[#0df2df] bg-[#0df2df]/5 shadow-[0_0_60px_-15px_rgba(13,242,223,0.3)] scale-[1.02] ring-1 ring-[#0df2df]/20"
        : "border-white/40 bg-white/40 hover:bg-white/60 hover:border-white/60"
    )}>

      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-0 right-0 z-30">
          <div className="bg-gradient-to-l from-[#0df2df] to-[#09a093] text-[#041F1C] font-black uppercase text-[10px] tracking-[0.2em] py-2 pl-6 pr-4 rounded-bl-[2rem] shadow-lg flex items-center gap-2">
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#041F1C]/60 via-transparent to-transparent opacity-80"></div>

        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {eventPackage.isAllInclusive && (
            <div className="bg-[#0df2df] backdrop-blur-md text-[#041F1C] font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
              <Sparkles size={14} className="animate-pulse" /> Ultimate Tier
            </div>
          )}
          {eventPackage.pax && (
            <div className="bg-white/90 backdrop-blur-md text-[#041F1C] font-black px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center gap-2 border border-white/50">
              <Users size={14} /> {eventPackage.pax} Guests
            </div>
          )}
        </div>
      </div>

      {/* Content Side */}
      <div className="lg:w-[60%] p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative Liquid Element */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#0df2df]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#0df2df]/10 transition-colors duration-700"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div className="space-y-2">
              <span className={cn("font-plus-jakarta font-bold text-xs uppercase tracking-[0.4em]", isFeatured ? "text-[#0df2df]" : "text-[#041F1C]/60")}>
                {isFeatured ? "Our Recommendation" : "Premium Set"}
              </span>
              <h3 className="text-[#041F1C] text-4xl lg:text-5xl font-plus-jakarta font-black uppercase leading-[0.9] tracking-tighter">
                {eventPackage.name}
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[#041F1C]/40 text-[10px] font-plus-jakarta font-black uppercase tracking-[0.2em]">Starting From</span>
              <span className="font-plus-jakarta font-black text-4xl text-[#09a093] tracking-tighter">
                ${eventPackage.price.toFixed(0)}
              </span>
              {eventPackage.setupFee > 0 && eventPackage.isAllInclusive && (
                <span className="text-[10px] font-black text-[#041F1C]/40 uppercase tracking-tighter mt-1">
                  (${eventPackage.setupFee.toFixed(0)} Set + $45 Delivery)
                </span>
              )}
            </div>
          </div>

          <p className="text-[#041F1C]/70 text-lg font-plus-jakarta font-medium mb-10 leading-relaxed border-l-4 border-[#0df2df]/40 pl-6 italic">
            "{eventPackage.description}"
          </p>

          <div className={cn("backdrop-blur-md rounded-[2rem] p-8 mb-10 border", isFeatured ? "bg-white/60 border-[#0df2df]/20" : "bg-white/40 border-white/60")}>
            <div className="text-[10px] font-plus-jakarta font-black uppercase text-[#041F1C]/40 tracking-[0.3em] mb-6 flex items-center gap-2">
              <div className="w-8 h-px bg-[#041F1C]/10"></div>
              Curated Inclusion List
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {eventPackage.includedItems.map((item, index) => (
                <li key={index} className="flex items-center text-[#041F1C] font-plus-jakarta font-bold text-sm tracking-tight group/item">
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center mr-3 transition-all duration-300", isFeatured ? "bg-[#0df2df] text-[#041F1C]" : "bg-[#041F1C]/5 text-[#041F1C]/60 group-hover/item:bg-[#0df2df] group-hover/item:text-[#041F1C]")}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex flex-col sm:flex-row gap-4">
          <Button className={cn("h-16 px-10 rounded-[2rem] text-sm w-full sm:w-auto sm:flex-1 transition-all duration-300", isFeatured ? "bg-[#041F1C] hover:bg-[#062e2a] text-white shadow-xl shadow-[#041F1C]/20 hover:scale-105" : "bg-white hover:bg-slate-50 text-[#041F1C] border border-[#041F1C]/10 shadow-lg hover:shadow-xl")}>
            <Link href={`/event-builder?defaultPackageId=${eventPackage.id}`} className="flex items-center gap-3 w-full justify-center font-black uppercase tracking-wider">
              {isFeatured ? "Select This Plan" : "Secure Date"} <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </Button>

          <Button variant="ghost" className="px-10 h-16 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/50 hover:scale-105 transition-all duration-300 border border-transparent hover:border-white text-[#041F1C]/60 w-full sm:w-auto">
            View Menu
          </Button>
        </div>
      </div>
    </Card>
  );
}
