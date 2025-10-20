/**
 * AI Agent Manager
 * Coordinates all 5 AI agents using 0G Compute Network
 */

import { PersonalAssistantAgent, PersonalAssistantConfig } from './personal-assistant-agent';
import { EngagementAgent } from './engagement-agent';
import { ContentSchedulingAgent, SchedulingStrategy } from './content-scheduling-agent';
import { ResearchAgent, ResearchTopic } from './research-agent';
import { NetworkGrowthAgent, GrowthStrategy } from './network-growth-agent';
import { zgDAService } from '../zg-da';

export interface UserAgentConfig {
    userId: string;
    personalAssistant?: PersonalAssistantConfig;
    schedulingStrategy?: SchedulingStrategy;
    researchTopics?: ResearchTopic[];
    growthStrategy?: GrowthStrategy;
}

export interface AgentStatus {
    personalAssistant: any;
    engagement: any;
    scheduling: any;
    research: any;
    networkGrowth: any;
}

export class AIAgentManager {
    private userAgents: Map<string, {
        personalAssistant: PersonalAssistantAgent;
        engagement: EngagementAgent;
        scheduling: ContentSchedulingAgent;
        research: ResearchAgent;
        networkGrowth: NetworkGrowthAgent;
    }> = new Map();

    /**
     * Initialize all agents for a user
     */
    async initializeAgents(config: UserAgentConfig): Promise<{ success: boolean; message: string }> {
        try {
            const { userId } = config;

            // Personal Assistant Agent
            const personalAssistant = new PersonalAssistantAgent(
                config.personalAssistant || {
                    userId,
                    personality: 'professional',
                    responseStyle: 'concise',
                    topics: ['blockchain', 'AI', 'web3'],
                    autoRespond: false
                }
            );

            // Engagement Agent
            const engagement = new EngagementAgent(userId);

            // Content Scheduling Agent
            const scheduling = new ContentSchedulingAgent(
                userId,
                config.schedulingStrategy || {
                    timezone: 'UTC',
                    optimalTimes: ['09:00', '14:00', '18:00'],
                    frequency: 'daily'
                }
            );

            // Research Agent
            const research = new ResearchAgent(
                userId,
                config.researchTopics || [
                    { topic: 'blockchain', keywords: ['defi', 'nft', 'web3'], priority: 'high' },
                    { topic: 'AI', keywords: ['machine learning', 'neural networks'], priority: 'high' }
                ]
            );

            // Network Growth Agent
            const networkGrowth = new NetworkGrowthAgent(
                userId,
                config.growthStrategy || {
                    targetAudience: ['blockchain developers', 'AI researchers'],
                    engagementStyle: 'moderate',
                    dailyTargets: 10,
                    focusAreas: ['technology', 'innovation']
                }
            );

            // Store agents
            this.userAgents.set(userId, {
                personalAssistant,
                engagement,
                scheduling,
                research,
                networkGrowth
            });

            // Record on 0G DA
            await zgDAService.recordInteraction('agent_init', userId, 'all_agents', {
                timestamp: new Date().toISOString()
            });

            console.log(`[Agent Manager] ✅ All agents initialized for user ${userId}`);

            return {
                success: true,
                message: 'All AI agents initialized successfully'
            };
        } catch (error) {
            console.error('[Agent Manager] Initialization failed:', error);
            return {
                success: false,
                message: 'Failed to initialize AI agents'
            };
        }
    }

    /**
     * Get all agents for a user
     */
    getUserAgents(userId: string) {
        return this.userAgents.get(userId);
    }

    /**
     * Get agent status for all agents
     */
    getAgentStatus(userId: string): AgentStatus | null {
        const agents = this.userAgents.get(userId);
        if (!agents) return null;

        return {
            personalAssistant: agents.personalAssistant.getStatus(),
            engagement: agents.engagement.getStatus(),
            scheduling: agents.scheduling.getStatus(),
            research: agents.research.getStatus(),
            networkGrowth: agents.networkGrowth.getStatus()
        };
    }

    /**
     * Start all agents for a user
     */
    startAllAgents(userId: string): { success: boolean; message: string } {
        const agents = this.userAgents.get(userId);
        if (!agents) {
            return {
                success: false,
                message: 'Agents not initialized'
            };
        }

        agents.engagement.start();
        agents.scheduling.start();
        agents.research.start();
        agents.networkGrowth.start();

        console.log(`[Agent Manager] ✅ All agents started for user ${userId}`);

        return {
            success: true,
            message: 'All agents started successfully'
        };
    }

    /**
     * Stop all agents for a user
     */
    stopAllAgents(userId: string): { success: boolean; message: string } {
        const agents = this.userAgents.get(userId);
        if (!agents) {
            return {
                success: false,
                message: 'Agents not initialized'
            };
        }

        agents.engagement.stop();
        agents.scheduling.stop();
        agents.research.stop();
        agents.networkGrowth.stop();

        console.log(`[Agent Manager] ⏸️  All agents stopped for user ${userId}`);

        return {
            success: true,
            message: 'All agents stopped successfully'
        };
    }

    /**
     * Process scheduled tasks (called by cron/scheduler)
     */
    async processScheduledTasks(): Promise<void> {
        for (const [userId, agents] of this.userAgents.entries()) {
            try {
                // Process due posts
                const duePosts = await agents.scheduling.processDuePosts();

                if (duePosts.length > 0) {
                    console.log(`[Agent Manager] Processing ${duePosts.length} due posts for user ${userId}`);
                    // Here you would actually create the posts in the database
                }
            } catch (error) {
                console.error(`[Agent Manager] Task processing failed for user ${userId}:`, error);
            }
        }
    }

    /**
     * Get comprehensive agent analytics
     */
    async getAgentAnalytics(userId: string): Promise<any> {
        const agents = this.userAgents.get(userId);
        if (!agents) return null;

        return {
            engagement: agents.engagement.getMetrics(),
            scheduling: {
                scheduledCount: agents.scheduling.getScheduledPosts().length,
                strategy: agents.scheduling.getStatus().strategy
            },
            research: {
                curatedCount: agents.research.getCuratedContent().length,
                topics: agents.research.getStatus().topics
            },
            networkGrowth: agents.networkGrowth.getMetrics()
        };
    }
}

// Singleton instance
export const aiAgentManager = new AIAgentManager();

// Start background scheduler (every 60 seconds)
setInterval(() => {
    aiAgentManager.processScheduledTasks().catch(error => {
        console.error('[Agent Manager] Scheduled task processing failed:', error);
    });
}, 60000);
