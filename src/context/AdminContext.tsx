'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

interface AdminContextType {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check sessionStorage first to persist across navigation
    const storedAdminState = sessionStorage.getItem('isAdmin');
    if (storedAdminState === 'true') {
      setIsAdmin(true);
      return;
    }

    // Check URL query parameter on initial load
    if (searchParams.get('admin') === 'true') {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
    }
  }, [searchParams]);

  const value = { isAdmin, setIsAdmin };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
