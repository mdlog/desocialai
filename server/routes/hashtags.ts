import { Router } from 'express';
import { storage } from '../storage.js';
import crypto from 'crypto';

const router = Router();

// Helper function for hashtag categorization
function getCategoryForHashtag(tag: string): string {
    const categories: { [key: string]: string } = {
        'defi': 'DeFi',
        'nft': 'NFT',
        'ai': 'AI',
        'blockchain': 'Infrastructure',
        'web3': 'Infrastructure',
        '0g': 'Infrastructure',
        'dao': 'Governance',
        'gaming': 'Gaming',
        'crypto': 'DeFi'
    };

    const tagLower = tag.toLowerCase();
    for (const [key, category] of Object.entries(categories)) {
        if (tagLower.includes(key)) {
            return category;
        }
    }
    return 'General';
}

/**
 * GET /api/hashtags/trending
 * Get trending hashtags based on post content
 */
router.get('/trending', async (req, res) => {
    try {
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10;

        // Get all posts and extract hashtags from content
        const posts = await storage.getPosts(1000, 0);
        const hashtagCounts = new Map<string, any>();

        console.log(`[Hashtags] Analyzing ${posts.length} posts for hashtag extraction...`);

        posts.forEach(post => {
            // Extract hashtags from post content using regex
            const content = post.content || '';
            const hashtagMatches = content.match(/#[\w]+/g);

            if (hashtagMatches) {
                hashtagMatches.forEach((hashtagWithSymbol: string) => {
                    const tag = hashtagWithSymbol.slice(1); // Remove # symbol

                    if (!hashtagCounts.has(tag)) {
                        hashtagCounts.set(tag, {
                            id: crypto.randomUUID(),
                            name: tag,
                            postsCount: 0,
                            trendingScore: 0,
                            isFollowing: false,
                            likesCount: 0,
                            commentsCount: 0,
                            category: getCategoryForHashtag(tag)
                        });
                    }

                    const current = hashtagCounts.get(tag);
                    current.postsCount += 1;
                    current.likesCount += post.likesCount || 0;
                    current.commentsCount += post.commentsCount || 0;

                    // Calculate trending score based on engagement
                    const engagementScore = (current.likesCount + current.commentsCount) / current.postsCount;
                    const recencyBonus = (Date.now() - new Date(post.createdAt).getTime()) < (24 * 60 * 60 * 1000) ? 1.5 : 1;
                    current.trendingScore = Math.round(engagementScore * recencyBonus * 10);
                });
            }
        });

        // Convert to array and sort by posts count first, then by trending score
        const trendingHashtags = Array.from(hashtagCounts.values())
            .sort((a, b) => {
                // First sort by posts count (descending)
                if (b.postsCount !== a.postsCount) {
                    return b.postsCount - a.postsCount;
                }
                // If posts count is equal, sort by trending score
                return b.trendingScore - a.trendingScore;
            })
            .slice(0, limit);

        console.log(`[Hashtags] Found ${hashtagCounts.size} unique hashtags, returning top ${trendingHashtags.length}`);

        res.json(trendingHashtags);
    } catch (error: any) {
        console.error('[Hashtags] Error fetching trending hashtags:', error);
        res.status(500).json({ message: 'Failed to fetch trending hashtags' });
    }
});

export default router;
