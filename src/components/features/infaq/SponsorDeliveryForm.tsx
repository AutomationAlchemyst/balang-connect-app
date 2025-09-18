
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" ref={formRef} id="sponsor-form-actual">
         {isSponsoringExisting && form.getValues('mosqueName') && form.getValues('deliveryDate') ? (
            <Card className="bg-secondary/30">
                <CardHeader>
                    <CardTitle className="text-lg text-green-700">Sponsoring Specific Slot</CardTitle>
                    <CardDescription>You are sponsoring the delivery for the following slot. The details are pre-filled for you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm font-medium">
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
                      Select the Friday you'd like to sponsor the delivery for. The sponsorship will be assigned to a mosque in need on this date.
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
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-secondary/20">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="sponsor-anonymous"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="sponsor-anonymous">Sponsor Anonymously</FormLabel>
                <FormDescription>
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
              <FormLabel>Your Full Name (Sponsor) *</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} disabled={isLoading || isAnonymous} />
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
              <FormLabel>Your Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>For acknowledgment and contact.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Your contact number (for WhatsApp)" {...field} disabled={isLoading} />
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
                <FormLabel>How did you hear about us? (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Please select one" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {hearAboutUsOptions.map((option) => (
                        <SelectItem key={`sponsor-hear-${option}`} value={option}>
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

        <div className="p-4 border rounded-md bg-secondary/30 space-y-1 mt-4">
            <div className="flex justify-between text-lg font-bold text-primary items-center">
                <span className="flex items-center"><DollarSign className="mr-2 h-5 w-5"/>Sponsorship Amount:</span>
                <span>${SPONSORSHIP_AMOUNT.toFixed(2)}</span>
            </div>
             <p className="text-xs text-muted-foreground">This contribution helps cover the $25 delivery fee for Infaq Balangs to a mosque in need on the selected date.</p>
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
                  id="sponsor-consent"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label htmlFor="sponsor-consent" className="cursor-pointer">
                  By submitting this form, I consent to BalangConnect using my personal data for this sponsorship. My data will be handled in compliance with Singapore's PDPA. I acknowledge that BalangConnect may follow up by contacting me via WhatsApp/Email. *
                </Label>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        
        <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
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
