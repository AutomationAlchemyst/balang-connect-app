'use client';

import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf, Snowflake, ArrowRight, Package, Wrench, HeartHandshake, Sparkles, TicketPercent, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mockFlavors } from '@/data/mockData';
import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
   const popularMixes = mockFlavors.filter(f => f.isFeatured).slice(0, 5);
   const heroRef = useRef<HTMLElement>(null);
   const bgRef = useRef<HTMLDivElement>(null);
   const textRef = useRef<HTMLHeadingElement>(null);
   const logoRef = useRef<HTMLDivElement>(null);

   useLayoutEffect(() => {
      const ctx = gsap.context(() => {
         // Hero Background Parallax
         gsap.to(bgRef.current, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
               trigger: heroRef.current,
               start: "top top",
               end: "bottom top",
               scrub: true
            }
         });

         // Logo Floating Parallax
         gsap.to(logoRef.current, {
            yPercent: -30,
            ease: "none",
            scrollTrigger: {
               trigger: heroRef.current,
               start: "top top",
               end: "bottom top",
               scrub: true
            }
         });

         // Kinetic Rainbow Text - Scroll Linked
         const spans = textRef.current?.querySelectorAll('span');
         if (spans && spans.length === 3) {
            // Animate Summer (left span)
            gsap.to(spans[0], {
               rotate: -30,
               x: -50,
               y: 40,
               ease: "none",
               scrollTrigger: {
                  trigger: heroRef.current,
                  start: "top top",
                  end: "bottom top",
                  scrub: 1
               }
            });

            // Animate Jar (right span)
            gsap.to(spans[2], {
               rotate: 30,
               x: 50,
               y: 40,
               ease: "none",
               scrollTrigger: {
                  trigger: heroRef.current,
                  start: "top top",
                  end: "bottom top",
                  scrub: 1
               }
            });

            // Animate In A (middle span)
            gsap.to(spans[1], {
               y: -20,
               scale: 1.1,
               ease: "none",
               scrollTrigger: {
                  trigger: heroRef.current,
                  start: "top top",
                  end: "bottom top",
                  scrub: 1
               }
            });
         }

         // Text Intro Animation
         const tl = gsap.timeline();

         // 1. Reveal Text Lines (initial intro)
         tl.fromTo(spans || [],
            { opacity: 0, y: 50 },
            {
               opacity: 1,
               y: 0,
               duration: 1.2,
               stagger: 0.15,
               ease: "power4.out"
            }
         )
            // 2. Fade in subtext and buttons
            .to(".fade-in-up", {
               opacity: 1,
               y: 0,
               duration: 0.8,
               stagger: 0.1,
               ease: "power2.out"
            }, "-=0.6");

      }, heroRef);

      return () => ctx.revert();
   }, []);

   return (
      <div className="relative w-full overflow-x-hidden font-plus-jakarta text-[#0d1c1b] dark:text-white">
         {/* Hero Section */}
         <section ref={heroRef} className="relative h-[95vh] w-full flex flex-col items-center justify-between py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
               <div
                  ref={bgRef}
                  className="w-full h-full bg-cover bg-center scale-110"
                  style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80")' }}
               ></div>
               <div className="absolute inset-0 hero-gradient"></div>
            </div>

            {/* TOP: Kinetic Rainbow Text */}
            <div className="relative z-30 pt-10">
               <div className="text-slide-up overflow-visible">
                  <h1 ref={textRef} className="text-white text-4xl sm:text-5xl md:text-8xl font-black leading-none tracking-tighter uppercase flex items-end justify-center perspective-1000">
                     <span className="block origin-bottom-right -rotate-6 md:-rotate-12 translate-y-2 md:translate-y-4">Summer</span>
                     <span className="block mb-2 md:mb-4 text-2xl sm:text-3xl md:text-6xl mx-2 opacity-90">In A</span>
                     <span className="block origin-bottom-left rotate-6 md:rotate-12 translate-y-2 md:translate-y-4 text-[#0df2df] italic">Jar</span>
                  </h1>
               </div>
            </div>

            {/* MIDDLE: Logo Watermark */}
            <div
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[650px] md:h-[650px] opacity-30 z-10 pointer-events-none mix-blend-overlay"
               ref={logoRef}
            >
               <Image
                  src="/logo.png"
                  alt="Balang Logo"
                  fill
                  className="object-contain"
                  priority
               />
            </div>

            {/* BOTTOM: Subtext & Buttons */}
            <div className="relative z-30 w-full px-6 flex flex-col items-center text-center gap-8 pb-10">
               <p className="text-white/90 text-[13px] md:text-lg font-medium max-w-[300px] md:max-w-md mx-auto leading-relaxed backdrop-blur-md p-5 md:p-6 rounded-2xl bg-black/20 border border-white/10 shadow-xl fade-in-up opacity-0">
                  Premium Balang catering for corporate retreats and exclusive private events.
               </p>

               <div className="flex flex-col md:flex-row w-full max-w-md gap-3 fade-in-up opacity-0">
                  <Link href="/event-builder" className="w-full">
                     <button className="w-full bg-[#0df2df] text-[#0d1c1b] h-14 py-4 rounded-2xl font-black text-base uppercase tracking-wider shadow-xl shadow-[#0df2df]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-110">
                        Book Event
                     </button>
                  </Link>
                  <Link href="/flavors" className="w-full">
                     <button className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white h-14 py-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-all hover:bg-white/20">
                        View Flavors
                     </button>
                  </Link>
               </div>
            </div>

            <div
               className="absolute bottom-[-2%] -right-12 w-48 h-48 md:w-64 md:h-64 opacity-60 -rotate-45 z-20 pointer-events-none"
               style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdUYrzTGtGjOQj69h8MCwD1XfYKeTT6EmrkpqYDGK3DArZIa2sgpSUINNiV2Fh0OO6jfPD1Y7utJORGg5rCRP3Fr-wxHIhDSH_Ekyta5ygd_sb1Z72MCSrZuJLnOHHUQLJWjzim9Sv6Al-j32LGur9jYUz0eaP1D2f5F7q_kPsxYT3pz1EJVo5xpHj5QNv5PVUNKHcaVtHYFKvWHl6dg60lZOImbo7OMJ8GUZjPrtLQwQiorbJZVGU1VV7jChOVjAfMf_RCfef6yQ")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat'
               }}
            ></div>
         </section>

         {/* FAQ Section */}
         <section className="bg-[#f4ede4] relative z-20 py-24 px-6 -mt-10 rounded-t-[2.5rem]">
            <div className="max-w-4xl mx-auto">
               <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-black text-[#0d1c1b] uppercase tracking-tighter mb-4">Got Questions?</h2>
                  <p className="text-[#0d1c1b]/60 font-bold">Quick answers to help you get started.</p>
               </div>

               <div className="breezy-glass-static p-8 md:p-12 rounded-[2.5rem] shadow-xl space-y-2">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                     <AccordionItem value="item-1" className="border-b border-[#0d1c1b]/5 last:border-0 px-4">
                        <AccordionTrigger className="text-left font-black text-lg md:text-xl text-[#0d1c1b] hover:text-[#09a093] hover:no-underline py-6 transition-colors uppercase tracking-tight">
                           How much are your air balangs?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#0d1c1b]/70 font-medium text-lg leading-relaxed pb-6 text-balance">
                           Our pricing varies based on the number of pax. Please refer to our Event Builder or Wedding & Corp tab to find the option that best suits your needs.
                        </AccordionContent>
                     </AccordionItem>

                     <AccordionItem value="item-2" className="border-b border-[#0d1c1b]/5 last:border-0 px-4">
                        <AccordionTrigger className="text-left font-black text-lg md:text-xl text-[#0d1c1b] hover:text-[#09a093] hover:no-underline py-6 transition-colors uppercase tracking-tight">
                           Do you provide just 1 balang?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#0d1c1b]/70 font-medium text-lg leading-relaxed pb-6 text-balance">
                           Yes! We offer a 17L balang ideal for small groups (15-25 pax), and the 17L balang is yours to keep. Head over to our Event Builder to order.
                        </AccordionContent>
                     </AccordionItem>

                     <AccordionItem value="item-3" className="border-b border-[#0d1c1b]/5 last:border-0 px-4">
                        <AccordionTrigger className="text-left font-black text-lg md:text-xl text-[#0d1c1b] hover:text-[#09a093] hover:no-underline py-6 transition-colors uppercase tracking-tight">
                           How long in advance should I order?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#0d1c1b]/70 font-medium text-lg leading-relaxed pb-6 text-balance">
                           We’d love at least 2 weeks’ notice. If your event is sooner, WhatsApp us at 9881 4898 and we’ll do our best to make it happen!
                        </AccordionContent>
                     </AccordionItem>

                     <AccordionItem value="item-4" className="border-b border-[#0d1c1b]/5 last:border-0 px-4">
                        <AccordionTrigger className="text-left font-black text-lg md:text-xl text-[#0d1c1b] hover:text-[#09a093] hover:no-underline py-6 transition-colors uppercase tracking-tight">
                           What are your payment terms?
                        </AccordionTrigger>
                        <AccordionContent className="text-[#0d1c1b]/70 font-medium text-lg leading-relaxed pb-6 text-balance">
                           We accept PayNow to our UEN. Standard invoice terms are 14 days. For special requests, feel free to chat with us on WhatsApp.
                        </AccordionContent>
                     </AccordionItem>
                  </Accordion>
               </div>

               <div className="mt-12 text-center">
                  <Link href="/faq" className="inline-flex items-center gap-2 group">
                     <span className="text-sm font-black text-[#ff8c00] uppercase tracking-widest group-hover:underline">View All Common Queries</span>
                     <ArrowRight className="size-4 text-[#ff8c00] transition-transform group-hover:translate-x-1" />
                  </Link>
               </div>
            </div>
         </section>
      </div>
   );
}