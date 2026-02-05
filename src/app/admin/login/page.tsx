'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, this would involve a username/password form and API call.
    // For this prototype, we'll just redirect with a query parameter.
    router.push('/?admin=true');
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center py-12 px-4 selection:bg-[#0df2df]/20 selection:text-[#041F1C]">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px]" />
      </div>

      <Card className="w-full max-w-sm breezy-glass-static border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center flex flex-col items-center pt-10 pb-6">
          <div className="bg-[#0df2df]/20 p-4 rounded-3xl mb-6 shadow-sm">
            <LogIn className="h-8 w-8 text-[#09a093]" strokeWidth={2.5} />
          </div>
          <CardTitle className="font-black text-3xl text-[#041F1C] uppercase tracking-tighter">Admin <span className="breezy-text-gradient italic">Access</span></CardTitle>
          <CardDescription className="font-bold text-[#041F1C]/40 pt-2">Prototype Authentication</CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-12 space-y-8">
          <div className="bg-white/40 backdrop-blur-sm p-5 rounded-2xl border border-white/60">
            <p className="text-sm text-[#041F1C]/70 font-bold leading-relaxed text-center">
              This is a simulated login for demonstration purposes. Clicking the button will grant admin privileges for this session.
            </p>
          </div>
          <Button
            onClick={handleLogin}
            className="w-full h-14 breezy-btn-primary text-lg"
          >
            <LogIn className="mr-3 h-5 w-5" strokeWidth={3} />
            Enter Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
