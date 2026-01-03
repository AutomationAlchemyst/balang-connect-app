
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
import { WavyBackground } from '@/components/ui/wavy-background';

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

// LIQUID PARADISE THEME CONSTANTS
const CARD_STYLE = "glass-panel-wet bg-white/40 backdrop-blur-3xl border-white/20 shadow-2xl overflow-hidden h-full";
const INFO_BOX_STYLE = "bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-xl p-10";

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
    <div className="relative min-h-screen">
      <WavyBackground
        className="fixed inset-0 z-0"
        colors={["#004F59", "#00E0C6", "#FF6F61", "#F4EBD0", "#FFB347"]}
        waveWidth={60}
        speed="slow"
      />

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-32 space-y-24">
        {/* Header */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-brand-teal text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl rotate-1">
            <HeartHandshake size={16} className="text-brand-aqua" strokeWidth={4} />
            Community Giving
          </div>

          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter text-brand-teal drop-shadow-2xl">
            Infaq<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua to-brand-cyan">Balang</span>
          </h1>

          <p className="text-xl md:text-2xl text-brand-teal/60 font-bold leading-relaxed max-w-2xl mx-auto border-t border-brand-teal/10 pt-8 uppercase tracking-widest">
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
                    <DollarSign className="h-4 w-4 text-brand-cyan" /> Cost Breakdown
                  </div>
                  <p className="text-sm text-brand-blue/70 leading-relaxed">Each Infaq Balang is <strong className="text-brand-blue">$95.00</strong>. A separate <strong className="text-brand-blue">$25.00</strong> delivery fee applies per slot.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-brand-blue/5">
                  <div className="flex items-center gap-2 mb-2 font-bold text-brand-blue uppercase text-sm">
                    <Users className="h-4 w-4 text-brand-cyan" /> Shared Blessings
                  </div>
                  <p className="text-sm text-brand-blue/70 leading-relaxed">Delivery fees are shared if multiple donors contribute to the same slot. We refund excess delivery fees.</p>
                </div>
                <div className="bg-white/50 p-4 rounded-2xl border border-brand-blue/5">
                  <div className="flex items-center gap-2 mb-2 font-bold text-brand-blue uppercase text-sm">
                    <Sparkles className="h-4 w-4 text-brand-cyan" /> Pro Tip
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
              <CardHeader className="p-10 pb-6 border-b border-white/10 relative overflow-hidden">
                <CardTitle className="text-brand-teal text-3xl font-display font-black uppercase tracking-tight relative z-10 flex items-center gap-4">
                  <Gift className="h-8 w-8 text-brand-aqua" strokeWidth={4} />
                  Order Infaq Balang
                </CardTitle>
                <CardDescription className="text-brand-teal/60 font-medium text-lg mt-4 border-l-4 border-brand-aqua/30 pl-6 italic">
                  Your generous Infaq will help us provide refreshing balang drinks. Every drop counts.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <Suspense fallback={<FormSkeleton />}>
                  <InfaqForm />
                </Suspense>
              </CardContent>
            </Card>

            <Card className={`${CARD_STYLE} ring-4 ring-brand-aqua/10`}>
              <CardHeader className="p-10 pb-6 border-b border-white/10 relative overflow-hidden bg-brand-aqua/5">
                <CardTitle className="text-brand-teal text-3xl font-display font-black uppercase tracking-tight relative z-10 flex items-center gap-4">
                  <HeartHandshake className="h-8 w-8 text-brand-aqua" strokeWidth={4} />
                  Sponsor Delivery
                </CardTitle>
                <CardDescription className="text-brand-teal/60 font-medium text-lg mt-4 border-l-4 border-brand-aqua/30 pl-6 italic">
                  Sponsor the $25 delivery fee for a Jumaat delivery to help us get Infaq balangs to a mosque in need.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
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
