import SectionTitle from '@/components/ui/SectionTitle';
import StoryCard from '@/components/features/community/StoryCard';
import { mockCommunityStories } from '@/lib/data';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquarePlus, Heart, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import CommunityLeaderboard from '@/components/features/community/CommunityLeaderboard';

export const metadata: Metadata = {
  title: 'Community - BalangConnect',
  description: 'See your community impact, read heartwarming stories, and share your own BalangConnect experience!',
};

export default function CommunityPage() {
  return (
    <div className="bg-coast-gradient min-h-screen -mt-10 pt-16 pb-24">
      <div className="container mx-auto px-4 space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
           <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-brand-blue/10 px-4 py-1 rounded-full text-brand-blue/60 text-xs font-bold uppercase tracking-widest mb-2">
              <Heart size={14} /> Our Family
           </div>
           <h1 className="text-coast-heading text-5xl md:text-7xl drop-shadow-sm text-brand-blue">
             Community <span className="text-brand-cyan">Impact</span>
           </h1>
           <p className="text-xl text-brand-blue/70 font-medium leading-relaxed">
             See how your engagement makes a difference and helps us share joy. Your story matters to us.
           </p>
           <Button asChild className="btn-coast-primary h-12 px-8 shadow-lg">
             <Link href="/community/share">
               <MessageSquarePlus className="mr-2 h-5 w-5" /> Share Your Story
             </Link>
           </Button>
        </div>

        {/* Leaderboard Section */}
        <div className="glass-panel-wet p-8 md:p-12 rounded-[2.5rem] shadow-2xl bg-white/40 border-brand-blue/5">
           <div className="text-center mb-8">
              <h2 className="text-coast-heading text-3xl md:text-4xl text-brand-blue uppercase mb-2">Top Supporters</h2>
              <p className="text-brand-blue/60 max-w-lg mx-auto">
                 Recognizing those who help make our community initiatives possible through their generous support.
              </p>
           </div>
           <CommunityLeaderboard />
        </div>

        <div className="flex items-center justify-center gap-4 text-brand-blue/20">
           <div className="h-px bg-current flex-grow max-w-xs"></div>
           <Users size={24} />
           <div className="h-px bg-current flex-grow max-w-xs"></div>
        </div>

        {/* Stories Section */}
        <div>
          <div className="text-center mb-12">
             <h2 className="text-coast-heading text-4xl md:text-5xl text-brand-blue uppercase">Stories</h2>
          </div>
          
          {mockCommunityStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockCommunityStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/30 rounded-[2rem] border border-brand-blue/5">
              <p className="text-2xl font-display font-bold uppercase text-brand-blue/30">
                No stories yet
              </p>
              <p className="text-brand-blue/50 font-medium mt-2">Be the first to share your experience!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}