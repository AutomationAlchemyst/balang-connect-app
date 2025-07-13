
import Image from 'next/image';
import type { EventPackage } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface PackageCardProps {
  eventPackage: EventPackage;
}

export default function PackageCard({ eventPackage }: PackageCardProps) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
      <div className="md:w-1/3 h-64 md:h-auto">
        <Image
          src={eventPackage.imageUrl}
          alt={eventPackage.name}
          width={400}
          height={400}
          className="w-full h-full object-cover"
          data-ai-hint={eventPackage.dataAiHint || "event celebration"}
        />
      </div>
      <div className="md:w-2/3 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="font-headline text-2xl text-primary">{eventPackage.name}</CardTitle>
          <CardDescription className="text-sm">{eventPackage.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 pt-2">
          {eventPackage.pax && (
            <p className="text-sm text-muted-foreground flex items-center">
              <Users size={16} className="mr-2 text-primary" /> Suitable for {eventPackage.pax} pax
            </p>
          )}
          <ul className="space-y-1 text-sm">
            {eventPackage.includedItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={16} className="mr-2 mt-1 text-green-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-2xl font-semibold text-accent pt-2">
            ${eventPackage.price.toFixed(2)}
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href={`/event-builder?defaultPackageId=${eventPackage.id}`}>Customize & Book</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}
