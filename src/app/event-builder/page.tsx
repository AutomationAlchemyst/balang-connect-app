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
import { PlusCircle, MinusCircle, ShoppingCart, Zap, PackageIcon, Construction, Truck, XIcon, Check, CalendarDays, Loader2, ArrowRight, Info, Waves } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogDescription as ShadDialogDescription, DialogFooter } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
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
  const [isDeliveryOptOut, setIsDeliveryOptOut] = useState(false);

  useEffect(() => {
    setIsDeliveryOptOut(false);
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
      if(selectedPackage?.id === 'pkg_17l_self_pickup' && isDeliveryOptOut) {
        // Do not add delivery fee
      } else {
        currentTotal += deliveryFee;
        deliveryFeeApplied = true;
      }
    } else if (selectedPackage && !selectedPackage.isAllInclusive) { 
      if(selectedPackage?.id === 'pkg_17l_self_pickup' && isDeliveryOptOut) {
        // Do not add delivery fee
      } else {
        currentTotal += deliveryFee;
        deliveryFeeApplied = true;
      }
    }


    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? deliveryFee : 0); 
  }, [selectedPackage, selectedAddons, deliveryFee, isDeliveryOptOut]);

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
            for(const key in nextState) { 
                if (balangAddonIds.includes(key) && (!prevSelections[key] || JSON.stringify(prevSelections[key]) !== JSON.stringify(nextState[key]))) {
                    structureMatch = false;
                    break;
                }
            }
            if (structureMatch && Object.keys(prevSelections).filter(key => balangAddonIds.includes(key)).every(key => nextState.hasOwnProperty(key))) return prevSelections; 
          }
      }
      const finalState = {...prevSelections};
      balangAddonIds.forEach(id => {
          if(nextState[id]) finalState[id] = nextState[id];
          else if(selectedAddons[id] === 0 || !selectedAddons[id]) delete finalState[id]; 
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
    <div className="bg-coast-gradient min-h-screen -mt-8 pt-12 pb-24">
      <div className="container mx-auto px-4">
        {/* HERO SECTION */}
        <div className="text-center space-y-4 mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-brand-cyan/20 rounded-full blur-sm"></div>
          <h1 className="text-coast-heading text-4xl md:text-5xl lg:text-6xl drop-shadow-sm">
             Design Your<br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-cyan">Perfect Event</span>
          </h1>
          <p className="text-lg text-brand-blue/70 font-body font-medium max-w-2xl mx-auto leading-relaxed">
             Bring the surf vibes to your office or party. <br className="hidden sm:block"/>
             Select premium Balang packages, curated flavors, and essential add-ons.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: BUILDER STEPS */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* STEP 1: PACKAGE */}
            <section className="relative">
              <Card className="glass-panel-wet bg-white/95 border-white/40 shadow-xl">
                <CardHeader className="pb-4 border-b border-brand-blue/5">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="bg-brand-cyan text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-sm">Step 1</span>
                  </div>
                  <CardTitle className="text-coast-heading text-3xl">Select Base Package</CardTitle>
                  <CardDescription className="text-brand-blue/60 font-medium text-base">
                    Choose a curated setup or start from scratch.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
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
                    <SelectTrigger className="input-coast h-16 text-xl font-bold text-brand-blue shadow-sm">
                      <SelectValue placeholder="Choose your package..." />
                    </SelectTrigger>
                    <SelectContent className="glass-panel-wet border-white/50">
                      <SelectItem value="none-option" className="font-body font-medium text-brand-blue focus:bg-brand-cyan/10 py-3">None (Build Custom)</SelectItem>
                      {mockPackages.map(pkg => (
                        <SelectItem key={pkg.id} value={pkg.id} className="font-body font-medium text-brand-blue focus:bg-brand-cyan/10 py-3">
                          {pkg.name} — <span className="font-bold">${pkg.price.toFixed(2)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPackage && (
                    <div className="mt-6 p-8 bg-gradient-to-br from-white/60 to-white/30 border border-white rounded-3xl shadow-inner">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                          <h4 className="text-coast-heading text-2xl mb-1">{selectedPackage.name}</h4>
                          <p className="text-brand-blue/70 text-sm leading-relaxed max-w-md">{selectedPackage.description}</p>
                        </div>
                        <div className="text-right">
                           <span className="block font-display font-bold text-3xl text-brand-blue">${selectedPackage.price.toFixed(2)}</span>
                           {selectedPackage.isAllInclusive && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 mt-1">
                                All Inclusive
                              </Badge>
                           )}
                        </div>
                      </div>
                      
                      <Separator className="bg-brand-blue/10 mb-6" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPackage.includedItems.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-brand-blue/80 text-sm font-medium">
                            <div className="mt-0.5 bg-brand-cyan/20 p-1 rounded-full text-brand-blue">
                              <Check size={10} strokeWidth={4} />
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>

                      {selectedPackage.id === 'pkg_17l_self_pickup' && (
                        <div className="flex items-center space-x-3 mt-8 pt-6 border-t border-brand-blue/10 border-dashed bg-brand-yellow/10 p-4 rounded-xl">
                          <Checkbox
                            id="delivery-opt-out"
                            checked={isDeliveryOptOut}
                            onCheckedChange={() => setIsDeliveryOptOut(!isDeliveryOptOut)}
                            className="border-brand-blue/40 data-[state=checked]:bg-brand-blue data-[state=checked]:text-white w-6 h-6 rounded-md"
                          />
                          <Label htmlFor="delivery-opt-out" className="text-base font-bold cursor-pointer text-brand-blue select-none">
                            I will pick up the order myself (Opt-out of delivery)
                          </Label>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* STEP 2: FLAVORS */}
            {selectedPackage && requiredFlavorCountForPackage > 0 && (
              <section className="relative">
                <Card className="glass-panel-wet bg-white/95 border-white/40 shadow-xl">
                  <CardHeader className="pb-4 border-b border-brand-blue/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-brand-cyan text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-sm">Step 2</span>
                        </div>
                        <CardTitle className="text-coast-heading text-3xl">Curate Flavors</CardTitle>
                        <CardDescription className="text-brand-blue/60 font-medium text-base">
                          Select {requiredFlavorCountForPackage} premium flavors for your Balang.
                        </CardDescription>
                      </div>
                      <div className="hidden md:block">
                         <div className={`px-4 py-2 rounded-2xl font-bold text-sm border ${selectedPackageFlavors.length === requiredFlavorCountForPackage ? 'bg-green-100 text-green-700 border-green-200' : 'bg-brand-yellow/20 text-brand-blue border-brand-yellow/40'}`}>
                           {selectedPackageFlavors.length} / {requiredFlavorCountForPackage} Selected
                         </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                     {/* Selected Flavors Chips */}
                     <div className="flex flex-wrap gap-3 mb-8 min-h-[40px]">
                        {selectedPackageFlavors.length === 0 && (
                          <span className="text-brand-blue/40 italic text-sm py-2">No flavors selected yet. Pick from below.</span>
                        )}
                        {selectedPackageFlavors.map((flavorId, index) => {
                          const flavor = mockFlavors.find(f => f.id === flavorId);
                          return (
                            <div key={`selected-pkgflavor-${flavorId}-${index}`} className="group flex items-center pl-4 pr-2 py-2 bg-brand-blue text-white text-sm font-bold rounded-full shadow-lg hover:bg-brand-blue/90 transition-all cursor-default animate-in fade-in zoom-in duration-200">
                              {flavor?.name}
                              <button
                                className="ml-2 bg-white/20 hover:bg-white/40 rounded-full p-1 transition-colors"
                                onClick={() => handleRemovePackageFlavorByIndex(index)}
                              >
                                <XIcon size={12} strokeWidth={3} />
                              </button>
                            </div>
                          );
                        })}
                     </div>

                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {mockFlavors.map(flavor => {
                          const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                          const canAdd = selectedPackageFlavors.length < requiredFlavorCountForPackage;
                          
                          return (
                            <button
                              key={`avail-pkgflavor-${flavor.id}`}
                              onClick={() => canAdd && handleAddPackageFlavor(flavor.id)}
                              disabled={!canAdd}
                              className={`
                                relative p-4 rounded-2xl border text-left transition-all duration-200 group
                                ${!canAdd ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : 'hover:-translate-y-1 hover:shadow-md cursor-pointer bg-white/60 border-brand-blue/10 hover:border-brand-cyan/50'}
                              `}
                            >
                               <div className="font-display font-bold text-brand-blue uppercase text-sm mb-2 group-hover:text-brand-cyan transition-colors">{flavor.name}</div>
                               <div className="flex justify-between items-end">
                                  <div className={`text-xs font-medium px-2 py-0.5 rounded-md ${count > 0 ? 'bg-brand-yellow text-brand-blue' : 'text-brand-blue/40 bg-brand-blue/5'}`}>
                                    {count > 0 ? `${count} Selected` : 'Add'}
                                  </div>
                                  <PlusCircle size={18} className={`text-brand-blue/20 group-hover:text-brand-cyan ${count > 0 ? 'opacity-0' : 'opacity-100'}`} />
                               </div>
                               {count > 0 && (
                                 <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-brand-cyan text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                                   {count}
                                 </div>
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
            <section className="relative">
              <Card className="glass-panel-wet bg-white/95 border-white/40 shadow-xl">
                <CardHeader className="pb-4 border-b border-brand-blue/5">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="bg-brand-cyan text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-sm">Step 3</span>
                  </div>
                  <CardTitle className="text-coast-heading text-3xl">Enhancements</CardTitle>
                  <CardDescription className="text-brand-blue/60 font-medium text-base">
                    Upgrade your event with extra capacity or service.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  {mockAddons.map(addon => {
                    const isSelected = selectedAddons[addon.id] > 0;
                    return (
                      <div 
                        key={addon.id} 
                        className={`
                           p-6 rounded-3xl border transition-all duration-300
                           ${isSelected ? 'bg-white border-brand-cyan/30 shadow-lg' : 'bg-white/40 border-transparent hover:bg-white/60'}
                        `}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-grow cursor-pointer" onClick={() => !isSelected && handleAddonToggle(addon.id, true)}>
                             <div className="flex items-center gap-3">
                                <h4 className={`font-display font-bold uppercase text-lg ${isSelected ? 'text-brand-blue' : 'text-brand-blue/80'}`}>{addon.name}</h4>
                                {isSelected && <Badge variant="outline" className="text-brand-cyan border-brand-cyan/30 bg-brand-cyan/5">Selected</Badge>}
                             </div>
                             <p className="text-brand-blue/60 text-sm mt-1 max-w-lg">{addon.description}</p>
                             <p className="font-mono font-bold text-brand-blue mt-2">+${addon.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 bg-white/50 p-2 rounded-2xl border border-white/60">
                             {isSelected ? (
                               <>
                                <Button size="icon" variant="ghost" onClick={() => handleAddonQuantityChange(addon.id, -1)} className="hover:bg-red-50 hover:text-red-500 rounded-xl h-10 w-10">
                                  <MinusCircle size={20} />
                                </Button>
                                <span className="w-8 text-center font-display font-bold text-xl text-brand-blue">{selectedAddons[addon.id]}</span>
                                <Button size="icon" variant="ghost" onClick={() => handleAddonQuantityChange(addon.id, 1)} className="hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-xl h-10 w-10">
                                  <PlusCircle size={20} />
                                </Button>
                               </>
                             ) : (
                               <Button variant="ghost" onClick={() => handleAddonToggle(addon.id, true)} className="text-brand-blue/60 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl">
                                 Add to Event
                               </Button>
                             )}
                          </div>
                        </div>

                        {/* Balang Flavor Selection Logic for Addons */}
                        { (addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l') && isSelected && (
                          <div className="mt-6 pt-6 border-t border-dashed border-brand-blue/10 animate-in slide-in-from-top-2 duration-300">
                             <div className="flex items-center gap-2 mb-4">
                                <Waves size={16} className="text-brand-cyan"/>
                                <span className="text-xs font-bold uppercase tracking-widest text-brand-blue/70">Select Flavors for Extra Balang</span>
                             </div>
                             <div className="space-y-3">
                                {[...Array(selectedAddons[addon.id])].map((_, balangIndex) => {
                                  const currentSelectedFlavorId = addonFlavorSelections[addon.id]?.[balangIndex];
                                  const currentSelectedFlavor = currentSelectedFlavorId ? mockFlavors.find(f => f.id === currentSelectedFlavorId) : null;
                                  
                                  return (
                                    <div key={`${addon.id}-balang-${balangIndex}`} className="flex items-center justify-between p-3 bg-brand-blue/5 rounded-xl border border-brand-blue/5">
                                      <span className="text-sm font-bold text-brand-blue pl-2">Balang #{balangIndex + 1}</span>
                                      
                                      <Popover 
                                        open={activeAddonFlavorPopover?.addonId === addon.id && activeAddonFlavorPopover?.balangIndex === balangIndex}
                                        onOpenChange={(isOpen) => isOpen ? setActiveAddonFlavorPopover({ addonId: addon.id, balangIndex }) : setActiveAddonFlavorPopover(null)}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button variant="outline" className={`min-w-[140px] justify-between border-brand-blue/10 bg-white hover:bg-white hover:border-brand-cyan/50 ${!currentSelectedFlavorId && "text-brand-blue/50"}`}>
                                            {currentSelectedFlavor ? currentSelectedFlavor.name : "Select Flavor"}
                                            <ArrowRight size={14} className="ml-2 opacity-50"/>
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-1 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl rounded-xl" align="end">
                                          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                            {mockFlavors.map(flavor => (
                                              <div 
                                                key={flavor.id}
                                                className={`
                                                  px-3 py-2 text-sm font-bold text-brand-blue rounded-lg cursor-pointer hover:bg-brand-cyan/10 transition-colors
                                                  ${currentSelectedFlavorId === flavor.id ? 'bg-brand-cyan/20 text-brand-blue' : ''}
                                                `}
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
          </div>

          {/* RIGHT COLUMN: SUMMARY STICKY */}
          <div className="lg:col-span-4 relative">
             <div className="sticky top-24 space-y-6">
                <Card className="glass-panel-wet bg-white/90 border-white/60 shadow-2xl overflow-hidden backdrop-blur-xl">
                   <div className="bg-brand-blue p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-brand-cyan rounded-full opacity-20 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-brand-yellow rounded-full opacity-20 blur-2xl"></div>
                      <h3 className="text-white font-display font-bold text-xl uppercase tracking-widest flex items-center gap-2 relative z-10">
                        <ShoppingCart size={20} /> Event Summary
                      </h3>
                   </div>
                   
                   <CardContent className="p-6 space-y-6">
                      {/* Line Items */}
                      <div className="space-y-4">
                        {/* Package */}
                        {selectedPackage ? (
                          <div className="flex justify-between items-start group">
                             <div>
                               <p className="font-bold text-brand-blue uppercase text-sm">{selectedPackage.name}</p>
                               {selectedPackage.isAllInclusive && <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">All Inclusive</span>}
                             </div>
                             <p className="font-mono font-bold text-brand-blue">${selectedPackage.price.toFixed(2)}</p>
                          </div>
                        ) : (
                          <div className="text-center py-4 border-2 border-dashed border-brand-blue/10 rounded-xl">
                            <p className="text-brand-blue/40 text-sm font-medium">No package selected</p>
                          </div>
                        )}

                        {/* Flavors Summary (Compact) */}
                        {selectedPackageFlavors.length > 0 && (
                          <div className="pl-3 border-l-2 border-brand-cyan/30 text-xs space-y-1 py-1">
                             <p className="text-brand-blue/50 font-bold uppercase text-[10px] tracking-wider mb-1">Selections</p>
                             {(() => {
                                const counts: Record<string,number> = {};
                                selectedPackageFlavors.forEach(id => counts[id] = (counts[id] || 0) + 1);
                                return Object.entries(counts).map(([id, n]) => (
                                  <div key={id} className="flex justify-between text-brand-blue/80">
                                    <span>{mockFlavors.find(f => f.id === id)?.name}</span>
                                    <span className="font-mono opacity-50">x{n}</span>
                                  </div>
                                ));
                             })()}
                          </div>
                        )}

                        {/* Addons */}
                        {Object.entries(selectedAddons).map(([id, qty]) => {
                           if (qty === 0) return null;
                           const addon = mockAddons.find(a => a.id === id);
                           if (!addon) return null;
                           return (
                             <div key={id} className="flex justify-between items-start text-sm">
                                <div className="text-brand-blue/80">
                                  <span>{addon.name}</span> <span className="text-brand-blue/40 font-mono text-xs">x{qty}</span>
                                </div>
                                <span className="font-mono font-bold text-brand-blue/80">${(addon.price * qty).toFixed(2)}</span>
                             </div>
                           );
                        })}

                        {/* Delivery */}
                        {displayDeliveryFee > 0 && (
                          <div className="flex justify-between items-start text-sm pt-2 border-t border-brand-blue/5">
                            <span className="text-brand-blue/60 uppercase text-xs font-bold tracking-wider">Delivery & Setup</span>
                            <span className="font-mono font-bold text-brand-blue/60">${displayDeliveryFee.toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      {/* Total */}
                      <div className="pt-6 border-t border-brand-blue/10">
                         <div className="flex justify-between items-end">
                            <span className="font-display font-bold uppercase text-brand-blue text-lg">Total Estimate</span>
                            <span className="font-display font-black text-4xl text-brand-blue">${totalPrice.toFixed(2)}</span>
                         </div>
                      </div>
                   </CardContent>
                   <CardFooter className="p-6 pt-0">
                      <Button 
                        className="w-full btn-coast-primary h-14 text-lg group"
                        onClick={handleProceedToBook}
                        disabled={!canProceed || isCalendarDataLoading}
                      >
                         {isCalendarDataLoading ? <Loader2 className="animate-spin" /> : "Proceed to Book"}
                         <Zap className="ml-2 group-hover:fill-current transition-all" size={20} />
                      </Button>
                   </CardFooter>
                </Card>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-2 text-brand-blue/40 text-xs font-bold uppercase tracking-widest">
                   <Info size={14} /> Secure Booking • Instant Confirmation
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* MODALS - Keeping logic same, just updating basic container styles if needed */}
      <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
        <DialogContent className="glass-panel-static p-0 overflow-hidden sm:max-w-md border-white/50">
          <DialogHeader className="p-6 bg-brand-blue text-white">
            <DialogTitle className="font-display font-bold text-2xl uppercase tracking-wide flex items-center gap-3">
              <CalendarDays className="text-brand-cyan" /> Select Date
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose a date and time slot for your event.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-[#FFFDF5]">
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-brand-blue/5 mb-6">
                <Calendar
                  mode="single"
                  selected={selectedEventDate}
                  onSelect={setSelectedEventDate}
                  disabled={[...blockedDates, { before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                  className="w-full"
                  classNames={{
                    head_cell: "text-brand-blue font-bold uppercase text-xs pt-4",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-cyan/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-brand-cyan/20 hover:font-bold hover:rounded-full transition-all text-brand-blue",
                    day_selected: "bg-brand-cyan text-brand-blue font-bold rounded-full shadow-lg shadow-cyan-500/30",
                    day_today: "bg-gray-100 text-brand-blue font-bold rounded-full",
                  }}
                />
             </div>
             <div className="grid grid-cols-3 gap-2">
                {EVENT_TIME_SLOTS.map(time => (
                   <button
                     key={time}
                     onClick={() => setSelectedEventTime(time)}
                     className={`
                       py-2 px-1 rounded-lg text-xs font-bold border transition-all
                       ${selectedEventTime === time 
                          ? 'bg-brand-blue text-white border-brand-blue shadow-lg scale-105' 
                          : 'bg-white text-brand-blue border-brand-blue/10 hover:border-brand-cyan hover:bg-brand-cyan/5'}
                     `}
                   >
                     {time}
                   </button>
                ))}
             </div>
          </div>
          <DialogFooter className="p-6 bg-white border-t border-brand-blue/5">
             <Button onClick={handleDateTimeSubmit} className="w-full btn-coast-primary" disabled={!selectedEventDate || !selectedEventTime}>
               Confirm & Continue
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