
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
    <Card className="glass-panel-wet border-none overflow-hidden h-full flex flex-col group hover:scale-[1.01] transition-transform duration-300">
      {slot.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={slot.imageUrl}
            alt={`Infaq for ${slot.mosqueName}`}
            width={600}
            height={400}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint={slot.dataAiHint || "community event"}
          />
          <div className="absolute inset-0 bg-brand-blue/10 mix-blend-multiply"></div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
            <CardTitle className="text-coast-heading text-lg text-brand-blue leading-tight">{slot.mosqueName}</CardTitle>
        </div>
        
        <Badge
          variant={getStatusBadgeVariant(slot.status)}
          className={cn(
            "text-[10px] h-fit py-1 px-2 mb-2 w-full flex items-center justify-center font-bold uppercase tracking-wide rounded-full shadow-sm",
            // Custom coloring overrides based on status logic if needed, but variants might suffice if defined well.
            // For now, let's keep variants but maybe tweak opacity in globals if we were thorough. 
            // Or just inline styles for specific statuses to match theme perfectly:
            slot.status.includes("Secured") || slot.status.includes("Sponsored") ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200" :
            slot.status.includes("Welcome") ? "bg-brand-yellow/20 text-brand-blue border-brand-yellow/50 hover:bg-brand-yellow/30" :
            "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 hover:bg-brand-cyan/20"
          )}
        >
          {getStatusIcon(slot.status)}
          <span className="ml-1.5 truncate">{slot.status}</span>
        </Badge>

        <div className="text-xs text-brand-blue/60 font-medium space-y-1">
            <p className="flex items-center">
                <MapPin size={12} className="mr-2 shrink-0 text-brand-cyan" /> {slot.mosqueAddress || 'Address not specified'}
            </p>
            <p className="flex items-center">
                <CalendarDays size={12} className="mr-2 shrink-0 text-brand-cyan" /> Friday, {slot.displayDate}
            </p>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow py-2">
        {slot.description && <p className="text-sm text-brand-blue/70 italic leading-relaxed">"{slot.description}"</p>}
         {slot.totalBalangsInfaqed && slot.totalBalangsInfaqed > 0 && (
          <div className="mt-3 inline-block">
            <Badge variant="secondary" className="bg-brand-blue/5 text-brand-blue font-mono text-xs border-brand-blue/10">
               Balangs Infaqed: {slot.totalBalangsInfaqed}
            </Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-stretch space-y-3 pt-2 pb-6 px-6">
        {slot.status !== 'Recently Fulfilled!' ? (
          <>
            <Button
              className="w-full btn-coast-primary h-10 text-sm shadow-md"
              onClick={handleContributeClick}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Contribute
            </Button>
            
            {!slot.isDeliveryFeeCovered && (
              <Button
                variant="outline"
                className="w-full rounded-full border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 h-10 text-xs font-bold uppercase tracking-wide"
                onClick={handleSponsorClick}
              >
                <HeartHandshake className="mr-2 h-4 w-4" />
                Sponsor Delivery ($25)
              </Button>
            )}
          </>
        ) : (
          <p className="text-xs text-green-600 font-bold uppercase tracking-widest w-full text-center py-2 bg-green-50 rounded-full">Fully Sponsored!</p>
        )}
      </CardFooter>
    </Card>
  );
}
