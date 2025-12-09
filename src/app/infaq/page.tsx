
import SectionTitle from '@/components/ui/SectionTitle';
import InfaqForm from '@/components/features/infaq/InfaqForm';
import SponsorDeliveryForm from '@/components/features/infaq/SponsorDeliveryForm';
import InfaqNoticeCard from '@/components/features/infaq/InfaqNoticeCard';
import { getInfaqSlots } from './actions';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { HeartHandshake, Info, Gift, ScrollText, AlertTriangle, DollarSign, Users, Sparkles, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
        <Skeleton className="h-6 w-6 rounded-full bg-gray-300" />
        <Skeleton className="h-6 w-32 rounded-md bg-gray-300" />
      </div>
      <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
      <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
      <Skeleton className="h-10 w-full rounded-md bg-gray-300" />
      <Skeleton className="h-24 w-full rounded-md bg-gray-300" />
      <Skeleton className="h-12 w-full rounded-md bg-gray-300" />
    </div>
  );
}

// Neo-Brutalism Constants
const CARD_STYLE = "bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] rounded-none transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000000]";
const ALERT_STYLE = "bg-[#FFFDF5] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-none text-black";

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
    <div className="space-y-16 pb-16">
      <div className="text-center">
        <SectionTitle>Infaq Balang: Share the Blessings</SectionTitle>
      </div>
      
      <div className={ALERT_STYLE}>
        <div className="flex items-start p-6">
           <Info className="h-8 w-8 text-black mr-4 shrink-0" strokeWidth={2.5} />
           <div className="w-full">
              <h4 className="font-display font-black text-xl uppercase mb-2">How Your Infaq & Sponsorship Works</h4>
              <div className="space-y-4 pt-2 text-black font-medium">
                  <div className="flex items-start gap-3">
                      <div className="bg-brand-yellow p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                         <DollarSign className="h-5 w-5 text-black" strokeWidth={2.5}/>
                      </div>
                      <div>
                          <p>Each Infaq Balang is <strong className="bg-brand-cyan px-1 border border-black">$95.00</strong>. A separate <strong className="bg-brand-cyan px-1 border border-black">$25.00</strong> delivery fee applies for each unique delivery slot (mosque + date).</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <div className="bg-brand-green p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                         <Users className="h-5 w-5 text-white" strokeWidth={2.5}/>
                      </div>
                      <div>
                          <p><strong>Sharing is Caring!</strong> When multiple donors contribute to the same slot, the $25 delivery fee is shared. We may contact initial donors for a partial refund if others join in.</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-3">
                      <div className="bg-[#FF6B6B] p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                         <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5}/>
                      </div>
                      <div>
                          <p><strong>Pro-Tip:</strong> Check the <strong>Community Infaq Board</strong> below before donating. You might find a slot where delivery is already sponsored or being shared!</p>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-12">
          <Card className={CARD_STYLE}>
            <CardHeader className="bg-brand-cyan border-b-4 border-black p-6">
              <CardTitle className="font-display font-black text-2xl uppercase flex items-center">
                <Gift className="mr-3 h-8 w-8 text-black" strokeWidth={2.5} />
                Order Infaq Balang(s)
              </CardTitle>
              <CardDescription className="text-black font-medium text-base mt-2">
                Your generous Infaq will help us provide refreshing balang drinks to your chosen mosque. Every drop counts towards spreading joy and kindness.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Suspense fallback={<FormSkeleton />}>
                <InfaqForm />
              </Suspense>
            </CardContent>
          </Card>

          <Card className={`${CARD_STYLE} border-brand-green shadow-[8px_8px_0px_0px_#3FC300]`}>
            <CardHeader className="bg-[#B8FF9F] border-b-4 border-black p-6">
              <CardTitle className="font-display font-black text-2xl uppercase flex items-center">
                <HeartHandshake className="mr-3 h-8 w-8 text-black" strokeWidth={2.5} />
                Sponsor a Jumaat Delivery
              </CardTitle>
              <CardDescription className="text-black font-medium text-base mt-2">
                Can't order a balang right now? You can still contribute by sponsoring the $25 delivery fee for a Jumaat delivery. This helps us get Infaq balangs to a mosque in need within the community!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Suspense fallback={<FormSkeleton />}>
                <SponsorDeliveryForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:sticky md:top-24"> 
          <Card className={CARD_STYLE}>
            <div className="border-b-4 border-black">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Community receiving Infaq Balang" 
                width={600} 
                height={400} 
                className="w-full object-cover h-64"
                data-ai-hint="charity event" 
              />
            </div>
            <CardHeader className="bg-black text-white p-4">
               <CardTitle className="font-display font-black text-xl uppercase">How Your Contributions Help</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-[#FFFDF5]">
              <ul className="space-y-3 font-medium text-black">
                <li className="flex items-start"><Check className="mr-2 h-5 w-5 text-brand-green shrink-0" strokeWidth={3} /> Provides cool refreshments during prayers.</li>
                <li className="flex items-start"><Check className="mr-2 h-5 w-5 text-brand-green shrink-0" strokeWidth={3} /> Supports religious events and functions.</li>
                <li className="flex items-start"><Check className="mr-2 h-5 w-5 text-brand-green shrink-0" strokeWidth={3} /> Brings smiles and relief in warm weather.</li>
                <li className="flex items-start"><Check className="mr-2 h-5 w-5 text-brand-green shrink-0" strokeWidth={3} /> Fosters a spirit of unity and togetherness.</li>
                <li className="flex items-start"><Check className="mr-2 h-5 w-5 text-brand-green shrink-0" strokeWidth={3} /> Delivery sponsorship removes costs for recipients.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12 bg-black h-1" />

      <div>
        <div className="flex items-center justify-center mb-10">
            <div className="bg-brand-yellow px-6 py-3 border-4 border-black shadow-[6px_6px_0px_0px_#000000] transform rotate-1 inline-flex items-center">
                <ScrollText className="mr-3 h-8 w-8 text-black" strokeWidth={2.5} />
                <h2 className="font-display text-3xl font-black uppercase tracking-tighter text-black">Community Infaq Board</h2>
            </div>
        </div>
        
        {fetchError && (
          <div className="mb-8 bg-red-100 border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
              <div className="flex items-center font-bold text-red-600 text-lg mb-2">
                  <AlertTriangle className="h-6 w-6 mr-2" />
                  Error Loading Infaq Board
              </div>
              <p className="mb-2 font-medium">There was a problem fetching data.</p>
              <pre className="whitespace-pre-wrap bg-white border-2 border-red-200 p-2 font-mono text-xs">
                  {fetchError}
              </pre>
          </div>
        )}

        <p className="text-xl text-center text-black font-medium mb-10 max-w-3xl mx-auto">
            See which mosques have Infaq deliveries scheduled or slots open for contributions. 
        </p>
        {!fetchError && infaqNoticeBoardSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {infaqNoticeBoardSlots.map((slot) => (
                    <InfaqNoticeCard key={slot.id} slot={slot} />
                ))}
            </div>
        ) : (
          !fetchError && (
            <div className="text-center py-16 bg-white border-4 border-black border-dashed">
                <p className="text-2xl font-display font-black uppercase text-gray-400">
                    Board Empty
                </p>
                <p className="text-lg font-medium text-gray-500 mt-2">Check back soon or be the first to start an Infaq!</p>
            </div>
          )
        )}
      </div>

    </div>
  );
}
