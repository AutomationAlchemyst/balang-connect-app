'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeaderboardItem from "./LeaderboardItem";
import { mockLeaderboardUsers } from "@/lib/data";
import { Trophy, Loader2 } from "lucide-react";
import type { LeaderboardUser } from '@/lib/types';

export default function CommunityLeaderboard() {
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // This is safe because the sorting logic is deterministic
  const allTimeLeaders = [...mockLeaderboardUsers].sort((a, b) => b.points - a.points);

  useEffect(() => {
    // This randomization now only runs on the client-side, after hydration, preventing the mismatch.
    const shuffledLeaders = [...mockLeaderboardUsers].sort(() => 0.5 - Math.random()).slice(0, 5);
    setMonthlyLeaders(shuffledLeaders);
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="w-full">
      <Tabs defaultValue="monthly" className="w-full">
        <div className="flex justify-center mb-6">
            <TabsList className="bg-brand-blue/5 p-1 rounded-full border border-brand-blue/10">
                <TabsTrigger value="monthly" className="rounded-full px-6 py-2 font-bold uppercase text-xs data-[state=active]:bg-brand-cyan data-[state=active]:text-white transition-all">This Month</TabsTrigger>
                <TabsTrigger value="all-time" className="rounded-full px-6 py-2 font-bold uppercase text-xs data-[state=active]:bg-brand-cyan data-[state=active]:text-white transition-all">All-Time</TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="monthly" className="space-y-3 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
            </div>
          ) : (
            monthlyLeaders.map((user, index) => (
              <div key={`monthly-${user.id}`} className="bg-white/50 hover:bg-white rounded-2xl p-4 flex items-center justify-between transition-all duration-300 border border-brand-blue/5 shadow-sm">
                 <LeaderboardItem user={user} rank={index + 1} />
              </div>
            ))
          )}
        </TabsContent>
        <TabsContent value="all-time" className="space-y-3">
           {allTimeLeaders.map((user, index) => (
            <div key={`alltime-${user.id}`} className="bg-white/50 hover:bg-white rounded-2xl p-4 flex items-center justify-between transition-all duration-300 border border-brand-blue/5 shadow-sm">
                <LeaderboardItem user={user} rank={index + 1} />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
