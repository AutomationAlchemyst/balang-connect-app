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
  eventConfig: EventConfig & { eventDate: Date };
  customerDetails: CustomerDetailsFormValues;
}

const PAYNOW_UEN = "UEN53482512EA00#XNAP";
const DBS_ACCOUNT = "8852-1535-4360";

type UploadStatus = 'idle' | 'reading' | 'success' | 'error';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

// LIQUID PARADISE THEME STYLES
const DIALOG_CONTENT_STYLE = "glass-panel-wet bg-white/60 backdrop-blur-3xl border-white/20 p-0 overflow-hidden sm:max-w-xl lg:max-w-2xl rounded-[3rem] shadow-2xl";
const HEADER_STYLE = "p-6 md:p-10 bg-brand-teal text-white relative overflow-hidden";
const TITLE_STYLE = "text-5xl font-display font-black uppercase tracking-tight relative z-10 leading-none";
const BUTTON_BASE = "font-display font-black uppercase tracking-widest rounded-[1.25rem] transition-all shadow-xl active:scale-95 hover:-translate-y-1";
const TAB_TRIGGER_STYLE = "rounded-[1rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-brand-aqua data-[state=active]:text-brand-teal data-[state=active]:shadow-xl transition-all h-10 px-6";
const UPLOAD_ZONE_BASE = "flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-brand-teal/20 bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all rounded-[2rem] cursor-pointer group hover:border-brand-aqua/50";

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
          <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-white/20 backdrop-blur-3xl">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-brand-aqua/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="bg-white p-8 rounded-full shadow-2xl relative z-10">
                <Loader2 className="w-16 h-16 text-brand-aqua animate-spin" strokeWidth={3} />
              </div>
            </div>
            <p className="text-3xl font-display font-black uppercase text-brand-teal tracking-[0.2em] animate-pulse">Synchronizing</p>
            <p className="text-brand-teal/40 font-bold uppercase tracking-widest text-[10px] mt-4">Establishing Secure Connection to Central Systems...</p>
          </div>
        );
      case 'success':
        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6583215730';
        const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello BalangConnect, I have just made a booking.';
        const message = encodeURIComponent(`${baseGreeting}\n\nName: ${customerDetails.fullName}\nEvent: ${format(eventConfig.eventDate, "PPP")} at ${eventConfig.eventTime}\nEmail: ${customerDetails.email}`);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

        return (
          <div className="p-12 text-center bg-brand-aqua/5 backdrop-blur-md min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-brand-aqua/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <PartyPopper className="w-12 h-12 text-brand-aqua" strokeWidth={1.5} />
            </div>
            <h2 className="text-5xl font-display font-black uppercase text-brand-teal mb-4 tracking-tight">Booking <br /> <span className="text-brand-aqua">Secured!</span></h2>
            <p className="mt-2 text-lg font-black text-brand-teal/80">Affirmative, {customerDetails.fullName}!</p>
            <p className="text-brand-teal/40 max-w-md mx-auto mt-4 text-xs font-bold uppercase tracking-widest leading-relaxed">Booking request logged. Multi-channel confirmation will be dispatched upon verification.</p>

            <div className="mt-10 p-8 bg-white/40 border-2 border-white rounded-[2.5rem] text-left shadow-2xl w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-brand-aqua rounded-full"></div>
                <h3 className="font-display font-black uppercase text-xs tracking-[0.3em] text-brand-teal/40">Manifest Receipt</h3>
              </div>
              <div className="space-y-4 font-black text-brand-teal">
                <p className="flex justify-between border-b border-brand-teal/5 pb-3"><span>Timeline</span> <span className="opacity-60">{format(eventConfig.eventDate, "PPP")}</span></p>
                <p className="flex justify-between border-b border-brand-teal/5 pb-3"><span>Slot</span> <span className="opacity-60">{eventConfig.eventTime}</span></p>
                <p className="flex justify-between pt-2"><span>Settlement</span> <span className="text-brand-aqua text-xl">${eventConfig.totalPrice.toFixed(2)}</span></p>
              </div>
            </div>
            <Button asChild size="lg" className="w-full mt-10 bg-[#25D366] text-white hover:bg-[#128C7E] h-18 text-xl font-display font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl transition-all">
              <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-4">
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-8 w-8"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.486-.137-.05-.282-.075-.427.075-.145.149-.391.486-.479.562-.088.075-.176.088-.32.013-.145-.075-.612-.224-1.168-.722-.431-.397-.71-.88-.798-1.03-.088-.149-.013-.224.062-.299.063-.063.145-.164.218-.239.063-.062.088-.124.126-.21.037-.087.012-.162-.013-.238-.025-.075-.427-1.017-.584-1.396-.145-.353-.297-.303-.427-.303-.125-.013-.269-.013-.391-.013a.75.75 0 0 0-.529.238c-.19.19-.693.675-.693 1.65a.75.75 0 0 0 .126 1.017c.088.163.693.983 1.693 1.65.983.675 1.763.88 2.12.983.612.162.983.137 1.372.087.436-.05.88-.187 1.004-.362.125-.175.125-.337.088-.387s-.163-.187-.225-.212zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z" /></svg>
                Notify Central Command
              </Link>
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="p-12 text-center bg-brand-coral/5 backdrop-blur-md min-h-[400px] flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-brand-coral/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <AlertCircle className="w-12 h-12 text-brand-coral" strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-display font-black uppercase text-brand-coral mb-4 tracking-tight">Execution <br /> <span className="opacity-40">Failed</span></h2>
            <p className="mt-2 font-bold text-brand-teal/60 max-w-sm mx-auto">We couldn't finalize your booking at this moment.</p>
            <div className="mt-8 p-6 border-2 border-brand-coral/20 bg-white/40 rounded-3xl text-brand-coral text-xs text-left font-black uppercase tracking-widest shadow-inner">
              <p>{submissionError}</p>
            </div>
          </div>
        );
      default: // 'idle'
        return (
          <div className="space-y-10 p-4">
            <div className="p-8 bg-brand-teal/5 border border-brand-teal/10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-aqua/10 rounded-full blur-3xl pointer-events-none group-hover:bg-brand-aqua/20 transition-colors"></div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center shadow-md">
                  <Zap size={16} fill="white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-teal/40">Manifest Summary</span>
              </div>
              <div className="space-y-4 font-black text-brand-teal relative z-10">
                <p className="flex justify-between items-center text-sm">
                  <span className="opacity-40 uppercase tracking-widest flex items-center gap-3"><CalendarDays size={16} className="text-brand-aqua" strokeWidth={3} /> Event Date</span>
                  <span className="bg-white/40 px-4 py-2 rounded-xl border border-white/60">{format(eventConfig.eventDate, "PPP")}</span>
                </p>
                <p className="flex justify-between items-center pt-2">
                  <span className="opacity-40 uppercase tracking-widest flex items-center gap-3"><CreditCard size={16} className="text-brand-aqua" strokeWidth={3} /> Valuation</span>
                  <span className="font-display font-black text-5xl tracking-tighter text-brand-teal">${eventConfig.totalPrice.toFixed(2)}</span>
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6 ml-2">
                <div className="w-2 h-8 bg-brand-aqua rounded-full"></div>
                <h3 className="text-brand-teal font-display font-black uppercase text-xl mt-1 tracking-tight">Payment Channels</h3>
              </div>
              <Tabs defaultValue="paynow_qr" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-brand-teal/5 p-1.5 h-auto gap-2 rounded-[1.5rem] border border-brand-teal/10">
                  <TabsTrigger value="paynow_qr" className={TAB_TRIGGER_STYLE}>QR Protocol</TabsTrigger>
                  <TabsTrigger value="paynow_uen" className={TAB_TRIGGER_STYLE}>UEN Entry</TabsTrigger>
                  <TabsTrigger value="fast_transfer" className={TAB_TRIGGER_STYLE}>Direct Wire</TabsTrigger>
                </TabsList>

                <div className="mt-8">
                  <TabsContent value="paynow_qr" className="p-6 md:p-10 bg-white/40 border-2 border-white rounded-[3rem] shadow-2xl text-center backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand-aqua/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <p className="text-[10px] font-black uppercase mb-6 text-brand-teal/30 tracking-[0.4em] relative z-10">Scan Digital Asset</p>
                    <div className="inline-block p-6 bg-white rounded-[2rem] shadow-2xl border-2 border-brand-teal/5 relative z-10 scale-100 group-hover:scale-105 transition-transform duration-500">
                      <Image src="https://placehold.co/250x250.png?text=PayNow+QR+Code" alt="PayNow QR Code" width={220} height={220} className="mx-auto rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  </TabsContent>
                  <TabsContent value="paynow_uen" className="p-6 md:p-10 bg-white/40 border-2 border-white rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase text-brand-teal/30 tracking-[0.4em]">Corporate UEN Mapping</p>
                    <div className="flex items-center justify-between p-6 bg-brand-teal text-white rounded-[1.5rem] shadow-2xl border border-white/20">
                      <span className="font-display font-black text-2xl tracking-widest">{PAYNOW_UEN}</span>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(PAYNOW_UEN, "UEN")} className="bg-white/10 hover:bg-brand-aqua hover:text-brand-teal rounded-xl h-12 w-12 transition-all">
                        <Copy size={20} strokeWidth={3} />
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="fast_transfer" className="p-6 md:p-10 bg-white/40 border-2 border-white rounded-[3rem] shadow-2xl space-y-6 backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase text-brand-teal/30 tracking-[0.4em]">Institutional Fast Wire</p>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-6 bg-brand-teal text-white rounded-[1.5rem] shadow-2xl border border-white/20">
                        <span className="font-display font-black text-2xl tracking-widest">{DBS_ACCOUNT}</span>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(DBS_ACCOUNT, "Account No.")} className="bg-white/10 hover:bg-brand-aqua hover:text-brand-teal rounded-xl h-12 w-12 transition-all">
                          <Copy size={20} strokeWidth={3} />
                        </Button>
                      </div>
                      <p className="text-center font-black text-[10px] text-brand-teal/40 uppercase tracking-widest">Recipient: Balang Connect SG</p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2 ml-2">
                <div className="w-2 h-8 bg-brand-aqua rounded-full"></div>
                <h3 className="text-brand-teal font-display font-black uppercase text-xl mt-1 tracking-tight">Transmission Proof</h3>
              </div>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="paymentProof" className={cn(UPLOAD_ZONE_BASE, uploadStatus === 'error' && "border-brand-coral/30 bg-brand-coral/5", uploadStatus === 'success' && "border-brand-aqua/30 bg-brand-aqua/10 shadow-inner")}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 relative z-10">
                    {uploadStatus === 'idle' && <UploadCloud className="w-16 h-16 mb-4 text-brand-teal/20 group-hover:text-brand-aqua group-hover:scale-110 transition-all" strokeWidth={2} />}
                    {uploadStatus === 'reading' && <Loader2 className="w-12 h-12 mb-4 text-brand-aqua animate-spin" strokeWidth={3} />}
                    {uploadStatus === 'success' && <CheckCircle className="w-16 h-16 mb-4 text-brand-aqua animate-in zoom-in duration-500" strokeWidth={3} />}
                    {uploadStatus === 'error' && <AlertCircle className="w-16 h-16 mb-4 text-brand-coral animate-in shake duration-500" strokeWidth={3} />}
                    <p className="mb-2 text-xs font-black text-brand-teal uppercase tracking-[0.2em]">
                      {uploadStatus === 'idle' && 'Digital Asset Upload'}
                      {uploadStatus === 'reading' && 'Processing Matrix...'}
                      {uploadStatus === 'success' && (fileName || 'Proof Secured')}
                      {uploadStatus === 'error' && (fileName || 'Ingestion Failed')}
                    </p>
                    {uploadStatus === 'error' && <p className="text-[10px] text-brand-coral font-bold mt-1 uppercase tracking-widest">{uploadError}</p>}
                    {uploadStatus !== 'error' && <p className="text-[10px] text-brand-teal/30 font-black uppercase tracking-widest mt-1">SLA Level: Valid (Max 5MB)</p>}
                  </div>
                  <Input id="paymentProof" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" disabled={isActionDisabled} />
                </label>
              </div>
            </div>

            <div className="items-top flex space-x-4 p-8 bg-brand-teal/[0.03] border-2 border-dashed border-brand-teal/10 rounded-[2.5rem] group/terms cursor-pointer" onClick={() => !isActionDisabled && setConsentedToTerms(!consentedToTerms)}>
              <div className="pt-0.5">
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                  consentedToTerms ? "bg-brand-aqua border-brand-aqua text-brand-teal shadow-lg rotate-6" : "border-brand-teal/20 bg-white"
                )}>
                  {consentedToTerms && <CheckCircle size={14} strokeWidth={4} />}
                </div>
              </div>
              <div className="grid gap-2 leading-none">
                <label htmlFor="termsPayment" className="text-xs font-black uppercase leading-none tracking-widest cursor-pointer text-brand-teal group-hover/terms:text-brand-aqua transition-colors">
                  I ratify the Terms & Logistics
                </label>
                <p className="text-[10px] text-brand-teal/40 font-bold uppercase leading-relaxed tracking-wider">
                  Execution implies full payment & consent to data processing under SG PDPA protocols.
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
          <DialogFooter className="p-6 md:p-10 bg-brand-teal/5 border-t border-brand-teal/10 !justify-center">
            <Button variant="outline" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} bg-white text-brand-teal border-white/60 hover:bg-white/80 h-14 px-10`}>Initiative Complete</Button>
          </DialogFooter>
        );
      case 'error':
        return (
          <DialogFooter className="p-6 md:p-10 bg-brand-coral/10 border-t border-brand-coral/20 flex-col sm:flex-row gap-4">
            <Button variant="ghost" onClick={() => handleDialogStateChange(false)} className={`${BUTTON_BASE} hover:bg-brand-coral hover:text-white text-brand-coral w-full h-14`}>Abort Session</Button>
            <Button onClick={() => setSubmissionStatus('idle')} className={`${BUTTON_BASE} bg-brand-coral text-white hover:bg-brand-coral/80 w-full h-14 shadow-2xl`}>Retry Protocol</Button>
          </DialogFooter>
        );
      default: // 'idle'
        return (
          <DialogFooter className="p-6 md:p-10 bg-white/40 border-t border-white/20 flex-col sm:flex-row gap-6 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
            <div className="flex gap-4 w-full sm:w-auto">
              <Button variant="ghost" onClick={onBack} disabled={isActionDisabled} className={`${BUTTON_BASE} bg-white/20 text-brand-teal hover:bg-white/40 h-14 px-8 border border-white/40`}>
                Regress
              </Button>
              <Button variant="ghost" onClick={() => handleDialogStateChange(false)} disabled={isActionDisabled} className={`${BUTTON_BASE} border-brand-coral/20 text-brand-coral hover:bg-brand-coral hover:text-white h-14 px-8`}>
                Abort
              </Button>
            </div>
            <Button
              onClick={handleSubmit}
              className={`${BUTTON_BASE} bg-brand-teal text-white hover:bg-brand-aqua hover:text-brand-teal flex-1 h-16 text-xl shadow-2xl group`}
              disabled={isActionDisabled || uploadStatus !== 'success' || !consentedToTerms}
            >
              Execute Protocol <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" strokeWidth={4} />
            </Button>
          </DialogFooter>
        );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogStateChange}>
      <DialogContent className={DIALOG_CONTENT_STYLE}>
        <DialogHeader className={HEADER_STYLE}>
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <CreditCard size={160} className="text-white" />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-brand-aqua text-brand-teal flex items-center justify-center font-black text-xl shadow-lg rotate-6">
              <span className="relative z-10">$</span>
            </div>
            <span className="text-brand-aqua font-display font-black text-xs uppercase tracking-[0.4em]">Finality</span>
          </div>
          <DialogTitle className={TITLE_STYLE}>
            Secure <br />
            <span className="opacity-40 text-white">Payment</span>
          </DialogTitle>
          <DialogDescription className="text-white/60 font-bold text-sm mt-4 relative z-10 max-w-sm">
            Review your order parameters and transmit payment proof to confirm the protocol.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow min-h-0 overflow-y-auto bg-white/20 backdrop-blur-md custom-scrollbar">
          {renderContent()}
        </div>

        {renderFooter()}

      </DialogContent>
    </Dialog>
  );
}