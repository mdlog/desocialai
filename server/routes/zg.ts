import { Router } from 'express';
import { zgStorageService } from '../services/zg-storage.js';
import { zgDAService } from '../services/zg-da.js';
import { zgComputeService } from '../services/zg-compute-real.js';
import { zgChainService } from '../services/zg-chain.js';

const router = Router();

/**
 * GET /api/zg/storage/stats
 * Get 0G Storage statistics
 */
router.get('/storage/stats', async (req, res) => {
    try {
        const stats = await zgStorageService.getStorageStats();
        res.json(stats);
    } catch (error: any) {
        console.error('[0G Storage Stats] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch storage statistics'
        });
    }
});

/**
 * GET /api/zg/da/stats
 * Get 0G DA (Data Availability) statistics
 */
router.get('/da/stats', async (req, res) => {
    try {
        const stats = await zgDAService.getDAStats();
        res.json(stats);
    } catch (error: any) {
        console.error('[0G DA Stats] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch DA statistics'
        });
    }
});

/**
 * GET /api/zg/compute/stats
 * Get 0G Compute statistics
 */
router.get('/compute/stats', async (req, res) => {
    try {
        const stats = await zgComputeService.getComputeStats();
        res.json(stats);
    } catch (error: any) {
        console.error('[0G Compute Stats] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch compute statistics'
        });
    }
});

/**
 * GET /api/zg/chain/stats
 * Get 0G Chain statistics
 */
router.get('/chain/stats', async (req, res) => {
    try {
        console.log('[0G Chain Stats] Request received');
        const stats = await zgChainService.getChainInfo();
        console.log('[0G Chain Stats] Stats retrieved:', stats);
        res.json(stats);
    } catch (error: any) {
        console.error('[0G Chain Stats] Error:', error);
        console.error('[0G Chain Stats] Error stack:', error.stack);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch chain statistics'
        });
    }
});

/**
 * GET /api/zg/compute/status
 * Get 0G Compute environment status
 */
router.get('/compute/status', async (req, res) => {
    try {
        const status = zgComputeService.getEnvironmentStatus();
        res.json(status);
    } catch (error: any) {
        console.error('[0G Compute Status] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch compute status'
        });
    }
});

/**
 * POST /api/zg/compute/initialize
 * Initialize 0G Compute account with funds
 */
router.post('/compute/initialize', async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount) {
            return res.status(400).json({
                message: 'Amount is required',
                details: 'Please provide amount in OG tokens (minimum 10 OG recommended)'
            });
        }

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat) || amountFloat < 0.1) {
            return res.status(400).json({
                message: 'Invalid amount',
                details: 'Amount must be at least 0.1 OG (10 OG recommended for production)'
            });
        }

        console.log(`[0G Compute Init] Initializing account with ${amount} OG...`);

        // Add funds to create/fund account
        const result = await zgComputeService.addFunds(amount);

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                txHash: result.txHash,
                amount: amount,
                note: 'Account initialized successfully. You can now use 0G Compute for AI generation.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.error || 'Failed to initialize account',
                note: 'You can still use AI features in simulation mode or with OpenAI fallback.'
            });
        }
    } catch (error: any) {
        console.error('[0G Compute Init] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to initialize 0G Compute account'
        });
    }
});

/**
 * GET /api/zg/compute/connection
 * Check 0G Compute connection status
 */
router.get('/compute/connection', async (req, res) => {
    try {
        const connection = await zgComputeService.checkConnection();
        res.json(connection);
    } catch (error: any) {
        console.error('[0G Compute Connection] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to check connection'
        });
    }
});

/**
 * GET /api/zg/stats
 * Get all 0G network statistics (combined)
 */
router.get('/stats', async (req, res) => {
    try {
        const [storageStats, daStats, computeStats, chainStats] = await Promise.all([
            zgStorageService.getStorageStats().catch(err => {
                console.error('[Stats] Storage error:', err);
                return null;
            }),
            zgDAService.getDAStats().catch(err => {
                console.error('[Stats] DA error:', err);
                return null;
            }),
            zgComputeService.getComputeStats().catch(err => {
                console.error('[Stats] Compute error:', err);
                return null;
            }),
            zgChainService.getChainInfo().catch(err => {
                console.error('[Stats] Chain error:', err);
                return null;
            })
        ]);

        res.json({
            storage: storageStats,
            da: daStats,
            compute: computeStats,
            chain: chainStats
        });
    } catch (error: any) {
        console.error('[0G Stats] Error:', error);
        res.status(500).json({
            message: error.message,
            error: 'Failed to fetch network statistics'
        });
    }
});

export default router;
