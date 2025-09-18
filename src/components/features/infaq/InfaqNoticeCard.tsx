
'use client';

import Image from 'next/image';
import type { InfaqNoticeBoardSlot } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, CheckCircle, Info, ShoppingBag, AlertTriangle, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface InfaqNoticeCardProps {
  slot: InfaqNoticeBoardSlot;
}

export default function InfaqNoticeCard({ slot }: InfaqNoticeCardProps) {
  const router = useRouter();

  const getStatusBadgeVariant = (status: InfaqNoticeBoardSlot['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Delivery Secured - Join In!':
      case 'Delivery Fee Sponsored!':
        return 'default';
      
      case 'Slot Open - Be the First!':
      case 'Contributions Open (Shared Delivery Pending)':
        return 'secondary';

      case 'Contributions Welcome - Delivery Needed':
        return 'destructive';
      
      case 'Recently Fulfilled!':
        return 'outline';

      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: InfaqNoticeBoardSlot['status']) => {
    switch (status) {
      case 'Delivery Secured - Join In!':
      case 'Delivery Fee Sponsored!':
      case 'Recently Fulfilled!':
        return <CheckCircle className="h-4 w-4" />;
      
      case 'Contributions Welcome - Delivery Needed':
        return <AlertTriangle className="h-4 w-4" />;
        
      case 'Slot Open - Be the First!':
      case 'Contributions Open (Shared Delivery Pending)':
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const handleContributeClick = () => {
    const queryParams = new URLSearchParams();
    queryParams.append('mosqueName', slot.mosqueName);
    // Pass only the YYYY-MM-DD part of the date to avoid timezone issues.
    const dateString = new Date(slot.date).toISOString().split('T')[0];
    queryParams.append('deliveryDate', dateString);
    queryParams.append('targetSlotId', slot.id);

    const deliveryCoveredStatuses: Array<InfaqNoticeBoardSlot['status']> = ['Delivery Secured - Join In!', 'Delivery Fee Sponsored!'];
    if (slot.isDeliveryFeeCovered || deliveryCoveredStatuses.includes(slot.status)) {
      queryParams.append('deliveryAlreadyCovered', 'true');
    }

    router.push(`/infaq?${queryParams.toString()}#infaq-form-actual`);
  };

  const handleSponsorClick = () => {
    const queryParams = new URLSearchParams();
    queryParams.append('mosqueName', slot.mosqueName);
    const dateString = new Date(slot.date).toISOString().split('T')[0];
    queryParams.append('deliveryDate', dateString);
    queryParams.append('targetSlotId', slot.id);

    router.push(`/infaq?${queryParams.toString()}#sponsor-form-actual`);
  };

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      {slot.imageUrl && (
        <div className="w-full h-48">
          <Image
            src={slot.imageUrl}
            alt={`Infaq for ${slot.mosqueName}`}
            width={600}
            height={400}
            className="w-full h-full object-cover"
            data-ai-hint={slot.dataAiHint || "community event"}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary mb-1.5">{slot.mosqueName}</CardTitle>
        <Badge
          variant={getStatusBadgeVariant(slot.status)}
          className={cn(
            "text-xs h-fit py-1 px-2.5 mb-2 w-full flex items-center justify-center"
          )}
        >
          {getStatusIcon(slot.status)}
          <span className="ml-1.5">{slot.status}</span>
        </Badge>
        <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="flex items-center">
                <MapPin size={12} className="mr-1.5 shrink-0" /> {slot.mosqueAddress || 'Address not specified'}
            </p>
            <p className="flex items-center">
                <CalendarDays size={12} className="mr-1.5 shrink-0" /> Friday, {slot.displayDate}
            </p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {slot.description && <p className="text-sm text-muted-foreground">{slot.description}</p>}
         {slot.totalBalangsInfaqed && slot.totalBalangsInfaqed > 0 && (
          <div className="mt-2">
            <Badge variant="secondary">Balangs Infaqed: {slot.totalBalangsInfaqed}</Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-stretch space-y-2">
        {slot.status !== 'Recently Fulfilled!' ? (
          <>
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleContributeClick}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Contribute Balang(s)
            </Button>
            
            {!slot.isDeliveryFeeCovered && (
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={handleSponsorClick}
              >
                <HeartHandshake className="mr-2 h-5 w-5" />
                Sponsor Delivery ($25)
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-green-600 font-semibold w-full text-center">Thank you for your generosity!</p>
        )}
      </CardFooter>
    </Card>
  );
}
