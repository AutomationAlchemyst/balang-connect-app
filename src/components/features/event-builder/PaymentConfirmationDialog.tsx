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
import { Copy, UploadCloud, CreditCard, Loader2, AlertCircle, CheckCircle, PartyPopper, CalendarDays } from 'lucide-react';
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

// MODERN COAST THEME STYLES
const DIALOG_CONTENT_STYLE = "glass-panel-wet p-0 gap-0 sm:max-w-lg md:max-w-xl lg:max-w-2xl border-white/60";
const HEADER_STYLE = "p-6 border-b border-brand-blue/5 bg-brand-blue/5";
const TITLE_STYLE = "text-coast-heading text-2xl flex items-center gap-3";
const BUTTON_BASE = "font-display font-bold uppercase rounded-full shadow-sm transition-all hover:shadow-md active:scale-95";
const TAB_TRIGGER_STYLE = "rounded-full font-bold data-[state=active]:bg-brand-cyan data-[state=active]:text-white data-[state=active]:shadow-md transition-all";
const UPLOAD_ZONE_BASE = "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-brand-blue/20 bg-white/40 hover:bg-white/70 transition-all rounded-3xl cursor-pointer group hover:border-brand-cyan/50";

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
          <div className="flex flex-col items-center justify-center h-full p-12 min-h-[400px]">
            <div className="bg-white p-6 rounded-full shadow-xl animate-bounce mb-6">
                <Loader2 className="w-12 h-12 text-brand-cyan animate-spin" />
            </div>
            <p className="text-2xl font-display font-bold uppercase text-brand-blue tracking-wider">Finalizing Booking...</p>
            <p className="text-brand-blue/50 mt-2">Please wait while we secure your date.</p>
          </div>
        );
      case 'success':
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6583215730';
        const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello BalangConnect, I have just made a booking.';
        const message = encodeURIComponent(`${baseGreeting}\n\nName: ${customerDetails.fullName}\nEvent: ${format(eventConfig.eventDate, "PPP")} at ${eventConfig.eventTime}\nEmail: ${customerDetails.email}`);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        return (
          <div className="p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
               <PartyPopper className="w-12 h-12 text-green-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-display font-black uppercase text-brand-blue mb-2">Booking Sent!</h2>
            <p className="mt-2 text-lg font-medium text-brand-blue/80">Thank you, {customerDetails.fullName}!</p>
            <p className="text-brand-blue/60 max-w-md mx-auto mt-2 text-sm">We've received your booking request. We will verify your payment and confirm via WhatsApp/Email within 1 business day.</p>
            
            <div className="mt-8 p-6 bg-white/50 border border-brand-blue/10 rounded-2xl text-left shadow-sm">
                <h3 className="font-display font-bold uppercase text-sm mb-4 bg-brand-cyan/10 text-brand-blue inline-block px-3 py-1 rounded-full">Booking Summary</h3>
                <div className="space-y-3 font-medium text-sm text-brand-blue/80">
                    <p className="flex justify-between border-b border-dashed border-brand-blue/10 pb-2"><span>Event Date</span> <span>{format(eventConfig.eventDate, "PPP")}</span></p>
                    <p className="flex justify-between border-b border-dashed border-brand-blue/10 pb-2"><span>Event Time</span> <span>{eventConfig.eventTime}</span></p>
                    <p className="flex justify-between pt-1"><span>Total Paid</span> <span className="font-bold">${eventConfig.totalPrice.toFixed(2)}</span></p>
                </div>
            </div>
            <Button asChild size="lg" className="w-full mt-8 bg-[#25D366] text-white hover:bg-[#128C7E] h-14 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.486-.137-.05-.282-.075-.427.075-.145.149-.391.486-.479.562-.088.075-.176.088-.32.013-.145-.075-.612-.224-1.168-.722-.431-.397-.71-.88-.798-1.03-.088-.149-.013-.224.062-.299.063-.063.145-.164.218-.239.063-.062.088-.124.126-.21.037-.087.012-.162-.013-.238-.025-.075-.427-1.017-.584-1.396-.145-.353-.297-.303-.427-.303-.125-.013-.269-.013-.391-.013a.75.75 0 0 0-.529.238c-.19.19-.693.675-.693 1.65a.75.75 0 0 0 .126 1.017c.088.163.693.983 1.693 1.65.983.675 1.763.88 2.12.983.612.162.983.137 1.372.087.436-.05.88-.187 1.004-.362.125-.175.125-.337.088-.387s-.163-.187-.225-.212zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"/></svg>
                    Notify us on WhatsApp
                </Link>
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="p-8 text-center bg-red-50/50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-display font-black uppercase text-red-600 mb-2">Submission Failed</h2>
            <p className="mt-2 font-medium text-red-800/80">We couldn't finalize your booking.</p>
            <div className="mt-6 p-4 border border-red-200 bg-white rounded-xl text-red-600 text-sm text-left font-mono shadow-sm">
              <p>{submissionError}</p>
            </div>
          </div>
        );
      default: // 'idle'
        return (
            <div className="space-y-8 p-2">
              <div className="p-6 bg-white/60 border border-brand-blue/10 rounded-3xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/20 rounded-bl-full -mr-4 -mt-4"></div>
                <h3 className="text-sm font-bold uppercase mb-4 text-brand-blue/50 tracking-widest">Order Summary</h3>
                <div className="space-y-3 font-medium text-brand-blue">
                    <p className="flex justify-between border-b border-dashed border-brand-blue/10 pb-2">
                        <span className="flex items-center gap-2"><CalendarDays size={16} className="text-brand-cyan"/> Date</span> 
                        <span>{format(eventConfig.eventDate, "PPP")}</span>
                    </p>
                    <p className="flex justify-between border-b border-dashed border-brand-blue/10 pb-2">
                        <span className="flex items-center gap-2"><CreditCard size={16} className="text-brand-cyan"/> Total Amount</span> 
                        <span className="font-display font-bold text-xl">${eventConfig.totalPrice.toFixed(2)}</span>
                    </p>
                </div>
              </div>

              <div>
                <h3 className="text-coast-heading text-lg mb-4 ml-1">Payment Method</h3>
                <Tabs defaultValue="paynow_qr" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-brand-blue/5 p-1 h-auto gap-1 rounded-full">
                    <TabsTrigger value="paynow_qr" className={TAB_TRIGGER_STYLE}>QR Code</TabsTrigger>
                    <TabsTrigger value="paynow_uen" className={TAB_TRIGGER_STYLE}>UEN</TabsTrigger>
                    <TabsTrigger value="fast_transfer" className={TAB_TRIGGER_STYLE}>Bank Transfer</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-6">
                      <TabsContent value="paynow_qr" className="p-8 bg-white border border-brand-blue/10 rounded-3xl shadow-sm text-center">
                        <p className="text-xs font-bold uppercase mb-4 text-brand-blue/60 tracking-widest">Scan with Bank App</p>
                        <div className="inline-block p-4 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-brand-blue/5">
                            <Image src="https://placehold.co/250x250.png?text=PayNow+QR+Code" alt="PayNow QR Code" width={200} height={200} className="mx-auto rounded-lg"/>
                        </div>
                      </TabsContent>
                      <TabsContent value="paynow_uen" className="p-8 bg-white border border-brand-blue/10 rounded-3xl shadow-sm space-y-4">
                        <p className="text-xs font-bold uppercase text-brand-blue/60 tracking-widest">PayNow to UEN</p>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-brand-blue/5">
                          <span className="font-mono text-lg font-bold text-brand-blue">{PAYNOW_UEN}</span>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(PAYNOW_UEN, "UEN")} className="hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-full">
                            <Copy className="mr-2 h-4 w-4" /> Copy
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent value="fast_transfer" className="p-8 bg-white border border-brand-blue/10 rounded-3xl shadow-sm space-y-4">
                         <p className="text-xs font-bold uppercase text-brand-blue/60 tracking-widest">DBS Bank Ltd</p>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-brand-blue/5">
                            <span className="font-mono text-lg font-bold text-brand-blue">{DBS_ACCOUNT}</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(DBS_ACCOUNT, "Account No.")} className="hover:bg-brand-cyan/10 hover:text-brand-cyan rounded-full">
                              <Copy className="mr-2 h-4 w-4" /> Copy
                            </Button>
                          </div>
                      </TabsContent>
                  </div>
                </Tabs>
              </div>

              <div className="space-y-3">
                <Label htmlFor="paymentProof" className="text-coast-heading text-lg block ml-1">Upload Payment Proof</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="paymentProof" className={cn(UPLOAD_ZONE_BASE, uploadStatus === 'error' && "border-red-300 bg-red-50", uploadStatus === 'success' && "border-green-300 bg-green-50")}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        {uploadStatus === 'idle' && <UploadCloud className="w-12 h-12 mb-3 text-brand-cyan/50 group-hover:scale-110 transition-transform" strokeWidth={1.5} />}
                        {uploadStatus === 'reading' && <Loader2 className="w-10 h-10 mb-3 text-brand-cyan animate-spin" />}
                        {uploadStatus === 'success' && <CheckCircle className="w-12 h-12 mb-3 text-green-500" />}
                        {uploadStatus === 'error' && <AlertCircle className="w-10 h-10 mb-3 text-red-500" />}
                        <p className="mb-1 text-sm font-bold text-brand-blue uppercase">
                          {uploadStatus === 'idle' && 'Click or Drag File Here'}
                          {uploadStatus === 'reading' && 'Processing...'}
                          {uploadStatus === 'success' && (fileName || 'Uploaded Successfully')}
                          {uploadStatus === 'error' && (fileName || 'Upload Error')}
                        </p>
                        {uploadStatus === 'error' && <p className="text-xs text-red-500 font-bold mt-1">{uploadError}</p>}
                        {uploadStatus !== 'error' && <p className="text-xs text-brand-blue/40 font-medium mt-1">Supported: JPG, PNG, PDF (Max 5MB)</p>}
                    </div>
                    <Input id="paymentProof" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" disabled={isActionDisabled} />
                  </label>
                </div>
              </div>

              <div className="items-top flex space-x-3 pt-6 border-t border-dashed border-brand-blue/10">
                <Checkbox 
                    id="termsPayment" 
                    checked={consentedToTerms} 
                    onCheckedChange={(checked) => setConsentedToTerms(!!checked)} 
                    disabled={isActionDisabled}
                    className="w-5 h-5 border-brand-blue/30 rounded text-brand-cyan data-[state=checked]:bg-brand-cyan data-[state=checked]:text-white"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="termsPayment" className="text-sm font-bold uppercase leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-brand-blue">
                    I agree to the Terms & Conditions
                  </label>
                  <p className="text-xs text-brand-blue/60 font-medium">
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
                <DialogFooter className="mt-0 p-6 bg-white/50 border-t border-brand-blue/5 !justify-center">
                    <Button variant="outline" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} bg-white text-brand-blue border-brand-blue/10 hover:bg-gray-50 h-12 px-8`}>Make Another Booking</Button>
                </DialogFooter>
            );
        case 'error':
            return (
                <DialogFooter className="mt-0 p-6 bg-red-50/50 border-t border-red-100 flex-col sm:flex-row gap-3">
                    <Button variant="ghost" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} hover:bg-red-100 text-red-600 w-full sm:w-auto`}>Cancel</Button>
                    <Button onClick={() => setSubmissionStatus('idle')} className={`${BUTTON_BASE} bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto shadow-lg`}>Try Again</Button>
                </DialogFooter>
            );
        default: // 'idle'
            return (
                <DialogFooter className="p-6 bg-white/60 border-t border-brand-blue/5 flex-col sm:flex-row gap-3 backdrop-blur-sm">
                    <Button variant="ghost" onClick={onBack} disabled={isActionDisabled} className={`${BUTTON_BASE} text-brand-blue hover:bg-brand-blue/5 w-full sm:w-auto`}>
                        Back
                    </Button>
                    <Button variant="ghost" onClick={() => handleDialogStateChange(false)} disabled={isActionDisabled} className={`${BUTTON_BASE} text-red-500 hover:bg-red-50 w-full sm:w-auto`}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        className={`btn-coast-primary w-full sm:w-auto flex-1 h-12 text-lg shadow-xl`}
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
            <div className="bg-brand-cyan/20 p-2 rounded-full text-brand-blue">
               <CreditCard className="h-6 w-6" strokeWidth={2.5} /> 
            </div>
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-brand-blue/60 font-medium">
            Review your order details and upload payment proof to confirm.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow min-h-0 overflow-y-auto bg-[#FFFDF5]/50 custom-scrollbar">
          {renderContent()}
        </div>

        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}