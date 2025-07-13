
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
  eventTime?: string;
}

export default function CustomerDetailsForm({ onSubmit, onCancel, eventTime }: CustomerDetailsFormProps) {
  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsFormSchema),
    defaultValues: {
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


  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col h-full"
      >
        <div className="space-y-4 px-6 py-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Your Full Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="We will contact you through WhatsApp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem className="sm:col-span-1">
                  <FormLabel>Postal Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="addressBlockHouse"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Block No / House Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blk 123 / 45A Jalan Besar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
              control={form.control}
              name="addressUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Number (if any)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., #01-23" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={form.control}
            name="expectedPax"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected No of Pax *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50, 100, 200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="eventDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tell us a little more about the event *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g., Wedding, Family Gathering, Birthday, Office Event"
                    className="resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Balang pickup/collection time *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pickup time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredPickupTimeSlots.length > 0 ? (
                      filteredPickupTimeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-slots" disabled>
                        No available slots (min. 3hr after event)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>Time for us to collect empty balangs.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="howHeard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did you hear about us? *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Please select one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hearAboutUsOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-3 p-6 pt-4 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
