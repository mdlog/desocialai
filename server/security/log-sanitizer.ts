/**
 * Log Sanitizer - Prevents log injection attacks
 * Sanitizes all log output to prevent malicious data from corrupting logs
 */

export class LogSanitizer {
    /**
     * Sanitize string for safe logging
     * Removes control characters and newlines that could be used for log injection
     */
    static sanitize(input: any): string {
        if (input === null || input === undefined) {
            return String(input);
        }

        const str = String(input);

        // Remove control characters (including newlines, carriage returns, etc.)
        // Keep only printable ASCII and common Unicode characters
        return str
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
            .replace(/\n/g, '\\n')                 // Escape newlines
            .replace(/\r/g, '\\r')                 // Escape carriage returns
            .replace(/\t/g, '\\t')                 // Escape tabs
            .trim();
    }

    /**
     * Sanitize object for logging
     */
    static sanitizeObject(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (typeof obj === 'string') {
            return this.sanitize(obj);
        }

        if (typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[this.sanitize(key)] = this.sanitizeObject(value);
        }
        return sanitized;
    }

    /**
     * Create a safe logger wrapper
     */
    static createSafeLogger(logger: Console = console) {
        return {
            log: (...args: any[]) => logger.log(...args.map(arg => this.sanitizeObject(arg))),
            error: (...args: any[]) => logger.error(...args.map(arg => this.sanitizeObject(arg))),
            warn: (...args: any[]) => logger.warn(...args.map(arg => this.sanitizeObject(arg))),
            info: (...args: any[]) => logger.info(...args.map(arg => this.sanitizeObject(arg))),
            debug: (...args: any[]) => logger.debug(...args.map(arg => this.sanitizeObject(arg))),
        };
    }
}

// Export a safe logger instance
export const safeLogger = LogSanitizer.createSafeLogger();
