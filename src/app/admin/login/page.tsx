'use client';

import { useRouter } from 'next/navigation';
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
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Access</CardTitle>
          <CardDescription>Prototype Admin Login</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            This is a simulated login for demonstration purposes. Clicking the button will grant admin privileges for this session.
          </p>
          <Button onClick={handleLogin} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            <LogIn className="mr-2 h-5 w-5" />
            Log In as Admin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
