/**
 * Background retry system for failed 0G Storage uploads
 * Handles posts that failed to upload to 0G Storage and retries them periodically
 */

import { ZgStorageService } from './zg-storage.js';
import type { IStorage } from '../storage.js';

interface RetryItem {
  postId: string;
  content: string;
  userId: string;
  attempts: number;
  lastAttempt: Date;
  nextRetry: Date;
  errorType: string;
}

export class ZGStorageRetryQueue {
  private retryQueue: Map<string, RetryItem> = new Map();
  private zgStorage: ZgStorageService;
  private storage: IStorage;
  private isProcessing = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(zgStorage: ZgStorageService, storage: IStorage) {
    this.zgStorage = zgStorage;
    this.storage = storage;
  }

  /**
   * Add a failed post to the retry queue
   */
  addToQueue(postId: string, content: string, userId: string, errorType: string = 'network_error') {
    const now = new Date();
    const nextRetry = new Date(now.getTime() + this.getRetryDelay(1)); // Start with 1st attempt delay

    this.retryQueue.set(postId, {
      postId,
      content,
      userId,
      attempts: 0,
      lastAttempt: now,
      nextRetry,
      errorType
    });

    console.log(`[Retry Queue] Added post ${postId} to retry queue. Next retry: ${nextRetry.toISOString()}`);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing();
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 5min, 15min, 45min, 2h, 6h, 12h, 24h
    const delays = [
      5 * 60 * 1000,      // 5 minutes
      15 * 60 * 1000,     // 15 minutes
      45 * 60 * 1000,     // 45 minutes
      2 * 60 * 60 * 1000, // 2 hours
      6 * 60 * 60 * 1000, // 6 hours
      12 * 60 * 60 * 1000, // 12 hours
      24 * 60 * 60 * 1000  // 24 hours
    ];
    
    return delays[Math.min(attempt - 1, delays.length - 1)];
  }

  /**
   * Start background processing of retry queue
   */
  private startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('[Retry Queue] Starting background retry processor...');
    
    // Process queue every 30 seconds
    this.intervalId = setInterval(() => {
      this.processQueue();
    }, 30 * 1000);
  }

  /**
   * Stop background processing
   */
  stopProcessing() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isProcessing = false;
    console.log('[Retry Queue] Stopped background retry processor');
  }

  /**
   * Process items in the retry queue
   */
  private async processQueue() {
    if (this.retryQueue.size === 0) return;

    const now = new Date();
    const itemsToProcess = Array.from(this.retryQueue.values())
      .filter(item => now >= item.nextRetry)
      .sort((a, b) => a.nextRetry.getTime() - b.nextRetry.getTime());

    if (itemsToProcess.length === 0) return;

    console.log(`[Retry Queue] Processing ${itemsToProcess.length} items from retry queue...`);

    for (const item of itemsToProcess) {
      await this.retryUpload(item);
    }
  }

  /**
   * Retry uploading a specific item
   */
  private async retryUpload(item: RetryItem) {
    const maxAttempts = 7; // Max 7 attempts over ~48 hours
    
    if (item.attempts >= maxAttempts) {
      console.warn(`[Retry Queue] Post ${item.postId} exceeded max retry attempts (${maxAttempts}). Removing from queue.`);
      this.retryQueue.delete(item.postId);
      return;
    }

    item.attempts++;
    item.lastAttempt = new Date();
    
    console.log(`[Retry Queue] Retrying upload for post ${item.postId} (attempt ${item.attempts}/${maxAttempts})`);

    try {
      // Attempt to upload to 0G Storage
      const result = await this.zgStorage.storeContent(item.content, {
        type: 'post',
        userId: item.userId,
        retryAttempt: true,
        backgroundRetry: true
      });

      if (result.success) {
        console.log(`[Retry Queue] ✅ Successfully uploaded post ${item.postId} to 0G Storage`);
        
        // Update post in database with 0G Storage info
        try {
          await this.storage.updatePost(item.postId, {
            storageHash: result.hash,
            transactionHash: result.transactionHash
          });
          console.log(`[Retry Queue] Updated post ${item.postId} with 0G Storage metadata`);
        } catch (dbError) {
          console.error(`[Retry Queue] Failed to update post ${item.postId} in database:`, dbError);
        }

        // Remove from retry queue
        this.retryQueue.delete(item.postId);
      } else {
        // Upload failed, schedule next retry
        const nextDelay = this.getRetryDelay(item.attempts + 1);
        item.nextRetry = new Date(Date.now() + nextDelay);
        
        console.warn(`[Retry Queue] Retry failed for post ${item.postId}. Next retry: ${item.nextRetry.toISOString()}`);
        console.warn(`[Retry Queue] Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`[Retry Queue] Exception during retry for post ${item.postId}:`, error);
      
      // Schedule next retry
      const nextDelay = this.getRetryDelay(item.attempts + 1);
      item.nextRetry = new Date(Date.now() + nextDelay);
    }
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      totalItems: this.retryQueue.size,
      processing: this.isProcessing,
      items: Array.from(this.retryQueue.values()).map(item => ({
        postId: item.postId,
        attempts: item.attempts,
        nextRetry: item.nextRetry,
        errorType: item.errorType
      }))
    };
  }

  /**
   * Remove a specific item from queue
   */
  removeFromQueue(postId: string): boolean {
    const removed = this.retryQueue.delete(postId);
    if (removed) {
      console.log(`[Retry Queue] Manually removed post ${postId} from retry queue`);
    }
    return removed;
  }
}