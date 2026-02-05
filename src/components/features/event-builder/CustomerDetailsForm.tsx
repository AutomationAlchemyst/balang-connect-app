'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const hearAboutUsOptions = [
  'Social Media (Facebook, Instagram, etc.)',
  'Google Search',
  'Friend/Family Recommendation',
  'Previous Event Attended',
  'Flyer/Advertisement',
  'Other',
];

const pickupTimeSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM",
  "07:00 PM", "08:00 PM", "09:00 PM",
  "10:00 PM"
];

// Helper function to convert 'hh:mm AM/PM' to a 24-hour numeric value
const timeTo24Hour = (timeStr: string): number => {
  const [time, modifier] = timeStr.split(' ');
  let [hours] = time.split(':').map(Number);
  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  }
  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  return hours;
};

const customerDetailsFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number.' }),
  postalCode: z.string().min(6, { message: 'Postal code must be at least 6 digits.' }).max(6, { message: 'Postal code must be 6 digits.' }),
  addressBlockHouse: z.string().min(1, { message: 'Block/House number is required.' }),
  addressUnit: z.string().optional(),
  expectedPax: z.coerce.number().positive({ message: 'Expected number of pax must be a positive number.' }),
  eventDescription: z.string().min(5, { message: 'Event description must be at least 5 characters.' }),
  pickupTime: z.string().optional(),
  howHeard: z.string().min(1, { message: 'Please select an option.' }),
}).refine((data) => {
  // pickupTime is required unless it's the 17L package (but schema level it's optional)
  // We'll handle the requirement check in the form item or just keep it optional as requested for 17L
  return true;
});

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsFormSchema>;

interface CustomerDetailsFormProps {
  onSubmit: (values: CustomerDetailsFormValues) => void;
  onCancel: () => void;
  onBack: () => void;
  eventTime?: string;
  initialValues?: Partial<CustomerDetailsFormValues>;
  selectedPackageId?: string;
}

export default function CustomerDetailsForm({ onSubmit, onCancel, onBack, eventTime, initialValues, selectedPackageId }: CustomerDetailsFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsFormSchema),
    defaultValues: initialValues || {
      fullName: '',
      email: '',
      phone: '',
      postalCode: '',
      addressBlockHouse: '',
      addressUnit: '',
      expectedPax: '' as unknown as number,
      eventDescription: '',
      pickupTime: '',
      howHeard: '',
    },
  });

  const { setValue, watch, trigger } = form;
  const selectedPickupTime = watch('pickupTime');

  const filteredPickupTimeSlots = useMemo(() => {
    if (!eventTime) {
      return pickupTimeSlots;
    }
    const eventHour = timeTo24Hour(eventTime);
    const earliestPickupHour = eventHour + 3;

    return pickupTimeSlots.filter(slot => {
      const slotHour = timeTo24Hour(slot);
      return slotHour >= earliestPickupHour;
    });
  }, [eventTime]);

  useEffect(() => {
    if (selectedPickupTime && !filteredPickupTimeSlots.includes(selectedPickupTime)) {
      setValue('pickupTime', '', { shouldValidate: true });
    }
  }, [filteredPickupTimeSlots, selectedPickupTime, setValue]);

  useEffect(() => {
    if (currentStep === 2) {
      // Clear any potential lingering errors for step 2 fields upon entry
      // Use setTimeout to ensure this runs after the form has fully re-rendered/mounted the new fields
      const timer = setTimeout(() => {
        form.clearErrors(['postalCode', 'addressBlockHouse', 'addressUnit', 'expectedPax', 'eventDescription', 'pickupTime']);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentStep, form]);

  const handleNext = async () => {
    const isStep1Valid = await trigger(['fullName', 'email', 'phone', 'howHeard']);
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const handlePrev = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      onBack();
    }
  };

  // LIQUID PARADISE THEME STYLES
  const inputStyles = "bg-slate-50/50 border-slate-200/60 h-14 text-teal-900 font-bold placeholder:text-teal-900/30 rounded-2xl focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm hover:bg-white";
  const labelStyles = "font-display font-black uppercase text-teal-800 text-[10px] tracking-[0.2em] ml-1 mb-2 block";
  const cardStyles = "bg-transparent p-1"; // Parent modal handles the glass effect
  const buttonBaseStyles = "font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 hover:-translate-y-0.5";

  return (
    <Form {...form}>
      <div className="h-full">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col gap-6 md:gap-10 ${cardStyles}`}
        >
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mb-4 text-teal-600 shadow-sm">
                <Sparkles size={20} strokeWidth={2} />
              </div>
              <h2 className="text-slate-800 text-3xl font-black uppercase tracking-tight">
                {currentStep === 1 ? "Contact Details" : "Event Logistics"}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className={cn("h-1.5 w-8 rounded-full transition-all", currentStep === 1 ? "bg-teal-500 w-12" : "bg-slate-200")} />
                <div className={cn("h-1.5 w-8 rounded-full transition-all", currentStep === 2 ? "bg-teal-500 w-12" : "bg-slate-200")} />
              </div>
              <p className="text-slate-500 font-medium text-xs mt-3">Step {currentStep} of 2</p>
            </div>

            {currentStep === 1 ? (
              <div key="contact-step" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelStyles}>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="AUTHORIZED REPRESENTATIVE" className={inputStyles} {...field} />
                        </FormControl>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelStyles}>Communication Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="EMAIL@DOMAIN.COM" className={inputStyles} {...field} />
                        </FormControl>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>WhatsApp / Mobile *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+65 XXXX XXXX" className={inputStyles} {...field} />
                      </FormControl>
                      <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="howHeard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Acquisition Source *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={inputStyles}>
                            <SelectValue placeholder="DISCOVERY METHOD" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white/90 backdrop-blur-2xl border-white/60 rounded-[1.25rem] p-2">
                          {hearAboutUsOptions.map((option) => (
                            <SelectItem key={option} value={option} className="font-black text-brand-teal py-3 rounded-xl focus:bg-brand-aqua/20">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div key="logistics-step" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-1">
                        <FormLabel className={labelStyles}>Postal Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="XXXXXX" className={inputStyles} {...field} />
                        </FormControl>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addressBlockHouse"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className={labelStyles}>Block / House Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="STREET & BUILDING" className={inputStyles} {...field} />
                        </FormControl>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="addressUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelStyles}>Unit ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="#XX-XX" className={inputStyles} {...field} />
                        </FormControl>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedPax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelStyles}>Estimated Guests *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="HEADCOUNT" className={inputStyles} {...field} />
                        </FormControl>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="eventDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Experience Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="DESCRIBE THE VIBE..."
                          className={`${inputStyles} h-24 pt-5 resize-none`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                    </FormItem>
                  )}
                />

                {selectedPackageId !== 'pkg_17l_self_pickup' && (
                  <FormField
                    control={form.control}
                    name="pickupTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelStyles}>Requested Balang Collection Time *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={inputStyles}>
                              <SelectValue placeholder="SELECT SLOT" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white/90 backdrop-blur-2xl border-white/60 rounded-[1.25rem] p-2">
                            {filteredPickupTimeSlots.length > 0 ? (
                              filteredPickupTimeSlots.map((slot) => (
                                <SelectItem key={slot} value={slot} className="font-black text-brand-teal py-3 rounded-xl focus:bg-brand-aqua/20">
                                  {slot}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-slots" disabled className="text-brand-teal/40">
                                No available slots
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-6 mt-2 w-full">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm h-12 px-6 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 w-full sm:w-auto"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                onClick={handlePrev}
                variant="outline"
                className="font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm h-12 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 w-full sm:w-auto flex-1 sm:flex-none"
              >
                Back
              </Button>

              {currentStep === 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="font-black uppercase tracking-widest rounded-xl transition-all shadow-md bg-gradient-to-r from-[#0df2df] to-[#09a093] text-[#041F1C] hover:brightness-110 h-12 px-8 w-full sm:w-auto flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={3} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="font-black uppercase tracking-widest rounded-xl transition-all shadow-md bg-gradient-to-r from-[#0df2df] to-[#09a093] text-[#041F1C] hover:brightness-110 h-12 px-8 w-full sm:w-auto flex items-center justify-center gap-2 flex-1 sm:flex-none"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={3} />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Form>
  );
}