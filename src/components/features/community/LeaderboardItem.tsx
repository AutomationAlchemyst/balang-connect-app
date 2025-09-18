import type { LeaderboardUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, ShieldCheck, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardItemProps {
  user: LeaderboardUser;
  rank: number;
}

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Crown className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Crown className="h-5 w-5 text-amber-700" />;
    return <span className="font-bold text-sm w-5 text-center">{rank}</span>;
}

const getBadgeIcon = (badgeName?: string) => {
    if (!badgeName) return null;
    if (badgeName.toLowerCase().includes('champion')) {
        return <Trophy className="h-3 w-3 mr-1" />;
    }
    if (badgeName.toLowerCase().includes('benefactor')) {
        return <ShieldCheck className="h-3 w-3 mr-1" />;
    }
    return null;
}

export default function LeaderboardItem({ user, rank }: LeaderboardItemProps) {
  const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={cn(
        "flex items-center gap-4 p-3 rounded-lg transition-colors",
        rank === 1 && "bg-yellow-500/10 border border-yellow-500/20",
        rank === 2 && "bg-gray-500/10",
        rank === 3 && "bg-amber-700/10",
    )}>
      <div className="flex items-center justify-center w-6 font-bold text-lg text-primary">
        {getRankIcon(rank)}
      </div>
      <Avatar>
         {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.dataAiHintAvatar || 'person portrait'} />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground">{userInitials}</AvatarFallback>
          )}
      </Avatar>
      <div className="flex-grow">
        <p className="font-semibold">{user.name}</p>
        {user.badge && (
            <Badge variant="secondary" className="mt-1 text-xs">
                {getBadgeIcon(user.badge)}
                {user.badge}
            </Badge>
        )}
      </div>
      <div className="text-right">
        <p className="font-bold text-primary">{user.points.toLocaleString()} PTS</p>
      </div>
    </div>
  );
}
