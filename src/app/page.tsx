'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { mockFlavors, mockPackages, mockCommunityStories } from '@/lib/data';
import { ArrowRight, Zap, Sparkles, Droplets, PartyPopper, Star } from 'lucide-react';
import { format } from 'date-fns';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { LiquidText } from '@/components/ui/liquid-text';
import { cn } from '@/lib/utils';

// THEME CONSTANTS - Matching Corporate Orders Page
const PRIMARY_GRADIENT = "bg-gradient-to-r from-teal-600 to-emerald-500";
const TEXT_GRADIENT = "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600";
// REMOVED local constants in favor of globals.css classes: GLASS_PANEL, BUTTON_PRIMARY

export default function Home() {
   const featuredFlavor = mockFlavors[0];
   const featuredPackage = mockPackages[0];
   const featuredStory = mockCommunityStories[0];

   return (
      <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900">

         {/* Background Decor - Matches "Liquid Paradise" Reference */}
         <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
            <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
         </div>

         {/* 
        ========================================
        HERO SECTION
        ========================================
      */}
         <section className="relative min-h-[95vh] flex items-center justify-center pt-20">
            <div className="container mx-auto px-4 relative z-10 text-center space-y-8">

               <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-sm border border-white/60 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <span className="flex h-2 w-2 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span className="font-bold text-xs uppercase tracking-[0.2em] text-teal-800">Singapore's First Air Balang</span>
               </div>

               <h1 className="font-black text-6xl md:text-8xl lg:text-[10rem] uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                  Balang <br />
                  <span className={TEXT_GRADIENT}>
                     Kepalang
                  </span>
               </h1>

               <p className="font-medium text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both delay-200">
                  Experience the ultimate hydration. Premium, hand-crafted beverages bottled with the energy of the <span className="text-teal-600 font-bold">Golden Hour</span>.
               </p>

               <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 fill-mode-both delay-300">
                  <MagneticButton className={cn("h-14 px-8 text-lg w-full sm:w-auto btn-coast-primary")}>
                     <Link href="/event-builder" className="flex items-center justify-center">
                        Start Building <Zap className="ml-2 w-5 h-5 fill-current" />
                     </Link>
                  </MagneticButton>

                  <Link href="/flavors" className="group flex items-center justify-center gap-2 px-8 h-14 rounded-xl font-bold uppercase tracking-wider text-teal-700 hover:bg-teal-50 transition-all w-full sm:w-auto">
                     <span>Explore Menu</span>
                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

            {/* Hero Image / Visual Element could go here, replacing with abstract gradient for now */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
         </section>

         {/* 
        ========================================
        FEATURED SECTIONS
        ========================================
      */}
         <div className="container mx-auto px-4 py-24 space-y-32 relative z-10">

            {/* Section 1: Featured Flavor */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div className="order-2 lg:order-1 relative group perspective-1000">
                  <div className="absolute inset-4 bg-teal-200/30 rounded-[3rem] blur-3xl group-hover:blur-4xl transition-all duration-700 -rotate-3"></div>
                  <div className={cn("glass-panel-wet relative overflow-hidden aspect-[4/5] p-2 rotate-2 transition-transform duration-700 group-hover:rotate-0")}>
                     <div className="relative h-full w-full rounded-[2rem] overflow-hidden">
                        <Image
                           src={featuredFlavor.imageUrl}
                           alt={featuredFlavor.name}
                           fill
                           className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-transparent to-transparent opacity-90"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                           <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-4 inline-block">
                              Signature Series
                           </span>
                           <h3 className="font-black text-4xl md:text-5xl uppercase leading-tight">{featuredFlavor.name}</h3>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="order-1 lg:order-2 space-y-8">
                  <div className="space-y-2">
                     <span className="text-teal-600 font-bold uppercase tracking-widest text-xs">Taste The Difference</span>
                     <h2 className="text-5xl md:text-7xl font-black uppercase text-slate-900 tracking-tight leading-none">
                        Liquid <br /> <span className={TEXT_GRADIENT}>Paradise</span>
                     </h2>
                  </div>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-lg">
                     Hand-crafted for the ultimate vibe. Each Balang is a masterpiece, layered with fresh fruits, premium ingredients, and served ice-cold.
                  </p>

                  <div className="grid grid-cols-1 gap-4 pt-4">
                     {[featuredFlavor.name, "Lychee Fizz", "Mango Sunset"].map((flavor, i) => (
                        <Link href="/flavors" key={flavor} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/60 hover:shadow-lg transition-all duration-300 group border border-transparent hover:border-white/60">
                           <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                              <Droplets size={20} strokeWidth={3} />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-bold text-lg text-slate-800 uppercase group-hover:text-teal-700 transition-colors">{flavor}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Stock</span>
                           </div>
                           <ArrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-teal-600 transform group-hover:translate-x-1 transition-all" />
                        </Link>
                     ))}
                  </div>
               </div>
            </section>

            {/* Section 2: Packages */}
            <section className="relative">
               <div className="text-center mb-16 space-y-4">
                  <span className="text-teal-600 font-bold uppercase tracking-[0.2em] text-xs">For Any Occasion</span>
                  <h2 className="text-5xl md:text-7xl font-black uppercase text-slate-900 tracking-tight">Curated Service</h2>
                  <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
                     Elevate your corporate event or wedding with our premium hydration stations.
                  </p>
               </div>

               <div className={cn("glass-panel-static p-3 max-w-6xl mx-auto backdrop-blur-2xl")}>
                  <div className="bg-white/50 rounded-[2rem] overflow-hidden border border-white/50">
                     <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-16 flex flex-col justify-center space-y-8">
                           <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-1.5 rounded-full text-xs uppercase tracking-widest self-start">
                              <PartyPopper size={14} /> Most Popular
                           </div>

                           <div>
                              <h3 className="font-black text-4xl md:text-5xl uppercase text-slate-900 leading-none mb-4">
                                 {featuredPackage.name}
                              </h3>
                              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                 {featuredPackage.description}
                              </p>
                           </div>

                           <div className="flex items-center gap-8 py-4 border-y border-dashed border-slate-200">
                              <div>
                                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Starting At</span>
                                 <span className="font-black text-4xl text-teal-700">${featuredPackage.price}</span>
                              </div>
                              <div className="h-10 w-px bg-slate-200"></div>
                              <div>
                                 <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Capacity</span>
                                 <span className="font-bold text-xl text-slate-800 uppercase">{featuredPackage.pax} Pax</span>
                              </div>
                           </div>

                           <Button asChild className={cn("h-14 w-fit px-8 text-lg", "btn-coast-primary")}>
                              <Link href="/event-builder">
                                 Book This Package <ArrowRight className="ml-2 w-5 h-5" />
                              </Link>
                           </Button>
                        </div>

                        <div className="relative min-h-[400px] md:min-h-full m-2 rounded-[1.5rem] overflow-hidden shadow-inner">
                           <Image
                              src={featuredPackage.imageUrl}
                              alt={featuredPackage.name}
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-1000"
                           />
                           <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/20 to-transparent"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Section 3: Community */}
            <section className="relative py-20 px-4 text-center">
               <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                  <div className="space-y-4">
                     <Sparkles className="w-12 h-12 text-teal-400 mx-auto" />
                     <h2 className="text-slate-900 text-5xl md:text-7xl font-black uppercase tracking-tight">The Community</h2>
                  </div>

                  <div className={cn("glass-panel-static p-10 md:p-16 hover:shadow-[0_20px_50px_rgb(0,0,0,0.06)] transition-shadow duration-500")}>
                     <div className="flex flex-col items-center">
                        <div className="mb-8 relative">
                           <div className="absolute -inset-2 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-lg opacity-50"></div>
                           <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10">
                              <Image
                                 src={featuredStory.avatarUrl || "https://placehold.co/100x100.png"}
                                 alt="Avatar"
                                 width={100}
                                 height={100}
                                 className="object-cover"
                              />
                           </div>
                        </div>

                        <blockquote className="font-bold text-2xl md:text-4xl text-slate-800 leading-tight mb-8 max-w-2xl">
                           "{featuredStory.story}"
                        </blockquote>

                        <cite className="not-italic flex flex-col items-center gap-1">
                           <span className="font-black text-lg text-teal-700 uppercase">{featuredStory.userName}</span>
                           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(new Date(featuredStory.date), 'MMMM yyyy')}</span>
                        </cite>
                     </div>
                  </div>

                  <Link href="/community" className="inline-flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest hover:text-teal-600 transition-colors group">
                     Read More Stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </section>

         </div>

         {/* Footer Spacer */}
         <div className="h-20"></div>
      </div>
   );
}