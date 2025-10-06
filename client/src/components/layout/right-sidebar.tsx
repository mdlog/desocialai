import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalAIFeed } from "@/components/personal-ai-feed";
import { TrendingHashtags } from "@/components/hashtags/trending-hashtags";
import { LoadingCard, LoadingSpinner } from "@/components/ui/loading";
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
    // TODO: Navigate to hashtag page
  };

  const handleFollowToggle = async (hashtagId: string, isFollowing: boolean) => {
    console.log("Toggle follow:", hashtagId, isFollowing);
    // TODO: Implement hashtag follow/unfollow
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
  const { data: trending, isLoading: trendingLoading } = useQuery<Array<{ topic: string; posts: string }>>({
    queryKey: ["/api/ai/trending"],
    refetchInterval: 300000,
  });

  const { data: networkStats, isLoading: networkStatsLoading } = useQuery<{ activeUsers: number; postsToday: number; aiInteractions: number; dataStored: string }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000,
  });

  const suggestedUsers = [
    {
      id: "suggested1",
      displayName: "0G Foundation",
      username: "0g_foundation",
      avatar: "indigo-purple",
      isFollowing: false,
    },
    {
      id: "suggested2",
      displayName: "DevRelAlice",
      username: "alice_dev",
      avatar: "green-teal",
      isFollowing: false,
    },
    {
      id: "suggested3",
      displayName: "CryptoBuilder",
      username: "cryptobuild",
      avatar: "orange-red",
      isFollowing: false,
    },
  ];

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
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="p-2 rounded-lg">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </>
            ) : trending?.map((topic, index) => (
              <div key={index} className="hover:bg-og-slate-50 dark:hover:bg-og-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                <p className="font-medium">{topic.topic}</p>
                <p className="text-sm text-og-slate-600 dark:text-og-slate-400">{topic.posts}</p>
              </div>
            )) || (
              <>
                <div className="hover:bg-og-slate-50 dark:hover:bg-og-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <p className="font-medium">#0GChain</p>
                  <p className="text-sm text-og-slate-600 dark:text-og-slate-400">12.5K posts</p>
                </div>
                <div className="hover:bg-og-slate-50 dark:hover:bg-og-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <p className="font-medium">#DecentralizedAI</p>
                  <p className="text-sm text-og-slate-600 dark:text-og-slate-400">8.2K posts</p>
                </div>
                <div className="hover:bg-og-slate-50 dark:hover:bg-og-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <p className="font-medium">#Web3Storage</p>
                  <p className="text-sm text-og-slate-600 dark:text-og-slate-400">5.7K posts</p>
                </div>
                <div className="hover:bg-og-slate-50 dark:hover:bg-og-slate-700 p-2 rounded-lg cursor-pointer transition-colors">
                  <p className="font-medium">#ModularBlockchain</p>
                  <p className="text-sm text-og-slate-600 dark:text-og-slate-400">3.4K posts</p>
                </div>
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
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))}
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-gradient-to-br ${user.avatar === "indigo-purple" ? "from-indigo-400 to-purple-400" :
                      user.avatar === "green-teal" ? "from-green-400 to-teal-400" :
                        "from-orange-400 to-red-400"
                    } rounded-full`}></div>
                  <div>
                    <p className="font-medium text-sm">{user.displayName}</p>
                    <p className="text-xs text-og-slate-600 dark:text-og-slate-400">@{user.username}</p>
                  </div>
                </div>
                <Button size="sm" className="bg-og-primary text-white hover:bg-og-primary/90">
                  Follow
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Network Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm leading-tight">Network Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {networkStatsLoading ? (
              <>
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">Active Users</span>
                  <span className="font-medium">{networkStats?.activeUsers?.toLocaleString() || "24.7K"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">Posts Today</span>
                  <span className="font-medium">{networkStats?.postsToday?.toLocaleString() || "1.2M"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">AI Interactions</span>
                  <span className="font-medium">{networkStats?.aiInteractions?.toLocaleString() || "892K"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-og-slate-600 dark:text-og-slate-400">Data Stored</span>
                  <span className="font-medium">{networkStats?.dataStored || "156 TB"}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
