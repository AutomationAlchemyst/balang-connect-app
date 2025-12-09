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
  onBack: () => void;
  eventConfig: EventConfig & { eventDate: Date };
  customerDetails: CustomerDetailsFormValues;
}

const PAYNOW_UEN = "UEN53482512EA00#XNAP";
const DBS_ACCOUNT = "8852-1535-4360";

type UploadStatus = 'idle' | 'reading' | 'success' | 'error';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// Neo-Brutalism Styles
const DIALOG_CONTENT_STYLE = "bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000000] p-0 gap-0 sm:max-w-lg md:max-w-xl lg:max-w-2xl";
const HEADER_STYLE = "p-6 border-b-4 border-black bg-brand-cyan";
const TITLE_STYLE = "font-display font-black text-2xl uppercase flex items-center";
const BUTTON_BASE = "font-display font-bold uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]";
const TAB_TRIGGER_STYLE = "font-display font-bold uppercase data-[state=active]:bg-brand-yellow data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-[2px_2px_0px_0px_#000000] rounded-none border-2 border-transparent";
const UPLOAD_ZONE_BASE = "flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-black bg-[#FFFDF5] hover:bg-white transition-colors cursor-pointer group";

export default function PaymentConfirmationDialog({
  isOpen,
  onClose,
  onBack,
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
    if (file.size > 5 * 1024 * 1024) { 
      setUploadError('File is too large. Max size is 5MB.');
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
          <div className="flex flex-col items-center justify-center h-full p-12 bg-[#FFFDF5]">
            <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000000] animate-bounce">
                <Loader2 className="w-16 h-16 text-black animate-spin" />
            </div>
            <p className="mt-8 text-2xl font-display font-black uppercase text-black">Submitting...</p>
          </div>
        );
      case 'success':
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6583215730';
        const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello BalangConnect, I have just made a booking.';
        const message = encodeURIComponent(`${baseGreeting}\n\nName: ${customerDetails.fullName}\nEvent: ${format(eventConfig.eventDate, "PPP")} at ${eventConfig.eventTime}\nEmail: ${customerDetails.email}`);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        return (
          <div className="p-8 text-center bg-[#FFFDF5]">
            <PartyPopper className="w-20 h-20 text-black mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-4xl font-display font-black uppercase text-brand-green mb-2 transform -rotate-1">Booking Sent!</h2>
            <p className="mt-4 text-lg font-medium">Thank you, {customerDetails.fullName}!</p>
            <p className="text-muted-foreground">We've received your booking request. We will verify your payment and confirm via WhatsApp/Email within 1 business day.</p>
            
            <div className="mt-8 p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] text-left">
                <h3 className="font-display font-black uppercase text-xl mb-4 bg-brand-yellow inline-block px-2">Booking Summary</h3>
                <div className="space-y-2 font-mono text-sm">
                    <p><strong>Event:</strong> {format(eventConfig.eventDate, "PPP")} at {eventConfig.eventTime}</p>
                    <p><strong>Amount:</strong> ${eventConfig.totalPrice.toFixed(2)}</p>
                    <p><strong>Contact:</strong> {customerDetails.email}</p>
                </div>
            </div>
            <Button asChild size="lg" className={`${BUTTON_BASE} w-full mt-8 bg-[#25D366] text-white border-black hover:bg-[#128C7E] h-14 text-lg`}>
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="mr-2 h-6 w-6"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.486-.137-.05-.282-.075-.427.075-.145.149-.391.486-.479.562-.088.075-.176.088-.32.013-.145-.075-.612-.224-1.168-.722-.431-.397-.71-.88-.798-1.03-.088-.149-.013-.224.062-.299.063-.063.145-.164.218-.239.063-.062.088-.124.126-.21.037-.087.012-.162-.013-.238-.025-.075-.427-1.017-.584-1.396-.145-.353-.297-.303-.427-.303-.125-.013-.269-.013-.391-.013a.75.75 0 0 0-.529.238c-.19.19-.693.675-.693 1.65a.75.75 0 0 0 .126 1.017c.088.163.693.983 1.693 1.65.983.675 1.763.88 2.12.983.612.162.983.137 1.372.087.436-.05.88-.187 1.004-.362.125-.175.125-.337.088-.387s-.163-.187-.225-.212zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/></svg>
                    Contact on WhatsApp
                </Link>
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="p-8 text-center bg-red-50">
            <AlertCircle className="w-20 h-20 text-black mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-3xl font-display font-black uppercase text-red-600 mb-2">Submission Failed</h2>
            <p className="mt-2 font-medium">We couldn't finalize your booking.</p>
            <div className="mt-6 p-4 border-4 border-black bg-white text-red-600 text-sm text-left font-mono shadow-[4px_4px_0px_0px_#000000]">
              <p>{submissionError}</p>
            </div>
          </div>
        );
      default: // 'idle'
        return (
            <div className="space-y-8">
              <div className="p-6 border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000000] rotate-1">
                <h3 className="text-xl font-display font-black uppercase mb-3 bg-brand-yellow inline-block px-2">Order Summary</h3>
                <div className="space-y-1 font-medium">
                    <p className="flex justify-between border-b border-black pb-1"><span>Event Date:</span> <span>{format(eventConfig.eventDate, "PPP")}</span></p>
                    <p className="flex justify-between border-b border-black pb-1"><span>Time:</span> <span>{eventConfig.eventTime}</span></p>
                    <p className="flex justify-between pt-2 text-xl font-bold"><span>Total Amount:</span> <span className="bg-brand-cyan px-2 border-2 border-black">${eventConfig.totalPrice.toFixed(2)}</span></p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-display font-black uppercase mb-4">Payment Instructions</h3>
                <Tabs defaultValue="paynow_qr" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-black p-1 h-auto gap-1">
                    <TabsTrigger value="paynow_qr" className={TAB_TRIGGER_STYLE}>PayNow QR</TabsTrigger>
                    <TabsTrigger value="paynow_uen" className={TAB_TRIGGER_STYLE}>PayNow UEN</TabsTrigger>
                    <TabsTrigger value="fast_transfer" className={TAB_TRIGGER_STYLE}>Bank Transfer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="paynow_qr" className="mt-6 p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000000] text-center">
                    <p className="text-sm font-bold uppercase mb-4">Scan using your banking app</p>
                    <div className="inline-block border-2 border-black p-2 bg-white">
                        <Image src="https://placehold.co/250x250.png?text=PayNow+QR+Code" alt="PayNow QR Code" width={200} height={200} className="mx-auto"/>
                    </div>
                  </TabsContent>
                  <TabsContent value="paynow_uen" className="mt-6 p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000000] space-y-4">
                    <p className="text-sm font-bold uppercase">PayNow to UEN:</p>
                    <div className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black">
                      <span className="font-mono text-lg font-bold">{PAYNOW_UEN}</span>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(PAYNOW_UEN, "UEN")} className="hover:bg-brand-yellow border-2 border-transparent hover:border-black rounded-none">
                        <Copy className="mr-2 h-4 w-4" /> Copy
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="fast_transfer" className="mt-6 p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000000] space-y-4">
                     <p className="text-sm font-bold uppercase">FAST Transfer to DBS Bank Ltd:</p>
                      <div className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black">
                        <span className="font-mono text-lg font-bold">{DBS_ACCOUNT}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(DBS_ACCOUNT, "Account No.")} className="hover:bg-brand-yellow border-2 border-transparent hover:border-black rounded-none">
                          <Copy className="mr-2 h-4 w-4" /> Copy
                        </Button>
                      </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-3">
                <Label htmlFor="paymentProof" className="text-lg font-display font-black uppercase block">Upload Payment Proof*</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="paymentProof" className={cn(UPLOAD_ZONE_BASE, uploadStatus === 'error' && "border-red-600 bg-red-50", uploadStatus === 'success' && "border-green-600 bg-green-50")}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        {uploadStatus === 'idle' && <UploadCloud className="w-10 h-10 mb-3 text-black group-hover:scale-110 transition-transform" strokeWidth={1.5} />}
                        {uploadStatus === 'reading' && <Loader2 className="w-10 h-10 mb-3 text-black animate-spin" />}
                        {uploadStatus === 'success' && <CheckCircle className="w-10 h-10 mb-3 text-green-600" />}
                        {uploadStatus === 'error' && <AlertCircle className="w-10 h-10 mb-3 text-red-600" />}
                        <p className="mb-1 text-sm font-bold text-black uppercase">
                          {uploadStatus === 'idle' && 'Click to upload or drag & drop'}
                          {uploadStatus === 'reading' && 'Reading...'}
                          {uploadStatus === 'success' && (fileName || 'Uploaded!')}
                          {uploadStatus === 'error' && (fileName || 'Error')}
                        </p>
                        {uploadStatus === 'error' && <p className="text-xs text-red-600 font-bold">{uploadError}</p>}
                        {uploadStatus !== 'error' && <p className="text-xs text-gray-500 font-mono">JPG, PNG, PDF (MAX 5MB)</p>}
                    </div>
                    <Input id="paymentProof" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" disabled={isActionDisabled} />
                  </label>
                </div>
              </div>

              <div className="items-top flex space-x-3 pt-4 border-t-2 border-dashed border-black">
                <Checkbox 
                    id="termsPayment" 
                    checked={consentedToTerms} 
                    onCheckedChange={(checked) => setConsentedToTerms(!!checked)} 
                    disabled={isActionDisabled}
                    className="w-6 h-6 border-2 border-black rounded-none data-[state=checked]:bg-black data-[state=checked]:text-white"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="termsPayment" className="text-sm font-bold uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                    Agree to Terms and Conditions*
                  </label>
                  <p className="text-xs text-gray-600 font-medium">
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
                <DialogFooter className="mt-8 p-6 bg-gray-50 border-t-4 border-black !justify-center">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} bg-white hover:bg-gray-100`}>Make Another Booking</Button>
                </DialogFooter>
            );
        case 'error':
            return (
                <DialogFooter className="mt-8 p-6 bg-red-50 border-t-4 border-black flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} bg-white hover:bg-gray-100 w-full sm:w-auto`}>Cancel</Button>
                    <Button onClick={() => setSubmissionStatus('idle')} className={`${BUTTON_BASE} bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto`}>Try Again</Button>
                </DialogFooter>
            );
        default: // 'idle'
            return (
                <DialogFooter className="p-6 bg-[#FFFDF5] border-t-4 border-black flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={onBack} disabled={isActionDisabled} className={`${BUTTON_BASE} bg-white hover:bg-gray-100 w-full sm:w-auto`}>
                        Back
                    </Button>
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)} disabled={isActionDisabled} className={`${BUTTON_BASE} bg-[#FF6B6B] text-white border-black hover:bg-[#FF5252] w-full sm:w-auto`}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        className={`${BUTTON_BASE} bg-brand-green text-white hover:bg-[#329A00] w-full sm:w-auto flex-1 h-12 text-lg`}
                        disabled={isActionDisabled || uploadStatus !== 'success' || !consentedToTerms}
                    >
                        Confirm Booking
                    </Button>
                </DialogFooter>
            );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogStateChange}>
      <DialogContent className={DIALOG_CONTENT_STYLE}>
        <DialogHeader className={HEADER_STYLE}>
          <DialogTitle className={TITLE_STYLE}>
            <CreditCard className="mr-3 h-8 w-8" strokeWidth={2.5} /> Payment
          </DialogTitle>
          <DialogDescription className="text-black font-medium opacity-80">
            Review your order, make payment, and upload proof.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow min-h-0 overflow-y-auto p-6 bg-[#FFFDF5]">
          {renderContent()}
        </div>

        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}
