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
import { ArrowRight } from 'lucide-react';
import { useMemo, useEffect } from 'react';

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

  const { setValue, watch } = form;
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

  // LIQUID PARADISE THEME STYLES
  const inputStyles = "bg-white/40 border-white/60 h-16 text-brand-teal font-black placeholder:text-brand-teal/20 rounded-[1.25rem] focus:ring-brand-aqua/50 focus:border-brand-aqua transition-all";
  const labelStyles = "font-display font-black uppercase tracking-[0.2em] text-[10px] text-brand-teal/40 mb-3 ml-2";
  const cardStyles = "bg-transparent p-6 md:p-10"; // Parent modal handles the glass effect
  const buttonBaseStyles = "font-display font-black uppercase tracking-widest rounded-[1.25rem] transition-all shadow-xl active:scale-95 hover:-translate-y-1";

  return (
    <Form {...form}>
      <div className="h-full">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col gap-6 md:gap-10 ${cardStyles}`}
        >
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center mb-12">
              <div className="w-16 h-1 w-1 bg-brand-aqua rounded-full mb-6 opacity-30" />
              <h2 className="text-brand-teal text-4xl lg:text-5xl font-display font-black uppercase tracking-tight">
                Customer <br />
                <span className="text-brand-teal/40">Credentials</span>
              </h2>
              <p className="text-brand-teal/60 font-bold text-sm mt-4 max-w-xs">Enter your details to finalize the premium booking.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      className={`${inputStyles} h-32 pt-5 resize-none`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="font-black text-brand-coral text-[10px] uppercase tracking-widest mt-2 ml-2" />
                </FormItem>
              )}
            />

            <div className={`grid grid-cols-1 ${selectedPackageId === 'pkg_17l_self_pickup' ? '' : 'md:grid-cols-2'} gap-8`}>
              {selectedPackageId !== 'pkg_17l_self_pickup' && (
                <FormField
                  control={form.control}
                  name="pickupTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelStyles}>Logistics Collection *</FormLabel>
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
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-6 border-t border-brand-teal/10 pt-10 mt-6">
            <div className="flex gap-4 w-full sm:w-auto">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className={`${buttonBaseStyles} bg-white/40 border-white/60 text-brand-teal h-14 px-8 flex-1`}
              >
                Regress
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className={`${buttonBaseStyles} border-brand-coral/20 text-brand-coral hover:bg-brand-coral hover:text-white h-14 px-8 flex-1`}
              >
                Abort
              </Button>
            </div>
            <Button
              type="submit"
              className={`${buttonBaseStyles} bg-brand-teal text-white hover:bg-brand-aqua hover:text-brand-teal h-16 text-xl px-12 sm:min-w-[240px]`}
            >
              Verify & Book <ArrowRight className="ml-4 h-6 w-6" strokeWidth={4} />
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}