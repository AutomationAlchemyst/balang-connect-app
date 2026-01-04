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
  Info,
  Waves,
  Sparkles,
  Droplets,
  ChevronRight,
  Package as PackageIcon,
  Truck,
  PartyPopper
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import BookingSuccessView from '@/components/features/event-builder/BookingSuccessView';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';

const BASE_DELIVERY_FEE = 45.00;
const SPECIAL_DELIVERY_FEE = 20.00;
const EVENT_TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

// THEME CONSTANTS - Matching Corporate Orders Page
const PRIMARY_GRADIENT = "bg-gradient-to-r from-teal-600 to-emerald-500";
const TEXT_GRADIENT = "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600";
const GLASS_PANEL = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]";
const BUTTON_PRIMARY = "bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300";

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

  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isCalendarDataLoading, setIsCalendarDataLoading] = useState(true);

  // Success State
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | undefined>(undefined);

  const resetBookingProcess = () => {
    setSelectedPackage(null);
    setSelectedPackageFlavors([]);
    setSelectedAddons({});
    setAddonFlavorSelections({});
    setSelectedEventDate(undefined);
    setSelectedEventTime(undefined);
    setCustomerDetailsForPayment(null);
    setCurrentEventConfig(null);
    setIsPaymentModalOpen(false);
    setIsCustomerDetailsModalOpen(false);
    setIsDateTimeModalOpen(false);
    setIsDeliveryRequested(false);
    setTotalPrice(0);
    setDeliveryFee(BASE_DELIVERY_FEE);
    setDisplayDeliveryFee(0);
    setIsBookingSuccess(false);
    setBookingReference(undefined);
  };

  // --- Effects & Logic ---

  useEffect(() => {
    setIsDeliveryRequested(false);
  }, [selectedPackage]);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      setIsCalendarDataLoading(true);
      try {
        const dates = await getBlockedDates();
        setBlockedDates(dates.map(d => d.date));
      } catch (error) {
        console.error("Failed to fetch blocked dates:", error);
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

  const handleAddPackageFlavor = useCallback((flavorId: string) => {
    setSelectedPackageFlavors(prevFlavors => {
      const currentMaxFlavors = getMaxFlavors();
      if (prevFlavors.length < currentMaxFlavors) {
        return [...prevFlavors, flavorId];
      } else {
        toast({
          title: "Flavor Limit Reached",
          description: `Maximum ${currentMaxFlavors} flavors allowed.`,
          variant: "destructive",
        });
        return prevFlavors;
      }
    });
  }, [getMaxFlavors, toast]);

  const handleRemovePackageFlavorByIndex = (indexToRemove: number) => {
    setSelectedPackageFlavors(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => { setSelectedPackageFlavors([]); }, [selectedPackage]);

  useEffect(() => {
    const defaultPackageIdFromUrl = searchParams.get('defaultPackageId');
    if (defaultPackageIdFromUrl) {
      const packageToSet = mockPackages.find(p => p.id === defaultPackageIdFromUrl);
      if (packageToSet && selectedPackage?.id !== packageToSet.id) {
        setSelectedPackage(packageToSet);
      }
    }
  }, [searchParams, selectedPackage?.id]);

  useEffect(() => {
    let currentTotal = 0;
    let deliveryFeeApplied = false;

    if (selectedPackage) {
      currentTotal += selectedPackage.price;
      if (selectedPackage.id === 'pkg_17l_self_pickup') {
        setDeliveryFee(SPECIAL_DELIVERY_FEE);
      } else {
        setDeliveryFee(BASE_DELIVERY_FEE);
      }
    } else {
      setDeliveryFee(BASE_DELIVERY_FEE);
    }

    const addonsSelectedList = Object.entries(selectedAddons).filter(([, quantity]) => quantity > 0);
    if (addonsSelectedList.length > 0) {
      addonsSelectedList.forEach(([addonId, quantity]) => {
        const addon = mockAddons.find(a => a.id === addonId);
        if (addon) currentTotal += addon.price * quantity;
      });
    }

    // Delivery Logic
    const needsDelivery = (selectedPackage && selectedPackage.id !== 'pkg_17l_self_pickup' && !selectedPackage.isAllInclusive) ||
      (selectedPackage?.id === 'pkg_17l_self_pickup' && isDeliveryRequested) ||
      (!selectedPackage && addonsSelectedList.length > 0);

    if (needsDelivery) {
      currentTotal += deliveryFee;
      deliveryFeeApplied = true;
    }

    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? deliveryFee : 0);
  }, [selectedPackage, selectedAddons, deliveryFee, isDeliveryRequested]);


  const handleAddonToggle = (addonId: string, checked: boolean) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      if (checked) newAddons[addonId] = 1;
      else delete newAddons[addonId];
      return newAddons;
    });
  };

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
    if (!selectedPackage && Object.keys(selectedAddons).length === 0) {
      toast({ title: "Empty Configuration", description: "Please select a package or add-ons.", variant: "destructive" });
      return;
    }

    const requiredFlavorCount = selectedPackage ? getMaxFlavors() : 0;
    if (selectedPackage && requiredFlavorCount > 0 && selectedPackageFlavors.length < requiredFlavorCount) {
      toast({ title: "Incomplete Flavors", description: `Please select all ${requiredFlavorCount} flavors.`, variant: "destructive" });
      return;
    }

    const packageFlavorDetails = selectedPackageFlavors.map(id => mockFlavors.find(f => f.id === id)?.name).filter(Boolean) as string[];

    const addonsDetails = Object.entries(selectedAddons).map(([addonId, quantity]) => {
      if (quantity === 0) return null;
      const addon = mockAddons.find(a => a.id === addonId);
      return addon ? { name: addon.name, quantity, price: (addon.price * quantity).toFixed(2) } : null;
    }).filter(Boolean) as EventConfig['addons'];

    setCurrentEventConfig({
      selectedPackage: selectedPackage ? { name: selectedPackage.name, price: selectedPackage.price.toFixed(2), flavors: packageFlavorDetails } : null,
      addons: addonsDetails,
      deliveryFee: displayDeliveryFee,
      totalPrice,
    });
    setIsDateTimeModalOpen(true);
  };

  const handleDateTimeSubmit = () => {
    if (!selectedEventDate || !selectedEventTime) {
      toast({ title: "Date/Time Required", description: "Please select both a date and time.", variant: "destructive" });
      return;
    }
    setCurrentEventConfig(prev => prev ? ({ ...prev, eventDate: selectedEventDate, eventTime: selectedEventTime }) : null);
    setIsDateTimeModalOpen(false);
    setIsCustomerDetailsModalOpen(true);
  };

  const handleCustomerDetailsSubmit = (customerData: CustomerDetailsFormValues) => {
    setCustomerDetailsForPayment(customerData);
    setIsCustomerDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  // --- Render Helpers ---

  const requiredFlavorCount = selectedPackage ? getMaxFlavors() : 0;

  if (isBookingSuccess) {
    return (
      <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pt-24 pb-40">
        <BookingSuccessView slotId={bookingReference} onReset={resetBookingProcess} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-40">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-60 animate-blob" />
        <div className="absolute top-[20%] right-[-20%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[80px] mix-blend-multiply opacity-60 animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24">

        {/* Header */}
        <div className="text-center space-y-6 mb-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="text-teal-500" />
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-teal-800">Event Builder</span>
          </div>

          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Craft Your <br />
            <span className={TEXT_GRADIENT}>Experience</span>
          </h1>

          <p className="text-lg text-slate-500 font-body font-medium leading-relaxed max-w-2xl mx-auto">
            Select your package, choose your flavors, and enhance your event with our premium add-ons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* LEFT COLUMN: BUILDER STEPS */}
          <div className="lg:col-span-8 space-y-12">

            {/* STEP 1: PACKAGE */}
            <section className="relative group">
              {/* Connector Line */}
              <div className="absolute -left-12 top-8 bottom-[-48px] w-px bg-teal-200/50 hidden xl:block group-last:hidden"></div>
              <div className="absolute -left-[54px] top-8 w-3 h-3 rounded-full bg-teal-400 ring-4 ring-teal-50 hidden xl:block"></div>

              <div className={cn(GLASS_PANEL, "overflow-hidden hover:shadow-2xl transition-shadow duration-500")}>
                <div className="p-8 md:p-10 border-b border-white/40 bg-white/40">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-black text-xl shadow-inner">01</span>
                    <div>
                      <span className="block text-xs font-bold uppercase text-teal-600 tracking-widest mb-1">Foundation</span>
                      <h2 className="text-3xl font-display font-black uppercase text-slate-800 tracking-tight">Select Package</h2>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 bg-white/30 space-y-8">
                  <div className="relative">
                    <Select value={selectedPackage?.id || "none-option"} onValueChange={(val) => setSelectedPackage(mockPackages.find(p => p.id === val) || null)}>
                      <SelectTrigger className="h-16 rounded-2xl bg-white border-white/60 text-lg font-bold text-slate-700 shadow-sm hover:border-teal-400/50 transition-all pl-6">
                        <SelectValue placeholder="Choose a generic package..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/20 bg-white/90 backdrop-blur-xl p-2">
                        <SelectItem value="none-option" className="rounded-xl py-3 font-medium">None (Build Custom)</SelectItem>
                        {mockPackages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id} className="rounded-xl py-3 font-medium">
                            {pkg.name} — <span className="text-teal-600 font-bold">${pkg.price}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPackage && (
                    <div className="bg-white/50 rounded-[2rem] p-8 border border-white/60 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                        <div>
                          <h3 className="text-2xl font-black uppercase text-teal-800 mb-2">{selectedPackage.name}</h3>
                          <p className="text-slate-500 font-medium italic">"{selectedPackage.description}"</p>
                        </div>
                        <div className="text-right">
                          <span className="block text-4xl font-black text-teal-600">${selectedPackage.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPackage.includedItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700 bg-white/40 p-3 rounded-xl">
                            <Check size={16} className="text-teal-500" /> {item}
                          </div>
                        ))}
                      </div>

                      {selectedPackage.id === 'pkg_17l_self_pickup' && (
                        <div
                          className={cn(
                            "mt-8 p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all select-none",
                            isDeliveryRequested ? "bg-teal-50 border-teal-500 text-teal-800" : "bg-white/40 border-transparent hover:bg-white/60"
                          )}
                          onClick={() => setIsDeliveryRequested(!isDeliveryRequested)}
                        >
                          <div className={cn("w-6 h-6 rounded-md border-2 flex items-center justify-center bg-white", isDeliveryRequested ? "border-teal-500" : "border-slate-300")}>
                            {isDeliveryRequested && <Check size={14} className="text-teal-600" strokeWidth={3} />}
                          </div>
                          <span className="font-bold text-sm uppercase tracking-wide">Add Delivery (+$20.00)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* STEP 2: FLAVORS */}
            {selectedPackage && requiredFlavorCount > 0 && (
              <section className="relative group">
                <div className="absolute -left-12 top-8 bottom-[-48px] w-px bg-teal-200/50 hidden xl:block"></div>
                <div className="absolute -left-[54px] top-8 w-3 h-3 rounded-full bg-teal-400 ring-4 ring-teal-50 hidden xl:block"></div>

                <div className={cn(GLASS_PANEL, "overflow-hidden hover:shadow-2xl transition-shadow duration-500")}>
                  <div className="p-8 md:p-10 border-b border-white/40 bg-white/40 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-black text-xl shadow-inner">02</span>
                      <div>
                        <span className="block text-xs font-bold uppercase text-teal-600 tracking-widest mb-1">Curation</span>
                        <h2 className="text-3xl font-display font-black uppercase text-slate-800 tracking-tight">Pick Flavors</h2>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs uppercase tracking-widest">
                      {selectedPackageFlavors.length} / {requiredFlavorCount} Selected
                    </span>
                  </div>

                  <div className="p-8 md:p-10 bg-white/30">
                    {/* Selected Chips */}
                    {selectedPackageFlavors.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-8">
                        {selectedPackageFlavors.map((fid, idx) => (
                          <div key={`${fid}-${idx}`} className="flex items-center gap-2 pl-4 pr-2 py-2 bg-teal-600 text-white rounded-full font-bold text-sm shadow-md animate-in zoom-in">
                            {mockFlavors.find(f => f.id === fid)?.name}
                            <button onClick={() => handleRemovePackageFlavorByIndex(idx)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><XIcon size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {mockFlavors.map(flavor => {
                        const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                        const canAdd = selectedPackageFlavors.length < requiredFlavorCount;

                        return (
                          <button
                            key={flavor.id}
                            onClick={() => canAdd && handleAddPackageFlavor(flavor.id)}
                            disabled={!canAdd}
                            className={cn(
                              "relative p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 group",
                              !canAdd && count === 0 ? "opacity-50 grayscale border-transparent bg-slate-100" : "bg-white hover:border-teal-400 hover:shadow-lg border-white/60"
                            )}
                          >
                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                              <Droplets size={18} />
                            </div>
                            <span className="font-bold text-slate-800 uppercase leading-tight">{flavor.name}</span>
                            {count > 0 && (
                              <span className="absolute top-4 right-4 bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 3: ADD-ONS */}
            <section className="relative group">
              <div className="absolute -left-[54px] top-8 w-3 h-3 rounded-full bg-teal-400 ring-4 ring-teal-50 hidden xl:block"></div>

              <div className={cn(GLASS_PANEL, "overflow-hidden hover:shadow-2xl transition-shadow duration-500")}>
                <div className="p-8 md:p-10 border-b border-white/40 bg-white/40">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-black text-xl shadow-inner">03</span>
                    <div>
                      <span className="block text-xs font-bold uppercase text-teal-600 tracking-widest mb-1">Amplification</span>
                      <h2 className="text-3xl font-display font-black uppercase text-slate-800 tracking-tight">Add-ons</h2>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10 bg-white/30 space-y-10">
                  {['Drinks', 'Food', 'Equipment', 'Services'].map(category => {
                    const categoryAddons = mockAddons.filter(a => a.category === category);
                    if (categoryAddons.length === 0) return null;

                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-px flex-1 bg-teal-200/50"></div>
                          <h4 className="font-bold text-sm uppercase tracking-widest text-teal-700">{category}</h4>
                          <div className="h-px flex-1 bg-teal-200/50"></div>
                        </div>
                        
                        {categoryAddons.map(addon => {
                          const isSelected = selectedAddons[addon.id] > 0;
                          return (
                            <div key={addon.id} className={cn("p-6 rounded-3xl border transition-all flex flex-col md:flex-row items-center justify-between gap-6", isSelected ? "bg-white border-teal-400 shadow-lg" : "bg-white/40 border-transparent hover:bg-white/60")}>
                              <div className="flex items-center gap-4 flex-1">
                                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", isSelected ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600")}>
                                  <Zap size={24} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg text-slate-800 uppercase">{addon.name}</h4>
                                  <p className="text-teal-600 font-bold">${addon.price}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl">
                                <button onClick={() => handleAddonQuantityChange(addon.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white shadow-sm transition-all" disabled={!selectedAddons[addon.id]}><MinusCircle size={18} className="text-slate-400" /></button>
                                <span className="font-black text-slate-800 w-8 text-center">{selectedAddons[addon.id] || 0}</span>
                                <button onClick={() => handleAddonQuantityChange(addon.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white shadow-sm transition-all"><PlusCircle size={18} className="text-teal-600" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-white rounded-[2rem] shadow-2xl p-8 border border-slate-100/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-400 to-emerald-400"></div>

              <h3 className="font-black text-2xl uppercase text-slate-800 mb-6 flex items-center gap-2">
                <ShoppingCart size={24} className="text-teal-500" /> Your Order
              </h3>

              <div className="space-y-4 mb-8 text-sm">
                {selectedPackage && (
                  <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-200">
                    <div>
                      <span className="font-bold text-slate-800 block">{selectedPackage.name}</span>
                      <span className="text-slate-500 text-xs">Base Package</span>
                    </div>
                    <span className="font-bold text-slate-800">${selectedPackage.price.toFixed(2)}</span>
                  </div>
                )}

                {Object.entries(selectedAddons).map(([id, qty]) => {
                  if (qty <= 0) return null;
                  const addon = mockAddons.find(a => a.id === id);
                  return (
                    <div key={id} className="flex justify-between items-start pb-4 border-b border-dashed border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block">{addon?.name}</span>
                        <span className="text-slate-500 text-xs">Qty: {qty}</span>
                      </div>
                      <span className="font-bold text-slate-800">${((addon?.price || 0) * qty).toFixed(2)}</span>
                    </div>
                  );
                })}

                {displayDeliveryFee > 0 && (
                  <div className="flex justify-between items-center text-teal-600 pb-4 border-b border-dashed border-slate-200">
                    <span className="font-bold text-xs uppercase tracking-wider">Delivery Fee</span>
                    <span className="font-bold">${displayDeliveryFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-xl uppercase text-slate-800">Total</span>
                  <span className="font-black text-3xl text-teal-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleProceedToBook} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all px-4 flex items-center justify-center gap-2">
                Proceed to Book
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Date & Time Modal - RESPONSIVE FIX */}
      <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-[480px] p-0 border-0 bg-transparent shadow-none">
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col w-full">
            <div className="overflow-y-auto p-6 md:p-8 space-y-6 flex-1 min-h-0 w-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="text-teal-600" />
                </div>
                <DialogTitle className="font-black text-2xl uppercase text-slate-900">Select Date</DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium">Check availability for your event.</DialogDescription>
              </div>

              {/* Responsive Calendar Container */}
              <div className="flex justify-center bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
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

              <div className="space-y-3">
                <Label className="uppercase text-xs font-bold text-slate-400 tracking-widest pl-2">Select Time</Label>
                <Select value={selectedEventTime} onValueChange={setSelectedEventTime}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold text-slate-700">
                    <SelectValue placeholder="--:-- --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl max-h-[200px]">
                    {EVENT_TIME_SLOTS.map(t => (
                      <SelectItem key={t} value={t} className="font-medium rounded-lg cursor-pointer my-1">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 md:p-8 pt-2 flex-shrink-0 border-t border-slate-100">
              <DialogFooter>
                <Button onClick={handleDateTimeSubmit} className={cn("w-full h-14 text-lg", BUTTON_PRIMARY)}>Confirm Date</Button>
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
          <div className="bg-white m-1 rounded-[2rem] shadow-2xl overflow-hidden max-h-[80vh] flex flex-col w-full">
            <div className="overflow-y-auto p-6 md:p-8 flex-1 min-h-0 w-full">
              <CustomerDetailsForm
                onSubmit={handleCustomerDetailsSubmit}
                onCancel={() => setIsCustomerDetailsModalOpen(false)}
                onBack={() => {
                  setIsCustomerDetailsModalOpen(false);
                  setIsDateTimeModalOpen(true);
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation */}
      {customerDetailsForPayment && currentEventConfig && currentEventConfig.eventDate && (
        <PaymentConfirmationDialog
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          eventConfig={currentEventConfig as EventConfig & { eventDate: Date }}
          customerDetails={customerDetailsForPayment}
          onConfirm={() => {
            // Success logic update
            setBookingReference(`BK-${Math.floor(Math.random() * 10000)}`); // Simulating a ref ID
            setIsPaymentModalOpen(false);
            setIsBookingSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBack={() => {
            setIsPaymentModalOpen(false);
            setIsCustomerDetailsModalOpen(true);
          }}
        />
      )}

    </div>
  );
}