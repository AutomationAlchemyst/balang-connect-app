'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!loading) {
      if (!isAdmin && !isLoginPage) {
        // Not logged in and trying to access admin pages -> redirect to login
        router.push('/admin/login');
      } else if (isAdmin && isLoginPage) {
        // Logged in and trying to access login page -> redirect to admin dashboard
        router.push('/admin');
      }
    }
  }, [isAdmin, loading, isLoginPage, router]);

  // Show a loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0df2df]/5 selection:bg-[#0df2df]/20 selection:text-[#041F1C]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-[#09a093] animate-spin" strokeWidth={2.5} />
          <p className="text-[#041F1C]/60 font-black uppercase tracking-widest text-sm animate-pulse">
            Verifying Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in and not on login page, render nothing while redirecting
  if (!isAdmin && !isLoginPage) {
    return null;
  }

  // If logged in and on login page, render nothing while redirecting to dashboard
  if (isAdmin && isLoginPage) {
    return null;
  }

  return <>{children}</>;
}
