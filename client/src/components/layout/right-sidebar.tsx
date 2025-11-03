import { TrendingUp } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalAIFeed } from "@/components/personal-ai-feed";
import { TrendingHashtags } from "@/components/hashtags/trending-hashtags";
import { Skeleton } from "@/components/ui/skeleton";

// Container component that fetches data for TrendingHashtags
function TrendingHashtagsContainer() {
  const { data: hashtags, isLoading } = useQuery<Array<{
    id: string;
    name: string;
    postsCount: number;
    trendingScore: number;
    isFollowing: boolean;
    createdAt: Date | null;
  }>>({
    queryKey: ["/api/hashtags/trending"],
    refetchInterval: 300000, // 5 minutes
  });

  const handleHashtagClick = (hashtag: string) => {
    console.log("Clicked hashtag:", hashtag);
    globalThis.location.href = `/hashtag/${hashtag}`;
  };

  const handleFollowToggle = async (hashtagId: string, isFollowing: boolean) => {
    console.log("Toggle follow:", hashtagId, isFollowing);
    // Hashtag follow/unfollow functionality
  };

  return (
    <TrendingHashtags
      hashtags={hashtags || []}
      onHashtagClick={handleHashtagClick}
      onFollowToggle={handleFollowToggle}
      isLoading={isLoading}
    />
  );
}

export function RightSidebar() {
  const queryClient = useQueryClient();

  const { data: trending, isLoading: trendingLoading } = useQuery<Array<{ topic: string; posts: string }>>({
    queryKey: ["/api/ai/trending"],
    refetchInterval: 300000,
  });

  const { data: networkStats, isLoading: networkStatsLoading } = useQuery<{
    activeUsers: number;
    postsToday: number;
    aiInteractions: number;
    dataStored: string;
    dataStoredBytes: number;
    postsOnChain: number;
    zgStorage?: {
      totalStorage: string;
      availableSpace: string;
      networkNodes: number;
      replicationFactor: number;
    };
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000
  });

  // Fetch suggested users from API
  const { data: suggestedUsers, isLoading: suggestedLoading } = useQuery<Array<{
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    bio: string | null;
    isVerified: boolean;
    followersCount: number;
    postsCount: number;
    isFollowing: boolean;
  }>>({
    queryKey: ["/api/users/suggested"],
    queryFn: async () => {
      const response = await fetch("/api/users/suggested?limit=3");
      if (!response.ok) return [];
      return response.json();
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <aside className="lg:col-span-3">
      <div className="sticky top-24 space-y-6">
        {/* Personal AI Feed */}
        <PersonalAIFeed />

        {/* Wave 2: Trending Hashtags */}
        <TrendingHashtagsContainer />

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span className="leading-tight">Trending in DeSocialAI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingLoading ? (
              <>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={`trending-skeleton-${i}`} className="p-2 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {trending && trending.length > 0 ? (
                  trending.map((topic) => (
                    <div key={`trending-${topic.topic}`} className="hover:bg-og-slate-50 dark:hover:bg-og-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                      <p className="font-medium">{topic.topic}</p>
                      <p className="text-sm text-og-slate-600 dark:text-og-slate-400">{topic.posts}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <TrendingUp className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No trending topics yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start posting to create trends!</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Suggested Follows */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm leading-tight">Who to Follow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestedLoading ? (
              <>
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={`suggested-skeleton-${i}`} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {suggestedUsers && suggestedUsers.length > 0 ? (
                  suggestedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <a
                        href={`/profile/${user.username}`}
                        className="flex items-center space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                      >
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.displayName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate flex items-center gap-1">
                            {user.displayName}
                            {user.isVerified && (
                              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </p>
                          <p className="text-xs text-og-slate-600 dark:text-og-slate-400 truncate">
                            @{user.username}
                          </p>
                        </div>
                      </a>
                      <Button
                        size="sm"
                        variant={user.isFollowing ? "outline" : "default"}
                        className={user.isFollowing ? "" : "bg-og-primary text-white hover:bg-og-primary/90"}
                        onClick={async () => {
                          try {
                            const endpoint = user.isFollowing
                              ? `/api/users/${user.id}/unfollow`
                              : `/api/users/${user.id}/follow`;

                            const response = await fetch(endpoint, {
                              method: 'POST',
                              credentials: 'include'
                            });

                            if (response.ok) {
                              // Invalidate and refetch suggested users
                              queryClient.invalidateQueries({ queryKey: ["/api/users/suggested"] });
                            }
                          } catch (error) {
                            console.error('Follow error:', error);
                          }
                        }}
                      >
                        {user.isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No suggestions yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back later!</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Network Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm leading-tight flex items-center gap-2">
              Network Activity
              <span className="text-xs text-blue-500 font-normal" title="Real-time on-chain data">
                ⛓️ Live
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {networkStatsLoading ? (
              <>
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={`network-skeleton-${i}`} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">Active Users</span>
                  <span className="font-medium">{networkStats?.activeUsers?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">Posts Today</span>
                  <span className="font-medium">{networkStats?.postsToday?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">AI Interactions</span>
                  <span className="font-medium">{networkStats?.aiInteractions?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-og-slate-600 dark:text-og-slate-400 flex items-center gap-1">
                    Data Stored
                    <span className="text-xs text-blue-500" title="On-chain data stored in 0G Storage">
                      ⛓️
                    </span>
                  </span>
                  <span className="font-medium">{networkStats?.dataStored || "0 MB"}</span>
                </div>
                {networkStats?.postsOnChain !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-og-slate-500 dark:text-og-slate-500">Posts on 0G Chain</span>
                    <span className="font-medium text-og-slate-600 dark:text-og-slate-400">
                      {networkStats.postsOnChain.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
