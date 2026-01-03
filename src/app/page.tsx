import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { mockFlavors, mockPackages, mockCommunityStories } from '@/lib/data';
import { ArrowRight, Zap, Sparkles, Droplets, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { WavyBackground } from '@/components/ui/wavy-background';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { LiquidText } from '@/components/ui/liquid-text';

export default function Home() {
   const featuredFlavor = mockFlavors[0];
   const featuredPackage = mockPackages[0];
   const featuredStory = mockCommunityStories[0];

   return (
      <div className="min-h-screen -mt-20 pt-20 overflow-x-hidden bg-brand-sand/30">
         {/* 
        ========================================
        HERO SECTION - LIQUID PARADISE
        ========================================
      */}
         <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
            <WavyBackground
               className="max-w-4xl mx-auto pb-40"
               containerClassName="absolute inset-0 h-full"
               backgroundFill="transparent"
               colors={["#0ea5e9", "#06b6d4", "#fbbf24", "#00E0C6", "#FF6F61"]}
               waveOpacity={0.4}
               blur={15}
            >
               <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
                  <div className="inline-flex items-center gap-2 bg-brand-teal text-white px-6 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 rotate-1">
                     <span className="w-2 h-2 bg-brand-aqua rounded-full animate-ping"></span>
                     <span className="font-display font-black text-[10px] uppercase tracking-[0.4em]">Premium Balang Experience</span>
                  </div>

                  <h1 className="font-display font-black text-7xl md:text-9xl lg:text-[12rem] uppercase leading-[0.8] tracking-tighter text-brand-teal drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                     <LiquidText className="block">Balang</LiquidText>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua via-brand-cyan to-brand-blue">
                        Kepalang
                     </span>
                  </h1>

                  <p className="font-display text-xl md:text-2xl font-black text-brand-teal/60 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both delay-200 uppercase tracking-widest">
                     Dive into the ultimate hydration. We've bottled the energy of the <span className="text-brand-coral italic">Golden Hour</span> and served it ice-cold.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 fill-mode-both delay-300">
                     <MagneticButton className="h-16 px-12 text-xl shadow-[0_20px_50px_rgba(0,224,198,0.3)] hover:shadow-[0_20px_50px_rgba(255,111,97,0.3)]">
                        <Link href="/event-builder" className="flex items-center">
                           Catch The Vibe <Zap className="ml-2 fill-current" />
                        </Link>
                     </MagneticButton>

                     <Link href="/flavors" className="group flex items-center gap-2 font-display font-bold uppercase text-brand-teal hover:text-brand-aqua transition-all">
                        <span className="relative">
                           Explore Flavors
                           <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-aqua transition-all group-hover:w-full"></span>
                        </span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </Link>
                  </div>
               </div>
            </WavyBackground>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
               <div className="w-1 h-12 rounded-full bg-gradient-to-b from-brand-teal to-transparent"></div>
            </div>
         </section>

         {/* 
        ========================================
        FEATURED SECTIONS
        ========================================
      */}
         <div className="container mx-auto px-4 py-32 space-y-40 relative z-10">

            {/* Section 1: Featured Flavor */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div className="order-2 lg:order-1 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-brand-aqua/30 to-brand-coral/30 rounded-[4rem] blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                  <div className="relative glass-panel-wet rounded-[3.5rem] overflow-hidden aspect-[4/5] shadow-2xl border-white/40">
                     <Image
                        src={featuredFlavor.imageUrl}
                        alt={featuredFlavor.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-brand-teal/80 via-transparent to-transparent opacity-80"></div>
                     <div className="absolute bottom-10 left-10 text-white">
                        <span className="bg-brand-mango text-brand-teal font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4 inline-block shadow-lg">Our Signature</span>
                        <h3 className="font-display font-black text-5xl uppercase leading-tight">{featuredFlavor.name}</h3>
                     </div>
                  </div>
               </div>

               <div className="order-1 lg:order-2 space-y-8">
                  <div className="space-y-4">
                     <span className="text-brand-coral font-display font-bold uppercase tracking-[0.2em] text-sm">The Perfect Pour</span>
                     <h2 className="text-brand-teal text-6xl md:text-8xl leading-[0.85] font-display font-black uppercase">
                        Liquid <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua to-brand-cyan">Paradise</span>
                     </h2>
                  </div>
                  <p className="text-xl text-brand-teal/70 font-medium leading-relaxed max-w-lg">
                     Hand-crafted for the ultimate summer vibe. Each Balang is a masterpiece of refreshment, layered with fresh fruits and premium spirits.
                  </p>
                  <div className="grid grid-cols-1 gap-4 pt-4">
                     {[featuredFlavor.name, "Lychee Fizz", "Mango Sunset"].map((flavor, i) => (
                        <div key={flavor} className="flex items-center gap-6 group cursor-pointer p-4 rounded-3xl hover:bg-white/40 hover:backdrop-blur-md transition-all duration-300 border border-transparent hover:border-white/50">
                           <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-brand-aqua group-hover:bg-brand-aqua group-hover:text-white transition-all duration-500 transform group-hover:rotate-12">
                              <Droplets size={24} />
                           </div>
                           <div className="flex flex-col">
                              <span className="font-display font-bold text-2xl text-brand-teal uppercase">{flavor}</span>
                              <span className="text-xs font-mono text-brand-teal/40 uppercase tracking-widest">Available Now</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Section 2: Packages */}
            <section className="relative">
               <div className="text-center mb-20 space-y-6">
                  <span className="text-brand-aqua font-display font-bold uppercase tracking-[0.3em] text-sm">Corporate & Events</span>
                  <h2 className="text-brand-teal text-6xl md:text-8xl font-display font-black uppercase">Curated Service</h2>
                  <p className="text-brand-teal/60 max-w-2xl mx-auto text-xl font-medium">
                     Effortless catering for the modern professional. Elevate your event with our premium hydration stations.
                  </p>
               </div>

               <div className="glass-panel-wet p-2 rounded-[4rem] max-w-6xl mx-auto shadow-2xl bg-white/30 backdrop-blur-2xl border-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                     <div className="p-10 md:p-20 flex flex-col justify-center space-y-8">
                        <div className="bg-brand-mango/20 text-brand-teal font-bold px-5 py-2 rounded-full text-xs uppercase tracking-widest self-start inline-flex items-center gap-2 border border-brand-mango/20">
                           <PartyPopper size={16} /> Premium Choice
                        </div>
                        <h3 className="font-display font-black text-5xl md:text-6xl uppercase text-brand-teal leading-none">
                           {featuredPackage.name}
                        </h3>
                        <p className="text-brand-teal/70 text-lg font-medium leading-relaxed">
                           {featuredPackage.description}
                        </p>
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col">
                              <span className="text-xs font-mono text-brand-teal/40 uppercase tracking-widest">Starting At</span>
                              <span className="font-display font-black text-5xl text-brand-teal">${featuredPackage.price}</span>
                           </div>
                           <div className="h-10 w-px bg-brand-teal/10 mx-4"></div>
                           <div className="flex flex-col">
                              <span className="text-xs font-mono text-brand-teal/40 uppercase tracking-widest">Capacity</span>
                              <span className="font-display font-bold text-2xl text-brand-aqua uppercase">{featuredPackage.pax} Pax</span>
                           </div>
                        </div>
                        <MagneticButton className="w-fit mt-8 h-14 bg-brand-teal text-white hover:bg-brand-mango hover:text-brand-teal">
                           <Link href={`/event-builder?defaultPackageId=${featuredPackage.id}`}>Select Experience</Link>
                        </MagneticButton>
                     </div>
                     <div className="relative min-h-[500px] md:min-h-full rounded-[3.5rem] overflow-hidden m-4 shadow-xl">
                        <Image
                           src={featuredPackage.imageUrl}
                           alt={featuredPackage.name}
                           fill
                           className="object-cover hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/40 to-transparent mix-blend-overlay"></div>
                        <div className="absolute top-8 right-8 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/30 text-white font-mono text-sm">
                           ID: {featuredPackage.id.split('_').pop()}
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Section 3: Community */}
            <section className="relative py-20 px-8 md:px-20 text-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-brand-aqua/5 via-brand-coral/5 to-brand-sand/30 rounded-[5rem]"></div>
               <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-aqua/10 rounded-full blur-[100px]"></div>
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-coral/10 rounded-full blur-[100px]"></div>

               <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                  <div className="space-y-4">
                     <Sparkles className="w-16 h-16 text-brand-mango mx-auto animate-pulse" />
                     <h2 className="text-brand-teal text-6xl md:text-8xl font-display font-black uppercase">The Vibe Check</h2>
                  </div>

                  <div className="glass-panel-wet p-12 md:p-20 rounded-[4rem] shadow-2xl transform -rotate-1 hover:rotate-0 transition-all duration-700 bg-white/60 border-white/80">
                     <p className="font-display font-bold text-3xl md:text-5xl text-brand-teal uppercase leading-[1.1] mb-12 italic">
                        "{featuredStory.story}"
                     </p>
                     <div className="flex items-center justify-center gap-6">
                        <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-white shadow-2xl rotate-3">
                           <Image src={featuredStory.avatarUrl || "https://placehold.co/100x100.png"} alt="Avatar" width={100} height={100} className="object-cover" />
                        </div>
                        <div className="text-left">
                           <p className="font-display font-bold text-3xl text-brand-teal uppercase leading-none">{featuredStory.userName}</p>
                           <p className="font-mono text-sm text-brand-aqua font-bold uppercase tracking-widest mt-2">{format(new Date(featuredStory.date), 'MMMM yyyy')}</p>
                        </div>
                     </div>
                  </div>

                  <Button asChild variant="ghost" className="rounded-full text-brand-teal hover:text-brand-aqua font-display font-bold uppercase tracking-widest text-lg group">
                     <Link href="/community" className="flex items-center gap-2">
                        Read More Chronicles <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                     </Link>
                  </Button>
               </div>
            </section>

         </div>

         {/* Footer Decoration */}
         <div className="h-40 bg-gradient-to-t from-brand-sand to-transparent"></div>
      </div>
   );
}