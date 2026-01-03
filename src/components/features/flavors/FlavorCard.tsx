import Image from 'next/image';
import type { Flavor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Check, Plus, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlavorCardProps {
  flavor: Flavor;
  isSelected: boolean;
  onToggleSelect: (flavorId: string) => void;
}

export default function FlavorCard({ flavor, isSelected, onToggleSelect }: FlavorCardProps) {
  return (
    <Card
      className={cn(
        "glass-panel-wet border-white/20 overflow-hidden h-full group transition-all duration-500 bg-white/40 backdrop-blur-xl",
        isSelected
          ? "ring-4 ring-brand-aqua/50 shadow-[0_20px_50px_rgba(0,224,198,0.2)] scale-[1.03] bg-white/80"
          : "hover:scale-[1.03] hover:bg-white/60 hover:shadow-[0_20px_50px_rgba(0,40,80,0.05)]"
      )}
    >
      <div className="relative w-full h-72 overflow-hidden">
        <Image
          src={flavor.imageUrl}
          alt={flavor.name}
          width={400}
          height={400}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          data-ai-hint={flavor.dataAiHint || "colorful drink"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-teal/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

        {/* Tag on Image */}
        <div className="absolute top-4 left-4 flex gap-2">
          {flavor.tags && flavor.tags.slice(0, 1).map(tag => (
            <span key={tag} className="bg-white/20 backdrop-blur-md text-white font-mono text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-white/30 tracking-[0.1em]">
              {tag}
            </span>
          ))}
        </div>

        {isSelected && (
          <div className="absolute inset-0 bg-brand-aqua/20 backdrop-blur-[4px] flex items-center justify-center animate-in zoom-in duration-500">
            <div className="bg-white text-brand-aqua rounded-3xl p-5 shadow-2xl transform scale-110 rotate-3">
              <Check size={40} strokeWidth={4} />
            </div>
          </div>
        )}
      </div>

      <CardHeader className="p-8 pb-2 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", flavor.color || "bg-brand-aqua")}>
            <Droplets size={20} />
          </div>
          <span className="text-brand-teal font-mono font-black text-xl">${flavor.pricePerLiter.toFixed(2)}<span className="text-[10px] text-brand-teal/40 ml-1">/L</span></span>
        </div>
        <CardTitle className="text-brand-teal text-2xl font-display font-black uppercase tracking-tight leading-tight min-h-[3.5rem] flex items-end">
          {flavor.name}
        </CardTitle>
        <CardDescription className="text-brand-teal/60 font-medium text-base leading-relaxed mt-4 min-h-[4rem] border-l-2 border-brand-aqua/20 pl-4">
          {flavor.description}
        </CardDescription>
      </CardHeader>

      <CardFooter className="p-8 pt-6 mt-auto">
        <Button
          onClick={() => onToggleSelect(flavor.id)}
          className={cn(
            "w-full rounded-[2rem] font-display font-black uppercase tracking-[0.2em] h-14 text-sm transition-all duration-500 shadow-xl",
            isSelected
              ? "bg-brand-coral text-white hover:bg-brand-coral/90 shadow-brand-coral/20"
              : "bg-brand-teal text-white hover:bg-brand-aqua shadow-brand-teal/20"
          )}
        >
          {isSelected ? (
            <span className="flex items-center"><Check className="mr-3 h-5 w-5" strokeWidth={3} /> Selected</span>
          ) : (
            <span className="flex items-center"><Plus className="mr-3 h-5 w-5" strokeWidth={3} /> Add to Order</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
