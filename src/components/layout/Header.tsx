
'use client'; // This component now uses a hook, so it must be a client component.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  CupSoda, 
  Package, 
  Wrench, 
  HeartHandshake, 
  Ticket, 
  Users, 
  Sparkles,
  Sheet as SheetIcon, // aliasing Sheet icon
  CalendarDays,
  Ban,
  LogOut
} from 'lucide-react';
import { useAdmin } from '@/context/AdminContext'; // Import useAdmin hook
import { Separator } from '@/components/ui/separator';

const navItems = [
  { href: '/flavors', label: 'Flavors', icon: CupSoda },
  { href: '/packages', label: 'Packages', icon: Package },
  { href: '/event-builder', label: 'Event Builder', icon: Wrench },
  { href: '/infaq', label: 'Infaq Orders', icon: HeartHandshake },
  { href: '/ai-stylist', label: 'AI Stylist', icon: Sparkles },
  { href: '/promotions', label: 'Promotions', icon: Ticket },
  { href: '/community', label: 'Community', icon: Users },
];

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1M5nf8xC34Y6ZvB5qQCWYoWsSAAplzX1uO6IsPXdxyKE/edit';
const calendarUrl = 'https://calendar.google.com/calendar/u/0/r/month?cid=bac102a37094ab792c29d34b294fa8868ebc2fceee9cbf3a654c59c145064bee@group.calendar.google.com';

export default function Header() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const router = useRouter();

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col space-y-4 mt-8">
                <Link href="/" className="text-xl font-headline font-bold text-primary mb-4">
                  BalangConnect
                </Link>
                {navItems.map((item) => (
                  <Button key={item.label} variant="ghost" asChild className="justify-start">
                    <Link href={item.href} className="flex items-center space-x-3 text-lg">
                      <item.icon size={24} />
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                ))}
                {isAdmin && (
                  <>
                    <Separator className="my-4" />
                    <p className="px-4 text-sm font-semibold text-muted-foreground">Admin Tools</p>
                    <Button variant="secondary" asChild className="justify-start">
                       <Link href="/admin/manage-dates" className="flex items-center space-x-3 text-lg">
                         <Ban size={24} />
                         <span>Manage Dates</span>
                       </Link>
                    </Button>
                    <Button variant="secondary" asChild className="justify-start">
                       <Link href={sheetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-lg">
                         <SheetIcon size={24} />
                         <span>View Bookings</span>
                       </Link>
                    </Button>
                     <Button variant="secondary" asChild className="justify-start">
                       <Link href={calendarUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-lg">
                         <CalendarDays size={24} />
                         <span>View Calendar</span>
                       </Link>
                    </Button>
                    <Separator />
                    <Button variant="ghost" onClick={handleLogout} className="justify-start text-lg">
                       <LogOut size={24} className="mr-3" />
                       <span>Logout</span>
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
