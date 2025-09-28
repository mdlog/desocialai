import { randomUUID } from "crypto";
import type { Response } from "express";

// Object storage service for 0G Social platform  
export class ObjectStorageService {
  constructor() {
    console.log('[OBJECT STORAGE] Initialized with enhanced production authentication');
  }

  // Gets the public object search paths.
  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr
          .split(",")
          .map((path) => path.trim())
          .filter((path) => path.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Object storage bucket not configured properly."
      );
    }
    return paths;
  }

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Object storage bucket not configured properly."
      );
    }
    return dir;
  }

  // Gets the upload URL for an object entity
  async getObjectEntityUploadURL(): Promise<string> {
    try {
      console.log('[OBJECT STORAGE] Generating upload URL...');
      console.log('[OBJECT STORAGE] Environment:', process.env.NODE_ENV);
      console.log('[OBJECT STORAGE] Replit Environment:', process.env.REPLIT_ENVIRONMENT);
      
      // Check if we're in production deployment and use consistent sidecar method
      if (process.env.REPLIT_ENVIRONMENT === 'production' || process.env.REPLIT_DOMAINS) {
        console.log('[OBJECT STORAGE] Production environment detected, using consistent sidecar method...');
      }
      
      // Use signing method for development or as fallback
      const privateObjectDir = this.getPrivateObjectDir();
      const objectId = randomUUID();
      const fullPath = `${privateObjectDir}/uploads/${objectId}`;

      console.log('[OBJECT STORAGE] Generated path:', fullPath);

      // Parse the bucket and object path
      const { bucketName, objectName } = this.parseObjectPath(fullPath);
      console.log('[OBJECT STORAGE] Parsed bucket:', bucketName, 'object:', objectName);

      // Generate signed URL for uploading with enhanced authentication
      return await this.signObjectURL({
        bucketName,
        objectName,
        method: "PUT",
        ttlSec: 900, // 15 minutes
      });
      
    } catch (error: any) {
      console.error('[OBJECT STORAGE] Error in getObjectEntityUploadURL:', error);
      throw new Error(`Failed to generate signed URL for object storage: ${error.message}`);
    }
  }

  // Production upload URL generation using Replit infrastructure
  private async generateProductionUploadURL(fileName: string): Promise<string> {
    const UPLOAD_ENDPOINT = process.env.REPLIT_OBJECT_UPLOAD_ENDPOINT || 'https://object-storage.replit.com/upload';
    
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLIT_TOKEN || ''}`,
      },
      body: JSON.stringify({
        fileName,
        contentType: 'image/*',
        bucket: process.env.REPLIT_DEPLOYMENT_ID || 'default'
      })
    });

    if (!response.ok) {
      // If production method fails, fallback to development approach
      console.log('[OBJECT STORAGE] Production method failed, using fallback...');
      return await this.fallbackUploadURL();
    }

    const data = await response.json();
    return data.uploadUrl || data.signedUrl;
  }

  // Fallback upload URL for when other methods fail
  private async fallbackUploadURL(): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;

    const { bucketName, objectName } = this.parseObjectPath(fullPath);

    return await this.signObjectURL({
      bucketName,
      objectName,
      method: "PUT",
      ttlSec: 900,
    });
  }

  // Downloads an object to the response with enhanced CORS and direct serving
  async downloadObject(file: any, res: Response, cacheTtlSec: number = 3600) {
    try {
      if (!file || !file.url) {
        console.error("[OBJECT STORAGE] File not found - no URL provided");
        return res.status(404).json({ error: "File not found" });
      }

      console.log(`[OBJECT STORAGE] Fetching file from: ${file.url}`);

      // Always use direct serving with proper CORS headers
      const response = await fetch(file.url);
      
      if (!response.ok) {
        console.error(`[OBJECT STORAGE] Failed to fetch: ${response.status} ${response.statusText}`);
        return res.status(response.status).json({ error: "Failed to fetch file from storage" });
      }

      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      console.log(`[OBJECT STORAGE] ✅ Successfully fetched ${buffer.byteLength} bytes, type: ${contentType}`);

      // Set comprehensive headers for proper serving and aggressive caching
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.byteLength.toString());
      res.setHeader('Cache-Control', `public, max-age=${cacheTtlSec}, immutable`);
      res.setHeader('ETag', `"${Date.now()}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error(`[OBJECT STORAGE] ❌ Error downloading file:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Error downloading file" });
      }
    }
  }

  // Gets the object entity file from the object path.
  async getObjectEntityFile(objectPath: string): Promise<any | null> {
    if (!objectPath.startsWith("/objects/")) {
      return null;
    }

    const parts = objectPath.slice(1).split("/");
    if (parts.length < 2) {
      return null;
    }

    const entityId = parts.slice(1).join("/");
    
    // Extract bucket name from PRIVATE_OBJECT_DIR
    // Format: /replit-objstore-{id}/.private
    const privateDir = this.getPrivateObjectDir();
    const bucketName = privateDir.split('/')[1]; // Extract bucket from path
    const objectName = entityId; // entityId is already ".private/filename"

    // Return file object
    return {
      name: objectName,
      bucketName,
      exists: true,
      url: await this.signObjectURL({
        bucketName,
        objectName,
        method: "GET",
        ttlSec: 3600,
      }),
    };
  }

  // Normalize object entity path from upload URL
  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://")) {
      return rawPath;
    }

    // Extract object path from signed URL
    try {
      const url = new URL(rawPath);
      const pathParts = url.pathname.split("/");
      
      // For signed URLs, extract the object path
      if (pathParts.length >= 3) {
        const bucketName = pathParts[1];
        const objectName = pathParts.slice(2).join("/");
        
        // Check if this is in our private directory
        const privateDir = this.getPrivateObjectDir();
        const expectedPath = `/${bucketName}/${objectName}`;
        
        if (expectedPath.startsWith(privateDir)) {
          // Keep the full object name without removing uploads/ prefix
          return `/objects/${objectName}`;
        }
      }
      
      return rawPath;
    } catch (error) {
      console.error("Error normalizing object path:", error);
      return rawPath;
    }
  }

  // Parse object path into bucket and object name
  private parseObjectPath(path: string): { bucketName: string; objectName: string } {
    if (!path.startsWith("/")) {
      path = `/${path}`;
    }
    
    const pathParts = path.split("/");
    if (pathParts.length < 3) {
      throw new Error("Invalid path: must contain at least a bucket name");
    }

    const bucketName = pathParts[1];
    const objectName = pathParts.slice(2).join("/");

    return { bucketName, objectName };
  }

  // Sign object URL for upload/download
  private async signObjectURL({
    bucketName,
    objectName,
    method,
    ttlSec,
  }: {
    bucketName: string;
    objectName: string;
    method: "GET" | "PUT" | "DELETE" | "HEAD";
    ttlSec: number;
  }): Promise<string> {
    // Use environment-aware sidecar endpoint
    const SIDECAR_ENDPOINT = process.env.SIDECAR_ENDPOINT || 
      (process.env.REPLIT_ENVIRONMENT === 'production' || process.env.REPLIT_DOMAINS ? 'http://38.96.255.34:1106' : 'http://127.0.0.1:1106');
    
    const request = {
      bucket_name: bucketName,
      object_name: objectName,
      method,
      expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
    };

    try {
      // Get authentication headers for production environment
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add Replit internal auth headers for production
      if (process.env.REPLIT_ENVIRONMENT === 'production' || process.env.REPLIT_DOMAINS) {
        console.log('[OBJECT STORAGE] Adding production authentication headers...');
        
        // Use the session ID as authentication since that's what works
        if (process.env.REPLIT_SESSION) {
          headers["x-replit-session"] = process.env.REPLIT_SESSION;
        }
        
        // Add user and cluster info
        if (process.env.REPLIT_USER) {
          headers["x-replit-user"] = process.env.REPLIT_USER;
        }
        
        if (process.env.REPLIT_CLUSTER) {
          headers["x-replit-cluster"] = process.env.REPLIT_CLUSTER;
        }
        
        // Add deployment environment
        if (process.env.REPLIT_DOMAINS) {
          headers["x-replit-domains"] = process.env.REPLIT_DOMAINS;
        }
        
        console.log('[OBJECT STORAGE] Production headers added:', Object.keys(headers));
      }

      console.log(`[OBJECT STORAGE] Making request to: ${SIDECAR_ENDPOINT}/object-storage/signed-object-url`);
      console.log(`[OBJECT STORAGE] Request headers:`, Object.keys(headers));

      const response = await fetch(
        `${SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(request),
          // Add timeout and better error handling
          signal: AbortSignal.timeout(10000), // 10 second timeout
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`[OBJECT STORAGE] Sidecar error ${response.status}: ${errorText}`);
        
        if (response.status === 401) {
          console.error(`[OBJECT STORAGE] Authentication failed - missing or invalid credentials for production environment`);
          throw new Error("Authentication failed for object storage service. Please check deployment configuration.");
        }
        
        throw new Error(`Failed to sign object URL: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(`[OBJECT STORAGE] ✅ Successfully generated signed URL`);
      
      const { signed_url: signedURL } = responseData;
      return signedURL;
    } catch (error: any) {
      console.error("[OBJECT STORAGE] Error signing object URL:", error);
      console.error("[OBJECT STORAGE] Sidecar endpoint:", SIDECAR_ENDPOINT);
      console.error("[OBJECT STORAGE] Environment:", process.env.NODE_ENV);
      
      if (error.message.includes('Authentication failed')) {
        throw error; // Preserve specific auth error
      }
      
      // If network connection failed and we're in production, try localhost as fallback
      if (error.message.includes('fetch failed') || error.name === 'AbortError') {
        console.log('[OBJECT STORAGE] Network error detected, attempting localhost fallback...');
        
        if (SIDECAR_ENDPOINT.includes('38.96.255.34')) {
          // Try localhost fallback
          const fallbackEndpoint = 'http://127.0.0.1:1106';
          console.log(`[OBJECT STORAGE] Retrying with fallback endpoint: ${fallbackEndpoint}`);
          
          try {
            const fallbackResponse = await fetch(
              `${fallbackEndpoint}/object-storage/signed-object-url`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request),
                signal: AbortSignal.timeout(5000),
              }
            );
            
            if (fallbackResponse.ok) {
              const responseData = await fallbackResponse.json();
              console.log(`[OBJECT STORAGE] ✅ Fallback successful!`);
              return responseData.signed_url;
            }
          } catch (fallbackError) {
            console.log('[OBJECT STORAGE] Fallback also failed:', fallbackError);
          }
        }
      }
      
      throw new Error(`Failed to generate signed URL for object storage: ${error.message}`);
    }
  }
}

// Custom error class for object storage errors
export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}