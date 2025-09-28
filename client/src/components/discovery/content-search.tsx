import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Hash, User, FileText, Sparkles } from "lucide-react";

// Custom debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// PostCard component for search results
interface PostCardProps {
  post: any;
}

function PostCard({ post }: PostCardProps) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {post.author?.displayName?.charAt(0) || post.author?.username?.charAt(0) || '?'}
        </div>
        <div>
          <h4 className="font-semibold">{post.author?.displayName || post.author?.username}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <p className="text-gray-900 dark:text-gray-100 mb-3">{post.content}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="Post content" className="w-full rounded-lg mb-3" />
      )}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{post.likesCount} likes</span>
        <span>{post.commentsCount} comments</span>
        <span>{post.sharesCount} shares</span>
      </div>
    </div>
  );
}
import type { Post, User as UserType } from "@shared/schema";

interface SearchFilters {
  category?: string;
  dateRange?: string;
  sortBy?: string;
  contentType?: string;
}

interface SearchResults {
  posts: Post[];
  users: UserType[];
  hashtags: string[];
  totalResults: number;
}

export function ContentSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setActiveQuery(query);
    }, 300),
    []
  );

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/search', activeQuery, filters],
    queryFn: async () => {
      if (!activeQuery.trim()) return null;
      
      const params = new URLSearchParams({
        q: activeQuery,
        ...filters
      });
      
      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json() as SearchResults;
    },
    enabled: !!activeQuery.trim()
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search posts, users, hashtags..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                data-testid="input-search"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 border-gray-200 dark:border-gray-700"
              data-testid="button-filters"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defi">DeFi</SelectItem>
                    <SelectItem value="nft">NFT</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="dao">DAO</SelectItem>
                    <SelectItem value="ai">AI</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="engagement">Highest Engagement</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => handleFilterChange('contentType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="text">Text Posts</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="nft">NFT Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {activeQuery && (
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results for "{activeQuery}"</span>
              {searchResults && (
                <Badge variant="secondary">
                  {searchResults.totalResults} results
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : searchResults ? (
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="posts" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Posts ({searchResults.posts.length})
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Users ({searchResults.users.length})
                  </TabsTrigger>
                  <TabsTrigger value="hashtags" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtags ({searchResults.hashtags.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6">
                  {searchResults.posts.length > 0 ? (
                    <div className="space-y-6">
                      {searchResults.posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No posts found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="users" className="mt-6">
                  {searchResults.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.users.map((user) => (
                        <div key={user.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                              {user.displayName?.charAt(0) || user.username.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{user.displayName || user.username}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
                              {user.bio && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                                  {user.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="hashtags" className="mt-6">
                  {searchResults.hashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {searchResults.hashtags.map((hashtag) => (
                        <Badge 
                          key={hashtag} 
                          variant="outline" 
                          className="px-3 py-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
                          onClick={() => handleSearch(`#${hashtag}`)}
                        >
                          <Hash className="w-3 h-3 mr-1" />
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hashtags found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Enter a search query to find content</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI-Powered Suggestions */}
      {!activeQuery && (
        <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Powered Discovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Popular Topics</h3>
                <div className="space-y-1">
                  <Badge variant="secondary" className="mr-2">#DeFi</Badge>
                  <Badge variant="secondary" className="mr-2">#0G</Badge>
                  <Badge variant="secondary">#Web3</Badge>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Trending Now</h3>
                <div className="space-y-1">
                  <Badge variant="secondary" className="mr-2">#AI</Badge>
                  <Badge variant="secondary" className="mr-2">#NFT</Badge>
                  <Badge variant="secondary">#DAO</Badge>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">For You</h3>
                <div className="space-y-1">
                  <Badge variant="secondary" className="mr-2">#Blockchain</Badge>
                  <Badge variant="secondary" className="mr-2">#Gaming</Badge>
                  <Badge variant="secondary">#Crypto</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}