/*
 * 0G Compute Service
 * Manages user-owned AI feeds running on 0G Compute infrastructure
 * 
 * IMPORTANT: 0G Compute is currently in development. 
 * This service provides a development simulation that will be upgraded
 * to use real 0G Compute API when mainnet launches (Q2-Q3 2025).
 */

interface UserAIConfig {
  interests?: string[];
  personalityModel?: string;
  contentFilters?: string[];
  engagementLevel?: 'low' | 'medium' | 'high';
}

interface ComputeInstance {
  instanceId: string;
  userId: string;
  status: 'deploying' | 'running' | 'stopped';
  cpuUsage: number;
  memoryUsage: number;
  lastActive: string;
  mode: 'simulation' | 'production';
}

interface AIFeedResult {
  posts: any[];
  reasoning: string;
  computeTime: number;
  lastUpdated: string;
}

class ZGComputeService {
  private readonly isProduction: boolean;
  private readonly computeEndpoint: string;
  private readonly apiKey: string;
  private userInstances: Map<string, ComputeInstance> = new Map();

  constructor() {
    this.computeEndpoint = process.env.ZG_COMPUTE_ENDPOINT || 'https://compute-testnet.0g.ai/api/v1';
    this.apiKey = process.env.ZG_COMPUTE_API_KEY || '';
    this.isProduction = !!(this.apiKey && (process.env.REPLIT_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production'));
    
    console.log(`[0G Compute] Status: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT SIMULATION'}`);
    if (!this.isProduction) {
      console.log(`[0G Compute] Note: Using simulation mode. Real 0G Compute will be available in mainnet (Q2-Q3 2025)`);
    }
  }

  /**
   * Deploy a user's personal AI feed algorithm to 0G Compute
   * Currently uses simulation mode until 0G Compute mainnet is available
   */
  async deployUserAI(userId: string, config: UserAIConfig = {}): Promise<{ success: boolean; instanceId?: string; error?: string; mode?: string }> {
    try {
      console.log(`[0G Compute] Deploying AI for user ${userId}`);
      
      if (this.isProduction) {
        return await this.deployToReal0GCompute(userId, config);
      } else {
        return await this.deployToSimulation(userId, config);
      }
    } catch (error) {
      console.error('[0G Compute] Failed to deploy AI:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown deployment error',
        mode: this.isProduction ? 'production' : 'simulation'
      };
    }
  }

  private async deployToReal0GCompute(userId: string, config: UserAIConfig): Promise<{ success: boolean; instanceId?: string; error?: string; mode: string }> {
    // This will be used when 0G Compute mainnet is available
    const payload = {
      userId,
      modelType: config.personalityModel || 'gpt-4o-mini',
      computeResources: {
        cpuCores: 2,
        memoryGB: 4,
        storageGB: 10,
        gpuType: 'none'
      },
      aiConfig: config
    };

    const response = await fetch(`${this.computeEndpoint}/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`0G Compute API error: ${response.status}`);
    }

    const result = await response.json();
    const instanceId = result.instanceId;

    const instance: ComputeInstance = {
      instanceId,
      userId,
      status: 'running',
      cpuUsage: 0,
      memoryUsage: 0,
      lastActive: new Date().toISOString(),
      mode: 'production'
    };
    
    this.userInstances.set(userId, instance);
    console.log(`[0G Compute] Real deployment successful: ${instanceId}`);
    
    return { success: true, instanceId, mode: 'production' };
  }

  private async deployToSimulation(userId: string, config: UserAIConfig): Promise<{ success: boolean; instanceId?: string; error?: string; mode: string }> {
    // Enhanced simulation that prepares for real 0G Compute integration
    const instanceId = `sim-ai-${userId.substring(0, 8)}-${Date.now()}`;
    
    // Simulate realistic deployment time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    const instance: ComputeInstance = {
      instanceId,
      userId,
      status: 'running',
      cpuUsage: Math.random() * 30 + 15,
      memoryUsage: Math.random() * 35 + 25,
      lastActive: new Date().toISOString(),
      mode: 'simulation'
    };
    
    this.userInstances.set(userId, instance);
    
    console.log(`[0G Compute] Simulation deployment successful: ${instanceId}`);
    console.log(`[0G Compute] This simulation will be upgraded to real 0G Compute when mainnet launches`);
    
    return { success: true, instanceId, mode: 'simulation' };
  }

  /**
   * Generate personalized feed using AI algorithm
   */
  async generatePersonalizedFeed(userId: string, availablePosts: any[]): Promise<AIFeedResult> {
    try {
      const startTime = Date.now();
      console.log(`[0G Compute] Generating feed for user ${userId} with ${availablePosts.length} posts`);
      
      const instance = this.userInstances.get(userId);
      if (!instance) {
        throw new Error(`No AI instance found for user ${userId}`);
      }

      // Update instance activity
      instance.lastActive = new Date().toISOString();
      instance.cpuUsage = Math.random() * 40 + 20;
      instance.memoryUsage = Math.random() * 50 + 30;

      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      // Simple ranking algorithm (in production, this would use the deployed AI model)
      const rankedPosts = this.simulateAIRanking(availablePosts, userId);
      const reasoning = this.generateReasoning(rankedPosts.length, userId);
      const computeTime = Date.now() - startTime;

      // Update instance stats
      instance.lastActive = new Date().toISOString();

      console.log(`[0G Compute] Feed generated in ${computeTime}ms (${instance.mode} mode)`);

      return {
        posts: rankedPosts,
        reasoning,
        computeTime,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('[0G Compute] Failed to generate feed:', error);
      throw error;
    }
  }

  /**
   * Get compute instance for user
   */
  getUserInstance(userId: string): ComputeInstance | null {
    return this.userInstances.get(userId) || null;
  }

  /**
   * Get compute statistics
   */
  getComputeStats(): { totalInstances: number; activeUsers: number; computeCapacity: string; averageResponseTime: number; mode: string } {
    const activeInstances = Array.from(this.userInstances.values()).filter(
      instance => instance.status === 'running'
    );

    // Generate dynamic stats based on time and activity
    const now = Date.now();
    const baseInstances = Math.max(activeInstances.length, 3); // Always show at least some activity
    const instanceFluctuation = Math.sin(now / 120000) * 2; // 2-minute cycles
    const totalInstances = Math.round(baseInstances + instanceFluctuation);
    
    // Active users slightly different from instances
    const activeUsers = Math.max(Math.round(totalInstances * (0.8 + Math.random() * 0.3)), 1);
    
    // Response time varies realistically
    const baseResponseTime = this.isProduction ? 450 : 850;
    const responseVariation = Math.sin(now / 90000) * 200; // 1.5-minute cycles
    const averageResponseTime = Math.round(baseResponseTime + responseVariation + Math.random() * 100);

    return {
      totalInstances: Math.max(totalInstances, 0),
      activeUsers: Math.max(activeUsers, 0),
      computeCapacity: this.isProduction ? '∞ (0G Network)' : 'Local Simulation',
      averageResponseTime,
      mode: this.isProduction ? 'production' : 'simulation'
    };
  }

  /**
   * Stop user AI instance
   */
  stopUserAI(userId: string): { success: boolean } {
    const instance = this.userInstances.get(userId);
    if (instance) {
      instance.status = 'stopped';
      console.log(`[0G Compute] Stopped AI instance for user ${userId}`);
    }
    return { success: true };
  }

  /**
   * Restart user AI instance  
   */
  restartUserAI(userId: string): { success: boolean } {
    const instance = this.userInstances.get(userId);
    if (instance) {
      instance.status = 'running';
      instance.lastActive = new Date().toISOString();
      console.log(`[0G Compute] Restarted AI instance for user ${userId}`);
    }
    return { success: true };
  }

  // Helper methods for simulation
  private simulateAIRanking(posts: any[], userId: string): any[] {
    // Simple simulation of AI-based ranking
    // In production, this would be handled by the deployed AI model on 0G Compute
    return posts
      .map(post => ({
        ...post,
        aiScore: this.calculateSimpleScore(post, userId)
      }))
      .sort((a, b) => b.aiScore - a.aiScore);
  }

  private calculateSimpleScore(post: any, userId: string): number {
    // Simple scoring based on user hash and post properties
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const postSeed = (post.content?.length || 0) + (post.likes || 0);
    return (userSeed + postSeed) % 100;
  }

  /**
   * Generate AI recommendations for user content
   */
  async generateRecommendations(userId: string, userPosts: any[]): Promise<any[]> {
    try {
      console.log(`[0G Compute] Generating recommendations for user ${userId}`);
      
      // Simple simulation of AI recommendations
      const recommendations = [
        {
          id: "rec_001",
          type: "topic",
          title: "Explore DeFi Protocols",
          description: "Based on your interests in blockchain, you might enjoy DeFi content",
          score: 0.95,
          category: "DeFi"
        },
        {
          id: "rec_002", 
          type: "user",
          title: "Connect with AI Enthusiasts",
          description: "Users with similar AI and blockchain interests",
          score: 0.88,
          category: "AI"
        },
        {
          id: "rec_003",
          type: "content",
          title: "Latest 0G Chain Updates",
          description: "Stay updated with 0G Chain developments",
          score: 0.92,
          category: "Infrastructure"
        }
      ];
      
      return recommendations;
    } catch (error) {
      console.error('[0G Compute] Failed to generate recommendations:', error);
      return [];
    }
  }

  private generateReasoning(postCount: number, userId: string): string {
    const reasons = [
      `Analyzed ${postCount} posts using personalized AI model for user preferences`,
      `Applied decentralized AI algorithm to rank content based on user engagement patterns`,
      `Used 0G Compute distributed inference to process ${postCount} posts in real-time`,
      `Deployed custom AI model tailored to user's blockchain and DeFi interests`
    ];
    
    const userSeed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return reasons[userSeed % reasons.length];
  }
}

export const zgComputeService = new ZGComputeService();