import { Router } from 'express';
import { storage } from '../storage.js';
import { badgeService } from '../services/badge-service.js';

const router = Router();

/**
 * GET /api/nft/gallery/:userId
 * Get NFT gallery for a user
 */
router.get('/gallery/:userId', async (req, res) => {
    try {
        const user = await storage.getUser(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // TODO: Implement NFT gallery fetching
        const nfts: any[] = [];

        res.json({
            userId: user.id,
            username: user.username,
            nfts
        });
    } catch (error: any) {
        console.error('[NFT Gallery] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/nft/mint
 * Mint a new NFT
 */
router.post('/mint', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, description, imageUrl } = req.body;

        if (!name) {
            return res.status(400).json({ message: "NFT name is required" });
        }

        // TODO: Implement NFT minting
        const nft = {
            id: Date.now().toString(),
            name,
            description: description || '',
            imageUrl: imageUrl || null,
            owner: user.id,
            createdAt: new Date()
        };

        res.json(nft);
    } catch (error: any) {
        console.error('[NFT Mint] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/nft/badges/:userId
 * Get badges for a user
 */
router.get('/badges/:userId', async (req, res) => {
    try {
        const user = await storage.getUser(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const badges = await badgeService.getUserBadges(user.id);

        res.json({
            userId: user.id,
            username: user.username,
            badges
        });
    } catch (error: any) {
        console.error('[Badges] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/nft/badges/check
 * Check and award badges for a user
 */
router.post('/badges/check', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const newBadges = await badgeService.checkAndAwardBadges(user.id);

        res.json({
            userId: user.id,
            newBadges
        });
    } catch (error: any) {
        console.error('[Check Badges] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
