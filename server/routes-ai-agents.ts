/**
 * AI Agents API Routes
 * Endpoints for 5 AI Agents using 0G Compute Network
 */

import type { Express } from "express";
import { aiAgentManager } from "./services/ai-agents/agent-manager";

export function registerAIAgentRoutes(app: Express) {
  console.log('[AI Agents] Registering AI Agent routes...');

  // Helper function to get wallet connection
  const getWalletConnection = (req: any) => {
    if (!req.session.walletConnection) {
      req.session.walletConnection = {
        connected: false,
        address: null
      };
    }
    return req.session.walletConnection;
  };

  // ============================================
  // AGENT MANAGEMENT
  // ============================================

  /**
   * Initialize all AI agents for user
   */
  app.post("/api/ai-agents/initialize", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { config } = req.body;

      const result = await aiAgentManager.initializeAgents({
        userId: walletConnection.address,
        ...config
      });

      res.json(result);
    } catch (error: any) {
      console.error('[AI Agents] Initialization failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get status of all agents
   */
  app.get("/api/ai-agents/status", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const status = aiAgentManager.getAgentStatus(walletConnection.address);

      if (!status) {
        return res.json({
          initialized: false,
          message: "Agents not initialized. Call /api/ai-agents/initialize first."
        });
      }

      res.json({
        initialized: true,
        status
      });
    } catch (error: any) {
      console.error('[AI Agents] Status check failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Start all agents
   */
  app.post("/api/ai-agents/start", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const result = aiAgentManager.startAllAgents(walletConnection.address);
      res.json(result);
    } catch (error: any) {
      console.error('[AI Agents] Start failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Stop all agents
   */
  app.post("/api/ai-agents/stop", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const result = aiAgentManager.stopAllAgents(walletConnection.address);
      res.json(result);
    } catch (error: any) {
      console.error('[AI Agents] Stop failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get agent analytics
   */
  app.get("/api/ai-agents/analytics", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const analytics = await aiAgentManager.getAgentAnalytics(walletConnection.address);

      if (!analytics) {
        return res.status(404).json({
          error: "Agents not initialized"
        });
      }

      res.json(analytics);
    } catch (error: any) {
      console.error('[AI Agents] Analytics failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // PERSONAL ASSISTANT AGENT
  // ============================================

  /**
   * Draft a post using Personal Assistant
   */
  app.post("/api/ai-agents/assistant/draft-post", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { topic, context } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.personalAssistant.draftPost(topic, context);
      res.json(result);
    } catch (error: any) {
      console.error('[Personal Assistant] Draft failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Generate reply to comment
   */
  app.post("/api/ai-agents/assistant/generate-reply", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { comment, postContext } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.personalAssistant.generateReply(comment, postContext);
      res.json(result);
    } catch (error: any) {
      console.error('[Personal Assistant] Reply generation failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Summarize feed
   */
  app.post("/api/ai-agents/assistant/summarize-feed", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { posts } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.personalAssistant.summarizeFeed(posts);
      res.json(result);
    } catch (error: any) {
      console.error('[Personal Assistant] Feed summarization failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Suggest content ideas
   */
  app.post("/api/ai-agents/assistant/suggest-content", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { userInterests } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.personalAssistant.suggestContent(userInterests);
      res.json(result);
    } catch (error: any) {
      console.error('[Personal Assistant] Content suggestion failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // ENGAGEMENT AGENT
  // ============================================

  /**
   * Generate reply to comment (Engagement Agent)
   */
  app.post("/api/ai-agents/engagement/reply", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { comment, postContext, commentAuthor } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.engagement.generateReply(comment, postContext, commentAuthor);
      res.json(result);
    } catch (error: any) {
      console.error('[Engagement Agent] Reply failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Analyze comment sentiment
   */
  app.post("/api/ai-agents/engagement/analyze-comment", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { comment } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.engagement.analyzeComment(comment);
      res.json(result);
    } catch (error: any) {
      console.error('[Engagement Agent] Analysis failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Handle direct message
   */
  app.post("/api/ai-agents/engagement/handle-message", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { message, senderName } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.engagement.handleMessage(message, senderName);
      res.json(result);
    } catch (error: any) {
      console.error('[Engagement Agent] Message handling failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get engagement metrics
   */
  app.get("/api/ai-agents/engagement/metrics", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const metrics = agents.engagement.getMetrics();
      res.json(metrics);
    } catch (error: any) {
      console.error('[Engagement Agent] Metrics failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================
  // CONTENT SCHEDULING AGENT
  // ============================================

  /**
   * Analyze optimal posting times
   */
  app.post("/api/ai-agents/scheduling/analyze-times", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { engagementHistory } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const times = await agents.scheduling.analyzeOptimalTimes(engagementHistory);
      res.json({ times });
    } catch (error: any) {
      console.error('[Scheduling Agent] Analysis failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Schedule a post
   */
  app.post("/api/ai-agents/scheduling/schedule-post", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const { content, preferredDate } = req.body;

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const result = await agents.scheduling.schedulePost(
        content,
        preferredDate ? new Date(preferredDate) : undefined
      );
      res.json(result);
    } catch (error: any) {
      console.error('[Scheduling Agent] Scheduling failed:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Get scheduled posts
   */
  app.get("/api/ai-agents/scheduling/posts", async (req, res) => {
    try {
      const walletConnection = getWalletConnection(req);

      if (!walletConnection.connected || !walletConnection.address) {
        return res.status(401).json({
          error: "Wallet connection required"
        });
      }

      const agents = aiAgentManager.getUserAgents(walletConnection.address);
      if (!agents) {
        return res.status(400).json({
          error: "Agents not initialized"
        });
      }

      const posts = agents.scheduling.getScheduledPosts();
      res.json({ posts });
    } catch (error: any) {
      console.error('[Scheduling Agent] Get posts failed:', e