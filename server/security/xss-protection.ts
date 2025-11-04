/**
 * XSS Protection - Prevents Cross-Site Scripting attacks
 * Escapes HTML output and sanitizes user input
 */

export class XSSProtection {
    /**
     * Escape HTML special characters
     */
    static escapeHTML(str: string): string {
        const htmlEscapeMap: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
        };

        return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
    }

    /**
     * Sanitize user input for safe storage
     * Removes potentially dangerous HTML tags and attributes
     */
    static sanitizeInput(input: string): string {
        if (typeof input !== 'string') {
            return String(input);
        }

        // Remove script tags and their content
        let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        // Remove event handlers (onclick, onerror, etc.)
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

        // Remove javascript: protocol
        sanitized = sanitized.replace(/javascript:/gi, '');

        // Remove data: protocol (can be used for XSS)
        sanitized = sanitized.replace(/data:text\/html/gi, '');

        return sanitized;
    }

    /**
     * Sanitize object recursively
     */
    static sanitizeObject(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return this.sanitizeInput(obj);
        }

        if (typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = this.sanitizeObject(value);
        }
        return sanitized;
    }

    /**
     * Validate and sanitize URL to prevent XSS via URL
     */
    static sanitizeURL(url: string): string {
        try {
            const parsed = new URL(url);

            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return '';
            }

            return parsed.toString();
        } catch {
            return '';
        }
    }

    /**
     * Create safe HTML attributes
     */
    static createSafeAttributes(attrs: Record<string, string>): string {
        return Object.entries(attrs)
            .map(([key, value]) => {
                // Sanitize attribute name (only allow alphanumeric and hyphens)
                const safeKey = key.replace(/[^a-zA-Z0-9-]/g, '');

                // Escape attribute value
                const safeValue = this.escapeHTML(value);

                return `${safeKey}="${safeValue}"`;
            })
            .join(' ');
    }
}
