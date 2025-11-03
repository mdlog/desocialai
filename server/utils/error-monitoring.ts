/**
 * Error Monitoring Service
 * Centralized error tracking and monitoring using Sentry
 */

import * as Sentry from '@sentry/node';

/**
 * Initialize error monitoring
 * @param dsn - Sentry DSN (Data Source Name)
 */
export function initializeErrorMonitoring(dsn?: string) {
    if (!dsn && process.env.NODE_ENV === 'production') {
        console.warn('[Error Monitoring] Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    if (dsn) {
        Sentry.init({
            dsn,
            environment: process.env.NODE_ENV || 'development',
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
            integrations: [
                // Add integrations
                new Sentry.Integrations.Http({ tracing: true }),
                new Sentry.Integrations.Express({ app: undefined }),
            ],
        });

        console.log('[Error Monitoring] Sentry initialized successfully');
    }
}

/**
 * Capture exception with context
 * @param error - Error object
 * @param context - Additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
    console.error('[Error]', error);

    if (context) {
        Sentry.setContext('additional', context);
    }

    Sentry.captureException(error);
}

/**
 * Capture message with level
 * @param message - Message to capture
 * @param level - Severity level
 * @param context - Additional context
 */
export function captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, any>
) {
    console.log(`[${level.toUpperCase()}]`, message);

    if (context) {
        Sentry.setContext('additional', context);
    }

    Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 * @param userId - User ID
 * @param username - Username
 * @param walletAddress - Wallet address
 */
export function setUserContext(userId: string, username?: string, walletAddress?: string) {
    Sentry.setUser({
        id: userId,
        username,
        wallet: walletAddress,
    });
}

/**
 * Clear user context
 */
export function clearUserContext() {
    Sentry.setUser(null);
}

/**
 * Express error handler middleware
 */
export const errorHandler = Sentry.Handlers.errorHandler();

/**
 * Express request handler middleware
 */
export const requestHandler = Sentry.Handlers.requestHandler();

export default {
    initializeErrorMonitoring,
    captureException,
    captureMessage,
    setUserContext,
    clearUserContext,
    errorHandler,
    requestHandler,
};
