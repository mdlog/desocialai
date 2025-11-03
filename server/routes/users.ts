import { Router } from 'express';
import { storage } from '../storage.js';
import { getWalletConnection } from '../utils/auth.js';
import { badgeService } from '../services/badge-service.js';
import multer from 'multer';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }
});

/**
 * GET /api/users/me
 * Get current user profile based on connected wallet
 */
router.get('/me', async (req, res) => {
    const walletConnection = getWalletConnection(req);

    console.log('[USERS/ME] Session ID:', req.sessionID);
    console.log('[USERS/ME] Session walletConnection:', JSON.stringify(walletConnection));

    if (!walletConnection.connected || !walletConnection.address) {
        console.log('[USERS/ME] ❌ Wallet not connected');
        return res.status(401).json({
            message: "Wallet connection required",
            details: "Please connect your wallet to access user profile",
            code: "WALLET_NOT_CONNECTED",
            sessionId: req.sessionID
        });
    }

    let user = await storage.getUserByWalletAddress(walletConnection.address);

    if (!user) {
        const walletShort = walletConnection.address.slice(0, 6) + '...' + walletConnection.address.slice(-4);
        user = await storage.createUser({
            username: `user_${walletShort.toLowerCase()}`,
            displayName: `0G User ${walletShort}`,
            email: null,
            bio: `Decentralized user on 0G Chain • Wallet: ${walletShort}`,
            avatar: null,
            walletAddress: walletConnection.address,
            isVerified: true,
            followingCount: 0,
            followersCount: 0,
            postsCount: 0
        });
        console.log(`Created new user for wallet ${walletConnection.address}: ${user.id}`);
    } else {
        if (storage.syncUserCounts && user) {
            console.log(`[COUNT SYNC] Syncing counts for user: ${user.id}`);
            await storage.syncUserCounts(user.id);
            const updatedUser = await storage.getUserByWalletAddress(walletConnection.address);
            if (updatedUser) {
                user = updatedUser;
            }
        }
    }

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.json(user);
});

/**
 * GET /api/users/search
 * Search users by query parameter
 */
router.get('/search', async (req, res) => {
    const query = req.query.q as string;
    console.log('[USER SEARCH] Query received:', query);

    if (!query || query.trim().length < 2) {
        console.log('[USER SEARCH] Query too short, returning empty array');
        return res.json([]);
    }

    const users = await storage.searchUsers(query);
    console.log('[USER SEARCH] Found users:', users.length);
    res.json(users);
});

/**
 * GET /api/users/search/:query
 * Legacy endpoint with path parameter
 */
router.get('/search/:query', async (req, res) => {
    const users = await storage.searchUsers(req.params.query);
    res.json(users);
});

/**
 * GET /api/users/suggested
 * Get suggested users to follow
 */
router.get('/suggested', async (req, res) => {
    try {
        const limit = Number.parseInt(req.query.limit as string) || 5;
        const walletConnection = getWalletConnection(req);
        let currentUserId: string | undefined;

        if (walletConnection.connected && walletConnection.address) {
            const currentUser = await storage.getUserByWalletAddress(walletConnection.address);
            currentUserId = currentUser?.id;
        }

        const recentPosts = await storage.getPosts(100, 0);
        const userIds = Array.from(new Set(recentPosts.map((post: any) => post.authorId)));

        const usersPromises = userIds.map((id: string) => storage.getUser(id));
        const users = (await Promise.all(usersPromises)).filter(Boolean);

        const suggestedUsers = users
            .filter((user: any) => user.id !== currentUserId)
            .sort((a: any, b: any) => (b.followersCount || 0) - (a.followersCount || 0))
            .slice(0, limit)
            .map((user: any) => ({
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                bio: user.bio,
                isVerified: user.isVerified,
                followersCount: user.followersCount,
                postsCount: user.postsCount,
                isFollowing: false
            }));

        if (currentUserId) {
            for (const user of suggestedUsers) {
                const isFollowing = await storage.isFollowing(currentUserId, user.id);
                user.isFollowing = isFollowing;
            }
        }

        res.json(suggestedUsers);
    } catch (error: any) {
        console.error('[Suggested Users] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/users/profile/:username
 * Get user profile by username
 */
router.get('/profile/:username', async (req, res) => {
    try {
        const user = await storage.getUserByUsername(req.params.username);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const user = await storage.getUser(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/users/:userId/stats
 * Get user statistics
 */
router.get('/:userId/stats', async (req, res) => {
    try {
        const user = await storage.getUser(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const stats = {
            postsCount: user.postsCount || 0,
            followersCount: user.followersCount || 0,
            followingCount: user.followingCount || 0,
            likesReceived: 0
        };

        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/users/:userId/follow
 * Follow a user
 */
router.post('/:userId/follow', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const currentUser = await storage.getUserByWalletAddress(walletData.address);
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }

        const targetUserId = req.params.userId;
        if (currentUser.id === targetUserId) {
            return res.status(400).json({ message: "Cannot follow yourself" });
        }

        const follow = await storage.followUser(currentUser.id, targetUserId);

        badgeService.checkAndAwardBadges(targetUserId).catch(err =>
            console.error('[Badge] Error checking badges after follow:', err)
        );

        const targetUser = await storage.getUser(targetUserId);
        if (targetUser) {
            await storage.updateUser(targetUserId, {
                reputationScore: (targetUser.reputationScore || 0) + 5
            });
        }

        res.json(follow);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/users/:userId/follow
 * Unfollow a user
 */
router.delete('/:userId/follow', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const currentUser = await storage.getUserByWalletAddress(walletData.address);
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }

        const targetUserId = req.params.userId;
        await storage.unfollowUser(currentUser.id, targetUserId);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/users/:id/sync-counts
 * Sync user counts (debug endpoint)
 */
router.post('/:id/sync-counts', async (req, res) => {
    try {
        const userId = req.params.id;
        if (storage.syncUserCounts) {
            await storage.syncUserCounts(userId);
            const user = await storage.getUser(userId);
            res.json({
                success: true,
                user: user ? {
                    id: user.id,
                    postsCount: user.postsCount,
                    followingCount: user.followingCount,
                    followersCount: user.followersCount
                } : null
            });
        } else {
            res.status(400).json({ error: "syncUserCounts not available" });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
