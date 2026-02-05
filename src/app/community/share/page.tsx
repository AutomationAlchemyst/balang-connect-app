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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Send, Loader2, MessageSquarePlus, PenTool } from 'lucide-react';
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
    router.push('/community');
  }

  // Modern Coast Theme Constants
  const INPUT_STYLE = "input-coast h-12 text-brand-blue placeholder:text-brand-blue/30";
  const LABEL_STYLE = "font-display font-bold uppercase text-brand-blue text-sm ml-1";

  return (
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24">
      <div className="container mx-auto px-4">

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-4">
              <PenTool size={14} /> Write to us
            </div>
            <h1 className="text-coast-heading text-4xl md:text-5xl text-brand-blue">Share Your <span className="text-brand-cyan">Experience</span></h1>
          </div>

          <Card className="glass-panel-wet border-none shadow-2xl p-4 md:p-8">
            <CardHeader className="text-center pb-8 border-b border-brand-blue/5 mb-8">
              <CardTitle className="font-display font-black text-2xl text-brand-blue uppercase flex items-center justify-center gap-3">
                <MessageSquarePlus className="text-brand-cyan h-8 w-8" /> Tell Us Your Story
              </CardTitle>
              <CardDescription className="text-brand-blue/60 font-medium mt-2 max-w-md mx-auto">
                Share your experience with Balang Kepalang and become a part of our community stories.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_STYLE}>Your Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="E.G., SITI & AHMAD" className={INPUT_STYLE} {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage className="text-red-500 font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_STYLE}>Your Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="YOUR.EMAIL@EXAMPLE.COM" className={INPUT_STYLE} {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage className="text-red-500 font-bold text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL_STYLE}>Event Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="E.G., OUR WEDDING DAY" className={INPUT_STYLE} {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="story"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL_STYLE}>Your Story *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SHARE YOUR EXPERIENCE..."
                            className={`${INPUT_STYLE} h-40 pt-4 resize-none`}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL_STYLE}>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="HTTPS://EXAMPLE.COM/YOUR-IMAGE.JPG" className={INPUT_STYLE} {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription className="text-brand-blue/40 text-xs font-bold uppercase tracking-wide">Link to an image that captures your moment.</FormDescription>
                        <FormMessage className="text-red-500 font-bold text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="btn-coast-primary w-full h-14 text-lg shadow-lg"
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
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
