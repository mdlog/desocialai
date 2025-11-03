import { Router } from 'express';
import multer from 'multer';
import { storage } from '../storage.js';
import { zgStorageService } from '../services/zg-storage.js';
import { zgDAService } from '../services/zg-da.js';
import { badgeService } from '../services/badge-service.js';
import { getWalletConnection } from '../utils/auth.js';
import { broadcastToAll } from '../utils/websocket.js';
import { ethers } from 'ethers';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }
});

/**
 * GET /api/posts
 * Get all posts with pagination
 */
router.get('/', async (req, res) => {
    try {
        console.log('[POSTS] GET /api/posts called');
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string, 10) : 0;
        const posts = await storage.getPosts(limit, offset);
        console.log('[POSTS] Returning', posts.length, 'posts');
        res.json(posts);
    } catch (error: any) {
        console.error('[POSTS] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/posts/feed
 * Get global feed with user-specific data
 */
router.get('/feed', async (req, res) => {
    try {
        console.log('[POSTS FEED] GET /api/posts/feed called');
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string, 10) : 0;
        console.log('[POSTS FEED] Params:', { limit, offset });

        const walletData = req.session.walletConnection;
        let currentUserId: string | undefined = undefined;

        if (walletData?.connected && walletData.address) {
            const user = await storage.getUserByWalletAddress(walletData.address);
            currentUserId = user?.id;
            console.log('[POSTS FEED] Current user:', currentUserId);
        }

        console.log('[POSTS FEED] Calling storage.getGlobalFeed...');
        const posts = await storage.getGlobalFeed(currentUserId, limit, offset);
        console.log('[POSTS FEED] Got posts:', posts.length);
        console.log('[POSTS FEED] Returning', posts.length, 'posts');
        res.json(posts);
    } catch (error: any) {
        console.error('[POSTS FEED] Error:', error);
        console.error('[POSTS FEED] Error stack:', error.stack);
        res.status(500).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * GET /api/posts/user/:userId
 * Get posts by specific user
 */
router.get('/user/:userId', async (req, res) => {
    try {
        console.log(`[ROUTES DEBUG] GET /api/posts/user/${req.params.userId} called`);
        const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : 10;
        const offset = req.query.offset ? Number.parseInt(req.query.offset as string, 10) : 0;

        const posts = await storage.getPostsByUser(req.params.userId, limit, offset);

        const walletConnection = getWalletConnection(req);
        const currentUserId = walletConnection.connected && walletConnection.address
            ? (await storage.getUserByWalletAddress(walletConnection.address))?.id
            : undefined;

        const enrichedPosts = await Promise.all(
            posts.map(async (post) => {
                const author = await storage.getUser(post.authorId);
                const isLiked = currentUserId ? await storage.isPostLiked(currentUserId, post.id) : false;
                const isReposted = currentUserId ? await storage.isPostReposted(currentUserId, post.id) : false;

                return {
                    ...post,
                    author: author || {
                        id: post.authorId,
                        username: 'unknown',
                        displayName: 'Unknown User',
                        avatar: null,
                        bio: null,
                        walletAddress: null,
                        isVerified: false,
                        followingCount: 0,
                        followersCount: 0,
                        postsCount: 0,
                        createdAt: new Date()
                    },
                    isLiked,
                    isReposted
                };
            })
        );

        res.json(enrichedPosts);
    } catch (error: any) {
        console.error(`[ROUTES ERROR] Error in /api/posts/user/:userId:`, error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/posts
 * Create a new post
 */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log("[UPLOAD ENDPOINT] POST /api/posts called");

        const walletData = req.session.walletConnection;
        if (!walletData || !walletData.connected || !walletData.address) {
            return res.status(401).json({
                message: "Wallet connection required",
                details: "You must connect your wallet to create posts",
                code: "WALLET_NOT_CONNECTED"
            });
        }

        const postData = {
            content: req.body.content,
            signature: req.body.signature,
            message: req.body.message,
            timestamp: req.body.timestamp ? Number.parseInt(req.body.timestamp) : undefined,
            address: req.body.address
        };

        if ((!postData.content || postData.content.trim() === '') && !req.file) {
            return res.status(400).json({
                message: "Content or media is required",
                details: "Post must contain either text content or media file"
            });
        }

        const skipSignature = process.env.DISABLE_SIGNATURE_CHECK === 'true' && process.env.NODE_ENV === 'development';

        if (!skipSignature && (!postData.signature || !postData.message || !postData.address || !postData.timestamp)) {
            return res.status(400).json({
                message: "Signature required",
                details: "All posts must be signed with your wallet",
                code: "SIGNATURE_REQUIRED"
            });
        }

        if (!skipSignature) {
            try {
                const recoveredAddress = ethers.verifyMessage(postData.message, postData.signature);
                const matchesFormAddress = recoveredAddress.toLowerCase() === postData.address.toLowerCase();
                const matchesWalletAddress = recoveredAddress.toLowerCase() === walletData.address.toLowerCase();

                if (!matchesFormAddress && !matchesWalletAddress) {
                    return res.status(401).json({
                        message: "Invalid signature",
                        details: "The signature does not match your wallet address",
                        code: "SIGNATURE_MISMATCH"
                    });
                }
            } catch (error: any) {
                return res.status(401).json({
                    message: "Signature verification failed",
                    details: error.message,
                    code: "SIGNATURE_VERIFICATION_FAILED"
                });
            }
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const storageResult = await zgStorageService.storeContent(postData.content || '', {
            type: 'post',
            userId: user.id
        });

        if (!storageResult.success || !storageResult.hash) {
            return res.status(500).json({
                message: "Failed to upload to 0G Storage",
                error: storageResult.error
            });
        }

        let mediaStorageHash = undefined;
        let mediaTransactionHash = undefined;

        if (req.file) {
            const mediaResult = await zgStorageService.storeContent(req.file.buffer, {
                type: 'image',
                userId: user.id,
                mimeType: req.file.mimetype
            });
            if (mediaResult.success && mediaResult.hash) {
                mediaStorageHash = mediaResult.hash;
                mediaTransactionHash = mediaResult.transactionHash;
            }
        }

        const postData_create: any = {
            content: postData.content || '',
            authorId: user.id,
            imageUrl: null,
            mediaType: req.file?.mimetype || null,
            storageHash: storageResult.hash
        };

        if (mediaStorageHash) {
            postData_create.mediaStorageHash = mediaStorageHash;
        }

        if (storageResult.transactionHash || mediaTransactionHash) {
            postData_create.transactionHash = storageResult.transactionHash || mediaTransactionHash;
        }

        const post = await storage.createPost(postData_create);

        await zgDAService.recordInteraction('post', user.id, post.id, {
            content: postData.content,
            storageHash: storageResult.hash
        });

        badgeService.checkAndAwardBadges(user.id).catch(err =>
            console.error('[Badge] Error checking badges:', err)
        );

        broadcastToAll({
            type: 'new_post',
            post: {
                ...post,
                author: user
            }
        });

        res.json(post);
    } catch (error: any) {
        console.error('[Post Creation] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/posts/:id
 * Get a specific post by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const post = await storage.getPost(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.json(post);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/posts/:id/like
 * Like a post
 */
router.post('/:id/like', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const like = await storage.likePost(user.id, req.params.id);

        const post = await storage.getPost(req.params.id);
        if (post) {
            badgeService.checkAndAwardBadges(post.authorId).catch(err =>
                console.error('[Badge] Error checking badges:', err)
            );
        }

        res.json(like);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * DELETE /api/posts/:id/like
 * Unlike a post
 */
router.delete('/:id/like', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await storage.unlikePost(user.id, req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/posts/:id/repost
 * Repost a post
 */
router.post('/:id/repost', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const repost = await storage.repostPost(user.id, req.params.id);
        res.json(repost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/posts/:id/comment
 * Comment on a post
 */
router.post('/:id/comment', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { content } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const comment = await storage.createComment({
            content,
            postId: req.params.id,
            authorId: user.id
        });

        res.json(comment);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/posts/:id/retry-storage
 * Retry uploading post to 0G Storage
 */
router.post('/:id/retry-storage', async (req, res) => {
    try {
        const post = await storage.getPost(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const storageResult = await zgStorageService.storeContent(post.content, {
            type: 'post',
            userId: post.authorId
        });

        if (!storageResult.success || !storageResult.hash) {
            return res.status(500).json({
                message: "Failed to upload to 0G Storage",
                error: storageResult.error
            });
        }

        await storage.updatePost(post.id, {
            storageHash: storageResult.hash,
            transactionHash: storageResult.transactionHash
        });

        const updatedPost = await storage.getPost(post.id);
        res.json(updatedPost);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
