import Image from 'next/image';
import type { EventPackage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PackageCardProps {
  eventPackage: EventPackage;
}

export default function PackageCard({ eventPackage }: PackageCardProps) {
  return (
    <Card className="flex flex-col md:flex-row border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000] bg-white transition-transform hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#000000] overflow-hidden">
      <div className="md:w-1/3 h-64 md:h-auto border-b-4 md:border-b-0 md:border-r-4 border-black relative">
        <Image
          src={eventPackage.imageUrl}
          alt={eventPackage.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
          data-ai-hint={eventPackage.dataAiHint || "event celebration"}
        />
        <div className="absolute top-4 left-4 bg-brand-yellow border-2 border-black px-3 py-1 font-display font-bold uppercase shadow-[4px_4px_0px_0px_#000000]">
           {eventPackage.isAllInclusive ? "All-Inclusive" : "Best Value"}
        </div>
      </div>
      <div className="md:w-2/3 flex flex-col p-6 bg-[#FFFDF5]">
        <CardHeader className="p-0 mb-4">
          <div className="flex justify-between items-start">
             <div>
                <CardTitle className="font-display font-black text-3xl uppercase mb-2">{eventPackage.name}</CardTitle>
                <CardDescription className="text-black font-medium text-lg">{eventPackage.description}</CardDescription>
             </div>
             <div className="hidden md:block">
                <span className="font-mono font-black text-2xl bg-brand-cyan px-2 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#000000] transform rotate-2 inline-block">
                    ${eventPackage.price.toFixed(2)}
                </span>
             </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow p-0 space-y-4">
          {eventPackage.pax && (
            <p className="text-sm font-bold uppercase flex items-center bg-black text-white px-2 py-1 inline-block">
              <Users size={16} className="mr-2" /> Suitable for {eventPackage.pax} pax
            </p>
          )}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium">
            {eventPackage.includedItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={18} className="mr-2 mt-0.5 text-black shrink-0 fill-brand-green" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
           <div className="md:hidden mt-4">
                <span className="font-mono font-black text-2xl bg-brand-cyan px-2 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#000000] inline-block">
                    ${eventPackage.price.toFixed(2)}
                </span>
             </div>
        </CardContent>
        <CardFooter className="p-0 mt-6 pt-6 border-t-2 border-dashed border-black">
          <Button asChild className="w-full md:w-auto font-display font-bold uppercase bg-black text-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#888] hover:bg-brand-yellow hover:text-black hover:shadow-[4px_4px_0px_0px_#000000] transition-all h-12 text-lg">
            <Link href={`/event-builder?defaultPackageId=${eventPackage.id}`}>
                Customize & Book <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}