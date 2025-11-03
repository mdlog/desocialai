/**
 * Client-side E2E Encryption for Direct Messages
 * This handles encryption/decryption in the browser
 */

export interface EncryptionResult {
    encryptedData: string;
    iv: string;
    tag: string;
}

export interface DecryptionResult {
    decryptedData: string;
    success: boolean;
}

export class ClientE2EEncryption {
    private readonly algorithm = 'AES-GCM';
    private readonly keyLength = 256;

    /**
     * Generate a new encryption key
     */
    async generateKey(): Promise<CryptoKey> {
        return await window.crypto.subtle.generateKey(
            {
                name: this.algorithm,
                length: this.keyLength,
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Derive key from password
     */
    async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            { name: this.algorithm, length: this.keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data
     */
    async encrypt(data: string, key: CryptoKey): Promise<EncryptionResult> {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: this.algorithm,
                iv: iv,
            },
            key,
            encodedData
        );

        return {
            encryptedData: this.arrayBufferToBase64(encryptedData),
            iv: this.arrayBufferToBase64(iv),
            tag: this.arrayBufferToBase64(iv.slice(0, 16)) // Extract tag from IV for GCM
        };
    }

    /**
     * Decrypt data
     */
    async decrypt(encryptedData: string, key: CryptoKey, iv: string): Promise<DecryptionResult> {
        try {
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
            const ivBuffer = this.base64ToArrayBuffer(iv);

            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: ivBuffer,
                },
                key,
                encryptedBuffer
            );

            const decodedData = new TextDecoder().decode(decryptedData);

            return {
                decryptedData: decodedData,
                success: true
            };
        } catch (error) {
            console.error('[Client E2E] Decryption failed:', error);
            return {
                decryptedData: '',
                success: false
            };
        }
    }

    /**
     * Generate shared secret for two users
     */
    async generateSharedSecret(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
        return await window.crypto.subtle.deriveKey(
            {
                name: 'ECDH',
                public: publicKey,
            },
            privateKey,
            {
                name: this.algorithm,
                length: this.keyLength,
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Convert ArrayBuffer to Base64
     */
    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Convert Base64 to ArrayBuffer
     */
    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = window.atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Encrypt message for direct messaging
     */
    async encryptMessage(message: string, sharedKey: CryptoKey): Promise<EncryptionResult> {
        return await this.encrypt(message, sharedKey);
    }

    /**
     * Decrypt message for direct messaging
     */
    async decryptMessage(encryptedMessage: string, sharedKey: CryptoKey, iv: string): Promise<DecryptionResult> {
        return await this.decrypt(encryptedMessage, sharedKey, iv);
    }
}

// Singleton instance
export const clientE2EEncryption = new ClientE2EEncryption();

/**
 * Simplified encryption for demo purposes
 * In production, this should use proper key exchange
 */
export class SimpleE2EEncryption {
    /**
     * Check if Web Crypto API is available
     */
    private isCryptoAvailable(): boolean {
        return typeof window !== 'undefined' &&
            window.crypto !== undefined &&
            window.crypto.subtle !== undefined;
    }

    /**
     * Fallback encryption using Base64 (NOT SECURE - for demo only)
     * This is used when Web Crypto API is not available
     */
    private fallbackEncrypt(message: string, password: string): EncryptionResult {
        console.warn('[E2E] Using fallback encryption (NOT SECURE). Web Crypto API not available.');

        // Simple XOR-based encryption for demo (NOT SECURE)
        const key = this.simpleHash(password);
        let encrypted = '';
        for (let i = 0; i < message.length; i++) {
            encrypted += String.fromCharCode(message.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }

        const encryptedBase64 = btoa(encrypted);
        const iv = btoa(Math.random().toString(36).substring(2, 15));

        return {
            encryptedData: encryptedBase64,
            iv: iv,
            tag: btoa('fallback')
        };
    }

    /**
     * Fallback decryption using Base64 (NOT SECURE - for demo only)
     */
    private fallbackDecrypt(encryptedData: string, password: string, iv: string): DecryptionResult {
        try {
            const key = this.simpleHash(password);
            const encrypted = atob(encryptedData);
            let decrypted = '';

            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }

            return {
                decryptedData: decrypted,
                success: true
            };
        } catch (error) {
            console.error('[E2E] Fallback decryption failed:', error);
            return {
                decryptedData: '',
                success: false
            };
        }
    }

    /**
     * Simple hash function for fallback encryption
     */
    private simpleHash(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36).padEnd(32, '0');
    }

    /**
     * Generate deterministic salt from password
     * This ensures the same password always produces the same salt
     */
    private async generateDeterministicSalt(password: string): Promise<Uint8Array> {
        // Use SHA-256 hash of password to create deterministic salt
        const encoder = new TextEncoder();
        const data = encoder.encode(password + '_desocialai_salt_v1');
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = new Uint8Array(hashBuffer);
        
        // Take first 16 bytes for salt
        return hashArray.slice(0, 16);
    }

    /**
     * Simple encryption using Web Crypto API with fallback
     */
    async encryptSimple(message: string, password: string): Promise<EncryptionResult> {
        // Check if Web Crypto API is available
        if (!this.isCryptoAvailable()) {
            return this.fallbackEncrypt(message, password);
        }

        try {
            // Use deterministic salt based on password
            const salt = await this.generateDeterministicSalt(password);
            const key = await clientE2EEncryption.deriveKeyFromPassword(password, salt);
            const result = await clientE2EEncryption.encrypt(message, key);
            
            // Include salt in IV for backward compatibility (but we'll use deterministic salt)
            return result;
        } catch (error) {
            console.error('[E2E] Web Crypto encryption failed, using fallback:', error);
            return this.fallbackEncrypt(message, password);
        }
    }

    /**
     * Simple decryption using Web Crypto API with fallback
     */
    async decryptSimple(encryptedData: string, password: string, iv: string): Promise<DecryptionResult> {
        // Check if this is fallback encrypted data
        if (!this.isCryptoAvailable()) {
            return this.fallbackDecrypt(encryptedData, password, iv);
        }

        try {
            // Use the same deterministic salt that was used for encryption
            const salt = await this.generateDeterministicSalt(password);
            const key = await clientE2EEncryption.deriveKeyFromPassword(password, salt);
            return await clientE2EEncryption.decrypt(encryptedData, key, iv);
        } catch (error) {
            console.error('[E2E] Web Crypto decryption failed, trying fallback:', error);
            return this.fallbackDecrypt(encryptedData, password, iv);
        }
    }
}

export const simpleE2EEncryption = new SimpleE2EEncryption();

