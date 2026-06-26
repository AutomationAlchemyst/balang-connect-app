'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthChange, signOutAdmin } from '@/lib/auth';
import type { User } from 'firebase/auth';

interface AdminContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdminState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setIsAdminState(!!currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setIsAdmin = (value: boolean) => {
    if (!value) {
      signOutAdmin().catch((err) => {
        console.error('Failed to sign out from AdminContext:', err);
      });
    }
  };

  const value = { 
    user, 
    isAdmin, 
    loading, 
    setIsAdmin 
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
