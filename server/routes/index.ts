import { Router } from 'express';
import usersRouter from './users.js';
import postsRouter from './posts.js';
import messagesRouter from './messages.js';
import web3Router from './web3.js';
import zgRouter from './zg.js';
import aiRouter from './ai.js';
import nftRouter from './nft.js';
import objectsRouter from './objects.js';
import hashtagsRouter from './hashtags.js';

const router = Router();

/**
 * Mount all route modules
 */
console.log('[ROUTES] Mounting route modules...');
router.use('/users', usersRouter);
router.use('/posts', postsRouter);
router.use('/messages', messagesRouter);
router.use('/web3', web3Router);
router.use('/zg', zgRouter);
router.use('/ai', aiRouter);
router.use('/nft', nftRouter);
router.use('/objects', objectsRouter);
router.use('/hashtags', hashtagsRouter);
console.log('[ROUTES] All route modules mounted successfully');

/**
 * Legacy /api/stats endpoint (proxy to /api/zg/stats)
 */
router.get('/stats', async (_req, res) => {
    try {
        const { storage } = await import('../storage.js');
        const stats = await storage.getNetworkStats();
        res.json(stats);
    } catch (error: any) {
        console.error('[Stats] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch network statistics'
        });
    }
});

export default router;
