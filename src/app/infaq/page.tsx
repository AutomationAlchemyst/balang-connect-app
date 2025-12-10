
import SectionTitle from '@/components/ui/SectionTitle';
import InfaqForm from '@/components/features/infaq/InfaqForm';
import SponsorDeliveryForm from '@/components/features/infaq/SponsorDeliveryForm';
import InfaqNoticeCard from '@/components/features/infaq/InfaqNoticeCard';
import { getInfaqSlots } from './actions';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { HeartHandshake, Info, Gift, ScrollText, AlertTriangle, DollarSign, Users, Sparkles, Check, HelpCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { InfaqNoticeBoardSlot } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Infaq Balang & Delivery Sponsorship - BalangConnect',
  description: 'Contribute to the community through our Infaq Balang program or sponsor a Jumaat delivery. Share the joy of refreshing drinks with those in need.',
};

function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-6 w-6 rounded-full bg-brand-blue/10" />
        <Skeleton className="h-6 w-32 rounded-md bg-brand-blue/10" />
      </div>
      <Skeleton className="h-10 w-full rounded-md bg-brand-blue/5" />
      <Skeleton className="h-10 w-full rounded-md bg-brand-blue/5" />
      <Skeleton className="h-10 w-full rounded-md bg-brand-blue/5" />
      <Skeleton className="h-24 w-full rounded-md bg-brand-blue/5" />
      <Skeleton className="h-12 w-full rounded-md bg-brand-blue/5" />
    </div>
  );
}

// MODERN COAST THEME CONSTANTS
const CARD_STYLE = "glass-panel-wet border-none overflow-hidden h-full";
const INFO_BOX_STYLE = "bg-white/60 backdrop-blur-md rounded-3xl border border-brand-blue/10 shadow-lg p-8";

export default async function InfaqPage() {
  let infaqNoticeBoardSlots: InfaqNoticeBoardSlot[] = [];
  let fetchError: string | null = null;
  
  try {
    infaqNoticeBoardSlots = await getInfaqSlots();
  } catch (error: any) {
    console.error(error);
    fetchError = error.message;
  }

  return (
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24">
      <div className="container mx-auto px-4 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
         <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-2">
            <HeartHandshake size={14} /> Community Giving
         </div>
         <h1 className="text-coast-heading text-4xl md:text-6xl text-brand-blue">
            Infaq <span className="text-brand-cyan">Balang</span>
         </h1>
         <p className="text-xl text-brand-blue/70 font-medium leading-relaxed">
            Share the blessings. Contribute refreshing drinks to our local mosques and community centers.
         </p>
      </div>
      
      {/* Info Section */}
      <div className={INFO_BOX_STYLE}>
        <div className="flex flex-col md:flex-row items-start gap-8">
           <div className="bg-brand-cyan/20 p-4 rounded-2xl shrink-0">
              <Info className="h-8 w-8 text-brand-cyan" strokeWidth={2} />
           </div>
           <div className="w-full space-y-6">
              <h4 className="font-display font-black text-2xl uppercase text-brand-blue">How Infaq & Sponsorship Works</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/50 p-4 rounded-2xl border border-brand-blue/5">
                      <div className="flex items-center gap-2 mb-2 font-bold text-brand-blue uppercase text-sm">
                         <DollarSign className="h-4 w-4 text-brand-cyan"/> Cost Breakdown
                      </div>
                      <p className="text-sm text-brand-blue/70 leading-relaxed">Each Infaq Balang is <strong className="text-brand-blue">$95.00</strong>. A separate <strong className="text-brand-blue">$25.00</strong> delivery fee applies per slot.</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-brand-blue/5">
                      <div className="flex items-center gap-2 mb-2 font-bold text-brand-blue uppercase text-sm">
                         <Users className="h-4 w-4 text-brand-cyan"/> Shared Blessings
                      </div>
                      <p className="text-sm text-brand-blue/70 leading-relaxed">Delivery fees are shared if multiple donors contribute to the same slot. We refund excess delivery fees.</p>
                  </div>
                  <div className="bg-white/50 p-4 rounded-2xl border border-brand-blue/5">
                      <div className="flex items-center gap-2 mb-2 font-bold text-brand-blue uppercase text-sm">
                         <Sparkles className="h-4 w-4 text-brand-cyan"/> Pro Tip
                      </div>
                      <p className="text-sm text-brand-blue/70 leading-relaxed">Check the <strong>Community Board</strong> below. You might find a slot where delivery is already sponsored!</p>
                  </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Card className={CARD_STYLE}>
            <CardHeader className="bg-brand-blue/5 border-b border-brand-blue/5 p-6">
              <CardTitle className="font-display font-black text-2xl uppercase flex items-center text-brand-blue gap-3">
                <Gift className="h-6 w-6 text-brand-cyan" strokeWidth={2.5} />
                Order Infaq Balang
              </CardTitle>
              <CardDescription className="text-brand-blue/60 font-medium text-base mt-2">
                Your generous Infaq will help us provide refreshing balang drinks. Every drop counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Suspense fallback={<FormSkeleton />}>
                <InfaqForm />
              </Suspense>
            </CardContent>
          </Card>

          <Card className={`${CARD_STYLE} ring-2 ring-brand-green/20`}>
            <CardHeader className="bg-green-50 border-b border-green-100 p-6">
              <CardTitle className="font-display font-black text-2xl uppercase flex items-center text-green-700 gap-3">
                <HeartHandshake className="h-6 w-6" strokeWidth={2.5} />
                Sponsor Delivery
              </CardTitle>
              <CardDescription className="text-green-800/60 font-medium text-base mt-2">
                Sponsor the $25 delivery fee for a Jumaat delivery to help us get Infaq balangs to a mosque in need.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Suspense fallback={<FormSkeleton />}>
                <SponsorDeliveryForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:sticky md:top-24"> 
          <Card className="glass-panel-static border-none p-0 overflow-hidden">
            <div className="relative h-64 overflow-hidden">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Community receiving Infaq Balang" 
                width={600} 
                height={400} 
                className="w-full object-cover"
                data-ai-hint="charity event" 
              />
              <div className="absolute inset-0 bg-brand-blue/20 mix-blend-multiply"></div>
            </div>
            <CardHeader className="p-6 pb-0">
               <CardTitle className="font-display font-black text-xl uppercase text-brand-blue">Your Impact</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4 font-medium text-brand-blue/80">
                <li className="flex items-start"><Check className="mr-3 h-5 w-5 text-brand-cyan shrink-0" strokeWidth={3} /> <span className="text-sm">Provides cool refreshments during prayers.</span></li>
                <li className="flex items-start"><Check className="mr-3 h-5 w-5 text-brand-cyan shrink-0" strokeWidth={3} /> <span className="text-sm">Supports religious events and functions.</span></li>
                <li className="flex items-start"><Check className="mr-3 h-5 w-5 text-brand-cyan shrink-0" strokeWidth={3} /> <span className="text-sm">Brings smiles and relief in warm weather.</span></li>
                <li className="flex items-start"><Check className="mr-3 h-5 w-5 text-brand-cyan shrink-0" strokeWidth={3} /> <span className="text-sm">Fosters a spirit of unity and togetherness.</span></li>
                <li className="flex items-start"><Check className="mr-3 h-5 w-5 text-brand-cyan shrink-0" strokeWidth={3} /> <span className="text-sm">Delivery sponsorship removes costs for recipients.</span></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-brand-blue/20">
         <div className="h-px bg-current flex-grow max-w-xs"></div>
         <ScrollText size={24} />
         <div className="h-px bg-current flex-grow max-w-xs"></div>
      </div>

      <div>
        <div className="text-center mb-10 space-y-4">
             <h2 className="text-coast-heading text-4xl md:text-6xl text-brand-blue">Community <span className="text-brand-cyan">Notice Board</span></h2>
             <p className="text-xl text-brand-blue/60 font-medium max-w-2xl mx-auto">
                See which mosques have Infaq deliveries scheduled or slots open for contributions. 
            </p>
        </div>
        
        {fetchError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-2xl mx-auto">
              <div className="flex items-center justify-center font-bold text-red-500 text-lg mb-2 gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Error Loading Board
              </div>
              <p className="mb-4 text-red-400 text-sm">There was a problem fetching the data.</p>
              <pre className="whitespace-pre-wrap bg-white p-3 rounded-lg font-mono text-xs text-red-400 text-left border border-red-100 overflow-auto max-h-40">
                  {fetchError}
              </pre>
          </div>
        )}

        {!fetchError && infaqNoticeBoardSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {infaqNoticeBoardSlots.map((slot) => (
                    <InfaqNoticeCard key={slot.id} slot={slot} />
                ))}
            </div>
        ) : (
          !fetchError && (
            <div className="glass-panel-static p-12 text-center max-w-xl mx-auto border-dashed border-2 border-brand-blue/10">
                <div className="bg-brand-blue/5 p-4 rounded-full inline-block mb-4">
                    <HelpCircle className="w-8 h-8 text-brand-blue/30" />
                </div>
                <p className="text-2xl font-display font-bold uppercase text-brand-blue/40">
                    Board Empty
                </p>
                <p className="text-brand-blue/50 font-medium mt-2">Check back soon or be the first to start an Infaq!</p>
            </div>
          )
        )}
      </div>

    </div>
    </div>
  );
}
