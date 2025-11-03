import { Router } from 'express';
import { getWalletConnection } from '../utils/auth.js';
import { zgChainService } from '../services/zg-chain.js';

const router = Router();

/**
 * GET /api/web3/status
 * Get Web3 connection status and network info
 */
router.get('/status', async (req, res) => {
    try {
        const walletConnection = getWalletConnection(req);

        // Get real-time chain info
        const chainInfo = await zgChainService.getChainInfo();

        res.json({
            connected: walletConnection.connected || false,
            address: walletConnection.address || null,
            network: chainInfo.networkName || '0G Mainnet',
            chainId: walletConnection.chainId || chainInfo.chainId,
            balance: walletConnection.balance || null,
            blockHeight: chainInfo.blockHeight,
            gasPrice: chainInfo.gasPrice
        });
    } catch (error: any) {
        console.error('[Web3 Status] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/web3/wallet
 * Get wallet information
 */
router.get('/wallet', async (req, res) => {
    try {
        const walletConnection = getWalletConnection(req);

        if (!walletConnection.connected || !walletConnection.address) {
            return res.json({
                connected: false,
                address: null,
                balance: null,
                network: null,
                chainId: null
            });
        }

        res.json({
            connected: true,
            address: walletConnection.address,
            balance: walletConnection.balance,
            network: walletConnection.network,
            chainId: walletConnection.chainId
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/web3/connect
 * Connect wallet
 */
router.post('/connect', async (req, res) => {
    try {
        const { address, chainId, network } = req.body;

        if (!address) {
            return res.status(400).json({ message: "Wallet address is required" });
        }

        // Get balance from 0G Chain
        let balance = null;
        try {
            // TODO: Implement getBalance method in zgChainService
            balance = '0';
        } catch (error) {
            console.warn('[Web3] Failed to get balance:', error);
        }

        // Store wallet connection in session
        req.session.walletConnection = {
            connected: true,
            address,
            chainId: chainId || null,
            network: network || null,
            balance
        };

        // Save session
        await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('[Web3] Wallet connected:', address);

        res.json({
            success: true,
            address,
            balance,
            chainId,
            network
        });
    } catch (error: any) {
        console.error('[Web3] Connect error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/web3/disconnect
 * Disconnect wallet
 */
router.post('/disconnect', async (req, res) => {
    try {
        // Clear wallet connection from session
        if (req.session.walletConnection) {
            req.session.walletConnection = {
                connected: false,
                address: null,
                chainId: null,
                network: null,
                balance: null
            };
        }

        // Save session
        await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('[Web3] Wallet disconnected');

        res.json({ success: true });
    } catch (error: any) {
        console.error('[Web3] Disconnect error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
