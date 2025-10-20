/**
 * Research Agent
 * Finds and curates relevant content for users using 0G Compute Network
 */

import { zgComputeService } from '../zg-compute-real';
import { zgStorageService } from '../zg-storage';
import { zgDAService } from '../zg-da';

export interface ResearchTopic {
    topic: string;
    keywords: string[];
    priority: 'high' | 'medium' | 'low';
}

export interface CuratedContent {
    id: string;
    title: string;
    summary: string;
    source: string;
    relevanceScore: number;
    insights: string[];
    suggestedActions: string[];
    createdAt: Date;
}

export class ResearchAgent {
    private userId: string;
    private topics: ResearchTopic[] = [];
    private curatedContent: Map<string, CuratedContent> = new Map();
    private isActive: boolean = false;

    constructor(userId: string, topics: ResearchTopic[]) {
        this.userId = userId;
        this.topics = topics;
    }

    /**
     * Research and curate content on specific topic using 0G Compute
     */
    async researchTopic(topic: string, context?: any): Promise<{ success: boolean; insights: CuratedContent[] }> {
        try {
            console.log(`[Research Agent] Researching topic: ${topic}`);

            const prompt = `You are a research assistant specializing in ${topic}.

Research this topic and provide:
1. Key insights and trends
2. Important developments
3. Relevant discussions
4. Actionable takeaways

${context ? `Context: ${JSON.stringify(context)}` : ''}

Provide 3-5 curated insights in JSON format:
[{
  "title": "insight title",
  "summary": "brief summary",
  "relevanceScore": 0.9,
  "insights": ["key point 1", "key point 2"],
  "suggestedActions": ["action 1", "action 2"]
}]`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 800,
                temperature: 0.6
            });

            if (result.success) {
                try {
                    const insights = JSON.parse(result.content);
                    const curatedInsights: CuratedContent[] = insights.map((insight: any) => ({
                        id: `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        title: insight.title,
                        summary: insight.summary,
                        source: '0G Compute Research',
                        relevanceScore: insight.relevanceScore || 0.8,
                        insights: insight.insights || [],
                        suggestedActions: insight.suggestedActions || [],
                        createdAt: new Date()
                    }));

                    // Store curated content
                    for (const content of curatedInsights) {
                        this.curatedContent.set(content.id, content);
                    }

                    // Record on 0G DA
                    await zgDAService.recordInteraction('research', this.userId, topic, {
                        insightsCount: curatedInsights.length
                    });

                    console.log(`[Research Agent] ✅ Found ${curatedInsights.length} insights`);

                    return {
                        success: true,
                        insights: curatedInsights
                    };
                } catch {
                    return {
                        success: false,
                        insights: []
                    };
                }
            }

            return {
                success: false,
                insights: []
            };
        } catch (error) {
            console.error('[Research Agent] Research failed:', error);
            return {
                success: false,
                insights: []
            };
        }
    }

    /**
     * Find trending topics in user's niche
     */
    async findTrendingTopics(userInterests: string[]): Promise<{ success: boolean; topics: Array<{ topic: string; trendScore: number; reason: string }> }> {
        try {
            const prompt = `Based on these interests: ${userInterests.join(', ')}

Identify 5 trending topics that are:
- Currently relevant and timely
- Aligned with user interests
- Have high engagement potential
- Provide value to the audience

Return JSON array:
[{
  "topic": "topic name",
  "trendScore": 0.9,
  "reason": "why it's trending"
}]`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 500,
                temperature: 0.5
            });

            if (result.success) {
                try {
                    const topics = JSON.parse(result.content);
                    return {
                        success: true,
                        topics
                    };
                } catch {
                    return {
                        success: false,
                        topics: []
                    };
                }
            }

            return {
                success: false,
                topics: []
            };
        } catch (error) {
            console.error('[Research Agent] Trending topics failed:', error);
            return {
                success: false,
                topics: []
            };
        }
    }

    /**
     * Analyze content and extract key insights
     */
    async analyzeContent(content: string): Promise<{ success: boolean; analysis: { summary: string; keyPoints: string[]; sentiment: string; actionItems: string[] } }> {
        try {
            const prompt = `Analyze this content and extract key insights:

Content: "${content}"

Provide analysis in JSON format:
{
  "summary": "brief summary",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "sentiment": "positive|neutral|negative",
  "actionItems": ["action 1", "action 2"]
}`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 400,
                temperature: 0.4
            });

            if (result.success) {
                try {
                    const analysis = JSON.parse(result.content);
                    return {
                        success: true,
                        analysis
                    };
                } catch {
                    return {
                        success: false,
                        analysis: {
                            summary: '',
                            keyPoints: [],
                            sentiment: 'neutral',
                            actionItems: []
                        }
                    };
                }
            }

            return {
                success: false,
                analysis: {
                    summary: '',
                    keyPoints: [],
                    sentiment: 'neutral',
                    actionItems: []
                }
            };
        } catch (error) {
            console.error('[Research Agent] Content analysis failed:', error);
            return {
                success: false,
                analysis: {
                    summary: '',
                    keyPoints: [],
                    sentiment: 'neutral',
                    actionItems: []
                }
            };
        }
    }

    /**
     * Generate content ideas based on research
     */
    async generateContentIdeas(researchData: any[]): Promise<{ success: boolean; ideas: Array<{ title: string; angle: string; targetAudience: string; estimatedEngagement: string }> }> {
        try {
            const prompt = `Based on this research data:
${JSON.stringify(researchData.slice(0, 5))}

Generate 5 content ideas that:
- Are unique and engaging
- Leverage current trends
- Provide value to audience
- Have high viral potential

Return JSON array:
[{
  "title": "content title",
  "angle": "unique perspective",
  "targetAudience": "who will engage",
  "estimatedEngagement": "high|medium|low"
}]`;

            const result = await zgComputeService.generateContent(prompt, {
                maxTokens: 600,
                temperature: 0.7
            });

            if (result.success) {
                try {
                    const ideas = JSON.parse(result.content);
                    return {
                        success: true,
                        ideas
                    };
                } catch {
                    return {
                        success: false,
                        ideas: []
                    };
                }
            }

            return {
                success: false,
                ideas: []
            };
        } catch (error) {
            console.error('[Research Agent] Content ideas generation failed:', error);
            return {
                success: false,
                ideas: []
            };
        }
    }

    /**
     * Get all curated content
     */
    getCuratedContent(): CuratedContent[] {
        return Array.from(this.curatedContent.values());
    }

    /**
     * Add research topic
     */
    addTopic(topic: ResearchTopic) {
        this.topics.push(topic);
    }

    /**
     * Remove research topic
     */
    removeTopic(topic: string) {
        this.topics = this.topics.filter(t => t.topic !== topic);
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            userId: this.userId,
            isActive: this.isActive,
            topics: this.topics,
            curatedCount: this.curatedContent.size
        };
    }

    /**
     * Start agent
     */
    start() {
        this.isActive = true;
        console.log(`[Research Agent] Started for user ${this.userId}`);
    }

    /**
     * Stop agent
     */
    stop() {
        this.isActive = false;
        console.log(`[Research Agent] Stopped for user ${this.userId}`);
    }
}
