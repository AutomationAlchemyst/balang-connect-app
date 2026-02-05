
import PromotionCard from '@/components/features/promotions/PromotionCard';
import { mockPromotions } from '@/lib/data';
import type { Metadata } from 'next';
import { Sparkles, Waves, Bolt, Star } from 'lucide-react';
import Image from 'next/image';
import { CountdownTimer } from '@/components/ui/countdown-timer';

export const metadata: Metadata = {
  title: 'Promotions & Lucky Draws - Balang Kepalang',
  description: 'Check out our latest promotions, discounts, and lucky draw events. Don\'t miss out on exciting offers!',
};

export default function PromotionsPage() {
  const luckyDraws = mockPromotions.filter(p => p.id.includes('draw'));
  const exclusiveOffers = mockPromotions.filter(p => p.id.includes('exclusive'));
  const flashDeals = mockPromotions.filter(p => p.id.includes('flash'));

  return (
    <div className="relative min-h-screen bg-[#f8f7f5] dark:bg-[#221910] selection:bg-orange-500/20 selection:text-orange-900 pb-32">

      {/* Header Section with Beach Hero */}
      <section className="relative w-full pt-28 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-[2.5rem] min-h-[300px] md:min-h-[400px] group shadow-2xl border border-white/20">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALPGK7qYg0dcxZy6SOFWeKSqfGnOiiecLGNqAxLHg2F6ftiP3USgwrdXQatT8hOR1ruScqT5jxD3mVOr8O1_PZ5u_imTbMoaiYWGFMisQYxY4UXMrL1b-UnsQ-yswFyjFRH9dB91U36MQP39kNDYF-jURpPaUdfhEA89J6cKpjWdgjTJz3Vid-Z1F166X3qR344ryeLXS5CWZWMea6oVm6biqe_GuR67k35y5yPIAv6Zm29ZH23VnewoIwFynmku59IPmtZ8yOZJ0"
              alt="Promotions Hero"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

            <div className="relative p-6 md:p-12 space-y-4">
              <span className="bg-orange-500 text-white text-[10px] md:text-sm font-black px-4 py-1.5 rounded-full uppercase tracking-[0.3em] mb-2 inline-block shadow-lg">Summer Special</span>
              <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic">
                Surfers Paradise <br />
                <span className="text-orange-400">Catering Deals</span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl font-bold max-w-xl">
                Experience the iced cold air balang revolution with our exclusive seasonal rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 mt-12 md:mt-20 max-w-7xl space-y-16 md:space-y-24">

        {/* Lucky Draws Section */}
        {luckyDraws.length > 0 && (
          <section className="space-y-8">
            <div className="flex justify-between items-end px-2">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-500/10 px-3 py-1 rounded-full mb-2">
                  <Star size={14} className="text-orange-500 fill-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Premium Rewards</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Featured Draws</h2>
              </div>
              <span className="text-orange-500 font-black uppercase tracking-[0.2em] text-[10px] cursor-pointer hover:underline mb-2">View All</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {luckyDraws.map(promo => (
                <PromotionCard key={promo.id} promotion={promo} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* Exclusive Offers Section */}
        {exclusiveOffers.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3 px-2">
              <Waves className="text-teal-600 h-8 w-8 md:h-12 md:w-12" strokeWidth={3} />
              Exclusive Offers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {exclusiveOffers.map(promo => (
                <PromotionCard key={promo.id} promotion={promo} variant="exclusive" />
              ))}
            </div>
          </section>
        )}

        {/* Flash Deals Section */}
        {flashDeals.length > 0 && (
          <section className="space-y-8 px-2">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <Bolt className="text-orange-500 fill-orange-500 h-8 w-8 md:h-12 md:w-12 animate-pulse" />
                Flash Deals
              </h2>

              {/* Flash Sale Timer Bar */}
              <div className="bg-white dark:bg-[#2d2218] p-8 md:p-10 rounded-[2rem] shadow-2xl border border-orange-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="space-y-2">
                    <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em]">Hurry! Ending Soon</p>
                    <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Weekend Refresh</h3>
                  </div>
                  <div className="max-w-md w-full">
                    <CountdownTimer targetDate="2025-07-06T20:00:00.000Z" variant="flash" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {flashDeals.map(promo => (
                  <PromotionCard key={promo.id} promotion={promo} variant="flash" />
                ))}
              </div>
            </div>
          </section>
        )}

        {mockPromotions.length === 0 && (
          <div className="bg-white/50 backdrop-blur-xl p-20 text-center max-w-2xl mx-auto rounded-[3rem] border border-white shadow-2xl">
            <div className="bg-orange-500/10 p-8 rounded-full inline-block mb-8">
              <Sparkles className="h-12 w-12 text-orange-500" />
            </div>
            <p className="text-3xl font-black uppercase text-slate-900 tracking-tighter py-2">
              No active promos <span className="italic text-teal-600">Right Now</span>
            </p>
            <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Check back soon for new coastal surprises!</p>
          </div>
        )}
      </div>
    </div>
  );
}