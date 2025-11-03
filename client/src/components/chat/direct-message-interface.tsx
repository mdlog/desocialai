import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle, Users, Search, MoreVertical, Phone, Video, Shield, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { simpleE2EEncryption } from '@/lib/e2e-encryption';

interface DirectMessage {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
    read: boolean;
    sender?: {
        id: string;
        displayName: string;
        username: string;
        avatar?: string;
    };
}

interface Conversation {
    id: string;
    participant: {
        id: string;
        displayName: string;
        username: string;
        avatar?: string;
        isOnline?: boolean;
    };
    lastMessage?: {
        content: string;
        timestamp: Date;
        senderId: string;
    };
    unreadCount: number;
    updatedAt: Date;
}

interface DirectMessageInterfaceProps {
    initialConversationId?: string;
    targetUserId?: string;
}

export function DirectMessageInterface({ initialConversationId, targetUserId }: DirectMessageInterfaceProps = {}) {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(initialConversationId || null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Handle initial conversation selection
    useEffect(() => {
        if (initialConversationId && !selectedConversation) {
            setSelectedConversation(initialConversationId);
        }
    }, [initialConversationId, selectedConversation]);

    // Handle target user - create conversation if needed
    useEffect(() => {
        if (targetUserId && currentUser?.id && !selectedConversation) {
            const handleTargetUser = async () => {
                const conversationId = await createConversation(targetUserId);
                setSelectedConversation(conversationId);
                // Refresh conversations list
                queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
            };
            handleTargetUser();
        }
    }, [targetUserId, currentUser?.id, selectedConversation, queryClient]);

    // Create conversation if needed
    const createConversation = async (targetUserId: string) => {
        try {
            const response = await fetch('/api/messages/start-conversation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientId: targetUserId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create conversation');
            }

            const result = await response.json();
            console.log('[DM] Create conversation response:', result);
            return result.conversationId;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error; // Don't fallback to generated ID
        }
    };

    // Fetch conversations list
    console.log('[DM] Creating conversations query for user:', currentUser?.id);
    console.log('[DM] currentUser object:', currentUser);
    console.log('[DM] currentUser.id exists:', !!currentUser?.id);

    const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useQuery<Conversation[]>({
        queryKey: ['/api/messages/conversations'],
        queryFn: async () => {
            console.log('[DM] Fetching conversations for user:', currentUser?.id);
            const response = await fetch('/api/messages/conversations', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            console.log('[DM] Conversations response status:', response.status, response.statusText);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[DM] Failed to fetch conversations:', errorText);
                throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('[DM] Conversations data received:', data);
            return data;
        },
        enabled: !!currentUser?.id,
        retry: 1,
        staleTime: 30000, // 30 seconds
    });

    console.log('[DM] Conversations query state:', {
        conversationsLoading,
        conversationsError,
        conversationsCount: conversations.length,
        enabled: !!currentUser?.id
    });

    // Fetch messages for selected conversation
    const { data: messages = [], isLoading: messagesLoading } = useQuery<DirectMessage[]>({
        queryKey: ['/api/messages', selectedConversation],
        queryFn: async () => {
            console.log('[DM] Fetching messages for conversation:', selectedConversation);
            const response = await fetch(`/api/messages/${selectedConversation}`, {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }
            const data = await response.json();
            console.log('[DM] Messages API response:', data);
            console.log('[DM] First message encrypted content:', data[0]?.content);

            // Decrypt messages
            if (currentUser?.id && data.length > 0) {
                console.log('[DM] Decrypting messages...');
                const decryptedMessages = await Promise.all(
                    data.map(async (msg: any) => {
                        try {
                            // Get the other participant ID
                            const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;

                            // Use same password as encryption - sort IDs to ensure consistency
                            const userIds = [currentUser.id, otherUserId].sort();
                            const encryptionPassword = `${userIds[0]}_${userIds[1]}`;

                            console.log('[DM] Decryption attempt:', {
                                messageId: msg.id,
                                senderId: msg.senderId,
                                receiverId: msg.receiverId,
                                currentUserId: currentUser.id,
                                otherUserId: otherUserId,
                                password: encryptionPassword,
                                hasEncryptedContent: !!(msg.encryptedContent || msg.content),
                                encryptedContentLength: (msg.encryptedContent || msg.content || '').length,
                                hasIv: !!msg.iv,
                                ivLength: (msg.iv || '').length
                            });

                            // Decode HTML entities in encrypted content and IV
                            let encryptedContent = msg.encryptedContent || msg.content;
                            let iv = msg.iv || '';

                            // Check if message is already decrypted (for backward compatibility)
                            if (!encryptedContent || encryptedContent.length === 0) {
                                console.warn('[DM] Message has no encrypted content:', msg.id);
                                return {
                                    ...msg,
                                    content: msg.content || '[Empty message]'
                                };
                            }

                            // Check if IV is available
                            if (!iv || iv.length === 0) {
                                console.warn('[DM] Message has no IV, cannot decrypt:', msg.id);
                                return {
                                    ...msg,
                                    content: '[Encrypted message - missing IV]'
                                };
                            }

                            if (typeof encryptedContent === 'string') {
                                encryptedContent = encryptedContent
                                    .replace(/&#x2F;/g, '/')
                                    .replace(/&#x5C;/g, '\\')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&#x27;/g, "'");
                            }

                            if (typeof iv === 'string') {
                                iv = iv
                                    .replace(/&#x2F;/g, '/')
                                    .replace(/&#x5C;/g, '\\')
                                    .replace(/&amp;/g, '&')
                                    .replace(/&lt;/g, '<')
                                    .replace(/&gt;/g, '>')
                                    .replace(/&quot;/g, '"')
                                    .replace(/&#x27;/g, "'");
                            }

                            // Decrypt the content
                            const decryptResult = await simpleE2EEncryption.decryptSimple(
                                encryptedContent,
                                encryptionPassword,
                                iv
                            );

                            if (decryptResult.success && decryptResult.decryptedData) {
                                console.log('[DM] Message decrypted successfully:', {
                                    messageId: msg.id,
                                    encryptedLength: encryptedContent.length,
                                    decryptedLength: decryptResult.decryptedData.length,
                                    decryptedPreview: decryptResult.decryptedData.substring(0, 50) + '...'
                                });
                                return {
                                    ...msg,
                                    content: decryptResult.decryptedData
                                };
                            } else {
                                console.warn('[DM] Failed to decrypt message:', {
                                    messageId: msg.id,
                                    senderId: msg.senderId,
                                    receiverId: msg.receiverId,
                                    currentUserId: currentUser.id,
                                    hasEncryptedContent: !!encryptedContent,
                                    hasIv: !!iv,
                                    encryptedContentLength: encryptedContent?.length || 0,
                                    ivLength: iv?.length || 0,
                                    password: encryptionPassword
                                });
                                return {
                                    ...msg,
                                    content: '[Encrypted message - decryption failed]'
                                };
                            }
                        } catch (error) {
                            console.error('[DM] Error decrypting message:', error);
                            return {
                                ...msg,
                                content: '[Encrypted message]'
                            };
                        }
                    })
                );
                console.log('[DM] All messages decrypted');
                return decryptedMessages;
            }

            return data;
        },
        enabled: !!selectedConversation && !!currentUser?.id,
        refetchInterval: 5000, // Poll for new messages every 5 seconds
        retry: 1,
    });

    // Use decrypted messages from API
    const displayMessages = messages;

    // Send encrypted message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, content, receiverId }: { conversationId: string; content: string; receiverId?: string }) => {
            try {
                console.log('[DM] Send message mutation started:', { conversationId, content, receiverId, currentUserId: currentUser?.id });

                if (!currentUser?.id) {
                    throw new Error('User not authenticated. Please connect your wallet.');
                }

                if (!receiverId) {
                    throw new Error('Receiver ID is required');
                }

                // For demo purposes, we'll use a simple password-based encryption
                // In production, this should use proper key exchange
                // Sort IDs to ensure password is always the same regardless of who sends
                const userIds = [currentUser.id, receiverId].sort();
                const encryptionPassword = `${userIds[0]}_${userIds[1]}`;

                console.log('[DM] Encrypting message with E2E encryption, password:', encryptionPassword);

                // Encrypt the message content on client side with error handling
                let encryptedResult;
                try {
                    encryptedResult = await simpleE2EEncryption.encryptSimple(content, encryptionPassword);
                    console.log('[DM] Encryption successful:', {
                        hasEncryptedData: !!encryptedResult.encryptedData,
                        hasIv: !!encryptedResult.iv,
                        hasTag: !!encryptedResult.tag
                    });
                } catch (encryptError) {
                    console.error('[DM] Encryption error:', encryptError);
                    throw new Error('Failed to encrypt message. Please check your browser supports encryption or try using HTTPS.');
                }

                console.log('[DM] Sending request to /api/messages/send');
                console.log('[DM] Encryption details:', {
                    password: encryptionPassword,
                    encryptedDataLength: encryptedResult.encryptedData.length,
                    ivLength: encryptedResult.iv.length,
                    tagLength: encryptedResult.tag.length,
                    encryptedDataSample: encryptedResult.encryptedData.substring(0, 20) + '...'
                });

                const response = await fetch('/api/messages/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        conversationId,
                        content: encryptedResult.encryptedData,
                        iv: encryptedResult.iv,
                        tag: encryptedResult.tag,
                        receiverId,
                        encrypted: true
                    }),
                });

                console.log('[DM] Send message response status:', response.status, response.statusText);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[DM] Send message failed:', errorText);

                    // Better error messages
                    if (response.status === 401) {
                        throw new Error('Not authenticated. Please reconnect your wallet.');
                    } else if (response.status === 400) {
                        throw new Error('Invalid message data. Please try again.');
                    } else if (response.status === 500) {
                        throw new Error('Server error. Please try again later.');
                    }

                    throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                console.log('[DM] Message sent successfully:', result);
                return result;
            } catch (error) {
                console.error('[DM] Error sending encrypted message:', error);
                // Re-throw with better error message
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error('Failed to send message. Please try again.');
            }
        },
        onSuccess: () => {
            setMessageInput('');
            queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
            queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
            toast({
                title: "Message sent",
                description: "Your encrypted message has been sent successfully",
                variant: "default",
            });
        },
        onError: (error: any) => {
            console.error('[DM] Send message error:', error);
            toast({
                title: "Failed to send message",
                description: error.message || "An unknown error occurred",
                variant: "destructive",
            });
        },
    });

    // Mark messages as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (conversationId: string) => {
            const response = await fetch(`/api/messages/${conversationId}/read`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to mark messages as read');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
        },
    });

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    // Mark messages as read when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            markAsReadMutation.mutate(selectedConversation);
        }
    }, [selectedConversation]);

    const handleSendMessage = async () => {
        console.log('[DM] handleSendMessage called:', {
            messageInput: messageInput,
            messageInputTrim: messageInput.trim(),
            sendMessageMutationPending: sendMessageMutation.isPending,
            selectedConversation,
            targetUserId,
            conversations: conversations.length,
            conversationsData: conversations
        });

        if (!messageInput.trim() || sendMessageMutation.isPending) {
            console.log('[DM] Early return:', {
                noMessageInput: !messageInput.trim(),
                isPending: sendMessageMutation.isPending
            });
            return;
        }

        // Get receiver ID from selected conversation or targetUserId
        let receiverId: string | undefined;
        let conversationId: string | undefined;

        if (selectedConversation) {
            // Use existing conversation
            const selectedConv = conversations.find(conv => conv.id === selectedConversation);
            if (selectedConv?.participant?.id) {
                receiverId = selectedConv.participant.id;
                conversationId = selectedConversation;
                console.log('[DM] Using selected conversation:', { selectedConv, receiverId, conversationId });
            } else {
                // Fallback: if conversation not found in list, use targetUserId if available
                if (targetUserId) {
                    receiverId = targetUserId;
                    conversationId = selectedConversation; // Keep the existing conversationId
                    console.log('[DM] Conversation not found in list, using targetUserId as fallback:', { receiverId, conversationId });
                } else {
                    console.error('[DM] Selected conversation not found and no targetUserId available');
                    toast({
                        title: "Error",
                        description: "Cannot find conversation. Please try again.",
                        variant: "destructive",
                    });
                    return;
                }
            }
        } else if (targetUserId) {
            // Start new conversation with targetUserId
            receiverId = targetUserId;
            conversationId = 'new'; // Will be created on server
            console.log('[DM] Using targetUserId for new conversation:', { receiverId, conversationId });
        }

        if (!receiverId) {
            console.error('[DM] No receiver ID available');
            toast({
                title: "Error",
                description: "Cannot identify message recipient. Please select a conversation.",
                variant: "destructive",
            });
            return;
        }

        console.log('[DM] Sending message:', { conversationId, receiverId, content: messageInput.trim() });

        sendMessageMutation.mutate({
            conversationId: conversationId || 'new',
            content: messageInput.trim(),
            receiverId: receiverId
        });

        // Reset textarea height after sending
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = '40px';
            }
        }, 100);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Auto-resize textarea
    const autoResizeTextarea = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    // Handle message input change with auto-resize
    const handleMessageInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageInput(e.target.value);
        autoResizeTextarea();
    };

    // Auto-resize on mount and when messageInput changes
    useEffect(() => {
        autoResizeTextarea();
    }, [messageInput]);

    const formatTimestamp = (timestamp: Date) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return messageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Use only real conversations from API
    const displayConversations = conversations;
    const displayLoading = conversationsLoading && currentUser;

    const filteredConversations = displayConversations.filter(conv =>
        conv.participant.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedConv = conversations.find(conv => conv.id === selectedConversation);

    // Get target user info when starting new conversation
    const { data: targetUser, isLoading: targetUserLoading, error: targetUserError } = useQuery({
        queryKey: [`/api/users/${targetUserId}`],
        queryFn: async () => {
            if (!targetUserId) return null;
            console.log('[DM] Fetching target user:', targetUserId);
            const response = await fetch(`/api/users/${targetUserId}`, {
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('[DM] Failed to fetch target user:', response.status, response.statusText);
                return null;
            }
            const userData = await response.json();
            console.log('[DM] Target user data:', userData);
            return userData;
        },
        enabled: !!targetUserId,
    });

    // Debug logging
    console.log('[DM] Debug info:', {
        targetUserId,
        selectedConversation,
        targetUser,
        targetUserLoading,
        targetUserError,
        enabled: !!targetUserId,
        conversations,
        conversationsLoading,
        conversationsError,
        currentUser: currentUser?.id
    });

    if (!currentUser) {
        return (
            <Card className="w-full container mx-auto px-4 h-[600px] flex items-center justify-center">
                <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground">
                        Please connect your wallet to start messaging with other users
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="w-full container mx-auto px-4 h-[600px] flex border rounded-lg overflow-hidden">
            {/* Conversations Sidebar */}
            <div className="w-80 border-r bg-muted/30 flex flex-col">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">Messages</h2>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                E2E
                            </Badge>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowNewMessageDialog(true)}
                        >
                            <Users className="h-4 w-4 mr-2" />
                            New
                        </Button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2">
                        {displayLoading ? (
                            <div className="space-y-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                                        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded animate-pulse" />
                                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredConversations.map((conversation) => (
                                    <div
                                        key={conversation.id}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation === conversation.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                            }`}
                                        onClick={() => setSelectedConversation(conversation.id)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="relative">
                                                <Avatar className={`w-10 h-10 ${
                                                    conversation.unreadCount > 0 ? 'ring-2 ring-red-500' : ''
                                                }`}>
                                                    <AvatarImage src={conversation.participant.avatar} />
                                                    <AvatarFallback>
                                                        {conversation.participant.displayName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {conversation.participant.isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                                )}
                                                {conversation.unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-background rounded-full animate-pulse" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm truncate ${
                                                        conversation.unreadCount > 0 ? 'font-bold' : 'font-medium'
                                                    }`}>
                                                        {conversation.participant.displayName}
                                                    </p>
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs min-w-[20px] h-5 flex items-center justify-center px-1.5">
                                                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className={`text-xs line-clamp-2 leading-relaxed ${
                                                    conversation.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'
                                                }`}>
                                                    {conversation.lastMessage?.content || 'No messages yet'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {(() => {
                    console.log('[DM] Chat area condition check:', {
                        selectedConversation,
                        targetUserId,
                        showChat: !!(selectedConversation || targetUserId)
                    });
                    return selectedConversation || targetUserId;
                })() ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-background">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={selectedConv?.participant.avatar || targetUser?.avatar} />
                                            <AvatarFallback>
                                                {(selectedConv?.participant.displayName || targetUser?.displayName)?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        {(selectedConv?.participant.isOnline || targetUser?.isOnline) && (
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            {selectedConv?.participant.displayName ||
                                                (targetUserLoading ? 'Loading...' : targetUser?.displayName) ||
                                                'Unknown User'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            @{selectedConv?.participant.username ||
                                                (targetUserLoading ? 'loading' : targetUser?.username) ||
                                                'unknown'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button size="sm" variant="ghost">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        <Video className="h-4 w-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messagesLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                                                    <div className="h-4 bg-muted rounded animate-pulse" />
                                                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : displayMessages.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No messages yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Start the conversation by sending a message
                                        </p>
                                    </div>
                                ) : (
                                    displayMessages.map((message) => {
                                        console.log('[DM Frontend] Rendering message:', {
                                            id: message.id,
                                            content: message.content,
                                            contentType: typeof message.content,
                                            contentLength: message.content?.length
                                        });

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex gap-3 ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                                                    }`}
                                            >
                                                {message.senderId !== currentUser.id && (
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={message.sender?.avatar} />
                                                        <AvatarFallback>
                                                            {message.sender?.displayName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div
                                                    className={`max-w-[70%] rounded-lg px-3 py-2 ${message.senderId === currentUser.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted'
                                                        }`}
                                                >
                                                    <p className="text-sm break-words whitespace-pre-wrap overflow-wrap-anywhere leading-relaxed">{message.content}</p>
                                                    <p className="text-xs opacity-70 mt-1">
                                                        {formatTimestamp(message.timestamp)}
                                                    </p>
                                                </div>
                                                {message.senderId === currentUser.id && (
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={currentUser.avatar} />
                                                        <AvatarFallback>
                                                            {currentUser.displayName?.charAt(0) || currentUser.username?.charAt(0) || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Lock className="w-3 h-3" />
                                    <span>Messages are encrypted end-to-end and stored in 0G Storage</span>
                                </div>
                            </div>
                            <div className="flex gap-2 items-end">
                                <Textarea
                                    ref={textareaRef}
                                    value={messageInput}
                                    onChange={handleMessageInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Type an encrypted message..."
                                    disabled={sendMessageMutation.isPending}
                                    className="flex-1 min-h-[40px] max-h-[120px] resize-none overflow-hidden"
                                    rows={1}
                                />
                                <Button
                                    onClick={() => {
                                        console.log('[DM] Send button clicked');
                                        handleSendMessage();
                                    }}
                                    disabled={(() => {
                                        const isDisabled = !messageInput.trim() || sendMessageMutation.isPending;
                                        console.log('[DM] Send button disabled check:', {
                                            messageInput,
                                            messageInputTrim: messageInput.trim(),
                                            hasMessageInput: !!messageInput.trim(),
                                            isPending: sendMessageMutation.isPending,
                                            isDisabled
                                        });
                                        return isDisabled;
                                    })()}
                                    size="icon"
                                    className="h-10 w-10"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                            <p className="text-muted-foreground">
                                Choose a conversation from the sidebar to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Message Dialog */}
            <NewMessageDialog
                open={showNewMessageDialog}
                onOpenChange={setShowNewMessageDialog}
                onSelectUser={(userId) => {
                    setShowNewMessageDialog(false);
                    setUserSearchQuery('');
                    // Create conversation with selected user
                    createConversation(userId).then(conversationId => {
                        setSelectedConversation(conversationId);
                        queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
                    });
                }}
                currentUserId={currentUser?.id}
            />
        </div>
    );
}

// New Message Dialog Component
interface NewMessageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectUser: (userId: string) => void;
    currentUserId?: string;
}

function NewMessageDialog({ open, onOpenChange, onSelectUser, currentUserId }: NewMessageDialogProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Search users
    const { data: searchResults = [], isLoading } = useQuery({
        queryKey: ['/api/users/search', searchQuery],
        queryFn: async () => {
            if (!searchQuery.trim()) return [];

            const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to search users');
            return response.json();
        },
        enabled: !!searchQuery.trim() && open,
    });

    // Filter out current user
    const filteredResults = searchResults.filter((user: any) => user.id !== currentUserId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        New Message
                    </DialogTitle>
                    <DialogDescription>
                        Search for a user by username or display name to start a conversation
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search username or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                        />
                    </div>

                    <ScrollArea className="h-[300px]">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg">
                                        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-muted rounded animate-pulse" />
                                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredResults.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? 'No users found' : 'Start typing to search users'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredResults.map((user: any) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                        onClick={() => onSelectUser(user.id)}
                                    >
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>
                                                {user.displayName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {user.displayName}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{user.username}
                                            </p>
                                        </div>
                                        {user.isVerified && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Shield className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
