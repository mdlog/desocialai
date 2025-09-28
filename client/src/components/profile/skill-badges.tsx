import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SkillBadgesSkeleton } from "@/components/ui/loading-skeletons";
import {
  Code,
  Palette,
  TrendingUp,
  Shield,
  Gamepad2,
  Music,
  Camera,
  Rocket,
  Brain,
  Users,
  Award,
  Plus,
  ExternalLink
} from "lucide-react";

interface SkillBadge {
  id: string;
  name: string;
  description: string;
  category: string;
  earnedAt: string;
  contractAddress?: string;
  tokenId?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface SkillBadgesProps {
  user: {
    id: string;
    skillBadges?: SkillBadge[];
  };
  isOwner?: boolean;
  isLoading?: boolean;
}

export function SkillBadges({ user, isOwner = false, isLoading = false }: SkillBadgesProps) {
  if (isLoading) {
    return <SkillBadgesSkeleton />;
  }

  const badges = user.skillBadges || [];

  // Available badge categories with icons
  const badgeIcons = {
    'Developer': Code,
    'Creator': Palette,
    'Trader': TrendingUp,
    'Security': Shield,
    'Gaming': Gamepad2,
    'Music': Music,
    'Photography': Camera,
    'Innovation': Rocket,
    'AI': Brain,
    'Community': Users,
    'Achievement': Award,
  };

  // Rarity colors
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-blue-500',
    rare: 'from-blue-400 to-purple-500',
    epic: 'from-purple-400 to-pink-500',
    legendary: 'from-yellow-400 to-orange-500',
  };

  // Sample available badges to earn
  const availableBadges = [
    { name: 'Smart Contract Developer', category: 'Developer', rarity: 'epic' as const },
    { name: 'DeFi Pioneer', category: 'Trader', rarity: 'rare' as const },
    { name: 'NFT Creator', category: 'Creator', rarity: 'uncommon' as const },
    { name: 'Community Builder', category: 'Community', rarity: 'rare' as const },
    { name: 'Security Auditor', category: 'Security', rarity: 'legendary' as const },
    { name: 'AI Innovator', category: 'AI', rarity: 'epic' as const },
  ];

  const getBadgeIcon = (category: string) => {
    const IconComponent = badgeIcons[category as keyof typeof badgeIcons] || Award;
    return IconComponent;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Skill Badges
            </CardTitle>
            <CardDescription>
              On-chain verified achievements and skills
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Earn Badge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Available Skill Badges</DialogTitle>
                  <DialogDescription>
                    Complete challenges and verify your skills to earn these badges
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {availableBadges.map((badge, index) => {
                    const IconComponent = getBadgeIcon(badge.category);
                    return (
                      <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]} flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {badge.name}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {badge.category}
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3" variant="outline">
                          Start Challenge
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const IconComponent = getBadgeIcon(badge.category);
              return (
                <div
                  key={badge.id}
                  className="group relative p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {/* Badge Icon */}
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>

                  {/* Badge Info */}
                  <div className="text-center space-y-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {badge.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={`text-xs bg-gradient-to-r ${rarityColors[badge.rarity]} text-white border-0`}
                    >
                      {badge.rarity}
                    </Badge>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* On-chain verification */}
                  {badge.contractAddress && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        window.open(`https://etherscan.io/address/${badge.contractAddress}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isOwner ? "No badges earned yet" : "No badges to display"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {isOwner
                ? "Start completing challenges and verify your skills to earn your first badge!"
                : "This user hasn't earned any skill badges yet."
              }
            </p>
            {isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="mt-4">
                    Explore Badges
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Available Skill Badges</DialogTitle>
                    <DialogDescription>
                      Complete challenges and verify your skills to earn these badges
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {availableBadges.map((badge, index) => {
                      const IconComponent = getBadgeIcon(badge.category);
                      return (
                        <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]} flex items-center justify-center`}>
                              <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {badge.name}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {badge.category}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" className="w-full mt-3" variant="outline">
                            Start Challenge
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}