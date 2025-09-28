import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, TrendingUp, Users, Flame, Eye, ArrowUpRight, Sparkles, Star, Crown, Award, BarChart3 } from "lucide-react";
import type { TrendingHashtag } from "@shared/schema";

interface TrendingHashtagsProps {
  hashtags: TrendingHashtag[];
  onHashtagClick?: (hashtag: string) => void;
  onFollowToggle?: (hashtagId: string, isFollowing: boolean) => void;
}

// Helper function for minimalist trending rank styling
const getRankStyling = (index: number) => {
  switch (index) {
    case 0:
      return {
        textColor: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950/30",
        borderColor: "border-orange-200 dark:border-orange-800/50",
        icon: <TrendingUp className="w-4 h-4" />,
        badge: "1"
      };
    case 1:
      return {
        textColor: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-200 dark:border-blue-800/50",
        icon: <TrendingUp className="w-4 h-4" />,
        badge: "2"
      };
    case 2:
      return {
        textColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        borderColor: "border-emerald-200 dark:border-emerald-800/50",
        icon: <TrendingUp className="w-4 h-4" />,
        badge: "3"
      };
    default:
      return {
        textColor: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-950/30",
        borderColor: "border-gray-200 dark:border-gray-800/50",
        icon: <Hash className="w-4 h-4" />,
        badge: (index + 1).toString()
      };
  }
};

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export function TrendingHashtags({ hashtags, onHashtagClick, onFollowToggle }: TrendingHashtagsProps) {
  if (!hashtags.length) {
    return (
      <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span>Trending Hashtags</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Hash className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                No trending hashtags yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Be the first to start a trend!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
      data-testid="card-trending-hashtags"
    >
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span>Trending Hashtags</span>
          </div>
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-0 font-medium">
            {hashtags.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-2">
          {hashtags.slice(0, 10).map((hashtag, index) => {
            const rankStyle = getRankStyling(index);
            const isTop3 = index < 3;

            return (
              <div
                key={hashtag.id}
                className={`group relative rounded-lg p-3 transition-all duration-200 cursor-pointer hover:shadow-sm ${isTop3
                  ? `${rankStyle.bgColor} border ${rankStyle.borderColor}`
                  : 'bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50'
                  }`}
                onClick={() => onHashtagClick?.(hashtag.name)}
                data-testid={`item-hashtag-${hashtag.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Minimalist Rank Badge */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${isTop3 ? rankStyle.textColor : 'text-gray-500 dark:text-gray-400'}`}>
                      {rankStyle.badge}
                    </div>

                    {/* Minimalist Hashtag Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <Hash className={`w-4 h-4 flex-shrink-0 ${isTop3 ? rankStyle.textColor : 'text-gray-400 dark:text-gray-500'}`} />
                          <span
                            className={`font-medium truncate ${isTop3 ? rankStyle.textColor : 'text-gray-900 dark:text-gray-100'}`}
                            data-testid={`text-hashtag-name-${hashtag.id}`}
                          >
                            {hashtag.name}
                          </span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Clean Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span data-testid={`text-posts-count-${hashtag.id}`}>
                            {formatNumber(hashtag.postsCount)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span data-testid={`text-trending-score-${hashtag.id}`}>
                            {hashtag.trendingScore}
                          </span>
                        </div>

                        {hashtag.category && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                          >
                            {hashtag.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Simple Follow Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowToggle?.(hashtag.id, !hashtag.isFollowing);
                    }}
                    className={`h-8 w-8 rounded-full transition-colors ${hashtag.isFollowing
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    data-testid={`button-follow-hashtag-${hashtag.id}`}
                  >
                    <Users className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}

        </div>

        {hashtags.length > 10 && (
          <Button
            variant="ghost"
            className="w-full mt-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            data-testid="button-show-more-hashtags"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Show more topics
            <ArrowUpRight className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}