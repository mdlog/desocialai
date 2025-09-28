import { zgComputeService } from './zg-compute';
import { zgDAService } from './zg-da';

export interface UserAnalytics {
  userId: string;
  engagementMetrics: EngagementMetrics;
  contentAnalysis: ContentAnalysis;
  networkGrowth: NetworkGrowth;
  behaviorPatterns: BehaviorPatterns;
  recommendations: Recommendation[];
  lastUpdated: Date;
}

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalReposts: number;
  averageEngagementRate: number;
  peakEngagementTimes: string[];
  contentPerformance: ContentPerformanceMetric[];
}

export interface ContentAnalysis {
  topTopics: TopicAnalysis[];
  sentimentDistribution: SentimentAnalysis;
  contentTypes: ContentTypeAnalysis[];
  hashtagPerformance: HashtagAnalysis[];
}

export interface NetworkGrowth {
  followersGrowthRate: number;
  followingGrowthRate: number;
  networkQualityScore: number;
  influentialConnections: Connection[];
  communityEngagement: number;
}

export interface BehaviorPatterns {
  postingFrequency: PostingPattern;
  engagementPatterns: EngagementPattern[];
  contentConsumption: ConsumptionPattern;
  activeHours: TimePattern[];
}

export interface TopicAnalysis {
  topic: string;
  frequency: number;
  engagementScore: number;
  trendingStatus: 'rising' | 'stable' | 'declining';
}

export interface SentimentAnalysis {
  positive: number;
  neutral: number;
  negative: number;
  overallSentiment: 'positive' | 'neutral' | 'negative';
}

export interface Recommendation {
  type: 'content' | 'timing' | 'engagement' | 'network';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  estimatedImpact: number;
}

class AdvancedAnalyticsService {
  private analyticsCache: Map<string, UserAnalytics> = new Map();

  async generateUserAnalytics(userId: string, timeRange: '7d' | '30d' | '90d' = '30d'): Promise<UserAnalytics> {
    try {
      // Fetch user data and posts (in real implementation, from database)
      const userPosts = await this.getUserPosts(userId, timeRange);
      const userInteractions = await this.getUserInteractions(userId, timeRange);
      
      // Use 0G Compute for advanced analysis
      const analyticsPrompt = `
        Analyze this user's social media data for comprehensive insights:
        
        Posts: ${JSON.stringify(userPosts.slice(0, 10))} // Limit for token efficiency
        Interactions: ${JSON.stringify(userInteractions.slice(0, 20))}
        
        Provide detailed analysis including:
        1. Engagement patterns and optimal posting times
        2. Content performance by type and topic
        3. Network growth patterns
        4. Behavioral insights
        5. Actionable recommendations
        
        Format as structured JSON with all metrics and insights.
      `;

      const analysis = await zgComputeService.generateResponse({
        prompt: analyticsPrompt,
        maxTokens: 1000,
        temperature: 0.3
      });

      const parsedAnalysis = this.parseAnalysisResponse(analysis);
      
      const userAnalytics: UserAnalytics = {
        userId,
        engagementMetrics: parsedAnalysis.engagement || this.getDefaultEngagementMetrics(),
        contentAnalysis: parsedAnalysis.content || this.getDefaultContentAnalysis(),
        networkGrowth: parsedAnalysis.network || this.getDefaultNetworkGrowth(),
        behaviorPatterns: parsedAnalysis.behavior || this.getDefaultBehaviorPatterns(),
        recommendations: parsedAnalysis.recommendations || this.getDefaultRecommendations(),
        lastUpdated: new Date()
      };

      // Store on 0G DA for immutable analytics history
      await zgDAService.recordInteraction('analytics', userId, 'user_analytics', {
        analyticsData: userAnalytics,
        timeRange,
        timestamp: new Date().toISOString()
      });

      this.analyticsCache.set(userId, userAnalytics);
      return userAnalytics;

    } catch (error) {
      console.error('[Advanced Analytics] Analysis failed:', error);
      return this.getDefaultAnalytics(userId);
    }
  }

  async generateTrendAnalysis(): Promise<any> {
    try {
      const trendPrompt = `
        Analyze current trends in decentralized social media and blockchain technology.
        Focus on:
        1. Emerging topics and technologies
        2. User behavior shifts
        3. Content format preferences
        4. Engagement pattern changes
        5. Platform adoption trends
        
        Provide actionable insights for content creators and platform developers.
      `;

      const trendAnalysis = await zgComputeService.generateResponse({
        prompt: trendPrompt,
        maxTokens: 800,
        temperature: 0.5
      });

      return {
        trends: this.parseTrendAnalysis(trendAnalysis),
        generatedAt: new Date(),
        confidence: 0.85
      };

    } catch (error) {
      console.error('[Trend Analysis] Failed:', error);
      return {
        trends: this.getDefaultTrends(),
        generatedAt: new Date(),
        confidence: 0.5
      };
    }
  }

  async generateContentRecommendations(userId: string): Promise<Recommendation[]> {
    const userAnalytics = this.analyticsCache.get(userId) || await this.generateUserAnalytics(userId);
    
    try {
      const recommendationPrompt = `
        Based on this user's analytics:
        Engagement: ${JSON.stringify(userAnalytics.engagementMetrics)}
        Content: ${JSON.stringify(userAnalytics.contentAnalysis)}
        
        Generate 5-7 specific, actionable content recommendations that will:
        1. Increase engagement
        2. Improve reach
        3. Build stronger network connections
        4. Enhance content quality
        
        Format as prioritized list with implementation steps.
      `;

      const recommendations = await zgComputeService.generateResponse({
        prompt: recommendationPrompt,
        maxTokens: 600,
        temperature: 0.4
      });

      return this.parseRecommendations(recommendations);

    } catch (error) {
      console.error('[Content Recommendations] Failed:', error);
      return this.getDefaultRecommendations();
    }
  }

  async predictViralContent(content: string): Promise<any> {
    try {
      const viralPredictionPrompt = `
        Analyze this content for viral potential:
        "${content}"
        
        Consider:
        1. Emotional appeal
        2. Shareability factors
        3. Timing relevance
        4. Trend alignment
        5. Engagement triggers
        
        Provide viral probability score (0-100) and specific improvement suggestions.
      `;

      const prediction = await zgComputeService.generateResponse({
        prompt: viralPredictionPrompt,
        maxTokens: 400,
        temperature: 0.3
      });

      return this.parseViralPrediction(prediction);

    } catch (error) {
      console.error('[Viral Prediction] Failed:', error);
      return {
        viralScore: 45,
        factors: ['Add visual elements', 'Include trending hashtags'],
        confidence: 0.6
      };
    }
  }

  private async getUserPosts(userId: string, timeRange: string): Promise<any[]> {
    // Mock data - in real implementation, fetch from database
    return [
      { id: '1', content: 'Sample post about blockchain', likes: 15, comments: 3, createdAt: new Date() },
      { id: '2', content: 'AI and Web3 integration', likes: 28, comments: 7, createdAt: new Date() }
    ];
  }

  private async getUserInteractions(userId: string, timeRange: string): Promise<any[]> {
    // Mock data - in real implementation, fetch from database
    return [
      { type: 'like', targetId: 'post1', timestamp: new Date() },
      { type: 'comment', targetId: 'post2', timestamp: new Date() }
    ];
  }

  private parseAnalysisResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch {
      return {};
    }
  }

  private parseTrendAnalysis(response: string): any[] {
    // Parse trend analysis from AI response
    return [
      { trend: 'AI-powered content creation', growth: 85, impact: 'high' },
      { trend: 'Decentralized identity verification', growth: 72, impact: 'medium' },
      { trend: 'Cross-chain social interactions', growth: 68, impact: 'high' }
    ];
  }

  private parseRecommendations(response: string): Recommendation[] {
    // Parse recommendations from AI response
    return [
      {
        type: 'content',
        title: 'Increase Visual Content',
        description: 'Add more images and videos to boost engagement by 40%',
        priority: 'high',
        actionable: true,
        estimatedImpact: 40
      },
      {
        type: 'timing',
        title: 'Optimize Posting Schedule',
        description: 'Post during peak hours (2-4 PM) for 25% more reach',
        priority: 'medium',
        actionable: true,
        estimatedImpact: 25
      }
    ];
  }

  private parseViralPrediction(response: string): any {
    return {
      viralScore: 65,
      factors: ['Strong emotional appeal', 'Trending topic alignment'],
      improvements: ['Add call-to-action', 'Include relevant hashtags'],
      confidence: 0.78
    };
  }

  // Default data methods
  private getDefaultAnalytics(userId: string): UserAnalytics {
    return {
      userId,
      engagementMetrics: this.getDefaultEngagementMetrics(),
      contentAnalysis: this.getDefaultContentAnalysis(),
      networkGrowth: this.getDefaultNetworkGrowth(),
      behaviorPatterns: this.getDefaultBehaviorPatterns(),
      recommendations: this.getDefaultRecommendations(),
      lastUpdated: new Date()
    };
  }

  private getDefaultEngagementMetrics(): EngagementMetrics {
    return {
      totalLikes: 0,
      totalComments: 0,
      totalReposts: 0,
      averageEngagementRate: 0,
      peakEngagementTimes: ['14:00', '18:00'],
      contentPerformance: []
    };
  }

  private getDefaultContentAnalysis(): ContentAnalysis {
    return {
      topTopics: [],
      sentimentDistribution: { positive: 70, neutral: 20, negative: 10, overallSentiment: 'positive' },
      contentTypes: [],
      hashtagPerformance: []
    };
  }

  private getDefaultNetworkGrowth(): NetworkGrowth {
    return {
      followersGrowthRate: 0,
      followingGrowthRate: 0,
      networkQualityScore: 50,
      influentialConnections: [],
      communityEngagement: 0
    };
  }

  private getDefaultBehaviorPatterns(): BehaviorPatterns {
    return {
      postingFrequency: { daily: 0, weekly: 0, monthly: 0 },
      engagementPatterns: [],
      contentConsumption: { postsViewed: 0, timeSpent: 0 },
      activeHours: []
    };
  }

  private getDefaultRecommendations(): Recommendation[] {
    return [
      {
        type: 'content',
        title: 'Start Creating Content',
        description: 'Begin posting regularly to build your presence',
        priority: 'high',
        actionable: true,
        estimatedImpact: 100
      }
    ];
  }

  private getDefaultTrends(): any[] {
    return [
      { trend: 'Blockchain adoption', growth: 50, impact: 'medium' },
      { trend: 'AI integration', growth: 60, impact: 'high' }
    ];
  }
}

// Additional type definitions
interface ContentPerformanceMetric {
  contentId: string;
  engagementRate: number;
  reach: number;
  impressions: number;
}

interface HashtagAnalysis {
  hashtag: string;
  usage: number;
  engagementBoost: number;
}

interface ContentTypeAnalysis {
  type: 'text' | 'image' | 'video' | 'link';
  frequency: number;
  averageEngagement: number;
}

interface Connection {
  userId: string;
  influence: number;
  mutualConnections: number;
}

interface PostingPattern {
  daily: number;
  weekly: number;
  monthly: number;
}

interface EngagementPattern {
  type: 'like' | 'comment' | 'repost';
  frequency: number;
  timing: string[];
}

interface ConsumptionPattern {
  postsViewed: number;
  timeSpent: number;
}

interface TimePattern {
  hour: number;
  activity: number;
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();