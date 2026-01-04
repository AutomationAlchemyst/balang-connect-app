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
  Package as PackageIcon, // Renamed to avoid conflict with type EventPackage
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
import { WavyBackground } from '@/components/ui/wavy-background';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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

// OPTION A: THE MODERN COAST THEME CONSTANTS
// Note: We are using custom classes defined in globals.css (glass-panel-wet, btn-coast-primary, etc.)

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
            title: "Package Flavor Limit Reached",
            description: `Cannot add '${flavorDetails?.name || 'Unknown Flavor'}'. Your selected package allows a maximum of ${currentMaxFlavors} flavors.`,
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
      const packageToSet = mockPackages.find(p => p.id === defaultPackageIdFromUrl);
      if (packageToSet && selectedPackage?.id !== packageToSet.id) {
        setSelectedPackage(packageToSet);
      }

      const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
      if (currentParams.has('defaultPackageId')) {
        currentParams.delete('defaultPackageId');
        const queryString = currentParams.toString();
        router.replace(`/event-builder${queryString ? `?${queryString}` : ''}`, { scroll: false });
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
            title: `Package Flavor Limit Reached`,
            description: `Could not add: ${couldNotAddFlavors.join(', ')}. '${selectedPackage.name}' allows ${maxPackageFlavors} flavor(s). Others were added if space allowed.`,
            variant: "destructive",
          });
        }, 0);
      }

      if (currentParams.has('addFlavorIds')) {
        currentParams.delete('addFlavorIds');
        const queryString = currentParams.toString();
        router.replace(`/event-builder${queryString ? `?${queryString}` : ''}`, { scroll: false });
      }
    } else if (flavorIdsToAddParam && !selectedPackage && !currentParams.has('defaultPackageId')) {
      setTimeout(() => {
        toast({
          title: "Select a Package",
          description: "Please select a base package to add these flavors.",
          variant: "default",
        });
      }, 0);
      if (currentParams.has('addFlavorIds')) {
        currentParams.delete('addFlavorIds');
        const queryString = currentParams.toString();
        router.replace(`/event-builder${queryString ? `?${queryString}` : ''}`, { scroll: false });
      }
    }
  }, [searchParams, router, selectedPackage, getMaxFlavors, toast]);


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
        if (addon) {
          currentTotal += addon.price * quantity;
        }
      });
    }

    if (addonsSelectedList.length > 0 && (!selectedPackage || (selectedPackage && !selectedPackage.isAllInclusive))) {
      if (selectedPackage?.id === 'pkg_17l_self_pickup' && !isDeliveryRequested) {
        // Do not add delivery fee
      } else {
        currentTotal += deliveryFee;
        deliveryFeeApplied = true;
      }
    } else if (selectedPackage && !selectedPackage.isAllInclusive) {
      if (selectedPackage?.id === 'pkg_17l_self_pickup' && !isDeliveryRequested) {
        // Do not add delivery fee
      } else {
        currentTotal += deliveryFee;
        deliveryFeeApplied = true;
      }
    }


    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? deliveryFee : 0);
  }, [selectedPackage, selectedAddons, deliveryFee, isDeliveryRequested]);

  useEffect(() => {
    setAddonFlavorSelections(prevSelections => {
      const nextState: Record<string, (string | undefined)[]> = {};
      let hasChanged = false;
      const balangAddonIds = ['addon_balang_23l', 'addon_balang_40l'];

      for (const addonId in selectedAddons) {
        if (balangAddonIds.includes(addonId)) {
          const quantity = selectedAddons[addonId];
          const existingFlavors = prevSelections[addonId] || [];
          const newFlavorsForAddon = Array(quantity)
            .fill(undefined)
            .map((_, i) => existingFlavors[i]);

          if (JSON.stringify(prevSelections[addonId]) !== JSON.stringify(newFlavorsForAddon)) {
            hasChanged = true;
          }
          nextState[addonId] = newFlavorsForAddon;
        }
      }

      for (const addonId in prevSelections) {
        if (balangAddonIds.includes(addonId) && (!selectedAddons[addonId] || selectedAddons[addonId] === 0)) {
          hasChanged = true;
        } else if (balangAddonIds.includes(addonId) && selectedAddons[addonId] && prevSelections[addonId]?.length !== selectedAddons[addonId]) {
          hasChanged = true;
        }
      }

      if (!hasChanged) {
        let structureMatch = Object.keys(prevSelections).filter(key => balangAddonIds.includes(key)).length === Object.keys(nextState).filter(key => balangAddonIds.includes(key)).length;
        if (structureMatch) {
          for (const key in nextState) {
            if (balangAddonIds.includes(key) && (!prevSelections[key] || JSON.stringify(prevSelections[key]) !== JSON.stringify(nextState[key]))) {
              structureMatch = false;
              break;
            }
          }
          if (structureMatch && Object.keys(prevSelections).filter(key => balangAddonIds.includes(key)).every(key => nextState.hasOwnProperty(key))) return prevSelections;
        }
      }
      const finalState = { ...prevSelections };
      balangAddonIds.forEach(id => {
        if (nextState[id]) finalState[id] = nextState[id];
        else if (selectedAddons[id] === 0 || !selectedAddons[id]) delete finalState[id];
      });
      return finalState;
    });
  }, [selectedAddons]);

  const handleAddonToggle = (addonId: string, checked: boolean) => {
    setSelectedAddons(prev => {
      const newAddons = { ...prev };
      if (checked) {
        newAddons[addonId] = 1;
      } else {
        delete newAddons[addonId];
        if (addonId === 'addon_balang_23l' || addonId === 'addon_balang_40l') {
          setAddonFlavorSelections(currentSelections => {
            const { [addonId]: _, ...rest } = currentSelections;
            return rest;
          });
        }
      }
      return newAddons;
    });
  };

  const handleAddonQuantityChange = (addonId: string, change: number) => {
    setSelectedAddons(prev => {
      const newQuantity = (prev[addonId] || 0) + change;
      if (newQuantity <= 0) {
        const { [addonId]: _, ...rest } = prev;
        if (addonId === 'addon_balang_23l' || addonId === 'addon_balang_40l') {
          setAddonFlavorSelections(currentSelections => {
            const { [addonId]: _val, ...otherSelections } = currentSelections;
            return otherSelections;
          });
        }
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
        title: "Empty Configuration",
        description: "Please select a package or at least one add-on to proceed.",
        variant: "destructive",
      });
      return;
    }

    const requiredFlavorCountForPackage = selectedPackage ? getMaxFlavors() : 0;
    if (selectedPackage && requiredFlavorCountForPackage > 0 && selectedPackageFlavors.length < requiredFlavorCountForPackage) {
      toast({
        title: "Package Flavors Incomplete",
        description: `Please select all ${requiredFlavorCountForPackage} flavors for the '${selectedPackage.name}'. You have currently selected ${selectedPackageFlavors.length}.`,
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
        const addon = mockAddons.find(a => a.id === addonId);
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
        title: "Date or Time Missing",
        description: "Please select both a date and a time for your event.",
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
    if (!currentEventConfig) {
      toast({
        title: "Error",
        description: "Event configuration is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }
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

  let packageRouteValid = false;
  if (packageIsSelected) {
    if (requiredFlavorCountForPackage > 0) {
      packageRouteValid = selectedPackageFlavors.length === requiredFlavorCountForPackage;
    } else {
      packageRouteValid = true;
    }
  }

  const addonsSelected = Object.keys(selectedAddons).some(key => selectedAddons[key] > 0);
  const addonsOnlyRouteValid = !packageIsSelected && addonsSelected;
  const canProceed = packageRouteValid || addonsOnlyRouteValid;

  return (
    <div className="relative min-h-screen">
      <WavyBackground
        className="fixed inset-0 z-0"
        colors={["#004F59", "#00E0C6", "#FF6F61", "#F4EBD0", "#FFB347"]}
        waveWidth={60}
        speed="slow"
      />

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-32">
        {/* HERO SECTION */}
        <div className="text-center space-y-8 mb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-brand-teal text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl rotate-1">
            <Sparkles size={16} className="text-brand-aqua" strokeWidth={4} />
            Instant Booking
          </div>

          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter text-brand-teal drop-shadow-2xl">
            Event<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua to-brand-cyan">Architect</span>
          </h1>

          <p className="text-xl md:text-2xl text-brand-teal/60 font-bold leading-relaxed max-w-2xl mx-auto border-t border-brand-teal/10 pt-8 uppercase tracking-widest">
            Construct your "Liquid Paradise" experience. Select premium packages and hand-crafted flavors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: BUILDER STEPS */}
          <div className="lg:col-span-8 space-y-10">

            {/* STEP 1: PACKAGE */}
            <section className="relative group/step">
              <div className="absolute -left-12 top-0 bottom-0 w-px bg-white/10 hidden xl:block"></div>
              <div className="absolute -left-[51px] top-4 w-[10px] h-[10px] rounded-full bg-brand-aqua shadow-[0_0_15px_rgba(0,224,198,0.5)] hidden xl:block"></div>

              <Card className="glass-panel-wet bg-white/40 backdrop-blur-3xl border-white/20 shadow-2xl overflow-hidden">
                <CardHeader className="p-6 md:p-10 pb-6 border-b border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <PackageIcon size={120} className="text-brand-teal" />
                  </div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-black text-xl shadow-lg rotate-3 overflow-hidden">
                      <div className="absolute inset-0 bg-brand-aqua/20 animate-pulse"></div>
                      <span className="relative z-10">01</span>
                    </div>
                    <span className="text-brand-aqua font-display font-black text-xs uppercase tracking-[0.3em]">Foundation</span>
                  </div>
                  <CardTitle className="text-brand-teal text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase tracking-tight relative z-10">
                    Select Base <br />
                    <span className="text-brand-teal/40">Package</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-10 space-y-6 md:space-y-10">
                  <div className="space-y-4">
                    <Label className="text-brand-teal/40 font-black uppercase text-[10px] tracking-[0.3em] pl-6">Curated Selection</Label>
                    <Select
                      onValueChange={(pkgId) => {
                        if (pkgId === "none-option") {
                          setSelectedPackage(null);
                        } else {
                          const newSelectedPackage = mockPackages.find(p => p.id === pkgId) || null;
                          setSelectedPackage(newSelectedPackage);
                        }
                      }}
                      value={selectedPackage?.id || "none-option"}
                    >
                      <SelectTrigger className="bg-white/40 border-white/60 h-20 text-xl font-display font-black text-brand-teal rounded-[2rem] px-8 shadow-inner hover:bg-white/60 focus:ring-brand-aqua/50 transition-all">
                        <SelectValue placeholder="Choose your package..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-2xl border-white/50 rounded-[2rem] p-4">
                        <SelectItem value="none-option" className="font-bold text-brand-teal py-4 rounded-2xl focus:bg-brand-aqua/20">None (Build Custom)</SelectItem>
                        <Separator className="my-2 bg-brand-teal/5" />
                        {mockPackages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id} className="font-bold text-brand-teal py-4 rounded-2xl focus:bg-brand-aqua/20">
                            {pkg.name} — <span className="text-brand-aqua">${pkg.price.toFixed(2)}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPackage && (
                    <div className="animate-in slide-in-from-bottom-6 duration-700">
                      <div className="bg-brand-teal/5 border border-brand-teal/10 p-6 md:p-10 rounded-[3rem] relative overflow-hidden group">
                        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-brand-aqua/5 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-aqua/10 transition-colors duration-700"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10">
                          <div className="space-y-4">
                            <h4 className="text-brand-teal text-2xl md:text-3xl font-display font-black uppercase tracking-tight">{selectedPackage.name}</h4>
                            <p className="text-brand-teal/60 text-lg font-medium leading-relaxed max-w-md border-l-4 border-brand-aqua/30 pl-6 italic">"{selectedPackage.description}"</p>
                          </div>
                          <div className="text-right">
                            <span className="block font-display font-black text-5xl text-brand-teal tracking-tighter">${selectedPackage.price.toFixed(2)}</span>
                            {selectedPackage.isAllInclusive && (
                              <Badge className="bg-brand-coral text-white border-none mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Ultimate Tier
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 pt-8 border-t border-brand-teal/10">
                          {selectedPackage.includedItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-brand-teal font-bold text-sm tracking-tight group/item">
                              <div className="w-8 h-8 bg-brand-aqua/20 text-brand-aqua rounded-xl flex items-center justify-center group-hover/item:bg-brand-aqua group-hover/item:text-white transition-all duration-300">
                                <Check size={16} strokeWidth={4} />
                              </div>
                              {item}
                            </div>
                          ))}
                        </div>

                        {selectedPackage.id === 'pkg_17l_self_pickup' && (
                          <div className="mt-10 p-6 bg-white/40 border border-white/60 rounded-3xl backdrop-blur-md relative z-10 flex items-center gap-4 group/optout cursor-pointer" onClick={() => setIsDeliveryRequested(!isDeliveryRequested)}>
                            <div className={cn(
                              "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all",
                              isDeliveryRequested ? "bg-brand-teal border-brand-teal text-white shadow-lg rotate-6" : "border-brand-teal/20 bg-white"
                            )}>
                              {isDeliveryRequested && <Check size={16} strokeWidth={4} />}
                            </div>
                            <Label className="text-brand-teal font-black uppercase text-xs tracking-widest cursor-pointer select-none">
                              I want delivery ($20.00 Delivery Fee Applied)
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* STEP 2: FLAVORS */}
            {selectedPackage && requiredFlavorCountForPackage > 0 && (
              <section className="relative group/step">
                <div className="absolute -left-12 top-0 bottom-0 w-px bg-white/10 hidden xl:block"></div>
                <div className="absolute -left-[51px] top-4 w-[10px] h-[10px] rounded-full bg-brand-aqua shadow-[0_0_15px_rgba(0,224,198,0.5)] hidden xl:block"></div>

                <Card className="glass-panel-wet bg-white/40 backdrop-blur-3xl border-white/20 shadow-2xl overflow-hidden">
                  <CardHeader className="p-6 md:p-10 pb-6 border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Droplets size={120} className="text-brand-teal" />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-black text-xl shadow-lg -rotate-3 overflow-hidden">
                            <div className="absolute inset-0 bg-brand-aqua/20 animate-pulse"></div>
                            <span className="relative z-10">02</span>
                          </div>
                          <span className="text-brand-aqua font-display font-black text-xs uppercase tracking-[0.4em]">Curation</span>
                        </div>
                        <CardTitle className="text-brand-teal text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase tracking-tight">
                          Pick Your <br />
                          <span className="text-brand-teal/40">Flavors</span>
                        </CardTitle>
                      </div>
                      <div className="hidden lg:block">
                        <div className={cn(
                          "px-8 py-4 rounded-[2rem] font-black text-sm border-2 transition-all duration-500",
                          selectedPackageFlavors.length === requiredFlavorCountForPackage
                            ? "bg-brand-aqua border-brand-aqua text-brand-teal shadow-[0_0_30px_rgba(32,224,198,0.3)]"
                            : "bg-white/40 border-white/60 text-brand-teal"
                        )}>
                          <span className="opacity-40 uppercase tracking-widest mr-3">Status:</span>
                          {selectedPackageFlavors.length} / {requiredFlavorCountForPackage} Complete
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10">
                    {/* Selected Flavors Chips */}
                    <div className="flex flex-wrap gap-4 mb-12 min-h-[60px] p-6 bg-brand-teal/5 border border-brand-teal/10 rounded-[2.5rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-aqua/5 rounded-full blur-2xl pointer-events-none"></div>
                      {selectedPackageFlavors.length === 0 && (
                        <div className="flex items-center gap-3 text-brand-teal/40 font-bold italic py-2">
                          <Waves size={16} className="animate-pulse" />
                          <span>Your Balang is currently empty...</span>
                        </div>
                      )}
                      {selectedPackageFlavors.map((flavorId, index) => {
                        const flavor = mockFlavors.find(f => f.id === flavorId);
                        return (
                          <div key={`selected-pkgflavor-${flavorId}-${index}`} className="group flex items-center pl-6 pr-3 py-3 bg-brand-teal text-white text-sm font-black rounded-2xl shadow-xl hover:shadow-brand-teal/20 hover:scale-105 transition-all cursor-default animate-in zoom-in duration-300 border border-white/20">
                            <span className="uppercase tracking-tight">{flavor?.name}</span>
                            <button
                              className="ml-4 bg-white/10 hover:bg-brand-coral rounded-xl p-2 transition-all"
                              onClick={() => handleRemovePackageFlavorByIndex(index)}
                            >
                              <XIcon size={14} strokeWidth={4} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {mockFlavors.map(flavor => {
                        const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                        const canAdd = selectedPackageFlavors.length < requiredFlavorCountForPackage;

                        return (
                          <button
                            key={`avail-pkgflavor-${flavor.id}`}
                            onClick={() => canAdd && handleAddPackageFlavor(flavor.id)}
                            disabled={!canAdd}
                            className={cn(
                              "group relative p-6 rounded-[2rem] border-2 text-left transition-all duration-500 overflow-hidden",
                              !canAdd && count === 0
                                ? "opacity-40 cursor-not-allowed bg-white/10 border-white/20 pb-8"
                                : "bg-white/40 border-white/60 hover:border-brand-aqua/50 hover:bg-white/60 hover:-translate-y-2 hover:shadow-2xl shadow-lg"
                            )}
                          >
                            <div className="space-y-1 relative z-10 mb-6">
                              <span className="text-brand-aqua font-display font-black text-[10px] uppercase tracking-[0.3em]">Tropical Mix</span>
                              <h4 className="text-brand-teal text-xl font-display font-black uppercase leading-none group-hover:text-brand-aqua transition-colors">
                                {flavor.name}
                              </h4>
                            </div>

                            <div className="flex justify-between items-center relative z-10">
                              <div className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all",
                                count > 0 ? "bg-brand-coral text-white shadow-lg" : "text-brand-teal/30 bg-brand-teal/5"
                              )}>
                                {count > 0 ? `${count} Selected` : 'Add Selection'}
                              </div>
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                count > 0 ? "bg-brand-aqua text-brand-teal rotate-12 scale-110" : "bg-white/40 text-brand-teal/20 group-hover:bg-brand-aqua group-hover:text-brand-teal group-hover:rotate-12"
                              )}>
                                <PlusCircle size={20} strokeWidth={3} />
                              </div>
                            </div>

                            {/* Progress Indicator inside button if multiple */}
                            {count > 0 && (
                              <div className="absolute bottom-0 left-0 h-1 bg-brand-coral transition-all duration-500" style={{ width: `${(count / requiredFlavorCountForPackage) * 100}%` }}></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* STEP 3: ADD-ONS */}
            {selectedPackage?.id !== 'pkg_17l_self_pickup' && (
              <section className="relative group/step">
                <div className="absolute -left-12 top-0 bottom-0 w-px bg-white/10 hidden xl:block"></div>
                <div className="absolute -left-[51px] top-4 w-[10px] h-[10px] rounded-full bg-brand-aqua shadow-[0_0_15px_rgba(0,224,198,0.5)] hidden xl:block"></div>

                <Card className="glass-panel-wet bg-white/40 backdrop-blur-3xl border-white/20 shadow-2xl overflow-hidden">
                  <CardHeader className="p-6 md:p-10 pb-6 border-b border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Zap size={120} className="text-brand-teal" />
                    </div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-brand-teal text-white flex items-center justify-center font-black text-xl shadow-lg rotate-12 overflow-hidden">
                        <div className="absolute inset-0 bg-brand-aqua/20 animate-pulse"></div>
                        <span className="relative z-10">03</span>
                      </div>
                      <span className="text-brand-aqua font-display font-black text-xs uppercase tracking-[0.4em]">Amplification</span>
                    </div>
                    <CardTitle className="text-brand-teal text-3xl md:text-4xl lg:text-5xl font-display font-black uppercase tracking-tight relative z-10">
                      Enhance Your <br />
                      <span className="text-brand-teal/40">Event</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-10 space-y-6">
                    {mockAddons.map(addon => {
                      const isSelected = selectedAddons[addon.id] > 0;
                      return (
                        <div
                          key={addon.id}
                          className={cn(
                            "p-8 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden group/addon",
                            isSelected
                              ? "bg-white border-brand-aqua shadow-[0_20px_50px_rgba(0,40,80,0.1)] scale-[1.02]"
                              : "bg-white/40 border-white/60 hover:border-brand-aqua/30 hover:bg-white/60"
                          )}
                        >
                          <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-brand-aqua/5 rounded-full blur-2xl pointer-events-none group-hover/addon:bg-brand-aqua/10 transition-colors"></div>

                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="flex-grow cursor-pointer" onClick={() => !isSelected && handleAddonToggle(addon.id, true)}>
                              <div className="flex items-center gap-4 mb-2">
                                <h4 className="font-display font-black uppercase text-xl text-brand-teal tracking-tight">{addon.name}</h4>
                                {isSelected && (
                                  <Badge className="bg-brand-aqua text-brand-teal border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    Enhanced
                                  </Badge>
                                )}
                              </div>
                              <p className="text-brand-teal/60 text-base font-medium leading-relaxed max-w-lg mb-4">{addon.description}</p>
                              <p className="font-display font-black text-2xl text-brand-aqua tracking-tighter">+${addon.price.toFixed(2)}</p>
                            </div>

                            <div className="flex items-center space-x-4 bg-brand-teal/5 p-3 rounded-[1.5rem] border border-brand-teal/10 shadow-inner">
                              {isSelected ? (
                                <>
                                  <Button size="icon" variant="ghost" onClick={() => handleAddonQuantityChange(addon.id, -1)} className="hover:bg-brand-coral hover:text-white rounded-[1rem] h-12 w-12 transition-all shadow-sm">
                                    <MinusCircle size={24} strokeWidth={2.5} />
                                  </Button>
                                  <span className="w-10 text-center font-display font-black text-2xl text-brand-teal">{selectedAddons[addon.id]}</span>
                                  <Button size="icon" variant="ghost" onClick={() => handleAddonQuantityChange(addon.id, 1)} className="hover:bg-brand-teal hover:text-white rounded-[1rem] h-12 w-12 transition-all shadow-sm">
                                    <PlusCircle size={24} strokeWidth={2.5} />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  onClick={() => handleAddonToggle(addon.id, true)}
                                  className="text-brand-teal font-black uppercase tracking-widest text-xs px-8 h-12 hover:bg-brand-teal hover:text-white rounded-[1rem] transition-all"
                                >
                                  Integrate
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Balang Flavor Selection Logic for Addons */}
                          {(addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l') && isSelected && (
                            <div className="mt-8 pt-8 border-t-2 border-dashed border-brand-teal/10 animate-in slide-in-from-top-4 duration-500 relative z-10">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-brand-aqua/20 flex items-center justify-center text-brand-aqua">
                                  <Droplets size={16} strokeWidth={3} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-teal/40">Select Flavors for Extra Units</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...Array(selectedAddons[addon.id])].map((_, balangIndex) => {
                                  const currentSelectedFlavorId = addonFlavorSelections[addon.id]?.[balangIndex];
                                  const currentSelectedFlavor = currentSelectedFlavorId ? mockFlavors.find(f => f.id === currentSelectedFlavorId) : null;

                                  return (
                                    <div key={`${addon.id}-balang-${balangIndex}`} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-white hover:border-brand-aqua/50 transition-all group/pop">
                                      <span className="text-xs font-black text-brand-teal uppercase tracking-widest opacity-60">Unit {balangIndex + 1}</span>

                                      <Popover
                                        open={activeAddonFlavorPopover?.addonId === addon.id && activeAddonFlavorPopover?.balangIndex === balangIndex}
                                        onOpenChange={(isOpen) => isOpen ? setActiveAddonFlavorPopover({ addonId: addon.id, balangIndex }) : setActiveAddonFlavorPopover(null)}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" className={cn(
                                            "min-w-[160px] justify-between border-brand-teal/10 bg-white/80 backdrop-blur-md rounded-xl font-bold transition-all px-4",
                                            currentSelectedFlavor ? "text-brand-teal border-brand-aqua/30" : "text-brand-teal/40"
                                          )}>
                                            <span className="truncate">{currentSelectedFlavor ? currentSelectedFlavor.name : "Choose Flavor"}</span>
                                            <ChevronRight size={14} className={cn("ml-2 transition-transform", activeAddonFlavorPopover ? "rotate-90" : "")} strokeWidth={3} />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-2 bg-white/95 backdrop-blur-2xl border-white/50 shadow-2xl rounded-2xl overflow-hidden" align="end">
                                          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar space-y-1">
                                            {mockFlavors.map(flavor => (
                                              <div
                                                key={flavor.id}
                                                className={cn(
                                                  "px-4 py-3 text-sm font-black text-brand-teal rounded-xl cursor-pointer transition-all",
                                                  currentSelectedFlavorId === flavor.id ? 'bg-brand-aqua text-brand-teal' : 'hover:bg-brand-teal/5'
                                                )}
                                                onClick={() => {
                                                  handleAdditiveFlavorSelect(addon.id, balangIndex, flavor.id);
                                                  setActiveAddonFlavorPopover(null);
                                                }}
                                              >
                                                {flavor.name}
                                              </div>
                                            ))}
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: SUMMARY STICKY */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-32 space-y-8">
              <Card className="glass-panel-wet bg-white/40 backdrop-blur-3xl border-white/20 shadow-[0_40px_100px_rgba(0,40,80,0.1)] overflow-hidden rounded-[3rem]">
                <div className="bg-brand-teal p-6 md:p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-brand-aqua rounded-full opacity-20 blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-brand-coral rounded-full opacity-10 blur-3xl"></div>
                  <h3 className="text-white font-display font-black text-2xl uppercase tracking-[0.2em] flex items-center gap-4 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <ShoppingCart size={20} strokeWidth={3} />
                    </div>
                    Manifest
                  </h3>
                </div>

                <CardContent className="p-6 md:p-10 space-y-8">
                  {/* Line Items */}
                  <div className="space-y-6">
                    {/* Package */}
                    {selectedPackage ? (
                      <div className="space-y-3 group/item">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="font-display font-black text-brand-teal uppercase text-lg leading-none tracking-tight">{selectedPackage.name}</p>
                            {selectedPackage.isAllInclusive && <span className="text-[10px] text-white bg-brand-coral px-2 py-1 rounded-lg uppercase font-black tracking-widest shadow-sm">Ultimate Tier</span>}
                          </div>
                          <p className="font-display font-black text-xl text-brand-teal tracking-tighter">${selectedPackage.price.toFixed(2)}</p>
                        </div>

                        {/* Flavors Summary (Compact) */}
                        {selectedPackageFlavors.length > 0 && (
                          <div className="bg-brand-teal/5 p-4 rounded-2xl border border-brand-teal/5 space-y-2">
                            <p className="text-brand-teal/40 font-black uppercase text-[9px] tracking-[0.3em] mb-1">Curation List</p>
                            {(() => {
                              const counts: Record<string, number> = {};
                              selectedPackageFlavors.forEach(id => counts[id] = (counts[id] || 0) + 1);
                              return Object.entries(counts).map(([id, n]) => (
                                <div key={id} className="flex justify-between text-brand-teal font-bold text-sm">
                                  <span className="truncate pr-4">{mockFlavors.find(f => f.id === id)?.name}</span>
                                  <span className="text-brand-aqua opacity-60">x{n}</span>
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10 border-4 border-dashed border-brand-teal/5 rounded-[2rem] bg-brand-teal/5">
                        <PackageIcon size={40} className="mx-auto text-brand-teal/10 mb-3" />
                        <p className="text-brand-teal/30 text-xs font-black uppercase tracking-widest">No base selected</p>
                      </div>
                    )}

                    {/* Addons */}
                    {Object.entries(selectedAddons).some(([_, qty]) => qty > 0) && (
                      <div className="space-y-4 pt-4 border-t border-brand-teal/10">
                        <p className="text-brand-teal/40 font-black uppercase text-[10px] tracking-[0.4em]">Amplifications</p>
                        {Object.entries(selectedAddons).map(([id, qty]) => {
                          if (qty === 0) return null;
                          const addon = mockAddons.find(a => a.id === id);
                          if (!addon) return null;
                          return (
                            <div key={id} className="flex justify-between items-start group/additive">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-brand-aqua shadow-sm group-hover/additive:scale-150 transition-transform"></div>
                                <span className="text-brand-teal font-bold text-sm truncate max-w-[140px]">{addon.name}</span>
                                <span className="text-white bg-brand-teal px-1.5 py-0.5 rounded-md font-black text-[10px] tracking-tight">x{qty}</span>
                              </div>
                              <span className="font-display font-black text-brand-teal/80 text-sm tracking-tighter">${(addon.price * qty).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Delivery */}
                    {displayDeliveryFee > 0 && (
                      <div className="flex justify-between items-center pt-6 border-t border-brand-teal/10">
                        <div className="flex items-center gap-3 text-brand-teal/40 font-black uppercase text-[10px] tracking-[0.2em]">
                          <Truck size={14} /> Logistics
                        </div>
                        <span className="font-display font-black text-brand-teal/60 text-sm tracking-tighter">${displayDeliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="pt-10 border-t-4 border-brand-teal/10 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6">
                      <Zap size={24} className="text-brand-aqua animate-pulse fill-brand-aqua" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-display font-black uppercase text-brand-teal/20 text-xs tracking-[0.5em]">Total Valuation</span>
                      <span className="font-display font-black text-6xl text-brand-teal tracking-tighter drop-shadow-sm">
                        <span className="text-brand-aqua opacity-50">$</span>{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 md:p-10 pt-0">
                  <Button
                    className="w-full bg-brand-teal text-white hover:bg-brand-aqua hover:text-brand-teal h-20 text-xl font-display font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98] group"
                    onClick={handleProceedToBook}
                    disabled={!canProceed || isCalendarDataLoading}
                  >
                    {isCalendarDataLoading ? <Loader2 className="animate-spin" /> : (
                      <div className="flex items-center gap-4">
                        Execute Booking <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={4} />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Trust Badge */}
              <div className="flex flex-col items-center gap-4 py-8 px-10 bg-white/20 backdrop-blur-xl border border-white/30 rounded-[2rem] text-center">
                <div className="flex items-center gap-2 text-brand-teal font-black uppercase text-[10px] tracking-[0.3em]">
                  <Info size={16} className="text-brand-aqua" strokeWidth={3} /> Verified Logistics
                </div>
                <p className="text-brand-teal/60 text-xs font-bold leading-relaxed">
                  Instant confirmation upon payment. All rentals include setup, ice, and premium presentation.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODALS */}
      <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
        <DialogContent className="glass-panel-wet bg-white/60 backdrop-blur-3xl border-white/20 p-0 overflow-hidden sm:max-w-xl rounded-[3rem] shadow-2xl">
          <DialogHeader className="p-6 md:p-10 bg-brand-teal text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CalendarDays size={120} className="text-white" />
            </div>
            <div className="flex items-center gap-4 mb-2 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-brand-aqua text-brand-teal flex items-center justify-center font-black shadow-lg">
                <span className="relative z-10">04</span>
              </div>
              <span className="text-brand-aqua font-display font-black text-xs uppercase tracking-[0.4em]">Logistics</span>
            </div>
            <DialogTitle className="font-display font-black text-4xl uppercase tracking-tight relative z-10">
              Select <br />
              <span className="text-white/40">Your Date</span>
            </DialogTitle>
            <DialogDescription className="text-white/60 font-medium text-sm mt-2 relative z-10">
              Choose a temporal slot for your premium experience.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 md:p-10 space-y-6 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
              {/* Calendar Side */}
              <div className="bg-white/40 border border-white/60 rounded-[2.5rem] p-4 md:p-6 shadow-xl backdrop-blur-md">
                <Calendar
                  mode="single"
                  selected={selectedEventDate}
                  onSelect={setSelectedEventDate}
                  disabled={[...blockedDates, { before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                  className="w-full"
                  classNames={{
                    head_cell: "text-brand-teal font-black uppercase text-[10px] tracking-[0.2em] pt-4",
                    cell: "h-9 w-9 md:h-11 md:w-11 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-aqua/10 first:[&:has([aria-selected])]:rounded-l-2xl last:[&:has([aria-selected])]:rounded-r-2xl focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 md:h-11 md:w-11 p-0 font-bold aria-selected:opacity-100 hover:bg-brand-aqua/20 hover:font-black hover:rounded-2xl transition-all text-brand-teal",
                    day_selected: "bg-brand-aqua !text-brand-teal font-black rounded-2xl shadow-xl shadow-brand-aqua/30 scale-110",
                    day_today: "bg-brand-teal/5 text-brand-teal font-black rounded-2xl border border-brand-teal/10",
                  }}
                />
              </div>

              {/* Time Slots Side */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-md">
                    <Waves size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-teal/40">Arrival Window</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {EVENT_TIME_SLOTS.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedEventTime(time)}
                      className={cn(
                        "py-3 md:py-4 px-2 rounded-2xl text-[10px] md:text-xs font-black border-2 transition-all duration-300 uppercase tracking-widest",
                        selectedEventTime === time
                          ? "bg-brand-teal text-white border-brand-teal shadow-xl scale-105"
                          : "bg-white/40 text-brand-teal border-white/60 hover:border-brand-aqua/50 hover:bg-white/60"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedEventDate && selectedEventTime && (
              <div className="bg-brand-teal/5 border border-brand-teal/10 p-6 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-aqua/20 flex items-center justify-center text-brand-teal shadow-inner">
                    <Check size={20} strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal/40">Confirmation</p>
                    <p className="text-brand-teal font-display font-black text-sm">
                      {format(selectedEventDate, "PPPP")} @ {selectedEventTime}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 md:p-10 pt-0">
            <Button
              onClick={handleDateTimeSubmit}
              className="w-full bg-brand-teal text-white hover:bg-brand-aqua hover:text-brand-teal h-20 text-xl font-display font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl transition-all hover:scale-[1.03] disabled:opacity-50 disabled:grayscale"
              disabled={!selectedEventDate || !selectedEventTime}
            >
              Confirm Logistics <ArrowRight className="ml-4" strokeWidth={4} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] flex flex-col p-0 border-none bg-transparent shadow-none max-h-[90vh] overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>Please enter your contact information to complete the booking.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto glass-panel-static rounded-[2rem]">
            <CustomerDetailsForm
              onSubmit={handleCustomerDetailsSubmit}
              onCancel={() => setIsCustomerDetailsModalOpen(false)}
              onBack={() => {
                setIsCustomerDetailsModalOpen(false);
                setIsDateTimeModalOpen(true);
              }}
              eventTime={selectedEventTime}
              initialValues={customerDetailsForPayment || undefined}
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
  );
}