import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReputationSystemSkeleton } from "@/components/ui/loading-skeletons";
import { Crown, Star, Zap, TrendingUp, Users, Heart } from "lucide-react";

interface ReputationSystemProps {
  user: {
    id: string;
    reputationScore?: number;
    postsCount?: number;
    followersCount?: number;
    walletAddress?: string;
  };
  isLoading?: boolean;
}

export function ReputationSystem({ user, isLoading = false }: ReputationSystemProps) {
  if (isLoading) {
    return <ReputationSystemSkeleton />;
  }

  const reputation = user.reputationScore || 0;

  // Calculate reputation level and tier
  const getReputationTier = (score: number) => {
    if (score >= 10000) return { name: "Legend", color: "from-yellow-400 to-orange-500", icon: Crown };
    if (score >= 5000) return { name: "Expert", color: "from-purple-400 to-pink-500", icon: Star };
    if (score >= 2000) return { name: "Veteran", color: "from-blue-400 to-indigo-500", icon: Zap };
    if (score >= 500) return { name: "Active", color: "from-green-400 to-blue-500", icon: TrendingUp };
    if (score >= 100) return { name: "Member", color: "from-gray-400 to-gray-600", icon: Users };
    return { name: "Newcomer", color: "from-gray-300 to-gray-500", icon: Heart };
  };

  const tier = getReputationTier(reputation);
  const TierIcon = tier.icon;

  // Calculate progress to next level
  const getNextLevelProgress = (score: number) => {
    const levels = [0, 100, 500, 2000, 5000, 10000];
    const currentLevelIndex = levels.findIndex(level => score < level) - 1;

    if (currentLevelIndex === -1) return { progress: 100, nextLevel: 10000 };
    if (currentLevelIndex === levels.length - 2) return { progress: 100, nextLevel: null };

    const currentLevel = levels[currentLevelIndex] || 0;
    const nextLevel = levels[currentLevelIndex + 1];
    const progress = ((score - currentLevel) / (nextLevel - currentLevel)) * 100;

    return { progress: Math.min(progress, 100), nextLevel };
  };

  const { progress, nextLevel } = getNextLevelProgress(reputation);

  // Use real reputation score from database
  // Reputation is automatically calculated and stored when:
  // - User creates posts
  // - User gains followers
  // - User earns badges
  // - User performs on-chain activities
  const reputationBreakdown = {
    total: reputation,
    display: reputation.toLocaleString()
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Reputation Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
              <TierIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reputation Score
              </h3>
              <Badge
                variant="secondary"
                className={`bg-gradient-to-r ${tier.color} text-white border-0`}
              >
                {tier.name}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {reputation.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Progress to {getReputationTier(nextLevel).name}</span>
              <span>{nextLevel - reputation} points needed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Reputation Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Reputation is earned through:
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">Creating Posts</span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">Gaining Followers</span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">Earning Badges</span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">On-Chain Activity</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}