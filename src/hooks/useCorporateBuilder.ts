'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { fetchFlavors, fetchCorporatePackages, fetchAddons } from '@/lib/actions/data-actions';
import { getBlockedDates } from '@/app/admin/actions';
import type { Flavor, Addon, EventPackage } from '@/lib/types';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';

export interface EventConfig {
  selectedPackage: { name: string; price: string; flavors?: string[] } | null;
  addons: { name: string; quantity: number; price: string; flavors?: string[] }[];
  deliveryFee: number;
  totalPrice: number;
  eventDate?: Date;
  eventTime?: string;
}

const BASE_DELIVERY_FEE = 45.00;
const SPECIAL_DELIVERY_FEE = 20.00;

export function useCorporateBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Loaded Options Data
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections State
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedPackageFlavors, setSelectedPackageFlavors] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [addonFlavorSelections, setAddonFlavorSelections] = useState<Record<string, (string | undefined)[]>>({});
  const [isDeliveryRequested, setIsDeliveryRequested] = useState(false);

  // Price Calculation State
  const [totalPrice, setTotalPrice] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(BASE_DELIVERY_FEE);
  const [displayDeliveryFee, setDisplayDeliveryFee] = useState(0);

  // Date and Time State
  const [isDateTimeModalOpen, setIsDateTimeModalOpen] = useState(false);
  const [selectedEventDate, setSelectedEventDate] = useState<Date | undefined>(undefined);
  const [selectedEventTime, setSelectedEventTime] = useState<string | undefined>(undefined);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isCalendarDataLoading, setIsCalendarDataLoading] = useState(true);

  // Modal / Checkout State
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentEventConfig, setCurrentEventConfig] = useState<EventConfig | null>(null);
  const [customerDetailsForPayment, setCustomerDetailsForPayment] = useState<CustomerDetailsFormValues | null>(null);

  // Success / Booking State
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | undefined>(undefined);

  // Fetch Firestore Data on Mount
  useEffect(() => {
    Promise.all([
      fetchFlavors(),
      fetchCorporatePackages(),
      fetchAddons(),
    ])
      .then(([fData, pData, aData]) => {
        setFlavors(fData);
        setPackages(pData);
        setAddons(aData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Corporate Builder options:', err);
        toast({
          title: 'Error loading options',
          description: 'Failed to fetch options from Firestore. Please try refreshing.',
          variant: 'destructive',
        });
      });
  }, [toast]);

  // Handle default options from URL query parameters
  useEffect(() => {
    if (!loading && packages.length > 0) {
      const defaultPackageId = searchParams?.get('defaultPackageId');
      const addFlavorIds = searchParams?.get('addFlavorIds');

      if (defaultPackageId) {
        const pkg = packages.find((p) => p.id === defaultPackageId);
        if (pkg) {
          setSelectedPackage(pkg);
        }
      }

      if (addFlavorIds) {
        const ids = addFlavorIds.split(',').filter((id) => flavors.some((f) => f.id === id));
        setSelectedPackageFlavors(ids);
      }
    }
  }, [loading, packages, flavors, searchParams]);

  // Reset selections when selectedPackage changes
  useEffect(() => {
    setIsDeliveryRequested(false);
    setSelectedPackageFlavors([]);

    // Clear add-ons if 17L package is selected
    if (selectedPackage?.id === 'pkg_17l_self_pickup') {
      setSelectedAddons({});
      setAddonFlavorSelections({});
    }
  }, [selectedPackage]);

  // Fetch Blocked Dates
  useEffect(() => {
    const fetchBlockedDatesData = async () => {
      setIsCalendarDataLoading(true);
      try {
        const dates = await getBlockedDates();
        setBlockedDates(dates.map(d => d.date));
      } catch (error) {
        console.error("Failed to fetch blocked dates for corporate builder:", error);
        toast({
          title: "Could not load calendar",
          description: "Failed to fetch blocked dates. Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setIsCalendarDataLoading(false);
      }
    };

    fetchBlockedDatesData();
  }, [toast]);

  // Dynamic evaluation of max flavors based on chosen package description / inclusions
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

  // Flavor selections management
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
        const addon = addons.find(a => a.id === addonId);
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
  }, [selectedPackage, selectedAddons, deliveryFee, isDeliveryRequested, addons]);

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
      const addon = addons.find(a => a.id === addonId);
      if (addon?.requiresFlavor && qty > 0) {
        const addonFlavors = addonFlavorSelections[addonId] || [];
        // Check if we have enough flavor selections and all are defined
        if (addonFlavors.length < qty || addonFlavors.includes(undefined) || addonFlavors.some(f => f === "")) {
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
      .map(id => flavors.find(f => f.id === id)?.name)
      .filter((name): name is string => !!name);

    const addonsDetails = Object.entries(selectedAddons)
      .map(([addonId, quantity]) => {
        if (quantity === 0) return null;
        const addon = addons.find(a => a.id === addonId);
        if (!addon) return null;

        let addonFlavorsList: string[] | undefined = undefined;
        if (addon.requiresFlavor) {
          const flavorIds = addonFlavorSelections[addonId] || [];
          addonFlavorsList = flavorIds.map(fid => flavors.find(f => f.id === fid)?.name).filter((n): n is string => !!n);
        }

        return {
          name: addon.name,
          quantity,
          price: (addon.price * quantity).toFixed(2),
          ...(addonFlavorsList && addonFlavorsList.length > 0 && { flavors: addonFlavorsList }),
        };
      })
      .filter((detail): detail is NonNullable<typeof detail> => detail !== null);

    const initialConfig = {
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
    setIsBookingSuccess(false);
    setBookingReference(undefined);
  };

  const packageIsSelected = !!selectedPackage;
  const requiredFlavorCountForPackage = packageIsSelected ? getMaxFlavors() : 0;
  const canProceed = (packageIsSelected && (requiredFlavorCountForPackage > 0 ? selectedPackageFlavors.length === requiredFlavorCountForPackage : true)) || (!packageIsSelected && Object.keys(selectedAddons).some(k => selectedAddons[k] > 0));

  return {
    // Data lists
    flavors,
    packages,
    addons,
    loading,

    // Selections
    selectedPackage,
    setSelectedPackage,
    selectedPackageFlavors,
    selectedAddons,
    addonFlavorSelections,
    isDeliveryRequested,
    setIsDeliveryRequested,

    // Pricing
    totalPrice,
    displayDeliveryFee,

    // Date/Time
    isDateTimeModalOpen,
    setIsDateTimeModalOpen,
    selectedEventDate,
    setSelectedEventDate,
    selectedEventTime,
    setSelectedEventTime,
    blockedDates,
    isCalendarDataLoading,

    // Checkout
    isCustomerDetailsModalOpen,
    setIsCustomerDetailsModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    currentEventConfig,
    customerDetailsForPayment,
    isBookingSuccess,
    setIsBookingSuccess,
    bookingReference,
    setBookingReference,

    // Actions
    requiredFlavorCount: requiredFlavorCountForPackage,
    canProceed,
    handleAddPackageFlavor,
    handleRemovePackageFlavorByIndex,
    handleAddonToggle,
    handleAddonQuantityChange,
    handleUpdateAddonFlavor,
    handleProceedToBook,
    handleDateTimeSubmit,
    handleCustomerDetailsSubmit,
    resetBookingProcess,
  };
}
