'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, MessageCircle, ArrowRight, Home, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingSuccessViewProps {
  slotId?: string;
  onReset: () => void;
}

export default function BookingSuccessView({ slotId, onReset }: BookingSuccessViewProps) {
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
          Thank you for choosing BalangConnect. We're excited to serve you!
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

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Button onClick={onReset} variant="outline" className="h-14 flex-1 rounded-xl border-slate-200 text-slate-600 font-bold uppercase hover:bg-slate-50">
            Book Another
        </Button>
        <Button asChild className="h-14 flex-1 rounded-xl bg-slate-900 text-white font-bold uppercase hover:bg-slate-800 shadow-lg">
            <Link href="/">
                Return Home <Home className="ml-2 w-4 h-4" />
            </Link>
        </Button>
      </div>
    </div>
  );
}