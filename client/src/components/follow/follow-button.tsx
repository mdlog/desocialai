import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserCheck } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface FollowButtonProps {
  userId: string;
  currentUserId?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function FollowButton({ userId, currentUserId, className, size = "sm" }: FollowButtonProps) {
  // Don't show follow button for own profile - check this before any hooks
  if (!currentUserId || currentUserId === userId) {
    return null;
  }

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if already following
  const { data: followStatus, isLoading } = useQuery({
    queryKey: ["/api/follows/check", userId],
    queryFn: async () => {
      const response = await fetch(`/api/follows/check/${userId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to check follow status");
      }
      return response.json();
    },
  });

  const isFollowing = followStatus?.isFollowing || false;

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await apiRequest("DELETE", `/api/follows/${userId}`);
      } else {
        await apiRequest("POST", "/api/follows", { followingId: userId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follows/check", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing 
          ? "You are no longer following this user" 
          : "You are now following this user",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        size={size}
        disabled 
        className={className}
        data-testid={`button-follow-loading-${userId}`}
      >
        ...
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "secondary" : "outline"}
      size={size}
      onClick={() => followMutation.mutate()}
      disabled={followMutation.isPending}
      className={`${className} ${isFollowing ? 'text-muted-foreground' : 'text-primary'}`}
      data-testid={`button-follow-${userId}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-3 h-3 mr-1" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="w-3 h-3 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
}