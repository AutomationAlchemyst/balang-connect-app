
'use client';

import Image from 'next/image';
import type { Promotion } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Info, Ticket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PromotionCardProps {
  promotion: Promotion;
}

export default function PromotionCard({ promotion }: PromotionCardProps) {
  const { toast } = useToast();

  const handleEnterDraw = () => {
    // This would typically involve a form or API call
    toast({
      title: "You're in the Draw!",
      description: `Successfully entered the "${promotion.title}" lucky draw. Good luck!`,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="w-full h-56">
        <Image
          src={promotion.imageUrl}
          alt={promotion.title}
          width={400}
          height={200}
          className="w-full h-full object-cover"
          data-ai-hint={promotion.dataAiHint || "gift celebration"}
        />
      </div>
      <CardHeader className="flex-grow">
        <CardTitle className="font-headline text-2xl text-primary">{promotion.title}</CardTitle>
        <CardDescription>{promotion.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        {promotion.endDate && (
          <p className="text-sm text-muted-foreground flex items-center">
            <CalendarDays size={16} className="mr-2 text-accent" />
            Ends on: {format(new Date(promotion.endDate), 'PPP')}
          </p>
        )}
        {promotion.terms && (
          <p className="text-xs text-muted-foreground flex items-start">
            <Info size={14} className="mr-2 mt-0.5 text-accent shrink-0" />
            Terms: {promotion.terms}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleEnterDraw} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Ticket className="mr-2 h-5 w-5" />
          {promotion.title.toLowerCase().includes('draw') ? 'Enter Lucky Draw' : 'Claim Offer'}
        </Button>
      </CardFooter>
    </Card>
  );
}
