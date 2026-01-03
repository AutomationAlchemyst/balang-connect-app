import Link from 'next/link';
import Image from 'next/image';
import { Waves } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-teal text-white mt-auto pt-24 pb-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-aqua/50 to-transparent"></div>
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-aqua/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[120px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-5 space-y-8">
            <Link href="/" className="inline-block group">
              <div className="relative h-16 w-48 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Balang Kepalang Logo"
                  fill
                  className="object-contain"
                  sizes="300px"
                />
              </div>
            </Link>
            <p className="text-white/60 text-xl font-medium leading-relaxed max-w-md">
              The ultimate "Surfers Paradise" drink experience. Bringing premium, ice-blended hydration to every bazaar and corporate event in Singapore.
            </p>
            <div className="flex gap-4">
              {["Instagram", "TikTok", "Facebook"].map(social => (
                <Link key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-aqua hover:text-white transition-all duration-300">
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5 bg-current opacity-60"></div>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-display font-black uppercase text-brand-aqua tracking-[0.2em] text-sm">Experience</h4>
            <ul className="space-y-4 font-bold text-lg text-white/50">
              <li><Link href="/flavors" className="hover:text-white transition-colors">Our Flavors</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Event Packages</Link></li>
              <li><Link href="/wedding-corporate-orders" className="hover:text-white transition-colors">Wedding & Corp</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-display font-black uppercase text-brand-aqua tracking-[0.2em] text-sm">Action</h4>
            <ul className="space-y-4 font-bold text-lg text-white/50">
              <li><Link href="/event-builder" className="hover:text-white transition-colors">Build Event</Link></li>
              <li><Link href="/infaq" className="hover:text-white transition-colors">Sponsorship</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-display font-black uppercase text-brand-aqua tracking-[0.2em] text-sm">Stay Freshwater</h4>
            <p className="text-white/40 text-sm font-medium">Join our mailing list for special event discounts.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-full focus:outline-none focus:border-brand-aqua transition-colors" />
              <button className="bg-brand-aqua text-brand-teal px-4 py-3 rounded-2xl font-bold hover:bg-white transition-all">Go</button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
          <div className="flex gap-8">
            <span>&copy; {new Date().getFullYear()} Balang Kepalang SG</span>
            <Link href="/admin/login" className="hover:text-white transition-colors">Admin Access</Link>
          </div>
          <div className="flex items-center gap-2">
            <span>Crafted by</span>
            <span className="text-brand-coral">Automation Alchemyst</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
