import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 */

export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();

  /**
   * Generate CSRF token for session
   */
  static generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour
    this.tokens.set(sessionId, { token, expires });
    return token;
  }

  /**
   * Verify CSRF token
   */
  static verifyToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored) return false;
    if (stored.expires < Date.now()) {
      this.tokens.delete(sessionId);
      return false;
    }
    return stored.token === token;
  }

  /**
   * Middleware to check CSRF token on state-changing requests
   */
  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Skip CSRF for public endpoints
      const publicPaths = ['/api/web3/connect', '/api/web3/status'];
      if (publicPaths.some(path => req.path.startsWith(path))) {
        return next();
      }

      const token = req.headers['x-csrf-token'] as string;
      const sessionId = req.sessionID;

      if (!token || !this.verifyToken(sessionId, token)) {
        return res.status(403).json({ 
          message: 'Invalid CSRF token',
          code: 'CSRF_VALIDATION_FAILED'
        });
      }

      next();
    };
  }

  /**
   * Endpoint to get CSRF token
   */
  static getTokenEndpoint(req: Request, res: Response) {
    const token = CSRFProtection.generateToken(req.sessionID);
    res.json({ csrfToken: token });
  }
}
