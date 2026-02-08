'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { mockCorporatePackages, mockCorporateAddons } from '@/lib/corporate-data';
import { mockFlavors } from '@/lib/data';
import type { EventPackage } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  HelpCircle,
  Plus,
  Minus,
  X,
  XIcon,
  Check,
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowRight,
  PlusCircle,
  MinusCircle,
  ShoppingCart,
  Loader2,
  CalendarDays,
  Zap,
  PackageIcon,
  Truck,
  Star,
  Droplets,
  Waves,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
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

export default function CorporateOrdersPage() {
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
  const [activeAddonFlavorPopover, setActiveAddonFlavorPopover] = useState<{ addonId: string; balangIndex: number } | null>(null);

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

  useEffect(() => {
    setIsDeliveryRequested(false);
    setSelectedPackageFlavors([]);

    // Clear add-ons if 17L package is selected
    if (selectedPackage?.id === 'pkg_17l_self_pickup') {
      setSelectedAddons({});
      setAddonFlavorSelections({});
    }
  }, [selectedPackage]);

  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isCalendarDataLoading, setIsCalendarDataLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      setIsCalendarDataLoading(true);
      try {
        const dates = await getBlockedDates();
        setBlockedDates(dates.map(d => d.date));
      } catch (error) {
        console.error("Failed to fetch blocked dates for event builder:", error);
      } finally {
        setIsCalendarDataLoading(false);
      }
    };

    fetchBlockedDates();
  }, []);

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

  const handleAddPackageFlavor = useCallback((flavorId: string) => {
    setSelectedPackageFlavors(prevFlavors => {
      const currentMaxFlavors = getMaxFlavors();
      if (prevFlavors.length < currentMaxFlavors) {
        return [...prevFlavors, flavorId];
      } else {
        toast({
          title: "Limit Reached",
          description: `You can only select ${currentMaxFlavors} flavors for this package.`,
          variant: "destructive",
        });
        return prevFlavors;
      }
    });
  }, [getMaxFlavors, toast]);

  const handleRemovePackageFlavorByIndex = (indexToRemove: number) => {
    setSelectedPackageFlavors(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const defaultPackageIdFromUrl = searchParams.get('defaultPackageId');
    if (defaultPackageIdFromUrl) {
      const packageToSet = mockCorporatePackages.find(p => p.id === defaultPackageIdFromUrl);
      if (packageToSet && selectedPackage?.id !== packageToSet.id) {
        setSelectedPackage(packageToSet);
      }
    }
  }, [searchParams, selectedPackage?.id]);


  // Price Calculation Logic
  useEffect(() => {
    let currentTotal = 0;
    let deliveryFeeApplied = false;

    if (selectedPackage) {
      currentTotal += selectedPackage.price;
      setDeliveryFee(0);
    } else {
      setDeliveryFee(BASE_DELIVERY_FEE);
    }

    const addonsSelectedList = Object.entries(selectedAddons).filter(([, quantity]) => quantity > 0);
    if (addonsSelectedList.length > 0) {
      addonsSelectedList.forEach(([addonId, quantity]) => {
        const addon = mockCorporateAddons.find(a => a.id === addonId);
        if (addon) {
          currentTotal += addon.price * quantity;
        }
      });
    }

    if (addonsSelectedList.length > 0 && !selectedPackage) {
      currentTotal += deliveryFee;
      deliveryFeeApplied = true;
    } else if (selectedPackage && !selectedPackage.isAllInclusive) {
      if (selectedPackage?.id === 'pkg_17l_self_pickup' && !isDeliveryRequested) {
        // No delivery fee
      } else {
        const feeToApply = selectedPackage?.id === 'pkg_17l_self_pickup' ? SPECIAL_DELIVERY_FEE : deliveryFee;
        currentTotal += feeToApply;
        deliveryFeeApplied = true;
      }
    }

    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? (selectedPackage?.id === 'pkg_17l_self_pickup' ? SPECIAL_DELIVERY_FEE : deliveryFee) : 0);
  }, [selectedPackage, selectedAddons, deliveryFee, isDeliveryRequested]);


  const handleAddonToggle = (addonId: string, checked: boolean) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      if (checked) {
        newAddons[addonId] = 1;
      } else {
        delete newAddons[addonId];
      }
      return newAddons;
    });
  };

  const handleAddonQuantityChange = (addonId: string, change: number) => {
    setSelectedAddons(prev => {
      const currentQty = prev[addonId] || 0;
      const newQuantity = currentQty + change;

      // Update flavor selections array size
      setAddonFlavorSelections(prevFlavors => {
        const currentFlavors = prevFlavors[addonId] || [];
        if (change > 0) {
          // Add empty slots for new items
          return { ...prevFlavors, [addonId]: [...currentFlavors, undefined] };
        } else if (change < 0) {
          // Remove last item's flavor selection
          return { ...prevFlavors, [addonId]: currentFlavors.slice(0, newQuantity) };
        }
        return prevFlavors;
      });

      if (newQuantity <= 0) {
        const { [addonId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [addonId]: newQuantity };
    });
  };

  const handleUpdateAddonFlavor = (addonId: string, index: number, flavorId: string) => {
    setAddonFlavorSelections(prev => {
      const currentFlavors = [...(prev[addonId] || [])];
      currentFlavors[index] = flavorId;
      return { ...prev, [addonId]: currentFlavors };
    });
  };

  const handleProceedToBook = () => {
    if (!selectedPackage && Object.keys(selectedAddons).filter(key => selectedAddons[key] > 0).length === 0) {
      toast({
        title: "Selection Needed",
        description: "Please select a package or add-on to continue.",
        variant: "destructive",
      });
      return;
    }

    const requiredFlavorCountForPackage = selectedPackage ? getMaxFlavors() : 0;
    if (selectedPackage && requiredFlavorCountForPackage > 0 && selectedPackageFlavors.length < requiredFlavorCountForPackage) {
      toast({
        title: "Missing Flavors",
        description: `Please select all ${requiredFlavorCountForPackage} flavors for the ${selectedPackage.name}.`,
        variant: "destructive",
      });
      return;
    }

    // Validate Add-on Flavors
    const missingAddonFlavors: string[] = [];
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      const addon = mockCorporateAddons.find(a => a.id === addonId);
      if (addon?.requiresFlavor && qty > 0) {
        const flavors = addonFlavorSelections[addonId] || [];
        // Check if we have enough flavor selections and all are defined
        if (flavors.length < qty || flavors.includes(undefined) || flavors.some(f => f === "")) {
          missingAddonFlavors.push(addon.name);
        }
      }
    });

    if (missingAddonFlavors.length > 0) {
      toast({
        title: "Missing Flavors for Add-ons",
        description: `Please select flavors for: ${missingAddonFlavors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    const packageFlavorDetails = selectedPackageFlavors
      .map(id => mockFlavors.find(f => f.id === id)?.name)
      .filter((name): name is string => !!name);

    const addonsDetails = Object.entries(selectedAddons)
      .map(([addonId, quantity]) => {
        if (quantity === 0) return null;
        const addon = mockCorporateAddons.find(a => a.id === addonId);
        if (!addon) return null;

        let flavors: string[] | undefined = undefined;
        if (addon.requiresFlavor) {
          const flavorIds = addonFlavorSelections[addonId] || [];
          flavors = flavorIds.map(fid => mockFlavors.find(f => f.id === fid)?.name).filter((n): n is string => !!n);
        }

        return {
          name: addon.name,
          quantity,
          price: (addon.price * quantity).toFixed(2),
          ...(flavors && flavors.length > 0 && { flavors }),
        };
      })
      .filter((detail): detail is NonNullable<typeof detail> => detail !== null);

    const initialConfig: Omit<EventConfig, 'eventDate' | 'eventTime'> = {
      selectedPackage: selectedPackage ? {
        name: selectedPackage.name,
        price: selectedPackage.price.toFixed(2),
        ...(packageFlavorDetails.length > 0 && { flavors: packageFlavorDetails }),
      } : null,
      addons: addonsDetails.length > 0 ? addonsDetails : [],
      deliveryFee: displayDeliveryFee,
      totalPrice: totalPrice,
    };

    setCurrentEventConfig(initialConfig as EventConfig);
    setIsDateTimeModalOpen(true);
  };

  const handleDateTimeSubmit = () => {
    if (!selectedEventDate || !selectedEventTime) {
      toast({ title: "Date & Time Required", description: "Please select both a date and a time slot.", variant: "destructive", });
      return;
    }
    if (currentEventConfig) {
      setCurrentEventConfig({
        ...currentEventConfig,
        eventDate: selectedEventDate,
        eventTime: selectedEventTime,
      });
    }
    setIsDateTimeModalOpen(false);
    setIsCustomerDetailsModalOpen(true);
  };

  const handleCustomerDetailsSubmit = (customerData: CustomerDetailsFormValues) => {
    if (!currentEventConfig) return;
    setCustomerDetailsForPayment(customerData);
    setIsCustomerDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const resetBookingProcess = () => {
    setSelectedPackage(null);
    setSelectedPackageFlavors([]);
    setSelectedAddons({});
    setAddonFlavorSelections({});
    setCurrentEventConfig(null);
    setSelectedEventDate(undefined);
    setSelectedEventTime(undefined);
    setCustomerDetailsForPayment(null);
    setIsPaymentModalOpen(false);
    setIsBookingSuccess(false);
    setBookingReference(undefined);
  };

  const packageIsSelected = !!selectedPackage;
  const requiredFlavorCountForPackage = packageIsSelected ? getMaxFlavors() : 0;
  const canProceed = (packageIsSelected && (requiredFlavorCountForPackage > 0 ? selectedPackageFlavors.length === requiredFlavorCountForPackage : true)) || (!packageIsSelected && Object.keys(selectedAddons).some(k => selectedAddons[k] > 0));

  if (isBookingSuccess) {
    return (
      <div className="relative min-h-screen bg-[#f9f7f2] dark:bg-[#102022] pb-40">
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

  // --- STITCH STRUCTURED UI IMPLEMENTATION ---

  return (
    <div className="relative min-h-screen bg-[#f9f7f2] dark:bg-[#102022] font-display text-[#0d1a1b] dark:text-white transition-colors duration-300 pb-32 lg:pb-12">

      {/* 1. Header & Stepper */}
      <header className="sticky top-0 z-50 flex items-center bg-[#f9f7f2]/90 dark:bg-[#102022]/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-[#f2eee4] dark:border-white/10">
        <div className="text-[#0d1a1b] dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer" onClick={() => router.push('/')}>
          <ArrowLeft size={24} />
        </div>
        <h2 className="text-[#0d1a1b] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Design Your Experience</h2>
      </header>

      {/* Stepper Dots */}
      <div className="flex w-full flex-row items-center justify-center gap-3 py-6">
        <div className={cn("h-1.5 w-8 rounded-full shadow-sm transition-all", selectedPackage ? "bg-brand-stitch-structured-primary shadow-brand-stitch-structured-primary/30" : "bg-brand-stitch-structured-primary")}></div>
        <div className={cn("h-1.5 w-1.5 rounded-full transition-all", selectedPackage ? "bg-brand-stitch-structured-primary" : "bg-brand-stitch-structured-primary/20 dark:bg-white/20")}></div>
        <div className={cn("h-1.5 w-1.5 rounded-full transition-all", Object.keys(selectedAddons).length > 0 ? "bg-brand-stitch-structured-primary" : "bg-brand-stitch-structured-primary/20 dark:bg-white/20")}></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8">

        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">

          {/* LEFT COLUMN: BUILDER STEPS */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-8">

            {/* SECTION: STEP 1 - FOUNDATION (PACKAGE) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="pb-6">
                <h2 className="text-[#0d1a1b] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-2 pt-2">Step 1: Select Package</h2>
                <p className="text-[#0d1a1b]/60 dark:text-white/60 text-sm font-medium leading-relaxed">Choose a curated experience or build your own bespoke event.</p>
              </div>

              {/* Dropdown UI for Package Selection */}
              <div className="flex flex-col gap-4 py-3">
                <label className="flex flex-col w-full">
                  <p className="text-[#0d1a1b] dark:text-white text-base font-semibold leading-normal pb-2">Pre-defined Packages</p>
                  <div className="relative group">
                    <select
                      className="w-full rounded-xl text-[#0d1a1b] dark:text-white border border-[#f2eee4] dark:border-white/10 bg-white dark:bg-[#0d1a1b]/40 h-14 px-4 text-base font-normal focus:ring-2 focus:ring-brand-stitch-structured-primary focus:border-brand-stitch-structured-primary transition-all shadow-sm appearance-none"
                      onChange={(e) => {
                        const pkg = mockCorporatePackages.find(p => p.id === e.target.value);
                        setSelectedPackage(pkg || null);
                      }}
                      value={selectedPackage?.id || ""}
                    >
                      <option value="" disabled>Select from premium options</option>
                      {mockCorporatePackages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} (${pkg.price})
                        </option>
                      ))}
                    </select>
                    {/* Custom Arrow Icon */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#0d1a1b]/50 dark:text-white/50">
                      <ChevronRight className="rotate-90" size={20} />
                    </div>
                  </div>
                </label>
              </div>

              {/* Selected Package Details (If any) */}
              {selectedPackage && (
                <div className="mt-2 mb-6 bg-white dark:bg-[#102221] border border-brand-stitch-structured-primary/20 rounded-xl p-5 shadow-lg shadow-brand-stitch-structured-primary/5 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-lg text-[#0d1a1b] dark:text-white">{selectedPackage.name}</h4>
                    <span className="font-bold text-brand-stitch-structured-primary">${selectedPackage.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPackage.includedItems.slice(0, 3).map((item, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider bg-[#0d1a1b]/5 dark:bg-white/10 px-2 py-1 rounded text-[#0d1a1b]/60 dark:text-white/60">{item}</span>
                    ))}
                  </div>
                  <p className="text-xs text-[#0d1a1b]/50 dark:text-white/50 italic">{selectedPackage.description}</p>

                  {/* Delivery Opt-in for Self-Pickup 17L Package */}
                  {selectedPackage.id === 'pkg_17l_self_pickup' && (
                    <div className="mt-4 pt-4 border-t border-[#f2eee4] dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="delivery-opt-in"
                          checked={isDeliveryRequested}
                          onCheckedChange={(checked) => setIsDeliveryRequested(!!checked)}
                          className="border-2 border-brand-stitch-structured-primary data-[state=checked]:bg-brand-stitch-structured-primary data-[state=checked]:text-black"
                        />
                        <Label htmlFor="delivery-opt-in" className="text-xs font-bold uppercase tracking-widest text-[#0d1a1b]/60 dark:text-white/60 cursor-pointer">
                          Add Delivery & Support (+$20)
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bespoke Button Removed */}

            </section>

            {/* SECTION: STEP 2 - CURATION (FLAVORS) - Only if package requires it */}
            {selectedPackage && requiredFlavorCountForPackage > 0 && (
              <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex justify-between items-baseline pb-4 pt-4 border-t border-[#f2eee4] dark:border-white/5">
                  <h2 className="text-[#0d1a1b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">Step 2: Curation</h2>
                  <span className="text-brand-stitch-structured-primary text-xs font-bold uppercase tracking-widest bg-brand-stitch-structured-primary/10 px-2 py-1 rounded">
                    {selectedPackageFlavors.length}/{requiredFlavorCountForPackage}
                  </span>
                </div>
                <p className="text-[#0d1a1b]/60 dark:text-white/60 text-sm font-medium leading-relaxed mb-6">Select your premium Balang flavors.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockFlavors.map(flavor => {
                    const qty = selectedPackageFlavors.filter(id => id === flavor.id).length;
                    const isSelected = qty > 0;
                    // Max flavors reached if total selected >= limit
                    const isLimitReached = selectedPackageFlavors.length >= requiredFlavorCountForPackage;

                    return (
                      <div
                        key={flavor.id}
                        className={cn(
                          "group flex items-center justify-between p-3 bg-white dark:bg-[#0d1a1b]/40 rounded-xl border transition-all duration-300 shadow-sm",
                          isSelected
                            ? "border-brand-stitch-structured-primary ring-1 ring-brand-stitch-structured-primary shadow-brand-stitch-structured-primary/20"
                            : "border-[#f2eee4] dark:border-white/5 hover:border-brand-stitch-structured-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-cover bg-center shrink-0 border border-[#0d1a1b]/5"
                            style={{ backgroundImage: `url('${flavor.imageUrl}')` }}></div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[#0d1a1b] dark:text-white font-bold text-sm line-clamp-1">{flavor.name}</span>
                            <span className="text-[#0d1a1b]/50 dark:text-white/40 text-[9px] uppercase font-bold tracking-wider">Premium Mix</span>
                          </div>
                        </div>

                        {qty === 0 ? (
                          <button
                            onClick={() => {
                              if (!isLimitReached) handleAddPackageFlavor(flavor.id);
                            }}
                            disabled={isLimitReached}
                            className={cn(
                              "size-8 rounded-full flex items-center justify-center transition-all",
                              isLimitReached
                                ? "bg-transparent border border-[#0d1a1b]/10 text-[#0d1a1b]/20 cursor-not-allowed"
                                : "bg-brand-stitch-structured-primary/10 text-brand-stitch-structured-primary hover:bg-brand-stitch-structured-primary hover:text-white"
                            )}
                          >
                            <Plus size={16} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 bg-[#f9f7f2] dark:bg-white/5 p-1 rounded-full border border-brand-stitch-structured-primary/20">
                            <button
                              onClick={() => handleRemovePackageFlavorByIndex(selectedPackageFlavors.indexOf(flavor.id))}
                              className="size-6 rounded-full bg-white dark:bg-[#102221] text-[#0d1a1b] dark:text-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-xs w-3 text-center">{qty}</span>
                            <button
                              onClick={() => {
                                if (!isLimitReached) handleAddPackageFlavor(flavor.id);
                              }}
                              disabled={isLimitReached}
                              className={cn(
                                "size-6 rounded-full flex items-center justify-center transition-colors shadow-md",
                                isLimitReached
                                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                  : "bg-brand-stitch-structured-primary text-white hover:brightness-110"
                              )}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION: STEP 3 - ADD-ONS (AMPLIFICATION) */}
            {selectedPackage?.id !== 'pkg_17l_self_pickup' && (
              <section className="pb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                <h2 className="text-[#0d1a1b] dark:text-white tracking-tight text-[28px] font-bold leading-tight pb-2 pt-4 border-t border-[#f2eee4] dark:border-white/5 mt-6">Step 3: Add-ons</h2>
                <p className="text-[#0d1a1b]/60 dark:text-white/60 text-sm font-medium leading-relaxed mb-6">Enhance your event with our premium service extras.</p>

                <div className="flex flex-col gap-4">
                  {mockCorporateAddons.map((addon) => {
                    const qty = selectedAddons[addon.id] || 0;
                    return (
                      <div key={addon.id} className="group flex flex-col p-4 bg-white dark:bg-[#0d1a1b]/30 rounded-xl border border-[#f2eee4] dark:border-white/5 hover:border-brand-stitch-structured-primary/50 transition-all duration-300 shadow-sm">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex flex-col flex-1 pr-4">
                            <span className="text-[#0d1a1b] dark:text-white font-bold text-base">{addon.name}</span>
                            <span className="text-[#0d1a1b]/50 dark:text-white/40 text-xs line-clamp-1">{addon.description}</span>
                            <span className="text-brand-stitch-structured-primary font-bold text-sm mt-1">${addon.price}</span>
                          </div>

                          {qty === 0 ? (
                            <button
                              onClick={() => handleAddonToggle(addon.id, true)}
                              className="size-10 rounded-full bg-brand-stitch-structured-primary/10 text-brand-stitch-structured-primary flex items-center justify-center hover:bg-brand-stitch-structured-primary hover:text-white transition-colors"
                            >
                              <Plus size={20} />
                            </button>
                          ) : (
                            <div className="flex items-center gap-3 bg-[#f9f7f2] dark:bg-white/5 p-1 rounded-full border border-brand-stitch-structured-primary/20">
                              <button
                                onClick={() => handleAddonQuantityChange(addon.id, -1)}
                                className="size-8 rounded-full bg-white dark:bg-[#102221] text-[#0d1a1b] dark:text-white flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-sm w-4 text-center">{qty}</span>
                              <button
                                onClick={() => handleAddonQuantityChange(addon.id, 1)}
                                className="size-8 rounded-full bg-brand-stitch-structured-primary text-white flex items-center justify-center hover:brightness-110 transition-colors shadow-md"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Flavor Selection for Add-ons requiring it */}
                        {qty > 0 && addon.requiresFlavor && (
                          <div className="mt-4 pl-4 border-l-2 border-brand-stitch-structured-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#0d1a1b]/40 dark:text-white/40 mb-2">Select Flavors</p>
                            {Array.from({ length: qty }).map((_, idx) => (
                              <div key={`${addon.id}-flavor-${idx}`} className="flex items-center gap-3">
                                <span className="text-xs font-mono text-[#0d1a1b]/60 dark:text-white/60 w-6">#{idx + 1}</span>
                                <div className="relative flex-1">
                                  <select
                                    className="w-full h-10 rounded-lg text-sm bg-white dark:bg-white/5 border border-[#f2eee4] dark:border-white/10 px-3 appearance-none focus:ring-1 focus:ring-brand-stitch-structured-primary outline-none"
                                    value={addonFlavorSelections[addon.id]?.[idx] || ""}
                                    onChange={(e) => handleUpdateAddonFlavor(addon.id, idx, e.target.value)}
                                  >
                                    <option value="" disabled>Choose a flavor...</option>
                                    {mockFlavors.map(flavor => (
                                      <option key={flavor.id} value={flavor.id}>{flavor.name}</option>
                                    ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#0d1a1b]/40">
                                    <ChevronRight className="rotate-90 size-4" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: DESKTOP SIDEBAR (SUMMARY) */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#102221] border border-[#f2eee4] dark:border-white/10 rounded-[2rem] p-6 xl:p-8 shadow-xl shadow-black/5 animate-in slide-in-from-right-8 duration-700">
              <h3 className="text-lg font-black uppercase tracking-tight text-[#0d1a1b] dark:text-white mb-6 flex items-center gap-2">
                <div className="h-6 w-1 bg-brand-stitch-structured-primary rounded-full"></div>
                Order Summary
              </h3>

              <div className="space-y-6">
                {/* Package Summary */}
                {selectedPackage ? (
                  <div className="flex justify-between items-start pb-4 border-b border-[#f2eee4] dark:border-white/5">
                    <div>
                      <p className="font-bold text-[#0d1a1b] dark:text-white">{selectedPackage.name}</p>
                      <p className="text-xs text-[#0d1a1b]/50 dark:text-white/50">{selectedPackage.includedItems.length} items included</p>
                      {selectedPackageFlavors.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedPackageFlavors.map(fid => {
                            const f = mockFlavors.find(fl => fl.id === fid);
                            return f ? <span key={fid} className="text-[9px] bg-[#f9f7f2] dark:bg-white/10 px-1.5 py-0.5 rounded text-[#0d1a1b]/60 dark:text-white/60 uppercase font-bold">{f.name}</span> : null
                          })}
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-brand-stitch-structured-primary">${selectedPackage.price.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-[#f2eee4] dark:border-white/10 rounded-xl text-center">
                    <p className="text-xs font-bold text-[#0d1a1b]/30 dark:text-white/30 uppercase tracking-widest">No Package Selected</p>
                  </div>
                )}

                {/* Add-ons Summary */}
                {Object.keys(selectedAddons).length > 0 && (
                  <div className="space-y-2 pb-4 border-b border-[#f2eee4] dark:border-white/5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#0d1a1b]/40 dark:text-white/40">Add-ons</p>
                    {Object.entries(selectedAddons).map(([id, qty]) => {
                      const addon = mockCorporateAddons.find(a => a.id === id);
                      if (!addon) return null;
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span className="text-[#0d1a1b]/80 dark:text-white/80">{qty}x {addon.name}</span>
                          <span className="font-medium text-[#0d1a1b]/80 dark:text-white/80">${(addon.price * qty).toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Delivery Fee */}
                {displayDeliveryFee > 0 && (
                  <div className="flex justify-between text-sm pb-4 border-b border-[#f2eee4] dark:border-white/5">
                    <span className="text-[#0d1a1b]/60 dark:text-white/60">Delivery Fee</span>
                    <span className="font-medium text-[#0d1a1b]/80 dark:text-white/80">${displayDeliveryFee.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#0d1a1b]/60 dark:text-white/60">Total Est.</span>
                  <span className="text-3xl font-black text-brand-stitch-structured-primary px-4 py-2 bg-brand-stitch-structured-primary/5 rounded-lg border border-brand-stitch-structured-primary/10">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleProceedToBook}
                  disabled={!canProceed && !(Object.keys(selectedAddons).length > 0)}
                  className="w-full bg-brand-stitch-structured-primary text-white h-14 rounded-xl font-bold text-base flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-brand-stitch-structured-primary/30 disabled:opacity-50 disabled:shadow-none hover:scale-[1.02] hover:brightness-110"
                >
                  Continue to Payment
                  <ArrowRight size={18} />
                </button>

                <p className="text-[10px] text-center text-[#0d1a1b]/40 dark:text-white/40 leading-relaxed max-w-xs mx-auto">
                  By proceeding, you agree to our booking terms and cancellation policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY FOOTER */}
      <footer className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 dark:bg-[#102022]/95 backdrop-blur-lg border-t border-[#f2eee4] dark:border-white/10 p-6 flex flex-col gap-4 z-[100] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[#0d1a1b]/60 dark:text-white/40 font-semibold uppercase tracking-widest">Current Subtotal</p>
            <p className="text-2xl font-bold text-[#0d1a1b] dark:text-white">${totalPrice.toFixed(2)}</p>
          </div>
          {Object.keys(selectedAddons).length > 0 && (
            <div className="flex items-center text-xs font-bold text-brand-stitch-structured-primary bg-brand-stitch-structured-primary/10 px-3 py-1 rounded-full">
              <span>{Object.values(selectedAddons).reduce((a, b) => a + b, 0)} Item(s) Added</span>
            </div>
          )}
        </div>
        <button
          onClick={handleProceedToBook}
          disabled={!canProceed && !(Object.keys(selectedAddons).length > 0)}
          className="w-full bg-brand-stitch-structured-primary text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-brand-stitch-structured-primary/30 disabled:opacity-50 disabled:shadow-none hover:brightness-110"
        >
          Continue to Payment
          <ArrowRight size={20} />
        </button>
      </footer>

      {/* --- MODALS (Hidden but functional) --- */}
      {/* Date & Time Modal */}
      <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[480px] p-0 border-0 bg-transparent shadow-none">
          <div className="bg-white dark:bg-[#1a2e2d] rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col w-full border border-white/20">
            <div className="overflow-y-auto p-8 space-y-6 flex-1 min-h-0 w-full custom-scrollbar">
              <div className="text-center">
                <div className="w-16 h-16 bg-brand-stitch-structured-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border border-brand-stitch-structured-primary/20">
                  <CalendarDays className="text-brand-stitch-structured-primary h-8 w-8" />
                </div>
                <DialogTitle className="font-black text-2xl uppercase text-[#0d1a1b] dark:text-white tracking-tighter italic">Select Date</DialogTitle>
                <DialogDescription className="text-xs text-[#0d1a1b]/60 dark:text-white/60 font-black uppercase tracking-widest">Coastal Availability Check</DialogDescription>
              </div>

              <div className="flex justify-center bg-[#f9f7f2] dark:bg-black/20 p-4 rounded-[2rem] border border-[#0d1a1b]/5 dark:border-white/5 text-slate-900 dark:text-white">
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

              <div className="space-y-4 bg-brand-stitch-structured-primary/5 p-6 rounded-[2rem] border border-brand-stitch-structured-primary/20">
                <div className="flex items-center justify-between pl-1">
                  <Label className="uppercase text-[10px] font-black text-brand-stitch-structured-primary tracking-widest">Select Event Time</Label>
                  <Info size={16} className="text-brand-stitch-structured-primary/40" />
                </div>
                <Select value={selectedEventTime} onValueChange={setSelectedEventTime}>
                  <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-white/5 border-brand-stitch-structured-primary/20 font-black text-slate-700 dark:text-white shadow-sm uppercase text-sm tracking-wide">
                    <SelectValue placeholder="--:-- --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-[220px] dark:bg-[#1a2e2d] dark:border-white/10">
                    {EVENT_TIME_SLOTS.map((t: string) => (
                      <SelectItem key={t} value={t} className="font-black uppercase text-xs rounded-xl cursor-pointer my-1 text-slate-900 dark:text-white hover:bg-brand-stitch-structured-primary transition-colors">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] font-bold text-brand-stitch-structured-primary italic pl-2 leading-relaxed opacity-60">
                  Note: Pickup or delivery coordination will be confirmed by our team following your booking.
                </p>
              </div>
            </div>
            <div className="p-8 pt-2 flex-shrink-0 border-t border-[#0d1a1b]/5 dark:border-white/5">
              <DialogFooter>
                <Button onClick={handleDateTimeSubmit} className="w-full h-14 bg-brand-stitch-structured-primary text-white font-black uppercase rounded-2xl shadow-lg shadow-brand-stitch-structured-primary/20 hover:brightness-110 transition-all">Confirm & Continue</Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Form Modal */}
      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#fdfaf5] border-none shadow-2xl h-[90vh] overflow-y-auto">
          <CustomerDetailsForm
            onSubmit={handleCustomerDetailsSubmit}
            onCancel={() => setIsCustomerDetailsModalOpen(false)}
            onBack={() => {
              setIsCustomerDetailsModalOpen(false);
              setIsDateTimeModalOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Modal */}
      {isPaymentModalOpen && currentEventConfig && customerDetailsForPayment && (
        <PaymentConfirmationDialog
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onBack={() => {
            setIsPaymentModalOpen(false);
            setIsCustomerDetailsModalOpen(true);
          }}
          eventConfig={currentEventConfig as EventConfig & { eventDate: Date }}
          customerDetails={customerDetailsForPayment}
          onConfirm={() => {
            setIsBookingSuccess(true);
            setIsPaymentModalOpen(false);
          }}
        />
      )}

    </div>
  );
}