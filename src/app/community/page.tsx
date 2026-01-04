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
    <div className="relative min-h-screen bg-slate-50 selection:bg-teal-100 selection:text-teal-900 pb-20">

      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob" />
        <div className="absolute top-[20%] left-[-10%] w-[400px] h-[400px] bg-emerald-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-3xl opacity-50 mix-blend-multiply animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 space-y-16">

        {/* Header */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/40 shadow-sm">
            <Heart size={14} className="text-teal-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-800">Our Family</span>
          </div>

          <h1 className="font-black text-5xl md:text-7xl uppercase leading-[0.85] tracking-tighter text-slate-900 drop-shadow-sm">
            Community <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-emerald-600">Impact</span>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            See how your engagement makes a difference and helps us share joy. Your story matters to us.
          </p>

          <Button asChild className="btn-coast-primary h-12 px-8 shadow-lg">
            <Link href="/community/share">
              <MessageSquarePlus className="mr-2 h-5 w-5" /> Share Your Story
            </Link>
          </Button>
        </div>

        {/* Leaderboard Section */}
        <div className="glass-panel-wet p-8 md:p-12">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black uppercase text-slate-900 tracking-tight">Top Supporters</h2>
            <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
              Recognizing those who help make our community initiatives possible through their generous support.
            </p>
          </div>
          <CommunityLeaderboard />
        </div>

        <div className="flex items-center justify-center gap-4 text-slate-300 py-8">
          <div className="h-px bg-current flex-grow max-w-[100px] rounded-full"></div>
          <Users size={20} />
          <div className="h-px bg-current flex-grow max-w-[100px] rounded-full"></div>
        </div>

        {/* Stories Section */}
        <div>
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase text-slate-900 tracking-tight">Stories</h2>
          </div>

          {mockCommunityStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockCommunityStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="glass-panel-static p-20 text-center">
              <p className="text-2xl font-black uppercase text-slate-300 tracking-widest">
                No stories yet
              </p>
              <p className="text-slate-400 font-medium mt-2">Be the first to share your experience!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}