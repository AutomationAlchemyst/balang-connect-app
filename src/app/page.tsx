
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import SectionTitle from '@/components/ui/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockFlavors, mockPackages, mockCommunityStories } from '@/lib/data';
import { ArrowRight, CupSoda, Gift, Users, Star, Sparkles, Zap, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

// Refined Maximalist Styles - Professional Grade
const GRID_BG = "bg-brand-yellow bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:40px_40px]";
const CARD_STYLE = "bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] rounded-none transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000000]";
const BTN_PRIMARY = "bg-black text-white hover:bg-brand-blue hover:text-white border-2 border-black rounded-none h-14 px-8 text-lg font-display uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";
const BTN_SECONDARY = "bg-white text-black hover:bg-brand-cyan border-2 border-black rounded-none h-14 px-8 text-lg font-display uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none";

const MarqueeItem = ({ text, outline = false }: { text: string, outline?: boolean }) => (
  <span className={`mx-4 text-4xl md:text-6xl font-black uppercase tracking-tighter ${outline ? 'text-transparent text-stroke-2 text-stroke-black' : 'text-black'}`}>
    {text}
  </span>
);

export default function Home() {
  const featuredFlavor = mockFlavors[0];
  const featuredPackage = mockPackages[0];
  const featuredStory = mockCommunityStories[0];

  return (
    <div className="min-h-screen bg-white">
      {/* 
        ========================================
        HERO SECTION - PROFESSIONAL MAXIMALIST
        ========================================
      */}
      <section className={`relative border-b-4 border-black overflow-hidden flex flex-col ${GRID_BG}`}>
        
        {/* Top Marquee - Infinite Scroll */}
        <div className="w-full bg-brand-cyan border-b-4 border-black py-3 overflow-hidden whitespace-nowrap flex relative z-20">
          <div className="animate-marquee flex items-center">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 font-condensed font-bold uppercase text-lg tracking-widest flex items-center gap-2">
                <Zap size={16} fill="black" /> Singapore's First Ice Blended Air Balang
              </span>
            ))}
          </div>
          <div className="animate-marquee flex items-center absolute top-3 left-0">
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4 font-condensed font-bold uppercase text-lg tracking-widest flex items-center gap-2">
                <Zap size={16} fill="black" /> Singapore's First Ice Blended Air Balang
              </span>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-20 relative z-10 flex flex-col md:flex-row gap-12 items-center min-h-[80vh]">
          
          {/* Left Column: Typography & Action */}
          <div className="w-full md:w-3/5 space-y-8 relative">
            <div className="inline-flex items-center gap-2 bg-black text-brand-green px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_#fff]">
              <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
              <span className="font-mono text-sm font-bold uppercase tracking-widest">Est. 2024 Singapore</span>
            </div>

            <h1 className="font-display font-black uppercase text-7xl md:text-8xl lg:text-[9rem] leading-[0.8] tracking-tighter text-black mix-blend-hard-light relative z-10">
              Balang<br/>
              <span className="text-white text-stroke-3 text-stroke-black">Kepalang</span>
            </h1>

            <div className="max-w-xl bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000]">
              <p className="font-body text-xl md:text-2xl font-bold leading-tight">
                The revolution is iced. We blend tradition with a brutal chill. Get your <span className="text-brand-blue underline decoration-4 decoration-brand-yellow underline-offset-4">#BlendedBalang</span> fix now.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild className={BTN_PRIMARY}>
                <Link href="/event-builder">
                  Book Now <ArrowUpRight className="ml-2" />
                </Link>
              </Button>
              <Button asChild className={BTN_SECONDARY}>
                <Link href="/flavors">
                  View Menu <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Visual Features (Placeholder "Cards") */}
          <div className="w-full md:w-2/5 relative h-full min-h-[400px] flex items-center justify-center">
             
             {/* Card 1: Top Right Floating */}
             <div className="absolute top-0 right-0 md:right-[-20px] bg-brand-purple border-4 border-black p-4 w-64 shadow-[8px_8px_0px_0px_#000000] rotate-3 z-10 transition-transform hover:rotate-0 hover:z-30 hover:scale-105 duration-300">
                <div className="bg-black text-white px-2 py-1 font-mono text-xs mb-2 flex justify-between">
                  <span>IMG_001.JPG</span>
                  <span>4.2MB</span>
                </div>
                <div className="aspect-square bg-white border-2 border-black overflow-hidden relative grayscale hover:grayscale-0 transition-all">
                   <Image src={featuredFlavor.imageUrl} alt="Flavor" fill className="object-cover" />
                </div>
                <p className="font-display font-bold uppercase text-xl mt-2 text-white leading-none">The Original<br/>Lemon Mint</p>
             </div>

             {/* Card 2: Bottom Left Floating */}
             <div className="absolute bottom-0 left-0 md:left-[-40px] bg-brand-cyan border-4 border-black p-4 w-72 shadow-[8px_8px_0px_0px_#000000] -rotate-2 z-20 transition-transform hover:rotate-0 hover:z-30 hover:scale-105 duration-300">
                <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
                   <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 border border-black"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500 border border-black"></div>
                   </div>
                   <span className="font-mono text-xs font-bold">EVENT_PKG.EXE</span>
                </div>
                <div className="bg-white border-2 border-black p-2 mb-2">
                   <p className="font-condensed font-bold text-2xl uppercase leading-none">Wedding &<br/>Corporate</p>
                   <p className="font-mono text-xs mt-1">Starting from $235</p>
                </div>
                <div className="h-2 bg-black w-full animate-pulse"></div>
             </div>

             {/* Decoration */}
             <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-black opacity-5 animate-spin-slow pointer-events-none" />

          </div>
        </div>

        {/* Bottom Marquee - Large */}
        <div className="w-full bg-black text-white py-6 overflow-hidden whitespace-nowrap flex relative border-y-4 border-black">
           <div className="animate-marquee-reverse flex items-center">
            {[...Array(6)].map((_, i) => (
              <MarqueeItem key={i} text="ICE BLENDED AIR BALANG" outline={i % 2 !== 0} />
            ))}
          </div>
           <div className="animate-marquee-reverse flex items-center absolute top-6 left-0">
            {[...Array(6)].map((_, i) => (
              <MarqueeItem key={i} text="ICE BLENDED AIR BALANG" outline={i % 2 !== 0} />
            ))}
          </div>
        </div>
      </section>

      {/* 
        ========================================
        MAIN CONTENT - STRUCTURED MAXIMALISM
        ========================================
      */}
      <div className="container mx-auto px-4 py-24 space-y-32">
        
        {/* Section 1: Featured Flavor - "The Drop" Style */}
        <section className="relative">
          <div className="absolute -top-12 left-0 z-10">
             <div className="bg-black text-brand-yellow px-6 py-3 border-4 border-transparent shadow-[8px_8px_0px_0px_#FDDD59] transform -rotate-2">
                <h2 className="font-display text-4xl font-black uppercase tracking-tighter">Taste The Drop</h2>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000000]">
             <div className="relative border-b-4 md:border-b-0 md:border-r-4 border-black min-h-[400px] group overflow-hidden">
                <Image 
                  src={featuredFlavor.imageUrl} 
                  alt={featuredFlavor.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute bottom-6 left-6 bg-white border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_#000000]">
                   <span className="font-mono text-sm font-bold">FEATURED_ITEM_01</span>
                </div>
             </div>
             <div className="p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan rounded-bl-full opacity-20 pointer-events-none"></div>
                
                <h3 className="font-display font-black text-5xl md:text-6xl uppercase leading-[0.9] mb-6">{featuredFlavor.name}</h3>
                <p className="font-body text-xl font-medium mb-8 max-w-md">{featuredFlavor.description}</p>
                
                <div className="flex gap-4">
                   <Button asChild className={`${BTN_PRIMARY} bg-brand-blue`}>
                      <Link href="/flavors">Full Menu</Link>
                   </Button>
                </div>
             </div>
          </div>
        </section>

        {/* Section 2: Packages - "Data Grid" Style */}
        <section>
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-4 border-black pb-4 gap-6">
              <h2 className="font-display text-6xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
                 Event<br/><span className="text-transparent text-stroke-2 text-stroke-black">Packages</span>
              </h2>
              <div className="max-w-xs text-right">
                 <p className="font-mono text-sm font-bold bg-brand-yellow inline-block px-2">AVAILABLE FOR BOOKING</p>
                 <p className="font-body font-bold text-lg mt-1">Curated setups for weddings, corporate events & private parties.</p>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Package Visual */}
              <div className="lg:col-span-8 bg-brand-purple border-4 border-black p-4 shadow-[8px_8px_0px_0px_#000000] relative">
                 <div className="absolute top-4 right-4 z-20">
                    <Star className="w-16 h-16 text-brand-yellow fill-brand-yellow animate-spin-slow" />
                 </div>
                 <div className="h-full bg-black border-2 border-black relative min-h-[400px]">
                    <Image src={featuredPackage.imageUrl} alt={featuredPackage.name} fill className="object-cover opacity-90" />
                    <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm border-t-4 border-black p-6">
                       <div className="flex justify-between items-end">
                          <div>
                             <h3 className="font-display font-black text-3xl uppercase">{featuredPackage.name}</h3>
                             <p className="font-mono text-sm font-bold mt-1 text-gray-600">{featuredPackage.description.substring(0, 60)}...</p>
                          </div>
                          <span className="font-display font-black text-4xl">${featuredPackage.price}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Package Details / Links */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                 <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000000] flex-1 flex flex-col justify-center items-center text-center hover:bg-brand-yellow transition-colors cursor-pointer group">
                    <Gift className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                    <h4 className="font-condensed font-bold text-2xl uppercase">View All Packages</h4>
                    <Link href="/packages" className="mt-4 font-mono text-sm underline decoration-2 underline-offset-4">Explore Catalog -></Link>
                 </div>
                 <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#888] flex-1 flex flex-col justify-center items-center text-center">
                    <h4 className="font-display font-bold text-2xl uppercase text-brand-green">Custom Events?</h4>
                    <p className="font-body text-sm mt-2 text-gray-300">We build bespoke experiences.</p>
                    <Link href="/event-builder" className="mt-4 bg-white text-black px-4 py-2 font-bold font-mono text-sm hover:bg-brand-green hover:text-white transition-colors border-2 border-transparent">
                       Start Building
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* Section 3: Community - "Zine/Editorial" Style */}
        <section className="bg-brand-yellow border-4 border-black p-8 md:p-16 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
           
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_#000000] mb-12 transform -rotate-1">
                 <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter">Community Voices</h2>
              </div>

              <div className="max-w-4xl w-full bg-white border-4 border-black p-0 shadow-[12px_12px_0px_0px_#000000] flex flex-col md:flex-row">
                 <div className="w-full md:w-2/5 border-b-4 md:border-b-0 md:border-r-4 border-black relative min-h-[300px]">
                    <Image src={featuredStory.imageUrl || "https://placehold.co/400x600.png"} alt="Community" fill className="object-cover" />
                    <div className="absolute inset-0 bg-brand-blue/20 mix-blend-multiply"></div>
                 </div>
                 <div className="w-full md:w-3/5 p-8 md:p-12 text-left flex flex-col justify-between">
                    <div>
                       <Sparkles className="w-8 h-8 mb-4 text-brand-purple" fill="currentColor" />
                       <p className="font-display font-bold text-2xl md:text-3xl uppercase leading-tight mb-6">"{featuredStory.story}"</p>
                    </div>
                    <div className="flex items-center gap-4 border-t-2 border-black pt-6">
                       <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden relative bg-gray-200">
                          <Image src={featuredStory.avatarUrl || "https://placehold.co/50x50.png"} alt="Avatar" fill className="object-cover" />
                       </div>
                       <div>
                          <p className="font-bold font-condensed uppercase text-lg">{featuredStory.userName}</p>
                          <p className="font-mono text-xs text-gray-500">{format(new Date(featuredStory.date), 'MMM yyyy')}</p>
                       </div>
                       <Link href="/community" className="ml-auto">
                          <Button variant="outline" size="icon" className="rounded-none border-2 border-black hover:bg-black hover:text-white">
                             <ArrowRight />
                          </Button>
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}
