
import Image from 'next/image';
import type { CommunityStory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface StoryCardProps {
  story: CommunityStory;
}

export default function StoryCard({ story }: StoryCardProps) {
  const userInitials = story.userName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      {story.imageUrl && (
        <div className="w-full h-56">
          <Image
            src={story.imageUrl}
            alt={`Story from ${story.userName}`}
            width={350}
            height={250}
            className="w-full h-full object-cover"
            data-ai-hint="community gathering"
          />
        </div>
      )}
      <CardHeader className="flex-grow">
        <div className="flex items-center space-x-3 mb-2">
          <Avatar>
            {story.avatarUrl ? (
              <AvatarImage src={story.avatarUrl} alt={story.userName} data-ai-hint="person avatar" />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle className="font-headline text-xl text-primary">{story.userName}</CardTitle>
            <CardDescription className="text-xs">
              Shared on: {format(new Date(story.date), 'PPP')}
            </CardDescription>
          </div>
        </div>
        {story.eventName && (
          <p className="text-sm text-accent font-semibold flex items-center">
            <MapPin size={14} className="mr-1" /> Event: {story.eventName}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground italic">"{story.story}"</p>
      </CardContent>
      {/* CardFooter can be used for actions like 'Read More' if stories are truncated */}
      {/* <CardFooter>
        <Button variant="link" className="p-0 h-auto text-primary">Read full story</Button>
      </CardFooter> */}
    </Card>
  );
}
