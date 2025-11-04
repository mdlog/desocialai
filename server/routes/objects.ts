import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { zgStorageService } from '../services/zg-storage.js';

const router = Router();

/**
 * GET /api/objects/avatar/:objectId
 * Serve avatar files
 */
router.get('/avatar/:objectId', async (req, res) => {
    try {
        const objectId = req.params.objectId;
        console.log(`[AVATAR SERVE] Requesting avatar: ${objectId}`);

        const storageDir = path.join(process.cwd(), 'storage', 'avatars');

        // Check if storage directory exists
        if (!fs.existsSync(storageDir)) {
            console.log(`[AVATAR SERVE] ❌ Storage directory does not exist: ${storageDir}`);
            return res.status(404).json({ error: "Storage directory not found" });
        }

        // List all files for debugging
        const allFiles = fs.readdirSync(storageDir);
        console.log(`[AVATAR SERVE] All files in storage/avatars:`, allFiles);
        console.log(`[AVATAR SERVE] Looking for: ${objectId}.jpg or ${objectId}`);

        // Try different filename formats
        let filePath = null;
        let fileName = null;

        // Format 1: objectId.jpg (for new uploads)
        fileName = `${objectId}.jpg`;
        filePath = path.join(storageDir, fileName);
        if (fs.existsSync(filePath)) {
            console.log(`[AVATAR SERVE] Found avatar with format 1: ${fileName}`);
        } else {
            // Format 2: avatar_timestamp_randomid.jpg (for existing avatars)
            fileName = objectId; // objectId already contains the full filename
            filePath = path.join(storageDir, fileName);
            if (fs.existsSync(filePath)) {
                console.log(`[AVATAR SERVE] Found avatar with format 2: ${fileName}`);
            } else {
                // Format 3: Look for any file starting with objectId
                const matchingFile = allFiles.find(file => file.startsWith(objectId));
                if (matchingFile) {
                    fileName = matchingFile;
                    filePath = path.join(storageDir, fileName);
                    console.log(`[AVATAR SERVE] Found avatar with format 3: ${fileName}`);
                }
            }
        }

        if (!filePath || !fs.existsSync(filePath)) {
            console.log(`[AVATAR SERVE] Avatar not found: ${objectId}`);
            return res.status(404).json({ error: "Avatar not found" });
        }

        // Set proper headers for image serving
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

        // CORS for avatar serving (doesn't require credentials)
        const origin = req.headers.origin;
        if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('desocialai'))) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
        }

        console.log(`[AVATAR SERVE] ✅ Serving avatar: ${fileName}`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error: any) {
        console.error('[AVATAR SERVE] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/objects/zg-media/:storageHash
 * Serve media files from 0G Storage or local fallback
 */
router.get('/zg-media/:storageHash', async (req, res) => {
    try {
        const storageHash = req.params.storageHash;
        console.log(`[ZG MEDIA SERVE] Requesting media: ${storageHash}`);
        console.log(`[ZG MEDIA SERVE] Hash length: ${storageHash.length}`);

        // Try to download from 0G Storage first
        try {
            console.log(`[ZG MEDIA SERVE] Attempting to download from 0G Storage...`);
            const mediaData = await zgStorageService.downloadFile(storageHash);

            if (mediaData && mediaData.length > 0) {
                console.log(`[ZG MEDIA SERVE] ✅ Retrieved from 0G Storage: ${storageHash.substring(0, 20)}... (${mediaData.length} bytes)`);

                // Determine content type from buffer or default to image/jpeg
                let contentType = 'image/jpeg';

                // Check magic bytes for content type detection
                if (mediaData.length > 4) {
                    const header = mediaData.toString('hex', 0, 4);
                    if (header.startsWith('ffd8ff')) {
                        contentType = 'image/jpeg';
                    } else if (header.startsWith('89504e47')) {
                        contentType = 'image/png';
                    } else if (header.startsWith('47494638')) {
                        contentType = 'image/gif';
                    } else if (header.startsWith('52494646')) {
                        contentType = 'image/webp';
                    } else if (header.startsWith('00000018') || header.startsWith('00000020')) {
                        contentType = 'video/mp4';
                    }
                }

                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year (immutable content)
                res.setHeader('Access-Control-Allow-Origin', '*');

                return res.send(mediaData);
            } else {
                console.log(`[ZG MEDIA SERVE] 0G Storage returned empty data`);
            }
        } catch (zgError: any) {
            console.error(`[ZG MEDIA SERVE] ❌ Failed to retrieve from 0G Storage:`, {
                error: zgError.message,
                stack: zgError.stack?.split('\n')[0]
            });
        }

        // Fallback: Try local storage
        const localStorageDir = path.join(process.cwd(), 'storage', 'media');

        if (fs.existsSync(localStorageDir)) {
            const allFiles = fs.readdirSync(localStorageDir);
            const matchingFile = allFiles.find(file => file.includes(storageHash) || file.startsWith(storageHash));

            if (matchingFile) {
                const filePath = path.join(localStorageDir, matchingFile);
                console.log(`[ZG MEDIA SERVE] ✅ Serving from local storage: ${matchingFile}`);

                // Determine content type from extension
                const ext = path.extname(matchingFile).toLowerCase();
                const contentTypeMap: Record<string, string> = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                    '.webp': 'image/webp',
                    '.mp4': 'video/mp4',
                    '.webm': 'video/webm',
                    '.mov': 'video/quicktime'
                };

                res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                res.setHeader('Access-Control-Allow-Origin', '*');

                const fileStream = fs.createReadStream(filePath);
                return fileStream.pipe(res);
            }
        }

        console.log(`[ZG MEDIA SERVE] ❌ Media not found in 0G Storage or local storage: ${storageHash.substring(0, 30)}...`);

        // Return a placeholder image or 404
        res.status(404).json({
            error: "Media not found",
            message: "Image not available in 0G Storage or local cache. It may still be syncing to the network.",
            storageHash: storageHash.substring(0, 20) + '...'
        });
    } catch (error: any) {
        console.error('[ZG MEDIA SERVE] Error:', error);
        res.status(500).json({
            error: error.message,
            details: "Failed to retrieve media from storage"
        });
    }
});

export default router;
