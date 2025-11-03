import type { Request, Response, NextFunction } from 'express';

/**
 * Get wallet connection from session
 * @param req Express request object
 * @returns Wallet connection data
 */
export function getWalletConnection(req: any) {
    if (!req.session) {
        console.warn('[getWalletConnection] No session object found');
        return {
            connected: false,
            address: null,
            balance: null,
            network: null,
            chainId: null
        };
    }

    if (!req.session.walletConnection) {
        req.session.walletConnection = {
            connected: false,
            address: null,
            balance: null,
            network: null,
            chainId: null
        };
    }
    return req.session.walletConnection;
}

/**
 * Middleware to require wallet authentication
 * @param req Express request
 * @param res Express response
 * @param next Next function
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const walletConnection = getWalletConnection(req);
    if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
            message: "Wallet connection required",
            details: "Please connect your wallet to access this resource",
            code: "WALLET_NOT_CONNECTED"
        });
    }
    next();
}
