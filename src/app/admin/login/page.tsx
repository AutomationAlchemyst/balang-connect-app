'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { signInAdmin } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signInAdmin(values.email, values.password);
      toast({
        title: 'Welcome Back!',
        description: 'You have successfully signed in to the admin dashboard.',
      });
      router.push('/admin');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Invalid email or password. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later.';
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center py-12 px-4 selection:bg-[#0df2df]/20 selection:text-[#041F1C]">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-md breezy-glass-static border-0 shadow-2xl relative z-10 p-4">
        <CardHeader className="text-center flex flex-col items-center pt-8 pb-6">
          <div className="bg-[#0df2df]/20 p-4 rounded-3xl mb-4 shadow-sm">
            <LogIn className="h-8 w-8 text-[#09a093]" strokeWidth={2.5} />
          </div>
          <CardTitle className="font-black text-3xl text-[#041F1C] uppercase tracking-tighter">
            Admin <span className="breezy-text-gradient italic">Access</span>
          </CardTitle>
          <CardDescription className="font-bold text-[#041F1C]/40 pt-1">
            Secure Administrator Authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-[#041F1C]/60 pl-1">
                      Email Address
                    </FormLabel>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#041F1C]/40" />
                      <FormControl>
                        <Input
                          placeholder="admin@balangkepalang.com"
                          className="pl-12 breezy-input bg-white/50 border-white/80 rounded-2xl h-14"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs font-black uppercase text-white bg-red-600 px-2 py-1 inline-block mt-1 rounded-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="font-bold text-xs uppercase tracking-wider text-[#041F1C]/60 pl-1">
                      Password
                    </FormLabel>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#041F1C]/40" />
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 breezy-input bg-white/50 border-white/80 rounded-2xl h-14"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs font-black uppercase text-white bg-red-600 px-2 py-1 inline-block mt-1 rounded-sm" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-14 breezy-btn-primary text-lg mt-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-3 h-5 w-5" strokeWidth={3} />
                    Enter Dashboard
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
