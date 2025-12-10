import Image from 'next/image';
import type { Flavor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Check, Plus } from 'lucide-react';
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
        "glass-panel-wet border-none overflow-hidden h-full group transition-all duration-300",
        isSelected ? "ring-2 ring-brand-cyan shadow-lg shadow-brand-cyan/20 scale-[1.02]" : "hover:scale-[1.02]"
      )}
    >
      <div className="relative w-full h-64 overflow-hidden">
        <Image
          src={flavor.imageUrl}
          alt={flavor.name}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          data-ai-hint={flavor.dataAiHint || "colorful drink"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/60 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
        
        {/* Color Stripe Indicator */}
        <div className={cn("absolute top-0 w-full h-1.5", flavor.color || "bg-white/20")} />

        {isSelected && (
           <div className="absolute inset-0 bg-brand-cyan/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
              <div className="bg-white text-brand-cyan rounded-full p-3 shadow-xl transform scale-110">
                <Check size={32} strokeWidth={4} />
              </div>
           </div>
        )}
      </div>
      
      <CardHeader className="p-6 pb-2 relative z-10">
        <CardTitle className="text-coast-heading text-xl uppercase tracking-wide leading-tight min-h-[3.5rem] flex items-end">
           {flavor.name}
        </CardTitle>
        <CardDescription className="text-brand-blue/60 font-medium text-sm leading-relaxed mt-2 min-h-[3rem]">
           {flavor.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-6 pb-4">
        {flavor.tags && flavor.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {flavor.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-bold uppercase bg-brand-blue/5 text-brand-blue px-2 py-1 rounded-full border border-brand-blue/10 flex items-center tracking-wider">
                <Tag size={10} className="mr-1 opacity-50" /> {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button 
          onClick={() => onToggleSelect(flavor.id)} 
          variant={isSelected ? "default" : "secondary"}
          className={cn(
            "w-full rounded-full font-bold uppercase tracking-widest h-12 text-xs transition-all duration-300 shadow-sm hover:shadow-md",
            isSelected 
              ? "bg-brand-cyan text-white hover:bg-brand-cyan/90" 
              : "bg-white text-brand-blue hover:bg-brand-blue hover:text-white border border-brand-blue/10"
          )}
        >
          {isSelected ? (
             <span className="flex items-center"><Check className="mr-2 h-4 w-4" strokeWidth={3} /> Selected</span>
          ) : (
             <span className="flex items-center"><Plus className="mr-2 h-4 w-4" strokeWidth={3} /> Add Flavor</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
