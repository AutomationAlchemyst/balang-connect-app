'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FlavorCard from '@/components/features/flavors/FlavorCard';
import { mockFlavors } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, Waves } from 'lucide-react';
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
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24">
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Hero / Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
           <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-2">
              <Waves size={14} /> Premium Selection
           </div>
           <h1 className="text-coast-heading text-5xl md:text-7xl drop-shadow-sm text-brand-blue">
             Our <span className="text-brand-cyan">Flavors</span>
           </h1>
           <p className="text-xl text-brand-blue/70 font-medium leading-relaxed">
             Hand-crafted, ice-blended perfection. Select your favorites below to kickstart your event package.
           </p>
        </div>
        
        {/* Sticky Selection Bar */}
        <div className={`sticky top-24 z-40 transition-all duration-500 ease-in-out transform ${canProceed ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
          <div className="glass-panel-wet p-4 rounded-full flex flex-col sm:flex-row justify-between items-center gap-4 max-w-2xl mx-auto border-brand-cyan/30 shadow-2xl">
            <div className="flex items-center gap-3 px-4">
               <div className="bg-brand-cyan text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {selectedFlavorIds.length}
               </div>
               <span className="font-bold text-brand-blue uppercase text-sm tracking-wide">Flavors Selected</span>
            </div>
            <Button 
              onClick={handleProceedToEventBuilder} 
              className="btn-coast-primary h-10 px-6 rounded-full text-sm w-full sm:w-auto shadow-lg"
              disabled={!canProceed}
            >
              Build Event <ArrowRight className="ml-2 h-4 w-4" strokeWidth={3} />
            </Button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockFlavors.map((flavor) => (
            <FlavorCard 
              key={flavor.id} 
              flavor={flavor}
              isSelected={selectedFlavorIds.includes(flavor.id)}
              onToggleSelect={handleToggleFlavorSelection}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center space-y-6">
            <p className="text-brand-blue/40 font-bold uppercase text-xs tracking-widest">Ready to chill?</p>
            <Button 
              onClick={handleProceedToEventBuilder} 
              size="lg"
              className={`h-16 px-10 text-xl rounded-full transition-all duration-300 ${
                canProceed 
                ? 'btn-coast-primary shadow-xl hover:shadow-2xl hover:-translate-y-1' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!canProceed}
            >
              <ShoppingCart className="mr-2 h-5 w-5" strokeWidth={2.5} />
              {canProceed ? 'Start Building Package' : 'Select Flavors First'}
            </Button>
        </div>

      </div>
    </div>
  );
}
