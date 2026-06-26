'use client';

import { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { signOutAdmin } from '@/lib/auth';
import { Loader2, LogOut, Calendar, Snowflake, ShieldAlert, Award, FileText, Settings, Sparkles } from 'lucide-react';
import DateManager from '@/components/features/admin/DateManager';
import FlavorManager from '@/components/features/admin/FlavorManager';
import PackageManager from '@/components/features/admin/PackageManager';
import AddonManager from '@/components/features/admin/AddonManager';
import PromotionManager from '@/components/features/admin/PromotionManager';

export default function AdminDashboardPage() {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dates');

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      router.push('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-[#102022]">
        <Loader2 className="h-8 w-8 animate-spin text-[#0df2df]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#102022] pb-24 overflow-x-hidden pt-20">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 space-y-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/40 dark:bg-[#102221]/40 backdrop-blur-xl border border-white/60 dark:border-white/10 p-6 md:p-8 rounded-[2.5rem] shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#041F1C]/5 dark:bg-white/10 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/5">
              <Sparkles className="h-3 w-3 text-[#0df2df]" />
              <span className="font-black text-[10px] uppercase tracking-[0.2em] text-[#041F1C] dark:text-white">BalangConnect System</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase text-[#041F1C] dark:text-white tracking-tighter leading-none">
              Admin <span className="breezy-text-gradient italic">Dashboard</span>
            </h1>
          </div>

          <Button
            onClick={handleSignOut}
            variant="outline"
            className="rounded-2xl border-red-200 hover:border-red-400 bg-white/60 dark:bg-black/20 text-[#041F1C] dark:text-white hover:text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-xs h-12 transition-all duration-300 flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>

        {/* Tabbed Navigation Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="bg-white/50 dark:bg-[#102221]/50 backdrop-blur-md border border-white/80 dark:border-white/5 p-2 rounded-[2rem] shadow-md max-w-4xl mx-auto">
            <TabsList className="grid grid-cols-5 gap-1 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="dates"
                className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#0df2df] data-[state=active]:text-[#041F1C] data-[state=active]:shadow-lg"
              >
                <Calendar className="mr-2 h-4 w-4 hidden md:inline" />
                Dates
              </TabsTrigger>
              <TabsTrigger
                value="flavors"
                className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#0df2df] data-[state=active]:text-[#041F1C] data-[state=active]:shadow-lg"
              >
                <Snowflake className="mr-2 h-4 w-4 hidden md:inline" />
                Flavors
              </TabsTrigger>
              <TabsTrigger
                value="packages"
                className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#0df2df] data-[state=active]:text-[#041F1C] data-[state=active]:shadow-lg"
              >
                <ShieldAlert className="mr-2 h-4 w-4 hidden md:inline" />
                Packages
              </TabsTrigger>
              <TabsTrigger
                value="addons"
                className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#0df2df] data-[state=active]:text-[#041F1C] data-[state=active]:shadow-lg"
              >
                <Settings className="mr-2 h-4 w-4 hidden md:inline" />
                Add-ons
              </TabsTrigger>
              <TabsTrigger
                value="promotions"
                className="rounded-2xl py-3 text-xs font-black uppercase tracking-wider transition-all data-[state=active]:bg-[#0df2df] data-[state=active]:text-[#041F1C] data-[state=active]:shadow-lg"
              >
                <FileText className="mr-2 h-4 w-4 hidden md:inline" />
                Promotions
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white/30 dark:bg-[#102221]/30 backdrop-blur-xl border border-white/60 dark:border-white/5 p-8 rounded-[2.5rem] shadow-2xl min-h-[400px]">
            <TabsContent value="dates" className="mt-0 focus-visible:outline-none">
              <DateManager />
            </TabsContent>
            <TabsContent value="flavors" className="mt-0 focus-visible:outline-none">
              <FlavorManager />
            </TabsContent>
            <TabsContent value="packages" className="mt-0 focus-visible:outline-none">
              <PackageManager />
            </TabsContent>
            <TabsContent value="addons" className="mt-0 focus-visible:outline-none">
              <AddonManager />
            </TabsContent>
            <TabsContent value="promotions" className="mt-0 focus-visible:outline-none">
              <PromotionManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
