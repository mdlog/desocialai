import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle, Users, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

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

export function DirectMessageInterface() {
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch conversations list
    const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useQuery<Conversation[]>({
        queryKey: ['/api/messages/conversations'],
        enabled: !!currentUser,
        retry: false,
    });

    // Fetch messages for selected conversation
    const { data: messages = [], isLoading: messagesLoading } = useQuery<DirectMessage[]>({
        queryKey: ['/api/messages', selectedConversation],
        enabled: !!selectedConversation,
        refetchInterval: 5000, // Poll for new messages every 5 seconds
    });

    // Mock messages data
    const mockMessages: { [key: string]: DirectMessage[] } = {
        'conv1': [
            {
                id: 'msg1',
                senderId: 'user2',
                receiverId: 'current_user',
                content: 'Hey! How are you doing?',
                timestamp: new Date(Date.now() - 1000 * 60 * 10),
                read: true,
                sender: {
                    id: 'user2',
                    displayName: 'Alice Johnson',
                    username: 'alice',
                    avatar: '/api/objects/avatar/avatar_1758135047272_lkfo1ry38.jpg'
                }
            },
            {
                id: 'msg2',
                senderId: 'current_user',
                receiverId: 'user2',
                content: 'I\'m doing great! Thanks for asking. How about you?',
                timestamp: new Date(Date.now() - 1000 * 60 * 8),
                read: true,
                sender: {
                    id: 'current_user',
                    displayName: 'You',
                    username: 'current_user',
                    avatar: '/api/objects/avatar/default-avatar.jpg'
                }
            },
            {
                id: 'msg3',
                senderId: 'user2',
                receiverId: 'current_user',
                content: 'I\'m doing well too! Just working on some new projects.',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                read: false,
                sender: {
                    id: 'user2',
                    displayName: 'Alice Johnson',
                    username: 'alice',
                    avatar: '/api/objects/avatar/avatar_1758135047272_lkfo1ry38.jpg'
                }
            }
        ],
        'conv2': [
            {
                id: 'msg4',
                senderId: 'current_user',
                receiverId: 'user3',
                content: 'Hi Bob! I saw your post about the new DeFi protocol. Looks interesting!',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
                read: true,
                sender: {
                    id: 'current_user',
                    displayName: 'You',
                    username: 'current_user',
                    avatar: '/api/objects/avatar/default-avatar.jpg'
                }
            },
            {
                id: 'msg5',
                senderId: 'user3',
                receiverId: 'current_user',
                content: 'Thanks! Yes, it\'s a revolutionary approach to yield farming. Would you like to collaborate on it?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
                read: true,
                sender: {
                    id: 'user3',
                    displayName: 'Bob Smith',
                    username: 'bob',
                    avatar: '/api/objects/avatar/default-avatar.jpg'
                }
            },
            {
                id: 'msg6',
                senderId: 'current_user',
                receiverId: 'user3',
                content: 'Absolutely! I\'d love to contribute to the smart contract development.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.2),
                read: true,
                sender: {
                    id: 'current_user',
                    displayName: 'You',
                    username: 'current_user',
                    avatar: '/api/objects/avatar/default-avatar.jpg'
                }
            },
            {
                id: 'msg7',
                senderId: 'user3',
                receiverId: 'current_user',
                content: 'Perfect! I\'ll send you the technical specifications tomorrow. Thanks for the help!',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                read: true,
                sender: {
                    id: 'user3',
                    displayName: 'Bob Smith',
                    username: 'bob',
                    avatar: '/api/objects/avatar/default-avatar.jpg'
                }
            }
        ]
    };

    // Use mock messages if API fails
    const displayMessages = messages.length > 0 ? messages : (mockMessages[selectedConversation || ''] || []);

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
            const response = await fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId,
                    content,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            return response.json();
        },
        onSuccess: () => {
            setMessageInput('');
            queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation] });
            queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
        },
        onError: (error: any) => {
            toast({
                title: "Failed to send message",
                description: error.message,
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
        if (!messageInput.trim() || !selectedConversation || sendMessageMutation.isPending) return;

        sendMessageMutation.mutate({
            conversationId: selectedConversation,
            content: messageInput.trim(),
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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

    // Fallback mock data if API fails or user not authenticated
    const mockConversations: Conversation[] = [
        {
            id: 'conv1',
            participant: {
                id: 'user2',
                displayName: 'Alice Johnson',
                username: 'alice',
                avatar: '/api/objects/avatar/avatar_1758135047272_lkfo1ry38.jpg',
                isOnline: true
            },
            lastMessage: {
                content: 'Hey! How are you doing?',
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                senderId: 'user2'
            },
            unreadCount: 2,
            updatedAt: new Date(Date.now() - 1000 * 60 * 5)
        },
        {
            id: 'conv2',
            participant: {
                id: 'user3',
                displayName: 'Bob Smith',
                username: 'bob',
                avatar: '/api/objects/avatar/default-avatar.jpg',
                isOnline: false
            },
            lastMessage: {
                content: 'Thanks for the help!',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                senderId: 'user3'
            },
            unreadCount: 0,
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
            id: 'conv3',
            participant: {
                id: 'user4',
                displayName: 'Sarah Chen',
                username: 'sarah',
                avatar: '/api/objects/avatar/default-avatar.jpg',
                isOnline: true
            },
            lastMessage: {
                content: 'The DeFi project looks amazing! 🚀',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                senderId: 'user4'
            },
            unreadCount: 1,
            updatedAt: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
            id: 'conv4',
            participant: {
                id: 'user5',
                displayName: 'Mike Rodriguez',
                username: 'mike',
                avatar: '/api/objects/avatar/default-avatar.jpg',
                isOnline: false
            },
            lastMessage: {
                content: 'Can we schedule a call for tomorrow?',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
                senderId: 'user5'
            },
            unreadCount: 0,
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
        },
        {
            id: 'conv5',
            participant: {
                id: 'user6',
                displayName: 'Emma Wilson',
                username: 'emma',
                avatar: '/api/objects/avatar/default-avatar.jpg',
                isOnline: true
            },
            lastMessage: {
                content: 'Just saw your latest post about Web3! Really insightful 👏',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
                senderId: 'user6'
            },
            unreadCount: 3,
            updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
        }
    ];

    // Use mock data if API fails or no user
    const displayConversations = conversations.length > 0 ? conversations : mockConversations;
    const displayLoading = conversationsLoading && currentUser;

    const filteredConversations = displayConversations.filter(conv =>
        conv.participant.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedConv = conversations.find(conv => conv.id === selectedConversation);

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
                        <h2 className="text-lg font-semibold">Messages</h2>
                        <Button size="sm" variant="outline">
                            <Users className="h-4 w-4" />
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
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={conversation.participant.avatar} />
                                                    <AvatarFallback>
                                                        {conversation.participant.displayName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {conversation.participant.isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate">
                                                        {conversation.participant.displayName}
                                                    </p>
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
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
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-background">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={selectedConv?.participant.avatar} />
                                            <AvatarFallback>
                                                {selectedConv?.participant.displayName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {selectedConv?.participant.isOnline && (
                                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{selectedConv?.participant.displayName}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            @{selectedConv?.participant.username}
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
                                    displayMessages.map((message) => (
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
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-xs opacity-70 mt-1">
                                                    {formatTimestamp(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t">
                            <div className="flex gap-2">
                                <Input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    disabled={sendMessageMutation.isPending}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                                    size="icon"
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
        </div>
    );
}
