
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { InputSanitizer } from "./security/input-sanitizer";
import { CSRFProtection } from "./security/csrf-protection";
import { RateLimiter } from "./security/rate-limiter";

const app = express();

// Security: Rate limiting (excluding avatar endpoints)
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for avatar serving
  if (req.path.startsWith('/api/objects/avatar/')) {
    return next();
  }
  return RateLimiter.create({ windowMs: 60000, maxRequests: 100 })(req, res, next);
});

// DEBUG: Capture ALL requests before any processing
app.use((req, res, next) => {
  const sanitizedUrl = InputSanitizer.sanitizeForLog(req.url);
  const sanitizedMethod = InputSanitizer.sanitizeForLog(req.method);
  console.log(`[SERVER DEBUG] ${sanitizedMethod} ${sanitizedUrl} - Content-Type: ${req.headers['content-type']}`);
  if (req.method === 'POST' && req.url === '/api/posts') {
    console.log('[SERVER DEBUG] POST /api/posts DETECTED');
  }
  next();
});

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Security: Input sanitization middleware
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = InputSanitizer.sanitizeObject(req.body);
  }
  next();
});

// Memory session store for development
const MemStore = MemoryStore(session);

// Session configuration for wallet connection management
app.use(session({
  store: new MemStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'zg-social-dev-secret-key',
  resave: false,
  saveUninitialized: true, // Allow uninitialized sessions for wallet connection
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Security: CSRF Protection (disabled for now to avoid breaking existing functionality)
// app.use(CSRFProtection.middleware());

// CSRF token endpoint
app.get('/api/csrf-token', CSRFProtection.getTokenEndpoint);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log('Starting server with in-memory storage...');

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error('Application error:', {
        status,
        message,
        stack: err.stack,
        url: _req.url,
        method: _req.method,
      });

      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 3005 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '3005', 10);

    // Use the server returned by registerRoutes which includes WebSocket support
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
      log(`WebSocket server available at ws://localhost:${port}/ws`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', async () => {
      log('SIGTERM received, shutting down gracefully');
      try {
        server.close(() => {
          log('Server closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    process.on('SIGINT', async () => {
      log('SIGINT received, shutting down gracefully');
      try {
        server.close(() => {
          log('Server closed');
          process.exit(0);
        });
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})().catch((error) => {
  console.error('Unhandled error during startup:', error);
  process.exit(1);
});
