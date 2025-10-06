import path from 'path';
import { Request, Response, NextFunction } from 'express';

/**
 * Path Traversal Protection
 */

export class PathValidator {
  /**
   * Validate file path to prevent path traversal
   */
  static validatePath(filePath: string, baseDir: string): string | null {
    try {
      const normalized = path.normalize(filePath);
      const resolved = path.resolve(baseDir, normalized);
      
      // Ensure resolved path is within base directory
      if (!resolved.startsWith(path.resolve(baseDir))) {
        return null;
      }
      
      return resolved;
    } catch {
      return null;
    }
  }

  /**
   * Middleware to validate path parameters
   */
  static middleware(paramName: string, baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const pathParam = req.params[paramName];
      
      if (!pathParam) {
        return next();
      }

      const validPath = PathValidator.validatePath(pathParam, baseDir);
      
      if (!validPath) {
        return res.status(400).json({
          message: 'Invalid file path',
          code: 'PATH_TRAVERSAL_DETECTED'
        });
      }

      req.params[paramName] = validPath;
      next();
    };
  }
}
