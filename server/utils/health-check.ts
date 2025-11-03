/**
 * Health Check Service
 * Provides health and readiness endpoints for load balancers
 */

import { db } from '../db';
import { zgChainService } from '../services/zg-chain';

export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    checks: {
        database: CheckResult;
        blockchain: CheckResult;
        memory: CheckResult;
    };
}

export interface CheckResult {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    responseTime?: number;
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckResult> {
    const start = Date.now();
    try {
        await db.execute('SELECT 1');
        return {
            status: 'pass',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Database connection failed',
            responseTime: Date.now() - start,
        };
    }
}

/**
 * Check blockchain connectivity
 */
async function checkBlockchain(): Promise<CheckResult> {
    const start = Date.now();
    try {
        await zgChainService.getCurrentBlockHeight();
        return {
            status: 'pass',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'warn',
            message: 'Blockchain connection degraded',
            responseTime: Date.now() - start,
        };
    }
}

/**
 * Check memory usage
 */
function checkMemory(): CheckResult {
    const usage = process.memoryUsage();
    const heapUsedPercent = (usage.heapUsed / usage.heapTotal) * 100;

    if (heapUsedPercent > 90) {
        return {
            status: 'fail',
            message: `High memory usage: ${heapUsedPercent.toFixed(2)}%`,
        };
    } else if (heapUsedPercent > 75) {
        return {
            status: 'warn',
            message: `Elevated memory usage: ${heapUsedPercent.toFixed(2)}%`,
        };
    }

    return {
        status: 'pass',
        message: `Memory usage: ${heapUsedPercent.toFixed(2)}%`,
    };
}

/**
 * Perform full health check
 */
export async function performHealthCheck(): Promise<HealthStatus> {
    const [database, blockchain] = await Promise.all([
        checkDatabase(),
        checkBlockchain(),
    ]);

    const memory = checkMemory();

    const checks = { database, blockchain, memory };

    // Determine overall status
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (database.status === 'fail') {
        status = 'unhealthy';
    } else if (
        blockchain.status === 'warn' ||
        memory.status === 'warn' ||
        memory.status === 'fail'
    ) {
        status = 'degraded';
    }

    return {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks,
    };
}

/**
 * Simple liveness check (is the service running?)
 */
export function livenessCheck(): { status: 'ok'; timestamp: string } {
    return {
        status: 'ok',
        timestamp: new Date().toISOString(),
    };
}

/**
 * Readiness check (is the service ready to accept traffic?)
 */
export async function readinessCheck(): Promise<{
    status: 'ready' | 'not_ready';
    timestamp: string;
}> {
    try {
        const dbCheck = await checkDatabase();
        if (dbCheck.status === 'fail') {
            return {
                status: 'not_ready',
                timestamp: new Date().toISOString(),
            };
        }

        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        return {
            status: 'not_ready',
            timestamp: new Date().toISOString(),
        };
    }
}
