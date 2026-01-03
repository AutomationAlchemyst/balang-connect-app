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
import { PlusCircle, MinusCircle, ShoppingCart, Zap, PackageIcon, Construction, Truck, XIcon, Check, CalendarDays, Loader2, Wrench, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogDescription as ShadDialogDescription } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';
import { WavyBackground } from '@/components/ui/wavy-background';
import { Sparkles } from 'lucide-react';

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

// LIQUID PARADISE THEME CONSTANTS
const CARD_STYLE = "glass-panel-wet bg-white/40 backdrop-blur-3xl border-white/20 shadow-2xl overflow-hidden";
const CARD_HEADER_STYLE = "p-10 pb-6 border-b border-white/10 relative overflow-hidden";
const CARD_TITLE_STYLE = "text-brand-teal text-3xl font-display font-black uppercase tracking-tight relative z-10";
const BUTTON_BASE = "font-display font-black uppercase tracking-widest rounded-[1.25rem] transition-all shadow-xl active:scale-95 hover:-translate-y-1";
const INPUT_STYLE = "bg-white/40 border-white/60 h-16 text-brand-teal font-black placeholder:text-brand-teal/20 rounded-[1.25rem] focus:ring-brand-aqua/50 focus:border-brand-aqua transition-all";
const CHECKBOX_STYLE = "border-brand-teal/30 rounded-lg w-6 h-6 data-[state=checked]:bg-brand-aqua data-[state=checked]:border-brand-aqua transition-all";

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
            title: `Package Flavor Limit Reached`,
            description: `Could not add: ${couldNotAddFlavors.join(', ')}. '${selectedPackage.name}' allows ${maxPackageFlavors} flavor(s). Others were added if space allowed.`,
            variant: "destructive",
          });
        }, 0);
      }

      if (currentParams.has('addFlavorIds')) {
        currentParams.delete('addFlavorIds');
        const queryString = currentParams.toString();
        router.replace(`/wedding-corporate-orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
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
        router.replace(`/wedding-corporate-orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
      }
    }
  }, [searchParams, router, selectedPackage, getMaxFlavors, toast]);


  useEffect(() => {
    let currentTotal = 0;
    let deliveryFeeApplied = false;

    if (selectedPackage) {
      currentTotal += selectedPackage.price;
      setDeliveryFee(0); // Corporate packages usually include delivery in this context
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
        // No delivery fee for self-pickup
      } else {
        const feeToApply = selectedPackage?.id === 'pkg_17l_self_pickup' ? SPECIAL_DELIVERY_FEE : deliveryFee;
        currentTotal += feeToApply;
        deliveryFeeApplied = true;
      }
    }


    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? (selectedPackage?.id === 'pkg_17l_self_pickup' ? SPECIAL_DELIVERY_FEE : deliveryFee) : 0);
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

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-32 space-y-24">
        {/* HERO SECTION */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 bg-brand-teal text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 shadow-xl rotate-1">
            <Wrench size={16} className="text-brand-aqua" strokeWidth={4} />
            Bespoke Events
          </div>

          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.85] tracking-tighter text-brand-teal drop-shadow-2xl">
            Liquid<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-aqua to-brand-cyan">Elegance</span>
          </h1>

          <p className="text-xl md:text-2xl text-brand-teal/60 font-bold leading-relaxed max-w-2xl mx-auto border-t border-brand-teal/10 pt-8 uppercase tracking-widest">
            Create the perfect beverage experience for your special day. Select from our premium packages below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className={CARD_STYLE}>
              <CardHeader className={CARD_HEADER_STYLE}>
                <CardTitle className={CARD_TITLE_STYLE}>1. Base Package</CardTitle>
                <CardDescription className="text-brand-blue/60 font-medium">
                  Select a corporate/wedding package or choose 'None' to build from scratch.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
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
                  <SelectTrigger className={`${INPUT_STYLE} h-16 text-lg font-black text-brand-teal rounded-[1.25rem]`}>
                    <SelectValue placeholder="Select a package..." />
                  </SelectTrigger>
                  <SelectContent className="glass-panel-wet bg-white border-none">
                    <SelectItem value="none-option" className="font-display font-black uppercase text-brand-teal focus:bg-brand-aqua/20">None (Build from scratch)</SelectItem>
                    {mockCorporatePackages.map(pkg => (
                      <SelectItem key={pkg.id} value={pkg.id} className="font-display font-black uppercase text-brand-teal focus:bg-brand-aqua/20">
                        {pkg.name} (${pkg.price.toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedPackage && (
                  <div className="mt-4 p-6 bg-brand-blue/5 rounded-2xl border border-brand-blue/10">
                    <h4 className="font-display font-bold text-xl uppercase mb-2 text-brand-blue">{selectedPackage.name}</h4>
                    <p className="text-base text-brand-blue/70 mb-2">{selectedPackage.description}</p>
                    {selectedPackage.isAllInclusive && (
                      <p className="text-sm font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block mb-3 border border-green-200">
                        Includes Setup (${selectedPackage.setupFee.toFixed(2)}) + Delivery + Unlimited Cups!
                      </p>
                    )}
                    <ul className="text-sm mt-2 space-y-2 font-medium text-brand-blue/80">
                      {selectedPackage.includedItems.map(item => <li key={item} className="flex items-center"><Check size={14} className="mr-2 text-brand-cyan" strokeWidth={3} /> {item}</li>)}
                    </ul>
                    {selectedPackage.id === 'pkg_17l_self_pickup' && (
                      <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-brand-teal/10 border-dashed">
                        <Checkbox
                          id="delivery-requested"
                          checked={isDeliveryRequested}
                          onCheckedChange={() => setIsDeliveryRequested(!isDeliveryRequested)}
                          className={CHECKBOX_STYLE}
                        />
                        <Label htmlFor="delivery-requested" className="text-base font-black uppercase tracking-tight cursor-pointer text-brand-teal">
                          I want delivery ($20.00 Delivery Fee)
                        </Label>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedPackage && requiredFlavorCountForPackage > 0 && (
              <Card className={CARD_STYLE}>
                <CardHeader className={CARD_HEADER_STYLE}>
                  <CardTitle className={CARD_TITLE_STYLE}>2. Choose Flavors</CardTitle>
                  <CardDescription className="text-brand-teal/60 font-black uppercase tracking-tight text-[10px] mt-4">
                    Pick {requiredFlavorCountForPackage} flavors. Repeated selections allowed.
                    <span className="block mt-4 font-black bg-brand-aqua text-brand-teal px-4 py-1.5 rounded-full inline-block tracking-widest shadow-lg">
                      Selected: {selectedPackageFlavors.length} / {requiredFlavorCountForPackage}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {selectedPackageFlavors.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-display font-bold uppercase text-sm text-brand-blue">Your Selections:</h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedPackageFlavors.map((flavorId, index) => {
                          const flavor = mockFlavors.find(f => f.id === flavorId);
                          return (
                            <div key={`selected-pkgflavor-${flavorId}-${index}`} className="flex items-center bg-brand-teal text-white rounded-full px-5 py-2 font-black uppercase text-[10px] tracking-widest shadow-xl">
                              {flavor?.name || 'Unknown'}
                              <button
                                className="ml-3 hover:bg-white/20 rounded-full p-1 transition-colors"
                                onClick={() => handleRemovePackageFlavorByIndex(index)}
                                aria-label={`Remove ${flavor?.name}`}
                              >
                                <XIcon size={14} strokeWidth={4} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedPackageFlavors.length > 0 && <Separator className="bg-brand-blue/10 h-px my-4" />}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mockFlavors.map(flavor => {
                      const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                      const canAddMorePackageFlavors = selectedPackageFlavors.length < requiredFlavorCountForPackage;
                      return (
                        <div key={`avail-pkgflavor-${flavor.id}`} className="p-4 border border-brand-blue/10 rounded-2xl flex flex-col justify-between gap-3 bg-white/50 hover:bg-white transition-all shadow-sm">
                          <div>
                            <Label className="font-display font-bold uppercase text-sm block text-brand-blue">{flavor.name}</Label>
                            {count > 0 && <span className="text-xs font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full inline-block mt-1">x{count}</span>}
                          </div>
                          <Button
                            size="sm"
                            className={`${BUTTON_BASE} w-full text-xs h-8 bg-white border border-brand-blue/10 hover:bg-brand-cyan hover:text-white text-brand-blue`}
                            onClick={() => handleAddPackageFlavor(flavor.id)}
                            disabled={!canAddMorePackageFlavors || !selectedPackage}
                          >
                            <PlusCircle size={14} className="mr-1.5" /> Add
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedPackage?.id !== 'pkg_17l_self_pickup' && (
              <Card className={CARD_STYLE}>
                <CardHeader className={CARD_HEADER_STYLE}>
                  <CardTitle className={CARD_TITLE_STYLE}>3. Add-ons</CardTitle>
                  <CardDescription className="text-brand-blue/60 font-medium">Enhance your event with extras.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {mockCorporateAddons.map(addon => (
                    <div key={addon.id} className="p-6 border border-brand-blue/10 rounded-2xl bg-white/40 transition-all hover:bg-white hover:shadow-lg hover:border-brand-cyan/20">
                      <div className="flex items-center justify-between gap-4">
                        <Label htmlFor={`addon-${addon.id}`} className="flex-grow cursor-pointer group">
                          <span className="font-display font-bold uppercase text-lg block text-brand-blue group-hover:text-brand-cyan transition-colors">{addon.name}</span>
                          <p className="text-sm font-medium text-brand-blue/60">{addon.description} (+${addon.price.toFixed(2)})</p>
                        </Label>
                        <div className="flex items-center space-x-3 flex-shrink-0 bg-white/50 p-1.5 rounded-xl border border-white">
                          {selectedAddons[addon.id] > 0 && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleAddonQuantityChange(addon.id, -1)} className={`${BUTTON_BASE} h-8 w-8 hover:bg-red-50 hover:text-red-500`} aria-label="Decrease">
                                <MinusCircle size={16} />
                              </Button>
                              <span className="w-8 text-center font-display font-bold text-xl text-brand-blue">{selectedAddons[addon.id]}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleAddonQuantityChange(addon.id, 1)} className={`${BUTTON_BASE} h-8 w-8 hover:bg-brand-cyan/10 hover:text-brand-cyan`} aria-label="Increase">
                                <PlusCircle size={16} />
                              </Button>
                            </>
                          )}
                          <Checkbox
                            id={`addon-${addon.id}`}
                            checked={!!selectedAddons[addon.id] && selectedAddons[addon.id] > 0}
                            onCheckedChange={(checked) => handleAddonToggle(addon.id, !!checked)}
                            className={CHECKBOX_STYLE}
                          />
                        </div>
                      </div>
                      {(addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l') && selectedAddons[addon.id] > 0 && (
                        <div className="mt-4 pt-4 border-t border-brand-blue/10 border-dashed space-y-4">
                          <h4 className="text-xs font-bold uppercase bg-brand-blue/5 text-brand-blue px-2 py-1 inline-block rounded-md">Choose Balang Flavors:</h4>
                          {[...Array(selectedAddons[addon.id])].map((_, balangIndex) => {
                            const currentSelectedFlavorId = addonFlavorSelections[addon.id]?.[balangIndex];
                            const currentSelectedFlavor = currentSelectedFlavorId ? mockFlavors.find(f => f.id === currentSelectedFlavorId) : null;
                            return (
                              <div key={`${addon.id}-balang-${balangIndex}`} className="p-3 border border-brand-blue/5 rounded-xl bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <Label className="font-bold text-sm uppercase text-brand-blue">
                                  {addon.name.replace('Additional 1 x ', '')} #{balangIndex + 1}
                                </Label>
                                <div className="flex items-center gap-2">
                                  {currentSelectedFlavor ? (
                                    <div className="flex items-center bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-3 py-1 text-xs font-bold rounded-full">
                                      {currentSelectedFlavor.name}
                                      <button
                                        className="ml-2 hover:text-red-500"
                                        onClick={() => handleRemoveAdditiveFlavor(addon.id, balangIndex)}
                                      >
                                        <XIcon size={12} strokeWidth={3} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100">REQUIRED</span>
                                  )}

                                  <Popover
                                    open={activeAddonFlavorPopover?.addonId === addon.id && activeAddonFlavorPopover?.balangIndex === balangIndex}
                                    onOpenChange={(isOpen) => {
                                      if (isOpen) {
                                        setActiveAddonFlavorPopover({ addonId: addon.id, balangIndex: balangIndex });
                                      } else {
                                        setActiveAddonFlavorPopover(null);
                                      }
                                    }}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button size="sm" className={`${BUTTON_BASE} h-8 text-xs bg-white hover:bg-brand-cyan/5 px-4 rounded-full border border-brand-blue/10`}>
                                        {currentSelectedFlavorId ? "Change" : "Select"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[280px] p-0 glass-panel-wet rounded-xl overflow-hidden" side="bottom" align="end">
                                      <div className="p-2">
                                        <h4 className="text-xs font-bold uppercase mb-2 px-2 py-1 bg-brand-blue/5 text-brand-blue rounded-md">Available Flavors</h4>
                                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                                          {mockFlavors.map(flavor => (
                                            <Button
                                              key={`${addon.id}-balang-${balangIndex}-popoverflavor-${flavor.id}`}
                                              variant="ghost"
                                              size="sm"
                                              className={`w-full justify-start text-left h-auto py-2 text-xs font-bold uppercase hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-lg ${currentSelectedFlavorId === flavor.id ? "bg-brand-cyan text-white hover:bg-brand-cyan hover:text-white" : "text-brand-blue/70"}`}
                                              onClick={() => {
                                                handleAdditiveFlavorSelect(addon.id, balangIndex, flavor.id);
                                                setActiveAddonFlavorPopover(null);
                                              }}
                                            >
                                              {currentSelectedFlavorId === flavor.id && <Check className="mr-2 h-3 w-3" strokeWidth={3} />}
                                              {flavor.name}
                                            </Button>
                                          ))}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className={`${CARD_STYLE} sticky top-24 shadow-2xl overflow-hidden`}>
              <CardHeader className="bg-brand-teal p-8 border-none relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <CardTitle className="font-display font-black text-2xl uppercase tracking-tighter flex items-center gap-3 text-white relative z-10">
                  <ShoppingCart className="text-brand-aqua" size={28} strokeWidth={3} /> Summary
                </CardTitle>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-aqua/20 rounded-full blur-2xl"></div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedPackage && (
                  <div className="text-sm">
                    <h4 className="font-black uppercase text-[10px] tracking-[0.2em] border-b border-brand-teal/10 pb-2 mb-4 flex items-center text-brand-teal/40"><PackageIcon size={16} className="mr-3 text-brand-aqua" strokeWidth={3} /> {selectedPackage.name}</h4>
                    <div className="pl-9 space-y-2">
                      <p className="font-display text-4xl font-black text-brand-teal tracking-tighter">
                        ${selectedPackage.price.toFixed(2)}
                      </p>
                      {selectedPackage.isAllInclusive && (
                        <p className="text-[10px] text-brand-teal/40 font-black uppercase tracking-widest">
                          (Package Includes Everything)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {displayDeliveryFee > 0 && (
                  <div className="text-sm">
                    <h4 className="font-bold uppercase border-b border-brand-blue/10 pb-1 mb-2 flex items-center text-brand-blue"><Truck size={16} className="mr-2" /> Delivery</h4>
                    <div className="pl-6">
                      <p className="font-mono text-lg font-bold text-brand-blue">${displayDeliveryFee.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {selectedPackageFlavors.length > 0 && selectedPackage && requiredFlavorCountForPackage > 0 && (
                  <div className="bg-brand-blue/5 rounded-xl p-3 border border-brand-blue/5">
                    <h4 className="font-bold uppercase text-xs mb-2 text-brand-blue">Package Flavors:</h4>
                    <ul className="text-xs space-y-1 text-brand-blue/70">
                      {(() => {
                        const packageFlavorCounts: Record<string, number> = {};
                        selectedPackageFlavors.forEach(id => {
                          packageFlavorCounts[id] = (packageFlavorCounts[id] || 0) + 1;
                        });
                        return Object.entries(packageFlavorCounts).map(([flavorId, count]) => {
                          const flavor = mockFlavors.find(f => f.id === flavorId);
                          return <li key={`pkgsummary-${flavorId}`} className="flex justify-between border-b border-dashed border-brand-blue/10 pb-1 last:border-0"><span>{flavor?.name}</span> <span className="font-bold">x{count}</span></li>;
                        });
                      })()}
                    </ul>
                  </div>
                )}

                {Object.keys(selectedAddons).filter(key => selectedAddons[key] > 0).length > 0 && (
                  <div>
                    <h4 className="font-bold uppercase border-b border-brand-blue/10 pb-1 mb-2 flex items-center text-brand-blue"><Construction size={16} className="mr-2" /> Add-ons</h4>
                    <div className="space-y-2 mt-2">
                      {Object.entries(selectedAddons).map(([addonId, quantity]) => {
                        if (quantity === 0) return null;
                        const addon = mockCorporateAddons.find(a => a.id === addonId);
                        if (!addon) return null;

                        const isBalangAddon = addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l';
                        const flavorsForThisAddon = addonFlavorSelections[addonId]?.map(
                          fId => fId ? mockFlavors.find(f => f.id === fId)?.name : undefined
                        );

                        return (
                          <div key={addonId} className="bg-white/40 border border-brand-teal/10 rounded-[1.25rem] p-5 shadow-sm">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3 text-brand-teal">
                              <span>{addon.name} (x{quantity})</span>
                              <span className="font-display font-black text-brand-teal">${(addon.price * quantity).toFixed(2)}</span>
                            </div>
                            {isBalangAddon && flavorsForThisAddon && flavorsForThisAddon.some(name => name) && (
                              <ul className="space-y-1 pl-4 text-[10px] font-black uppercase tracking-tight text-brand-teal/40 border-l-2 border-brand-aqua/30">
                                {flavorsForThisAddon.map((flavorName, index) => (
                                  flavorName ? <li key={`${addonId}-summaryflavor-${index}`}>{flavorName}</li> : null
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="border-t-4 border-brand-teal/10 pt-6 mt-8">
                  <div className="flex justify-between items-center bg-brand-teal p-6 rounded-[2rem] shadow-2xl rotate-1">
                    <span className="font-display font-black uppercase text-xl text-white">Total:</span>
                    <span className="font-display font-black text-4xl text-brand-aqua tracking-tighter">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  size="lg"
                  className={`${BUTTON_BASE} w-full btn-coast-primary h-14 text-xl shadow-lg`}
                  onClick={handleProceedToBook}
                  disabled={!canProceed || isCalendarDataLoading}
                >
                  {isCalendarDataLoading ? (
                    <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Dates...</>
                  ) : (
                    <>Proceed to Book <Zap className="ml-2 h-6 w-6" strokeWidth={3} /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
          <DialogContent className="sm:max-w-md md:max-w-lg flex flex-col max-h-[90vh] glass-panel-static border-none p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-8 bg-brand-teal text-white border-none relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <DialogTitle className="font-display font-black text-3xl uppercase tracking-tighter flex items-center text-white relative z-10">
                <CalendarDays className="mr-4 h-10 w-10 text-brand-aqua" strokeWidth={3} /> Select Date
              </DialogTitle>
              <DialogDescription className="sr-only">
                Choose a date and time slot for your event.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-grow min-h-0 overflow-y-auto p-6 bg-white/50">
              <div className="flex flex-col gap-6">
                <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 shadow-xl border border-white/60">
                  <Calendar
                    mode="single"
                    selected={selectedEventDate}
                    onSelect={setSelectedEventDate}
                    disabled={[...blockedDates, { before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                    className="w-full border-none shadow-none bg-transparent p-0"
                    classNames={{
                      months: "w-full",
                      month: "w-full space-y-6",
                      table: "w-full border-collapse",
                      head_row: "flex w-full justify-between mb-4",
                      head_cell: "text-brand-teal font-black uppercase text-[10px] tracking-[0.2em] w-10",
                      row: "flex w-full justify-between mt-2",
                      cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-aqua/10 first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl focus-within:relative focus-within:z-20",
                      day: "h-10 w-10 p-0 font-black uppercase tracking-tighter aria-selected:opacity-100 hover:bg-brand-aqua/20 hover:rounded-xl text-brand-teal transition-colors",
                      day_selected: "bg-brand-teal text-white font-black rounded-xl shadow-xl shadow-brand-teal/20",
                      day_today: "bg-brand-aqua/10 text-brand-teal font-black rounded-xl",
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-display font-black uppercase text-[10px] text-brand-teal/40 tracking-[0.2em] block ml-4 mb-4">Available Time Slots</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {EVENT_TIME_SLOTS.map((time) => (
                      <Button
                        key={time}
                        variant="ghost"
                        onClick={() => setSelectedEventTime(time)}
                        className={`${BUTTON_BASE} h-14 text-xs bg-white/40 border border-white/60 hover:bg-brand-aqua hover:text-white text-brand-teal rounded-[1.25rem] ${selectedEventTime === time ? "bg-brand-teal text-white shadow-xl border-transparent" : "shadow-sm"}`}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-brand-blue/5 p-6 bg-white/50 flex-col sm:flex-row gap-3">
              <Button variant="ghost" onClick={() => setIsDateTimeModalOpen(false)} className={`${BUTTON_BASE} hover:bg-white text-brand-blue w-full sm:w-auto`}>Back</Button>
              <Button
                className={`btn-coast-primary w-full sm:w-auto flex-1`}
                onClick={handleDateTimeSubmit}
                disabled={!selectedEventDate || !selectedEventTime}
              >
                Confirm Date &amp; Time
              </Button>
            </DialogFooter>
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