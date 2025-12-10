import Image from 'next/image';
import type { EventPackage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

interface PackageCardProps {
  eventPackage: EventPackage;
}

export default function PackageCard({ eventPackage }: PackageCardProps) {
  return (
    <Card className="glass-panel-wet border-none overflow-hidden flex flex-col md:flex-row group hover:bg-white/90 transition-all duration-500">
      
      {/* Image Side */}
      <div className="md:w-2/5 relative h-64 md:h-auto overflow-hidden">
        <Image
          src={eventPackage.imageUrl}
          alt={eventPackage.name}
          width={500}
          height={500}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={eventPackage.dataAiHint || "event celebration"}
        />
        <div className="absolute inset-0 bg-brand-blue/10 group-hover:bg-transparent transition-colors duration-500"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {eventPackage.isAllInclusive && (
             <div className="bg-white/90 backdrop-blur-md text-brand-blue font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg flex items-center gap-1">
               <Star size={12} className="text-brand-yellow fill-brand-yellow" /> All-Inclusive
             </div>
           )}
           {eventPackage.pax && (
             <div className="bg-black/50 backdrop-blur-md text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
               <Users size={12} /> {eventPackage.pax} Pax
             </div>
           )}
        </div>
      </div>

      {/* Content Side */}
      <div className="md:w-3/5 p-8 flex flex-col justify-between relative">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 rounded-bl-[4rem] pointer-events-none"></div>

        <div>
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-coast-heading text-3xl text-brand-blue uppercase leading-none max-w-sm">
               {eventPackage.name}
             </h3>
             <span className="font-display font-black text-3xl text-brand-cyan tracking-tight">
                ${eventPackage.price.toFixed(0)}
             </span>
          </div>
          
          <p className="text-brand-blue/70 text-lg font-medium mb-6 leading-relaxed">
            {eventPackage.description}
          </p>
          
          <div className="bg-brand-blue/5 rounded-2xl p-5 mb-6">
             <p className="text-xs font-bold uppercase text-brand-blue/40 tracking-widest mb-3">What's Included</p>
             <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
               {eventPackage.includedItems.map((item, index) => (
                 <li key={index} className="flex items-start text-brand-blue/80 text-sm font-medium">
                   <div className="bg-white text-brand-cyan rounded-full p-0.5 mr-2 mt-0.5 shadow-sm">
                      <Check size={12} strokeWidth={4} />
                   </div>
                   {item}
                 </li>
               ))}
             </ul>
          </div>
        </div>

        <div className="pt-2">
          <Button asChild className="btn-coast-primary w-full md:w-auto px-8 h-12 text-sm shadow-lg">
            <Link href={`/event-builder?defaultPackageId=${eventPackage.id}`}>
                Customize & Book <ArrowRight className="ml-2 h-4 w-4" strokeWidth={3} />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
