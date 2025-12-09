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
import { PlusCircle, MinusCircle, ShoppingCart, Zap, PackageIcon, Construction, Truck, XIcon, Check, CalendarDays, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription as ShadDialogDescription } from '@/components/ui/dialog';
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

// Neo-Brutalism Constants
const CARD_STYLE = "bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] rounded-none transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000000]";
const BUTTON_BASE = "font-display font-bold uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]";
const INPUT_STYLE = "font-body border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] focus-visible:ring-0 focus-visible:border-black focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] focus:bg-[#3CD3E8] transition-all";
const CHECKBOX_STYLE = "border-2 border-black rounded-none w-5 h-5 data-[state=checked]:bg-black data-[state=checked]:text-white";

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
    <div className="space-y-12">
      <div className="text-center space-y-4">
         <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tighter bg-brand-cyan inline-block px-4 py-2 border-4 border-black shadow-[6px_6px_0px_0px_#000000] transform rotate-1">
            Build Your Wedding & Corporate Package
         </h1>
         <p className="text-xl text-black font-body font-medium max-w-2xl mx-auto pt-4 bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000000]">
            Create the perfect beverage experience for your special event. Choose from our tailored packages and add-ons.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className={CARD_STYLE}>
            <CardHeader className="bg-brand-yellow border-b-4 border-black py-4">
              <CardTitle className="font-display font-black text-2xl uppercase">1. Base Package</CardTitle>
              <CardDescription className="text-black font-medium">
                Select a corporate/wedding package or choose 'None' to build from scratch.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
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
                <SelectTrigger className={`${INPUT_STYLE} h-14 text-lg font-bold text-black`}>
                  <SelectValue placeholder="Select a package..." />
                </SelectTrigger>
                <SelectContent className="border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000]">
                  <SelectItem value="none-option" className="font-body font-medium text-black focus:bg-brand-yellow focus:text-black">None (Build from scratch)</SelectItem>
                  {mockCorporatePackages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id} className="font-body font-medium text-black focus:bg-brand-yellow focus:text-black">{pkg.name} (${pkg.price.toFixed(2)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPackage && (
                <div className="mt-4 p-6 bg-[#FFFDF5] border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                  <h4 className="font-display font-bold text-xl uppercase mb-2">{selectedPackage.name}</h4>
                  <p className="text-base text-gray-800 mb-2">{selectedPackage.description}</p>
                   {selectedPackage.isAllInclusive && (
                      <p className="text-sm font-bold bg-green-200 border border-green-800 text-green-900 p-2 inline-block mb-2">
                        Includes Setup (${selectedPackage.setupFee.toFixed(2)}) + Delivery + Unlimited Cups!
                      </p>
                   )}
                  <ul className="text-sm mt-2 space-y-1 font-mono">
                    {selectedPackage.includedItems.map(item => <li key={item} className="flex items-center"><Check size={14} className="mr-2"/> {item}</li>)}
                  </ul>
                  {selectedPackage.id === 'pkg_17l_self_pickup' && (
                    <div className="flex items-center space-x-2 mt-6 pt-4 border-t-2 border-black border-dashed">
                      <Checkbox
                        id="delivery-opt-out"
                        checked={isDeliveryOptOut}
                        onCheckedChange={() => setIsDeliveryOptOut(!isDeliveryOptOut)}
                        className={CHECKBOX_STYLE}
                      />
                      <Label htmlFor="delivery-opt-out" className="text-base font-bold cursor-pointer">
                        I want to opt-out from delivery (Self-pickup)
                      </Label>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPackage && requiredFlavorCountForPackage > 0 && (
            <Card className={CARD_STYLE}>
              <CardHeader className="bg-[#FF90E8] border-b-4 border-black py-4">
                <CardTitle className="font-display font-black text-2xl uppercase">2. Choose Flavors</CardTitle>
                <CardDescription className="text-black font-medium">
                   Pick {requiredFlavorCountForPackage} flavors. Repeated selections allowed.
                   <span className="block mt-2 font-bold bg-white border-2 border-black p-1 inline-block">
                     Selected: {selectedPackageFlavors.length} / {requiredFlavorCountForPackage}
                   </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {selectedPackageFlavors.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-display font-bold uppercase text-sm">Your Selections:</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedPackageFlavors.map((flavorId, index) => {
                        const flavor = mockFlavors.find(f => f.id === flavorId);
                        return (
                          <div key={`selected-pkgflavor-${flavorId}-${index}`} className="flex items-center bg-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_#000000] px-3 py-1 font-bold text-sm">
                            {flavor?.name || 'Unknown'}
                            <button
                              className="ml-2 hover:text-red-600 transition-colors"
                              onClick={() => handleRemovePackageFlavorByIndex(index)}
                              aria-label={`Remove ${flavor?.name}`}
                            >
                              <XIcon size={16} strokeWidth={3} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedPackageFlavors.length > 0 && <Separator className="bg-black h-0.5 my-4"/>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {mockFlavors.map(flavor => {
                    const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                    const canAddMorePackageFlavors = selectedPackageFlavors.length < requiredFlavorCountForPackage;
                    return (
                      <div key={`avail-pkgflavor-${flavor.id}`} className="p-3 border-2 border-black flex flex-col justify-between gap-3 bg-white hover:bg-gray-50 transition-colors">
                        <div>
                          <Label className="font-display font-bold uppercase text-sm block">{flavor.name}</Label>
                          {count > 0 && <span className="text-xs font-bold text-green-600 bg-green-100 px-1 border border-green-600 inline-block mt-1">x{count} Selected</span>}
                        </div>
                        <Button
                          size="sm"
                          className={`${BUTTON_BASE} w-full text-xs h-8 bg-white hover:bg-brand-cyan text-black`}
                          onClick={() => handleAddPackageFlavor(flavor.id)}
                          disabled={!canAddMorePackageFlavors || !selectedPackage}
                        >
                           <PlusCircle size={14} className="mr-1.5"/> Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className={CARD_STYLE}>
            <CardHeader className="bg-[#B8FF9F] border-b-4 border-black py-4">
              <CardTitle className="font-display font-black text-2xl uppercase">3. Add-ons</CardTitle>
              <CardDescription className="text-black font-medium">Enhance your event with extras.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {mockCorporateAddons.map(addon => (
                <div key={addon.id} className="p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000000] bg-white transition-transform hover:-translate-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor={`addon-${addon.id}`} className="flex-grow cursor-pointer">
                       <span className="font-display font-bold uppercase text-lg block">{addon.name}</span>
                       <p className="text-sm font-medium text-gray-600">{addon.description} (+${addon.price.toFixed(2)})</p>
                    </Label>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {selectedAddons[addon.id] > 0 && (
                        <>
                          <Button variant="outline" size="icon" onClick={() => handleAddonQuantityChange(addon.id, -1)} className={`${BUTTON_BASE} h-8 w-8 bg-white`} aria-label="Decrease">
                            <MinusCircle size={16} />
                          </Button>
                          <span className="w-8 text-center font-display font-bold text-xl">{selectedAddons[addon.id]}</span>
                           <Button variant="outline" size="icon" onClick={() => handleAddonQuantityChange(addon.id, 1)} className={`${BUTTON_BASE} h-8 w-8 bg-brand-yellow`} aria-label="Increase">
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
                  { (addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l') && selectedAddons[addon.id] > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-black border-dashed space-y-4">
                      <h4 className="text-sm font-bold uppercase bg-black text-white px-2 py-1 inline-block transform -rotate-1">Choose Balang Flavors:</h4>
                      {[...Array(selectedAddons[addon.id])].map((_, balangIndex) => {
                        const currentSelectedFlavorId = addonFlavorSelections[addon.id]?.[balangIndex];
                        const currentSelectedFlavor = currentSelectedFlavorId ? mockFlavors.find(f => f.id === currentSelectedFlavorId) : null;
                        return (
                          <div key={`${addon.id}-balang-${balangIndex}`} className="p-3 border-2 border-black bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <Label className="font-bold text-sm uppercase">
                                {addon.name.replace('Additional 1 x ', '')} #{balangIndex + 1}
                              </Label>
                              <div className="flex items-center gap-2">
                                {currentSelectedFlavor ? (
                                    <div className="flex items-center bg-brand-cyan border-2 border-black px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_0px_#000000]">
                                      {currentSelectedFlavor.name}
                                      <button
                                          className="ml-2 hover:text-white"
                                          onClick={() => handleRemoveAdditiveFlavor(addon.id, balangIndex)}
                                      >
                                          <XIcon size={12} strokeWidth={3} />
                                      </button>
                                    </div>
                                ) : (
                                  <span className="text-xs font-bold text-red-500 bg-red-100 px-2 border border-red-500">REQUIRED</span>
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
                                    <Button size="sm" className={`${BUTTON_BASE} h-7 text-xs bg-white hover:bg-gray-100 px-3`}>
                                      {currentSelectedFlavorId ? "Change" : "Select"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[280px] p-0 border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000]" side="bottom" align="end">
                                    <div className="p-2 bg-white">
                                      <h4 className="text-xs font-bold uppercase mb-2 px-1 bg-brand-yellow border-b-2 border-black">Available Flavors</h4>
                                      <div className="max-h-48 overflow-y-auto space-y-1">
                                        {mockFlavors.map(flavor => (
                                          <Button
                                            key={`${addon.id}-balang-${balangIndex}-popoverflavor-${flavor.id}`}
                                            variant="ghost"
                                            size="sm"
                                            className={`w-full justify-start text-left h-auto py-2 text-xs font-bold uppercase hover:bg-brand-cyan rounded-none ${currentSelectedFlavorId === flavor.id ? "bg-brand-cyan" : ""}`}
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
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className={`${CARD_STYLE} sticky top-24 bg-[#FFFDF5]`}>
            <CardHeader className="bg-black text-white py-4 border-b-4 border-black">
              <CardTitle className="font-display font-black text-2xl uppercase flex items-center gap-2">
                  <ShoppingCart className="text-brand-yellow" size={24} /> Event Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {selectedPackage && (
                <div className="text-sm">
                  <h4 className="font-bold uppercase border-b-2 border-black pb-1 mb-2 flex items-center"><PackageIcon size={16} className="mr-2" /> {selectedPackage.name}</h4>
                  <div className="pl-6 space-y-1">
                    <p className="font-mono text-lg font-bold">
                      ${selectedPackage.price.toFixed(2)}
                    </p>
                    {selectedPackage.isAllInclusive && (
                      <p className="text-xs text-gray-600 italic">
                        (Includes setup, delivery & unlimited cups)
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {displayDeliveryFee > 0 && (
                <div className="text-sm">
                  <h4 className="font-bold uppercase border-b-2 border-black pb-1 mb-2 flex items-center"><Truck size={16} className="mr-2" /> Delivery</h4>
                  <div className="pl-6">
                     <p className="font-mono text-lg font-bold">${displayDeliveryFee.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {selectedPackageFlavors.length > 0 && selectedPackage && requiredFlavorCountForPackage > 0 && (
                <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_#000000]">
                  <h4 className="font-bold uppercase text-xs mb-2">Package Flavors:</h4>
                  <ul className="text-xs space-y-1">
                    {(() => {
                      const packageFlavorCounts: Record<string, number> = {};
                      selectedPackageFlavors.forEach(id => {
                        packageFlavorCounts[id] = (packageFlavorCounts[id] || 0) + 1;
                      });
                      return Object.entries(packageFlavorCounts).map(([flavorId, count]) => {
                        const flavor = mockFlavors.find(f => f.id === flavorId);
                        return <li key={`pkgsummary-${flavorId}`} className="flex justify-between border-b border-dashed border-gray-300 pb-1 last:border-0"><span>{flavor?.name}</span> <span className="font-bold">x{count}</span></li>;
                      });
                    })()}
                  </ul>
                </div>
              )}

              {Object.keys(selectedAddons).filter(key => selectedAddons[key] > 0).length > 0 && (
                <div>
                  <h4 className="font-bold uppercase border-b-2 border-black pb-1 mb-2 flex items-center"><Construction size={16} className="mr-2" /> Add-ons</h4>
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
                        <div key={addonId} className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_#000000]">
                          <div className="flex justify-between text-sm font-bold uppercase mb-1">
                            <span>{addon.name} (x{quantity})</span>
                            <span className="font-mono">${(addon.price * quantity).toFixed(2)}</span>
                          </div>
                          {isBalangAddon && flavorsForThisAddon && flavorsForThisAddon.some(name => name) && (
                            <ul className="list-disc list-inside text-xs pl-2 text-gray-600 bg-gray-50 border-t border-gray-200 mt-1 pt-1">
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
              
              <div className="border-t-4 border-black pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-display font-black uppercase text-xl">Total:</span>
                  <span className="font-mono font-bold text-3xl bg-brand-yellow px-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button 
                size="lg" 
                className={`${BUTTON_BASE} w-full bg-brand-cyan hover:bg-[#2BC0D5] text-black h-16 text-xl`}
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
        <DialogContent className="sm:max-w-md md:max-w-lg flex flex-col max-h-[90vh] bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000000] p-0 gap-0">
          <DialogHeader className="p-6 border-b-4 border-black bg-brand-yellow">
            <DialogTitle className="font-display font-black text-2xl uppercase flex items-center">
              <CalendarDays className="mr-3 h-8 w-8" strokeWidth={2.5} /> Select Date &amp; Time
            </DialogTitle>
          </DialogHeader>

          <div className="flex-grow min-h-0 overflow-y-auto p-6 bg-[#FFFDF5]">
            <div className="flex flex-col gap-6">
              <div className="border-4 border-black shadow-[4px_4px_0px_0px_#000000] bg-white p-2">
                <Calendar
                  mode="single"
                  selected={selectedEventDate}
                  onSelect={setSelectedEventDate}
                  disabled={[...blockedDates, { before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                  className="w-full"
                  classNames={{
                    head_cell: "text-black font-bold uppercase",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-cyan first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-brand-yellow hover:font-bold hover:border-2 hover:border-black rounded-none transition-all",
                    day_selected: "bg-brand-cyan text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000000]",
                    day_today: "bg-gray-100 text-black font-bold",
                  }}
                />
              </div>
              <div className="space-y-3">
                <Label className="font-display font-bold uppercase text-lg block bg-black text-white px-2 py-1 transform -rotate-1 inline-block">Available Time Slots</Label>
                <div className="grid grid-cols-3 gap-3">
                  {EVENT_TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant="ghost"
                      onClick={() => setSelectedEventTime(time)}
                      className={`${BUTTON_BASE} h-10 text-xs bg-white hover:bg-brand-cyan text-black ${selectedEventTime === time ? "bg-brand-cyan translate-x-[2px] translate-y-[2px] shadow-none" : ""}`}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t-4 border-black p-6 bg-gray-50 flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setIsDateTimeModalOpen(false)} className={`${BUTTON_BASE} bg-white hover:bg-gray-200 w-full sm:w-auto`}>Back</Button>
            <Button 
              className={`${BUTTON_BASE} bg-brand-green text-white hover:bg-[#329A00] w-full sm:w-auto flex-1`}
              onClick={handleDateTimeSubmit}
              disabled={!selectedEventDate || !selectedEventTime}
            >
              Confirm Date &amp; Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh] overflow-hidden p-0 border-none bg-transparent shadow-none">
          <div className="h-full overflow-y-auto">
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
