/**
 * Personal AI Assistant Agent
 * Manages user's social presence using 0G Compute Network
 */

import { zgComputeService } from '../zg-compute-real';
import { zgStorageService } from '../zg-storage';
import { zgDAService } from '../zg-da';

export interface PersonalAssistantConfig {
    userId: string;
    personality: 'professional' | 'casual' | 'creative' | 'analytical';
    responseStyle: 'concise' | 'detailed' | 'friendly' | 'formal';
    topics: string[];
    autoRespond: boolean;
}

export interface AssistantTask {
    id: string;
    type: 'draft_post' | 'reply_comment' | 'summarize_feed' | 'suggest_content';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    input: any;
    output?: any;
    createdAt: Date;
    completedAt?: Date;
}

export class PersonalAssistantAgent {
    private config: PersonalAssistantConfig;
    private tasks: Map<string, AssistantTask> = new Map();

    constructor(config: PersonalAssistantConfig) {
        this.config = config;
    }

    /**
     * Draft a post using 0G Compute
     */
    async draftPost(topic: string, context?: any): Promise<{ success: boolean; content: string; storageHash?: string }> {
        try {
            console.log(`[Personal Assistant] Drafting post about: ${topic}`);

            const prompt = this.buildDraftPrompt(topic, context);

            // Use 0G Compute for AI generation
            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 300,
                temperature: 0.7
            });

            if (!result.success) {
                throw new Error('Failed to generate content');
            }

            // Store draft on 0G Storage
            const storageResult = await zgStorageService.storeContent(result.content, {
                type: 'post',
                userId: this.config.userId
            });

            // Record on 0G DA
            await zgDAService.recordInteraction('ai_draft', this.config.userId, 'draft_post', {
                topic,
                storageHash: storageResult.hash
            });

            console.log(`[Personal Assistant] ✅ Post drafted and stored on 0G Storage`);

            return {
                success: true,
                content: result.content,
                storageHash: storageResult.hash
            };
        } catch (error) {
            console.error('[Personal Assistant] Draft failed:', error);
            return {
                success: false,
                content: ''
            };
        }
    }

    /**
     * Generate intelligent reply to comment
     */
    async generateReply(comment: string, postContext: string): Promise<{ success: boolean; reply: string }> {
        try {
            const prompt = `You are a ${this.config.personality} AI assistant helping manage social media.

Original Post: "${postContext}"
Comment: "${comment}"

Generate an appropriate ${this.config.responseStyle} reply that:
- Matches the ${this.config.personality} personality
- Is engaging and adds value
- Maintains conversation flow
- Is authentic and natural

Reply:`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 150,
                temperature: 0.8
            });

            if (result.success) {
                // Record on 0G DA
                await zgDAService.recordInteraction('ai_reply', this.config.userId, 'comment_reply', {
                    comment,
                    reply: result.content
                });
            }

            return {
                success: result.success,
                reply: result.content
            };
        } catch (error) {
            console.error('[Personal Assistant] Reply generation failed:', error);
            return {
                success: false,
                reply: ''
            };
        }
    }

    /**
     * Summarize user's feed
     */
    async summarizeFeed(posts: any[]): Promise<{ success: boolean; summary: string; insights: string[] }> {
        try {
            const postsPreview = posts.slice(0, 10).map(p =>
                `- ${p.author?.displayName}: ${p.content?.slice(0, 100)}...`
            ).join('\n');

            const prompt = `Analyze this social media feed and provide:
1. Brief summary of main topics
2. Key insights and trends
3. Recommended actions

Feed:
${postsPreview}

Provide analysis in JSON format:
{
  "summary": "brief summary",
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 400,
                temperature: 0.5
            });

            if (result.success) {
                try {
                    const parsed = JSON.parse(result.content);
                    return {
                        success: true,
                        summary: parsed.summary,
                        insights: parsed.insights
                    };
                } catch {
                    return {
                        success: true,
                        summary: result.content,
                        insights: []
                    };
                }
            }

            return {
                success: false,
                summary: '',
                insights: []
            };
        } catch (error) {
            console.error('[Personal Assistant] Feed summarization failed:', error);
            return {
                success: false,
                summary: '',
                insights: []
            };
        }
    }

    /**
     * Suggest content ideas
     */
    async suggestContent(userInterests: string[]): Promise<{ success: boolean; suggestions: Array<{ topic: string; angle: string; confidence: number }> }> {
        try {
            const prompt = `Based on these interests: ${userInterests.join(', ')}

Generate 5 content ideas for social media posts. For each idea provide:
- Topic
- Unique angle/perspective
- Confidence score (0-1)

Focus on: ${this.config.topics.join(', ')}

Return JSON array:
[{"topic": "...", "angle": "...", "confidence": 0.9}]`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 500,
                temperature: 0.7
            });

            if (result.success) {
                try {
                    const suggestions = JSON.parse(result.content);
                    return {
                        success: true,
                        suggestions
                    };
                } catch {
                    return {
                        success: false,
                        suggestions: []
                    };
                }
            }

            return {
                success: false,
                suggestions: []
            };
        } catch (error) {
            console.error('[Personal Assistant] Content suggestion failed:', error);
            return {
                success: false,
                suggestions: []
            };
        }
    }

    private buildDraftPrompt(topic: string, context?: any): string {
        return `You are a ${this.config.personality} social media content creator.

Create an engaging post about: ${topic}

Style: ${this.config.responseStyle}
Personality: ${this.config.personality}
Topics of interest: ${this.config.topics.join(', ')}

${context ? `Context: ${JSON.stringify(context)}` : ''}

Requirements:
- Authentic and engaging
- 150-280 characters ideal
- Include relevant insights
- Natural tone
- No excessive emojis

Post:`;
    }

    /**
     * Update agent configuration
     */
    updateConfig(updates: Partial<PersonalAssistantConfig>) {
        this.config = { ...this.config, ...updates };
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            userId: this.config.userId,
            personality: this.config.personality,
            responseStyle: this.config.responseStyle,
            topics: this.config.topics,
            autoRespond: this.config.autoRespond,
            tasksCompleted: this.tasks.size
        };
    }
}
