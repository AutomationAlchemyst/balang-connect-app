import Link from 'next/link';
import Image from 'next/image';
import { Waves } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white mt-auto pt-16 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-cyan/50 to-transparent"></div>
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-cyan rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand-yellow rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
               <div className="relative h-12 w-40 bg-white/10 rounded-lg p-1">
                 <Image 
                   src="/logo.png" 
                   alt="Balang Kepalang Logo" 
                   fill 
                   className="object-contain"
                   sizes="200px"
                 />
               </div>
            </div>
            <p className="text-brand-blue/30 text-white/70 max-w-sm font-medium leading-relaxed">
              Bringing the coolest, freshest ice blended air balang experience to Singapore. Perfect for events, weddings, and hot sunny days.
            </p>
          </div>
          
          <div>
             <h4 className="font-display font-bold uppercase text-brand-cyan mb-4 tracking-widest text-sm">Explore</h4>
             <ul className="space-y-3 font-medium text-white/80">
                <li><Link href="/flavors" className="hover:text-white hover:translate-x-1 transition-all inline-block">Our Flavors</Link></li>
                <li><Link href="/packages" className="hover:text-white hover:translate-x-1 transition-all inline-block">Event Packages</Link></li>
                <li><Link href="/wedding-corporate-orders" className="hover:text-white hover:translate-x-1 transition-all inline-block">Wedding & Corp</Link></li>
                <li><Link href="/community" className="hover:text-white hover:translate-x-1 transition-all inline-block">Community</Link></li>
             </ul>
          </div>
          
          <div>
             <h4 className="font-display font-bold uppercase text-brand-cyan mb-4 tracking-widest text-sm">Action</h4>
             <ul className="space-y-3 font-medium text-white/80">
                <li><Link href="/event-builder" className="hover:text-white hover:translate-x-1 transition-all inline-block">Build Your Event</Link></li>
                <li><Link href="/infaq" className="hover:text-white hover:translate-x-1 transition-all inline-block">Sponsor / Infaq</Link></li>
                <li><Link href="/admin/login" className="hover:text-white hover:translate-x-1 transition-all inline-block opacity-50 hover:opacity-100">Admin Login</Link></li>
             </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-white/40 uppercase tracking-widest">
           <p>&copy; {new Date().getFullYear()} Balang Kepalang SG.</p>
           <p>Designed with <span className="text-red-400">♥</span> by WorkFlowGuys</p>
        </div>
      </div>
    </footer>
  );
}
