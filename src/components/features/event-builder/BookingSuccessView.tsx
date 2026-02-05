'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, MessageCircle, ArrowRight, Home, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

import { format } from 'date-fns';

interface BookingSuccessViewProps {
  slotId?: string;
  onReset: () => void;
  customerName?: string;
  eventDate?: Date;
  eventTime?: string;
}

export default function BookingSuccessView({
  slotId,
  onReset,
  customerName,
  eventDate,
  eventTime
}: BookingSuccessViewProps) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6598814898';
  const baseGreeting = process.env.NEXT_PUBLIC_WHATSAPP_GREETING || 'Hello Balang Kepalang, I have just made a booking.';

  const formattedDate = eventDate ? format(eventDate, 'PPP') : 'N/A';
  const message = encodeURIComponent(
    `${baseGreeting}\n\n` +
    `Name: ${customerName || 'N/A'}\n` +
    `Event Date: ${formattedDate}\n` +
    `Event Time: ${eventTime || 'N/A'}\n` +
    `Order Ref: ${slotId || 'N/A'}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">

      {/* Success Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-teal-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="w-24 h-24 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10">
          <Check size={48} strokeWidth={4} />
        </div>
      </div>

      <div className="space-y-4 max-w-lg">
        <h2 className="text-4xl md:text-5xl font-black uppercase text-slate-900 tracking-tighter">
          Order <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">Confirmed!</span>
        </h2>
        <p className="text-lg text-slate-500 font-medium">
          Thank you for choosing Balang Kepalang. We're excited to serve you!
        </p>
        {slotId && (
          <div className="bg-slate-100 px-4 py-2 rounded-lg inline-block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Ref: <span className="text-slate-900">{slotId}</span></p>
          </div>
        )}
      </div>

      {/* Next Steps Card */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-[2rem] shadow-xl max-w-2xl w-full text-left">
        <h3 className="text-teal-800 font-black uppercase text-lg mb-6 flex items-center gap-2">
          <CalendarCheck size={20} /> What Happens Next?
        </h3>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
              <h4 className="font-bold text-slate-800">Review & Confirmation</h4>
              <p className="text-sm text-slate-500 font-medium">Our team will review your order details and date availability within 24 hours.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
              <h4 className="font-bold text-slate-800">WhatsApp Connect</h4>
              <p className="text-sm text-slate-500 font-medium">We will contact you via WhatsApp to finalize logistics and confirm payment.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">3</div>
            <div>
              <h4 className="font-bold text-slate-800">Sit Back & Relax</h4>
              <p className="text-sm text-slate-500 font-medium">Once confirmed, your "Liquid Paradise" is secured. We handle the rest!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button asChild size="lg" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-16 text-lg font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-.88-.436-1.017-.486-.137-.05-.282-.075-.427.075-.145.149-.391.486-.479.562-.088.075-.176.088-.32.013-.145-.075-.612-.224-1.168-.722-.431-.397-.71-.88-.798-1.03-.088-.149-.013-.224.062-.299.063-.063.145-.164.218-.239.063-.062.088-.124.126-.21.037-.087.012-.162-.013-.238-.025-.075-.427-1.017-.584-1.396-.145-.353-.297-.303-.427-.303-.125-.013-.269-.013-.391-.013a.75.75 0 0 0-.529.238c-.19.19-.693.675-.693 1.65a.75.75 0 0 0 .126 1.017c.088.163.693.983 1.693 1.65.983.675 1.763.88 2.12.983.612.162.983.137 1.372.087.436-.05.88-.187 1.004-.362.125-.175.125-.337.088-.387s-.163-.187-.225-.212zM12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10z" /></svg>
            Notify via WhatsApp
          </Link>
        </Button>

        <div className="flex gap-4 w-full">
          <Button onClick={onReset} variant="outline" className="h-14 flex-1 rounded-xl border-slate-200 text-slate-600 font-bold uppercase hover:bg-slate-50 transition-all">
            Book Another
          </Button>
          <Button asChild className="h-14 flex-1 rounded-xl bg-slate-900 text-white font-bold uppercase hover:bg-slate-800 shadow-lg transition-all">
            <Link href="/">
              Return Home <Home className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}