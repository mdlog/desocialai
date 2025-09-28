import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, Target, RefreshCw } from "lucide-react";
import { LazyPostCard } from "@/components/posts/lazy-post-card";

export function AIRecommendationsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: recommendations, refetch } = useQuery({
    queryKey: ['/api/ai/recommendations'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: trends } = useQuery({
    queryKey: ['/api/ai/trends'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/ai/stats'],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AI Recommendations
                </h1>
                <p className="text-gray-400">Personalized content powered by 0G Compute</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations?.posts?.map((post: any) => (
                  <LazyPostCard key={post.id} post={post} />
                )) || (
                  <div className="text-center py-8 text-gray-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>AI is analyzing your preferences...</p>
                    <p className="text-sm">Check back in a few moments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Stats */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="text-lg">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Interactions Today</span>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400/30">
                    {stats?.interactions || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Accuracy</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/30">
                    {stats?.accuracy || 95}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Model Version</span>
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                    v2.1
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends?.topics?.map((topic: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{topic.name}</span>
                      <Badge variant="outline" className="text-orange-400 border-orange-400/30">
                        {topic.posts}
                      </Badge>
                    </div>
                  )) || (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#0GChain</span>
                        <Badge variant="outline" className="text-orange-400 border-orange-400/30">142</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#DecentralizedAI</span>
                        <Badge variant="outline" className="text-orange-400 border-orange-400/30">89</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">#Web3Social</span>
                        <Badge variant="outline" className="text-orange-400 border-orange-400/30">67</Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Community Suggestions */}
            <Card className="futuristic-card dark:futuristic-card-dark">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-4 h-4 text-blue-400" />
                  Suggested Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5">
                    <div className="font-medium text-blue-400">0G Developers</div>
                    <div className="text-xs text-gray-400">1.2k members</div>
                  </div>
                  <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/5">
                    <div className="font-medium text-purple-400">DeFi Innovation</div>
                    <div className="text-xs text-gray-400">856 members</div>
                  </div>
                  <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                    <div className="font-medium text-green-400">AI Research</div>
                    <div className="text-xs text-gray-400">623 members</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}