import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Share2, Copy, Twitter, Facebook, LinkIcon, Users, ExternalLink } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ContentSharingProps {
  postId: string;
  postTitle?: string;
  postAuthor?: string;
}

interface ShareData {
  shareType: 'internal' | 'external' | 'cross_community';
  shareMessage?: string;
  targetCommunityId?: string;
}

export function ContentSharing({ postId, postTitle, postAuthor }: ContentSharingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [shareType, setShareType] = useState<ShareData['shareType']>('internal');
  const [targetCommunity, setTargetCommunity] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: communities = [] } = useQuery({
    queryKey: ['user-communities'],
    queryFn: () => fetch('/api/communities/user').then(res => res.json()),
    enabled: shareType === 'cross_community'
  });

  const { data: shares = [], isLoading: sharesLoading } = useQuery({
    queryKey: ['post-shares', postId],
    queryFn: () => fetch(`/api/posts/${postId}/shares`).then(res => res.json())
  });

  const sharePostMutation = useMutation({
    mutationFn: (data: ShareData) =>
      apiRequest(`/api/posts/${postId}/share`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['post-shares', postId] });
      setIsOpen(false);
      setShareMessage('');
      toast({
        title: "Content Shared",
        description: data.message || "Post shared successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to share post",
        variant: "destructive"
      });
    }
  });

  const handleShare = () => {
    const data: ShareData = {
      shareType,
      shareMessage: shareMessage.trim() || undefined,
      targetCommunityId: shareType === 'cross_community' ? targetCommunity : undefined
    };
    sharePostMutation.mutate(data);
  };

  const copyShareUrl = async () => {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const shareToTwitter = () => {
    const text = `Check out this post by ${postAuthor}: ${postTitle}`;
    const url = `${window.location.origin}/post/${postId}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = () => {
    const url = `${window.location.origin}/post/${postId}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
            {shares.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {shares.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>Share Content</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Share Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Type</label>
              <Select value={shareType} onValueChange={(value: ShareData['shareType']) => setShareType(value)}>
                <SelectTrigger data-testid="select-share-type">
                  <SelectValue placeholder="Select share type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Share</SelectItem>
                  <SelectItem value="cross_community">Cross-Community</SelectItem>
                  <SelectItem value="external">External Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Community Selection */}
            {shareType === 'cross_community' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Community</label>
                <Select value={targetCommunity} onValueChange={setTargetCommunity}>
                  <SelectTrigger data-testid="select-target-community">
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community: any) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Share Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Message (Optional)</label>
              <Textarea
                placeholder="Add a message with your share..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-share-message"
              />
            </div>

            {/* External Platform Options */}
            {shareType === 'external' && (
              <div className="space-y-3">
                <Separator />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={copyShareUrl}
                    className="flex items-center space-x-2"
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareToTwitter}
                    className="flex items-center space-x-2"
                    data-testid="button-share-twitter"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareToFacebook}
                    className="flex items-center space-x-2 col-span-2"
                    data-testid="button-share-facebook"
                  >
                    <Facebook className="h-4 w-4" />
                    <span>Facebook</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Share Button */}
            {shareType !== 'external' && (
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={sharePostMutation.isPending || (shareType === 'cross_community' && !targetCommunity)}
                  data-testid="button-submit-share"
                >
                  {sharePostMutation.isPending ? 'Sharing...' : 'Share'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share History */}
      {shares.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Shared {shares.length} times</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {shares.slice(0, 3).map((share: any) => (
                <div key={share.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{share.user.displayName}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {share.shareType}
                    </Badge>
                  </div>
                  {share.shareUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(share.shareUrl, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {shares.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{shares.length - 3} more shares
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}