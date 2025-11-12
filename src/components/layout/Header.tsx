'use client';

// 1. Import useState to manage the sidebar's state
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
// Import SheetFooter and SheetTitle for better structure
import { Sheet, SheetContent, SheetTrigger, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'; 
import { 
  Menu, 
  CupSoda, 
  Package, 
  Wrench, 
  HeartHandshake, 
  Ticket, 
  Users, 
  Sparkles,
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
  { href: '/event-builder', label: 'Event Builder', icon: Wrench },
  { href: '/infaq', label: 'Infaq Orders', icon: HeartHandshake },
  // { href: '/ai-stylist', label: 'AI Stylist', icon: Sparkles },
  // { href: '/promotions', label: 'Promotions', icon: Ticket },
  // { href: '/community', label: 'Community', icon: Users },
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M5nf8xC34Y6ZvB5qQCWYoWsSAAplzX1uO6IsPXdxyKE/edit';
const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/month?cid=bac102a37094ab792c29d34b294fa8868ebc2fceee9cbf3a654c59c145064bee@group.calendar.google.com';

export default function Header() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const router = useRouter();

  // 2. Add state to control the sheet's open/closed status
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    setIsSheetOpen(false); // Close sheet on logout
    router.push('/');
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-headline font-bold text-primary hover:text-primary/80 transition-colors">
          BalangConnect
        </Link>
        
        <nav className="hidden md:flex space-x-2 items-center">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" asChild>
              <Link href={item.href} className="flex items-center space-x-2 text-foreground hover:text-primary">
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </Button>
          ))}
          {isAdmin && (
            <>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/manage-dates">
                  <Ban size={16} className="mr-1.5"/> Manage Dates
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={sheetUrl} target="_blank" rel="noopener noreferrer">
                  <SheetIcon size={16} className="mr-1.5"/> Bookings
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarDays size={16} className="mr-1.5"/> Calendar
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-1.5"/> Logout
              </Button>
            </>
          )}
        </nav>

        <div className="md:hidden">
          {/* 3. Control the Sheet component with our new state */}
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col h-full">
              <SheetHeader className="shrink-0">
                <SheetTitle asChild>
                  <Link 
                    href="/" 
                    className="text-2xl font-headline font-bold text-primary"
                    onClick={() => setIsSheetOpen(false)} // Close on click
                  >
                    BalangConnect
                  </Link>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-grow overflow-y-auto py-4">
                <nav className="grid gap-2">
                  {navItems.map((item) => (
                    <Button key={item.label} variant="ghost" asChild className="justify-start text-base p-4">
                      <Link 
                        href={item.href} 
                        className="flex items-center gap-4"
                        onClick={() => setIsSheetOpen(false)} // Close on click
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </Button>
                  ))}
                  {isAdmin && (
                    <>
                      <Separator className="my-4" />
                      <div className="px-4 text-sm font-semibold text-muted-foreground">Admin Tools</div>
                      <Button variant="secondary" asChild className="justify-start text-base p-4">
                          <Link 
                            href="/admin/manage-dates" 
                            className="flex items-center gap-4"
                            onClick={() => setIsSheetOpen(false)} // Close on click
                          >
                            <Ban className="h-5 w-5" />
                            <span>Manage Dates</span>
                          </Link>
                      </Button>
                      <Button variant="secondary" asChild className="justify-start text-base p-4">
                          <Link 
                            href={sheetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-4"
                            onClick={() => setIsSheetOpen(false)} // Close on click
                          >
                            <SheetIcon className="h-5 w-5" />
                            <span>View Bookings</span>
                          </Link>
                      </Button>
                      <Button variant="secondary" asChild className="justify-start text-base p-4">
                          <Link 
                            href={calendarUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-4"
                            onClick={() => setIsSheetOpen(false)} // Close on click
                          >
                            <CalendarDays className="h-5 w-5" />
                            <span>View Calendar</span>
                          </Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>

              {isAdmin && (
                <SheetFooter className="mt-auto border-t pt-4 shrink-0">
                  <Button variant="ghost" onClick={handleLogout} className="w-full justify-center text-base">
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