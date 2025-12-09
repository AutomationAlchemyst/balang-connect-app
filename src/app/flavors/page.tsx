'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SectionTitle from '@/components/ui/SectionTitle';
import FlavorCard from '@/components/features/flavors/FlavorCard';
import { mockFlavors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    <div className="space-y-12 pb-12">
      <SectionTitle>Our Delicious Flavors</SectionTitle>
      <p className="text-xl text-center font-medium text-black mb-12 max-w-2xl mx-auto bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
        Select your favorite flavors below. Once you're ready, proceed to build your event package.
      </p>
      
      {selectedFlavorIds.length > 0 && (
        <div className="sticky top-20 z-40 bg-brand-cyan border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000000] mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 animate-in slide-in-from-top-4">
          <p className="text-lg font-black uppercase text-black">
            {selectedFlavorIds.length} flavor(s) selected
          </p>
          <Button 
            onClick={handleProceedToEventBuilder} 
            className="font-display font-bold uppercase bg-brand-yellow text-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] w-full sm:w-auto transition-all"
            disabled={!canProceed}
          >
            <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={2.5} />
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

      <div className="mt-16 text-center">
          <Button 
            onClick={handleProceedToEventBuilder} 
            size="lg"
            className={`font-display font-bold uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] h-16 px-8 text-xl transition-all ${canProceed ? 'bg-brand-green text-white hover:bg-[#329A00]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!canProceed}
          >
            <ShoppingCart className="mr-2 h-6 w-6" strokeWidth={2.5} />
            {canProceed ? 'Proceed to Event Builder' : 'Select Flavors to Proceed'}
          </Button>
          {!canProceed && (
            <p className="text-base font-bold uppercase mt-4 text-black bg-white border-2 border-black inline-block px-2">Select flavors above to get started</p>
          )}
      </div>
    </div>
  );
}