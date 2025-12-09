import Image from 'next/image';
import type { Flavor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, CheckCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlavorCardProps {
  flavor: Flavor;
  isSelected: boolean;
  onToggleSelect: (flavorId: string) => void;
}

export default function FlavorCard({ flavor, isSelected, onToggleSelect }: FlavorCardProps) {
  return (
    <Card className={cn(
      "flex flex-col border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#000000] bg-white h-full group",
      isSelected ? "border-brand-green" : ""
    )}>
      <div className={cn("w-full h-4 border-b-4 border-black", flavor.color || "bg-gray-200")} />
      <div className="relative w-full h-64 border-b-4 border-black overflow-hidden">
        <Image
          src={flavor.imageUrl}
          alt={flavor.name}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          data-ai-hint={flavor.dataAiHint || "colorful drink"}
        />
        {isSelected && (
           <div className="absolute top-0 left-0 w-full h-full bg-brand-green/20 flex items-center justify-center backdrop-blur-[1px]">
              <div className="bg-brand-green text-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_#000000] transform rotate-3">
                <CheckCircle size={32} strokeWidth={3} />
              </div>
           </div>
        )}
      </div>
      <CardHeader className="flex-grow p-6 bg-[#FFFDF5]">
        <CardTitle className="font-display font-black text-2xl uppercase mb-2">{flavor.name}</CardTitle>
        <CardDescription className="text-black font-medium text-base">{flavor.description}</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-2">
        {flavor.tags && flavor.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {flavor.tags.map((tag) => (
              <span key={tag} className="text-xs font-bold uppercase bg-white border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_#000000] flex items-center">
                <Tag size={12} className="mr-1" /> {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          onClick={() => onToggleSelect(flavor.id)} 
          className={cn(
            "w-full font-display font-bold uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] h-12 text-base",
            isSelected 
              ? "bg-brand-green text-white hover:bg-[#329A00]" 
              : "bg-brand-cyan text-black hover:bg-[#2BC0D5]"
          )}
        >
          {isSelected ? <CheckCircle className="mr-2 h-5 w-5" strokeWidth={3} /> : <PlusCircle className="mr-2 h-5 w-5" strokeWidth={3} />}
          {isSelected ? 'Selected' : 'Add to Selection'}
        </Button>
      </CardFooter>
    </Card>
  );
}