// Final update check
'use client'; 

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SectionTitle from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { mockPackages, mockAddons, mockFlavors } from '@/lib/data';
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
import PaymentConfirmationDialog, { type PaymentProofData } from '@/components/features/event-builder/PaymentConfirmationDialog'; // Import PaymentProofData
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from '@/lib/utils';
import { createBookingFlow } from '@/ai/flows/createBookingFlow';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const DELIVERY_FEE = 45.00; // ADD THIS LINE BACK

const EVENT_TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];;

// --- This interface is changed ---
interface EventConfig {
  selectedPackage: { name: string; price: string; flavors?: string[] } | null;
  addons: { name: string; quantity: number; price: string; flavors?: string[] }[];
  deliveryFee: number;
  totalPrice: number;
  eventDate?: Date; // Changed to Date
  eventTime?: string;
}

export default function EventBuilderPage() {
  // ... (all your existing state and functions remain the same)
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedPackageFlavors, setSelectedPackageFlavors] = useState<string[]>([]); 
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [addonFlavorSelections, setAddonFlavorSelections] = useState<Record<string, (string | undefined)[]>>({});
  const [totalPrice, setTotalPrice] = useState(0);
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

  // --- No changes to functions below until handleDateTimeSubmit ---
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
      currentTotal += DELIVERY_FEE;
      deliveryFeeApplied = true;
    } else if (selectedPackage && !selectedPackage.isAllInclusive) { 
      currentTotal += DELIVERY_FEE;
      deliveryFeeApplied = true;
    }


    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(deliveryFeeApplied ? DELIVERY_FEE : 0); 
  }, [selectedPackage, selectedAddons]);

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

  // --- THIS FUNCTION IS CHANGED ---
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
        eventDate: selectedEventDate, // Pass the raw Date object
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

  const handleFinalBookingSubmit = async (paymentData: PaymentProofData): Promise<{ success: boolean; error?: string }> => {
    if (!currentEventConfig || !customerDetailsForPayment || !selectedEventDate || !selectedEventTime) {
      const errorMsg = "Critical booking information is missing. Please restart the process.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      return { success: false, error: errorMsg };
    }
    if (!paymentData.consentedToTerms) {
        return { success: false, error: "You must agree to the terms and conditions." };
    }
    
    const { proofFile } = paymentData;
    const maxSizeInBytes = 1 * 1024 * 1024;

    if (proofFile.size > maxSizeInBytes) {
      const errorMsg = "File is too large. Please upload a receipt smaller than 1MB.";
      toast({ title: "Upload Error", description: errorMsg, variant: "destructive" });
      return { success: false, error: errorMsg };
    }
    
    try {
      const sanitizedCustomerName = customerDetailsForPayment.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `payment_proofs/events/${sanitizedCustomerName}_${Date.now()}_${proofFile.name}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, proofFile);
      const downloadURL = await getDownloadURL(storageRef);

      const addonsForFlow = currentEventConfig.addons.map(a => ({
          name: a.name,
          quantity: a.quantity,
          flavors: a.flavors || []
      }));
      
      // This function needs the raw Date object, so selectedEventDate is correct here
      const bookingDetailsForFlow = {
        type: 'Event' as const,
        customerName: customerDetailsForPayment.fullName,
        email: customerDetailsForPayment.email,
        phone: customerDetailsForPayment.phone,
        eventDate: format(selectedEventDate, 'yyyy-MM-dd'),
        eventTime: currentEventConfig.eventTime!,
        totalAmount: currentEventConfig.totalPrice,
        pickupTime: customerDetailsForPayment.pickupTime,
        packageName: currentEventConfig.selectedPackage?.name,
        packageFlavors: currentEventConfig.selectedPackage?.flavors,
        addons: addonsForFlow,
        paymentProofUrl: downloadURL,
      };

      const result = await createBookingFlow(bookingDetailsForFlow);

      if (!result.sheet?.success || !result.calendar?.success) {
          const errors = [result.sheet.error, result.calendar.error].filter(Boolean).join(', ');
          console.error('Google Sync Failed. Details:', errors);
          return { success: false, error: `Your booking was received, but there was an issue syncing with our backend systems. Please contact us to confirm. Details: ${errors}` };
      }

      return { success: true };

    } catch (e: any) {
      console.error("Failed during final booking submission:", e);
      let errorMessage = e.message || "An unexpected error occurred while finalizing the booking.";
      if (e.code && e.code.startsWith('storage/')) {
        errorMessage = "There was an error uploading your payment proof. Please try again or contact us.";
      }
      return { success: false, error: errorMessage };
    }
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

  // --- No changes to the JSX until the CustomerDetailsModal ---
  return (
    <div className="space-y-8">
        {/* ... all your other JSX for packages, addons, etc. ... */}
        {/* The following is a simplified version of your return statement for brevity */}
        <div>... (Package selection, Flavor selection, Add-on selection) ...</div>

        <Dialog open={isDateTimeModalOpen} onOpenChange={setIsDateTimeModalOpen}>
            {/* ... Date Time Modal Content ... */}
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
                        {/* ======================= */}
                        {/* THIS IS THE FIX #1    */}
                        {/* ======================= */}
                        Event scheduled for: <strong>{format(currentEventConfig.eventDate, "PPP")} at {currentEventConfig.eventTime}</strong>
                    </div>
                    )}
                </DialogHeader>
                <div className="flex-grow min-h-0 overflow-y-auto">
                    <CustomerDetailsForm 
                    onSubmit={handleCustomerDetailsSubmit} 
                    onCancel={() => {
                        setIsCustomerDetailsModalOpen(false);
                    }}
                    eventTime={selectedEventTime}
                    />
                </div>
            </DialogContent>
        </Dialog>

        {currentEventConfig && customerDetailsForPayment && currentEventConfig.eventDate && (
            <PaymentConfirmationDialog
            isOpen={isPaymentModalOpen}
            onClose={resetBookingProcess}
            eventConfig={currentEventConfig}
            customerDetails={customerDetailsForPayment}
            />
        )}
    </div>
  );
}