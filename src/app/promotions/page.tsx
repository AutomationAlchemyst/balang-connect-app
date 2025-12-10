import SectionTitle from '@/components/ui/SectionTitle';
import PromotionCard from '@/components/features/promotions/PromotionCard';
import { mockPromotions } from '@/lib/data';
import type { Metadata } from 'next';
import { Tag } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Promotions & Lucky Draws - BalangConnect',
  description: 'Check out our latest promotions, discounts, and lucky draw events. Don\'t miss out on exciting offers!',
};

export default function PromotionsPage() {
  return (
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24">
      <div className="container mx-auto px-4 space-y-12">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-8">
           <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-2">
              <Tag size={14} /> Special Offers
           </div>
           <h1 className="text-coast-heading text-5xl md:text-7xl drop-shadow-sm text-brand-blue">
             Promos & <span className="text-brand-cyan">Draws</span>
           </h1>
           <p className="text-xl text-brand-blue/70 font-medium leading-relaxed">
             Exciting offers and chances to win! BalangConnect loves to give back to our valued customers.
           </p>
        </div>

        {mockPromotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {mockPromotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        ) : (
          <div className="glass-panel-wet p-12 text-center max-w-2xl mx-auto border-dashed border-2 border-brand-blue/20">
             <p className="text-2xl font-display font-bold uppercase text-brand-blue/40">
                No active promos right now
             </p>
             <p className="text-brand-blue/50 font-medium mt-2">Check back soon for new treats!</p>
          </div>
        )}
      </div>
    </div>
  );
}