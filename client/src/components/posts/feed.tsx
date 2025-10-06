import { Brain } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LazyPostCard } from "./lazy-post-card";
import { useWebSocket } from "@/hooks/use-websocket";
import { LoadingFeed, RefreshButton } from "@/components/ui/loading";
import type { PostWithAuthor } from "@shared/schema";

export function Feed() {
  const limit = 10;

  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  const {
    data,
    error,
    refetch,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["/api/posts/feed", limit],
    queryFn: async ({ pageParam = 0 }) => {
      console.log(`🔄 Fetching feed: limit=${limit}, offset=${pageParam}`);
      const response = await fetch(`/api/posts/feed?limit=${limit}&offset=${pageParam}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      console.log(`✅ Feed fetched: ${data.length} posts`);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer posts than the limit, we've reached the end
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep data in cache for 5 minutes
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Only refetch on reconnect
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Flatten all pages into a single array of posts
  const posts = data?.pages.flat() ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (error) {
    console.error('Feed error:', error);
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <span className="text-red-600 dark:text-red-400 text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-og-slate-900 dark:text-og-slate-100 mb-2">
          Failed to Load Posts
        </h3>
        <p className="text-og-slate-600 dark:text-og-slate-400 mb-4">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <RefreshButton onRefresh={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return <LoadingFeed count={5} />;
  }

  return (
    <div className="space-y-6">
      {/* AI Feed Status */}
      <Card className="bg-gradient-to-r from-purple-100 to-green-100 dark:from-purple-900 dark:to-green-900 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
              <Brain className="text-white w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-og-primary">AI-Powered Feed Active</h3>
              <p className="text-sm text-og-slate-600 dark:text-og-slate-400">
                Your personalized content is being curated by 0G AI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts && posts.length > 0 ? (
        <>
          {posts.map((post) => (
            <LazyPostCard key={post.id} post={post} />
          ))}

          <div className="text-center py-6 space-y-4">
            <Button
              onClick={loadMore}
              variant="outline"
              className="px-6 py-3 bg-white dark:bg-og-slate-800 border border-og-slate-200 dark:border-og-slate-700 rounded-xl hover:shadow-md transition-all"
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage ? "Loading..." : hasNextPage ? "Load More Posts" : "No More Posts"}
            </Button>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <RefreshButton
                refreshing={isFetching}
                onRefresh={() => refetch()}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 gradient-brand rounded-full flex items-center justify-center">
            <Brain className="text-white w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-og-slate-900 dark:text-og-slate-100 mb-2">
            Your Feed is Ready for Content!
          </h3>
          <p className="text-og-slate-600 dark:text-og-slate-400 mb-4 max-w-md mx-auto">
            No posts in the feed yet. Create your first post with MetaMask signature to start sharing on decentralized 0G Social.
          </p>
          <p className="text-sm text-og-slate-500 dark:text-og-slate-500">
            📝 Connect wallet → Write post → Sign with MetaMask → Post appears here
          </p>
        </div>
      )}
    </div>
  );
}
