/**
 * URL Validator - Prevents SSRF (Server-Side Request Forgery) attacks
 * Validates external URLs before making requests
 */

export class URLValidator {
    // Blocked IP ranges (private networks, localhost, etc.)
    private static readonly BLOCKED_IP_PATTERNS = [
        /^127\./,                    // Loopback
        /^10\./,                     // Private network
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private network
        /^192\.168\./,               // Private network
        /^169\.254\./,               // Link-local
        /^::1$/,                     // IPv6 loopback
        /^fe80:/,                    // IPv6 link-local
        /^fc00:/,                    // IPv6 private
        /^fd00:/,                    // IPv6 private
    ];

    // Allowed protocols
    private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:'];

    // Allowed domains for external requests (whitelist approach)
    private static readonly ALLOWED_DOMAINS = [
        'ipfs.io',
        'gateway.pinata.cloud',
        'cloudflare-ipfs.com',
        '0g.ai',
        'evmrpc.0g.ai',
        'indexer-storage-turbo.0g.ai',
        'rpc-storage-testnet.0g.ai',
        'replit.com',
        'object-storage.replit.com',
    ];

    /**
     * Validate URL is safe for external requests
     */
    static isURLSafe(urlString: string): boolean {
        try {
            const url = new URL(urlString);

            // Check protocol
            if (!this.ALLOWED_PROTOCOLS.includes(url.protocol)) {
                return false;
            }

            // Check if domain is in whitelist
            const hostname = url.hostname.toLowerCase();
            const isAllowed = this.ALLOWED_DOMAINS.some(domain =>
                hostname === domain || hostname.endsWith(`.${domain}`)
            );

            if (!isAllowed) {
                return false;
            }

            // Check for blocked IP patterns
            for (const pattern of this.BLOCKED_IP_PATTERNS) {
                if (pattern.test(hostname)) {
                    return false;
                }
            }

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate and sanitize URL
     * Throws error if URL is not safe
     */
    static validateURL(urlString: string): URL {
        if (!this.isURLSafe(urlString)) {
            throw new Error('URL is not allowed for security reasons');
        }

        return new URL(urlString);
    }

    /**
     * Add domain to whitelist (for dynamic configuration)
     */
    static addAllowedDomain(domain: string): void {
        if (!this.ALLOWED_DOMAINS.includes(domain)) {
            this.ALLOWED_DOMAINS.push(domain);
        }
    }

    /**
     * Check if URL points to internal network
     */
    static isInternalURL(urlString: string): boolean {
        try {
            const url = new URL(urlString);
            const hostname = url.hostname;

            for (const pattern of this.BLOCKED_IP_PATTERNS) {
                if (pattern.test(hostname)) {
                    return true;
                }
            }

            return false;
        } catch {
            return true; // Invalid URLs are considered unsafe
        }
    }
}
