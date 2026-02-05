
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
    <Card className="breezy-glass-static border-none overflow-hidden h-full flex flex-col group hover:scale-[1.01] transition-transform duration-300">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#041F1C]/60 to-transparent"></div>
        </div>
      )}
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-[#041F1C] text-xl font-display font-black uppercase tracking-tight leading-tight">{slot.mosqueName}</CardTitle>
        </div>

        <Badge
          variant={getStatusBadgeVariant(slot.status)}
          className={cn(
            "text-[10px] h-fit py-1 px-2 mb-2 w-full flex items-center justify-center font-bold uppercase tracking-wide rounded-full shadow-sm",
            // Custom coloring overrides based on status logic if needed, but variants might suffice if defined well.
            // For now, let's keep variants but maybe tweak opacity in globals if we were thorough. 
            // Or just inline styles for specific statuses to match theme perfectly:
            slot.status.includes("Secured") || slot.status.includes("Sponsored") ? "bg-[#0df2df]/20 text-[#09a093] border-none" :
              slot.status.includes("Welcome") ? "bg-red-50 text-red-500 border-red-100" :
                "bg-[#09a093] text-white border-none shadow-lg"
          )}
        >
          {getStatusIcon(slot.status)}
          <span className="ml-1.5 truncate">{slot.status}</span>
        </Badge>

        <div className="text-[10px] text-[#041F1C]/60 font-black uppercase tracking-widest space-y-2 mt-4">
          <p className="flex items-center">
            <MapPin size={12} className="mr-3 shrink-0 text-[#09a093]" strokeWidth={3} /> {slot.mosqueAddress || 'Address not specified'}
          </p>
          <p className="flex items-center">
            <CalendarDays size={12} className="mr-3 shrink-0 text-[#09a093]" strokeWidth={3} /> Friday, {slot.displayDate}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-8 pt-0">
        {slot.description && <p className="text-base text-[#041F1C]/70 font-medium italic leading-relaxed border-l-4 border-[#0df2df] pl-6">"{slot.description}"</p>}
        {slot.totalBalangsInfaqed && slot.totalBalangsInfaqed > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <div className="w-8 h-px bg-[#041F1C]/10"></div>
            <span className="text-[10px] font-black uppercase text-[#041F1C]/40 tracking-[0.2em]">Infaqed: {slot.totalBalangsInfaqed} Balangs</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch space-y-3 pt-2 pb-6 px-6">
        {slot.status !== 'Recently Fulfilled!' ? (
          <>
            <Button
              className="w-full h-12 bg-gradient-to-r from-[#0df2df] to-[#09a093] hover:brightness-110 text-[#041F1C] font-black uppercase tracking-wide shadow-md transition-all rounded-xl"
              onClick={handleContributeClick}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Contribute
            </Button>

            {!slot.isDeliveryFeeCovered && (
              <Button
                variant="outline"
                className="w-full rounded-xl border-[#0df2df]/30 text-[#09a093] hover:bg-[#0df2df]/10 h-10 text-xs font-bold uppercase tracking-wide"
                onClick={handleSponsorClick}
              >
                <HeartHandshake className="mr-2 h-4 w-4" />
                Sponsor Delivery ($15)
              </Button>
            )}
          </>
        ) : (
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest w-full text-center py-2 bg-emerald-50 rounded-xl">Fully Sponsored!</p>
        )}
      </CardFooter>
    </Card>
  );
}
