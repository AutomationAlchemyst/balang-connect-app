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
import { Copy, UploadCloud, CreditCard, Loader2, AlertCircle, CheckCircle, PartyPopper, CalendarDays, Zap, ArrowRight, Waves } from 'lucide-react';
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
  onConfirm?: () => void;
  eventConfig: EventConfig & { eventDate: Date };
  customerDetails: CustomerDetailsFormValues;
}

const PAYNOW_UEN = "UEN53482512EA00#XNAP";
const DBS_ACCOUNT = "8852-1535-4360";

type UploadStatus = 'idle' | 'reading' | 'success' | 'error';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// LIQUID PARADISE THEME STYLES
const DIALOG_CONTENT_STYLE = "bg-white/95 backdrop-blur-3xl border-0 p-0 overflow-hidden sm:max-w-xl lg:max-w-2xl rounded-[2.5rem] shadow-2xl h-full max-h-[90dvh] flex flex-col";
const HEADER_STYLE = "p-5 sm:p-8 md:p-10 bg-brand-teal text-white relative flex-shrink-0";
const TITLE_STYLE = "text-2xl sm:text-3xl md:text-4xl font-display font-black uppercase tracking-tight relative z-10 leading-tight";
const BUTTON_BASE = "font-display font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg active:scale-95 hover:-translate-y-0.5";
const TAB_TRIGGER_STYLE = "rounded-lg font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all h-9 px-4";
const UPLOAD_ZONE_BASE = "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-teal-100 bg-white/50 hover:bg-white transition-all rounded-2xl cursor-pointer group hover:border-teal-300";

export default function PaymentConfirmationDialog({
  isOpen,
  onClose,
  onBack,
  onConfirm,
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
        if (onConfirm) {
          onConfirm();
        }
      }
    } catch (e: any) {
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
          <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-white/40 backdrop-blur-3xl rounded-[3rem]">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="bg-white p-6 rounded-2xl shadow-xl relative z-10">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin" strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-2xl font-black uppercase text-teal-800 tracking-wide animate-pulse">Processing Order</p>
            <p className="text-teal-600/70 font-bold text-sm mt-3">Securing your booking details...</p>
          </div>
        );
      case 'success':
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6583215730';
        const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello BalangConnect, I have just made a booking.';
        const message = encodeURIComponent(`${baseGreeting}\n\nName: ${customerDetails.fullName}\nEvent: ${format(eventConfig.eventDate, "PPP")} at ${eventConfig.eventTime}\nEmail: ${customerDetails.email}`);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        return (
          <div className="p-10 text-center bg-teal-50/30 backdrop-blur-md min-h-[350px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <PartyPopper className="w-10 h-10 text-teal-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-4xl font-display font-black uppercase text-teal-900 mb-2 tracking-tight">Booking <span className="text-teal-600">Secured!</span></h2>
            <p className="text-slate-600 font-medium leading-relaxed">Thank you, {customerDetails.fullName}! Your booking has been successfully submitted.</p>

            <div className="mt-8 p-6 bg-white border border-teal-100 rounded-2xl text-left shadow-md w-full">
              <div className="space-y-3 font-bold text-slate-700 text-sm">
                <p className="flex justify-between border-b border-teal-50 pb-2"><span>Date</span> <span className="text-slate-900">{format(eventConfig.eventDate, "PPP")}</span></p>
                <p className="flex justify-between border-b border-teal-100 pb-2"><span>Time</span> <span className="text-slate-900">{eventConfig.eventTime}</span></p>
                <p className="flex justify-between pt-1"><span>Total</span> <span className="text-teal-600 text-lg">${eventConfig.totalPrice.toFixed(2)}</span></p>
              </div>
            </div>
            <Button asChild size="lg" className="w-full mt-6 bg-[#25D366] hover:bg-[#128C7E] text-white h-14 text-lg font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all">
              <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.486-.137-.05-.282-.075-.427.075-.145.149-.391.486-.479.562-.088.075-.176.088-.32.013-.145-.075-.612-.224-1.168-.722-.431-.397-.71-.88-.798-1.03-.088-.149-.013-.224.062-.299.063-.063.145-.164.218-.239.063-.062.088-.124.126-.21.037-.087.012-.162-.013-.238-.025-.075-.427-1.017-.584-1.396-.145-.353-.297-.303-.427-.303-.125-.013-.269-.013-.391-.013a.75.75 0 0 0-.529.238c-.19.19-.693.675-.693 1.65a.75.75 0 0 0 .126 1.017c.088.163.693.983 1.693 1.65.983.675 1.763.88 2.12.983.612.162.983.137 1.372.087.436-.05.88-.187 1.004-.362.125-.175.125-.337.088-.387s-.163-.187-.225-.212zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z" /></svg>
                Notify via WhatsApp
              </Link>
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="p-10 text-center bg-red-50/50 backdrop-blur-md min-h-[350px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <AlertCircle className="w-10 h-10 text-red-500" strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-black uppercase text-red-600 mb-2 tracking-tight">Submission Failed</h2>
            <p className="font-medium text-slate-600 max-w-sm mx-auto mb-6">We couldn't finalize your booking at this moment.</p>
            <div className="p-4 border border-red-100 bg-white rounded-xl text-red-600 text-xs text-left font-medium shadow-sm">
              <p>{submissionError}</p>
            </div>
          </div>
        );
      default: // 'idle'
        return (
          <div className="space-y-8 p-6 md:p-10 pb-24">
            {/* Summary Box */}
            <div className="p-6 bg-teal-50 border border-teal-100 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100 rounded-full blur-2xl pointer-events-none transition-colors"></div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <Zap size={18} className="text-teal-600 fill-teal-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-800">Booking Summary</span>
              </div>
              <div className="space-y-3 font-bold text-slate-700 relative z-10 text-sm">
                <p className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Event Date</span>
                  <span className="bg-white px-3 py-1 rounded-lg border border-teal-100 shadow-sm">{format(eventConfig.eventDate, "PPP")}</span>
                </p>
                <p className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Total Amount</span>
                  <span className="font-black text-2xl tracking-tight text-teal-600">${eventConfig.totalPrice.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Payment Tabs */}
            <div>
              <div className="flex items-center gap-2 mb-4 ml-1">
                <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                <h3 className="text-slate-800 font-black uppercase text-xs tracking-widest">1. Choose Payment Method</h3>
              </div>
              <Tabs defaultValue="paynow_qr" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100/50 p-1 h-auto gap-1 rounded-xl border border-slate-100">
                  <TabsTrigger value="paynow_qr" className={TAB_TRIGGER_STYLE}>QR Code</TabsTrigger>
                  <TabsTrigger value="paynow_uen" className={TAB_TRIGGER_STYLE}>UEN</TabsTrigger>
                  <TabsTrigger value="fast_transfer" className={TAB_TRIGGER_STYLE}>Bank</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                  <TabsContent value="paynow_qr" className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
                    <p className="text-[10px] font-bold uppercase mb-4 text-slate-400 tracking-widest leading-none">Scan with Banking App</p>
                    <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-slate-50 relative z-10">
                      <Image src="https://placehold.co/250x250.png?text=PayNow+QR+Code" alt="PayNow QR Code" width={180} height={180} className="mx-auto rounded-lg" />
                    </div>
                  </TabsContent>
                  <TabsContent value="paynow_uen" className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">PayNow UEN</p>
                    <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-xl shadow-lg">
                      <span className="font-display font-black text-xl tracking-widest">{PAYNOW_UEN}</span>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(PAYNOW_UEN, "UEN")} className="hover:bg-teal-500 hover:text-white rounded-lg h-10 w-10 transition-all">
                        <Copy size={18} strokeWidth={3} />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="fast_transfer" className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">DBS Bank Account</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-4 bg-teal-600 text-white rounded-xl shadow-lg">
                        <span className="font-mono font-bold text-lg tracking-widest">{DBS_ACCOUNT}</span>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(DBS_ACCOUNT, "Account No.")} className="hover:bg-white hover:text-teal-700 rounded-lg h-10 w-10 transition-all">
                          <Copy size={18} strokeWidth={3} />
                        </Button>
                      </div>
                      <p className="text-center font-bold text-[9px] text-slate-400 uppercase tracking-widest">Recipient: Balang Connect SG</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Upload Zone */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2 ml-1">
                <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                <h3 className="text-slate-800 font-black uppercase text-xs tracking-widest">2. Upload Receipt</h3>
              </div>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="paymentProof" className={cn(UPLOAD_ZONE_BASE, uploadStatus === 'error' && "border-red-200 bg-red-50/50", uploadStatus === 'success' && "border-emerald-200 bg-emerald-50/30")}>
                  <div className="flex flex-col items-center justify-center py-4 text-center px-4 relative z-10">
                    {uploadStatus === 'idle' && <UploadCloud className="w-10 h-10 mb-2 text-teal-200 group-hover:text-teal-500 transition-all" strokeWidth={2} />}
                    {uploadStatus === 'reading' && <Loader2 className="w-10 h-10 mb-2 text-teal-500 animate-spin" strokeWidth={2.5} />}
                    {uploadStatus === 'success' && <CheckCircle className="w-12 h-12 mb-2 text-emerald-500 animate-in zoom-in duration-300" strokeWidth={2.5} />}
                    {uploadStatus === 'error' && <AlertCircle className="w-10 h-10 mb-2 text-red-400 animate-in shake duration-300" strokeWidth={2.5} />}

                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {uploadStatus === 'idle' && 'Select Payment Proof'}
                      {uploadStatus === 'reading' && 'Uploading...'}
                      {uploadStatus === 'success' && (fileName || 'Receipt Attached')}
                      {uploadStatus === 'error' && 'Upload Failed'}
                    </p>
                    {uploadStatus === 'error' && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-tight">{uploadError}</p>}
                    {uploadStatus !== 'error' && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">JPG, PNG, PDF (Max 5MB)</p>}
                  </div>
                  <Input id="paymentProof" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" disabled={isActionDisabled} />
                </label>
              </div>
            </div>

            {/* Consent */}
            <div 
              className={cn(
                "flex items-start space-x-3 p-5 rounded-2xl transition-all duration-300 cursor-pointer border",
                consentedToTerms ? "bg-teal-50 border-teal-100" : "bg-slate-50/50 border-slate-100 hover:bg-white"
              )}
              onClick={() => !isActionDisabled && setConsentedToTerms(!consentedToTerms)}
            >
              <div className="pt-0.5">
                <div className={cn(
                  "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                  consentedToTerms ? "bg-teal-600 border-teal-600 text-white shadow-md" : "border-slate-300 bg-white"
                )}>
                  {consentedToTerms && <CheckCircle size={12} strokeWidth={4} />}
                </div>
              </div>
              <div className="grid gap-1 leading-none">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  I agree to the Terms & Conditions
                </span>
                <p className="text-[9px] text-slate-400 font-medium uppercase leading-relaxed tracking-wider">
                  Data processed securely. Full payment confirms your slot.
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
          <DialogFooter className="p-5 sm:p-8 bg-teal-50 border-t border-teal-100 !justify-center flex-shrink-0">
            <Button variant="outline" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} bg-white text-teal-700 border-teal-100 hover:bg-teal-50 h-12 px-8 w-full sm:w-auto`}>Return to Builder</Button>
          </DialogFooter>
        );
      case 'error':
        return (
          <DialogFooter className="p-5 sm:p-8 bg-red-50 border-t border-red-100 flex-col sm:flex-row gap-3 flex-shrink-0">
            <Button variant="ghost" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} hover:bg-red-500 hover:text-white text-red-500 w-full h-12`}>Abort</Button>
            <Button onClick={() => setSubmissionStatus('idle')} className={`${BUTTON_BASE} bg-red-500 text-white hover:bg-red-600 w-full h-12`}>Retry</Button>
          </DialogFooter>
        );
      default: // 'idle'
        return (
          <DialogFooter className="p-5 sm:p-8 bg-slate-50 border-t border-slate-100 flex-col sm:flex-row gap-4 flex-shrink-0">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" onClick={onBack} disabled={isActionDisabled} className="h-12 px-4 rounded-xl font-bold uppercase text-slate-500 hover:text-slate-900 flex-1 sm:flex-none">
                Back
              </Button>
              <Button variant="ghost" onClick={() => handleDialogStateChange(false)} disabled={isActionDisabled} className="h-12 px-4 rounded-xl font-bold uppercase text-red-400 hover:bg-red-50 flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              className="bg-teal-600 hover:bg-teal-700 text-white flex-1 min-h-[3.5rem] py-2 text-sm sm:text-base md:text-lg font-bold uppercase tracking-wider rounded-xl shadow-lg transition-all sm:min-w-[180px] w-full flex items-center justify-center gap-2 px-4"
              disabled={isActionDisabled || uploadStatus !== 'success' || !consentedToTerms}
            >
              <span className="leading-tight">Confirm Payment</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" strokeWidth={3} />
            </Button>
          </DialogFooter>
        );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogStateChange}>
      <DialogContent className={DIALOG_CONTENT_STYLE}>
        <DialogHeader className={HEADER_STYLE}>
          <div className="flex items-center gap-2 mb-1 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-sm shadow-md">
              $
            </div>
            <span className="text-white/70 font-bold text-[10px] uppercase tracking-[0.2em]">Final Step</span>
          </div>
          <DialogTitle className={TITLE_STYLE}>
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-teal-50 font-medium text-xs mt-1 relative z-10 max-w-sm">
            Complete your transaction to finalize the booking.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow min-h-0 overflow-y-auto bg-white overscroll-contain custom-scrollbar">
          {renderContent()}
        </div>

        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}