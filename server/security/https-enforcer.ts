import { Request, Response, NextFunction } from 'express';

/**
 * HTTPS Enforcer - Ensures sensitive data is transmitted over HTTPS
 * Redirects HTTP requests to HTTPS in production
 */

export class HTTPSEnforcer {
    /**
     * Middleware to enforce HTTPS in production
     */
    static middleware(options: {
        enabled?: boolean;
        trustProxy?: boolean;
        excludePaths?: string[];
    } = {}) {
        const {
            enabled = process.env.NODE_ENV === 'production',
            trustProxy = true,
            excludePaths = ['/health', '/health/live', '/health/ready']
        } = options;

        return (req: Request, res: Response, next: NextFunction) => {
            // Skip if HTTPS enforcement is disabled
            if (!enabled) {
                return next();
            }

            // Skip health check endpoints
            if (excludePaths.some(path => req.path === path)) {
                return next();
            }

            // Check if request is already HTTPS
            const isSecure = trustProxy
                ? req.headers['x-forwarded-proto'] === 'https' || req.secure
                : req.secure;

            if (!isSecure) {
                // Redirect to HTTPS
                const httpsUrl = `https://${req.hostname}${req.url}`;
                return res.redirect(301, httpsUrl);
            }

            // Set security headers for HTTPS
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

            next();
        };
    }

    /**
     * Check if request is over HTTPS
     */
    static isSecure(req: Request, trustProxy: boolean = true): boolean {
        if (trustProxy) {
            return req.headers['x-forwarded-proto'] === 'https' || req.secure;
        }
        return req.secure;
    }

    /**
     * Middleware to warn about sensitive data over HTTP
     */
    static warnInsecure(sensitiveEndpoints: string[] = []) {
        return (req: Request, res: Response, next: NextFunction) => {
            const isSensitive = sensitiveEndpoints.some(endpoint =>
                req.path.startsWith(endpoint)
            );

            if (isSensitive && !this.isSecure(req)) {
                console.warn(
                    `[SECURITY WARNING] Sensitive endpoint ${req.path} accessed over HTTP. ` +
                    `This should only happen in development.`
                );
            }

            next();
        };
    }
}
