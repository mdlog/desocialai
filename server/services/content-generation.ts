import OpenAI from "openai";
import { zgComputeService } from './zg-compute-real';

// Initialize OpenAI client for content generation
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ContentGenerationRequest {
  type: 'post' | 'hashtags' | 'translate' | 'describe';
  content?: string;
  imageUrl?: string;
  targetLanguage?: string;
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'educational';
  platform?: 'general' | 'web3' | 'tech' | 'business';
  userId?: string;
}

export interface GeneratedContent {
  success: boolean;
  content: string;
  metadata?: {
    confidence?: number;
    tone?: string;
    language?: string;
    suggestions?: string[];
  };
  source: '0G-Compute' | 'OpenAI' | 'simulation';
}

class ContentGenerationService {
  /**
   * ✍️ AI-assisted post writing
   * Generate engaging social media posts based on topic or prompt
   */
  async generatePost(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { content, tone = 'professional', platform = 'general', userId } = request;
    
    // Try OpenAI first (more reliable)
    try {
      console.log('[Content Gen] Attempting OpenAI generation...');
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional social media content creator for ${platform} platforms. Create engaging, authentic posts in ${tone} tone. Focus on value, engagement, and community building.`
          },
          {
            role: "user",
            content: this.buildPostPrompt(content || '', tone, platform)
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const generatedContent = completion.choices[0].message.content || '';
      
      return {
        success: true,
        content: generatedContent,
        metadata: {
          confidence: 0.85,
          tone,
          suggestions: this.extractSuggestions(generatedContent)
        },
        source: 'OpenAI'
      };
    } catch (error) {
      console.log('[Content Gen] OpenAI failed, trying 0G Compute...', error);
    }

    // Fallback to 0G Compute
    try {
      const response = await this.tryZGCompute({
        prompt: this.buildPostPrompt(content || '', tone, platform),
        maxTokens: 300,
        temperature: 0.7
      });
      
      if (response.success) {
        return {
          success: true,
          content: response.content,
          metadata: {
            confidence: 0.9,
            tone,
            suggestions: this.extractSuggestions(response.content)
          },
          source: '0G-Compute'
        };
      }
    } catch (error) {
      console.log('[Content Gen] 0G Compute unavailable, using fallback');
    }

    // Final fallback to simulation
    console.log('[Content Gen] Using fallback simulation');
    return this.fallbackPostGeneration(content || '', tone, platform);
  }

  /**
   * #️⃣ Automated hashtag suggestions
   * Generate relevant hashtags for content
   */
  async generateHashtags(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { content = '', platform = 'general' } = request;
    
    try {
      // Try 0G Compute Network first
      const response = await this.tryZGCompute({
        prompt: this.buildHashtagPrompt(content, platform),
        maxTokens: 150,
        temperature: 0.5
      });
      
      if (response.success) {
        const hashtags = this.parseHashtags(response.content);
        return {
          success: true,
          content: hashtags.join(' '),
          metadata: {
            confidence: 0.9,
            suggestions: hashtags
          },
          source: '0G-Compute'
        };
      }
    } catch (error) {
      console.log('[Content Gen] 0G Compute unavailable for hashtags, using OpenAI');
    }

    // Fallback to OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate relevant hashtags for social media content. Focus on ${platform} audience. Return 8-12 hashtags that are trending, specific, and engaging.`
          },
          {
            role: "user",
            content: this.buildHashtagPrompt(content, platform)
          }
        ],
        max_tokens: 150,
        temperature: 0.5
      });

      const hashtagContent = completion.choices[0].message.content || '';
      const hashtags = this.parseHashtags(hashtagContent);
      
      return {
        success: true,
        content: hashtags.join(' '),
        metadata: {
          confidence: 0.85,
          suggestions: hashtags
        },
        source: 'OpenAI'
      };
    } catch (error) {
      console.error('[Content Gen] Hashtag generation failed:', error);
      return this.fallbackHashtagGeneration(content, platform);
    }
  }

  /**
   * 🌍 Content translation services
   * Translate content to different languages
   */
  async translateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { content = '', targetLanguage = 'English' } = request;
    
    try {
      // Try 0G Compute Network first
      const response = await this.tryZGCompute({
        prompt: this.buildTranslationPrompt(content, targetLanguage),
        maxTokens: Math.max(content.length * 2, 200),
        temperature: 0.3
      });
      
      if (response.success) {
        return {
          success: true,
          content: response.content,
          metadata: {
            confidence: 0.9,
            language: targetLanguage
          },
          source: '0G-Compute'
        };
      }
    } catch (error) {
      console.log('[Content Gen] 0G Compute unavailable for translation, using OpenAI');
    }

    // Fallback to OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a professional translator. Translate content accurately while maintaining the original tone, meaning, and cultural context. Target language: ${targetLanguage}`
          },
          {
            role: "user",
            content: this.buildTranslationPrompt(content, targetLanguage)
          }
        ],
        max_tokens: Math.max(content.length * 2, 200),
        temperature: 0.3
      });

      const translatedContent = completion.choices[0].message.content || '';
      
      return {
        success: true,
        content: translatedContent,
        metadata: {
          confidence: 0.85,
          language: targetLanguage
        },
        source: 'OpenAI'
      };
    } catch (error) {
      console.error('[Content Gen] Translation failed:', error);
      return this.fallbackTranslation(content, targetLanguage);
    }
  }

  /**
   * 🖼️ Image description and accessibility
   * Generate descriptions for images to improve accessibility
   */
  async describeImage(request: ContentGenerationRequest): Promise<GeneratedContent> {
    const { imageUrl = '', content = '' } = request;
    
    // For now, use OpenAI Vision API as 0G Compute doesn't have vision capabilities yet
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an accessibility expert. Create detailed, helpful descriptions for images that help visually impaired users understand the content. Include important visual elements, colors, text, emotions, and context."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please describe this image for accessibility purposes. Context: ${content}`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.4
      });

      const description = completion.choices[0].message.content || '';
      
      return {
        success: true,
        content: description,
        metadata: {
          confidence: 0.9,
          suggestions: ['Include alt text', 'Consider color contrast', 'Add captions if text present']
        },
        source: 'OpenAI'
      };
    } catch (error) {
      console.error('[Content Gen] Image description failed:', error);
      return this.fallbackImageDescription(imageUrl, content);
    }
  }

  // Helper methods for building prompts
  private buildPostPrompt(topic: string, tone: string, platform: string): string {
    const platformContext = {
      'web3': 'blockchain, DeFi, NFTs, decentralized technology',
      'tech': 'technology, innovation, programming, software',
      'business': 'entrepreneurship, leadership, growth, strategy',
      'general': 'lifestyle, community, personal development'
    };

    return `Create an engaging social media post about: "${topic}"

Requirements:
- Tone: ${tone}
- Platform context: ${platformContext[platform as keyof typeof platformContext] || 'general audience'}
- Length: 150-280 characters ideal
- Include call-to-action or engagement hook
- Make it authentic and valuable
- No excessive emojis

Topic/Content: ${topic || 'Create an inspiring post about innovation and community'}`;
  }

  private buildHashtagPrompt(content: string, platform: string): string {
    return `Generate relevant hashtags for this social media content:

Content: "${content}"
Platform: ${platform}

Requirements:
- Generate 8-12 hashtags
- Mix of popular and niche hashtags
- Include platform-specific trending tags
- Avoid overly generic hashtags
- Format: #hashtag separated by spaces
- Focus on discoverability and engagement

Content to analyze: ${content}`;
  }

  private buildTranslationPrompt(content: string, targetLanguage: string): string {
    return `Translate the following content to ${targetLanguage}:

"${content}"

Requirements:
- Maintain original tone and meaning
- Preserve formatting if any
- Use natural, native-sounding language
- Keep cultural context appropriate
- Maintain any technical terms accurately`;
  }

  // Helper methods for 0G Compute integration
  private async tryZGCompute(params: { prompt: string; maxTokens: number; temperature: number }): Promise<{ success: boolean; content: string }> {
    try {
      // Use the new generateContent method from 0G Compute service
      const response = await zgComputeService.generateContent(params.prompt, {
        maxTokens: params.maxTokens,
        temperature: params.temperature
      });
      
      return {
        success: response.success,
        content: response.content
      };
    } catch (error) {
      console.error('[Content Gen] 0G Compute error:', error);
      return {
        success: false,
        content: ''
      };
    }
  }

  // Utility methods
  private extractSuggestions(content: string): string[] {
    // Extract potential improvements or variations
    return [
      'Consider adding emojis for engagement',
      'Try different time of posting',
      'Add relevant hashtags',
      'Include call-to-action'
    ];
  }

  private parseHashtags(content: string): string[] {
    // Extract hashtags from generated content
    const hashtagRegex = /#[\w\d_]+/g;
    const matches = content.match(hashtagRegex) || [];
    
    // If no hashtags found, generate from content
    if (matches.length === 0) {
      const words = content.toLowerCase().split(/\s+/).filter(word => 
        word.length > 3 && !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
      );
      return words.slice(0, 8).map(word => `#${word}`);
    }
    
    return matches.slice(0, 12);
  }

  // Fallback methods
  private fallbackPostGeneration(topic: string, tone: string, platform: string): GeneratedContent {
    const posts = {
      professional: [
        `Exploring new opportunities in ${platform}. What innovations are you most excited about? 🚀`,
        `Building the future requires both vision and action. What's your next big move? 💭`,
        `Innovation happens when we collaborate. Join the conversation about ${topic}. 🌟`
      ],
      casual: [
        `Just thinking about ${topic}... anyone else fascinated by this? 🤔`,
        `Quick thought: ${platform} is changing everything. What do you think? ✨`,
        `Can we talk about how amazing ${topic} is? Drop your thoughts below! 👇`
      ],
      enthusiastic: [
        `SO excited about ${topic}! This is just the beginning! 🎉🚀`,
        `The future of ${platform} is HERE and it's incredible! Who's ready? 🔥`,
        `Mind-blown by recent developments in ${topic}! What's got you excited? ⚡`
      ],
      educational: [
        `Let's break down ${topic}: Here are 3 key things to know... 🧵`,
        `Understanding ${platform}: Why it matters and what it means for us. 📚`,
        `Quick lesson on ${topic}: The fundamentals everyone should know. 💡`
      ]
    };

    const selectedPosts = posts[tone as keyof typeof posts] || posts.professional;
    const randomPost = selectedPosts[Math.floor(Math.random() * selectedPosts.length)];

    return {
      success: true,
      content: randomPost,
      metadata: {
        confidence: 0.7,
        tone,
        suggestions: ['Generated in offline mode', 'Try again when AI service is available']
      },
      source: 'simulation'
    };
  }

  private fallbackHashtagGeneration(content: string, platform: string): GeneratedContent {
    const platformHashtags = {
      web3: ['#Web3', '#Blockchain', '#DeFi', '#NFT', '#Crypto', '#Decentralized', '#Innovation', '#Future'],
      tech: ['#Tech', '#Innovation', '#AI', '#Development', '#Programming', '#Software', '#TechTrends', '#Digital'],
      business: ['#Business', '#Entrepreneurship', '#Leadership', '#Growth', '#Strategy', '#Success', '#Networking', '#Innovation'],
      general: ['#Community', '#Growth', '#Innovation', '#Inspiration', '#Learning', '#Success', '#Networking', '#Future']
    };

    const hashtags = platformHashtags[platform as keyof typeof platformHashtags] || platformHashtags.general;
    
    return {
      success: true,
      content: hashtags.slice(0, 8).join(' '),
      metadata: {
        confidence: 0.6,
        suggestions: hashtags
      },
      source: 'simulation'
    };
  }

  private fallbackTranslation(content: string, targetLanguage: string): GeneratedContent {
    return {
      success: false,
      content: `Translation to ${targetLanguage} temporarily unavailable. Original content: ${content}`,
      metadata: {
        confidence: 0,
        language: targetLanguage
      },
      source: 'simulation'
    };
  }

  private fallbackImageDescription(imageUrl: string, content: string): GeneratedContent {
    return {
      success: true,
      content: `Image description: Visual content related to "${content}". For full accessibility, please provide manual description when AI service is unavailable.`,
      metadata: {
        confidence: 0.3,
        suggestions: ['Manual description recommended', 'AI vision service temporarily unavailable']
      },
      source: 'simulation'
    };
  }
}

export const contentGenerationService = new ContentGenerationService();