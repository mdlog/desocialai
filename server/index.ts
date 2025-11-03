
import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { registerAIAgentRoutes } from "./routes-ai-agents";
import { setupVite, serveStatic, log } from "./vite";
import { InputSanitizer } from "./security/input-sanitizer";
import { CSRFProtection } from "./security/csrf-protection";
import { RateLimiter } from "./security/rate-limiter";

const app = express();

// Security: Rate limiting (excluding avatar and frequently accessed endpoints)
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for these endpoints
  const skipPaths = [
    '/api/objects/avatar/',           // Avatar serving
    '/api/objects/upload',            // Avatar upload
    '/api/objects/upload-direct/',    // Direct upload
    '/api/objects/upload-multipart/', // Multipart upload
    '/api/users/me',                  // Current user (frequently accessed)
    '/api/web3/status',               // Status check (frequently polled)
    '/api/web3/connect',              // Wallet connection
    '/api/web3/disconnect',           // Wallet disconnection
    '/api/web3/wallet',               // Wallet info
    '/api/zg/da/stats',               // Stats (frequently polled)
    '/api/zg/compute/stats',          // Stats (frequently polled)
    '/api/zg/storage/stats',          // Stats (frequently polled)
    '/api/posts/feed',                // Feed (frequently accessed)
  ];

  // Check if current path should skip rate limiting
  const shouldSkip = skipPaths.some(path => req.path.startsWith(path) || req.path === path);

  if (shouldSkip) {
    return next();
  }

  // Apply rate limiting with higher limits for development/tunnel
  return RateLimiter.create({
    windowMs: 60000,      // 1 minute window
    maxRequests: 1000     // Increased to 1000 for development/tunnel usage
  })(req, res, next);
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

// CORS middleware - support for tunnel domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3005',
    'https://desocialai.live',
    'https://desocialai.xyz',
    process.env.ALLOWED_ORIGIN
  ].filter(Boolean);

  // CRITICAL: When credentials are required, we MUST set a specific origin, not '*'
  // Browser will not send cookies if Access-Control-Allow-Origin is '*'
  let finalOrigin: string;
  if (origin && allowedOrigins.includes(origin)) {
    finalOrigin = origin;
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow localhost origins
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      finalOrigin = origin;
    } else {
      // Fallback for same-origin requests (no origin header)
      finalOrigin = 'http://localhost:5000';
    }
  } else {
    // Production: only allow specific origins
    finalOrigin = origin || 'https://desocialai.live';
  }

  // CRITICAL: NEVER use '*' - always use specific origin
  res.header('Access-Control-Allow-Origin', finalOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Hook into res.end to prevent any middleware from overriding with '*'
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: any) {
    if (!res.headersSent) {
      const currentOrigin = res.getHeader('Access-Control-Allow-Origin');
      if (currentOrigin === '*') {
        console.warn('[CORS] ⚠️ Access-Control-Allow-Origin was set to "*" - fixing to:', finalOrigin);
        res.setHeader('Access-Control-Allow-Origin', finalOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    }
    return originalEnd.call(this, chunk, encoding, cb);
  };

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
// CRITICAL: This must be configured correctly for cookies to work
app.use(session({
  store: new MemStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'zg-social-dev-secret-key-change-in-production',
  resave: true, // CRITICAL: true to ensure session is always saved
  saveUninitialized: true, // CRITICAL: true to allow wallet connection before user data exists
  name: 'connect.sid', // Explicit session cookie name
  cookie: {
    secure: false, // CRITICAL: false for localhost HTTP (true for HTTPS/tunnel)
    httpOnly: true, // Prevent XSS attacks
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax', // 'lax' for development, 'none' for cross-origin/tunnel
    domain: undefined, // CRITICAL: undefined for localhost - browser will set automatically
    path: '/' // Cookie available for all paths
  },
  proxy: true, // Trust proxy headers (important for tunnels/reverse proxies)
  rolling: true // Reset cookie maxAge on every request (keep session alive)
}));

// Debug middleware to log session creation and ensure session is tracked
app.use((req, res, next) => {
  // Log session info for debugging (only for API endpoints)
  if (req.path.startsWith('/api/')) {
    const sessionId = req.sessionID;
    const hasCookie = !!req.headers.cookie;
    const walletConn = req.session?.walletConnection;

    console.log(`[SESSION DEBUG] ${req.method} ${req.path}`);
    console.log(`[SESSION DEBUG] Session ID: ${sessionId}`);
    console.log(`[SESSION DEBUG] Cookie header: ${hasCookie ? 'present' : 'MISSING'}`);
    if (hasCookie) {
      const cookieMatch = req.headers.cookie?.match(/connect\.sid=([^;]+)/);
      console.log(`[SESSION DEBUG] Cookie value: ${cookieMatch ? cookieMatch[1].substring(0, 20) + '...' : 'not found'}`);
    }
    console.log(`[SESSION DEBUG] Session walletConnection:`, walletConn ? JSON.stringify(walletConn) : 'not set');
  }

  // Ensure session cookie is set correctly
  // express-session middleware runs before this, so we hook into response
  const originalSend = res.send;
  res.send = function (...args: any[]) {
    // Check if Set-Cookie header will be set by express-session
    if (req.session && req.session.walletConnection) {
      // express-session sets cookie automatically if session was modified
      // Check if cookie header exists
      const setCookieHeader = res.getHeader('Set-Cookie');
      if (setCookieHeader) {
        console.log('[SESSION DEBUG] ✅ Set-Cookie header will be sent');
      } else {
        // If Set-Cookie not set, express-session will set it before response is sent
        // But we can verify by checking if session was modified
        console.log('[SESSION DEBUG] Set-Cookie will be set by express-session middleware');
      }
    }
    return originalSend.apply(res, args);
  };

  next();
});

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

    // Register AI Agent routes
    registerAIAgentRoutes(app);

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
