/**
 * Structured Logging Service
 * Centralized logging with Winston
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Define transports
const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
        format: consoleFormat,
    }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    // Error log
    transports.push(
        new DailyRotateFile({
            filename: path.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            format,
        })
    );

    // Combined log
    transports.push(
        new DailyRotateFile({
            filename: path.join('logs', 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            format,
        })
    );
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    levels,
    format,
    transports,
    exitOnError: false,
});

/**
 * Log error with context
 */
export function logError(message: string, error?: Error, context?: Record<string, any>) {
    logger.error(message, {
        error: error?.message,
        stack: error?.stack,
        ...context,
    });
}

/**
 * Log warning with context
 */
export function logWarn(message: string, context?: Record<string, any>) {
    logger.warn(message, context);
}

/**
 * Log info with context
 */
export function logInfo(message: string, context?: Record<string, any>) {
    logger.info(message, context);
}

/**
 * Log HTTP request
 */
export function logHttp(message: string, context?: Record<string, any>) {
    logger.http(message, context);
}

/**
 * Log debug information
 */
export function logDebug(message: string, context?: Record<string, any>) {
    logger.debug(message, context);
}

/**
 * Express middleware for logging HTTP requests
 */
export function httpLogger(req: any, res: any, next: any) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logHttp(`${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });

    next();
}

export default logger;
