import { storage } from '../storage';
import crypto from 'crypto';

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirement: {
    type: 'posts' | 'followers' | 'likes' | 'comments' | 'verified';
    threshold: number;
  };
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Content Creation Badges
  { id: 'first-post', name: 'First Steps', description: 'Created your first post', category: 'Creator', rarity: 'common', requirement: { type: 'posts', threshold: 1 } },
  { id: 'content-creator', name: 'Content Creator', description: 'Created 10 posts', category: 'Creator', rarity: 'uncommon', requirement: { type: 'posts', threshold: 10 } },
  { id: 'prolific-writer', name: 'Prolific Writer', description: 'Created 50 posts', category: 'Creator', rarity: 'rare', requirement: { type: 'posts', threshold: 50 } },
  { id: 'content-master', name: 'Content Master', description: 'Created 100 posts', category: 'Creator', rarity: 'epic', requirement: { type: 'posts', threshold: 100 } },
  
  // Social Badges
  { id: 'social-butterfly', name: 'Social Butterfly', description: 'Gained 50 followers', category: 'Community', rarity: 'uncommon', requirement: { type: 'followers', threshold: 50 } },
  { id: 'influencer', name: 'Influencer', description: 'Gained 100 followers', category: 'Community', rarity: 'rare', requirement: { type: 'followers', threshold: 100 } },
  { id: 'celebrity', name: 'Celebrity', description: 'Gained 500 followers', category: 'Community', rarity: 'epic', requirement: { type: 'followers', threshold: 500 } },
  { id: 'legend', name: 'Legend', description: 'Gained 1000 followers', category: 'Community', rarity: 'legendary', requirement: { type: 'followers', threshold: 1000 } },
  
  // Engagement Badges
  { id: 'liked', name: 'Well Liked', description: 'Received 100 likes', category: 'Achievement', rarity: 'uncommon', requirement: { type: 'likes', threshold: 100 } },
  { id: 'popular', name: 'Popular', description: 'Received 500 likes', category: 'Achievement', rarity: 'rare', requirement: { type: 'likes', threshold: 500 } },
  { id: 'viral', name: 'Viral', description: 'Received 1000 likes', category: 'Achievement', rarity: 'epic', requirement: { type: 'likes', threshold: 1000 } },
  
  // Verification Badge
  { id: 'verified-user', name: 'Verified User', description: 'Connected wallet and verified identity', category: 'Security', rarity: 'uncommon', requirement: { type: 'verified', threshold: 1 } },
];

class BadgeService {
  async checkAndAwardBadges(userId: string): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user) return;

      const currentBadges = (user.skillBadges as any[]) || [];
      const earnedBadgeIds = currentBadges.map((b: any) => b.id);

      // Get user stats
      const stats = await storage.getUserStats(userId);
      const postsCount = stats?.postsCount || 0;
      const followersCount = stats?.followersCount || 0;
      
      // Calculate total likes received
      const userPosts = await storage.getPostsByUser(userId, 1000, 0);
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likesCount || 0), 0);

      // Check each badge definition
      for (const badgeDef of BADGE_DEFINITIONS) {
        // Skip if already earned
        if (earnedBadgeIds.includes(badgeDef.id)) continue;

        let shouldAward = false;

        switch (badgeDef.requirement.type) {
          case 'posts':
            shouldAward = postsCount >= badgeDef.requirement.threshold;
            break;
          case 'followers':
            shouldAward = followersCount >= badgeDef.requirement.threshold;
            break;
          case 'likes':
            shouldAward = totalLikes >= badgeDef.requirement.threshold;
            break;
          case 'verified':
            shouldAward = !!user.walletAddress && !!user.isVerified;
            break;
        }

        if (shouldAward) {
          await this.awardBadge(userId, badgeDef);
          console.log(`[Badge] ✅ Awarded "${badgeDef.name}" to user ${userId}`);
        }
      }
    } catch (error) {
      console.error('[Badge] Error checking badges:', error);
    }
  }

  private async awardBadge(userId: string, badgeDef: BadgeDefinition): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    const currentBadges = (user.skillBadges as any[]) || [];
    
    const newBadge = {
      id: badgeDef.id,
      name: badgeDef.name,
      description: badgeDef.description,
      category: badgeDef.category,
      rarity: badgeDef.rarity,
      earnedAt: new Date().toISOString(),
      contractAddress: `0x${crypto.randomBytes(20).toString('hex')}`, // Mock contract for now
      tokenId: crypto.randomBytes(8).toString('hex')
    };

    currentBadges.push(newBadge);

    await storage.updateUser(userId, {
      skillBadges: currentBadges,
      reputationScore: (user.reputationScore || 0) + this.getBadgeReputationPoints(badgeDef.rarity)
    });
  }

  private getBadgeReputationPoints(rarity: string): number {
    const points = {
      common: 50,
      uncommon: 100,
      rare: 200,
      epic: 500,
      legendary: 1000
    };
    return points[rarity as keyof typeof points] || 50;
  }

  async getUserBadges(userId: string): Promise<any[]> {
    const user = await storage.getUser(userId);
    return (user?.skillBadges as any[]) || [];
  }
}

export const badgeService = new BadgeService();
