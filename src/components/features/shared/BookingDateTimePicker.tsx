'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalendarDays, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const EVENT_TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

interface BookingDateTimePickerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onSelectTime: (time: string) => void;
  blockedDates: Date[];
  onSubmit: () => void;
  primaryColorClass?: string; // e.g. "bg-primary text-[#0d1c1b]" or "bg-brand-stitch-structured-primary text-white"
  primaryTextClass?: string; // e.g. "text-primary" or "text-brand-stitch-structured-primary"
  primaryBorderClass?: string; // e.g. "border-primary/20" or "border-brand-stitch-structured-primary/20"
  calendarBgClass?: string;
}

export default function BookingDateTimePicker({
  isOpen,
  onOpenChange,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  blockedDates,
  onSubmit,
  primaryColorClass = 'bg-primary text-[#0d1c1b]',
  primaryTextClass = 'text-primary',
  primaryBorderClass = 'border-primary/20',
  calendarBgClass = 'bg-[#fdfaf5]'
}: BookingDateTimePickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-[480px] p-0 border-0 bg-transparent shadow-none">
        <div className="bg-white dark:bg-[#1a2e2d] rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col w-full border border-white/20">
          <div className="overflow-y-auto p-8 space-y-6 flex-1 min-h-0 w-full custom-scrollbar">
            <div className="text-center">
              <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 border", primaryBorderClass, "bg-slate-50 dark:bg-black/10")}>
                <CalendarDays className={cn("h-8 w-8", primaryTextClass)} />
              </div>
              <DialogTitle className="font-black text-2xl uppercase text-[#0d1a1b] dark:text-white tracking-tighter italic">
                Select Date
              </DialogTitle>
              <DialogDescription className="text-xs text-[#0d1a1b]/60 dark:text-white/60 font-black uppercase tracking-widest">
                Coastal Availability Check
              </DialogDescription>
            </div>

            <div className={cn("flex justify-center p-4 rounded-[2rem] border border-[#0d1a1b]/5 dark:border-white/5 text-slate-900 dark:text-white", calendarBgClass)}>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onSelectDate}
                disabled={[
                  ...blockedDates,
                  { before: new Date(new Date().setHours(0, 0, 0, 0)) }
                ]}
                className="p-3 w-fit"
              />
            </div>

            <div className={cn("space-y-4 p-6 rounded-[2rem] border bg-slate-50/50 dark:bg-black/10", primaryBorderClass)}>
              <div className="flex items-center justify-between pl-1">
                <Label className={cn("uppercase text-[10px] font-black tracking-widest", primaryTextClass)}>
                  Select Event Time
                </Label>
                <Info className={cn("size-4 opacity-45", primaryTextClass)} />
              </div>
              <Select value={selectedTime} onValueChange={onSelectTime}>
                <SelectTrigger className={cn("h-14 rounded-2xl bg-white dark:bg-white/5 font-black text-slate-700 dark:text-white shadow-sm uppercase text-sm tracking-wide border", primaryBorderClass)}>
                  <SelectValue placeholder="--:-- --" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl max-h-[220px] dark:bg-[#1a2e2d] dark:border-white/10">
                  {EVENT_TIME_SLOTS.map((t: string) => (
                    <SelectItem
                      key={t}
                      value={t}
                      className="font-black uppercase text-xs rounded-xl cursor-pointer my-1 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className={cn("text-[10px] font-bold italic pl-2 leading-relaxed opacity-60", primaryTextClass)}>
                Note: Pickup or delivery coordination will be confirmed by our team following your booking.
              </p>
            </div>
          </div>
          <div className="p-8 pt-2 flex-shrink-0 border-t border-[#0d1a1b]/5 dark:border-white/5">
            <DialogFooter>
              <Button
                onClick={onSubmit}
                className={cn("w-full h-14 font-black uppercase rounded-2xl shadow-lg transition-all border-none hover:brightness-110", primaryColorClass)}
              >
                Confirm & Continue
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
