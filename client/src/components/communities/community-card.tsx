import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Shield, Lock } from "lucide-react";
import type { CommunityWithDetails } from "@shared/schema";

interface CommunityCardProps {
  community: CommunityWithDetails;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  isJoining?: boolean;
}

export function CommunityCard({ community, onJoin, onLeave, isJoining }: CommunityCardProps) {
  const getMembershipBadge = () => {
    if (community.membershipRole === 'admin') return { text: 'Admin', variant: 'destructive' as const };
    if (community.membershipRole === 'moderator') return { text: 'Moderator', variant: 'secondary' as const };
    if (community.membershipRole === 'member') return { text: 'Member', variant: 'default' as const };
    return null;
  };

  const badge = getMembershipBadge();

  return (
    <Card 
      className="group relative overflow-hidden border-cyan-400/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 hover:border-cyan-400/40"
      data-testid={`card-community-${community.id}`}
    >
      {/* Cover Image Background */}
      {community.coverImage && (
        <div 
          className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30"
          style={{
            backgroundImage: `url(${community.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 border-2 border-cyan-400/30">
              <AvatarImage 
                src={community.avatar} 
                alt={community.displayName}
                data-testid={`img-avatar-${community.id}`}
              />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-lg font-bold">
                {community.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white truncate" data-testid={`text-name-${community.id}`}>
                {community.displayName}
              </h3>
              <p className="text-sm text-cyan-300/80" data-testid={`text-creator-${community.id}`}>
                by @{community.creator.username}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {community.isPrivate && (
              <Lock className="w-4 h-4 text-yellow-400" data-testid="icon-private" />
            )}
            {badge && (
              <Badge variant={badge.variant} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pb-4">
        {community.description && (
          <p 
            className="text-cyan-100/90 text-sm mb-4 line-clamp-2"
            data-testid={`text-description-${community.id}`}
          >
            {community.description}
          </p>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-cyan-300/80">
          <div className="flex items-center space-x-1" data-testid={`text-members-${community.id}`}>
            <Users className="w-4 h-4" />
            <span>{community.membersCount.toLocaleString()} members</span>
          </div>
          <div className="flex items-center space-x-1" data-testid={`text-posts-${community.id}`}>
            <MessageSquare className="w-4 h-4" />
            <span>{community.postsCount.toLocaleString()} posts</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="relative z-10 pt-2">
        {community.isMember ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLeave?.(community.id)}
            disabled={isJoining}
            className="w-full border-red-400/30 text-red-400 hover:bg-red-400/10 hover:border-red-400/50"
            data-testid={`button-leave-${community.id}`}
          >
            {community.membershipRole === 'admin' ? 'Manage' : 'Leave Community'}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onJoin?.(community.id)}
            disabled={isJoining}
            className="w-full border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/50"
            data-testid={`button-join-${community.id}`}
          >
            {community.requiresApproval ? 'Request to Join' : 'Join Community'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}