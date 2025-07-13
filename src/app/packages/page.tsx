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
    <div className="space-y-8">
      <SectionTitle>Event Packages for Every Occasion</SectionTitle>
      <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Choose from our thoughtfully designed packages or build your own! We cater to all types of events, ensuring a memorable experience for you and your guests.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8"> {/* Changed lg:grid-cols-1 for better display of wider cards */}
        {mockPackages.map((pkg) => (
          <PackageCard key={pkg.id} eventPackage={pkg} />
        ))}
      </div>
    </div>
  );
}
