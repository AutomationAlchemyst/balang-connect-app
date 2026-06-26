'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCorporateBuilder } from '@/hooks/useCorporateBuilder';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CustomerDetailsForm from '@/components/features/event-builder/CustomerDetailsForm';
import PaymentConfirmationDialog from '@/components/features/event-builder/PaymentConfirmationDialog';
import BookingSuccessView from '@/components/features/event-builder/BookingSuccessView';
import BookingDateTimePicker from '@/components/features/shared/BookingDateTimePicker';
import PackageSelectionStep from '@/components/features/wedding-corporate/steps/PackageSelectionStep';
import FlavorSelectionStep from '@/components/features/wedding-corporate/steps/FlavorSelectionStep';
import AddonSelectionStep from '@/components/features/wedding-corporate/steps/AddonSelectionStep';
import OrderSummarySidebar from '@/components/features/wedding-corporate/steps/OrderSummarySidebar';
import { cn } from '@/lib/utils';
import type { EventConfig } from '@/hooks/useCorporateBuilder';

export default function CorporateOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();

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
    isDeliveryRequested,
    setIsDeliveryRequested,
    totalPrice,
    displayDeliveryFee,
    isDateTimeModalOpen,
    setIsDateTimeModalOpen,
    selectedEventDate,
    setSelectedEventDate,
    selectedEventTime,
    setSelectedEventTime,
    blockedDates,
    isCustomerDetailsModalOpen,
    setIsCustomerDetailsModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    currentEventConfig,
    customerDetailsForPayment,
    isBookingSuccess,
    setIsBookingSuccess,
    bookingReference,
    requiredFlavorCount,
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
  } = useCorporateBuilder();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f7f2] dark:bg-[#102022] font-display text-[#0d1a1b] dark:text-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-stitch-structured-primary" strokeWidth={3} />
        <p className="mt-4 font-extrabold text-xs uppercase tracking-widest animate-pulse">Loading Builder...</p>
      </div>
    );
  }

  if (isBookingSuccess) {
    return (
      <div className="relative min-h-screen bg-[#f9f7f2] dark:bg-[#102022] pb-40">
        <BookingSuccessView
          slotId={bookingReference}
          onReset={resetBookingProcess}
          customerName={customerDetailsForPayment?.fullName || 'Valued Customer'}
          eventDate={selectedEventDate || currentEventConfig?.eventDate}
          eventTime={selectedEventTime || currentEventConfig?.eventTime}
        />
      </div>
    );
  }

  const hasSelection = selectedPackage !== null || Object.keys(selectedAddons).length > 0;

  return (
    <div className="relative min-h-screen bg-[#f9f7f2] dark:bg-[#102022] font-display text-[#0d1a1b] dark:text-white transition-colors duration-300 pb-32 lg:pb-12">
      {/* Header & Stepper */}
      <header className="sticky top-0 z-50 flex items-center bg-[#f9f7f2]/90 dark:bg-[#102022]/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-[#f2eee4] dark:border-white/10">
        <div
          className="text-[#0d1a1b] dark:text-white flex size-12 shrink-0 items-center justify-center cursor-pointer"
          onClick={() => router.push('/')}
        >
          <ArrowLeft size={24} />
        </div>
        <h2 className="text-[#0d1a1b] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          Design Your Experience
        </h2>
      </header>

      {/* Stepper Dots */}
      <div className="flex w-full flex-row items-center justify-center gap-3 py-6">
        <div
          className={cn(
            'h-1.5 w-8 rounded-full shadow-sm transition-all',
            selectedPackage
              ? 'bg-brand-stitch-structured-primary shadow-brand-stitch-structured-primary/30'
              : 'bg-brand-stitch-structured-primary'
          )}
        ></div>
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-all',
            selectedPackage ? 'bg-brand-stitch-structured-primary' : 'bg-brand-stitch-structured-primary/20 dark:bg-white/20'
          )}
        ></div>
        <div
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-all',
            Object.keys(selectedAddons).length > 0 ? 'bg-brand-stitch-structured-primary' : 'bg-brand-stitch-structured-primary/20 dark:bg-white/20'
          )}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          {/* LEFT COLUMN: BUILDER STEPS */}
          <div className="lg:col-span-8 xl:col-span-8 space-y-8">
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
                onAddonToggle={handleAddonToggle}
                onAddonQuantityChange={handleAddonQuantityChange}
                onUpdateAddonFlavor={handleUpdateAddonFlavor}
              />
            )}
          </div>

          {/* RIGHT COLUMN: DESKTOP SIDEBAR (SUMMARY) */}
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24">
            <OrderSummarySidebar
              selectedPackage={selectedPackage}
              flavors={flavors}
              selectedPackageFlavors={selectedPackageFlavors}
              selectedAddons={selectedAddons}
              addons={addons}
              displayDeliveryFee={displayDeliveryFee}
              totalPrice={totalPrice}
              canProceed={canProceed}
              onProceedToBook={handleProceedToBook}
            />
          </div>
        </div>
      </div>

      {/* STICKY FOOTER (MOBILE) */}
      <footer className="lg:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 dark:bg-[#102022]/95 backdrop-blur-lg border-t border-[#f2eee4] dark:border-white/10 p-6 flex flex-col gap-4 z-[100] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full duration-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-[#0d1a1b]/60 dark:text-white/40 font-semibold uppercase tracking-widest">
              Current Subtotal
            </p>
            <p className="text-2xl font-bold text-[#0d1a1b] dark:text-white">${totalPrice.toFixed(2)}</p>
          </div>
          {Object.keys(selectedAddons).length > 0 && (
            <div className="flex items-center text-xs font-bold text-brand-stitch-structured-primary bg-brand-stitch-structured-primary/10 px-3 py-1 rounded-full">
              <span>{Object.values(selectedAddons).reduce((a, b) => a + b, 0)} Item(s) Added</span>
            </div>
          )}
        </div>
        <button
          onClick={handleProceedToBook}
          disabled={!canProceed && !Object.keys(selectedAddons).some((k) => selectedAddons[k] > 0)}
          className="w-full bg-brand-stitch-structured-primary text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-brand-stitch-structured-primary/30 disabled:opacity-50 disabled:shadow-none hover:brightness-110"
        >
          Continue to Payment
          <ArrowRight size={20} />
        </button>
      </footer>

      {/* Reusable DateTime Picker Dialog */}
      <BookingDateTimePicker
        isOpen={isDateTimeModalOpen}
        onOpenChange={setIsDateTimeModalOpen}
        selectedDate={selectedEventDate}
        onSelectDate={setSelectedEventDate}
        selectedTime={selectedEventTime}
        onSelectTime={setSelectedEventTime}
        blockedDates={blockedDates}
        onSubmit={handleDateTimeSubmit}
        primaryColorClass="bg-brand-stitch-structured-primary text-white"
        primaryTextClass="text-brand-stitch-structured-primary"
        primaryBorderClass="border-brand-stitch-structured-primary/20"
        calendarBgClass="bg-[#f9f7f2] dark:bg-black/20"
      />

      {/* Customer Form Modal */}
      <Dialog open={isCustomerDetailsModalOpen} onOpenChange={setIsCustomerDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#fdfaf5] border-none shadow-2xl h-[90vh] overflow-y-auto">
          <CustomerDetailsForm
            onSubmit={handleCustomerDetailsSubmit}
            onCancel={() => setIsCustomerDetailsModalOpen(false)}
            onBack={() => {
              setIsCustomerDetailsModalOpen(false);
              setIsDateTimeModalOpen(true);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Modal */}
      {isPaymentModalOpen && currentEventConfig && customerDetailsForPayment && (
        <PaymentConfirmationDialog
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onBack={() => {
            setIsPaymentModalOpen(false);
            setIsCustomerDetailsModalOpen(true);
          }}
          eventConfig={currentEventConfig as EventConfig & { eventDate: Date }}
          customerDetails={customerDetailsForPayment}
          onConfirm={() => {
            setIsBookingSuccess(true);
            setIsPaymentModalOpen(false);
          }}
        />
      )}
    </div>
  );
}