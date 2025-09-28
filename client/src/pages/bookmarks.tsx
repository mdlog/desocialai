import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Search, FileText, Image, Video, Filter, Calendar, Trash2 } from "lucide-react";
import { LazyPostCard } from "@/components/posts/lazy-post-card";

export function BookmarksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['/api/bookmarks'],
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['/api/bookmarks/collections'],
  });

  const mockBookmarks = [
    {
      id: '1',
      post: {
        id: 'post1',
        content: '🚀 Just deployed my first smart contract on 0G Chain! The transaction speed is incredible - confirmed in under 2 seconds. This is the future of DeFi! #0GChain #DeFi #Blockchain',
        author: { username: 'defi_pioneer', displayName: 'DeFi Pioneer', avatar: null },
        createdAt: '2024-08-19T08:00:00Z',
        likesCount: 234,
        commentsCount: 56,
        sharesCount: 89,
        storageHash: 'zg_hash_123',
        transactionHash: 'tx_456'
      },
      savedAt: '2024-08-19T10:30:00Z',
      category: 'Development'
    },
    {
      id: '2',
      post: {
        id: 'post2',
        content: 'AI-powered content curation is revolutionizing how we consume information. With 0G Compute, we can run personalized AI models that truly understand our preferences without compromising privacy. 🤖',
        author: { username: 'ai_researcher', displayName: 'AI Researcher', avatar: null },
        createdAt: '2024-08-19T07:15:00Z',
        likesCount: 189,
        commentsCount: 42,
        sharesCount: 67,
        imageUrl: '/api/placeholder/ai-diagram.jpg',
        storageHash: 'zg_hash_789',
        transactionHash: 'tx_012'
      },
      savedAt: '2024-08-19T09:45:00Z',
      category: 'AI & Tech'
    }
  ];

  const mockCollections = [
    { id: '1', name: 'DeFi Research', count: 45, color: 'bg-green-500' },
    { id: '2', name: 'AI Insights', count: 32, color: 'bg-purple-500' },
    { id: '3', name: 'Development Tips', count: 28, color: 'bg-blue-500' },
    { id: '4', name: 'Market Analysis', count: 19, color: 'bg-orange-500' }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: FileText, count: bookmarks.length || 124 },
    { id: 'posts', name: 'Posts', icon: FileText, count: bookmarks.filter(b => !b.post?.imageUrl && !b.post?.videoUrl).length || 89 },
    { id: 'images', name: 'Images', icon: Image, count: bookmarks.filter(b => b.post?.imageUrl).length || 23 },
    { id: 'videos', name: 'Videos', icon: Video, count: bookmarks.filter(b => b.post?.videoUrl).length || 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
              <Bookmark className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Bookmarks
              </h1>
              <p className="text-gray-400">Your saved content on the blockchain</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 h-12"
              />
            </div>
            <Button variant="outline" className="border-gray-600 hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${selectedCategory === category.id
                            ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                            : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge variant="outline" className={selectedCategory === category.id ? 'border-yellow-400/30 text-yellow-400' : 'border-gray-600 text-gray-400'}>
                          {category.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Collections */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(collections.length > 0 ? collections : mockCollections).map((collection) => (
                    <div key={collection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
                      <div className={`w-3 h-3 rounded-full ${collection.color}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{collection.name}</div>
                        <div className="text-xs text-gray-400">{collection.count} items</div>
                      </div>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-yellow-400 hover:bg-yellow-400/10">
                    + Create Collection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Storage Stats */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Bookmarks</span>
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                    {bookmarks.length || 124}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">On-chain Storage</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30">
                    100%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Collections</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    {collections.length || 4}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="grid" className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-gray-800/50">
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  Sort by: Recent
                </div>
              </div>

              <TabsContent value="grid" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(bookmarks.length > 0 ? bookmarks : mockBookmarks).map((bookmark) => (
                    <Card key={bookmark.id} className="futuristic-card dark:futuristic-card-dark relative group">
                      <div className="absolute top-4 right-4 z-10">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 mb-2">
                            {bookmark.category}
                          </Badge>
                          <div className="text-xs text-gray-400 mb-3">
                            Saved on {new Date(bookmark.savedAt || bookmark.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <LazyPostCard post={bookmark.post} />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {bookmarks.length === 0 && (
                  <Card className="futuristic-card dark:futuristic-card-dark">
                    <CardContent className="text-center py-12">
                      <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">No bookmarks yet</h3>
                      <p className="text-gray-400 mb-4">
                        Start bookmarking posts to build your personal knowledge base on the blockchain
                      </p>
                      <Button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Discover Content
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {(bookmarks.length > 0 ? bookmarks : mockBookmarks).map((bookmark) => (
                  <Card key={bookmark.id} className="futuristic-card dark:futuristic-card-dark">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                              {bookmark.category}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Saved {new Date(bookmark.savedAt || bookmark.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-medium text-white mb-2">
                            @{bookmark.post.author.username}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                            {bookmark.post.content}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{bookmark.post.likesCount} likes</span>
                            <span>{bookmark.post.commentsCount} comments</span>
                            <span>{bookmark.post.sharesCount} shares</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}