import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { mockFlavors, mockPackages, mockCommunityStories } from '@/lib/data';
import { ArrowRight, Zap, Sparkles, Droplets, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

export default function Home() {
  const featuredFlavor = mockFlavors[0];
  const featuredPackage = mockPackages[0];
  const featuredStory = mockCommunityStories[0];

  return (
    <div className="min-h-screen -mt-20 pt-20 overflow-x-hidden">
      {/* 
        ========================================
        HERO SECTION - MODERN COAST
        ========================================
      */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
         {/* Background Gradients */}
         <div className="absolute inset-0 bg-coast-gradient"></div>
         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-cyan/10 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-yellow/20 rounded-full blur-3xl"></div>
         
         {/* Floating Elements */}
         <div className="absolute top-1/4 left-10 md:left-20 animate-bounce delay-700 hidden lg:block">
            <div className="glass-panel-wet p-3 rounded-2xl rotate-[-6deg]">
               <Sparkles className="text-brand-yellow w-8 h-8" />
            </div>
         </div>
         <div className="absolute bottom-1/3 right-10 md:right-20 animate-bounce delay-1000 hidden lg:block">
            <div className="glass-panel-wet p-3 rounded-2xl rotate-[12deg]">
               <Droplets className="text-brand-cyan w-8 h-8" />
            </div>
         </div>

         <div className="container mx-auto px-4 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-brand-blue/10 px-4 py-1.5 rounded-full shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
               <span className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></span>
               <span className="font-display font-bold text-brand-blue text-xs uppercase tracking-widest">Est. 2024 Singapore</span>
            </div>

            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-[10rem] uppercase leading-[0.85] tracking-tighter text-brand-blue drop-shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
               Balang<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">Kepalang</span>
            </h1>
            
            <p className="font-body text-xl md:text-2xl font-medium text-brand-blue/70 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both delay-200">
               The revolution is iced. We blend tradition with a refreshing chill. <br className="hidden md:block"/> Get your <span className="text-brand-cyan font-bold">#BlendedBalang</span> fix now.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 fill-mode-both delay-300">
               <Button asChild className="btn-coast-primary h-14 px-10 text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  <Link href="/event-builder">
                     Book Now <Zap className="ml-2 fill-current" />
                  </Link>
               </Button>
               <Button asChild variant="ghost" className="h-14 px-10 text-xl font-display font-bold uppercase text-brand-blue hover:bg-white/50 hover:text-brand-cyan transition-all rounded-full border border-transparent hover:border-brand-cyan/20">
                  <Link href="/flavors">
                     View Menu
                  </Link>
               </Button>
            </div>
         </div>
      </section>

      {/* 
        ========================================
        FEATURED SECTIONS
        ========================================
      */}
      <div className="container mx-auto px-4 py-24 space-y-32 relative z-10">
        
        {/* Section 1: Featured Flavor */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
           <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-brand-cyan/20 rounded-[3rem] rotate-[-3deg] group-hover:rotate-[-6deg] transition-transform duration-500"></div>
              <div className="relative glass-panel-wet rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl">
                 <Image 
                   src={featuredFlavor.imageUrl} 
                   alt={featuredFlavor.name} 
                   fill 
                   className="object-cover transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/60 to-transparent opacity-60"></div>
                 <div className="absolute bottom-8 left-8 text-white">
                    <span className="bg-brand-yellow text-brand-blue font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-2 inline-block">Best Seller</span>
                    <h3 className="font-display font-black text-4xl uppercase">{featuredFlavor.name}</h3>
                 </div>
              </div>
           </div>
           
           <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-coast-heading text-5xl md:text-7xl leading-[0.9]">
                 Taste The <br/> <span className="text-brand-cyan">Refreshment</span>
              </h2>
              <p className="text-lg text-brand-blue/70 font-medium leading-relaxed max-w-md">
                 Our flavors are crafted for the heat. Hand-mixed, ice-blended to perfection, and served in our signature Balang style.
              </p>
              <ul className="space-y-4 pt-4">
                 {[featuredFlavor.name, "Blue Lagoon", "Mango Susu"].map(flavor => (
                    <li key={flavor} className="flex items-center gap-4 group cursor-default">
                       <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-cyan shadow-sm border border-brand-blue/5 group-hover:scale-110 transition-transform">
                          <Droplets size={18} />
                       </div>
                       <span className="font-display font-bold text-xl text-brand-blue uppercase group-hover:text-brand-cyan transition-colors">{flavor}</span>
                    </li>
                 ))}
              </ul>
              <div className="pt-6">
                 <Button asChild variant="link" className="text-brand-blue font-bold uppercase tracking-widest hover:text-brand-cyan p-0 text-lg">
                    <Link href="/flavors">Explore All Flavors <ArrowRight className="ml-2 w-5 h-5" /></Link>
                 </Button>
              </div>
           </div>
        </section>

        {/* Section 2: Packages */}
        <section className="relative">
           <div className="text-center mb-16 space-y-4">
              <span className="text-brand-cyan font-display font-bold uppercase tracking-widest text-sm">Event Ready</span>
              <h2 className="text-coast-heading text-5xl md:text-7xl">Curated Packages</h2>
              <p className="text-brand-blue/60 max-w-2xl mx-auto text-lg">
                 From intimate gatherings to corporate galas, we have a setup that fits.
              </p>
           </div>

           <div className="glass-panel-wet p-1 rounded-[3rem] max-w-5xl mx-auto shadow-2xl bg-white/40">
              <div className="grid grid-cols-1 md:grid-cols-2">
                 <div className="p-8 md:p-16 flex flex-col justify-center space-y-6">
                    <div className="bg-brand-yellow/20 text-brand-blue font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest self-start inline-flex items-center gap-2">
                       <PartyPopper size={14} /> Recommended
                    </div>
                    <h3 className="font-display font-black text-4xl md:text-5xl uppercase text-brand-blue leading-tight">
                       {featuredPackage.name}
                    </h3>
                    <p className="text-brand-blue/70 font-medium leading-relaxed">
                       {featuredPackage.description}
                    </p>
                    <div className="flex items-baseline gap-2">
                       <span className="font-display font-black text-4xl text-brand-blue">${featuredPackage.price}</span>
                       <span className="text-brand-blue/40 font-bold uppercase text-sm">/ Event</span>
                    </div>
                    <Button asChild className="btn-coast-primary w-fit mt-4">
                       <Link href={`/event-builder?defaultPackageId=${featuredPackage.id}`}>Select Package</Link>
                    </Button>
                 </div>
                 <div className="relative min-h-[400px] md:min-h-full rounded-[2.5rem] overflow-hidden m-2">
                    <Image 
                       src={featuredPackage.imageUrl} 
                       alt={featuredPackage.name} 
                       fill 
                       className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-brand-blue/10 mix-blend-multiply pointer-events-none"></div>
                 </div>
              </div>
           </div>
        </section>

        {/* Section 3: Community */}
        <section className="bg-brand-blue/5 rounded-[3rem] p-8 md:p-20 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-cyan/10 via-transparent to-transparent"></div>
           
           <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <Sparkles className="w-12 h-12 text-brand-yellow mx-auto animate-pulse" />
              <h2 className="text-coast-heading text-4xl md:text-6xl">Community Voices</h2>
              
              <div className="glass-panel-wet p-8 md:p-12 rounded-[2rem] shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                 <p className="font-display font-bold text-2xl md:text-3xl text-brand-blue uppercase leading-tight mb-8">
                    "{featuredStory.story}"
                 </p>
                 <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                       <Image src={featuredStory.avatarUrl || "https://placehold.co/50x50.png"} alt="Avatar" width={50} height={50} className="object-cover" />
                    </div>
                    <div className="text-left">
                       <p className="font-display font-bold text-brand-blue uppercase">{featuredStory.userName}</p>
                       <p className="font-mono text-xs text-brand-blue/50">{format(new Date(featuredStory.date), 'MMM yyyy')}</p>
                    </div>
                 </div>
              </div>
              
              <Button asChild variant="outline" className="rounded-full border-brand-blue/20 text-brand-blue hover:bg-white hover:text-brand-cyan font-bold uppercase tracking-widest mt-8">
                 <Link href="/community">Read More Stories</Link>
              </Button>
           </div>
        </section>

      </div>
    </div>
  );
}