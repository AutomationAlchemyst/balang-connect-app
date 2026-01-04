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
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-20">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 space-y-12">

        <div className="text-center space-y-6 max-w-4xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm transition-transform duration-700 hover:rotate-2">
            <Tag size={14} className="text-teal-500" strokeWidth={3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">Special Offers</span>
          </div>

          <h1 className="font-black text-5xl md:text-7xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Promos & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">Draws</span>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
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
          <div className="glass-panel-static p-12 text-center max-w-2xl mx-auto bg-white/60">
            <p className="text-2xl font-black uppercase text-slate-300 tracking-widest">
              No active promos right now
            </p>
            <p className="text-slate-400 font-medium mt-2">Check back soon for new treats!</p>
          </div>
        )}
      </div>
    </div>
  );
}