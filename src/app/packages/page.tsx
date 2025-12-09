import SectionTitle from '@/components/ui/SectionTitle';
import PackageCard from '@/components/features/packages/PackageCard';
import { mockPackages } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Event Packages - BalangConnect',
  description: 'Browse our specially curated event packages for weddings, birthdays, corporate events, and more.',
};

export default function PackagesPage() {
  return (
    <div className="space-y-12 pb-12">
      <SectionTitle>Event Packages</SectionTitle>
      <p className="text-xl text-center font-medium text-black mb-12 max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
        Choose from our thoughtfully designed packages or build your own! We cater to all types of events, ensuring a memorable experience for you and your guests.
      </p>
      <div className="grid grid-cols-1 gap-12"> 
        {mockPackages.map((pkg) => (
          <PackageCard key={pkg.id} eventPackage={pkg} />
        ))}
      </div>
    </div>
  );
}