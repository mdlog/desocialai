import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import fs from "fs";
import path from "path";
import apiRouter from './routes/index.js';
import { addClient, removeClient } from './utils/websocket.js';

/**
 * Setup server with routes and WebSocket
 */
export async function setupServer(app: Express): Promise<Server> {
    // CORS middleware for routes
    app.use((req, res, next) => {
        const currentOrigin = res.getHeader('Access-Control-Allow-Origin');
        if (!currentOrigin || currentOrigin === '*') {
            const origin = req.headers.origin;
            const allowedOrigins = [
                'http://localhost:5000',
                'http://localhost:3005',
                'https://desocialai.live',
                'https://desocialai.xyz',
                process.env.ALLOWED_ORIGIN
            ].filter(Boolean);

            let finalOrigin: string;
            if (origin && allowedOrigins.includes(origin)) {
                finalOrigin = origin;
            } else if (process.env.NODE_ENV === 'development') {
                if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
                    finalOrigin = origin;
                } else {
                    finalOrigin = 'http://localhost:5000';
                }
            } else {
                finalOrigin = origin || 'https://desocialai.live';
            }

            res.header('Access-Control-Allow-Origin', finalOrigin);
            res.header('Access-Control-Allow-Credentials', 'true');

            if (req.path.startsWith('/api/')) {
                console.log(`[CORS] ${req.method} ${req.path} - Origin: ${finalOrigin}`);
            }
        }
        next();
    });

    // Debug middleware
    app.use((req, res, next) => {
        if (req.path.includes('/api/posts')) {
            console.log(`[DEBUG] ${req.method} ${req.path}`);
        }
        if (req.path.includes('/api/messages')) {
            console.log(`[DEBUG] ${req.method} ${req.path}`);
        }
        next();
    });

    // Serve local storage as static files
    try {
        const storagePath = path.join(process.cwd(), 'storage');
        if (fs.existsSync(storagePath)) {
            app.use('/storage', express.static(storagePath));
            console.log('[STATIC] Serving local storage at /storage');
        }
    } catch (e) {
        console.warn('[STATIC] Failed to setup storage static serving:', e);
    }

    // Mount API routes
    console.log('[SETUP] Mounting API routes at /api');
    app.use('/api', (req, res, next) => {
        console.log(`[API] ${req.method} ${req.path}`);
        next();
    }, apiRouter);

    // Create HTTP server
    const httpServer = createServer(app);

    // Setup WebSocket server on /ws path
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

    wss.on('connection', (ws: WebSocket) => {
        console.log('New WebSocket client connected');
        addClient(ws);

        ws.on('close', () => {
            console.log('WebSocket client disconnected');
            removeClient(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            removeClient(ws);
        });
    });

    return httpServer;
}
