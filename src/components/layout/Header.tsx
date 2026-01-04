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
  TicketPercent
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { cn } from '@/lib/utils';
import { MagneticButton } from '@/components/ui/magnetic-button';

const navItems = [
  { href: '/flavors', label: 'Flavors', icon: CupSoda },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/wedding-corporate-orders', label: 'Wedding & Corp', icon: Wrench },
  { href: '/event-builder', label: 'Event Builder', icon: Wrench },
  { href: '/promotions', label: 'Promotions', icon: TicketPercent },
  { href: '/ai-stylist', label: 'AI Stylist', icon: Sparkles },
  { href: '/infaq', label: 'Infaq Orders', icon: HeartHandshake },
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M5nf8xC34Y6ZvB5qQCWYoWsSAAplzX1uO6IsPXdxyKE/edit';
const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/month?cid=bac102a37094ab792c29d34b294fa8868ebc2fceee9cbf3a654c59c145064bee@group.calendar.google.com';

// Modern Coast Styles
const navButtonStyles = "font-display font-black uppercase text-brand-teal/60 hover:text-brand-teal hover:bg-white/60 transition-all rounded-full px-5 py-2.5 text-[11px] tracking-[0.2em]";
const activeNavButtonStyles = "bg-white text-brand-teal shadow-xl border border-white/80 active:scale-95";

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled
        ? 'py-3'
        : 'py-6'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className={`flex justify-between items-center px-6 py-2 transition-all duration-500 rounded-[2.5rem] ${scrolled
          ? 'bg-white/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,40,80,0.05)] border border-white/80'
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
                <Button variant="outline" size="sm" asChild className="rounded-full border-brand-teal/20 text-brand-teal hover:bg-brand-aqua/10 transition-all font-bold">
                  <Link href="/admin/manage-dates">
                    <Ban size={16} className="mr-2" /> Dates
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full h-10 w-10">
                  <LogOut size={20} />
                </Button>
              </div>
            ) : (
              <MagneticButton className="h-11 px-8 text-sm shadow-xl">
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
              <SheetContent side="right" className="bg-brand-sand/95 backdrop-blur-2xl border-l border-white/40 w-[320px] h-[100dvh] p-0 flex flex-col overflow-hidden">
                <SheetHeader className="p-8 border-b border-brand-teal/5 shrink-0">
                  <SheetTitle asChild>
                    <Link
                      href="/"
                      className="flex items-center"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <div className="relative h-10 w-32">
                        <Image
                          src="/logo.png"
                          alt="Balang Kepalang Logo"
                          fill
                          className="object-contain"
                          sizes="200px"
                        />
                      </div>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto min-h-0">
                  <nav className="px-4 py-8 space-y-3">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-5 p-5 rounded-3xl font-display font-bold uppercase text-lg transition-all duration-300",
                            isActive
                              ? 'bg-white text-brand-teal shadow-xl'
                              : 'text-brand-teal/40 hover:text-brand-teal hover:bg-white/50'
                          )}
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <item.icon className={cn("h-6 w-6", isActive ? 'text-brand-aqua' : 'text-brand-teal/20')} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </nav>

                  <div className="p-8 border-t border-brand-teal/5">
                    {isAdmin ? (
                      <Button variant="destructive" onClick={handleLogout} className="w-full h-14 rounded-3xl font-bold uppercase text-lg shadow-xl">
                        <LogOut className="mr-3 h-5 w-5" /> Logout Admin
                      </Button>
                    ) : (
                      <Button asChild className="w-full h-14 rounded-3xl bg-brand-teal text-white font-bold uppercase text-lg shadow-xl hover:bg-brand-aqua">
                        <Link href="/event-builder" onClick={() => setIsSheetOpen(false)}>Book Now</Link>
                      </Button>
                    )}
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