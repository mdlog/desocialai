import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Plus, FolderPlus, Folder, Heart, MessageCircle, Share2, BookOpen, Star } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BookmarksCollectionsProps {
  postId?: string;
  showBookmarkButton?: boolean;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  bookmarksCount: number;
  createdAt: string;
}

interface BookmarkedPost {
  id: string;
  postId: string;
  notes?: string;
  createdAt: string;
  collection?: Collection;
  post: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      displayName: string;
      avatar?: string;
    };
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string;
  };
}

export function BookmarksCollections({ postId, showBookmarkButton = true }: BookmarksCollectionsProps) {
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [bookmarkNotes, setBookmarkNotes] = useState('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'collections'>('bookmarks');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collections = [] } = useQuery({
    queryKey: ['user-collections'],
    queryFn: () => fetch('/api/users/me/collections').then(res => res.json())
  });

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useQuery({
    queryKey: ['user-bookmarks'],
    queryFn: () => fetch('/api/users/me/bookmarks').then(res => res.json())
  });

  const { data: isBookmarked = false } = useQuery({
    queryKey: ['is-bookmarked', postId],
    queryFn: async () => {
      if (!postId) return false;
      const response = await fetch(`/api/posts/${postId}/bookmark`);
      return response.ok;
    },
    enabled: !!postId
  });

  const bookmarkMutation = useMutation({
    mutationFn: (data: { collectionId?: string; notes?: string }) =>
      apiRequest(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-bookmarks'] });
      queryClient.invalidateQueries({ queryKey: ['is-bookmarked', postId] });
      setIsBookmarkDialogOpen(false);
      setBookmarkNotes('');
      setSelectedCollection('');
      toast({
        title: data.bookmarked ? "Bookmarked" : "Bookmark Removed",
        description: data.message || "Bookmark updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark",
        variant: "destructive"
      });
    }
  });

  const createCollectionMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic: boolean }) =>
      apiRequest('/api/collections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-collections'] });
      setIsCollectionDialogOpen(false);
      setNewCollectionName('');
      setNewCollectionDescription('');
      toast({
        title: "Collection Created",
        description: "Your new collection has been created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive"
      });
    }
  });

  const handleBookmark = () => {
    if (!postId) return;
    
    const data: { collectionId?: string; notes?: string } = {};
    if (selectedCollection) data.collectionId = selectedCollection;
    if (bookmarkNotes.trim()) data.notes = bookmarkNotes;
    
    bookmarkMutation.mutate(data);
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    
    createCollectionMutation.mutate({
      name: newCollectionName,
      description: newCollectionDescription.trim() || undefined,
      isPublic
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Bookmark Button */}
      {showBookmarkButton && postId && (
        <div className="flex items-center space-x-2">
          <Dialog open={isBookmarkDialogOpen} onOpenChange={setIsBookmarkDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
                className="flex items-center space-x-2"
                data-testid="button-bookmark-post"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Bookmark className="h-5 w-5" />
                  <span>{isBookmarked ? 'Update Bookmark' : 'Add Bookmark'}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collection (Optional)</label>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger data-testid="select-collection">
                      <SelectValue placeholder="Choose a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Collection</SelectItem>
                      {collections.map((collection: Collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name} ({collection.bookmarksCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about this bookmark..."
                    value={bookmarkNotes}
                    onChange={(e) => setBookmarkNotes(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-bookmark-notes"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsBookmarkDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBookmark}
                    disabled={bookmarkMutation.isPending}
                    data-testid="button-submit-bookmark"
                  >
                    {bookmarkMutation.isPending ? 'Saving...' : (isBookmarked ? 'Update' : 'Bookmark')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCollectionDialogOpen} onOpenChange={setIsCollectionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <FolderPlus className="h-4 w-4" />
                <span>New Collection</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FolderPlus className="h-5 w-5" />
                  <span>Create Collection</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collection Name</label>
                  <Input
                    placeholder="Enter collection name"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    data-testid="input-collection-name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    placeholder="Describe your collection..."
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-collection-description"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm">Make collection public</label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCollectionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCollection}
                    disabled={createCollectionMutation.isPending || !newCollectionName.trim()}
                    data-testid="button-create-collection"
                  >
                    {createCollectionMutation.isPending ? 'Creating...' : 'Create Collection'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'bookmarks' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('bookmarks')}
          className="flex items-center space-x-2"
        >
          <Bookmark className="h-4 w-4" />
          <span>Bookmarks</span>
          <Badge variant="secondary">{bookmarks.length}</Badge>
        </Button>
        <Button
          variant={activeTab === 'collections' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('collections')}
          className="flex items-center space-x-2"
        >
          <Folder className="h-4 w-4" />
          <span>Collections</span>
          <Badge variant="secondary">{collections.length}</Badge>
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarksLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : bookmarks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No bookmarks yet. Start saving interesting posts!</p>
              </CardContent>
            </Card>
          ) : (
            bookmarks.map((bookmark: BookmarkedPost) => (
              <Card key={bookmark.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={bookmark.post.author.avatar} />
                          <AvatarFallback className="text-xs">
                            {bookmark.post.author.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{bookmark.post.author.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{bookmark.post.author.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {bookmark.collection && (
                          <Badge variant="outline" className="text-xs">
                            <Folder className="h-3 w-3 mr-1" />
                            {bookmark.collection.name}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(bookmark.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {bookmark.post.content}
                    </p>
                    
                    {bookmark.notes && (
                      <div className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
                        <strong>Notes:</strong> {bookmark.notes}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {bookmark.post.likesCount}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {bookmark.post.commentsCount}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {bookmark.post.sharesCount}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => window.open(`/post/${bookmark.post.id}`, '_blank')}
                      >
                        View Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-4">
          {collections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No collections yet. Create one to organize your bookmarks!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collections.map((collection: Collection) => (
                <Card key={collection.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Folder className="h-4 w-4" />
                        <span>{collection.name}</span>
                      </div>
                      <Badge variant={collection.isPublic ? 'default' : 'secondary'} className="text-xs">
                        {collection.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {collection.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {collection.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{collection.bookmarksCount} bookmarks</span>
                        <span>{formatDate(collection.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}