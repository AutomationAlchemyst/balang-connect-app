'use client';

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
  eventConfig: EventConfig & { eventDate: Date };
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
        return (
          <div className="flex flex-col items-center justify-center h-full p-10">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="mt-4 text-lg text-muted-foreground">Submitting Your Booking...</p>
          </div>
        );
      case 'success':
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6583215730';
        const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello BalangConnect, I have just made a booking.';
        const message = encodeURIComponent(`${baseGreeting}\n\nName: ${customerDetails.fullName}\nEvent: ${format(eventConfig.eventDate, "PPP")} at ${eventConfig.eventTime}\nEmail: ${customerDetails.email}`);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        return (
          <div className="p-6 text-center">
            <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-headline text-primary">Booking Request Sent!</h2>
            <p className="mt-2 text-muted-foreground">Thank you, {customerDetails.fullName}! We've received your booking request. We will verify your payment and confirm via WhatsApp/Email within 1 business day.</p>
            <div className="mt-6 p-4 border rounded-lg bg-secondary/30 text-left text-sm">
                <h3 className="font-semibold mb-2">Your Booking Summary:</h3>
                <p><strong>Event:</strong> {format(eventConfig.eventDate, "PPP")} at {eventConfig.eventTime}</p>
                <p><strong>Amount:</strong> ${eventConfig.totalPrice.toFixed(2)}</p>
                <p><strong>Contact:</strong> {customerDetails.email}</p>
            </div>
            <Button asChild size="lg" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white">
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="mr-2 h-5 w-5"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.486-.137-.05-.282-.075-.427.075-.145.149-.391.486-.479.562-.088.075-.176.088-.32.013-.145-.075-.612-.224-1.168-.722-.431-.397-.71-.88-.798-1.03-.088-.149-.013-.224.062-.299.063-.063.145-.164.218-.239.063-.062.088-.124.126-.21.037-.087.012-.162-.013-.238-.025-.075-.427-1.017-.584-1.396-.145-.353-.297-.303-.427-.303-.125-.013-.269-.013-.391-.013a.75.75 0 0 0-.529.238c-.19.19-.693.675-.693 1.65a.75.75 0 0 0 .126 1.017c.088.163.693.983 1.693 1.65.983.675 1.763.88 2.12.983.612.162.983.137 1.372.087.436-.05.88-.187 1.004-.362.125-.175.125-.337.088-.387s-.163-.187-.225-.212zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/></svg>
                    Contact us on WhatsApp
                </Link>
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-headline text-destructive">Submission Failed</h2>
            <p className="mt-2 text-muted-foreground">We couldn't finalize your booking. Please see the error below.</p>
            <div className="mt-4 p-3 border rounded-md bg-destructive/10 text-destructive text-sm text-left">
              <p>{submissionError}</p>
            </div>
          </div>
        );
      default: // 'idle'
        return (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="text-lg font-semibold mb-2 text-primary">Order Summary</h3>
                <p className="text-sm"><strong>Event:</strong> {format(eventConfig.eventDate, "PPP")} at {eventConfig.eventTime}</p>
                <p className="text-sm"><strong>Total Amount Due:</strong> <span className="font-bold text-accent text-xl">${eventConfig.totalPrice.toFixed(2)}</span></p>
              </div>

              <div>
                <h3 className="text-md font-semibold mb-2 text-foreground">Payment Instructions:</h3>
                <Tabs defaultValue="paynow_qr" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="paynow_qr">PayNow QR</TabsTrigger>
                    <TabsTrigger value="paynow_uen">PayNow UEN</TabsTrigger>
                    <TabsTrigger value="fast_transfer">FAST Transfer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paynow_qr" className="mt-4 p-4 border rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">Scan the QR code below using your banking app.</p>
                    <Image src="https://placehold.co/250x250.png?text=PayNow+QR+Code" alt="PayNow QR Code" width={250} height={250} className="mx-auto rounded-md shadow-md"/>
                  </TabsContent>
                  <TabsContent value="paynow_uen" className="mt-4 p-4 border rounded-md space-y-2">
                    <p className="text-sm text-muted-foreground">PayNow to UEN:</p>
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <span className="font-mono text-sm">{PAYNOW_UEN}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(PAYNOW_UEN, "UEN")}>
                        <Copy className="mr-1 h-4 w-4" /> Copy
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="fast_transfer" className="mt-4 p-4 border rounded-md space-y-2">
                     <p className="text-sm text-muted-foreground">FAST Transfer to DBS Bank Ltd:</p>
                      <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="font-mono text-sm">{DBS_ACCOUNT}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(DBS_ACCOUNT, "Account No.")}>
                          <Copy className="mr-1 h-4 w-4" /> Copy
                        </Button>
                      </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentProof" className="text-md font-semibold text-foreground">Upload Payment Proof*</Label>
                <p className="text-xs text-muted-foreground">Please upload a screenshot or PDF. Max file size: 1MB.</p>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="paymentProof" className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors", uploadStatus === 'error' && "border-destructive", uploadStatus === 'success' && "border-green-500")}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        {uploadStatus === 'idle' && <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />}
                        {uploadStatus === 'reading' && <Loader2 className="w-8 h-8 mb-2 text-muted-foreground animate-spin" />}
                        {uploadStatus === 'success' && <CheckCircle className="w-8 h-8 mb-2 text-green-500" />}
                        {uploadStatus === 'error' && <AlertCircle className="w-8 h-8 mb-2 text-destructive" />}
                        <p className="mb-1 text-sm text-muted-foreground">
                          <span className="font-semibold">
                            {uploadStatus === 'idle' && 'Click to upload or drag and drop'}
                            {uploadStatus === 'reading' && 'Reading file...'}
                            {uploadStatus === 'success' && (fileName || 'File uploaded successfully!')}
                            {uploadStatus === 'error' && (fileName || 'An error occurred')}
                          </span>
                        </p>
                        {uploadStatus === 'error' && <p className="text-xs text-destructive">{uploadError}</p>}
                        {uploadStatus !== 'error' && <p className="text-xs text-muted-foreground">PNG, JPG, GIF, PDF (MAX. 1MB)</p>}
                    </div>
                    <Input id="paymentProof" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" disabled={isActionDisabled} />
                  </label>
                </div>
              </div>

              <div className="items-top flex space-x-2 pt-2">
                <Checkbox id="termsPayment" checked={consentedToTerms} onCheckedChange={(checked) => setConsentedToTerms(!!checked)} disabled={isActionDisabled} />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="termsPayment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Agree to Terms and Conditions*
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By submitting, I confirm payment has been made and consent to data processing under Singapore's PDPA.
                  </p>
                </div>
              </div>
            </div>
        );
    }
  };

  const renderFooter = () => {
    switch (submissionStatus) {
        case 'success':
             return (
                <DialogFooter className="mt-4 !justify-center">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)}>Make Another Booking</Button>
                </DialogFooter>
            );
        case 'error':
            return (
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)}>Cancel</Button>
                    <Button onClick={() => setSubmissionStatus('idle')}>Try Again</Button>
                </DialogFooter>
            );
        default: // 'idle'
            return (
                <DialogFooter className="p-6 pt-4 border-t shrink-0">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)} disabled={isActionDisabled}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-accent hover:bg-accent/90" disabled={isActionDisabled || uploadStatus !== 'success' || !consentedToTerms}>Confirm Booking & Submit Proof</Button>
                </DialogFooter>
            );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogStateChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="font-headline text-primary flex items-center">
            <CreditCard className="mr-2 h-6 w-6" /> Payment &amp; Order Confirmation
          </DialogTitle>
          <DialogDescription>
            Review your order, make payment, and upload proof to finalize your booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow min-h-0 overflow-y-auto p-6">
          {renderContent()}
        </div>

        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}