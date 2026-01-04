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
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Infaq Balang & Delivery Sponsorship - BalangConnect',
  description: 'Contribute to the community through our Infaq Balang program or sponsor a Jumaat delivery. Share the joy of refreshing drinks with those in need.',
};

function FormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-6 w-6 rounded-full bg-teal-100" />
        <Skeleton className="h-6 w-32 rounded-md bg-teal-100" />
      </div>
      <Skeleton className="h-10 w-full rounded-md bg-slate-100" />
      <Skeleton className="h-10 w-full rounded-md bg-slate-100" />
      <Skeleton className="h-10 w-full rounded-md bg-slate-100" />
      <Skeleton className="h-24 w-full rounded-md bg-slate-100" />
      <Skeleton className="h-12 w-full rounded-md bg-slate-100" />
    </div>
  );
}

// LIQUID PARADISE THEME CONSTANTS - Using global utility classes
// REMOVED local constants in favor of globals.css classes

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
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-24">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 space-y-20">

        {/* Header Section */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
            <HeartHandshake size={14} className="text-teal-500" strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">Community Giving</span>
          </div>

          <h1 className="font-black text-5xl md:text-7xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Share The <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">Blessings</span>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            Your generous contributions help us deliver premium Balang drinks to mosques and community centers every Friday.
          </p>
        </div>

        {/* Top Section: Info & Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: How It Works */}
          <div className="lg:col-span-7">
            <div className="glass-panel-static p-8 md:p-12 mb-8">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="bg-teal-50 p-4 rounded-2xl shrink-0 text-teal-600">
                  <Info className="h-8 w-8" strokeWidth={2} />
                </div>
                <div className="w-full space-y-8">
                  <h4 className="font-black text-2xl uppercase text-slate-800 tracking-tight">How Infaq Works</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/50 p-6 rounded-3xl border border-white/50 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-2 mb-3 font-bold text-teal-700 uppercase text-xs tracking-wider">
                        <DollarSign className="h-4 w-4 text-teal-500" /> Cost Breakdown
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Each Infaq Balang is <strong className="text-slate-900">$95.00</strong>. A separate <strong className="text-slate-900">$25.00</strong> delivery fee applies per slot.
                      </p>
                    </div>

                    <div className="bg-white/50 p-6 rounded-3xl border border-white/50 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-2 mb-3 font-bold text-teal-700 uppercase text-xs tracking-wider">
                        <Users className="h-4 w-4 text-teal-500" /> Shared Blessings
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Delivery fees are shared if multiple donors contribute to the same slot. Any excess is refunded.
                      </p>
                    </div>
                  </div>

                  <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-teal-800 font-medium">
                      <strong>Pro Tip:</strong> Check the "Communi-Board" below. You might find a slot where delivery is already sponsored!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Forms Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Infaq Card */}
              <Card className="glass-panel-static overflow-hidden border-0 bg-white/60">
                <CardHeader className="p-8 pb-6 border-b border-white/40 bg-white/40">
                  <CardTitle className=" text-2xl font-black uppercase tracking-tight text-slate-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                      <Gift className="h-5 w-5" strokeWidth={3} />
                    </div>
                    Order Infaq
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium pt-2">
                    Your generous contribution provides cool relief.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Suspense fallback={<FormSkeleton />}>
                    <InfaqForm />
                  </Suspense>
                </CardContent>
              </Card>

              {/* Sponsor Delivery Card */}
              <Card className="glass-panel-static overflow-hidden border-2 border-teal-100 ring-4 ring-teal-50/50 bg-white/80">
                <CardHeader className="p-8 pb-6 border-b border-white/40 bg-teal-50/50">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight text-teal-800 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
                      <HeartHandshake className="h-5 w-5" strokeWidth={3} />
                    </div>
                    Sponsor Delivery
                  </CardTitle>
                  <CardDescription className="text-teal-700/70 font-medium pt-2">
                    Cover the $25 fee to help deliver Infaq to mosques.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Suspense fallback={<FormSkeleton />}>
                    <SponsorDeliveryForm />
                  </Suspense>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right: Visual & Impact List */}
          <div className="lg:col-span-5 space-y-6 md:sticky md:top-24">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
              <div className="relative h-64 md:h-80 overflow-hidden">
                <Image
                  src="https://placehold.co/600x400.png"
                  alt="Community receiving Infaq Balang"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  data-ai-hint="charity event"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <h3 className="font-black text-2xl uppercase mb-2">Your Impact</h3>
                  <p className="text-white/80 font-medium text-sm">Every contribution creates ripples of joy.</p>
                </div>
              </div>
              <div className="bg-white p-8 space-y-4">
                <ul className="space-y-4 font-medium text-slate-600">
                  <li className="flex items-start gap-3"><div className="bg-teal-50 text-teal-600 p-1 rounded-md"><Check size={16} strokeWidth={4} /></div> <span className="text-sm pt-0.5">Cool refreshments during Friday prayers.</span></li>
                  <li className="flex items-start gap-3"><div className="bg-teal-50 text-teal-600 p-1 rounded-md"><Check size={16} strokeWidth={4} /></div> <span className="text-sm pt-0.5">Supports religious events and functions.</span></li>
                  <li className="flex items-start gap-3"><div className="bg-teal-50 text-teal-600 p-1 rounded-md"><Check size={16} strokeWidth={4} /></div> <span className="text-sm pt-0.5">Brings smiles and relief in warm weather.</span></li>
                  <li className="flex items-start gap-3"><div className="bg-teal-50 text-teal-600 p-1 rounded-md"><Check size={16} strokeWidth={4} /></div> <span className="text-sm pt-0.5">Fosters spirit of unity and togetherness.</span></li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 text-slate-300 py-8">
          <div className="h-px bg-current flex-grow max-w-[100px] rounded-full"></div>
          <ScrollText size={20} />
          <div className="h-px bg-current flex-grow max-w-[100px] rounded-full"></div>
        </div>

        {/* Notice Board Section */}
        <div>
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-slate-900 tracking-tight">Community <span className="text-teal-600">Notice Board</span></h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              See which mosques have Infaq deliveries scheduled or slots open for contributions.
            </p>
          </div>

          {fetchError && (
            <div className="mb-8 bg-red-50 border border-red-100 rounded-3xl p-8 text-center max-w-2xl mx-auto">
              <div className="flex items-center justify-center font-bold text-red-500 text-lg mb-2 gap-2">
                <AlertTriangle className="h-6 w-6" />
                Error Loading Board
              </div>
              <p className="mb-4 text-red-400 text-sm">There was a problem fetching the data.</p>
              <pre className="whitespace-pre-wrap bg-white p-4 rounded-xl font-mono text-xs text-red-400 text-left border border-red-50 overflow-auto max-h-40 shadow-inner">
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
              <div className="glass-panel-static p-16 text-center max-w-xl mx-auto">
                <div className="bg-slate-100 p-6 rounded-full inline-block mb-6">
                  <HelpCircle className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black uppercase text-slate-300 tracking-widest mb-2">
                  Board Empty
                </h3>
                <p className="text-slate-400 font-medium">Be the first to start an Infaq contribution!</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}
