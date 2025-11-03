import { Router } from 'express';
import { storage } from '../storage.js';
import { broadcastToAll } from '../utils/websocket.js';

const router = Router();

/**
 * GET /api/messages/conversations
 * Get all conversations for current user
 */
router.get('/conversations', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const conversations = await storage.getConversations(user.id);
        res.json(conversations);
    } catch (error: any) {
        console.error('[Conversations] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/messages/:conversationId
 * Get messages for a specific conversation
 */
router.get('/:conversationId', async (req, res) => {
    try {
        console.log('[Get Messages] Request for conversation:', req.params.conversationId);

        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            console.log('[Get Messages] Wallet not connected');
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            console.log('[Get Messages] User not found for wallet:', walletData.address);
            return res.status(404).json({ message: "User not found" });
        }

        console.log('[Get Messages] User found:', user.id, user.username);

        const conversationMessages = await storage.getMessages(req.params.conversationId, user.id);

        console.log('[Get Messages] Returning', conversationMessages.length, 'messages');
        res.json(conversationMessages);
    } catch (error: any) {
        console.error('[Get Messages] Error:', error);
        console.error('[Get Messages] Error stack:', error.stack);
        res.status(500).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * POST /api/messages/send
 * Send a message
 */
router.post('/send', async (req, res) => {
    try {
        console.log('[Send Message] Request received:', {
            body: req.body,
            hasSession: !!req.session,
            hasWallet: !!req.session?.walletConnection
        });

        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            console.log('[Send Message] Wallet not connected');
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            console.log('[Send Message] User not found for wallet:', walletData.address);
            return res.status(404).json({ message: "User not found" });
        }

        console.log('[Send Message] User found:', user.id, user.username);

        const { conversationId, content, encryptedContent, iv, tag, receiverId, encrypted } = req.body;

        console.log('[Send Message] Message data:', {
            conversationId,
            hasContent: !!content,
            hasEncryptedContent: !!encryptedContent,
            hasIv: !!iv,
            hasTag: !!tag,
            receiverId,
            encrypted,
            senderId: user.id
        });

        if (!conversationId || (!content && !encryptedContent)) {
            console.log('[Send Message] Missing required fields');
            return res.status(400).json({ message: "Conversation ID and content are required" });
        }

        if (!receiverId) {
            console.log('[Send Message] Missing receiverId');
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        // Prepare message data
        const messageData: any = {
            senderId: user.id,
            receiverId: receiverId,
            conversationId: conversationId === 'new' ? undefined : conversationId,
            content: content || encryptedContent,
            encrypted: encrypted || false
        };

        // Add encryption metadata if provided
        if (iv) messageData.iv = iv;
        if (tag) messageData.tag = tag;
        if (encryptedContent) messageData.encryptedContent = encryptedContent;

        console.log('[Send Message] Calling storage.sendMessage with:', {
            senderId: user.id,
            receiverId,
            conversationId: messageData.conversationId,
            hasContent: !!messageData.content,
            encrypted: messageData.encrypted
        });

        const message = await storage.sendMessage(
            user.id,
            receiverId,
            messageData.conversationId,
            messageData.content,
            messageData
        );

        console.log('[Send Message] Message sent successfully:', message.id);

        // Broadcast to WebSocket clients
        broadcastToAll({
            type: 'new_message',
            message: {
                ...message,
                sender: {
                    id: user.id,
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.avatar
                }
            }
        });

        res.json(message);
    } catch (error: any) {
        console.error('[Send Message] Error:', error);
        console.error('[Send Message] Error stack:', error.stack);
        res.status(500).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * GET /api/messages/unread-count
 * Get unread message count for current user
 */
router.get('/unread-count', async (req, res) => {
    try {
        console.log('[MESSAGES] GET /api/messages/unread-count called');
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            console.log('[MESSAGES] Wallet not connected');
            return res.status(401).json({ message: "Wallet connection required" });
        }

        console.log('[MESSAGES] Getting user for wallet:', walletData.address);
        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            console.log('[MESSAGES] User not found');
            return res.status(404).json({ message: "User not found" });
        }

        console.log('[MESSAGES] User found:', user.id);
        // TODO: Implement unread count
        const count = 0;
        console.log('[MESSAGES] Returning count:', count);
        res.json({ count });
    } catch (error: any) {
        console.error('[MESSAGES] Error:', error);
        console.error('[MESSAGES] Error stack:', error.stack);
        res.status(500).json({
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * POST /api/messages/start-conversation
 * Start a new conversation
 */
router.post('/start-conversation', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { participantId, recipientId } = req.body;
        const targetUserId = participantId || recipientId;

        if (!targetUserId) {
            return res.status(400).json({ message: "Participant ID or Recipient ID is required" });
        }

        if (targetUserId === user.id) {
            return res.status(400).json({ message: "Cannot start conversation with yourself" });
        }

        console.log('[Start Conversation] Creating conversation:', {
            userId: user.id,
            targetUserId,
            username: user.username
        });

        // Start new conversation
        const conversation = await storage.startConversation(user.id, targetUserId);

        console.log('[Start Conversation] Conversation created:', conversation);

        res.json({
            conversationId: conversation.id,
            conversation
        });
    } catch (error: any) {
        console.error('[Start Conversation] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/messages/:messageId/mark-read
 * Mark a message as read
 */
router.post('/:messageId/mark-read', async (req, res) => {
    try {
        const walletData = req.session.walletConnection;
        if (!walletData?.connected || !walletData?.address) {
            return res.status(401).json({ message: "Wallet connection required" });
        }

        const user = await storage.getUserByWalletAddress(walletData.address);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await storage.markMessagesAsRead(req.params.messageId, user.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error('[Mark Read] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
