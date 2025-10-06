/**
 * Input Sanitization Utility
 * Protects against XSS, SQL Injection, Path Traversal, and Log Injection
 */

export class InputSanitizer {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize plain text (remove all HTML)
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return this.sanitizeHtml(input);
  }

  /**
   * Sanitize for logging to prevent log injection
   */
  static sanitizeForLog(input: any): string {
    if (input === null || input === undefined) return '';
    const str = String(input);
    return str.replace(/[\r\n\t]/g, ' ').substring(0, 200);
  }

  /**
   * Validate and sanitize file paths to prevent path traversal
   */
  static sanitizePath(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input.replace(/\.\./g, '').replace(/[\/\\]/g, '_');
  }

  /**
   * Sanitize URL to prevent SSRF
   */
  static sanitizeUrl(input: string): string | null {
    if (!input || typeof input !== 'string') return null;
    try {
      const url = new URL(input);
      if (!['http:', 'https:'].includes(url.protocol)) return null;
      if (this.isInternalIP(url.hostname)) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  /**
   * Check if hostname is internal/private IP
   */
  private static isInternalIP(hostname: string): boolean {
    const internalPatterns = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^::1$/,
      /^fe80:/i
    ];
    return internalPatterns.some(pattern => pattern.test(hostname));
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = this.sanitizeText(value) as any;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key as keyof T] = this.sanitizeObject(value);
      } else {
        sanitized[key as keyof T] = value;
      }
    }
    return sanitized;
  }
}
