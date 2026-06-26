'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { fetchFlavors, fetchRegularPackages, fetchAddons } from '@/lib/actions/data-actions';
import { getBlockedDates } from '@/app/admin/actions';
import type { Flavor, Addon, EventPackage } from '@/lib/types';
import type { CustomerDetailsFormValues } from '@/components/features/event-builder/CustomerDetailsForm';
import { format } from 'date-fns';

export interface EventConfig {
  selectedPackage: { name: string; price: string; flavors?: string[] } | null;
  addons: { name: string; quantity: number; price: string; flavors?: string[] }[];
  deliveryFee: number;
  totalPrice: number;
  eventDate?: Date;
  eventTime?: string;
}

const BASE_DELIVERY_FEE = 45.00;

export function useEventBuilder() {
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

  // Category selection for addons tab
  const [activeCategory, setActiveCategory] = useState<'Drinks' | 'Equipment' | 'Services' | 'Live Stations'>('Drinks');

  // Fetch Firestore Data on Mount
  useEffect(() => {
    Promise.all([
      fetchFlavors(),
      fetchRegularPackages(),
      fetchAddons(),
    ])
      .then(([fData, pData, aData]) => {
        setFlavors(fData);
        setPackages(pData);
        setAddons(aData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Event Builder options:', err);
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

  // Fetch Blocked Dates
  useEffect(() => {
    const fetchBlockedDatesData = async () => {
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

  // Reset selections when selectedPackage changes
  useEffect(() => {
    setSelectedPackageFlavors([]);
    setSelectedAddons({});
    setAddonFlavorSelections({});
    setIsDeliveryRequested(false);
  }, [selectedPackage]);

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

  // Addon selection quantity management
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

  // Price Calculation Logic
  useEffect(() => {
    let currentTotal = 0;
    let deliveryFeeApplied = false;

    if (selectedPackage) {
      currentTotal += selectedPackage.price;
      if (!selectedPackage.isAllInclusive && selectedPackage.setupFee > 0) {
        currentTotal += selectedPackage.setupFee;
        deliveryFeeApplied = true;
      }
    }

    Object.entries(selectedAddons).forEach(([id, qty]) => {
      const addon = addons.find(a => a.id === id);
      if (addon) {
        currentTotal += addon.price * qty;
      }
    });

    let displayFee = deliveryFeeApplied ? (selectedPackage?.setupFee || 0) : 0;
    if (selectedPackage?.id === 'pkg_17l_self_pickup' && isDeliveryRequested) {
      currentTotal += 20;
      displayFee = 20;
    }

    setTotalPrice(currentTotal);
    setDisplayDeliveryFee(displayFee);
  }, [selectedPackage, selectedAddons, isDeliveryRequested, addons]);

  const handleProceedToBook = () => {
    setIsDateTimeModalOpen(true);
  };

  const handleDateTimeSubmit = () => {
    if (!selectedEventDate || !selectedEventTime) {
      toast({
        title: "Selection Required",
        description: "Please select both a date and time to continue.",
        variant: "destructive",
      });
      return;
    }
    setIsDateTimeModalOpen(false);
    setIsCustomerDetailsModalOpen(true);
  };

  const handleCustomerDetailsSubmit = (values: CustomerDetailsFormValues) => {
    setCustomerDetailsForPayment(values);

    const config: EventConfig = {
      selectedPackage: selectedPackage ? {
        name: selectedPackage.name,
        price: selectedPackage.price.toString(),
        flavors: selectedPackageFlavors.map(id => flavors.find(f => f.id === id)?.name || id)
      } : null,
      addons: Object.entries(selectedAddons).map(([id, qty]) => {
        const addon = addons.find(a => a.id === id);
        return {
          name: addon?.name || id,
          quantity: qty,
          price: (addon?.price || 0).toString(),
          flavors: (addonFlavorSelections[id] || []).filter(Boolean) as string[]
        };
      }),
      deliveryFee: displayDeliveryFee,
      totalPrice: totalPrice,
      eventDate: selectedEventDate,
      eventTime: selectedEventTime
    };

    setCurrentEventConfig(config);
    setIsCustomerDetailsModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const resetBookingProcess = () => {
    setSelectedPackage(null);
    setSelectedPackageFlavors([]);
    setSelectedAddons({});
    setAddonFlavorSelections({});
    setSelectedEventDate(undefined);
    setSelectedEventTime(undefined);
    setCustomerDetailsForPayment(null);
    setIsBookingSuccess(false);
    setBookingReference(undefined);
  };

  const hasSelection = selectedPackage !== null || Object.keys(selectedAddons).length > 0;
  const canProceed = selectedPackage !== null && selectedPackageFlavors.length === requiredFlavorCount;

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
    setAddonFlavorSelections,
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

    // Tab state
    activeCategory,
    setActiveCategory,

    // Calculations / Actions
    requiredFlavorCount,
    hasSelection,
    canProceed,
    handleAddPackageFlavor,
    handleRemovePackageFlavorByIndex,
    handleAddonQuantityChange,
    handleProceedToBook,
    handleDateTimeSubmit,
    handleCustomerDetailsSubmit,
    resetBookingProcess,
  };
}
