import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bookmark, Plus, Folder, Globe, Lock, MoreHorizontal } from "lucide-react";
import type { CollectionWithPosts } from "@shared/schema";

interface BookmarkCollectionsProps {
  collections: CollectionWithPosts[];
  onCreateCollection?: (data: { name: string; description?: string; isPublic: boolean }) => void;
  onSelectCollection?: (collection: CollectionWithPosts) => void;
  isCreating?: boolean;
}

export function BookmarkCollections({ 
  collections, 
  onCreateCollection, 
  onSelectCollection, 
  isCreating 
}: BookmarkCollectionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const handleCreate = () => {
    if (!newCollection.name.trim()) return;
    
    onCreateCollection?.(newCollection);
    setNewCollection({ name: "", description: "", isPublic: true });
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Bookmark className="w-6 h-6 text-cyan-400" />
          <span>My Collections</span>
        </h2>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              data-testid="button-create-collection"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          
          <DialogContent className="bg-black/90 border-cyan-400/30 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-cyan-400" />
                <span>Create Collection</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input
                  id="collection-name"
                  placeholder="Enter collection name..."
                  value={newCollection.name}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-black/40 border-cyan-400/30 text-white"
                  data-testid="input-collection-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection-description">Description (optional)</Label>
                <Textarea
                  id="collection-description"
                  placeholder="Describe your collection..."
                  value={newCollection.description}
                  onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-black/40 border-cyan-400/30 text-white min-h-[80px]"
                  data-testid="textarea-collection-description"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="collection-public"
                  checked={newCollection.isPublic}
                  onCheckedChange={(checked) => setNewCollection(prev => ({ ...prev, isPublic: checked }))}
                  data-testid="switch-collection-public"
                />
                <Label htmlFor="collection-public" className="flex items-center space-x-2">
                  {newCollection.isPublic ? (
                    <Globe className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-yellow-400" />
                  )}
                  <span>{newCollection.isPublic ? "Public" : "Private"} collection</span>
                </Label>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 border-cyan-400/30 text-cyan-400"
                  data-testid="button-cancel-collection"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newCollection.name.trim() || isCreating}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  data-testid="button-save-collection"
                >
                  {isCreating ? "Creating..." : "Create Collection"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <Card className="border-cyan-400/20 bg-black/40 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <Folder className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No collections yet</h3>
            <p className="text-cyan-300/80 mb-4">
              Create your first collection to organize your bookmarked posts
            </p>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(true)}
              className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
              data-testid="button-create-first-collection"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="group cursor-pointer border-cyan-400/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 hover:border-cyan-400/40 transition-all duration-300"
              onClick={() => onSelectCollection?.(collection)}
              data-testid={`card-collection-${collection.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Folder className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <CardTitle 
                      className="text-lg font-bold text-white truncate group-hover:text-cyan-300"
                      data-testid={`text-collection-name-${collection.id}`}
                    >
                      {collection.name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    {collection.isPublic ? (
                      <Globe className="w-4 h-4 text-green-400" data-testid="icon-public" />
                    ) : (
                      <Lock className="w-4 h-4 text-yellow-400" data-testid="icon-private" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto text-cyan-300/60 hover:text-cyan-400"
                      onClick={(e) => e.stopPropagation()}
                      data-testid={`button-collection-menu-${collection.id}`}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {collection.description && (
                  <p 
                    className="text-cyan-100/90 text-sm mb-3 line-clamp-2"
                    data-testid={`text-collection-description-${collection.id}`}
                  >
                    {collection.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-cyan-300/80">
                  <span data-testid={`text-bookmarks-count-${collection.id}`}>
                    {collection.bookmarksCount} bookmark{collection.bookmarksCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs" data-testid={`text-collection-created-${collection.id}`}>
                    Created {new Date(collection.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Preview of recent bookmarks */}
                {collection.bookmarks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-cyan-400/20">
                    <div className="grid grid-cols-3 gap-1">
                      {collection.bookmarks.slice(0, 3).map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="aspect-square bg-black/20 rounded border border-cyan-400/20 p-1"
                          title={bookmark.post.content.slice(0, 50)}
                        >
                          {bookmark.post.imageUrl ? (
                            <img
                              src={bookmark.post.imageUrl}
                              alt=""
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-cyan-300/60 p-1 text-center">
                              {bookmark.post.content.slice(0, 20)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}