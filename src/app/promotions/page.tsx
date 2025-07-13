import SectionTitle from '@/components/ui/SectionTitle';
import PromotionCard from '@/components/features/promotions/PromotionCard';
import { mockPromotions } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promotions & Lucky Draws - BalangConnect',
  description: 'Check out our latest promotions, discounts, and lucky draw events. Don\'t miss out on exciting offers!',
};

export default function PromotionsPage() {
  return (
    <div className="space-y-8">
      <SectionTitle>Current Promotions & Lucky Draws</SectionTitle>
      <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Stay updated with our exciting offers and chances to win! BalangConnect loves to give back to our valued customers.
      </p>
      {mockPromotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockPromotions.map((promo) => (
            <PromotionCard key={promo.id} promotion={promo} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-xl py-10">
          No active promotions at the moment. Check back soon!
        </p>
      )}
    </div>
  );
}
