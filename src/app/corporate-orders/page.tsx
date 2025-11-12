'use client'; 

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SectionTitle from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { mockCorporatePackages, mockCorporateAddons } from '@/lib/corporate-data';
import { mockFlavors } from '@/lib/data';
import type { EventPackage, Addon, Flavor } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, MinusCircle, ShoppingCart, Zap, PackageIcon, Construction, Truck, XIcon, Check, CalendarDays, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as ShadDialogDescription, DialogFooter } from '@/components/ui/dialog';
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
  const [currentEventConfig, setCurrentEventConfig] = useState<EventConfig | null>(null);

  const [customerDetailsForPayment, setCustomerDetailsForPayment] = useState<CustomerDetailsFormValues | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
        router.replace(`/corporate-orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
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
                router.replace(`/corporate-orders${queryString ? `?${queryString}` : ''}`, { scroll: false });
            }
        }  }, [searchParams, router, selectedPackage, getMaxFlavors, toast]);


  useEffect(() => {
    let currentTotal = 0;
    let deliveryFeeApplied = false;

    if (selectedPackage) {
      currentTotal += selectedPackage.price;
      setDeliveryFee(0); // Corporate packages include delivery
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
    }


    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? deliveryFee : 0); 
  }, [selectedPackage, selectedAddons, deliveryFee]);

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
    <div className="space-y-8">
      <SectionTitle>Build Your Custom Corporate Package</SectionTitle>
      <p className="text-lg text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
      Create the perfect beverage experience for your corporate event. Choose from our tailored packages and add-ons.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-primary">1. Base Package</CardTitle>
              <CardDescription>
                Select a pre-defined package or choose 'None' to build from scratch. 
                Note: A delivery fee applies if you only select add-ons without an all-inclusive base package.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a package..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none-option">None (Build from scratch)</SelectItem>
                  {mockCorporatePackages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id}>{pkg.name} (${pkg.price.toFixed(2)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPackage && (
                <div className="mt-4 p-4 bg-secondary/30 rounded-md">
                  <h4 className="font-semibold">{selectedPackage.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
                   {selectedPackage.isAllInclusive && (
                      <p className="text-xs mt-1 text-muted-foreground">Note: Price is all-inclusive of setup (worth ${selectedPackage.setupFee.toFixed(2)}), 
                      delivery (worth ${deliveryFee.toFixed(2)}), and unlimited cups.</p>
                   )}
                  <ul className="text-xs mt-2">
                    {selectedPackage.includedItems.map(item => <li key={item}>- {item}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPackage && requiredFlavorCountForPackage > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-primary">2. Choose Your Package Flavors</CardTitle>
                <CardDescription>
                  Select up to {requiredFlavorCountForPackage} flavors for your chosen package. You can pick the same flavor multiple times if desired.
                  You have selected {selectedPackageFlavors.length} / {requiredFlavorCountForPackage} flavors.
                  {requiredFlavorCountForPackage > 0 && selectedPackageFlavors.length < requiredFlavorCountForPackage && (
                    <span className="block mt-1 text-destructive text-xs font-semibold">
                      Please select all {requiredFlavorCountForPackage} flavors for this package to proceed. You have currently selected {selectedPackageFlavors.length}.
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPackageFlavors.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Your Selections:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackageFlavors.map((flavorId, index) => {
                        const flavor = mockFlavors.find(f => f.id === flavorId);
                        return (
                          <Badge key={`selected-pkgflavor-${flavorId}-${index}`} variant="secondary" className="text-sm pl-3 pr-1 py-1">
                            {flavor?.name || 'Unknown Flavor'}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ml-1 h-4 w-4 hover:bg-destructive/20"
                              onClick={() => handleRemovePackageFlavorByIndex(index)}
                              aria-label={`Remove ${flavor?.name || 'flavor'} at position ${index + 1}`}
                            >
                              <XIcon size={12} />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
                {selectedPackageFlavors.length > 0 && <Separator className="my-3"/>}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {mockFlavors.map(flavor => {
                    const count = selectedPackageFlavors.filter(id => id === flavor.id).length;
                    const canAddMorePackageFlavors = selectedPackageFlavors.length < requiredFlavorCountForPackage;
                    return (
                      <div key={`avail-pkgflavor-${flavor.id}`} className="p-3 border rounded-md flex flex-col justify-between gap-2 hover:bg-secondary/20 transition-colors">
                        <div>
                          <Label className="font-medium text-xs">{flavor.name}</Label>
                          {count > 0 && <span className="ml-2 text-xs text-muted-foreground">(Selected x{count})</span>}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => handleAddPackageFlavor(flavor.id)}
                          disabled={!canAddMorePackageFlavors || !selectedPackage}
                          aria-label={`Add ${flavor.name} to package`}
                        >
                           <PlusCircle size={14} className="mr-1.5"/> Add Flavor
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-primary">3. Select Add-ons</CardTitle>
              <CardDescription>Enhance your event with these optional extras.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCorporateAddons.map(addon => (
                <div key={addon.id} className="p-3 border rounded-md hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`addon-${addon.id}`} className="flex-grow cursor-pointer pr-4">
                       <span className="font-medium block">{addon.name}</span>
                       <p className="text-xs text-muted-foreground">{addon.description} (+${addon.price.toFixed(2)})</p>
                    </Label>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {selectedAddons[addon.id] > 0 && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleAddonQuantityChange(addon.id, -1)} className="h-7 w-7" aria-label={`Decrease quantity of ${addon.name}`}>
                            <MinusCircle size={16} />
                          </Button>
                          <span className="w-6 text-center tabular-nums">{selectedAddons[addon.id]}</span>
                           <Button variant="ghost" size="icon" onClick={() => handleAddonQuantityChange(addon.id, 1)} className="h-7 w-7" aria-label={`Increase quantity of ${addon.name}`}>
                            <PlusCircle size={16} />
                          </Button>
                        </>
                      )}
                       <Checkbox 
                         id={`addon-${addon.id}`} 
                         checked={!!selectedAddons[addon.id] && selectedAddons[addon.id] > 0}
                         onCheckedChange={(checked) => handleAddonToggle(addon.id, !!checked)}
                         aria-label={`Select ${addon.name}`}
                       />
                    </div>
                  </div>
                  { (addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l') && selectedAddons[addon.id] > 0 && (
                    <div className="pl-0 mt-3 pt-3 border-t border-muted space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Choose flavors for your {addon.name.toLowerCase()}:</h4>
                      {[...Array(selectedAddons[addon.id])].map((_, balangIndex) => {
                        const currentSelectedFlavorId = addonFlavorSelections[addon.id]?.[balangIndex];
                        const currentSelectedFlavor = currentSelectedFlavorId ? mockFlavors.find(f => f.id === currentSelectedFlavorId) : null;
                        return (
                          <div key={`${addon.id}-balang-${balangIndex}`} className="mt-2 p-3 border rounded-md space-y-2 bg-background/50">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm">
                                Flavor for {addon.name.replace('Additional 1 x ', '')} #{balangIndex + 1}:
                                </Label>
                                {currentSelectedFlavor ? (
                                    <Badge variant="secondary" className="text-sm pl-2 pr-1 py-0.5">
                                      {currentSelectedFlavor.name}
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="ml-1 h-4 w-4 hover:bg-destructive/20 text-muted-foreground hover:text-destructive-foreground"
                                          onClick={() => handleRemoveAdditiveFlavor(addon.id, balangIndex)}
                                          aria-label={`Remove ${currentSelectedFlavor.name} from ${addon.name.replace('Additional 1 x ', '')} #${balangIndex + 1}`}
                                      >
                                          <XIcon size={12} />
                                      </Button>
                                    </Badge>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">No flavor selected</p>
                                )}
                              </div>
                              
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
                                  <Button variant="outline" size="sm" className="w-full text-xs">
                                    {currentSelectedFlavorId ? "Change Flavor" : "Select Flavor"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] p-0" side="bottom" align="start">
                                  <div className="p-2">
                                    <h4 className="text-xs font-medium mb-2 text-muted-foreground px-1">Available Flavors</h4>
                                    <div className="max-h-48 overflow-y-auto space-y-1">
                                      {mockFlavors.map(flavor => (
                                        <Button
                                          key={`${addon.id}-balang-${balangIndex}-popoverflavor-${flavor.id}`}
                                          variant={currentSelectedFlavorId === flavor.id ? "default" : "ghost"}
                                          size="sm"
                                          className="w-full justify-start text-left h-auto py-1.5 text-xs"
                                          onClick={() => {
                                            handleAdditiveFlavorSelect(addon.id, balangIndex, flavor.id);
                                            setActiveAddonFlavorPopover(null); 
                                          }}
                                        >
                                          {currentSelectedFlavorId === flavor.id && <Check className="mr-2 h-3 w-3" />}
                                          {flavor.name}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
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
          <Card className="sticky top-24 shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline text-accent flex items-center"><ShoppingCart className="mr-2" />Your Event Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedPackage && (
                <div className="text-sm">
                  <h4 className="font-semibold flex items-center"><PackageIcon size={16} className="mr-2 text-primary" />{selectedPackage.name}</h4>
                  <div className="pl-6">
                    <p>
                      Package Price: ${selectedPackage.price.toFixed(2)}
                    </p>
                    {selectedPackage.isAllInclusive && (
                      <p className="text-xs text-muted-foreground ml-0">
                        (Includes setup worth ${selectedPackage.setupFee.toFixed(2)}, 
                        delivery worth ${deliveryFee.toFixed(2)}, and unlimited cups)
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {displayDeliveryFee > 0 && (
                <div className="text-sm">
                  <Separator className="my-2"/>
                  <h4 className="font-semibold flex items-center"><Truck size={16} className="mr-2 text-primary" />Delivery &amp; Pickup</h4>
                  <div className="pl-6">
                     <p>${displayDeliveryFee.toFixed(2)} <span className="text-xs text-muted-foreground">(Applied for add-ons without an inclusive base package or non all-inclusive packages)</span></p>
                  </div>
                </div>
              )}

              {selectedPackageFlavors.length > 0 && selectedPackage && requiredFlavorCountForPackage > 0 && (
                <div>
                  <Separator className="my-2"/>
                  <h4 className="font-semibold">Selected Package Flavors ({selectedPackageFlavors.length}/{requiredFlavorCountForPackage}):</h4>
                  <ul className="list-disc list-inside text-sm pl-6">
                    {(() => {
                      const packageFlavorCounts: Record<string, number> = {};
                      selectedPackageFlavors.forEach(id => {
                        packageFlavorCounts[id] = (packageFlavorCounts[id] || 0) + 1;
                      });
                      return Object.entries(packageFlavorCounts).map(([flavorId, count]) => {
                        const flavor = mockFlavors.find(f => f.id === flavorId);
                        return <li key={`pkgsummary-${flavorId}`}>{flavor?.name || 'Unknown Flavor'} {count > 1 ? `(x${count})` : ''}</li>;
                      });
                    })()}
                  </ul>
                </div>
              )}

              {Object.keys(selectedAddons).filter(key => selectedAddons[key] > 0).length > 0 && (
                <div>
                  <Separator className="my-2"/>
                  <h4 className="font-semibold flex items-center"><Construction size={16} className="mr-2 text-primary" />Add-ons:</h4>
                  <div className="pl-6 space-y-1 mt-1">
                    {Object.entries(selectedAddons).map(([addonId, quantity]) => {
                      if (quantity === 0) return null;
                      const addon = mockCorporateAddons.find(a => a.id === addonId);
                      if (!addon) return null;
                      
                      const isBalangAddon = addon.id === 'addon_balang_23l' || addon.id === 'addon_balang_40l';
                      const flavorsForThisAddon = addonFlavorSelections[addonId]?.map(
                        fId => fId ? mockFlavors.find(f => f.id === fId)?.name : undefined
                      );

                      return (
                        <div key={addonId}>
                          <div className="flex justify-between text-sm">
                            <span>{addon.name} (x{quantity})</span>
                            <span>${(addon.price * quantity).toFixed(2)}</span>
                          </div>
                          {isBalangAddon && flavorsForThisAddon && flavorsForThisAddon.some(name => name) && (
                            <ul className="list-disc list-inside text-xs pl-4 text-muted-foreground">
                              {flavorsForThisAddon.map((flavorName, index) => (
                                flavorName ? <li key={`${addonId}-summaryflavor-${index}`}>{flavorName} (Balang #{index+1})</li> : null
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center text-2xl font-bold">
                <span className="font-headline text-primary">Total:</span>
                <span className="text-accent">${totalPrice.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleProceedToBook}
                disabled={!canProceed || isCalendarDataLoading}
              >
                {isCalendarDataLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Dates...</>
                ) : (
                  <>Proceed to Book <Zap className="ml-2" /></>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="font-headline text-primary flex items-center">
              <CalendarDays className="mr-2 h-6 w-6" /> Select Event Date &amp; Time
            </DialogTitle>
            <ShadDialogDescription>
              Choose your desired date and time for the event. Blocked dates are disabled.
            </ShadDialogDescription>
          </DialogHeader>

          {/* This new div makes the content area scrollable */}
          <div className="flex-grow min-h-0 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)] gap-4 items-start">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedEventDate}
                  onSelect={setSelectedEventDate}
                  disabled={[...blockedDates, { before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                  className="rounded-md border shadow-sm"
                />
              </div>
              <div className="space-y-3">
                <Label className="font-medium text-sm">Available Time Slots:</Label>
                <div className="grid grid-cols-2 gap-2 max-h-[260px] md:max-h-none overflow-y-auto pr-1">
                  {EVENT_TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedEventTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedEventTime(time)}
                      className={cn("w-full justify-center text-xs", selectedEventTime === time && "bg-primary text-primary-foreground")}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t p-6 pt-4 shrink-0">
            <Button variant="outline" onClick={() => setIsDateTimeModalOpen(false)}>Back</Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleDateTimeSubmit}
              disabled={!selectedEventDate || !selectedEventTime}
            >
              Confirm Date &amp; Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="sm:max-w-[525px] flex flex-col max-h-[85vh] overflow-hidden">
          <DialogHeader className="shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="font-headline text-primary">Customer Details</DialogTitle>
            <ShadDialogDescription>
              Please fill in your details. All fields marked with * are required.
            </ShadDialogDescription>
            {currentEventConfig?.eventDate && currentEventConfig?.eventTime && (
              <div className="text-sm text-muted-foreground mt-2">
                <strong>Event scheduled for: {format(currentEventConfig.eventDate, "PPP")} at {currentEventConfig.eventTime}</strong>
              </div>
            )}
          </DialogHeader>
          <div className="flex-grow min-h-0 overflow-y-auto">
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