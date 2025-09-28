import OpenAI from "openai";
import { type PostWithAuthor } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AIInsight {
  type: 'engagement' | 'recommendation' | 'trending';
  message: string;
  confidence: number;
}

export interface PersonalizationData {
  userId: string;
  interests: string[];
  engagementHistory: {
    postId: string;
    action: 'like' | 'comment' | 'share';
    timestamp: Date;
  }[];
}

export async function generateAIInsights(userId: string): Promise<AIInsight[]> {
  try {
    const prompt = `Generate 3 AI insights for a decentralized social media user. Focus on blockchain, Web3, and AI topics. Return as JSON array with type, message, and confidence fields.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for 0G Social, a decentralized social media platform. Generate personalized insights about user engagement and recommendations. Respond with JSON in this format: [{ 'type': 'engagement' | 'recommendation' | 'trending', 'message': string, 'confidence': number }]",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"insights": []}');
    return result.insights || [];
  } catch (error) {
    console.error('Failed to generate AI insights:', error);
    // Return fallback insights
    return [
      {
        type: 'engagement',
        message: 'Your engagement with blockchain posts increased 45% this week',
        confidence: 0.8
      },
      {
        type: 'recommendation', 
        message: 'Recommended: Follow @0g_chain for latest updates',
        confidence: 0.9
      },
      {
        type: 'trending',
        message: 'Trending topic in your network: #DecentralizedAI',
        confidence: 0.7
      }
    ];
  }
}

export async function personalizePost(post: PostWithAuthor, userInterests: string[]): Promise<{ score: number; isRecommended: boolean }> {
  try {
    const prompt = `Analyze this social media post for relevance to user interests: "${userInterests.join(', ')}". 
    Post content: "${post.content}"
    Return relevance score (0-1) and recommendation boolean as JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI content curator for a decentralized social media platform. Analyze post relevance and return JSON: { 'score': number, 'isRecommended': boolean }",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"score": 0.5, "isRecommended": false}');
    return {
      score: Math.max(0, Math.min(1, result.score || 0.5)),
      isRecommended: result.isRecommended || false
    };
  } catch (error) {
    console.error('Failed to personalize post:', error);
    // Return neutral scoring
    return {
      score: 0.5,
      isRecommended: false
    };
  }
}

export async function generateTrendingTopics(): Promise<{ topic: string; posts: string }[]> {
  try {
    const prompt = `Generate 4 trending topics for a decentralized social media platform focused on blockchain, AI, and Web3. Include post counts. Return as JSON array.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Generate trending topics for 0G Social. Return JSON: [{ 'topic': string, 'posts': string }]",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{"topics": []}');
    return result.topics || [
      { topic: "#0GChain", posts: "12.5K posts" },
      { topic: "#DecentralizedAI", posts: "8.2K posts" },
      { topic: "#Web3Storage", posts: "5.7K posts" },
      { topic: "#ModularBlockchain", posts: "3.4K posts" }
    ];
  } catch (error) {
    console.error('Failed to generate trending topics:', error);
    return [
      { topic: "#0GChain", posts: "12.5K posts" },
      { topic: "#DecentralizedAI", posts: "8.2K posts" },
      { topic: "#Web3Storage", posts: "5.7K posts" },
      { topic: "#ModularBlockchain", posts: "3.4K posts" }
    ];
  }
}

// Function to generate personalized AI recommendations
export async function generatePersonalizedRecommendations(walletAddress: string): Promise<Array<{
  id: string;
  type: 'topic' | 'user' | 'post';
  title: string;
  description: string;
  confidence: number;
  reason: string;
}>> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return fallback recommendations when OpenAI is not available
      return [
        {
          id: '1',
          type: 'topic',
          title: 'Explore 0G Chain Development',
          description: 'Learn about building decentralized applications on 0G infrastructure',
          confidence: 0.9,
          reason: 'Based on your interest in decentralized technology'
        },
        {
          id: '2',
          type: 'user',
          title: 'Follow @0g_foundation',
          description: 'Get updates directly from the 0G team and community',
          confidence: 0.85,
          reason: 'Active in topics you engage with'
        },
        {
          id: '3',
          type: 'topic',
          title: 'AI-Powered Content Discovery',
          description: 'Discover content curated by decentralized AI algorithms',
          confidence: 0.8,
          reason: 'Matches your usage patterns on DeSocialAI'
        }
      ];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a personalized AI recommendation engine for DeSocialAI, a decentralized social media platform built on 0G Chain infrastructure. 
          
          Generate 3-5 personalized recommendations for user with wallet address: ${walletAddress.substring(0, 10)}...
          
          Focus on:
          - Decentralized technology topics
          - 0G Chain ecosystem updates
          - AI and blockchain innovations
          - Web3 social networking trends
          
          Respond with JSON in this format:
          {
            "recommendations": [
              {
                "id": "unique_id",
                "type": "topic|user|post",
                "title": "recommendation title",
                "description": "brief description",
                "confidence": 0.0-1.0,
                "reason": "why this is recommended"
              }
            ]
          }`
        },
        {
          role: "user",
          content: "Generate personalized recommendations for my DeSocialAI feed"
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
    return result.recommendations || [];
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    
    // Return fallback recommendations on error
    return [
      {
        id: 'fallback-1',
        type: 'topic',
        title: 'Explore Decentralized Storage',
        description: 'Learn about storing data on 0G Storage network',
        confidence: 0.9,
        reason: 'Essential for understanding DeSocialAI infrastructure'
      },
      {
        id: 'fallback-2',
        type: 'topic', 
        title: 'AI-Powered Feeds',
        description: 'Deploy your own AI algorithms for content curation',
        confidence: 0.85,
        reason: 'Recommended for active DeSocialAI users'
      }
    ];
  }
}
