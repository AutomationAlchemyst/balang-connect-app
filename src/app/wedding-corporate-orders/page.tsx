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
import { PlusCircle, MinusCircle, ShoppingCart, Zap, PackageIcon, Truck, XIcon, Check, CalendarDays, Loader2, Star, Info, ChevronRight, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';

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

// PREMIUM THEME CONSTANTS - "Liquid Paradise" Refined
const GLASS_PANEL = "bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]";
const GLASS_PANEL_HOVER = "hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300";
const PRIMARY_GRADIENT = "bg-gradient-to-r from-teal-600 to-emerald-500";
const TEXT_GRADIENT = "text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600";
const BUTTON_PRIMARY = "bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300";
const BUTTON_SECONDARY = "bg-white text-teal-700 font-bold border border-teal-100 uppercase tracking-wider rounded-xl hover:bg-teal-50 hover:border-teal-200 transition-all duration-300";

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

  useEffect(() => {
    setIsDeliveryRequested(false);
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

  const handleAddPackageFlavor = useCallback((flavorId: string) => {
    setSelectedPackageFlavors(prevFlavors => {
      const currentMaxFlavors = getMaxFlavors();
      if (prevFlavors.length < currentMaxFlavors) {
        return [...prevFlavors, flavorId];
      } else {
        const flavorDetails = mockFlavors.find(f => f.id === flavorId);
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
  }, [selectedPackage]);


  useEffect(() => {
    const defaultPackageIdFromUrl = searchParams.get('defaultPackageId');
    if (defaultPackageIdFromUrl) {
      const packageToSet = mockCorporatePackages.find(p => p.id === defaultPackageIdFromUrl);
      if (packageToSet && selectedPackage?.id !== packageToSet.id) {
        setSelectedPackage(packageToSet);
      }
      const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
      if (currentParams.has('defaultPackageId')) {
        currentParams.delete('defaultPackageId');
        const queryString = currentParams.toString();
        router.replace(`/wedding-corporate-orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
      }
    }
  }, [searchParams, router, selectedPackage?.id]);

  useEffect(() => {
    const flavorIdsToAddParam = searchParams.get('addFlavorIds');
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));

    if (flavorIdsToAddParam && selectedPackage) {
      const flavorIdsFromUrl = flavorIdsToAddParam.split(',');
      const maxPackageFlavors = getMaxFlavors();
      const couldNotAddFlavors: string[] = [];

      setSelectedPackageFlavors(currentFlavors => {
        let newFlavorsState = [...currentFlavors];
        for (const idFromUrl of flavorIdsFromUrl) {
          if (newFlavorsState.length < maxPackageFlavors) {
            if (!newFlavorsState.includes(idFromUrl)) {
              newFlavorsState.push(idFromUrl);
            } else {
              newFlavorsState.push(idFromUrl);
            }
          } else {
            const flavorDetails = mockFlavors.find(f => f.id === idFromUrl);
            couldNotAddFlavors.push(flavorDetails?.name || idFromUrl);
          }
        }
        return newFlavorsState.slice(0, maxPackageFlavors);
      });

      if (couldNotAddFlavors.length > 0) {
        setTimeout(() => {
          toast({
            title: `Some flavors ignored`,
            description: `Could not add all flavors. Limit is ${maxPackageFlavors}.`,
            variant: "default",
          });
        }, 0);
      }

      if (currentParams.has('addFlavorIds')) {
        currentParams.delete('addFlavorIds');
        const queryString = currentParams.toString();
        router.replace(`/wedding-corporate-orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
      }
    } else if (flavorIdsToAddParam && !selectedPackage && !currentParams.has('defaultPackageId')) {
      // Logic to prompt package selection if flavors are passed without a package
      // Silent for now to improve UX
    }
  }, [searchParams, router, selectedPackage, getMaxFlavors, toast]);


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

  // Sync addons with flavor selections
  useEffect(() => {
    setAddonFlavorSelections(prevSelections => {
      // Logic from original to keep flavor selections in sync with quantity
      const nextState: Record<string, (string | undefined)[]> = {};
      const balangAddonIds = ['addon_balang_23l', 'addon_balang_40l'];
      let hasChange = false;

      balangAddonIds.forEach(addonId => {
        const qty = selectedAddons[addonId] || 0;
        if (qty > 0) {
          const current = prevSelections[addonId] || [];
          if (current.length !== qty) {
            nextState[addonId] = Array(qty).fill(undefined).map((_, i) => current[i]);
            hasChange = true;
          } else {
            nextState[addonId] = current;
          }
        } else if (prevSelections[addonId]) {
          hasChange = true;
          // key removed implicitly by not adding to nextState
        }
      });
      // Copy over non-balang keys if any (though currently only balangs have flavors)
      // For safety, just use the computed nextState for balangs and keep previous for others if needed?
      // Actually, let's just stick to the specific balang logic to avoid complexity.

      if (hasChange) return nextState;
      return prevSelections;
    });
  }, [selectedAddons]);

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      if (checked) {
        newAddons[addonId] = 1;
      } else {
        delete newAddons[addonId];
        // Clean up flavors - handled by useEffect
      }
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

  const handleAdditiveFlavorSelect = (addonId: string, balangIndex: number, selectedFlavorId: string) => {
    setAddonFlavorSelections(prev => {
      const newSelectionsForAddon = [...(prev[addonId] || [])];
      while (newSelectionsForAddon.length <= balangIndex) {
        newSelectionsForAddon.push(undefined);
      }
      newSelectionsForAddon[balangIndex] = selectedFlavorId;
      return { ...prev, [addonId]: newSelectionsForAddon };
    });
  };

  const handleRemoveAdditiveFlavor = (addonId: string, balangIndex: number) => {
    setAddonFlavorSelections(prev => {
      const newSelectionsForAddon = [...(prev[addonId] || [])];
      if (balangIndex < newSelectionsForAddon.length) {
        newSelectionsForAddon[balangIndex] = undefined;
      }
      return { ...prev, [addonId]: newSelectionsForAddon };
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

    const packageFlavorDetails = selectedPackageFlavors
      .map(id => mockFlavors.find(f => f.id === id)?.name)
      .filter((name): name is string => !!name);

    const addonsDetails = Object.entries(selectedAddons)
      .map(([addonId, quantity]) => {
        if (quantity === 0) return null;
        const addon = mockCorporateAddons.find(a => a.id === addonId);
        if (!addon) return null;

        const flavorsForThisAddon = (addonFlavorSelections[addonId] || [])
          .map(fId => fId ? mockFlavors.find(f => f.id === fId)?.name : undefined)
          .filter((name): name is string => !!name);

        return {
          name: addon.name,
          quantity,
          price: (addon.price * quantity).toFixed(2),
          ...(flavorsForThisAddon.length > 0 && { flavors: flavorsForThisAddon }),
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
      toast({
        title: "Date & Time Required",
        description: "Please select both a date and a time slot.",
        variant: "destructive",
      });
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
  };

  const packageIsSelected = !!selectedPackage;
  const requiredFlavorCountForPackage = packageIsSelected ? getMaxFlavors() : 0;
  const canProceed = (packageIsSelected && (requiredFlavorCountForPackage > 0 ? selectedPackageFlavors.length === requiredFlavorCountForPackage : true)) || (!packageIsSelected && Object.keys(selectedAddons).some(k => selectedAddons[k] > 0));

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-x-hidden selection:bg-teal-100 selection:text-teal-900 font-sans text-slate-800">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-32 pb-32">
        {/* HEADER */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-[0.2em] border border-teal-100 shadow-sm animate-fade-in-up">
            Corporate & Wedding
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-900 leading-none animate-fade-in-up delay-100">
            Design Your <br className="md:hidden" />
            <span className={TEXT_GRADIENT}>Experience</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 font-medium animate-fade-in-up delay-200">
            Customize every detail of your beverage service. Choose a package, select your flavors, and let us handle the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* LEFT COLUMN: BUILDER */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in-up delay-300">

            {/* STEP 1: PACKAGE */}
            <section id="step-package" className={cn(GLASS_PANEL, "p-8 md:p-10")}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-lg shadow-inner">1</div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 uppercase tracking-tight">Select Package</h2>
                  <p className="text-sm text-slate-500 font-body font-medium">Start with a curated package or build from scratch.</p>
                </div>
              </div>

              <div className="space-y-6">
                <Select
                  onValueChange={(pkgId) => {
                    if (pkgId === "none-option") {
                      setSelectedPackage(null);
                    } else {
                      const newSelectedPackage = mockCorporatePackages.find(p => p.id === pkgId) || null;
                      setSelectedPackage(newSelectedPackage);
                    }
                  }}
                  value={selectedPackage?.id || "none-option"}
                >
                  <SelectTrigger className="h-16 text-lg font-bold bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 px-6 shadow-sm hover:border-teal-300 transition-colors">
                    <SelectValue placeholder="Choose your package..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-100 rounded-xl shadow-2xl p-1">
                    <SelectItem value="none-option" className="py-3 px-4 rounded-lg font-bold text-slate-600 focus:bg-slate-50 focus:text-teal-700">None (Build from scratch)</SelectItem>
                    <Separator className="my-1 bg-slate-100" />
                    {mockCorporatePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id} className="py-3 px-4 rounded-lg font-bold text-slate-800 focus:bg-teal-50 focus:text-teal-700">
                        <span className="flex justify-between w-full items-center gap-4">
                          <span>{pkg.name}</span>
                          <span className="text-teal-600">${pkg.price.toFixed(2)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPackage && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h3 className="text-xl font-display font-bold text-teal-900">{selectedPackage.name}</h3>
                      {selectedPackage.isAllInclusive && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-display font-bold uppercase tracking-wider rounded-full self-start">
                          All Inclusive
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 font-body">{selectedPackage.description}</p>

                    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-display font-bold uppercase text-slate-400 tracking-wider mb-3">Includes</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedPackage.includedItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                            <Check className="w-4 h-4 text-teal-500 mt-0.5" strokeWidth={3} />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPackage.id === 'pkg_17l_self_pickup' && (
                      <label className="flex items-center gap-3 p-4 bg-white border border-teal-100 rounded-xl cursor-pointer hover:bg-teal-50/50 transition-colors">
                        <Checkbox
                          checked={isDeliveryRequested}
                          onCheckedChange={(c) => setIsDeliveryRequested(!!c)}
                          className="w-5 h-5 border-2 border-slate-300 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 rounded-md"
                        />
                        <span className="font-display font-bold text-slate-700 uppercase text-sm tracking-wide">Request Delivery (+$20.00)</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: FLAVORS */}
            {selectedPackage && requiredFlavorCountForPackage > 0 && (
              <section id="step-flavors" className={cn(GLASS_PANEL, "p-8 md:p-10")}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-lg shadow-inner">2</div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-slate-900 uppercase tracking-tight">Choose Flavors</h2>
                      <p className="text-sm text-slate-400 font-body font-medium">Select {requiredFlavorCountForPackage} flavors.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-2xl font-black", selectedPackageFlavors.length === requiredFlavorCountForPackage ? "text-teal-600" : "text-slate-300")}>
                      {selectedPackageFlavors.length}
                    </span>
                    <span className="text-slate-300 font-bold text-lg">/{requiredFlavorCountForPackage}</span>
                  </div>
                </div>

                {/* Selected Flavors Chips */}
                {selectedPackageFlavors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8 p-4 bg-teal-50/50 rounded-2xl border border-teal-100/50">
                    {selectedPackageFlavors.map((flavorId, idx) => {
                      const flavor = mockFlavors.find(f => f.id === flavorId);
                      return (
                        <div key={`${flavorId}-${idx}`} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white text-teal-800 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm border border-teal-100">
                          <span>{flavor?.name}</span>
                          <button onClick={() => handleRemovePackageFlavorByIndex(idx)} className="p-0.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors">
                            <XIcon size={14} strokeWidth={3} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {mockFlavors.map(flavor => {
                    const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                    const disabled = selectedPackageFlavors.length >= requiredFlavorCountForPackage;
                    return (
                      <button
                        key={flavor.id}
                        onClick={() => handleAddPackageFlavor(flavor.id)}
                        disabled={disabled}
                        className={cn(
                          "group relative flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left",
                          count > 0
                            ? "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-900/10"
                            : "bg-white border-slate-100 text-slate-600 hover:border-teal-200 hover:shadow-md disabled:opacity-50 disabled:hover:border-slate-100 disabled:hover:shadow-none"
                        )}
                      >
                        <div className="flex justify-between w-full items-start mb-2">
                          <span className={cn("font-bold text-sm uppercase leading-tight", count > 0 ? "text-white" : "text-slate-700")}>{flavor.name}</span>
                          {count > 0 && <span className="flex items-center justify-center w-5 h-5 bg-white text-teal-600 text-[10px] font-black rounded-full shadow-sm">x{count}</span>}
                        </div>
                        <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest mt-auto", count > 0 ? "text-teal-200" : "text-teal-500")}>
                          {disabled ? "" : "+ Add"}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            )}

            {/* STEP 3: ADDONS */}
            <section id="step-addons" className={cn(GLASS_PANEL, "p-8 md:p-10")}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-lg shadow-inner">
                  {selectedPackage && requiredFlavorCountForPackage > 0 ? 3 : 2}
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900 uppercase tracking-tight">Add-ons</h2>
                  <p className="text-sm text-slate-500 font-body font-medium">Enhance your event with premium extras.</p>
                </div>
              </div>

              <div className="space-y-4">
                {mockCorporateAddons.map(addon => {
                  const isSelected = (selectedAddons[addon.id] || 0) > 0;
                  return (
                    <div key={addon.id} className={cn("p-5 rounded-2xl border transition-all duration-300", isSelected ? "bg-white border-teal-200 shadow-md" : "bg-white/50 border-transparent hover:bg-white hover:border-slate-100")}>
                      <div className="flex items-start sm:items-center justify-between gap-4">
                        <label htmlFor={`addon-${addon.id}`} className="flex-grow cursor-pointer">
                          <div>
                            <h4 className="font-display font-bold text-base text-slate-800 uppercase">{addon.name}</h4>
                            <p className="text-xs text-slate-500 font-body font-medium">{addon.description}</p>
                          </div>
                          <span className="block mt-2 font-black text-teal-600">+${addon.price.toFixed(2)}</span>
                        </label>

                        <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          {isSelected ? (
                            <>
                              <button onClick={() => handleAddonQuantityChange(addon.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-red-500 transition-colors"><MinusCircle size={16} /></button>
                              <span className="font-bold text-slate-900 w-4 text-center">{selectedAddons[addon.id]}</span>
                              <button onClick={() => handleAddonQuantityChange(addon.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-teal-600 transition-colors"><PlusCircle size={16} /></button>
                            </>
                          ) : (
                            <Checkbox
                              id={`addon-${addon.id}`}
                              checked={isSelected}
                              onCheckedChange={(c) => handleAddonToggle(addon.id, !!c)}
                              className="mx-2 w-6 h-6 rounded-md data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500"
                            />
                          )}
                        </div>
                      </div>

                      {/* Balang Flavors Logic */}
                      {(addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l') && isSelected && (
                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200 space-y-3">
                          {Array.from({ length: selectedAddons[addon.id] }).map((_, i) => {
                            const currentFlavorId = addonFlavorSelections[addon.id]?.[i];
                            const currentFlavor = mockFlavors.find(f => f.id === currentFlavorId);
                            return (
                              <div key={i} className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded-lg">
                                <span className="font-bold text-slate-500 uppercase text-xs">Unit {i + 1}</span>

                                <Popover
                                  open={activeAddonFlavorPopover?.addonId === addon.id && activeAddonFlavorPopover?.balangIndex === i}
                                  onOpenChange={(open) => setActiveAddonFlavorPopover(open ? { addonId: addon.id, balangIndex: i } : null)}
                                >
                                  <PopoverTrigger asChild>
                                    <button className={cn("px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all border", currentFlavor ? "bg-teal-100 text-teal-800 border-teal-200" : "bg-white text-slate-400 border-slate-200 hover:border-teal-300")}>
                                      {currentFlavor ? currentFlavor.name : "Select Flavor"}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-1 w-[220px] max-h-[300px] overflow-y-auto rounded-xl">
                                    {mockFlavors.map(f => (
                                      <button
                                        key={f.id}
                                        onClick={() => {
                                          handleAdditiveFlavorSelect(addon.id, i, f.id);
                                          setActiveAddonFlavorPopover(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-xs font-bold uppercase hover:bg-slate-50 rounded-lg text-slate-600"
                                      >
                                        {f.name}
                                      </button>
                                    ))}
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: SUMMARY SIDEBAR */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6 animate-fade-in-left delay-500">
            <Card className={cn("border-0 shadow-2xl overflow-hidden rounded-[2rem]", PRIMARY_GRADIENT)}>
              <CardHeader className="p-8 pb-4 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[100px] pointer-events-none" />
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 relative z-10"><ShoppingCart size={20} /> Your Order</h3>
              </CardHeader>
              <CardContent className="p-8 bg-white/95 backdrop-blur-sm space-y-6 min-h-[300px] flex flex-col">
                {/* Line Items */}
                <div className="space-y-4 flex-grow">
                  {selectedPackage ? (
                    <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-200">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 block">{selectedPackage.name}</span>
                        {selectedPackage.isAllInclusive && <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All Inclusive</span>}
                        {selectedPackageFlavors.length > 0 && requiredFlavorCountForPackage > 0 && (
                          <ul className="text-xs text-slate-500 pl-2 border-l-2 border-slate-100 mt-2 space-y-0.5">
                            {selectedPackageFlavors.map((fid, idx) => <li key={idx} className="uppercase">{mockFlavors.find(f => f.id === fid)?.name}</li>)}
                          </ul>
                        )}
                      </div>
                      <span className="font-bold text-slate-900">${selectedPackage.price.toFixed(2)}</span>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-sm font-medium italic">
                      Select a package or add-ons to start building your order.
                    </div>
                  )}

                  {/* Add-ons Summary */}
                  {Object.keys(selectedAddons).some(k => selectedAddons[k] > 0) && (
                    <div className="space-y-3 pb-4 border-b border-dashed border-slate-200">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Add-ons</span>
                      {Object.entries(selectedAddons).map(([id, qty]) => {
                        if (qty === 0) return null;
                        const addon = mockCorporateAddons.find(a => a.id === id);
                        if (!addon) return null;
                        return (
                          <div key={id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{qty}x {addon.name}</span>
                            <span className="font-medium text-slate-900">${(addon.price * qty).toFixed(2)}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {displayDeliveryFee > 0 && (
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-slate-500 font-medium">Delivery Fee</span>
                      <span className="font-bold text-slate-900">${displayDeliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="pt-2">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-bold uppercase text-slate-400 tracking-widest">Total</span>
                    <span className="text-4xl font-black text-teal-600 tracking-tighter">${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleProceedToBook}
                    disabled={!canProceed || isCalendarDataLoading}
                    className={cn("w-full h-14 text-lg", BUTTON_PRIMARY, (!canProceed || isCalendarDataLoading) && "opacity-50 grayscale cursor-not-allowed")}
                  >
                    {isCalendarDataLoading ? <Loader2 className="animate-spin" /> : "Book Now"} <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MODAL: DATE & TIME */}
        <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-[480px] p-0 border-0 bg-transparent shadow-none overflow-hidden rounded-[2rem]">
            <div className="bg-white m-1 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <DialogHeader className={cn("p-6 text-white relative flex-shrink-0", PRIMARY_GRADIENT)}>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <CalendarDays className="text-teal-200" /> Select Date
                </DialogTitle>
              </DialogHeader>

              <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="w-full flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedEventDate}
                    onSelect={setSelectedEventDate}
                    disabled={[...blockedDates, { before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                    className="rounded-2xl border border-slate-100 p-3 w-fit" // w-fit centers it comfortably
                  />
                </div>

                <div className="space-y-3">
                  <Label className="uppercase text-xs font-black text-slate-400 tracking-widest ml-1">Time Slot</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {EVENT_TIME_SLOTS.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedEventTime(time)}
                        className={cn(
                          "py-2 px-1 rounded-lg text-xs font-bold transition-all border",
                          selectedEventTime === time
                            ? "bg-teal-600 border-teal-600 text-white shadow-md transform scale-105"
                            : "bg-white border-slate-100 text-slate-600 hover:border-teal-200"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="p-4 sm:p-6 pt-2 border-t border-slate-50 flex-col sm:flex-row gap-2 bg-slate-50/50">
                <Button variant="ghost" onClick={() => setIsDateTimeModalOpen(false)} className="rounded-xl font-bold text-slate-500 hover:text-slate-800">Cancel</Button>
                <Button onClick={handleDateTimeSubmit} className={cn("flex-1 h-12 rounded-xl", BUTTON_PRIMARY)} disabled={!selectedEventDate || !selectedEventTime}>
                  Confirm Date
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL: CUSTOMER DETAILS */}
        <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-xl p-0 border-0 bg-transparent shadow-none">
            <div className="bg-white m-1 rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <CustomerDetailsForm
                onSubmit={handleCustomerDetailsSubmit}
                onCancel={() => setIsCustomerDetailsModalOpen(false)}
                onBack={() => {
                  setIsCustomerDetailsModalOpen(false);
                  setIsDateTimeModalOpen(true);
                }}
                eventTime={selectedEventTime}
                initialValues={customerDetailsForPayment || undefined}
                selectedPackageId={selectedPackage?.id}
              />
            </div>
          </DialogContent>
        </Dialog>

        {currentEventConfig && customerDetailsForPayment && currentEventConfig.eventDate && (
          <PaymentConfirmationDialog
            isOpen={isPaymentModalOpen}
            onClose={resetBookingProcess}
            onBack={() => {
              setIsPaymentModalOpen(false);
              setIsCustomerDetailsModalOpen(true);
            }}
            eventConfig={currentEventConfig as EventConfig & { eventDate: Date }}
            customerDetails={customerDetailsForPayment}
          />
        )}

      </div>
    </div>
  );
}