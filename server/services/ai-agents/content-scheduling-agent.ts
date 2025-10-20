/**
 * Content Scheduling Agent
 * Automated posting based on optimal timing using 0G Compute Network
 */

import { zgComputeService } from '../zg-compute-real';
import { zgStorageService } from '../zg-storage';
import { zgDAService } from '../zg-da';

export interface ScheduledPost {
    id: string;
    content: string;
    scheduledTime: Date;
    status: 'pending' | 'posted' | 'failed';
    storageHash?: string;
    postId?: string;
}

export interface SchedulingStrategy {
    timezone: string;
    optimalTimes: string[]; // ['09:00', '14:00', '18:00']
    frequency: 'daily' | 'weekly' | 'custom';
    daysOfWeek?: number[]; // [1,2,3,4,5] for weekdays
}

export class ContentSchedulingAgent {
    private userId: string;
    private strategy: SchedulingStrategy;
    private scheduledPosts: Map<string, ScheduledPost> = new Map();
    private isActive: boolean = false;

    constructor(userId: string, strategy: SchedulingStrategy) {
        this.userId = userId;
        this.strategy = strategy;
    }

    /**
     * Analyze user's engagement patterns to find optimal posting times
     */
    async analyzeOptimalTimes(engagementHistory: any[]): Promise<string[]> {
        try {
            console.log(`[Scheduling Agent] Analyzing optimal times for user ${this.userId}`);

            const prompt = `Analyze this engagement data and recommend optimal posting times:

Engagement History:
${JSON.stringify(engagementHistory.slice(0, 20))}

Consider:
- Time zones and global audience
- Peak engagement hours
- Day of week patterns
- Content type performance

Return JSON array of optimal times in HH:MM format:
["09:00", "14:00", "18:00"]`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 200,
                temperature: 0.3
            });

            if (result.success) {
                try {
                    const times = JSON.parse(result.content);
                    this.strategy.optimalTimes = times;

                    // Record on 0G DA
                    await zgDAService.recordInteraction('scheduling_analysis', this.userId, 'optimal_times', {
                        times
                    });

                    return times;
                } catch {
                    // Fallback: extract times from text
                    const times = result.content.match(/\d{2}:\d{2}/g) || ['09:00', '14:00', '18:00'];
                    return times;
                }
            }

            return ['09:00', '14:00', '18:00'];
        } catch (error) {
            console.error('[Scheduling Agent] Analysis failed:', error);
            return ['09:00', '14:00', '18:00'];
        }
    }

    /**
     * Schedule a post for optimal time
     */
    async schedulePost(content: string, preferredDate?: Date): Promise<{ success: boolean; scheduledPost?: ScheduledPost }> {
        try {
            // Determine optimal time
            const scheduledTime = preferredDate || this.getNextOptimalTime();

            // Store content on 0G Storage
            const storageResult = await zgStorageService.storeContent(content, {
                type: 'post',
                userId: this.userId
            });

            const scheduledPost: ScheduledPost = {
                id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                content,
                scheduledTime,
                status: 'pending',
                storageHash: storageResult.hash
            };

            this.scheduledPosts.set(scheduledPost.id, scheduledPost);

            // Record on 0G DA
            await zgDAService.recordInteraction('schedule_post', this.userId, scheduledPost.id, {
                scheduledTime: scheduledTime.toISOString(),
                storageHash: storageResult.hash
            });

            console.log(`[Scheduling Agent] ✅ Post scheduled for ${scheduledTime.toISOString()}`);

            return {
                success: true,
                scheduledPost
            };
        } catch (error) {
            console.error('[Scheduling Agent] Scheduling failed:', error);
            return {
                success: false
            };
        }
    }

    /**
     * Get next optimal posting time based on strategy
     */
    private getNextOptimalTime(): Date {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // Find next optimal time today
        for (const timeStr of this.strategy.optimalTimes) {
            const [hour, minute] = timeStr.split(':').map(Number);
            if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
                const nextTime = new Date(now);
                nextTime.setHours(hour, minute, 0, 0);
                return nextTime;
            }
        }

        // If no time today, use first time tomorrow
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [hour, minute] = this.strategy.optimalTimes[0].split(':').map(Number);
        tomorrow.setHours(hour, minute, 0, 0);
        return tomorrow;
    }

    /**
     * Process due posts (called by scheduler)
     */
    async processDuePosts(): Promise<ScheduledPost[]> {
        const now = Date.now();
        const duePosts: ScheduledPost[] = [];

        for (const [id, post] of this.scheduledPosts.entries()) {
            if (post.status === 'pending' && post.scheduledTime.getTime() <= now) {
                duePosts.push(post);
                post.status = 'posted'; // Mark as posted

                console.log(`[Scheduling Agent] ✅ Post ${id} is due for posting`);
            }
        }

        return duePosts;
    }

    /**
     * Get all scheduled posts
     */
    getScheduledPosts(): ScheduledPost[] {
        return Array.from(this.scheduledPosts.values());
    }

    /**
     * Cancel scheduled post
     */
    cancelScheduledPost(postId: string): boolean {
        return this.scheduledPosts.delete(postId);
    }

    /**
     * Update scheduling strategy
     */
    updateStrategy(updates: Partial<SchedulingStrategy>) {
        this.strategy = { ...this.strategy, ...updates };
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            userId: this.userId,
            isActive: this.isActive,
            strategy: this.strategy,
            scheduledCount: this.scheduledPosts.size,
            pendingCount: Array.from(this.scheduledPosts.values()).filter(p => p.status === 'pending').length
        };
    }

    /**
     * Start agent
     */
    start() {
        this.isActive = true;
        console.log(`[Scheduling Agent] Started for user ${this.userId}`);
    }

    /**
     * Stop agent
     */
    stop() {
        this.isActive = false;
        console.log(`[Scheduling Agent] Stopped for user ${this.userId}`);
    }
}
