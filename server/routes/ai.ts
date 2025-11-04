import { Router } from 'express';
import { storage } from '../storage.js';
import { generateAIInsights, generateTrendingTopics, generatePersonalizedRecommendations } from '../services/ai.js';
import { contentGenerationService } from '../services/content-generation.js';

const router = Router();

/**
 * POST /api/ai/content/generate-post
 * Generate AI post content using 0G Compute (primary) or OpenAI (fallback)
 */
router.post('/content/generate-post', async (req, res) => {
    try {
        // Accept both 'prompt' and 'content' for backward compatibility
        const { prompt, content, category, tone, platform } = req.body;
        const inputContent = prompt || content;

        if (!inputContent) {
            return res.status(400).json({ message: "Prompt or content is required" });
        }

        console.log('[AI Generate Post] Using 0G Compute Network (primary) with OpenAI fallback');
        console.log('[AI Generate Post] Input:', inputContent.substring(0, 50) + '...');

        // Use content generation service (0G Compute primary, OpenAI fallback)
        const result = await contentGenerationService.generatePost({
            type: 'post',
            content: inputContent,
            tone: tone || 'professional',
            platform: platform || 'general'
        });

        console.log('[AI Generate Post] Result source:', result.source);

        res.json({
            content: result.content,
            category: category || 'General',
            source: result.source, // '0G-Compute', 'OpenAI', or 'simulation'
            metadata: result.metadata
        });
    } catch (error: any) {
        console.error('[AI Generate Post] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/ai/content/hashtags
 * Generate hashtags for content using 0G Compute (primary) or OpenAI (fallback)
 */
router.post('/content/hashtags', async (req, res) => {
    try {
        const { content, platform } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        console.log('[AI Hashtags] Using 0G Compute Network (primary) with OpenAI fallback');

        // Use content generation service (0G Compute primary, OpenAI fallback)
        const result = await contentGenerationService.generateHashtags({
            type: 'hashtags',
            content,
            platform: platform || 'general'
        });

        // Parse hashtags from result
        const hashtags = result.metadata?.suggestions ||
            result.content.split(' ').filter(tag => tag.startsWith('#'));

        res.json({
            hashtags,
            source: result.source,
            metadata: result.metadata
        });
    } catch (error: any) {
        console.error('[AI Hashtags] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/ai/content/translate
 * Translate content to another language using 0G Compute (primary) or OpenAI (fallback)
 */
router.post('/content/translate', async (req, res) => {
    try {
        const { content, targetLanguage } = req.body;

        if (!content || !targetLanguage) {
            return res.status(400).json({ message: "Content and target language are required" });
        }

        console.log('[AI Translate] Using 0G Compute Network (primary) with OpenAI fallback');

        // Use content generation service (0G Compute primary, OpenAI fallback)
        const result = await contentGenerationService.translateContent({
            type: 'translate',
            content,
            targetLanguage
        });

        res.json({
            translatedContent: result.content,
            sourceLanguage: 'auto-detected',
            targetLanguage,
            source: result.source,
            metadata: result.metadata
        });
    } catch (error: any) {
        console.error('[AI Translate] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/ai/insights
 * Get AI insights for user
 */
router.get('/insights', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const insights = await generateAIInsights(user.id);
        res.json(insights);
    } catch (error: any) {
        console.error('[AI Insights] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/ai/trending
 * Get trending topics
 */
router.get('/trending', async (_req, res) => {
    try {
        const topics = await generateTrendingTopics();
        res.json(topics);
    } catch (error: any) {
        console.error('[AI Trending] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/ai/recommendations
 * Get personalized recommendations
 */
router.get('/recommendations', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const recommendations = await generatePersonalizedRecommendations(user.id);
        res.json(recommendations);
    } catch (error: any) {
        console.error('[AI Recommendations] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/ai/agents
 * Create an AI agent
 */
router.post('/agents', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const { name, description, personality } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Agent name is required" });
        }

        // TODO: Implement AI agent creation
        const agent = {
            id: Date.now().toString(),
            name,
            description: description || '',
            personality: personality || 'friendly',
            createdAt: new Date()
        };

        res.json(agent);
    } catch (error: any) {
        console.error('[AI Create Agent] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/ai/agents
 * Get all AI agents
 */
router.get('/agents', async (_req, res) => {
    try {
        // TODO: Implement AI agent listing
        const agents: any[] = [];
        res.json(agents);
    } catch (error: any) {
        console.error('[AI List Agents] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/ai/agents/:id/generate
 * Generate content using an AI agent
 */
router.post('/agents/:id/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        // TODO: Implement AI agent content generation
        const content = `AI Agent ${req.params.id} generated: ${prompt}`;

        res.json({ content });
    } catch (error: any) {
        console.error('[AI Agent Generate] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
