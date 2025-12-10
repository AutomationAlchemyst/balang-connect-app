import Image from 'next/image';
import type { CommunityStory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin, Quote } from 'lucide-react';
import { format } from 'date-fns';

interface StoryCardProps {
  story: CommunityStory;
}

export default function StoryCard({ story }: StoryCardProps) {
  const userInitials = story.userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="glass-panel-wet border-none overflow-hidden h-full flex flex-col group hover:scale-[1.01] transition-transform duration-300">
      {story.imageUrl && (
        <div className="relative w-full h-56 overflow-hidden">
          <Image
            src={story.imageUrl}
            alt={`Story from ${story.userName}`}
            width={400}
            height={300}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint="community gathering"
          />
          <div className="absolute inset-0 bg-brand-blue/10 mix-blend-multiply transition-opacity group-hover:opacity-0"></div>
        </div>
      )}
      
      <CardHeader className="relative z-10 -mt-8 pt-0 px-6 pb-0">
        <div className="flex items-end space-x-3 mb-4">
          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
            {story.avatarUrl ? (
              <AvatarImage src={story.avatarUrl} alt={story.userName} data-ai-hint="person avatar" />
            ) : (
              <AvatarFallback className="bg-brand-yellow text-brand-blue font-bold text-xl">{userInitials}</AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div>
           <CardTitle className="font-display font-black text-xl text-brand-blue uppercase leading-none mb-1">
             {story.userName}
           </CardTitle>
           <CardDescription className="text-brand-blue/50 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <CalendarDays size={12} /> {format(new Date(story.date), 'PPP')}
           </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-6 pt-4 space-y-4">
        {story.eventName && (
          <div className="inline-flex items-center gap-1.5 bg-brand-cyan/10 text-brand-cyan px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide">
             <MapPin size={12} /> {story.eventName}
          </div>
        )}
        
        <div className="relative">
           <Quote className="absolute -top-2 -left-2 text-brand-blue/5 w-8 h-8 fill-current transform -scale-x-100" />
           <p className="text-brand-blue/80 font-medium italic leading-relaxed relative z-10 pl-2">
             "{story.story}"
           </p>
        </div>
      </CardContent>
    </Card>
  );
}