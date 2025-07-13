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
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center">
            <Trophy className="mr-3 h-7 w-7" />
            Community Leaderboard
        </CardTitle>
        <CardDescription>
            Recognizing our top contributors. Thank you for your immense generosity!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="all-time">All-Time</TabsTrigger>
          </TabsList>
          <TabsContent value="monthly" className="mt-4 space-y-4 min-h-[200px]">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              monthlyLeaders.map((user, index) => (
                <LeaderboardItem key={`monthly-${user.id}`} user={user} rank={index + 1} />
              ))
            )}
          </TabsContent>
          <TabsContent value="all-time" className="mt-4 space-y-4">
             {allTimeLeaders.map((user, index) => (
              <LeaderboardItem key={`alltime-${user.id}`} user={user} rank={index + 1} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
