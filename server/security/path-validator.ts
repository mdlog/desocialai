import path from 'path';
import fs from 'fs';

/**
 * Path Validator - Prevents path traversal attacks
 * Validates and sanitizes file paths to prevent directory traversal
 */

export class PathValidator {
  /**
   * Validate that a path is within allowed directory
   * Prevents path traversal attacks like ../../etc/passwd
   */
  static isPathSafe(filePath: string, allowedDir: string): boolean {
    // Resolve to absolute paths
    const resolvedPath = path.resolve(filePath);
    const resolvedAllowedDir = path.resolve(allowedDir);

    // Check if the resolved path starts with the allowed directory
    return resolvedPath.startsWith(resolvedAllowedDir);
  }

  /**
   * Sanitize filename to prevent path traversal
   * Removes dangerous characters and path separators
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
      .replace(/\.{2,}/g, '_')          // Replace multiple dots
      .replace(/^\.+/, '')              // Remove leading dots
      .substring(0, 255);               // Limit length
  }

  /**
   * Safely join paths and validate result
   */
  static safeJoin(baseDir: string, ...paths: string[]): string {
    const joined = path.join(baseDir, ...paths);

    if (!this.isPathSafe(joined, baseDir)) {
      throw new Error('Path traversal attempt detected');
    }

    return joined;
  }

  /**
   * Validate file exists and is within allowed directory
   */
  static async validateFileAccess(filePath: string, allowedDir: string): Promise<boolean> {
    try {
      // Check path safety first
      if (!this.isPathSafe(filePath, allowedDir)) {
        return false;
      }

      // Check if file exists
      await fs.promises.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get safe storage path for user uploads
   */
  static getSafeStoragePath(filename: string, subdir?: string): string {
    const baseDir = path.join(process.cwd(), 'storage');
    const sanitizedFilename = this.sanitizeFilename(filename);

    if (subdir) {
      const sanitizedSubdir = this.sanitizeFilename(subdir);
      return this.safeJoin(baseDir, sanitizedSubdir, sanitizedFilename);
    }

    return this.safeJoin(baseDir, sanitizedFilename);
  }
}
