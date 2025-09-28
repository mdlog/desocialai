import { ChatInterface } from '@/components/chat/chat-interface';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" data-testid="page-title-messages">Messages</h1>
            <p className="text-muted-foreground" data-testid="text-messages-description">
              Connect and communicate with other users through secure messaging
            </p>
          </div>
          <ChatInterface />
        </div>
      </main>

      <Footer />
    </div>
  );
}