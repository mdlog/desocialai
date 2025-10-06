import { e2eEncryptionService } from './e2e-encryption';
import { db } from '../db';
import { conversations, messages } from '@shared/schema';
import { eq, and, desc, asc, sql, or } from 'drizzle-orm';

export interface DirectMessage {
    id: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    encryptedContent: string;
    iv: string;
    tag: string;
    timestamp: Date;
    read: boolean;
    messageType: 'text' | 'image' | 'file';
    metadata?: any;
}

export interface Conversation {
    id: string;
    participants: string[];
    messageIds?: string[]; // Add this for tracking message IDs
    lastMessage?: {
        encryptedContent: string;
        iv: string;
        tag: string;
        senderId: string;
        timestamp: Date;
    };
    unreadCount: number;
    updatedAt: Date;
}

export class DMStorageService {
    private readonly storagePrefix = 'dm_';
    private readonly conversationPrefix = 'conv_';

    // In-memory storage for demo purposes
    // In production, this would use actual 0G Storage
    private messagesStore = new Map<string, DirectMessage>();
    private conversationsStore = new Map<string, Conversation>();

    /**
     * Store encrypted direct message
     */
    async storeMessage(message: Omit<DirectMessage, 'id'>): Promise<DirectMessage> {
        try {
            console.log(`[DM Storage] Storing message to database`);

            // Store in database
            const [storedMessage] = await db.insert(messages).values({
                conversationId: message.conversationId,
                senderId: message.senderId,
                receiverId: message.receiverId,
                encryptedContent: message.encryptedContent,
                iv: message.iv,
                tag: message.tag,
                messageType: message.messageType,
                read: message.read,
                storageHash: null // Will be set when stored in 0G Storage
            }).returning();

            console.log(`[DM Storage] Message ${storedMessage.id} stored successfully in database`);

            // Return in DirectMessage format
            const fullMessage: DirectMessage = {
                id: storedMessage.id,
                senderId: storedMessage.senderId,
                receiverId: storedMessage.receiverId,
                conversationId: storedMessage.conversationId,
                encryptedContent: storedMessage.encryptedContent,
                iv: storedMessage.iv,
                tag: storedMessage.tag,
                timestamp: storedMessage.createdAt,
                read: storedMessage.read,
                messageType: storedMessage.messageType as 'text' | 'image' | 'file'
            };

            return fullMessage;

        } catch (error) {
            console.error('[DM Storage] Error storing message:', error);
            throw new Error('Failed to store direct message');
        }
    }

    /**
     * Retrieve encrypted direct message
     */
    async getMessage(messageId: string): Promise<DirectMessage | null> {
        try {
            console.log(`[DM Storage] Retrieving message ${messageId} from database`);

            // Get from database
            const [message] = await db.select().from(messages).where(eq(messages.id, messageId));

            if (!message) {
                console.log(`[DM Storage] Message ${messageId} not found`);
                return null;
            }

            console.log(`[DM Storage] Message ${messageId} retrieved successfully from database`);

            // Convert to DirectMessage format
            const directMessage: DirectMessage = {
                id: message.id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                conversationId: message.conversationId,
                encryptedContent: message.encryptedContent,
                iv: message.iv,
                tag: message.tag,
                timestamp: message.createdAt,
                read: message.read,
                messageType: message.messageType as 'text' | 'image' | 'file'
            };

            return directMessage;

        } catch (error) {
            console.error('[DM Storage] Error retrieving message:', error);
            return null;
        }
    }

    /**
     * Get all messages for a conversation
     */
    async getConversationMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<DirectMessage[]> {
        try {
            console.log(`[DM Storage] Getting messages for conversation ${conversationId} from database`);

            // Debug: Check if conversationId format is correct
            console.log(`[DM Storage] Conversation ID format check:`, {
                conversationId,
                isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId),
                isConvFormat: conversationId.startsWith('conv_')
            });

            // Get messages from database with pagination
            const dbMessages = await db.select()
                .from(messages)
                .where(eq(messages.conversationId, conversationId))
                .orderBy(asc(messages.createdAt))
                .limit(limit)
                .offset(offset);

            console.log(`[DM Storage] Found ${dbMessages.length} messages for conversation ${conversationId}`);

            // Convert to DirectMessage format
            const directMessages: DirectMessage[] = dbMessages.map(message => ({
                id: message.id,
                senderId: message.senderId,
                receiverId: message.receiverId,
                conversationId: message.conversationId,
                encryptedContent: message.encryptedContent,
                iv: message.iv,
                tag: message.tag,
                timestamp: message.createdAt,
                read: message.read,
                messageType: message.messageType as 'text' | 'image' | 'file'
            }));

            return directMessages;

        } catch (error) {
            console.error('[DM Storage] Error getting conversation messages:', error);
            return [];
        }
    }

    /**
     * Store conversation metadata
     */
    async storeConversationMetadata(conversation: Conversation): Promise<void> {
        try {
            console.log(`[DM Storage] Storing conversation metadata ${conversation.id}`);

            // Store in memory storage (in production, this would use actual 0G Storage)
            this.conversationsStore.set(conversation.id, conversation);

            console.log(`[DM Storage] Conversation metadata ${conversation.id} stored successfully`);

        } catch (error) {
            console.error('[DM Storage] Error storing conversation metadata:', error);
            throw new Error('Failed to store conversation metadata');
        }
    }

    /**
     * Get conversation metadata
     */
    async getConversationMetadata(conversationId: string): Promise<Conversation | null> {
        try {
            console.log(`[DM Storage] Getting conversation metadata for ${conversationId}`);

            // Get from memory storage (in production, this would use actual 0G Storage)
            const conversation = this.conversationsStore.get(conversationId);

            if (!conversation) {
                console.log(`[DM Storage] Conversation ${conversationId} not found`);
                return null;
            }

            return conversation;

        } catch (error) {
            console.error('[DM Storage] Error getting conversation metadata:', error);
            return null;
        }
    }

    /**
     * Get user conversations
     */
    async getUserConversations(userId: string): Promise<Conversation[]> {
        try {
            // This is a simplified implementation
            // In a real system, you would need to implement proper indexing

            // For now, return empty array - this would need to be implemented
            // with proper indexing/search capabilities in 0G Storage
            console.log(`[DM Storage] Getting conversations for user ${userId}`);
            return [];

        } catch (error) {
            console.error('[DM Storage] Error getting user conversations:', error);
            return [];
        }
    }

    /**
     * Update conversation with new message
     */
    async updateConversationWithMessage(conversationId: string, messageId: string, senderId: string, encryptedContent: string, iv: string, tag: string): Promise<void> {
        try {
            // Get existing conversation metadata
            let conversation = await this.getConversationMetadata(conversationId);

            if (!conversation) {
                // Create new conversation
                conversation = {
                    id: conversationId,
                    participants: [], // This should be set based on sender/receiver
                    unreadCount: 0,
                    updatedAt: new Date()
                };
            }

            // Update conversation with new message info
            conversation.lastMessage = {
                encryptedContent,
                iv,
                tag,
                senderId,
                timestamp: new Date()
            };
            conversation.updatedAt = new Date();

            // Add message ID to conversation (simplified approach)
            if (!conversation.messageIds) {
                conversation.messageIds = [];
            }
            conversation.messageIds.push(messageId);

            // Store updated conversation metadata
            await this.storeConversationMetadata(conversation);

        } catch (error) {
            console.error('[DM Storage] Error updating conversation:', error);
            throw new Error('Failed to update conversation');
        }
    }

    /**
     * Get unread message count for a user
     */
    async getUnreadMessageCount(userId: string): Promise<number> {
        try {
            console.log(`[DM Storage] Getting unread count for user: ${userId} from database`);

            // Count unread messages from database
            const result = await db.select({ count: sql<number>`count(*)` })
                .from(messages)
                .where(and(
                    eq(messages.receiverId, userId),
                    eq(messages.read, false)
                ));

            const unreadCount = result[0]?.count || 0;

            console.log(`[DM Storage] Found ${unreadCount} unread messages for user ${userId}`);
            return unreadCount;
        } catch (error) {
            console.error('[DM Storage] Error getting unread count:', error);
            return 0;
        }
    }

    /**
     * Create or get conversation between two users
     */
    async createOrGetConversation(userId1: string, userId2: string): Promise<string> {
        try {
            console.log(`[DM Storage] Creating or getting conversation between ${userId1} and ${userId2}`);
            console.log(`[DM Storage] User IDs check: userId1=${userId1}, userId2=${userId2}, areEqual=${userId1 === userId2}`);

            // Check if conversation already exists
            const existingConversation = await db.select()
                .from(conversations)
                .where(or(
                    and(eq(conversations.participant1Id, userId1), eq(conversations.participant2Id, userId2)),
                    and(eq(conversations.participant1Id, userId2), eq(conversations.participant2Id, userId1))
                ));

            console.log(`[DM Storage] Existing conversation search result:`, existingConversation);

            if (existingConversation.length > 0) {
                console.log(`[DM Storage] Found existing conversation: ${existingConversation[0].id}`);
                return existingConversation[0].id;
            }

            // Create new conversation
            const [newConversation] = await db.insert(conversations).values({
                participant1Id: userId1,
                participant2Id: userId2,
                unreadCount1: 0,
                unreadCount2: 0
            }).returning();

            console.log(`[DM Storage] Created new conversation: ${newConversation.id}`);
            return newConversation.id;

        } catch (error) {
            console.error('[DM Storage] Error creating or getting conversation:', error);
            throw new Error('Failed to create or get conversation');
        }
    }

    /**
     * Mark messages as read for a conversation
     */
    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        try {
            console.log(`[DM Storage] Marking messages as read for conversation ${conversationId} by user ${userId} in database`);

            // Update messages in database
            const result = await db.update(messages)
                .set({ read: true })
                .where(and(
                    eq(messages.conversationId, conversationId),
                    eq(messages.receiverId, userId),
                    eq(messages.read, false)
                ))
                .returning({ id: messages.id });

            const markedCount = result.length;

            console.log(`[DM Storage] Marked ${markedCount} messages as read in database`);
        } catch (error) {
            console.error('[DM Storage] Error marking messages as read:', error);
            throw new Error('Failed to mark messages as read');
        }
    }
}

// Singleton instance
export const dmStorageService = new DMStorageService();
