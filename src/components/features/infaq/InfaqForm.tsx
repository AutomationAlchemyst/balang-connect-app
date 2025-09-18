
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
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { CalendarIcon, Send, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import type { InfaqOrder } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { submitInfaqContribution } from '@/app/infaq/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { mosqueDataList } from '@/lib/data';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';


const INFAQ_BALANG_PRICE = 95.00;
const DELIVERY_FEE = 25.00;

export const hearAboutUsOptions = [ 
  'Social Media (Facebook, Instagram, etc.)',
  'Google Search',
  'Friend/Family Recommendation',
  'Previous Event Attended',
  'Flyer/Advertisement',
  'Mosque Announcement',
  'Other',
];

const infaqFormSchema = z.object({
  donorName: z.string().min(2, { message: 'Donor name must be at least 2 characters.' }).max(50),
  dedicationName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number (min. 8 digits).' }),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1 balang.' }),
  coverDeliveryFee: z.boolean().default(false).optional(),
  mosqueName: z.string({ required_error: "Please select a mosque." }),
  deliveryDate: z.date({ required_error: "Please select a delivery date." }),
  message: z.string().max(300, { message: 'Message cannot exceed 300 characters.' }).optional(),
  anonymous: z.boolean().default(false).optional(),
  howHeard: z.string({ required_error: 'Please select how you heard about us.' }),
  consent: z.boolean().refine(val => val === true, { message: "You must agree to the terms to submit." }),
  targetSlotId: z.string().optional(), // To store the ID of the slot being contributed to
});

export default function InfaqForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedMosqueAddress, setSelectedMosqueAddress] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null); // Ref for scrolling
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);

  useEffect(() => {
      const fetchBlockedDates = async () => {
          setIsCalendarLoading(true);
          const dates = await getBlockedDates();
          setBlockedDates(dates.map(d => d.date));
          setIsCalendarLoading(false);
      };
      fetchBlockedDates();
  }, []);

  const form = useForm<z.infer<typeof infaqFormSchema>>({
    resolver: zodResolver(infaqFormSchema),
    defaultValues: {
      donorName: '',
      dedicationName: '',
      email: '',
      phone: '',
      quantity: 1,
      coverDeliveryFee: false,
      mosqueName: undefined,
      deliveryDate: undefined,
      message: '',
      anonymous: false,
      howHeard: undefined,
      consent: false,
      targetSlotId: undefined,
    },
  });

  useEffect(() => {
    const mosqueNameParam = searchParams.get('mosqueName');
    const deliveryDateParam = searchParams.get('deliveryDate');
    const targetSlotIdParam = searchParams.get('targetSlotId');
    const deliveryAlreadyCoveredParam = searchParams.get('deliveryAlreadyCovered');
    
    let paramsApplied = false;

    if (mosqueNameParam) {
      form.setValue('mosqueName', mosqueNameParam);
      const selected = mosqueDataList.find(m => m.name === mosqueNameParam);
      setSelectedMosqueAddress(selected ? selected.address : null);
      paramsApplied = true;
    }
    if (deliveryDateParam) {
      try {
        // Robustly parse YYYY-MM-DD to avoid timezone issues.
        const dateParts = deliveryDateParam.split('-').map(Number);
        if (dateParts.length === 3) {
          // JS Date month is 0-indexed.
          const localDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          if (!isNaN(localDate.getTime())) {
              form.setValue('deliveryDate', localDate, { shouldValidate: true });
              paramsApplied = true;
          } else {
              console.error("Failed to parse date from URL param:", deliveryDateParam);
          }
        }
      } catch (e) {
        console.error("Error parsing deliveryDate from URL:", e);
      }
    }
    if (targetSlotIdParam) {
      form.setValue('targetSlotId', targetSlotIdParam);
      form.setValue('message', `Contributing to existing slot ID: ${targetSlotIdParam}`);
      paramsApplied = true;
    }

    if (deliveryAlreadyCoveredParam === 'true') {
      form.setValue('coverDeliveryFee', false); 
      paramsApplied = true;
    }


    if (paramsApplied) {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('mosqueName');
      currentUrl.searchParams.delete('deliveryDate');
      currentUrl.searchParams.delete('targetSlotId');
      currentUrl.searchParams.delete('deliveryAlreadyCovered');
      const hash = window.location.hash;
      router.replace(currentUrl.pathname + currentUrl.search + hash, { scroll: false });
      
      if (hash === '#infaq-form-actual' && formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [searchParams, router, form]);

  const currentQuantity = form.watch('quantity');
  const isAnonymous = form.watch('anonymous');
  const coverDeliveryFeeChecked = form.watch('coverDeliveryFee');

  useEffect(() => {
    if (isAnonymous) {
      form.setValue('donorName', 'Anonymous Donor');
    } else {
      if (form.getValues('donorName') === 'Anonymous Donor') {
        form.setValue('donorName', '');
      }
    }
  }, [isAnonymous, form]);

  useEffect(() => {
    const quantity = Number(currentQuantity) || 0;
    const newSubtotal = quantity * INFAQ_BALANG_PRICE;
    setSubtotal(newSubtotal);

    let currentTotal = newSubtotal;
    let currentDeliveryFeeValue = 0;

    if (quantity > 0 && coverDeliveryFeeChecked) {
      currentTotal += DELIVERY_FEE;
      currentDeliveryFeeValue = DELIVERY_FEE;
    }
    setCalculatedDeliveryFee(currentDeliveryFeeValue);
    setTotalPrice(currentTotal);
  }, [currentQuantity, coverDeliveryFeeChecked]);

  async function onSubmit(values: z.infer<typeof infaqFormSchema>) {
    setIsLoading(true);
    if (!values.deliveryDate) {
        toast({
            title: "Delivery Date Missing",
            description: "Please select a delivery date.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    const orderData: InfaqOrder = {
      ...values,
      deliveryDate: format(values.deliveryDate, 'yyyy-MM-dd'), // Format to unambiguous string
      deliveryDisplayDate: format(values.deliveryDate, "PPP"),
      pricePerBalang: INFAQ_BALANG_PRICE,
      calculatedSubtotal: subtotal,
      deliveryFee: values.coverDeliveryFee ? DELIVERY_FEE : 0,
      calculatedTotal: totalPrice,
      mosqueAddress: selectedMosqueAddress ?? undefined,
      orderType: 'balang_infaq',
      coverDeliveryFee: !!values.coverDeliveryFee, 
    };
    
    const result = await submitInfaqContribution(orderData);

    if (result.success) {
      toast({
        title: 'Infaq Submitted Successfully!',
        description: `Thank you, ${values.anonymous ? 'Anonymous Donor' : values.donorName}! Your Infaq of ${values.quantity} balang(s) for ${values.mosqueName} on ${format(values.deliveryDate, "PPP")} (Total: $${totalPrice.toFixed(2)}) has been received. We will contact you for confirmation. Slot ID: ${result.slotId}`,
        variant: 'default',
        duration: 10000,
      });
      form.reset({ 
        donorName: '', 
        dedicationName: '',
        email: '',
        phone: '',
        quantity: 1,
        coverDeliveryFee: false,
        mosqueName: undefined,
        deliveryDate: undefined,
        message: '',
        anonymous: false,
        howHeard: undefined,
        consent: false,
        targetSlotId: undefined, 
      });
      setSelectedMosqueAddress(null);
      setSubtotal(0); 
      setTotalPrice(0);
      setCalculatedDeliveryFee(0);
    } else {
      toast({
        title: 'Infaq Submission Failed',
        description: result.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" ref={formRef} id="infaq-form-actual">
        <FormField
          control={form.control}
          name="anonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-secondary/20">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="infaq-anonymous"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="infaq-anonymous">Donate Anonymously</FormLabel>
                <FormDescription>
                  Your name will be recorded as 'Anonymous Donor'.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="donorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Full Name (Donor) *</FormLabel>
              <FormControl>
                <Input placeholder="The person making this contribution" {...field} disabled={isLoading || isAnonymous} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dedicationName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Infaq On Behalf Of (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A loved one, family name, an organization" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>If this Infaq is dedicated to someone or a group.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>We'll send a confirmation to this email.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Phone Number *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your contact number (for WhatsApp coordination)" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Balangs to Infaq *</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder="e.g., 1" {...field} onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    field.onChange(val >= 1 ? val : 1);
                }} 
                disabled={isLoading} 
                />
              </FormControl>
              <FormDescription>Each 23L balang is ${INFAQ_BALANG_PRICE.toFixed(2)} (approx. 60 cups).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="coverDeliveryFee"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-secondary/20">
              <FormControl>
                <Checkbox
                  id="infaq-cover-delivery" 
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading || currentQuantity < 1}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="infaq-cover-delivery" className={cn(currentQuantity < 1 && "text-muted-foreground/50", "cursor-pointer")}>
                  Also sponsor the ${DELIVERY_FEE.toFixed(2)} delivery fee for this slot?
                </FormLabel>
                <FormDescription className={cn(currentQuantity < 1 && "text-muted-foreground/50")}>
                  If not selected, the delivery fee will be shared among all contributors. We will contact you separately for this portion of the payment.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mosqueName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mosque Name / Venue *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  const selected = mosqueDataList.find(m => m.name === value);
                  setSelectedMosqueAddress(selected ? selected.address : null);
                }} 
                value={field.value || ""} 
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mosque" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mosqueDataList.map((mosque) => (
                    <SelectItem key={mosque.name} value={mosque.name}>
                      {mosque.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Please select the mosque or venue for delivery.</FormDescription>
              <FormMessage />
              {selectedMosqueAddress && (
                <p className="text-sm text-muted-foreground mt-1 pt-1 border-t border-border">
                  Address: {selectedMosqueAddress}
                </p>
              )}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deliveryDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Delivery Date (Fridays Only) *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isLoading || isCalendarLoading}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>{isCalendarLoading ? "Loading dates..." : "Pick a date"}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={[
                        ...blockedDates,
                        { before: new Date(new Date().setHours(0, 0, 0, 0)) },
                        { dayOfWeek: [0, 1, 2, 3, 4, 6] }
                    ]}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the date you'd like the Infaq Balangs to be delivered. Deliveries are only available on Fridays.
              </FormDescription>
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
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoading}>
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

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message / Niat / On Behalf Of (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Any special requests, messages for recipients, your Niat, or if this is on behalf of someone not covered in 'Dedication Name'." className="resize-y" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="p-4 border rounded-md bg-secondary/30 space-y-1 mt-4">
            <div className="flex justify-between text-sm">
                <span>Balangs Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            {calculatedDeliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">${calculatedDeliveryFee.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-1 border-border" />
            <div className="flex justify-between text-lg font-bold text-primary">
                <span>Estimated Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
            </div>
        </div>

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="infaq-consent"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="infaq-consent" className="cursor-pointer">
                  By submitting this form, I consent to BalangConnect using my personal data to respond to my inquiry and process my request. My data will be handled in compliance with Singapore's PDPA. I acknowledge that BalangConnect will follow up by contacting me via WhatsApp/Email. *
                </Label>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={isLoading || currentQuantity < 1 || !form.formState.isValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Confirm Infaq Order <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
