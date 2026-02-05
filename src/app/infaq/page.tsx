import InfaqForm from '@/components/features/infaq/InfaqForm';
import SponsorDeliveryForm from '@/components/features/infaq/SponsorDeliveryForm';
import InfaqNoticeCard from '@/components/features/infaq/InfaqNoticeCard';
import { getInfaqSlots } from './actions';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { HeartHandshake, Info, Gift, ScrollText, AlertTriangle, DollarSign, Users, Check, HelpCircle } from 'lucide-react';
import type { InfaqNoticeBoardSlot } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Infaq Balang & Delivery Sponsorship - Balang Kepalang',
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
    <div className="relative min-h-screen bg-slate-50 selection:bg-[#0df2df]/20 selection:text-[#041F1C] pb-24">

      {/* Breezy Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-[#0df2df]/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-32 space-y-20">

        {/* HEADER */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-xl px-6 py-2 rounded-full border border-white/60 shadow-lg mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0df2df] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0bc9b9]"></span>
            </span>
            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-[#041F1C]">Community Giving</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase text-[#041F1C] tracking-tighter leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 py-4">
            Share The <br className="md:hidden" />
            <span className="breezy-text-gradient italic pr-8 pb-4">Blessings</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-[#041F1C]/60 font-bold animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Your generous contributions help us deliver premium Balang drinks to mosques and community centers every Friday.
          </p>
        </div>

        {/* Top Section: Info & Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left: How It Works & Forms */}
          <div className="lg:col-span-7 space-y-12">
            <div className="breezy-glass p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="bg-[#0df2df]/20 p-4 rounded-2xl shrink-0 text-[#09a093]">
                  <Info className="h-8 w-8" strokeWidth={2} />
                </div>
                <div className="w-full space-y-8">
                  <h4 className="font-black text-2xl uppercase text-[#041F1C] tracking-tight">How Infaq Works</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="breezy-glass-static p-6 hover:shadow-lg transition-transform hover:-translate-y-1">
                      <div className="flex items-center gap-2 mb-3 font-black text-[#0bc9b9] uppercase text-xs tracking-wider">
                        <DollarSign className="h-4 w-4" /> Cost Breakdown
                      </div>
                      <p className="text-sm text-[#041F1C]/70 font-bold leading-relaxed">
                        Each Infaq Balang is <strong className="text-[#041F1C]">$90.00</strong>. A separate <strong className="text-[#041F1C]">$15.00</strong> delivery fee applies per slot.
                      </p>
                    </div>

                    <div className="breezy-glass-static p-6 hover:shadow-lg transition-transform hover:-translate-y-1">
                      <div className="flex items-center gap-2 mb-3 font-black text-[#0bc9b9] uppercase text-xs tracking-wider">
                        <Users className="h-4 w-4" /> Shared Blessings
                      </div>
                      <p className="text-sm text-[#041F1C]/70 font-bold leading-relaxed">
                        Delivery fees are shared if multiple donors contribute to the same slot. Any excess is refunded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Notice Board Relocated */}
            <div className="space-y-8">
              <div className="text-left space-y-2">
                <h4 className="font-black text-2xl uppercase text-[#041F1C] tracking-tight flex items-center gap-3 py-2">
                  <span className="breezy-text-gradient italic pr-4 pb-2">Communi-Board</span>
                </h4>
                <p className="text-sm text-[#041F1C]/60 font-bold">
                  Check active delivery slots below. You might find a slot where delivery is already sponsored!
                </p>
              </div>

              {!fetchError && infaqNoticeBoardSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {infaqNoticeBoardSlots.map((slot) => (
                    <InfaqNoticeCard key={slot.id} slot={slot} />
                  ))}
                </div>
              ) : (
                !fetchError && (
                  <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/60 text-center">
                    <div className="bg-[#0df2df]/10 p-4 rounded-full inline-block mb-4">
                      <HelpCircle className="w-8 h-8 text-[#09a093]" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-[#041F1C]/40 tracking-widest mb-2">
                      Board Empty
                    </h3>
                    <p className="text-[#041F1C]/60 font-bold text-sm">Be the first to start an Infaq contribution!</p>
                  </div>
                )
              )}
            </div>

            {/* Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="breezy-glass-static overflow-hidden border-0 bg-white/60">
                <CardHeader className="p-8 pb-6 border-b border-white/40 bg-white/40">
                  <CardTitle className=" text-2xl font-black uppercase tracking-tight text-[#041F1C] flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#0df2df]/20 rounded-xl flex items-center justify-center text-[#09a093] shadow-sm">
                      <Gift className="h-5 w-5" strokeWidth={3} />
                    </div>
                    Order Infaq
                  </CardTitle>
                  <CardDescription className="text-[#041F1C]/50 font-bold pt-2">
                    Your contribution provides cool relief.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <Suspense fallback={<FormSkeleton />}>
                    <InfaqForm />
                  </Suspense>
                </CardContent>
              </Card>

              <Card className="breezy-glass-static overflow-hidden border-2 border-[#0df2df]/20 ring-4 ring-[#0df2df]/5 bg-white/80">
                <CardHeader className="p-8 pb-6 border-b border-white/40 bg-[#0df2df]/10">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight text-[#041F1C] flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#09a093] shadow-sm">
                      <HeartHandshake className="h-5 w-5" strokeWidth={3} />
                    </div>
                    Sponsor Delivery
                  </CardTitle>
                  <CardDescription className="text-[#041F1C]/60 font-bold pt-2">
                    Cover the $15 fee for deliveries.
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

          {/* Right: Impact Visual */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-32">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl relative group bg-white border border-white">
              <div className="relative h-64 md:h-96 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800"
                  alt="Community Impact"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041F1C]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-10 text-white">
                  <h3 className="font-black text-3xl uppercase mb-2 tracking-tighter">Your Impact</h3>
                  <p className="text-[#0df2df] font-bold text-lg italic">Every contribution creates ripples of joy.</p>
                </div>
              </div>
              <div className="p-10 space-y-6">
                <ul className="space-y-5 font-bold text-[#041F1C]/70">
                  <li className="flex items-start gap-4">
                    <div className="bg-[#0df2df]/20 text-[#09a093] p-1.5 rounded-lg shrink-0 mt-0.5"><Check size={20} strokeWidth={4} /></div>
                    <span>Cool refreshments during Friday prayers at local mosques.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-[#0df2df]/20 text-[#09a093] p-1.5 rounded-lg shrink-0 mt-0.5"><Check size={20} strokeWidth={4} /></div>
                    <span>Supports religious events and community functions.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-[#0df2df]/20 text-[#09a093] p-1.5 rounded-lg shrink-0 mt-0.5"><Check size={20} strokeWidth={4} /></div>
                    <span>Brings smiles and relief during warm Singapore weather.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 text-slate-300 py-12">
          <div className="h-px bg-current flex-grow max-w-[150px] rounded-full"></div>
          <ScrollText size={24} className="text-[#0df2df]" />
          <div className="h-px bg-current flex-grow max-w-[150px] rounded-full"></div>
        </div>


      </div>
    </div >
  );
}
