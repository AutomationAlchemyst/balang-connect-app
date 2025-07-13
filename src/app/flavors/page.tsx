
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionTitle from '@/components/ui/SectionTitle';
import FlavorCard from '@/components/features/flavors/FlavorCard';
import { mockFlavors } from '@/lib/data';
// import type { Metadata } from 'next'; // Metadata should be in a layout or server component
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// export const metadata: Metadata = {
//   title: 'Our Balang Flavors - BalangConnect',
//   description: 'Explore a wide variety of delicious and refreshing balang flavors offered by BalangConnect.',
// };

export default function FlavorsPage() {
  const [selectedFlavorIds, setSelectedFlavorIds] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleFlavorSelection = (flavorId: string) => {
    setSelectedFlavorIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(flavorId)) {
        return prevSelectedIds.filter((id) => id !== flavorId);
      } else {
        return [...prevSelectedIds, flavorId];
      }
    });
  };

  const handleProceedToEventBuilder = () => {
    if (selectedFlavorIds.length === 0) {
      toast({
        title: 'No Flavors Selected',
        description: 'Please select at least one flavor to proceed.',
        variant: 'destructive',
      });
      return;
    }
    const queryParams = new URLSearchParams();
    queryParams.append('defaultPackageId', 'pkg_opt1');
    queryParams.append('addFlavorIds', selectedFlavorIds.join(','));
    router.push(`/event-builder?${queryParams.toString()}`);
  };

  const canProceed = selectedFlavorIds.length > 0;

  return (
    <div className="space-y-8">
      <SectionTitle>Our Delicious Balang Flavors</SectionTitle>
      <p className="text-lg text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Select your favorite flavors below. Once you're ready, proceed to build your event package.
      </p>
      
      {selectedFlavorIds.length > 0 && (
        <div className="sticky top-20 z-40 bg-background/90 backdrop-blur-sm p-4 rounded-lg shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-md font-semibold text-primary">
            {selectedFlavorIds.length} flavor(s) selected.
          </p>
          <Button 
            onClick={handleProceedToEventBuilder} 
            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
            disabled={!canProceed}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Proceed to Event Builder
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockFlavors.map((flavor) => (
          <FlavorCard 
            key={flavor.id} 
            flavor={flavor}
            isSelected={selectedFlavorIds.includes(flavor.id)}
            onToggleSelect={handleToggleFlavorSelection}
          />
        ))}
      </div>

      {/* Fallback button if no selections yet, or for users who scroll past the sticky one */}
      {/* This button will now also be disabled if no flavors are selected */}
      <div className="mt-12 text-center">
          <Button 
            onClick={handleProceedToEventBuilder} 
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={!canProceed}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {canProceed ? 'Proceed to Event Builder' : 'Select Flavors to Proceed'}
          </Button>
          {!canProceed && (
            <p className="text-sm text-muted-foreground mt-2">Select flavors above to get started.</p>
          )}
      </div>
    </div>
  );
}
