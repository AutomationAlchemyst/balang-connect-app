'use client';

import { useEventBuilder } from '@/hooks/useEventBuilder';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import BookingSuccessView from '@/components/features/event-builder/BookingSuccessView';
import BookingDateTimePicker from '@/components/features/shared/BookingDateTimePicker';
import PackageSelectionStep from '@/components/features/event-builder/steps/PackageSelectionStep';
import FlavorSelectionStep from '@/components/features/event-builder/steps/FlavorSelectionStep';
import AddonSelectionStep from '@/components/features/event-builder/steps/AddonSelectionStep';
import { cn } from '@/lib/utils';

export default function EventBuilderPage() {
  const {
    flavors,
    packages,
    addons,
    loading,
    selectedPackage,
    setSelectedPackage,
    selectedPackageFlavors,
    selectedAddons,
    addonFlavorSelections,
    setAddonFlavorSelections,
    isDeliveryRequested,
    setIsDeliveryRequested,
    totalPrice,
    isDateTimeModalOpen,
    setIsDateTimeModalOpen,
    selectedEventDate,
    setSelectedEventDate,
    selectedEventTime,
    setSelectedEventTime,
    blockedDates,
    isCalendarDataLoading,
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
    activeCategory,
    setActiveCategory,
    requiredFlavorCount,
    hasSelection,
    canProceed,
    handleAddPackageFlavor,
    handleRemovePackageFlavorByIndex,
    handleAddonQuantityChange,
    handleProceedToBook,
    handleDateTimeSubmit,
    handleCustomerDetailsSubmit,
    resetBookingProcess
  } = useEventBuilder();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf5] dark:bg-[#102221] font-display text-[#0d1c1b] dark:text-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={3} />
        <p className="mt-4 font-extrabold text-xs uppercase tracking-widest animate-pulse">Loading Event Builder...</p>
      </div>
    );
  }

  if (isBookingSuccess) {
    return (
      <div className="relative min-h-screen bg-[#fdfaf5] selection:bg-[#0df2df]/20 selection:text-[#0d1c1b] pt-24 pb-40">
        <BookingSuccessView
          slotId={bookingReference}
          onReset={resetBookingProcess}
          customerName={customerDetailsForPayment?.fullName || "Valued Customer"}
          eventDate={selectedEventDate || currentEventConfig?.eventDate}
          eventTime={selectedEventTime || currentEventConfig?.eventTime}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#fdfaf5] dark:bg-[#102221] text-[#0d1c1b] dark:text-white pb-64 font-display antialiased transition-colors duration-300">
      {/* Top Navigation Bar - Premium Stitch Style */}
      <header className="sticky top-0 z-50 bg-[#fdfaf5]/80 dark:bg-[#102221]/80 backdrop-blur-md border-b border-[#0d1c1b]/5 dark:border-white/5">
        <div className="container max-w-7xl mx-auto">
          <div className="flex items-center p-4 pb-2 justify-between">
            <div className="size-12 flex items-center justify-start">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display uppercase tracking-widest">
              Event Builder
            </h2>
            <div className="w-12 flex items-center justify-end">
              <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-transparent text-[#0d1c1b] dark:text-white hover:bg-black/5 dark:hover:bg-white/10">
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Page Indicators / Stepper */}
          <div className="flex w-full flex-row items-center justify-center gap-3 py-4">
            <div className={cn("h-1.5 w-8 rounded-full transition-all duration-500", !hasSelection ? "bg-primary shadow-sm shadow-primary/40" : "bg-primary/30")}></div>
            <div className={cn("h-1.5 w-8 rounded-full transition-all duration-500", (hasSelection && !canProceed) ? "bg-primary shadow-sm shadow-primary/40" : "bg-primary/30")}></div>
            <div className={cn("h-1.5 w-2 rounded-full", canProceed ? "bg-primary" : "bg-deep-ocean/10 dark:bg-white/10")}></div>
            <div className="h-1.5 w-2 rounded-full bg-deep-ocean/10 dark:bg-white/10"></div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto py-8">
        {/* Step 1: Package Selection */}
        <PackageSelectionStep
          packages={packages}
          selectedPackage={selectedPackage}
          onSelectPackage={setSelectedPackage}
          isDeliveryRequested={isDeliveryRequested}
          onDeliveryRequestedChange={setIsDeliveryRequested}
        />

        {/* Step 2: Flavor Selection */}
        {selectedPackage && requiredFlavorCount > 0 && (
          <FlavorSelectionStep
            flavors={flavors}
            selectedPackageFlavors={selectedPackageFlavors}
            requiredFlavorCount={requiredFlavorCount}
            onAddFlavor={handleAddPackageFlavor}
            onRemoveFlavorIndex={handleRemovePackageFlavorByIndex}
          />
        )}

        {/* Step 3: Add-on Selection */}
        {selectedPackage?.id !== 'pkg_17l_self_pickup' && (
          <AddonSelectionStep
            addons={addons}
            flavors={flavors}
            selectedAddons={selectedAddons}
            addonFlavorSelections={addonFlavorSelections}
            setAddonFlavorSelections={setAddonFlavorSelections}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onAddonQuantityChange={handleAddonQuantityChange}
          />
        )}
      </main>

      {/* Fixed Bottom Checkout Action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#fdfaf5]/80 dark:bg-[#102221]/80 backdrop-blur-xl border-t border-[#0d1c1b]/5 dark:border-white/5 safe-bottom">
        <div className="container max-w-7xl mx-auto p-4 md:px-8 pb-8 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#0d1c1b]/40 dark:text-white/40">Total Estimation</span>
              <p className="text-3xl font-black text-primary tracking-tighter italic">${totalPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Sync</span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleProceedToBook}
            disabled={!canProceed}
            className={cn(
              "w-full h-16 rounded-[1.5rem] font-black uppercase text-xl shadow-2xl transition-all active:scale-95 tracking-widest",
              canProceed
                ? "bg-primary text-[#0d1c1b] hover:bg-primary/90 shadow-primary/30"
                : "bg-[#0d1c1b]/10 text-[#0d1c1b]/20 dark:text-white/10 cursor-not-allowed border border-[#0d1c1b]/5"
            )}
          >
            {isCalendarDataLoading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <div className="flex items-center gap-3">
                Continue to Book <ArrowRight className="h-6 w-6" />
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Reusable Date & Time Modal */}
      <BookingDateTimePicker
        isOpen={isDateTimeModalOpen}
        onOpenChange={setIsDateTimeModalOpen}
        selectedDate={selectedEventDate}
        onSelectDate={setSelectedEventDate}
        selectedTime={selectedEventTime}
        onSelectTime={setSelectedEventTime}
        blockedDates={blockedDates}
        onSubmit={handleDateTimeSubmit}
        primaryColorClass="bg-primary text-[#0d1c1b] hover:bg-primary/90 shadow-primary/20"
        primaryTextClass="text-primary"
        primaryBorderClass="border-primary/20"
        calendarBgClass="bg-[#fdfaf5] dark:bg-black/20"
      />

      {/* Customer Details Modal */}
      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-xl p-0 border-0 bg-transparent shadow-none">
          <DialogTitle className="sr-only">Final Details</DialogTitle>
          <DialogDescription className="sr-only">Provide your contact information and event details to proceed.</DialogDescription>
          <div className="bg-white dark:bg-[#1a2e2d] m-1 rounded-[2.5rem] shadow-2xl w-full p-8 border border-white/20">
            <CustomerDetailsForm
              onSubmit={handleCustomerDetailsSubmit}
              onCancel={() => setIsCustomerDetailsModalOpen(false)}
              onBack={() => {
                setIsCustomerDetailsModalOpen(false);
                setIsDateTimeModalOpen(true);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation */}
      {customerDetailsForPayment && currentEventConfig && currentEventConfig.eventDate && (
        <PaymentConfirmationDialog
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          eventConfig={currentEventConfig as any}
          customerDetails={customerDetailsForPayment}
          onConfirm={() => {
            setBookingReference(`BK-${Math.floor(Math.random() * 10000)}`);
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