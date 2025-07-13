
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
// import type { Metadata } from 'next'; // Metadata should be in a layout or server component

// This would typically be defined in layout.tsx or a parent, but for standalone page:
// export const metadata: Metadata = {
//   title: 'Share Your Story - BalangConnect',
//   description: 'Share your experience with BalangConnect and become a part of our community stories.',
// };


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
    <div className="space-y-8 max-w-2xl mx-auto">
      <SectionTitle>Share Your BalangConnect Experience</SectionTitle>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-primary">Tell Us Your Story</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Siti & Ahmad" {...field} disabled={isLoading} />
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
                    <FormLabel>Your Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} />
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
                    <FormLabel>Event Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Our Wedding Day, Office Gathering" {...field} disabled={isLoading} />
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
                    <FormLabel>Your Story</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with BalangConnect..."
                        className="resize-y min-h-[120px]"
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
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/your-image.jpg" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>Link to an image that captures your moment.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Your Story <Send className="ml-2 h-4 w-4" />
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
