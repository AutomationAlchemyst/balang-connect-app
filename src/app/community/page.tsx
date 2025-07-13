
import SectionTitle from '@/components/ui/SectionTitle';
import StoryCard from '@/components/features/community/StoryCard';
import { mockCommunityStories } from '@/lib/data';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquarePlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommunityLeaderboard from '@/components/features/community/CommunityLeaderboard';

export const metadata: Metadata = {
  title: 'Community - BalangConnect',
  description: 'See your community impact, read heartwarming stories, and share your own BalangConnect experience!',
};

export default function CommunityPage() {
  return (
    <div className="space-y-12">
      {/* Simplified Header Section */}
      <div className="text-center">
        <SectionTitle>Your Community Impact</SectionTitle>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          See how your engagement makes a difference and helps us share joy with others. Your story matters.
        </p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href="/community/share">
            <MessageSquarePlus className="mr-2 h-5 w-5" /> Share Your Story
          </Link>
        </Button>
      </div>

      <Separator />

      <div>
        <SectionTitle>Community Leaderboard</SectionTitle>
        <p className="text-center text-muted-foreground -mt-4 mb-8 max-w-2xl mx-auto">
          Recognizing our top supporters who help make our community initiatives possible through their event bookings and engagement.
        </p>
        <CommunityLeaderboard />
      </div>

      <Separator />

      <div>
        <SectionTitle>Heartwarming Community Stories</SectionTitle>
        {mockCommunityStories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCommunityStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-xl py-10">
            No community stories shared yet. Be the first to share your experience!
          </p>
        )}
      </div>
    </div>
  );
}
