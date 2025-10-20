/**
 * Engagement Agent
 * Responds to comments and messages intelligently using 0G Compute Network
 */

import { zgComputeService } from '../zg-compute-real';
import { zgDAService } from '../zg-da';

export interface EngagementRule {
    type: 'auto_reply' | 'auto_like' | 'auto_follow';
    condition: string;
    action: string;
    enabled: boolean;
}

export interface EngagementMetrics {
    repliesGenerated: number;
    commentsProcessed: number;
    messagesHandled: number;
    averageResponseTime: number;
    satisfactionScore: number;
}

export class EngagementAgent {
    private userId: string;
    private rules: EngagementRule[] = [];
    private metrics: EngagementMetrics = {
        repliesGenerated: 0,
        commentsProcessed: 0,
        messagesHandled: 0,
        averageResponseTime: 0,
        satisfactionScore: 0
    };
    private isActive: boolean = false;

    constructor(userId: string) {
        this.userId = userId;
        this.initializeDefaultRules();
    }

    private initializeDefaultRules() {
        this.rules = [
            {
                type: 'auto_reply',
                condition: 'question',
                action: 'provide_helpful_answer',
                enabled: true
            },
            {
                type: 'auto_reply',
                condition: 'positive_feedback',
                action: 'thank_and_engage',
                enabled: true
            },
            {
                type: 'auto_like',
                condition: 'relevant_comment',
                action: 'like_comment',
                enabled: true
            }
        ];
    }

    /**
     * Generate intelligent reply to comment using 0G Compute
     */
    async generateReply(comment: string, postContext: string, commentAuthor: string): Promise<{ success: boolean; reply: string; shouldPost: boolean }> {
        try {
            const startTime = Date.now();
            console.log(`[Engagement Agent] Generating reply to comment from ${commentAuthor}`);

            const prompt = `You are an intelligent engagement assistant managing social media interactions.

Original Post: "${postContext}"
Comment from ${commentAuthor}: "${comment}"

Generate an appropriate reply that:
- Is friendly and engaging
- Adds value to the conversation
- Maintains authentic tone
- Encourages further engagement
- Is concise (1-2 sentences)

Reply:`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 150,
                temperature: 0.8
            });

            if (result.success) {
                const responseTime = Date.now() - startTime;
                this.metrics.repliesGenerated++;
                this.metrics.commentsProcessed++;
                this.updateAverageResponseTime(responseTime);

                // Record on 0G DA
                await zgDAService.recordInteraction('engagement_reply', this.userId, 'comment_reply', {
                    comment,
                    reply: result.content,
                    responseTime
                });

                console.log(`[Engagement Agent] ✅ Reply generated in ${responseTime}ms`);

                return {
                    success: true,
                    reply: result.content,
                    shouldPost: this.shouldAutoPost(comment)
                };
            }

            return {
                success: false,
                reply: '',
                shouldPost: false
            };
        } catch (error) {
            console.error('[Engagement Agent] Reply generation failed:', error);
            return {
                success: false,
                reply: '',
                shouldPost: false
            };
        }
    }

    /**
     * Analyze comment sentiment and intent
     */
    async analyzeComment(comment: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; intent: string; priority: 'high' | 'medium' | 'low' }> {
        try {
            const prompt = `Analyze this social media comment:

Comment: "${comment}"

Provide analysis in JSON format:
{
  "sentiment": "positive|neutral|negative",
  "intent": "question|feedback|spam|engagement",
  "priority": "high|medium|low"
}`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 100,
                temperature: 0.3
            });

            if (result.success) {
                try {
                    const analysis = JSON.parse(result.content);
                    return analysis;
                } catch {
                    return {
                        sentiment: 'neutral',
                        intent: 'engagement',
                        priority: 'medium'
                    };
                }
            }

            return {
                sentiment: 'neutral',
                intent: 'engagement',
                priority: 'medium'
            };
        } catch (error) {
            console.error('[Engagement Agent] Comment analysis failed:', error);
            return {
                sentiment: 'neutral',
                intent: 'engagement',
                priority: 'medium'
            };
        }
    }

    /**
     * Handle direct message intelligently
     */
    async handleMessage(message: string, senderName: string): Promise<{ success: boolean; response: string; requiresHumanReview: boolean }> {
        try {
            console.log(`[Engagement Agent] Handling message from ${senderName}`);

            const prompt = `You are an AI assistant handling direct messages.

Message from ${senderName}: "${message}"

Generate an appropriate response that:
- Is helpful and informative
- Maintains professional tone
- Addresses the message content
- Is concise and clear

If the message requires human attention (complex questions, complaints, business inquiries), 
indicate this by starting your response with "[HUMAN_REVIEW]"

Response:`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 200,
                temperature: 0.7
            });

            if (result.success) {
                const requiresHumanReview = result.content.startsWith('[HUMAN_REVIEW]');
                const response = result.content.replace('[HUMAN_REVIEW]', '').trim();

                this.metrics.messagesHandled++;

                // Record on 0G DA
                await zgDAService.recordInteraction('engagement_message', this.userId, 'dm_response', {
                    message,
                    response,
                    requiresHumanReview
                });

                return {
                    success: true,
                    response,
                    requiresHumanReview
                };
            }

            return {
                success: false,
                response: '',
                requiresHumanReview: true
            };
        } catch (error) {
            console.error('[Engagement Agent] Message handling failed:', error);
            return {
                success: false,
                response: '',
                requiresHumanReview: true
            };
        }
    }

    /**
     * Determine if reply should be auto-posted
     */
    private shouldAutoPost(comment: string): boolean {
        // Check if comment is a question
        const isQuestion = comment.includes('?') ||
            comment.toLowerCase().includes('how') ||
            comment.toLowerCase().includes('what') ||
            comment.toLowerCase().includes('why');

        // Auto-post for questions and positive feedback
        return isQuestion || comment.toLowerCase().includes('great') ||
            comment.toLowerCase().includes('love') ||
            comment.toLowerCase().includes('awesome');
    }

    /**
     * Update average response time
     */
    private updateAverageResponseTime(newTime: number) {
        const total = this.metrics.averageResponseTime * (this.metrics.repliesGenerated - 1) + newTime;
        this.metrics.averageResponseTime = total / this.metrics.repliesGenerated;
    }

    /**
     * Get engagement metrics
     */
    getMetrics(): EngagementMetrics {
        return { ...this.metrics };
    }

    /**
     * Add engagement rule
     */
    addRule(rule: EngagementRule) {
        this.rules.push(rule);
    }

    /**
     * Update engagement rule
     */
    updateRule(index: number, updates: Partial<EngagementRule>) {
        if (this.rules[index]) {
            this.rules[index] = { ...this.rules[index], ...updates };
        }
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            userId: this.userId,
            isActive: this.isActive,
            rules: this.rules,
            metrics: this.metrics
        };
    }

    /**
     * Start agent
     */
    start() {
        this.isActive = true;
        console.log(`[Engagement Agent] Started for user ${this.userId}`);
    }

    /**
     * Stop agent
     */
    stop() {
        this.isActive = false;
        console.log(`[Engagement Agent] Stopped for user ${this.userId}`);
    }
}
