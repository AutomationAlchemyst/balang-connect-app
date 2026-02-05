'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { mockPackages, mockAddons, mockFlavors } from '@/lib/data';
import type { EventPackage } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  PlusCircle,
  MinusCircle,
  ShoppingCart,
  Zap,
  XIcon,
  Check,
  CalendarDays,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Info,
  Waves,
  Sparkles,
  Droplets,
  ChevronRight,
  Package as PackageIcon,
  Truck,
  PartyPopper,
  HelpCircle,
  CheckCircle2,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import BookingSuccessView from '@/components/features/event-builder/BookingSuccessView';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';
import NextImage from 'next/image';
import { Checkbox } from "@/components/ui/checkbox";

const BASE_DELIVERY_FEE = 45.00;
const SPECIAL_DELIVERY_FEE = 20.00;
const EVENT_TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

export interface EventConfig {
  selectedPackage: { name: string; price: string; flavors?: string[] } | null;
  addons: { name: string; quantity: number; price: string; flavors?: string[] }[];
  deliveryFee: number;
  totalPrice: number;
  eventDate?: Date;
  eventTime?: string;
}

export default function EventBuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedPackageFlavors, setSelectedPackageFlavors] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [addonFlavorSelections, setAddonFlavorSelections] = useState<Record<string, (string | undefined)[]>>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(BASE_DELIVERY_FEE);
  const [displayDeliveryFee, setDisplayDeliveryFee] = useState(0);

  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<Date | undefined>(undefined);
  const [selectedEventTime, setSelectedEventTime] = useState<string | undefined>(undefined);

  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentEventConfig, setCurrentEventConfig] = useState<EventConfig | null>(null);

  const [customerDetailsForPayment, setCustomerDetailsForPayment] = useState<CustomerDetailsFormValues | null>(null);
  const [isDeliveryRequested, setIsDeliveryRequested] = useState(false);

  // Success State
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | undefined>(undefined);

  // New state for tabs
  const [activeCategory, setActiveCategory] = useState<'Drinks' | 'Equipment' | 'Services' | 'Live Stations'>('Drinks');

  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isCalendarDataLoading, setIsCalendarDataLoading] = useState(true);

  const resetBookingProcess = () => {
    setSelectedPackage(null);
    setSelectedPackageFlavors([]);
    setSelectedAddons({});
    setAddonFlavorSelections({});
    setSelectedEventDate(undefined);
    setSelectedEventTime(undefined);
    setCustomerDetailsForPayment(null);
    setIsBookingSuccess(false);
    setBookingReference(undefined);
  };

  useEffect(() => {
    const fetchBlockedDates = async () => {
      setIsCalendarDataLoading(true);
      try {
        const dates = await getBlockedDates();
        setBlockedDates(dates.map(d => d.date));
      } catch (error) {
        console.error("Failed to fetch blocked dates for event builder:", error);
        toast({
          title: "Could not load calendar",
          description: "Failed to fetch blocked dates. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsCalendarDataLoading(false);
      }
    };

    fetchBlockedDates();
  }, [toast]);

  const getMaxFlavors = useCallback(() => {
    if (selectedPackage) {
      const flavorChoiceItem = selectedPackage.includedItems.find(item => /choice of (\d+) flavor/i.test(item.toLowerCase()));
      if (flavorChoiceItem) {
        const match = flavorChoiceItem.match(/choice of (\d+) flavor/i);
        if (match && match[1]) return parseInt(match[1], 10);
      }
      const balangCountItem = selectedPackage.includedItems.find(item => item.toLowerCase().includes('balang'));
      if (balangCountItem) {
        const match = balangCountItem.match(/(\d+)\s*x\s*\d+L\s*Balang/i);
        if (match && match[1]) return parseInt(match[1], 10);
      }
    }
    return 0;
  }, [selectedPackage]);

  const requiredFlavorCount = getMaxFlavors();

  const handleAddPackageFlavor = useCallback((flavorId: string) => {
    setSelectedPackageFlavors(prevFlavors => {
      const currentMaxFlavors = getMaxFlavors();
      if (prevFlavors.length < currentMaxFlavors) {
        return [...prevFlavors, flavorId];
      } else {
        setTimeout(() => {
          toast({
            title: "Limit Reached",
            description: `You can only select ${currentMaxFlavors} flavors for this package.`,
            variant: "destructive",
          });
        }, 0);
        return prevFlavors;
      }
    });
  }, [getMaxFlavors, toast]);

  const handleRemovePackageFlavorByIndex = (indexToRemove: number) => {
    setSelectedPackageFlavors(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    setSelectedPackageFlavors([]);
    setSelectedAddons({});
    setAddonFlavorSelections({});
    setIsDeliveryRequested(false);
  }, [selectedPackage]);

  const handleAddonQuantityChange = (addonId: string, change: number) => {
    setSelectedAddons(prev => {
      const newQuantity = (prev[addonId] || 0) + change;
      if (newQuantity <= 0) {
        const { [addonId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addonId]: newQuantity };
    });
  };

  const handleProceedToBook = () => {
    setIsDateTimeModalOpen(true);
  };

  const handleDateTimeSubmit = () => {
    if (!selectedEventDate || !selectedEventTime) {
      toast({
        title: "Selection Required",
        description: "Please select both a date and time to continue.",
        variant: "destructive",
      });
      return;
    }
    setIsDateTimeModalOpen(false);
    setIsCustomerDetailsModalOpen(true);
  };

  const handleCustomerDetailsSubmit = (values: CustomerDetailsFormValues) => {
    setCustomerDetailsForPayment(values);

    const config: EventConfig = {
      selectedPackage: selectedPackage ? {
        name: selectedPackage.name,
        price: selectedPackage.price.toString(),
        flavors: selectedPackageFlavors.map(id => mockFlavors.find(f => f.id === id)?.name || id)
      } : null,
      addons: Object.entries(selectedAddons).map(([id, qty]) => {
        const addon = mockAddons.find(a => a.id === id);
        return {
          name: addon?.name || id,
          quantity: qty,
          price: (addon?.price || 0).toString(),
          flavors: addonFlavorSelections[id] as string[]
        };
      }),
      deliveryFee: displayDeliveryFee,
      totalPrice: totalPrice,
      eventDate: selectedEventDate,
      eventTime: selectedEventTime
    };

    setCurrentEventConfig(config);
    setIsCustomerDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  useEffect(() => {
    let currentTotal = 0;
    let deliveryFeeApplied = false;

    if (selectedPackage) {
      currentTotal += selectedPackage.price;
      // All-inclusive packages already include setup/delivery in their base price
      if (!selectedPackage.isAllInclusive && selectedPackage.setupFee > 0) {
        currentTotal += selectedPackage.setupFee;
        deliveryFeeApplied = true;
      }
    }

    Object.entries(selectedAddons).forEach(([id, qty]) => {
      const addon = mockAddons.find(a => a.id === id);
      if (addon) {
        currentTotal += addon.price * qty;
      }
    });

    // Add 17L Delivery Fee if requested
    let displayFee = deliveryFeeApplied ? (selectedPackage?.setupFee || 0) : 0;
    if (selectedPackage?.id === 'pkg_17l_self_pickup' && isDeliveryRequested) {
      currentTotal += 20;
      displayFee = 20;
    }

    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(displayFee);
  }, [selectedPackage, selectedAddons, isDeliveryRequested]);

  const hasSelection = selectedPackage !== null || Object.keys(selectedAddons).length > 0;
  const canProceed = selectedPackage !== null && selectedPackageFlavors.length === requiredFlavorCount;

  if (isBookingSuccess) {
    return (
      <div className="relative min-h-screen bg-[#fdfaf5] selection:bg-[#0df2df]/20 selection:text-[#0d1c1b] pt-24 pb-40">
        <BookingSuccessView
          slotId={bookingReference}
          onReset={resetBookingProcess}
          customerName={customerDetailsForPayment?.fullName || "Valued Customer"}
          eventDate={selectedEventDate || currentEventConfig?.eventDate}
          eventTime={selectedEventTime || currentEventConfig?.eventTime}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fdfaf5] dark:bg-[#102221] text-[#0d1c1b] dark:text-white pb-64 font-display antialiased transition-colors duration-300">

      {/* Top Navigation Bar - Premium Stitch Style */}
      <header className="sticky top-0 z-50 bg-[#fdfaf5]/80 dark:bg-[#102221]/80 backdrop-blur-md border-b border-[#0d1c1b]/5 dark:border-white/5">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center p-4 pb-2 justify-between">
            <div className="size-12 flex items-center justify-start">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display uppercase tracking-widest">
              Event Builder
            </h2>
            <div className="w-12 flex items-center justify-end">
              <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-transparent text-[#0d1c1b] dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Page Indicators / Stepper */}
          <div className="flex w-full flex-row items-center justify-center gap-3 py-4">
            <div className={cn("h-1.5 w-8 rounded-full transition-all duration-500", !hasSelection ? "bg-primary shadow-sm shadow-primary/40" : "bg-primary/30")}></div>
            <div className={cn("h-1.5 w-8 rounded-full transition-all duration-500", (hasSelection && !canProceed) ? "bg-primary shadow-sm shadow-primary/40" : "bg-primary/30")}></div>
            <div className={cn("h-1.5 w-2 rounded-full", canProceed ? "bg-primary" : "bg-deep-ocean/10 dark:bg-white/10")}></div>
            <div className="h-1.5 w-2 rounded-full bg-deep-ocean/10 dark:bg-white/10"></div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto py-8">
        {/* Section 01: Foundation */}
        <section className="px-4 mb-12">
          <div className="flex flex-col mb-8">
            <h3 className="text-[#0d1c1b] dark:text-white tracking-light text-3xl font-black leading-tight mb-2 font-display uppercase italic">
              1. Foundation
            </h3>
            <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold">Choose the base for your coastal event.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockPackages.map((pkg: EventPackage) => {
              const isSelected = selectedPackage?.id === pkg.id;
              const packageImages: Record<string, string> = {
                'pkg_wedding_corporate': 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800',
                'pkg_charlies_angels': 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800',
                'pkg_bongo_player': 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800',
                'pkg_17l_self_pickup': 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=800'
              };

              return (
                <div
                  key={pkg.id}
                  className={cn(
                    "p-1 rounded-[2.5rem] transition-all duration-500 cursor-pointer group hover:scale-[1.01] active:scale-[0.99]",
                    isSelected
                      ? "bg-gradient-to-br from-primary to-orange-200 shadow-2xl shadow-primary/20 scale-[1.02]"
                      : "bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-white/40 shadow-sm"
                  )}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <div className="bg-white dark:bg-[#1a2e2d] flex flex-col items-stretch justify-start rounded-[2.25rem] overflow-hidden border border-white/50 relative">
                    <div className="w-full h-48 relative overflow-hidden">
                      <NextImage
                        src={packageImages[pkg.id] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800'}
                        alt={pkg.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {pkg.isAllInclusive && (
                        <div className="absolute top-4 right-4 bg-primary text-[#0d1c1b] text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl animate-pulse">
                          Featured Choice
                        </div>
                      )}
                      <div className="absolute bottom-4 left-6">
                        <p className="text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-1 drop-shadow-md">
                          {pkg.setupFee > 0 ? 'Full Service' : 'Self Service'}
                        </p>
                        <h4 className="text-white text-2xl font-black font-display uppercase leading-tight drop-shadow-lg">
                          {pkg.name}
                        </h4>
                      </div>
                    </div>

                    <div className="p-8">
                      <div className="flex justify-between items-end mb-6">
                        <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold italic max-w-[70%]">
                          "{pkg.description}"
                        </p>
                        <p className="text-3xl font-black text-[#0d1c1b] dark:text-primary font-display">${pkg.price}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 mb-8 py-4 border-y border-[#0d1c1b]/5 dark:border-white/5">
                        {pkg.includedItems.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-primary" />
                            <p className="text-[#0d1c1b]/80 dark:text-white/80 text-xs font-bold uppercase tracking-tight line-clamp-1">{item}</p>
                          </div>
                        ))}
                      </div>

                      {pkg.id === 'pkg_17l_self_pickup' && (
                        <div className="flex items-center space-x-3 mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/20 animate-in fade-in slide-in-from-left-4">
                          <Checkbox
                            id="delivery-opt-in"
                            checked={isDeliveryRequested}
                            onCheckedChange={(checked) => setIsDeliveryRequested(checked === true)}
                            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-[#0d1c1b]"
                          />
                          <Label htmlFor="delivery-opt-in" className="text-sm font-black uppercase tracking-tight text-[#0d1c1b] dark:text-white cursor-pointer select-none">
                            Request Delivery <span className="text-primary ml-1">(+$20.00)</span>
                          </Label>
                        </div>
                      )}

                      <Button
                        className={cn(
                          "w-full h-14 rounded-2xl font-black uppercase text-base transition-all active:scale-95 tracking-widest border-none shadow-xl",
                          isSelected
                            ? "bg-primary text-[#0d1c1b] hover:bg-primary/90 shadow-primary/30"
                            : "bg-[#0d1c1b] text-white hover:bg-[#0d1c1b]/90 shadow-black/20"
                        )}
                      >
                        {isSelected ? 'Foundation Selected' : 'Choose Foundation'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 2: CURATION (FLAVORS) */}
        {selectedPackage && requiredFlavorCount > 0 && (
          <section id="step-flavors" className="px-4 mt-12 mb-12">
            <div className="flex items-baseline justify-between pt-5 pb-2">
              <h3 className="text-[#0d1c1b] dark:text-white tracking-light text-2xl font-black leading-tight font-display uppercase italic">
                2. Curation
              </h3>
              <span className="bg-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {selectedPackageFlavors.length}/{requiredFlavorCount} Selected
              </span>
            </div>
            <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold mb-8">
              Pick signature Balang flavors for your guests.
            </p>

            <div className="flex flex-wrap gap-3 mb-10 justify-center animate-in fade-in slide-in-from-top-4 duration-700">
              {Array.from({ length: requiredFlavorCount }).map((_, idx) => {
                const selectedFlavorId = selectedPackageFlavors[idx];
                const flavor = selectedFlavorId ? mockFlavors.find(f => f.id === selectedFlavorId) : null;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "group relative w-24 h-24 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all duration-500",
                      flavor
                        ? "border-primary bg-white dark:bg-[#1a2e2d] shadow-lg shadow-primary/10 border-solid"
                        : "border-[#0d1c1b]/10 dark:border-white/10 bg-black/5 dark:bg-white/5"
                    )}
                  >
                    {flavor ? (
                      <>
                        <div className="relative w-10 h-10 mb-1">
                          <NextImage
                            src={flavor.imageUrl || 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=100'}
                            alt={flavor.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <span className="text-[8px] font-black uppercase leading-[1.1] text-[#0d1c1b] dark:text-white line-clamp-2 px-1">
                          {flavor.name}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePackageFlavorByIndex(idx);
                          }}
                          className="absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg active:scale-90"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <div className="size-6 rounded-full border-2 border-[#0d1c1b]/5 dark:border-white/5 flex items-center justify-center">
                          <Plus size={10} className="text-[#0d1c1b]/20 dark:text-white/20" />
                        </div>
                        <span className="text-[9px] font-black uppercase text-[#0d1c1b]/20 dark:text-white/20 tracking-tighter">Slot {idx + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {mockFlavors.map((flavor: any) => {
                const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                const isSelected = count > 0;
                const canAdd = selectedPackageFlavors.length < requiredFlavorCount;

                return (
                  <div key={flavor.id} className="group relative">
                    <div className={cn(
                      "aspect-square rounded-[2rem] bg-white dark:bg-[#1a2e2d] border-2 transition-all duration-500 p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden",
                      isSelected
                        ? "border-primary shadow-xl shadow-primary/10"
                        : "border-transparent dark:border-white/5 hover:border-primary/30"
                    )}>
                      {/* Count Badge */}
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-primary text-[#0d1c1b] size-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg animate-in zoom-in duration-300">
                          {count}
                        </div>
                      )}

                      {/* Flavor Image */}
                      <div className="relative w-20 h-20 mb-4 transition-transform duration-500 group-hover:scale-110">
                        <NextImage
                          src={flavor.imageUrl || 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=200'}
                          alt={flavor.name}
                          fill
                          className="object-cover rounded-2xl shadow-md"
                        />
                      </div>

                      <div className="mb-4">
                        <p className="text-[#0d1c1b] dark:text-white font-black text-sm uppercase leading-tight tracking-tight">
                          {flavor.name}
                        </p>
                        <p className="text-[#0d1c1b]/50 dark:text-white/50 text-[10px] font-bold mt-1 uppercase">
                          Premium Choice
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            const lastIdx = selectedPackageFlavors.lastIndexOf(flavor.id);
                            if (lastIdx !== -1) handleRemovePackageFlavorByIndex(lastIdx);
                          }}
                          disabled={!isSelected}
                          className={cn(
                            "size-10 rounded-full flex items-center justify-center border-2 transition-all",
                            isSelected
                              ? "border-primary text-primary hover:bg-primary hover:text-[#0d1c1b]"
                              : "border-[#0d1c1b]/5 dark:border-white/5 text-[#0d1c1b]/20 dark:text-white/20 cursor-not-allowed"
                          )}
                        >
                          <Minus size={18} strokeWidth={3} />
                        </button>

                        <button
                          onClick={() => handleAddPackageFlavor(flavor.id)}
                          disabled={!canAdd}
                          className={cn(
                            "size-10 rounded-full flex items-center justify-center bg-primary text-[#0d1c1b] shadow-lg transition-all active:scale-90",
                            !canAdd && "opacity-30 cursor-not-allowed grayscale"
                          )}
                        >
                          <Plus size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 3: AMPLIFICATION (ADD-ONS) */}
        {selectedPackage?.id !== 'pkg_17l_self_pickup' && (
          <section id="step-addons" className="px-4 mt-6 mb-12">
            <div className="flex flex-col mb-8 pt-5">
              <h3 className="text-[#0d1c1b] dark:text-white tracking-light text-2xl font-black leading-tight font-display uppercase italic">
                3. Amplification
              </h3>
              <p className="text-[#0d1c1b]/60 dark:text-white/60 text-sm font-bold mt-1">
                Add the finishing touches to your coastal event.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#0d1c1b]/5 dark:border-white/5 px-2 gap-8 mb-8 overflow-x-auto custom-scrollbar">
              {(['Drinks', 'Equipment', 'Services', 'Live Stations'] as const).map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "flex flex-col items-center justify-center border-b-[3px] pb-4 pt-2 transition-all duration-300 min-w-max",
                    activeCategory === category
                      ? "border-primary text-primary"
                      : "border-transparent text-[#0d1c1b]/60 dark:text-white/60 hover:text-primary/60"
                  )}
                >
                  <p className="text-sm font-black uppercase tracking-widest">{category}</p>
                </button>
              ))}
            </div>

            {/* Add-on Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {mockAddons.filter((a: any) => a.category === activeCategory || (activeCategory === 'Equipment' && a.category === 'Food')).map((addon: any) => {
                const qty = selectedAddons[addon.id] || 0;
                const isSelected = qty > 0;
                const isBalangAddon = addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l' || addon.id === 'addon_infused_water_23l';

                return (
                  <div
                    key={addon.id}
                    className={cn(
                      "flex flex-col bg-white dark:bg-[#1a2e2d] rounded-3xl transition-all duration-500 border overflow-hidden",
                      isSelected ? "border-primary bg-white shadow-xl shadow-primary/5" : "border-[#0d1c1b]/5 dark:border-white/5 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-[#f4efeb] dark:bg-white/5 relative">
                        <NextImage
                          src={addon.id.includes('balang') ? 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=300' : 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&w=300'}
                          alt={addon.name}
                          fill
                          className="object-cover opacity-80"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between min-h-24">
                        <div>
                          <h4 className="font-black text-base leading-tight uppercase text-[#0d1c1b] dark:text-white">{addon.name}</h4>
                          <p className="text-[10px] font-bold text-[#0d1c1b]/60 dark:text-white/60 mt-1 uppercase tracking-tight">{addon.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-primary text-xl">${addon.price.toFixed(2)}</span>
                          <div className="flex items-center gap-4 bg-[#fdfaf5] dark:bg-white/5 p-1 rounded-full border border-[#0d1c1b]/5 dark:border-white/10">
                            <button
                              onClick={() => handleAddonQuantityChange(addon.id, -1)}
                              className="size-10 flex items-center justify-center rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:border-primary/30 disabled:text-primary/30"
                              disabled={qty === 0}
                            >
                              <MinusCircle className="h-5 w-5" />
                            </button>
                            <span className="text-base font-black w-6 text-center text-[#0d1c1b] dark:text-white">{qty}</span>
                            <button
                              onClick={() => handleAddonQuantityChange(addon.id, 1)}
                              className="size-10 flex items-center justify-center rounded-full bg-primary text-[#0d1c1b] shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                            >
                              <PlusCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flavor Selection for add-ons */}
                    {isSelected && isBalangAddon && Array.from({ length: qty }).map((_, idx: number) => (
                      <div key={idx} className="px-4 pb-4 animate-in slide-in-from-top-2">
                        <div className="bg-[#fdfaf5] dark:bg-black/20 p-4 rounded-2xl border border-dashed border-primary/30 flex items-center justify-between gap-4">
                          <Label className="uppercase text-[10px] font-black text-primary tracking-widest pl-1">Balang #{idx + 1} Flavor</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-10 rounded-full bg-white dark:bg-white/5 border-primary/20 text-[#0d1c1b] dark:text-white font-black text-xs uppercase tracking-wide px-6 hover:bg-primary/10 hover:border-primary shadow-sm transition-all">
                                {addonFlavorSelections[addon.id]?.[idx] || "Select Flavor"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-2 bg-white/95 dark:bg-[#1a2e2d]/95 backdrop-blur-xl border-primary/20 rounded-2xl shadow-2xl">
                              <div className="grid grid-cols-1 gap-1">
                                {mockFlavors.map((f: any) => (
                                  <button
                                    key={f.id}
                                    onClick={() => setAddonFlavorSelections(prev => {
                                      const newSelections = { ...prev };
                                      const currentSelections = [...(prev[addon.id] || [])];
                                      currentSelections[idx] = f.name;
                                      newSelections[addon.id] = currentSelections;
                                      return newSelections;
                                    })}
                                    className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#0d1c1b] dark:text-white hover:bg-primary hover:text-[#0d1c1b] transition-colors"
                                  >
                                    {f.name}
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Fixed Bottom Checkout Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fdfaf5]/80 dark:bg-[#102221]/80 backdrop-blur-xl border-t border-[#0d1c1b]/5 dark:border-white/5 safe-bottom">
        <div className="container max-w-7xl mx-auto p-4 md:px-8 pb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#0d1c1b]/40 dark:text-white/40">Total Estimation</span>
              <p className="text-3xl font-black text-primary tracking-tighter italic">${totalPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Sync</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleProceedToBook}
            disabled={!canProceed}
            className={cn(
              "w-full h-16 rounded-[1.5rem] font-black uppercase text-xl shadow-2xl transition-all active:scale-95 tracking-widest",
              canProceed
                ? "bg-primary text-[#0d1c1b] hover:bg-primary/90 shadow-primary/30"
                : "bg-[#0d1c1b]/10 text-[#0d1c1b]/20 dark:text-white/10 cursor-not-allowed border border-[#0d1c1b]/5"
            )}
          >
            {isCalendarDataLoading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <div className="flex items-center gap-3">
                Continue to Book <ArrowRight className="h-6 w-6" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Date & Time Modal */}
      <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[480px] p-0 border-0 bg-transparent shadow-none">
          <div className="bg-white dark:bg-[#1a2e2d] rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col w-full border border-white/20">
            <div className="overflow-y-auto p-8 space-y-6 flex-1 min-h-0 w-full custom-scrollbar">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <CalendarDays className="text-primary h-8 w-8" />
                </div>
                <DialogTitle className="font-black text-2xl uppercase text-[#0d1c1b] dark:text-white tracking-tighter italic">Select Date</DialogTitle>
                <DialogDescription className="text-xs text-[#0d1c1b]/60 dark:text-white/60 font-black uppercase tracking-widest">Coastal Availability Check</DialogDescription>
              </div>

              <div className="flex justify-center bg-[#fdfaf5] dark:bg-black/20 p-4 rounded-[2rem] border border-[#0d1c1b]/5 dark:border-white/5 text-slate-900 dark:text-white">
                <Calendar
                  mode="single"
                  selected={selectedEventDate}
                  onSelect={setSelectedEventDate}
                  disabled={[
                    ...blockedDates,
                    { before: new Date(new Date().setHours(0, 0, 0, 0)) }
                  ]}
                  className="p-3 w-fit"
                />
              </div>

              <div className="space-y-4 bg-primary/5 p-6 rounded-[2rem] border border-primary/20">
                <div className="flex items-center justify-between pl-1">
                  <Label className="uppercase text-[10px] font-black text-primary tracking-widest">Select Event Time</Label>
                  <Info size={16} className="text-primary/40" />
                </div>
                <Select value={selectedEventTime} onValueChange={setSelectedEventTime}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-white/5 border-primary/20 font-black text-slate-700 dark:text-white shadow-sm uppercase text-sm tracking-wide">
                    <SelectValue placeholder="--:-- --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-[220px] dark:bg-[#1a2e2d] dark:border-white/10">
                    {EVENT_TIME_SLOTS.map((t: string) => (
                      <SelectItem key={t} value={t} className="font-black uppercase text-xs rounded-xl cursor-pointer my-1 text-slate-900 dark:text-white hover:bg-primary transition-colors">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] font-bold text-primary italic pl-2 leading-relaxed opacity-60">
                  Note: Pickup or delivery coordination will be confirmed by our team following your booking.
                </p>
              </div>
            </div>
            <div className="p-8 pt-2 flex-shrink-0 border-t border-[#0d1c1b]/5 dark:border-white/5">
              <DialogFooter>
                <Button onClick={handleDateTimeSubmit} className="w-full h-14 bg-primary text-[#0d1c1b] font-black uppercase rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Confirm Date</Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Modal */}
      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-xl p-0 border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">Final Details</DialogTitle>
          <DialogDescription className="sr-only">Provide your contact information and event details to proceed.</DialogDescription>
          <div className="bg-white dark:bg-[#1a2e2d] m-1 rounded-[2.5rem] shadow-2xl w-full p-8 border border-white/20">
            <CustomerDetailsForm
              onSubmit={handleCustomerDetailsSubmit}
              onCancel={() => setIsCustomerDetailsModalOpen(false)}
              onBack={() => {
                setIsCustomerDetailsModalOpen(false);
                setIsDateTimeModalOpen(true);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation */}
      {
        customerDetailsForPayment && currentEventConfig && currentEventConfig.eventDate && (
          <PaymentConfirmationDialog
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            eventConfig={currentEventConfig as EventConfig & { eventDate: Date }}
            customerDetails={customerDetailsForPayment}
            onConfirm={() => {
              setBookingReference(`BK-${Math.floor(Math.random() * 10000)}`);
              setIsPaymentModalOpen(false);
              setIsBookingSuccess(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBack={() => {
              setIsPaymentModalOpen(false);
              setIsCustomerDetailsModalOpen(true);
            }}
          />
        )
      }
    </div >
  );
}