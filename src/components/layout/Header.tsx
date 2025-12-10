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
  Waves
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

const navItems = [
  { href: '/flavors', label: 'Flavors', icon: CupSoda },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/wedding-corporate-orders', label: 'Wedding & Corp', icon: Wrench },
  { href: '/event-builder', label: 'Event Builder', icon: Wrench },
  { href: '/infaq', label: 'Infaq Orders', icon: HeartHandshake },
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M5nf8xC34Y6ZvB5qQCWYoWsSAAplzX1uO6IsPXdxyKE/edit';
const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/month?cid=bac102a37094ab792c29d34b294fa8868ebc2fceee9cbf3a654c59c145064bee@group.calendar.google.com';

// Modern Coast Styles
const navButtonStyles = "font-display font-bold uppercase text-brand-blue/70 hover:text-brand-blue hover:bg-brand-cyan/10 transition-all rounded-full px-4";
const activeNavButtonStyles = "bg-brand-cyan/20 text-brand-blue font-black shadow-sm";

export default function Header() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-2 border-b border-brand-blue/5' 
          : 'bg-transparent py-4 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-12 w-32">
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
        <nav className="hidden lg:flex items-center gap-1 bg-white/40 backdrop-blur-sm p-1 rounded-full border border-white/50 shadow-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                href={item.href} 
                className={`${navButtonStyles} py-2 text-sm flex items-center gap-2 ${isActive ? activeNavButtonStyles : ''}`}
              >
                {/* <item.icon size={16} strokeWidth={2.5} /> */}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="hidden lg:flex items-center gap-2">
           {isAdmin ? (
             <div className="flex items-center pl-4 gap-2">
               <Button variant="outline" size="sm" asChild className="rounded-full border-brand-blue/20 text-brand-blue hover:bg-brand-cyan/10 hover:text-brand-cyan hover:border-brand-cyan/50">
                 <Link href="/admin/manage-dates">
                   <Ban size={16} className="mr-1.5" strokeWidth={2.5}/> Dates
                 </Link>
               </Button>
               <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                   <LogOut size={18} strokeWidth={2.5}/>
               </Button>
             </div>
           ) : (
             <Button asChild className="btn-coast-primary h-10 px-6 text-sm">
               <Link href="/event-builder">Book Now</Link>
             </Button>
           )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-brand-blue hover:bg-brand-cyan/10 rounded-full">
                <Menu className="h-6 w-6" strokeWidth={2.5} />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-panel-wet flex flex-col h-full p-0 border-l border-white/50 w-[300px]">
              <SheetHeader className="p-6 bg-brand-blue/5 border-b border-brand-blue/5">
                <SheetTitle asChild>
                  <Link 
                    href="/" 
                    className="flex items-center gap-2"
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
              
              <div className="flex-grow overflow-y-auto py-4 px-4">
                <nav className="grid gap-2">
                  {navItems.map((item) => {
                     const isActive = pathname === item.href;
                     return (
                      <Link 
                        key={item.label} 
                        href={item.href} 
                        className={`flex items-center gap-4 p-4 rounded-2xl font-display font-bold uppercase text-lg transition-all ${isActive ? 'bg-brand-cyan/20 text-brand-blue shadow-sm' : 'text-brand-blue/60 hover:bg-white hover:text-brand-blue'}`}
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <item.icon className={`h-5 w-5 ${isActive ? 'text-brand-blue' : 'text-brand-cyan'}`} strokeWidth={2.5} />
                        {item.label}
                      </Link>
                     )
                  })}
                  
                  {isAdmin && (
                    <div className="mt-8 border-t border-brand-blue/10 pt-6">
                      <div className="mb-4 font-display font-bold uppercase text-xs tracking-widest text-brand-blue/40 px-2">Admin Tools</div>
                      <div className="grid gap-2">
                        <Link 
                          href="/admin/manage-dates" 
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-brand-blue font-bold text-sm hover:bg-white transition-colors"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <Ban className="h-4 w-4" />
                          <span>Manage Dates</span>
                        </Link>
                        <Link 
                          href={sheetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-brand-blue font-bold text-sm hover:bg-white transition-colors"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <SheetIcon className="h-4 w-4" />
                          <span>View Bookings</span>
                        </Link>
                        <Link 
                          href={calendarUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-brand-blue font-bold text-sm hover:bg-white transition-colors"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <CalendarDays className="h-4 w-4" />
                          <span>View Calendar</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </nav>
              </div>

              {isAdmin && (
                <SheetFooter className="mt-auto p-4 bg-red-50 border-t border-red-100">
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-center text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold uppercase">
                      <LogOut className="mr-2 h-4 w-4"/>
                      <span>Logout</span>
                  </Button>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}