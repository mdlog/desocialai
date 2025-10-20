import { zgComputeService } from './zg-compute';

export interface AIAgent {
  id: string;
  userId: string;
  agentType: 'content_assistant' | 'engagement_manager' | 'trend_analyzer' | 'network_growth' | 'content_scheduler';
  name: string;
  description: string;
  isActive: boolean;
  configuration: AgentConfiguration;
  performance: AgentPerformance;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface AgentConfiguration {
  personality: 'professional' | 'casual' | 'creative' | 'analytical';
  responseStyle: 'concise' | 'detailed' | 'friendly' | 'formal';
  topics: string[];
  autoPost: boolean;
  engagementThreshold: number;
  scheduleSettings: ScheduleSettings;
}

export interface ScheduleSettings {
  enabled: boolean;
  timeZone: string;
  optimalTimes: string[];
  frequency: 'hourly' | 'daily' | 'weekly';
}

export interface AgentPerformance {
  postsCreated: number;
  engagementGenerated: number;
  trendsIdentified: number;
  networkGrowth: number;
  successRate: number;
}

class AIAgentService {
  private agents: Map<string, AIAgent> = new Map();
  private scheduledQueue: Array<{ agentId: string; content: string; runAt: number }> = [];
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start lightweight background scheduler (checks every 30s)
    this.schedulerInterval = setInterval(() => {
      this.processDueSchedules().catch((err) => {
        console.error('[AI Agent] Scheduler tick failed:', err);
      });
    }, 30_000);
  }

  async createAgent(userId: string, config: Partial<AgentConfiguration>): Promise<AIAgent> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const agent: AIAgent = {
      id: agentId,
      userId,
      agentType: 'content_assistant',
      name: `AI Assistant ${agentId.slice(-4)}`,
      description: 'Your personal AI assistant for social media management',
      isActive: false,
      configuration: {
        personality: 'professional',
        responseStyle: 'concise',
        topics: ['technology', 'blockchain', 'AI'],
        autoPost: false,
        engagementThreshold: 10,
        scheduleSettings: {
          enabled: false,
          timeZone: 'UTC',
          optimalTimes: ['09:00', '14:00', '18:00'],
          frequency: 'daily'
        },
        ...config
      },
      performance: {
        postsCreated: 0,
        engagementGenerated: 0,
        trendsIdentified: 0,
        networkGrowth: 0,
        successRate: 0
      },
      createdAt: new Date(),
      lastActiveAt: new Date()
    };

    this.agents.set(agentId, agent);
    return agent;
  }

  async generateContent(agentId: string, prompt: string, context?: any): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    try {
      // PRIORITIZE 0G Compute Network for AI generation
      console.log('[AI Agent] Attempting 0G Compute generation (PRIORITY)...');
      const response = await zgComputeService.generateResponse({
        prompt: this.buildPrompt(agent, prompt, context),
        maxTokens: 500,
        temperature: 0.7
      });

      // Update agent performance
      agent.performance.postsCreated++;
      agent.lastActiveAt = new Date();

      console.log('[AI Agent] ✅ 0G Compute generation successful');
      return response;
    } catch (error) {
      console.error('[AI Agent] 0G Compute generation failed:', error);
      throw new Error('Failed to generate content with AI agent - 0G Compute unavailable');
    }
  }

  async analyzeEngagement(agentId: string, postData: any): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    try {
      const analysisPrompt = `
        Analyze this social media post engagement:
        Post: ${postData.content}
        Likes: ${postData.likesCount}
        Comments: ${postData.commentsCount}
        Reposts: ${postData.repostsCount}
        
        Provide insights on:
        1. Performance metrics
        2. Optimal posting time
        3. Content improvement suggestions
        4. Trending topics identified
        
        Format response as JSON.
      `;

      const analysis = await zgComputeService.generateResponse({
        prompt: analysisPrompt,
        maxTokens: 300,
        temperature: 0.3
      });

      agent.performance.trendsIdentified++;
      return JSON.parse(analysis);
    } catch (error) {
      console.error('[AI Agent] Engagement analysis failed:', error);
      return {
        performance: 'moderate',
        suggestions: ['Increase visual content', 'Post at peak hours'],
        trends: []
      };
    }
  }

  async scheduleContent(agentId: string, content: string, scheduledTime: Date): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent || !agent.configuration.scheduleSettings.enabled) {
      throw new Error('Agent not found or scheduling not enabled');
    }

    // Store scheduled content (in real implementation, use database)
    this.scheduledQueue.push({ agentId, content, runAt: scheduledTime.getTime() });
    // Keep queue ordered by time to minimize scans
    this.scheduledQueue.sort((a, b) => a.runAt - b.runAt);
    console.log(`[AI Agent] Content scheduled for ${scheduledTime.toISOString()}: ${content.slice(0, 50)}...`);
  }

  async optimizePostingTime(agentId: string, userEngagementData: any): Promise<string[]> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    try {
      const optimizationPrompt = `
        Based on this user engagement data:
        ${JSON.stringify(userEngagementData)}
        
        Recommend optimal posting times for maximum engagement.
        Consider time zones, audience activity patterns, and content type.
        Return 3-5 optimal times in HH:MM format.
      `;

      const recommendations = await zgComputeService.generateResponse({
        prompt: optimizationPrompt,
        maxTokens: 200,
        temperature: 0.4
      });

      const times = recommendations.match(/\d{2}:\d{2}/g) || ['09:00', '14:00', '18:00'];
      agent.configuration.scheduleSettings.optimalTimes = times;

      return times;
    } catch (error) {
      console.error('[AI Agent] Time optimization failed:', error);
      return ['09:00', '14:00', '18:00']; // Default fallback
    }
  }

  private buildPrompt(agent: AIAgent, userPrompt: string, context?: any): string {
    const { personality, responseStyle, topics } = agent.configuration;

    return `
      You are an AI assistant with these characteristics:
      - Personality: ${personality}
      - Response style: ${responseStyle}
      - Expertise in: ${topics.join(', ')}
      
      Context: ${context ? JSON.stringify(context) : 'General social media content'}
      
      User request: ${userPrompt}
      
      Generate appropriate content that matches the personality and style.
      Keep it engaging and relevant to the user's interests.
    `;
  }

  async getAgentsByUser(userId: string): Promise<AIAgent[]> {
    return Array.from(this.agents.values()).filter(agent => agent.userId === userId);
  }

  async updateAgent(agentId: string, updates: Partial<AIAgent>): Promise<AIAgent> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    Object.assign(agent, updates);
    return agent;
  }

  async deleteAgent(agentId: string): Promise<void> {
    this.agents.delete(agentId);
  }

  async getAgentPerformance(agentId: string): Promise<AgentPerformance> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Calculate success rate based on performance metrics
    const totalActions = agent.performance.postsCreated + agent.performance.engagementGenerated;
    agent.performance.successRate = totalActions > 0 ?
      (agent.performance.engagementGenerated / totalActions) * 100 : 0;

    return agent.performance;
  }

  private async processDueSchedules(): Promise<void> {
    if (this.scheduledQueue.length === 0) return;
    const now = Date.now();
    const due: typeof this.scheduledQueue = [];
    // Extract all due items (stable since queue is time-ordered)
    while (this.scheduledQueue.length && this.scheduledQueue[0].runAt <= now) {
      due.push(this.scheduledQueue.shift()!);
    }
    for (const item of due) {
      try {
        const agent = this.agents.get(item.agentId);
        if (!agent) continue;
        if (!agent.configuration.autoPost) {
          console.log(`[AI Agent] Due content for ${item.agentId} is ready (autoPost disabled)`);
          continue;
        }
        // Here we would persist post and broadcast; for now just log and update stats
        console.log(`[AI Agent] Auto-posting scheduled content for ${item.agentId}: ${item.content.slice(0, 80)}...`);
        agent.performance.postsCreated++;
        agent.lastActiveAt = new Date();
      } catch (e) {
        console.error('[AI Agent] Failed to process scheduled item:', e);
      }
    }
  }
}

export const aiAgentService = new AIAgentService();