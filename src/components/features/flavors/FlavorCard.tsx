
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
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <div className={cn("w-full h-2", flavor.color)} />
      <div className="relative w-full h-56">
        <Image
          src={flavor.imageUrl}
          alt={flavor.name}
          width={300}
          height={200}
          className="w-full h-full object-cover shadow-lg"
          data-ai-hint={flavor.dataAiHint || "colorful drink"}
        />
        {flavor.color && <div className={cn("absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-card", flavor.color)}></div>}
      </div>
      <CardHeader className="flex-grow">
        <CardTitle className="font-headline text-2xl text-primary">{flavor.name}</CardTitle>
        <CardDescription>{flavor.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {flavor.tags && flavor.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {flavor.tags.map((tag) => (
              <span key={tag} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center">
                <Tag size={12} className="mr-1" /> {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onToggleSelect(flavor.id)} 
          className={cn(
            "w-full text-primary-foreground",
            isSelected ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
          )}
        >
          {isSelected ? <CheckCircle className="mr-2 h-5 w-5" /> : <PlusCircle className="mr-2 h-5 w-5" />}
          {isSelected ? 'Added to Selection' : 'Add to Selection'}
        </Button>
      </CardFooter>
    </Card>
  );
}
