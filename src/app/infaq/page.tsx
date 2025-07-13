
import SectionTitle from '@/components/ui/SectionTitle';
import InfaqForm from '@/components/features/infaq/InfaqForm';
import SponsorDeliveryForm from '@/components/features/infaq/SponsorDeliveryForm';
import InfaqNoticeCard from '@/components/features/infaq/InfaqNoticeCard';
import { getInfaqSlots } from './actions';
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { HeartHandshake, Info, Gift, ScrollText, AlertTriangle, DollarSign, Users, Sparkles } from 'lucide-react';
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
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-32 rounded-md" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-24 w-full rounded-md" />
      <Skeleton className="h-12 w-full rounded-md" />
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
    <div className="space-y-12">
      <SectionTitle>Infaq Balang: Share the Blessings</SectionTitle>
      
      <Alert variant="default" className="bg-primary/10 border-primary/30">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="text-primary font-semibold">How Your Infaq & Sponsorship Works</AlertTitle>
        <AlertDescription>
          <div className="space-y-4 pt-2 text-foreground/90">
              <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                      <p>Each Infaq Balang is <strong>$95.00</strong>. A separate <strong>$25.00</strong> delivery fee applies for each unique delivery slot (mosque + date).</p>
                  </div>
              </div>
              <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                      <p><strong>Sharing is Caring!</strong> When multiple donors contribute to the same slot, the $25 delivery fee is shared. We may contact initial donors for a partial refund if others join in.</p>
                  </div>
              </div>
              <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                      <p><strong>Pro-Tip:</strong> Check the <strong>Community Infaq Board</strong> below before donating. You might find a slot where delivery is already sponsored or being shared!</p>
                  </div>
              </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-primary flex items-center">
                <Gift className="mr-2 h-7 w-7" />
                Order Infaq Balang(s)
              </CardTitle>
              <CardDescription>
                Your generous Infaq will help us provide refreshing balang drinks to your chosen mosque. Every drop counts towards spreading joy and kindness. Please fill in the details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FormSkeleton />}>
                <InfaqForm />
              </Suspense>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-500 border-2">
            <CardHeader>
              <CardTitle className="font-headline text-green-600 flex items-center">
                <HeartHandshake className="mr-2 h-7 w-7" />
                Sponsor a Jumaat Delivery
              </CardTitle>
              <CardDescription>
                Can't order a balang right now? You can still contribute by sponsoring the $25 delivery fee for a Jumaat delivery. This helps us get Infaq balangs to a mosque in need within the community!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<FormSkeleton />}>
                <SponsorDeliveryForm />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:sticky md:top-24"> 
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Community receiving Infaq Balang" 
                width={600} 
                height={400} 
                className="rounded-t-lg object-cover"
                data-ai-hint="charity event" 
              />
            </CardContent>
            <CardHeader>
               <CardTitle className="font-headline text-xl text-accent">How Your Contributions Help</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provides cool refreshments during prayers and community gatherings at mosques.</li>
                <li>Supports various religious events and functions.</li>
                <li>Brings smiles and relief, especially during warm weather.</li>
                <li>Fosters a spirit of giving, unity, and togetherness within the community.</li>
                <li>Sponsoring delivery ensures that balangs ordered by others can reach their destination without added cost to the recipients.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-12" />

      <div>
        <SectionTitle className="flex items-center mb-8">
            <ScrollText className="mr-3 h-8 w-8 text-primary" /> Community Infaq Board
        </SectionTitle>
        
        {fetchError && (
          <Alert variant="destructive" className="mb-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Loading Infaq Board</AlertTitle>
              <AlertDescription>
                  <p className="mb-2">There was a problem fetching data from the database. This usually indicates a project configuration issue.</p>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-destructive/10 p-4 font-mono text-xs text-destructive-foreground">
                      {fetchError}
                  </pre>
              </AlertDescription>
          </Alert>
        )}

        <p className="text-lg text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
            See which mosques have Infaq deliveries scheduled or slots open for contributions. 
            This board is updated periodically. For the latest information, please contact us.
        </p>
        {!fetchError && infaqNoticeBoardSlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {infaqNoticeBoardSlots.map((slot) => (
                    <InfaqNoticeCard key={slot.id} slot={slot} />
                ))}
            </div>
        ) : (
          !fetchError && (
            <p className="text-center text-muted-foreground text-xl py-10">
                The Infaq Board is currently empty. Check back soon or be the first to start an Infaq!
            </p>
          )
        )}
      </div>

    </div>
  );
}
