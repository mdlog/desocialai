import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

export interface EncryptionResult {
    encryptedData: string;
    iv: string;
    tag: string;
}

export interface DecryptionResult {
    decryptedData: string;
    success: boolean;
    error?: string;
}

export class E2EEncryptionService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32; // 256 bits
    private readonly ivLength = 16; // 128 bits
    private readonly tagLength = 16; // 128 bits

    /**
     * Generate a new encryption key
     */
    generateKey(): string {
        return randomBytes(this.keyLength).toString('hex');
    }

    /**
     * Derive encryption key from user's private key or password
     */
    deriveKeyFromPassword(password: string, salt?: string): string {
        const actualSalt = salt || randomBytes(16).toString('hex');
        const key = createHash('sha256').update(password + actualSalt).digest('hex');
        return key;
    }

    /**
     * Encrypt data using AES-256-GCM
     */
    encrypt(data: string, key: string): EncryptionResult {
        try {
            const iv = randomBytes(this.ivLength);
            // Handle key as string (not hex) since we're using demo key
            const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'utf8') : Buffer.from(key, 'hex');

            // Ensure key is exactly 32 bytes for AES-256
            const derivedKey = keyBuffer.length === 32 ? keyBuffer : createHash('sha256').update(keyBuffer).digest();

            const cipher = createCipheriv(this.algorithm, derivedKey, iv);

            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const tag = cipher.getAuthTag();

            return {
                encryptedData: encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex')
            };
        } catch (error) {
            console.error('[E2E Encryption] Error encrypting data:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt data using AES-256-GCM
     */
    decrypt(encryptedData: string, key: string, iv: string, tag: string): DecryptionResult {
        try {
            // Handle key as string (not hex) since we're using demo key
            const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'utf8') : Buffer.from(key, 'hex');
            const ivBuffer = Buffer.from(iv, 'hex');
            const tagBuffer = Buffer.from(tag, 'hex');

            // Ensure key is exactly 32 bytes for AES-256
            const derivedKey = keyBuffer.length === 32 ? keyBuffer : createHash('sha256').update(keyBuffer).digest();

            const decipher = createDecipheriv(this.algorithm, derivedKey, ivBuffer);
            decipher.setAuthTag(tagBuffer);

            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return {
                decryptedData: decrypted,
                success: true
            };
        } catch (error) {
            console.error('[E2E Encryption] Error decrypting data:', error);
            return {
                decryptedData: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Generate a shared secret for two users using ECDH
     */
    generateSharedSecret(user1PrivateKey: string, user2PublicKey: string): string {
        try {
            // Simplified approach for demo - use consistent key derivation
            // In production, this would use proper ECDH key exchange
            const combined = user1PrivateKey + user2PublicKey;
            const hash = createHash('sha256').update(combined).digest('hex');
            // Ensure we return a 64-character hex string (32 bytes)
            return hash.padEnd(64, '0').substring(0, 64);
        } catch (error) {
            console.error('[E2E Encryption] Error generating shared secret:', error);
            throw new Error('Failed to generate shared secret');
        }
    }

    /**
     * Encrypt message for direct messaging (simplified for demo)
     */
    encryptMessage(message: string, senderKey: string, receiverPublicKey: string): {
        encryptedMessage: string;
        sharedSecret: string;
        iv: string;
        tag: string;
    } {
        // Use environment variable for encryption key
        // In production, this should use proper ECDH key exchange
        const encryptionKey = process.env.E2E_ENCRYPTION_KEY || this.generateKey();
        const encrypted = this.encrypt(message, encryptionKey);

        return {
            encryptedMessage: encrypted.encryptedData,
            sharedSecret: encryptionKey,
            iv: encrypted.iv,
            tag: encrypted.tag
        };
    }

    /**
     * Decrypt message for direct messaging (simplified for demo)
     */
    decryptMessage(
        encryptedMessage: string,
        receiverKey: string,
        senderPublicKey: string,
        iv: string,
        tag: string
    ): DecryptionResult {
        // Use environment variable for encryption key
        // In production, this should use proper ECDH key exchange
        const encryptionKey = process.env.E2E_ENCRYPTION_KEY || this.generateKey();
        return this.decrypt(encryptedMessage, encryptionKey, iv, tag);
    }
}

// Singleton instance
export const e2eEncryptionService = new E2EEncryptionService();

