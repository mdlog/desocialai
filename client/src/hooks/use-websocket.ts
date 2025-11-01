import { useRef, useState, useCallback, useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('📨 WebSocket message received:', message.type);

    switch (message.type) {
      case 'new_post':
        console.log('📨 New post received, updating feed...');

        // Only invalidate feed queries, not all posts queries
        queryClient.invalidateQueries({
          queryKey: ['/api/posts/feed']
        });

        // Update user profile for post count
        queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
        break;

      case 'post_liked':
        console.log('❤️ Post liked, refreshing posts...');
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
        break;

      case 'new_comment':
        const postId = message.data.postId;
        console.log(`💬 New comment received for post ${postId}, refreshing...`);

        // Invalidate all comment queries for this post
        queryClient.invalidateQueries({
          predicate: (query) => {
            const queryKey = query.queryKey as string[];
            return queryKey[0] === '/api/posts' && queryKey[2] === 'comments' && queryKey[1] === postId;
          }
        });

        // Update post queries to show new comment count
        queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
        break;

      case 'new_notification':
        console.log('🔔 New notification received, refreshing notifications...');
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        break;

      case 'notifications_updated':
        console.log('🔔 Notifications updated, refreshing notifications...');
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        break;

      case 'profile_update':
        console.log('👤 Profile update received, refreshing user data...');
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
        queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
        break;

      default:
        console.log('📨 Unknown WebSocket message type:', message.type);
    }
  }, []);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      // Ensure window.location.host is defined
      if (!window.location.host) {
        console.error('window.location.host is undefined, cannot connect WebSocket');
        return;
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('🔌 Attempting WebSocket connection to:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected for real-time updates');
        setConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          // Ensure event.data is a string and parse safely
          let data: string;
          if (typeof event.data === 'string') {
            data = event.data;
          } else if (event.data instanceof Blob) {
            // Handle blob data asynchronously
            event.data.text().then(text => {
              try {
                const message = JSON.parse(text);
                handleWebSocketMessage(message);
              } catch (err) {
                console.error('Failed to parse blob WebSocket message:', err);
              }
            });
            return;
          } else if (typeof event.data === 'object') {
            // Skip objects that can't be stringified properly
            console.warn('Received non-stringifiable WebSocket object, skipping');
            return;
          } else {
            data = String(event.data);
          }

          if (!data || data.trim() === '' || data === '[object Object]') return;

          // Additional validation for 'setImmedia' error
          if (data.includes('setImmedia') || data.startsWith('setImmedia')) {
            console.warn('Skipping invalid WebSocket message containing setImmedia');
            return;
          }

          const message: WebSocketMessage = JSON.parse(data);
          handleWebSocketMessage(message);

        } catch (error) {
          // Silently ignore JSON parsing errors to reduce console noise
          // console.error('WebSocket message parsing error:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setConnected(false);

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, Math.pow(2, reconnectAttemptsRef.current) * 1000); // Exponential backoff
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }, [handleWebSocketMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connected, connect, disconnect };
}