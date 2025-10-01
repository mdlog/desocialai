import { DirectMessageInterface } from '@/components/chat/direct-message-interface';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useEffect, useState } from 'react';

export default function MessagesPage() {
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const conversationId = searchParams.get('conversation');
  const targetUserId = searchParams.get('user');

  // Debug logging
  console.log('[Messages Page] URL params:', {
    conversationId,
    targetUserId,
    fullSearchParams: window.location.search
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="page-title-messages">Direct Messages</h1>
          <p className="text-muted-foreground" data-testid="text-messages-description">
            Send private messages to other users on the DeSocialAI platform
          </p>
        </div>
        <DirectMessageInterface
          initialConversationId={conversationId || undefined}
          targetUserId={targetUserId || undefined}
        />
      </main>

      <Footer />
    </div>
  );
}