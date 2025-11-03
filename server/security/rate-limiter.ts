import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiting Middleware
 */

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private static requests = new Map<string, number[]>();

  /**
   * Create rate limiter middleware
   */
  static create(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Get existing requests for this identifier
      let timestamps = this.requests.get(identifier) || [];

      // Filter out old requests
      timestamps = timestamps.filter(ts => ts > windowStart);

      // Check if limit exceeded
      if (timestamps.length >= config.maxRequests) {
        console.warn(`[RATE LIMIT] ⚠️  IP ${identifier} exceeded limit: ${timestamps.length}/${config.maxRequests} requests in ${config.windowMs}ms`);
        console.warn(`[RATE LIMIT] Path: ${req.method} ${req.path}`);
        return res.status(429).json({
          message: 'Too many requests',
          retryAfter: Math.ceil((timestamps[0] + config.windowMs - now) / 1000)
        });
      }

      // Add current request
      timestamps.push(now);
      this.requests.set(identifier, timestamps);

      // Log warning when approaching limit (80%)
      if (timestamps.length >= config.maxRequests * 0.8) {
        console.warn(`[RATE LIMIT] ⚠️  IP ${identifier} approaching limit: ${timestamps.length}/${config.maxRequests} requests`);
      }

      // Cleanup old entries periodically
      if (Math.random() < 0.01) {
        this.cleanup(windowStart);
      }

      next();
    };
  }

  /**
   * Cleanup old entries
   */
  private static cleanup(windowStart: number) {
    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter(ts => ts > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}
