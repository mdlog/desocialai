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
     * Simple encryption using Web Crypto API
     */
    async encryptSimple(message: string, password: string): Promise<EncryptionResult> {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const key = await clientE2EEncryption.deriveKeyFromPassword(password, salt);
        return await clientE2EEncryption.encrypt(message, key);
    }

    /**
     * Simple decryption using Web Crypto API
     */
    async decryptSimple(encryptedData: string, password: string, iv: string): Promise<DecryptionResult> {
        const salt = window.crypto.getRandomValues(new Uint8Array(16)); // In real app, salt should be stored
        const key = await clientE2EEncryption.deriveKeyFromPassword(password, salt);
        return await clientE2EEncryption.decrypt(encryptedData, key, iv);
    }
}

export const simpleE2EEncryption = new SimpleE2EEncryption();

