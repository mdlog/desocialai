import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Share2, Reply, MoreHorizontal } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ThreadCommentsProps {
  postId: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  likesCount: number;
  repliesCount: number;
  replyDepth: number;
  replies: Comment[];
  createdAt: string;
  parentCommentId?: string;
}

export function ThreadComments({ postId }: ThreadCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['threaded-comments', postId],
    queryFn: () => fetch(`/api/posts/${postId}/comments/threaded`).then(res => res.json())
  });

  const createCommentMutation = useMutation({
    mutationFn: (data: { content: string; postId: string }) =>
      apiRequest(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threaded-comments', postId] });
      setNewComment('');
      toast({
        title: "Success",
        description: "Comment posted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive"
      });
    }
  });

  const createReplyMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      apiRequest(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content, postId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threaded-comments', postId] });
      setReplyingTo(null);
      setReplyContent('');
      toast({
        title: "Success",
        description: "Reply posted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive"
      });
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiRequest(`/api/comments/${commentId}/like`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threaded-comments', postId] });
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate({ content: newComment, postId });
  };

  const handleSubmitReply = (commentId: string) => {
    if (!replyContent.trim()) return;
    createReplyMutation.mutate({ commentId, content: replyContent });
  };

  const renderComment = (comment: Comment) => {
    const indentLevel = Math.min(comment.replyDepth, 3);
    const indentClass = `ml-${indentLevel * 4}`;

    return (
      <div key={comment.id} className={`${indentClass} space-y-3`}>
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900/50 dark:to-gray-800/50 border-slate-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.avatar} />
                <AvatarFallback className="text-xs">
                  {comment.author.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{comment.author.displayName}</span>
                  <span className="text-xs text-muted-foreground">@{comment.author.username}</span>
                  {indentLevel > 0 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      L{indentLevel}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 hover:text-red-600"
                    onClick={() => likeCommentMutation.mutate(comment.id)}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    {comment.likesCount}
                  </Button>
                  
                  {indentLevel < 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 hover:text-blue-600"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}
                  
                  {comment.repliesCount > 0 && (
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {comment.repliesCount} replies
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <Card className={`${indentClass} ml-4 bg-blue-50 dark:bg-blue-900/20`}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <Textarea
                  placeholder={`Reply to ${comment.author.displayName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={createReplyMutation.isPending || !replyContent.trim()}
                  >
                    {createReplyMutation.isPending ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map(renderComment)}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Thread Comments</span>
            <Badge variant="secondary">{comments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              placeholder="Start a conversation..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              data-testid="new-comment-input"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={createCommentMutation.isPending || !newComment.trim()}
                data-testid="button-submit-comment"
              >
                {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No comments yet. Start the conversation!</p>
            </CardContent>
          </Card>
        ) : (
          comments.map(renderComment)
        )}
      </div>
    </div>
  );
}