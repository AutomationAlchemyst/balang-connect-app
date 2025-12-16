
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
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { CalendarIcon, Send, Loader2, DollarSign } from 'lucide-react';
import { format, parseISO } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import type { InfaqOrder } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { hearAboutUsOptions } from './InfaqForm'; 
import { submitInfaqContribution } from '@/app/infaq/actions';
import { getBlockedDates } from '@/app/admin/manage-dates/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';


const SPONSORSHIP_AMOUNT = 25.00;

const sponsorDeliveryFormSchema = z.object({
  donorName: z.string().min(2, { message: 'Donor name must be at least 2 characters.' }).max(50),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(8, { message: 'Please enter a valid phone number.' }).optional().or(z.literal('')),
  deliveryDate: z.date({ required_error: "Please select a delivery date." }),
  anonymous: z.boolean().default(false).optional(),
  howHeard: z.string().optional(),
  consent: z.boolean().refine(val => val === true, { message: "You must agree to the terms to submit." }),
  targetSlotId: z.string().optional(),
  mosqueName: z.string().optional(),
});

export default function SponsorDeliveryForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [isCalendarLoading, setIsCalendarLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSponsoringExisting, setIsSponsoringExisting] = useState(false);

  useEffect(() => {
      const fetchBlockedDates = async () => {
          setIsCalendarLoading(true);
          const dates = await getBlockedDates();
          setBlockedDates(dates.map(d => d.date));
          setIsCalendarLoading(false);
      };
      fetchBlockedDates();
  }, []);

  const form = useForm<z.infer<typeof sponsorDeliveryFormSchema>>({
    resolver: zodResolver(sponsorDeliveryFormSchema),
    defaultValues: {
      donorName: '',
      email: '',
      phone: '',
      deliveryDate: undefined,
      anonymous: false,
      howHeard: undefined,
      consent: false,
      targetSlotId: undefined,
      mosqueName: undefined,
    },
  });

  useEffect(() => {
    const mosqueNameParam = searchParams.get('mosqueName');
    const deliveryDateParam = searchParams.get('deliveryDate'); // "YYYY-MM-DD"
    const targetSlotIdParam = searchParams.get('targetSlotId');

    if (mosqueNameParam && deliveryDateParam && targetSlotIdParam) {
      form.setValue('mosqueName', mosqueNameParam);
      form.setValue('targetSlotId', targetSlotIdParam);
      
      const date = parseISO(deliveryDateParam); // Correctly parses YYYY-MM-DD
      form.setValue('deliveryDate', date, { shouldValidate: true });
      
      setIsSponsoringExisting(true);
      
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('mosqueName');
      currentUrl.searchParams.delete('deliveryDate');
      currentUrl.searchParams.delete('targetSlotId');
      router.replace(currentUrl.pathname + currentUrl.search + window.location.hash, { scroll: false });
      
      if (window.location.hash === '#sponsor-form-actual' && formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

    } else {
      setIsSponsoringExisting(false);
    }
  }, [searchParams, form, router]);

  const isAnonymous = form.watch('anonymous');

  useEffect(() => {
    if (isAnonymous) {
      form.setValue('donorName', 'Anonymous Sponsor');
    } else {
      if (form.getValues('donorName') === 'Anonymous Sponsor') {
        form.setValue('donorName', '');
      }
    }
  }, [isAnonymous, form]);

  async function onSubmit(values: z.infer<typeof sponsorDeliveryFormSchema>) {
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
      deliveryDate: format(values.deliveryDate, 'yyyy-MM-dd'),
      deliveryDisplayDate: format(values.deliveryDate, "PPP"),
      quantity: 0, 
      pricePerBalang: 0,
      calculatedSubtotal: 0,
      deliveryFee: SPONSORSHIP_AMOUNT,
      calculatedTotal: SPONSORSHIP_AMOUNT,
      orderType: 'delivery_sponsorship', 
      mosqueName: values.mosqueName, 
      mosqueAddress: undefined,
    };
    
    const result = await submitInfaqContribution(orderData);

    if (result.success) {
      toast({
        title: 'Delivery Sponsorship Submitted!',
        description: `Thank you, ${values.anonymous ? 'Anonymous Sponsor' : values.donorName}! Your $${SPONSORSHIP_AMOUNT.toFixed(2)} Jumaat delivery sponsorship for ${format(values.deliveryDate, "PPP")} has been received. This will be assigned to a mosque in need. We will contact you for confirmation. Slot ID: ${result.slotId}`,
        variant: 'default',
        duration: 10000,
      });
      form.reset({
        donorName: '',
        email: '',
        phone: '',
        deliveryDate: undefined,
        anonymous: false,
        howHeard: undefined,
        consent: false,
        targetSlotId: undefined,
        mosqueName: undefined,
      });
      setIsSponsoringExisting(false);
    } else {
       toast({
        title: 'Sponsorship Submission Failed',
        description: result.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }

  // Modern Coast Constants
  const INPUT_STYLE = "input-coast h-12 text-brand-blue placeholder:text-brand-blue/30";
  const LABEL_STYLE = "font-display font-bold uppercase text-brand-blue text-sm ml-1 mb-1 block";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" ref={formRef} id="sponsor-form-actual">
         {isSponsoringExisting && form.getValues('mosqueName') && form.getValues('deliveryDate') ? (
            <Card className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-brand-blue uppercase font-bold">Sponsoring Specific Slot</CardTitle>
                    <CardDescription className="text-brand-blue/60 text-xs">You are sponsoring the delivery for the following slot. The details are pre-filled for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm font-medium text-brand-blue/80">
                    <p><strong>Mosque:</strong> {form.getValues('mosqueName')}</p>
                    <p><strong>Date:</strong> {format(form.getValues('deliveryDate')!, "PPP")}</p>
                </CardContent>
            </Card>
        ) : (
             <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className={LABEL_STYLE}>Preferred Delivery Date (Fridays Only) *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                              INPUT_STYLE
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
                      <PopoverContent className="w-auto p-0 glass-panel-static border-none" align="start">
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
                          classNames={{
                            head_cell: "text-brand-blue font-bold uppercase text-xs pt-4",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-brand-cyan/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-brand-cyan/20 hover:font-bold hover:rounded-full transition-all text-brand-blue",
                            day_selected: "bg-brand-cyan text-brand-blue font-bold rounded-full shadow-lg shadow-cyan-500/30",
                            day_today: "bg-gray-100 text-brand-blue font-bold rounded-full",
                        }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs text-brand-blue/40">
                      Select the Friday you'd like to sponsor the delivery for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
        )}
        <FormField
          control={form.control}
          name="anonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-2xl border border-brand-blue/10 p-4 shadow-sm bg-white/60">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="sponsor-anonymous"
                  className="border-brand-blue/30 text-brand-cyan data-[state=checked]:bg-brand-cyan data-[state=checked]:text-white rounded"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="sponsor-anonymous" className="font-bold text-brand-blue cursor-pointer">Sponsor Anonymously</FormLabel>
                <FormDescription className="text-brand-blue/50 text-xs">
                  Your name will be recorded as 'Anonymous Sponsor'.
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
              <FormLabel className={LABEL_STYLE}>Your Full Name (Sponsor) *</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} disabled={isLoading || isAnonymous} className={INPUT_STYLE} />
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
              <FormLabel className={LABEL_STYLE}>Your Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} className={INPUT_STYLE} />
              </FormControl>
              <FormDescription className="text-xs text-brand-blue/40">For acknowledgment and contact.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={LABEL_STYLE}>Your Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your contact number (for WhatsApp)" {...field} disabled={isLoading} className={INPUT_STYLE} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isSponsoringExisting && (
            <FormField
            control={form.control}
            name="howHeard"
            render={({ field }) => (
                <FormItem>
                <FormLabel className={LABEL_STYLE}>How did you hear about us? (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                    <SelectTrigger className={INPUT_STYLE}>
                        <SelectValue placeholder="Please select one" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent className="glass-panel-static border-none">
                    {hearAboutUsOptions.map((option) => (
                        <SelectItem key={`sponsor-hear-${option}`} value={option} className="focus:bg-brand-cyan/20 cursor-pointer">
                        {option}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        )}

        <div className="p-6 rounded-2xl bg-green-50 border border-green-100 space-y-1 mt-4">
            <div className="flex justify-between text-lg font-bold text-green-700 items-center">
                <span className="flex items-center uppercase tracking-tight"><DollarSign className="mr-2 h-5 w-5"/>Sponsorship Amount:</span>
                <span>${SPONSORSHIP_AMOUNT.toFixed(2)}</span>
            </div>
             <p className="text-xs text-green-600/70 font-medium">This contribution helps cover the $25 delivery fee for Infaq Balangs to a mosque in need on the selected date.</p>
        </div>

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-brand-blue/10 p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="sponsor-consent"
                  className="border-brand-blue/30 text-brand-cyan data-[state=checked]:bg-brand-cyan data-[state=checked]:text-white rounded mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="sponsor-consent" className="cursor-pointer text-sm text-brand-blue/80 font-medium leading-snug block">
                  By submitting this form, I consent to BalangConnect using my personal data for this sponsorship. My data will be handled in compliance with Singapore's PDPA. I acknowledge that BalangConnect may follow up by contacting me via WhatsApp/Email. *
                </Label>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full font-bold uppercase tracking-wide h-12 shadow-lg"
            disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Sponsor Delivery Fee <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
