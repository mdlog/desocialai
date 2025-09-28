import { useState } from "react";
import { Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LazyPostCard } from "./lazy-post-card";
import { useWebSocket } from "@/hooks/use-websocket";
import type { PostWithAuthor } from "@shared/schema";

export function Feed() {
  const [offset, setOffset] = useState(0);
  const limit = 10;

  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  const { data: posts, error, refetch } = useQuery<PostWithAuthor[]>({
    queryKey: ["/api/posts/feed", limit, offset],
    queryFn: async () => {
      console.log(`🔄 Fetching feed: limit=${limit}, offset=${offset}`);
      const response = await fetch(`/api/posts/feed?limit=${limit}&offset=${offset}`, {
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
    staleTime: 0, // Always consider data stale for immediate refresh
    gcTime: 0, // Don't cache for immediate updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Remove aggressive polling since WebSocket will handle real-time updates
    refetchInterval: false,
  });

  const loadMore = () => {
    setOffset(prev => prev + limit);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-og-slate-600 dark:text-og-slate-400">
          Failed to load posts. Please try again.
        </p>
      </div>
    );
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

          <div className="text-center py-6">
            <Button
              onClick={loadMore}
              variant="outline"
              className="px-6 py-3 bg-white dark:bg-og-slate-800 border border-og-slate-200 dark:border-og-slate-700 rounded-xl hover:shadow-md transition-all"
            >
              Load More Posts
            </Button>
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
