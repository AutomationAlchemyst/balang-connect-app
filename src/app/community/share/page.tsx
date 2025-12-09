'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import SectionTitle from '@/components/ui/SectionTitle';
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Loader2, MessageSquarePlus } from 'lucide-react';
import { useState } from 'react';

const storyFormSchema = z.object({
  userName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  email: z.string().email({ message: "Please enter a valid email address." }),
  eventName: z.string().optional(),
  story: z.string().min(20, { message: "Story must be at least 20 characters." }).max(1000),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
});

export default function ShareStoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof storyFormSchema>>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      userName: '',
      email: '',
      eventName: '',
      story: '',
      imageUrl: '',
    },
  });

  async function onSubmit(values: z.infer<typeof storyFormSchema>) {
    setIsLoading(true);
    console.log('Community Story Submitted:', values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    toast({
      title: 'Story Submitted!',
      description: `Thank you, ${values.userName}, for sharing your story. It will be reviewed and posted soon.`,
    });
    form.reset();
    setIsLoading(false);
    router.push('/community'); // Redirect to community page after submission
  }

  return (
    <div className="space-y-12 max-w-2xl mx-auto pb-12">
      <SectionTitle>Share Your Experience</SectionTitle>
      
      <Card>
        <CardHeader className="bg-brand-cyan border-b-4 border-black">
          <CardTitle className="flex items-center text-2xl">
             <MessageSquarePlus className="mr-3 h-8 w-8 text-black" strokeWidth={2.5} /> Tell Us Your Story
          </CardTitle>
          <CardDescription className="text-black font-medium mt-2">
             Share your experience with BalangConnect and become a part of our community stories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase">Your Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="E.G., SITI & AHMAD" {...field} disabled={isLoading} />
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
                    <FormLabel className="font-bold uppercase">Your Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="YOUR.EMAIL@EXAMPLE.COM" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Used for verification, will not be publicly displayed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase">Event Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.G., OUR WEDDING DAY" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="story"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase">Your Story *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="SHARE YOUR EXPERIENCE..."
                        className="resize-y"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold uppercase">Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="HTTPS://EXAMPLE.COM/YOUR-IMAGE.JPG" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Link to an image that captures your moment.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-brand-green text-white hover:bg-[#329A00] h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Your Story <Send className="ml-2 h-5 w-5" strokeWidth={2.5} />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}