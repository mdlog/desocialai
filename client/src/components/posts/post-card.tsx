import { Heart, MessageCircle, Share, Bookmark, Shield, Database, ExternalLink, RefreshCw, Send } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BlockchainVerification } from "@/components/blockchain-verification";
import { useAuth } from "@/hooks/use-auth";
import { FollowButton } from "@/components/follow/follow-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { PostWithAuthor } from "@shared/schema";
import { useState, useMemo, memo } from "react";

// Helper function for formatting file sizes correctly
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function for formatting time - moved outside component for performance
function formatTimeAgo(date: Date | null): string {
  if (!date) return "now";
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "now";
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Helper function for avatar class - moved outside component for performance
function getAvatarClass(userId: string): string {
  const classes = [
    "avatar-gradient-1",
    "avatar-gradient-2",
    "avatar-gradient-3",
    "avatar-gradient-4"
  ];
  return classes[userId.charCodeAt(userId.length - 1) % classes.length];
}

// Progressive Image Loading Component
function ProgressiveImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      {imageLoading && !imageError && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      {!imageError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`${className} transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
          {...props}
        />
      ) : (
        <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
          <span className="text-gray-500 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

// Progressive Video Loading Component
function ProgressiveVideo({ src, className, ...props }: React.VideoHTMLAttributes<HTMLVideoElement>) {
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative">
      {videoLoading && !videoError && (
        <Skeleton className={`absolute inset-0 ${className}`} />
      )}
      {!videoError ? (
        <video
          src={src}
          className={`${className} transition-opacity duration-300 ${videoLoading ? 'opacity-0' : 'opacity-100'
            }`}
          onLoadedData={() => setVideoLoading(false)}
          onError={() => {
            setVideoLoading(false);
            setVideoError(true);
          }}
          {...props}
        />
      ) : (
        <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
          <span className="text-gray-500 text-sm">Failed to load video</span>
        </div>
      )}
    </div>
  );
}

interface PostCardProps {
  post: PostWithAuthor;
}

function PostCardBase({ post }: PostCardProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Fetch comments when showComments is true
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["/api/posts", post.id, "comments"],
    queryFn: async () => {
      console.log('[DEBUG] Fetching comments for post:', post.id);
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('[DEBUG] Received comments data:', data);
      return data;
    },
    enabled: showComments,
  });

  // Debug log when comments change
  console.log('[DEBUG Frontend] Comments data:', comments);

  // Manual retry mutation for 0G Storage uploads
  const retryStorageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/retry-storage`);
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Retry successful",
        description: data?.message || "0G Storage upload verified and updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: any) => {
      // Parse error message from API
      let errorMessage = "Could not initiate storage retry";

      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If JSON parsing fails, use the error message directly
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Retry failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.isLiked) {
        await apiRequest("DELETE", `/api/likes/${post.id}`);
      } else {
        await apiRequest("POST", "/api/likes", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post.isLiked ? "Like removed" : "Post liked!",
        description: post.isLiked ? "Your like has been removed" : "Like recorded on 0G DA layer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Like failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const repostMutation = useMutation({
    mutationFn: async () => {
      if (post.isReposted) {
        await apiRequest("DELETE", `/api/reposts/${post.id}`);
      } else {
        await apiRequest("POST", "/api/reposts", { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: post.isReposted ? "Repost removed" : "Post reposted",
        description: post.isReposted ? "Your repost has been removed" : "Post shared and recorded on 0G DA layer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Repost failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/comments", {
        postId: post.id,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      setCommentText("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been recorded on 0G DA layer",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Comment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Memoize expensive calculations
  const timeAgo = useMemo(() => formatTimeAgo(post.createdAt), [post.createdAt]);
  const avatarClass = useMemo(() => getAvatarClass(post.author?.id || ''), [post.author?.id]);

  // Handle profile navigation
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (post.author?.username) {
      setLocation(`/profile/${post.author.username}`);
    }
  };

  return (
    <Card className="modern-card card-hover">
      <CardContent className="p-6">
        <article className="flex space-x-4">
          <Avatar
            className="w-12 h-12 flex-shrink-0 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all hover:scale-105"
            onClick={handleProfileClick}
            title={`View ${post.author?.displayName || "Unknown User"}'s profile`}
          >
            <AvatarImage
              src={post.author?.avatar ? `${window.location.origin}${post.author.avatar}` : ""}
              alt={post.author?.displayName || "User"}
              className="object-cover"
              loading="lazy"
            />
            <AvatarFallback className="gradient-brand text-white font-semibold text-sm">
              {(post.author?.displayName || "U").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <h4
                  className="font-semibold text-foreground text-base truncate cursor-pointer hover:text-primary transition-colors hover:underline"
                  onClick={handleProfileClick}
                  title={`View ${post.author?.displayName || "Unknown User"}'s profile`}
                >
                  {post.author?.displayName || "Unknown User"}
                </h4>
                <span
                  className="text-muted-foreground text-sm truncate cursor-pointer hover:text-primary transition-colors hover:underline"
                  onClick={handleProfileClick}
                  title={`View @${post.author?.username || "unknown"}'s profile`}
                >
                  @{post.author?.username || "unknown"}
                </span>
                {post.author?.isVerified && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                    <Shield className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-muted-foreground text-sm">{timeAgo}</span>
                {post.isAiRecommended && (
                  <span className="modern-badge bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    AI Enhanced
                  </span>
                )}
              </div>
              {/* Follow Button */}
              {post.author && post.author.id && (
                <FollowButton
                  userId={post.author.id}
                  currentUserId={(currentUser as any)?.id || undefined}
                  size="sm"
                  className="ml-3 shrink-0"
                />
              )}
            </div>

            <p className="text-foreground mb-4 text-base leading-relaxed">
              {post.content}
            </p>

            {/* Media display for images and videos - Prioritize 0G Storage */}
            {(post.mediaStorageHash || post.imageUrl) && (
              <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 relative">
                {post.mediaType?.startsWith('video/') ? (
                  <ProgressiveVideo
                    src={post.mediaStorageHash ? `/api/objects/zg-media/${post.mediaStorageHash}` : post.imageUrl}
                    controls
                    className="w-full max-h-80 object-cover"
                    data-testid={`video-${post.id}`}
                  />
                ) : (
                  <ProgressiveImage
                    src={post.mediaStorageHash ? `/api/objects/zg-media/${post.mediaStorageHash}` : post.imageUrl}
                    alt={post.mediaStorageHash ? "Media from 0G Storage" : "Post media"}
                    className="w-full h-48 object-cover"
                    data-testid={`image-${post.id}`}
                  />
                )}
                {/* Show media source indicator */}
                {post.mediaStorageHash && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full opacity-75 z-10">
                    0G Storage
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Storage Hash Display - supports both L1 hash + Storage hash or Storage hash only */}
            {(post.storageHash || post.transactionHash) && (
              <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2 text-sm mb-2">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-300">Stored on 0G Network</span>
                </div>

                {/* L1 Transaction Hash - Only show real hashes */}
                {post.transactionHash && post.transactionHash !== 'existing_on_network' && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 mb-1">
                    <Shield className="w-3 h-3" />
                    <span className="font-mono">L1 Hash:</span>
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                      {post.transactionHash.slice(0, 8)}...{post.transactionHash.slice(-6)}
                    </code>
                    <a
                      href={`https://chainscan.0g.ai/tx/${post.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                      title="View L1 transaction on blockchain explorer"
                      data-testid={`link-l1-hash-${post.id}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Storage Hash */}
                {post.storageHash && (
                  <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300">
                    <Database className="w-3 h-3" />
                    <span className="font-mono">Storage:</span>
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                      {post.storageHash.slice(0, 8)}...{post.storageHash.slice(-6)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                      onClick={() => {
                        navigator.clipboard.writeText(post.storageHash || '');
                        toast({
                          title: "Storage hash copied",
                          description: "Storage hash copied to clipboard"
                        });
                      }}
                      title="Copy full storage hash"
                      data-testid={`button-copy-storage-${post.id}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full elegant-button transition-all ${post.isLiked
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50/50"
                    }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{post.likesCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 elegant-button transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">{post.commentsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => repostMutation.mutate()}
                  disabled={repostMutation.isPending}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-full elegant-button transition-all ${post.isReposted
                    ? "text-green-500 bg-green-50 hover:bg-green-100"
                    : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50/50"
                    }`}
                >
                  <Share className={`w-4 h-4 ${post.isReposted ? "fill-current" : ""}`} />
                  <span className="text-sm font-medium">{post.sharesCount}</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 elegant-button transition-all"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>


              </div>
            </div>

            {/* Comment Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Existing Comments */}
                {commentsLoading ? (
                  <div className="mb-4 text-center text-gray-500 dark:text-gray-400">
                    Loading comments...
                  </div>
                ) : comments.length > 0 ? (
                  <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="flex space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage
                            src={comment.author?.avatar ? `${window.location.origin}${comment.author.avatar}` : ""}
                            alt={comment.author?.displayName || "User"}
                            loading="lazy"
                          />
                          <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs">
                            {(comment.author?.displayName || "??").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {comment.author?.displayName || "Anonymous User"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              @{comment.author?.username || "unknown"}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-4 text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    No comments yet. Be the first to comment!
                  </div>
                )}

                {/* Add New Comment */}
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && commentText.trim()) {
                        commentMutation.mutate(commentText.trim());
                      }
                    }}
                    className="flex-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-sm"
                    disabled={commentMutation.isPending}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (commentText.trim()) {
                        commentMutation.mutate(commentText.trim());
                      }
                    }}
                    disabled={commentMutation.isPending || !commentText.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-sm"
                  >
                    {commentMutation.isPending ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Comments are stored on 0G Network
                </div>
              </div>
            )}
          </div>
        </article>
      </CardContent>
    </Card>
  );
}

// Export with memoization and custom comparison
export const PostCard = memo(PostCardBase, (prevProps, nextProps) => {
  // Compare essential props that affect rendering
  const prevPost = prevProps.post;
  const nextPost = nextProps.post;

  return (
    prevPost.id === nextPost.id &&
    prevPost.likesCount === nextPost.likesCount &&
    prevPost.commentsCount === nextPost.commentsCount &&
    prevPost.sharesCount === nextPost.sharesCount &&
    prevPost.isLiked === nextPost.isLiked &&
    prevPost.isReposted === nextPost.isReposted &&
    prevPost.content === nextPost.content &&
    prevPost.mediaStorageHash === nextPost.mediaStorageHash &&
    prevPost.imageUrl === nextPost.imageUrl &&
    prevPost.author?.id === nextPost.author?.id &&
    prevPost.author?.displayName === nextPost.author?.displayName &&
    prevPost.author?.avatar === nextPost.author?.avatar &&
    prevPost.author?.isVerified === nextPost.author?.isVerified
  );
});
