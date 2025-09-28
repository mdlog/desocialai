import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Hash, Eye, MessageSquare } from "lucide-react";
import { Link } from "wouter";

interface PostCardProps {
  post: any;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="p-4 border rounded-lg">
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

interface TrendingHashtag {
  id: string;
  tag: string;
  postsCount: number;
  engagementRate: number;
  growth24h: number;
  category: string;
}

export function HashtagTrending() {
  const { data: trendingHashtags, isLoading } = useQuery({
    queryKey: ['/api/hashtags/trending'],
    queryFn: async () => {
      const response = await fetch('/api/hashtags/trending');
      if (!response.ok) throw new Error('Failed to fetch trending hashtags');
      return response.json() as TrendingHashtag[];
    },
  });

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingHashtags?.map((hashtag, index) => (
          <Link key={hashtag.id} href={`/search?hashtag=${encodeURIComponent(hashtag.tag)}`}>
            <div className="group p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-950 dark:hover:to-indigo-950 transition-all cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <Hash className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {hashtag.tag}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {hashtag.category}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{hashtag.postsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{hashtag.engagementRate}%</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  hashtag.growth24h > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>{hashtag.growth24h > 0 ? '+' : ''}{hashtag.growth24h}%</span>
                </div>
              </div>
            </div>
          </Link>
        )) || (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No trending hashtags found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}