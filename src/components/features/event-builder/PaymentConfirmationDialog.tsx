'use client';

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, UploadCloud, CreditCard, Loader2, AlertCircle, CheckCircle, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createBookingFlow } from '@/ai/flows/createBookingFlow';
import { format } from 'date-fns';
import type { CustomerDetailsFormValues } from './CustomerDetailsForm';
import type { EventConfig } from '@/app/event-builder/page';

interface PaymentConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventConfig: EventConfig & { eventDate: Date }; // Ensure eventDate is a Date
  customerDetails: CustomerDetailsFormValues;
}

const PAYNOW_UEN = "UEN53482512EA00#XNAP";
const DBS_ACCOUNT = "8852-1535-4360";

type UploadStatus = 'idle' | 'reading' | 'success' | 'error';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function PaymentConfirmationDialog({
  isOpen,
  onClose,
  eventConfig,
  customerDetails,
}: PaymentConfirmationDialogProps) {
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [consentedToTerms, setConsentedToTerms] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setPaymentProofFile(null);
    setConsentedToTerms(false);
    setUploadStatus('idle');
    setUploadError(null);
    setFileName(null);
    setSubmissionStatus('idle');
    setSubmissionError(null);
  };
  
  const handleDialogStateChange = (open: boolean) => {
    if (submissionStatus === 'submitting') return;
    if (!open) {
      resetState();
      onClose();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPaymentProofFile(null);
    setUploadError(null);
    setFileName(file.name);
    setUploadStatus('reading');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please use JPG, PNG, GIF or PDF.');
      setUploadStatus('error');
      return;
    }
    if (file.size > 1 * 1024 * 1024) { 
      setUploadError('File is too large. Max size is 1MB.');
      setUploadStatus('error');
      return;
    }
    
    setPaymentProofFile(file);
    setUploadStatus('success');
  };

  const handleSubmit = async () => {
    if (!consentedToTerms) {
      toast({ title: 'Consent Required', description: 'Please agree to the terms and conditions.', variant: 'destructive' });
      return;
    }
    if (!paymentProofFile || uploadStatus !== 'success') {
       toast({ title: 'Payment Proof Required', description: 'Please upload a valid screenshot or PDF of your payment proof.', variant: 'destructive' });
      return;
    }

    setSubmissionStatus('submitting');
    setSubmissionError(null);

    try {
      const sanitizedCustomerName = customerDetails.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `payment_proofs/events/${sanitizedCustomerName}_${Date.now()}_${paymentProofFile.name}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, paymentProofFile);
      const downloadURL = await getDownloadURL(storageRef);

      const addonsForFlow = eventConfig.addons.map(a => ({
          name: a.name,
          quantity: a.quantity,
          flavors: a.flavors || []
      }));
      
      const bookingDetailsForFlow = {
        type: 'Event' as const,
        customerName: customerDetails.fullName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        eventDate: format(eventConfig.eventDate, 'yyyy-MM-dd'),
        eventTime: eventConfig.eventTime,
        totalAmount: eventConfig.totalPrice,
        pickupTime: customerDetails.pickupTime,
        packageName: eventConfig.selectedPackage?.name,
        packageFlavors: eventConfig.selectedPackage?.flavors,
        addons: addonsForFlow,
        paymentProofUrl: downloadURL,
      };

      const result = await createBookingFlow(bookingDetailsForFlow);
      
      if (!result.sheet?.success || !result.calendar?.success) {
          const errors = [result.sheet.error, result.calendar.error].filter(Boolean).join(', ');
          console.error('Google Sync Failed. Details:', errors);
          setSubmissionError(`Your booking was received, but there was an issue syncing with our backend systems. Please contact us to confirm. Details: ${errors}`);
          setSubmissionStatus('error');
      } else {
        setSubmissionStatus('success');
      }
    } catch(e: any) {
      console.error("Failed during final booking submission:", e);
      let errorMessage = e.message || "An unexpected error occurred while finalizing the booking.";
      if (e.code && e.code.startsWith('storage/')) {
        errorMessage = "There was an error uploading your payment proof. Please try again or contact us.";
      }
      setSubmissionError(errorMessage);
      setSubmissionStatus('error');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} Copied!`, description: `${text} has been copied to your clipboard.` });
    }).catch(err => {
      toast({ title: 'Copy Failed', description: `Could not copy ${label}. Please copy manually.`, variant: 'destructive' });
      console.error('Failed to copy: ', err);
    });
  };
  
  const isActionDisabled = uploadStatus === 'reading' || submissionStatus === 'submitting';

  const renderContent = () => {
    switch (submissionStatus) {
      case 'submitting':
        // ... submitting JSX ...
        return <div/>;
      case 'success':
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6583215730';
        const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello BalangConnect, I have just made a booking.';
        const message = encodeURIComponent(`${baseGreeting}\n\nName: ${customerDetails.fullName}\nEvent: ${format(eventConfig.eventDate, "PPP")} at ${eventConfig.eventTime}\nEmail: ${customerDetails.email}`);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        return (
          <div className="p-6 text-center">
            <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-headline text-primary">Booking Request Sent!</h2>
            <p className="mt-2 text-muted-foreground">Thank you, {customerDetails.fullName}! Your booking is confirmed.</p>
            <div className="mt-6 p-4 border rounded-lg bg-secondary/30 text-left text-sm">
                <h3 className="font-semibold mb-2">Your Booking Summary:</h3>
                <p><strong>Event:</strong> {format(eventConfig.eventDate, "PPP")} at {eventConfig.eventTime}</p>
                <p><strong>Amount:</strong> ${eventConfig.totalPrice.toFixed(2)}</p>
                <p><strong>Contact:</strong> {customerDetails.email}</p>
            </div>
            <Button asChild size="lg" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white">
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">Contact us on WhatsApp</Link>
            </Button>
            <DialogFooter className="mt-4 !justify-center">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)}>Make Another Booking</Button>
            </DialogFooter>
          </div>
        );
      case 'error':
        // ... error JSX ...
        return <div/>;
      default: // 'idle'
        return (
          <>
            <div className="flex-grow min-h-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="p-4 border rounded-lg bg-secondary/30">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Order Summary</h3>
                  {eventConfig.eventDate && eventConfig.eventTime && (
                    <p className="text-sm"><strong>Event:</strong> {format(eventConfig.eventDate, "PPP")} at {eventConfig.eventTime}</p>
                  )}
                  <p className="text-sm"><strong>Total Amount Due:</strong> <span className="font-bold text-accent text-xl">${eventConfig.totalPrice.toFixed(2)}</span></p>
                </div>
                {/* ... The rest of your idle state JSX ... */}
              </div>
            </div>
            <DialogFooter className="p-6 pt-4 border-t shrink-0">
              <Button variant="outline" onClick={() => handleDialogStateChange(false)} disabled={isActionDisabled}>Cancel</Button>
              <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90" disabled={isActionDisabled || uploadStatus !== 'success' || !consentedToTerms}>Confirm Booking & Submit Proof</Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogStateChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="font-headline text-primary flex items-center">
            <CreditCard className="mr-2 h-6 w-6" /> Payment &amp; Order Confirmation
          </DialogTitle>
          <DialogDescription>
            Review your order, make payment, and upload proof to finalize your booking.
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}