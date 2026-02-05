'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Menu,
  CupSoda,
  Package,
  Wrench,
  HeartHandshake,
  Sheet as SheetIcon,
  CalendarDays,
  Ban,
  LogOut,
  Waves,
  Sparkles,
  TicketPercent,
  X
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/ui/magnetic-button';

const navItems = [
  { href: '/flavors', label: 'Flavors', icon: CupSoda },
  { href: '/wedding-corporate-orders', label: 'Wedding & Corp', icon: Wrench },
  { href: '/event-builder', label: 'Event Builder', icon: Wrench },
  { href: '/promotions', label: 'Promotions', icon: TicketPercent },
  { href: '/ai-stylist', label: 'AI Stylist', icon: Sparkles },
  { href: '/infaq', label: 'Infaq Orders', icon: HeartHandshake },
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M5nf8xC34Y6ZvB5qQCWYoWsSAAplzX1uO6IsPXdxyKE/edit';
const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/month?cid=bac102a37094ab792c29d34b294fa8868ebc2fceee9cbf3a654c59c145064bee@group.calendar.google.com';

// Breezy Balang Header Styles
const navButtonStyles = "font-black uppercase text-[#041F1C]/60 hover:text-[#041F1C] hover:bg-white/60 transition-all rounded-full px-5 py-2.5 text-[10px] tracking-[0.3em]";
const activeNavButtonStyles = "bg-white text-[#041F1C] shadow-xl border border-white/80 active:scale-95";

export default function Header() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    setIsSheetOpen(false);
    router.push('/');
  };

  if (pathname?.startsWith('/wedding-corporate-orders')) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled
        ? 'py-3'
        : 'py-6'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex justify-between items-center px-6 py-2 transition-all duration-500 rounded-[2.5rem] ${scrolled
          ? 'bg-white/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(13,242,223,0.1)] border border-white/80'
          : 'bg-transparent border-transparent'
          }`}>
          <Link href="/" className="flex items-center gap-2 group relative z-10">
            <div className="relative h-10 w-28 md:h-12 md:w-32 transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Balang Kepalang Logo"
                fill
                className="object-contain"
                priority
                sizes="200px"
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(navButtonStyles, isActive && activeNavButtonStyles)}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild className="rounded-full border-[#0df2df]/20 text-[#041F1C] hover:bg-[#0df2df]/10 transition-all font-bold">
                  <Link href={sheetUrl} target="_blank">
                    <SheetIcon size={16} className="mr-2" /> Orders
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="rounded-full border-[#0df2df]/20 text-[#041F1C] hover:bg-[#0df2df]/10 transition-all font-bold">
                  <Link href={calendarUrl} target="_blank">
                    <CalendarDays size={16} className="mr-2" /> Calendar
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="rounded-full border-[#0df2df]/20 text-[#041F1C] hover:bg-[#0df2df]/10 transition-all font-bold">
                  <Link href="/admin/manage-dates">
                    <Ban size={16} className="mr-2" /> Dates
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10">
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              <MagneticButton className="h-11 px-8 text-sm shadow-xl breezy-btn-primary">
                <Link href="/event-builder">Book Now</Link>
              </MagneticButton>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden relative z-10">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-brand-teal hover:bg-brand-aqua/10 rounded-full h-12 w-12">
                  <Menu className="h-7 w-7" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-transparent border-none w-full h-[100dvh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
                {/* Background Image/Pattern */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200"
                    alt="Coastal Background"
                    fill
                    className="object-cover opacity-100"
                  />
                  <div className="absolute inset-0 bg-neutral-100/10 backdrop-blur-md"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#f4ece7]/80 via-transparent to-[#b2dee0]/80"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <SheetHeader className="p-6 pt-12 flex flex-row items-center justify-end shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSheetOpen(false)}
                      className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md text-brand-midnight hover:bg-white/40 border border-white/40"
                    >
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-10 py-4 custom-scrollbar">
                    <nav className="flex flex-col gap-6">
                      <Link
                        href="/"
                        className="text-brand-midnight text-4xl font-black tracking-tighter hover:text-brand-aqua transition-colors uppercase"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        Home
                      </Link>
                      {navItems.map((item) => {
                        const label = item.label === 'Packages' ? 'Event Packages' : item.label;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 text-brand-midnight text-4xl font-black tracking-tighter hover:text-brand-aqua transition-colors uppercase leading-tight"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            {label}
                            {item.label === 'AI Stylist' && (
                              <span className="bg-brand-aqua/20 text-brand-teal text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest border border-brand-aqua/30">
                                New
                              </span>
                            )}
                          </Link>
                        )
                      })}
                    </nav>

                    <div className="mt-10">
                      {isAdmin ? (
                        <div className="space-y-3">
                          <Button variant="outline" asChild className="w-full h-14 rounded-2xl bg-white/20 backdrop-blur-md border-white/40 font-black uppercase tracking-widest text-brand-midnight">
                            <Link href={sheetUrl} target="_blank" onClick={() => setIsSheetOpen(false)}>
                              <SheetIcon size={18} className="mr-2" /> Orders
                            </Link>
                          </Button>
                          <Button variant="outline" asChild className="w-full h-14 rounded-2xl bg-white/20 backdrop-blur-md border-white/40 font-black uppercase tracking-widest text-brand-midnight">
                            <Link href={calendarUrl} target="_blank" onClick={() => setIsSheetOpen(false)}>
                              <CalendarDays size={18} className="mr-2" /> Calendar
                            </Link>
                          </Button>
                          <Button variant="destructive" onClick={handleLogout} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                            <LogOut className="mr-3 h-5 w-5" /> Logout Admin
                          </Button>
                        </div>
                      ) : (
                        <Button asChild className="w-full max-w-[320px] h-16 rounded-[1.25rem] bg-[#f47b25] hover:bg-[#e66a14] text-white font-black uppercase text-xl shadow-2xl shadow-[#f47b25]/30 active:scale-95 transition-all tracking-wider border-none">
                          <Link href="/event-builder" onClick={() => setIsSheetOpen(false)}>Build Event</Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto border-t border-brand-midnight/10 p-10 bg-white/10 backdrop-blur-sm">
                    <p className="text-brand-midnight/80 text-xl italic font-serif text-center mb-8">
                      Balang Kepalang
                    </p>
                    <div className="flex justify-center gap-10">
                      <Link href="#" className="flex flex-col items-center gap-2 group">
                        <div className="size-14 rounded-full bg-white/40 flex items-center justify-center text-brand-midnight group-hover:bg-brand-aqua group-hover:text-white transition-all shadow-lg border border-white/60">
                          <Image src="https://img.icons8.com/material-rounded/24/000000/instagram-new.png" alt="IG" width={24} height={24} className="opacity-80" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-midnight">IG</span>
                      </Link>
                      <Link href="#" className="flex flex-col items-center gap-2 group">
                        <div className="size-14 rounded-full bg-white/40 flex items-center justify-center text-brand-midnight group-hover:bg-brand-aqua group-hover:text-white transition-all shadow-lg border border-white/60">
                          <Image src="https://img.icons8.com/material-rounded/24/000000/tiktok.png" alt="TikTok" width={24} height={24} className="opacity-80" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-midnight">TikTok</span>
                      </Link>
                      <Link href="#" className="flex flex-col items-center gap-2 group">
                        <div className="size-14 rounded-full bg-white/40 flex items-center justify-center text-brand-midnight group-hover:bg-brand-aqua group-hover:text-white transition-all shadow-lg border border-white/60">
                          <Image src="https://img.icons8.com/material-rounded/24/000000/facebook-new.png" alt="FB" width={24} height={24} className="opacity-80" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-midnight">FB</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}