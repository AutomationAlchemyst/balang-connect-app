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
  title: 'Community - Balang Kepalang',
  description: 'See your community impact, read heartwarming stories, and share your own Balang Kepalang experience!',
};

export default function CommunityPage() {
  return (
    <div className="relative min-h-screen bg-slate-50 selection:bg-[#0df2df]/20 selection:text-[#041F1C] pb-20">

      {/* Breezy Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#0df2df]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-[#0bc9b9]/10 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[10%] w-[700px] h-[700px] bg-[#0df2df]/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-24 space-y-16">

        {/* HEADER - Inspired by Breezy Balang Forms */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-xl px-6 py-2 rounded-full border border-white/60 shadow-lg mb-4">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0df2df] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0bc9b9]"></span>
            </span>
            <span className="font-black text-[10px] uppercase tracking-[0.3em] text-[#041F1C]">Our Community Family</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black uppercase text-[#041F1C] tracking-tighter leading-[0.85] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Joyful <br className="md:hidden" />
            <span className="breezy-text-gradient italic">Impact</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-[#041F1C]/60 font-bold animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            See how your engagement makes a difference and helps us share refreshing joy. Your story is part of our paradise.
          </p>
          <div className="pt-4">
            <Button asChild className="breezy-btn-primary h-14 px-10 shadow-xl">
              <Link href="/community/share" className="flex items-center gap-2">
                <MessageSquarePlus className="h-5 w-5" /> Share Your Story
              </Link>
            </Button>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="breezy-glass p-8 md:p-12">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl font-black uppercase text-[#041F1C] tracking-tighter">Top Supporters</h2>
            <p className="text-lg text-[#041F1C]/60 font-bold max-w-xl mx-auto">
              Recognizing those who help make our community initiatives possible.
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