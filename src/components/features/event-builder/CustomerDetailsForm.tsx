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
  pickupTime: z.string().min(1, { message: 'Please select a pickup time.' }),
  howHeard: z.string().min(1, { message: 'Please select an option.' }),
});

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsFormSchema>;

interface CustomerDetailsFormProps {
  onSubmit: (values: CustomerDetailsFormValues) => void;
  onCancel: () => void;
  onBack: () => void;
  eventTime?: string;
  initialValues?: Partial<CustomerDetailsFormValues>;
}

export default function CustomerDetailsForm({ onSubmit, onCancel, onBack, eventTime, initialValues }: CustomerDetailsFormProps) {
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

  // Neo-Brutalism Styles
  const inputStyles = "font-body border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] focus-visible:ring-0 focus-visible:border-black focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] focus:bg-[#3CD3E8] transition-all h-12";
  const labelStyles = "font-display font-bold uppercase tracking-tight text-lg text-black mb-2";
  const cardStyles = "bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] p-6 sm:p-8 -rotate-1 transition-transform hover:rotate-0";
  const buttonBaseStyles = "font-display font-bold uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]";
  
  return (
    <Form {...form}>
      <div className="p-4 md:p-8">
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className={`flex flex-col h-full gap-8 ${cardStyles}`}
        >
          <div className="space-y-6">
            <div className="text-center mb-6">
               <h2 className="font-display text-3xl font-bold uppercase tracking-tighter bg-[#FDDD59] inline-block px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#000000] transform -rotate-2">
                 Customer Details
               </h2>
            </div>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="YOUR FULL NAME" className={inputStyles} {...field} />
                  </FormControl>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="YOUR.EMAIL@EXAMPLE.COM" className={inputStyles} {...field} />
                  </FormControl>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>Phone *</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="WHATSAPP NUMBER" className={inputStyles} {...field} />
                  </FormControl>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className={labelStyles}>Postal Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" className={inputStyles} {...field} />
                    </FormControl>
                    <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressBlockHouse"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className={labelStyles}>Block No / House Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="BLK 123 / 45A JALAN BESAR" className={inputStyles} {...field} />
                    </FormControl>
                    <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
                control={form.control}
                name="addressUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelStyles}>Unit Number (if any)</FormLabel>
                    <FormControl>
                      <Input placeholder="#01-23" className={inputStyles} {...field} />
                    </FormControl>
                    <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="expectedPax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>Expected No of Pax *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50, 100, 200" className={inputStyles} {...field} />
                  </FormControl>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>Tell us about the event *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="WEDDING, GATHERING, BIRTHDAY..."
                      className={`${inputStyles} h-32 pt-3`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pickupTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>Balang pickup/collection time *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="SELECT A TIME" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000]">
                      {filteredPickupTimeSlots.length > 0 ? (
                        filteredPickupTimeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot} className="focus:bg-[#FDDD59] focus:text-black font-body cursor-pointer border-b border-black/10 last:border-0">
                            {slot}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-slots" disabled className="text-gray-500">
                          No available slots (min. 3hr after event)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="font-bold text-xs uppercase tracking-wide">Time for us to collect empty balangs.</FormDescription>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="howHeard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelStyles}>How did you hear about us? *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={inputStyles}>
                        <SelectValue placeholder="PLEASE SELECT ONE" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_#000000]">
                      {hearAboutUsOptions.map((option) => (
                        <SelectItem key={option} value={option} className="focus:bg-[#FDDD59] focus:text-black font-body cursor-pointer border-b border-black/10 last:border-0">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="font-bold text-red-600 bg-red-100 border border-red-600 p-1 mt-1 inline-block" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-end gap-4 border-t-2 border-black pt-6 mt-4">
            <Button 
              type="button" 
              onClick={onBack}
              className={`${buttonBaseStyles} bg-white text-black hover:bg-gray-100 sm:w-auto w-full h-12`}
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={onCancel}
              className={`${buttonBaseStyles} bg-[#FF6B6B] text-white hover:bg-[#FF5252] sm:w-auto w-full h-12`}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`${buttonBaseStyles} bg-[#FDDD59] text-black hover:bg-[#FFE580] sm:w-auto w-full h-14 text-xl px-8 flex-1 sm:flex-none`}
            >
              Book Now <ArrowRight className="ml-2 h-5 w-5 border-black" />
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
}