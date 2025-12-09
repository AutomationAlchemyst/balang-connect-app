'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  LogOut
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/flavors', label: 'Flavors', icon: CupSoda },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/wedding-corporate-orders', label: 'Wedding & Corp', icon: Wrench },
  { href: '/event-builder', label: 'Event Builder', icon: Wrench },
  { href: '/infaq', label: 'Infaq Orders', icon: HeartHandshake },
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M5nf8xC34Y6ZvB5qQCWYoWsSAAplzX1uO6IsPXdxyKE/edit';
const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/month?cid=bac102a37094ab792c29d34b294fa8868ebc2fceee9cbf3a654c59c145064bee@group.calendar.google.com';

// Neo-Brutalism Styles
const headerStyles = "bg-white border-b-4 border-black sticky top-0 z-50";
const navButtonStyles = "font-display font-bold uppercase text-black hover:bg-brand-yellow hover:text-black border-2 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_#000000] transition-all rounded-none mx-1";
const activeNavButtonStyles = "bg-brand-cyan border-2 border-black shadow-[4px_4px_0px_0px_#000000]";
const iconButtonStyles = "border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-brand-yellow transition-all";

export default function Header() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    setIsSheetOpen(false);
    router.push('/');
  };

  return (
    <header className={headerStyles}>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-display font-black uppercase tracking-tighter text-black hover:text-brand-cyan transition-colors transform hover:-rotate-2 inline-block">
          Balang Kepalang
        </Link>
        
        <nav className="hidden md:flex items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button 
                key={item.label} 
                variant="ghost" 
                asChild
                className={`${navButtonStyles} ${isActive ? activeNavButtonStyles : ''}`}
              >
                <Link href={item.href} className="flex items-center space-x-2">
                  <item.icon size={18} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
          
          {isAdmin && (
            <div className="flex items-center ml-2 pl-2 border-l-4 border-black gap-2">
              <Button variant="outline" size="sm" asChild className={iconButtonStyles}>
                <Link href="/admin/manage-dates">
                  <Ban size={16} className="mr-1.5" strokeWidth={2.5}/> Dates
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className={iconButtonStyles}>
                <Link href={sheetUrl} target="_blank" rel="noopener noreferrer">
                  <SheetIcon size={16} className="mr-1.5" strokeWidth={2.5}/> Bookings
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className={iconButtonStyles}>
                <Link href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarDays size={16} className="mr-1.5" strokeWidth={2.5}/> Calendar
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-100 font-bold border-2 border-transparent hover:border-red-600 rounded-none">
                  <LogOut size={16} className="mr-1.5" strokeWidth={2.5}/>
              </Button>
            </div>
          )}
        </nav>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className={`${iconButtonStyles} bg-white h-10 w-10`}>
                <Menu className="h-6 w-6" strokeWidth={2.5} />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col h-full border-l-4 border-black p-0 bg-white w-[300px]">
              <SheetHeader className="p-6 border-b-4 border-black bg-brand-yellow">
                <SheetTitle asChild>
                  <Link 
                    href="/" 
                    className="text-2xl font-display font-black uppercase tracking-tighter text-black text-left"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    Balang Kepalang
                  </Link>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-grow overflow-y-auto py-4 px-4 bg-[#FFFDF5]">
                <nav className="grid gap-3">
                  {navItems.map((item) => {
                     const isActive = pathname === item.href;
                     return (
                      <Button 
                        key={item.label} 
                        variant="ghost" 
                        asChild 
                        className={`justify-start text-lg p-6 font-display font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_#000000] rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${isActive ? 'bg-brand-cyan' : 'bg-white'}`}
                      >
                        <Link 
                          href={item.href} 
                          className="flex items-center gap-4"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <item.icon className="h-6 w-6" strokeWidth={2.5} />
                          {item.label}
                        </Link>
                      </Button>
                     )
                  })}
                  
                  {isAdmin && (
                    <div className="mt-8 border-t-4 border-black pt-6">
                      <div className="mb-4 font-display font-black uppercase text-lg px-2 bg-black text-white inline-block transform -rotate-2">Admin Tools</div>
                      <div className="grid gap-3">
                        <Button variant="secondary" asChild className="justify-start p-4 font-bold border-2 border-black rounded-none bg-gray-100 shadow-[4px_4px_0px_0px_#000000]">
                            <Link 
                              href="/admin/manage-dates" 
                              className="flex items-center gap-4"
                              onClick={() => setIsSheetOpen(false)}
                            >
                              <Ban className="h-5 w-5" />
                              <span>Manage Dates</span>
                            </Link>
                        </Button>
                        <Button variant="secondary" asChild className="justify-start p-4 font-bold border-2 border-black rounded-none bg-gray-100 shadow-[4px_4px_0px_0px_#000000]">
                            <Link 
                              href={sheetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-4"
                              onClick={() => setIsSheetOpen(false)}
                            >
                              <SheetIcon className="h-5 w-5" />
                              <span>View Bookings</span>
                            </Link>
                        </Button>
                        <Button variant="secondary" asChild className="justify-start p-4 font-bold border-2 border-black rounded-none bg-gray-100 shadow-[4px_4px_0px_0px_#000000]">
                            <Link 
                              href={calendarUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="flex items-center gap-4"
                              onClick={() => setIsSheetOpen(false)}
                            >
                              <CalendarDays className="h-5 w-5" />
                              <span>View Calendar</span>
                            </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </nav>
              </div>

              {isAdmin && (
                <SheetFooter className="mt-auto border-t-4 border-black p-4 bg-red-100 shrink-0">
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-center text-base font-bold text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white rounded-none uppercase">
                      <LogOut className="mr-2 h-5 w-5"/>
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
