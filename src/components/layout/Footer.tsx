import Link from 'next/link';
import Image from 'next/image';
import { Waves, Instagram, Facebook, Video } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#041F1C] to-[#010b0a] text-white mt-auto pt-32 pb-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0df2df]/30 to-transparent"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#0df2df]/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#0bc9b9]/5 rounded-full blur-[100px]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-5 space-y-10">
            <Link href="/" className="inline-block group">
              <div className="relative h-20 w-56 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Balang Kepalang Logo"
                  fill
                  className="object-contain"
                  sizes="300px"
                />
              </div>
            </Link>
            <p className="text-white/60 text-lg font-medium leading-relaxed max-w-md font-plus-jakarta">
              The ultimate "Surfers Paradise" drink experience. Bringing premium, ice-blended hydration to every bazaar and corporate event in Singapore.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#E1306C] hover:border-[#E1306C] hover:text-white hover:-translate-y-1 hover:rotate-3 hover:shadow-lg hover:shadow-[#E1306C]/20 transition-all duration-300 group">
                <span className="sr-only">Instagram</span>
                <Instagram className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="#" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#000000] hover:border-[#000000] hover:text-white hover:-translate-y-1 hover:rotate-3 hover:shadow-lg hover:shadow-white/10 transition-all duration-300 group">
                <span className="sr-only">TikTok</span>
                <Video className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="#" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white hover:-translate-y-1 hover:rotate-3 hover:shadow-lg hover:shadow-[#1877F2]/20 transition-all duration-300 group">
                <span className="sr-only">Facebook</span>
                <Facebook className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="font-black uppercase text-[#0df2df] tracking-tighter text-lg font-plus-jakarta">Experience</h4>
            <ul className="space-y-5 font-bold text-lg text-white/50 font-plus-jakarta">
              <li><Link href="/flavors" className="hover:text-white hover:translate-x-2 transition-all inline-block">Our Flavors</Link></li>
              <li><Link href="/wedding-corporate-orders" className="hover:text-white hover:translate-x-2 transition-all inline-block">Wedding & Corp</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="font-black uppercase text-[#0df2df] tracking-tighter text-lg font-plus-jakarta">Action</h4>
            <ul className="space-y-5 font-bold text-lg text-white/50 font-plus-jakarta">
              <li><Link href="/event-builder" className="hover:text-white hover:translate-x-2 transition-all inline-block">Build Event</Link></li>
              <li><Link href="/infaq" className="hover:text-white hover:translate-x-2 transition-all inline-block">Sponsorship</Link></li>
              <li><Link href="/community" className="hover:text-white hover:translate-x-2 transition-all inline-block">Community</Link></li>
              <li><Link href="/faq" className="hover:text-white hover:translate-x-2 transition-all inline-block">FAQ</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <h4 className="font-black uppercase text-[#0df2df] tracking-tighter text-lg font-plus-jakarta">Stay Freshwater</h4>
            <p className="text-white/40 text-sm font-medium font-plus-jakarta leading-relaxed">
              Join our mailing list for special event discounts and exclusive flavor drops.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-white/5 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-4 w-full focus:outline-none focus:border-[#0df2df] focus:ring-4 focus:ring-[#0df2df]/20 transition-all text-white placeholder:text-white/40 font-bold"
              />
              <button className="bg-[#0df2df] text-[#041F1C] px-8 py-4 rounded-2xl font-black hover:bg-white hover:scale-105 hover:shadow-xl hover:shadow-[#0df2df]/20 transition-all uppercase text-xs tracking-widest shrink-0">
                Go
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-plus-jakarta">
          <div className="flex flex-col md:flex-row gap-4 md:gap-10 text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} Balang Kepalang SG</span>
            <Link href="/admin/login" className="hover:text-white/60 transition-colors">Admin Access</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-50">Powered by</span>
            <Link
              href="https://theworkflowguys.com/"
              target="_blank"
              className="text-[#0df2df] opacity-80 hover:opacity-100 hover:text-white transition-all cursor-pointer"
            >
              Workflowguys
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
