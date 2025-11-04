import { randomBytes } from 'node:crypto';

/**
 * Secure ID Generator
 * Menggunakan crypto.randomBytes() untuk cryptographically secure random IDs
 * 
 * JANGAN gunakan Math.random() untuk security-critical IDs!
 */

export class SecureIdGenerator {
    /**
     * Generate secure random ID dengan prefix
     * @param prefix - Prefix untuk ID (contoh: 'user', 'post', 'agent')
     * @param length - Panjang random part dalam bytes (default: 8)
     * @returns Secure random ID
     */
    static generate(prefix: string, length: number = 8): string {
        const timestamp = Date.now();
        const randomPart = randomBytes(length).toString('hex');
        return `${prefix}_${timestamp}_${randomPart}`;
    }

    /**
     * Generate short secure ID (untuk display/UI)
     * @param length - Panjang dalam bytes (default: 6)
     * @returns Short secure ID
     */
    static generateShort(length: number = 6): string {
        return randomBytes(length).toString('hex');
    }

    /**
     * Generate UUID v4 (standard UUID)
     * @returns UUID v4 string
     */
    static generateUUID(): string {
        const bytes = randomBytes(16);

        // Set version (4) and variant bits
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = bytes.toString('hex');
        return [
            hex.substring(0, 8),
            hex.substring(8, 12),
            hex.substring(12, 16),
            hex.substring(16, 20),
            hex.substring(20, 32)
        ].join('-');
    }

    /**
     * Generate secure token (untuk authentication, verification, dll)
     * @param length - Panjang dalam bytes (default: 32)
     * @returns Secure token
     */
    static generateToken(length: number = 32): string {
        return randomBytes(length).toString('hex');
    }

    /**
     * Generate secure numeric ID
     * @param length - Jumlah digits (default: 10)
     * @returns Secure numeric ID
     */
    static generateNumeric(length: number = 10): string {
        const bytes = randomBytes(Math.ceil(length / 2));
        const hex = bytes.toString('hex');
        const numeric = BigInt('0x' + hex).toString().substring(0, length);
        return numeric.padStart(length, '0');
    }

    /**
     * Generate secure alphanumeric ID (base62)
     * @param length - Panjang ID (default: 12)
     * @returns Secure alphanumeric ID
     */
    static generateAlphanumeric(length: number = 12): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = randomBytes(length);
        let result = '';

        for (let i = 0; i < length; i++) {
            result += chars[bytes[i] % chars.length];
        }

        return result;
    }

    /**
     * Generate secure filename
     * @param originalName - Original filename
     * @param preserveExtension - Preserve file extension (default: true)
     * @returns Secure filename
     */
    static generateFilename(originalName: string, preserveExtension: boolean = true): string {
        const timestamp = Date.now();
        const randomPart = randomBytes(8).toString('hex');

        if (preserveExtension) {
            const ext = originalName.split('.').pop();
            return `${timestamp}_${randomPart}.${ext}`;
        }

        return `${timestamp}_${randomPart}`;
    }
}

/**
 * Helper functions untuk backward compatibility
 */

export function generateSecureId(prefix: string, length?: number): string {
    return SecureIdGenerator.generate(prefix, length);
}

export function generateSecureToken(length?: number): string {
    return SecureIdGenerator.generateToken(length);
}

export function generateSecureUUID(): string {
    return SecureIdGenerator.generateUUID();
}
