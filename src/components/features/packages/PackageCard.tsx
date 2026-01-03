import Image from 'next/image';
import type { EventPackage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, ArrowRight, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PackageCardProps {
  eventPackage: EventPackage;
}

export default function PackageCard({ eventPackage }: PackageCardProps) {
  return (
    <Card className="glass-panel-wet border-white/20 overflow-hidden flex flex-col lg:flex-row group bg-white/40 backdrop-blur-2xl transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,40,80,0.1)] hover:bg-white/60">

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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/40 via-transparent to-transparent opacity-60"></div>

        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {eventPackage.isAllInclusive && (
            <div className="bg-brand-coral backdrop-blur-md text-white font-black px-4 py-2 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
              <Sparkles size={14} className="animate-pulse" /> Ultimate Tier
            </div>
          )}
          {eventPackage.pax && (
            <div className="bg-white/90 backdrop-blur-md text-brand-teal font-black px-4 py-2 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-brand-teal/10">
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
              <span className="text-brand-aqua font-display font-black text-xs uppercase tracking-[0.4em]">Premium Set</span>
              <h3 className="text-brand-teal text-4xl lg:text-5xl font-display font-black uppercase leading-[0.9] tracking-tighter">
                {eventPackage.name}
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-brand-teal/30 text-[10px] font-black uppercase tracking-[0.2em]">Starting From</span>
              <span className="font-display font-black text-4xl text-brand-teal tracking-tighter">
                ${eventPackage.price.toFixed(0)}
              </span>
            </div>
          </div>

          <p className="text-brand-teal/60 text-xl font-medium mb-10 leading-relaxed border-l-4 border-brand-aqua/30 pl-6 italic">
            "{eventPackage.description}"
          </p>

          <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] p-8 mb-10 border border-white/60">
            <div className="text-[10px] font-black uppercase text-brand-teal/40 tracking-[0.3em] mb-6 flex items-center gap-2">
              <div className="w-8 h-px bg-brand-teal/10"></div>
              Curated Inclusion List
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {eventPackage.includedItems.map((item, index) => (
                <li key={index} className="flex items-center text-brand-teal font-bold text-sm tracking-tight group/item">
                  <div className="w-6 h-6 bg-brand-aqua/20 text-brand-aqua rounded-lg flex items-center justify-center mr-3 group-hover/item:bg-brand-aqua group-hover/item:text-white transition-all duration-300">
                    <Check size={14} strokeWidth={4} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 pt-4 flex flex-col md:flex-row gap-4">
          <button className="bg-brand-teal text-white px-10 h-16 rounded-[2rem] font-display font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-brand-aqua hover:scale-105 transition-all duration-300 shadow-2xl flex-grow md:flex-grow-0">
            <Link href={`/event-builder?defaultPackageId=${eventPackage.id}`} className="flex items-center gap-3">
              Secure Date <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </button>

          <button className="bg-white/60 backdrop-blur-md text-brand-teal px-10 h-16 rounded-[2rem] font-display font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl border border-white/80">
            View Menu
          </button>
        </div>
      </div>
    </Card>
  );
}
