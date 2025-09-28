import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Brain, TrendingUp, Users, Calendar, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIAgent {
  id: string;
  userId: string;
  agentType: 'content_assistant' | 'engagement_manager' | 'trend_analyzer' | 'network_growth' | 'content_scheduler';
  name: string;
  description: string;
  isActive: boolean;
  configuration: any;
  performance: any;
  createdAt: Date;
  lastActiveAt: Date;
}

export function AIAssistantPanel() {
  const [newAgentType, setNewAgentType] = useState<string>('content_assistant');
  const [prompt, setPrompt] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's AI agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['/api/ai/agents'],
    refetchInterval: 30000
  });

  // Create new AI agent
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      const response = await fetch('/api/ai/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });
      if (!response.ok) throw new Error('Failed to create agent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/agents'] });
      toast({
        title: "AI Agent Created",
        description: "Your personal AI assistant is now active",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate content with AI agent
  const generateContentMutation = useMutation({
    mutationFn: async ({ agentId, prompt, context }: any) => {
      const response = await fetch(`/api/ai/agents/${agentId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      });
      if (!response.ok) throw new Error('Failed to generate content');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Content Generated",
        description: "Your AI agent has created new content",
      });
      // Auto-copy to clipboard
      navigator.clipboard.writeText(data.content);
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCreateAgent = () => {
    const agentConfig = {
      agentType: newAgentType,
      configuration: {
        personality: 'professional',
        responseStyle: 'concise',
        topics: ['blockchain', '0G Chain', 'Web3', 'DeFi'],
        autoPost: false,
        engagementThreshold: 10
      }
    };

    createAgentMutation.mutate(agentConfig);
  };

  const handleGenerateContent = () => {
    if (!selectedAgent || !prompt) return;

    generateContentMutation.mutate({
      agentId: selectedAgent,
      prompt,
      context: { platform: 'DeSocialAI', user_preferences: ['blockchain', 'technology'] }
    });
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'content_assistant': return <Bot className="h-4 w-4" />;
      case 'engagement_manager': return <Users className="h-4 w-4" />;
      case 'trend_analyzer': return <TrendingUp className="h-4 w-4" />;
      case 'network_growth': return <Users className="h-4 w-4" />;
      case 'content_scheduler': return <Calendar className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getAgentTypeLabel = (type: string) => {
    switch (type) {
      case 'content_assistant': return 'Content Assistant';
      case 'engagement_manager': return 'Engagement Manager';
      case 'trend_analyzer': return 'Trend Analyzer';
      case 'network_growth': return 'Network Growth';
      case 'content_scheduler': return 'Content Scheduler';
      default: return 'AI Assistant';
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="ai-assistant-loading">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" data-testid="ai-assistant-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Personal Assistant
          <Badge variant="secondary">Powered by 0G Compute</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agents" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agents" data-testid="agents-tab">My Agents</TabsTrigger>
            <TabsTrigger value="generate" data-testid="generate-tab">Generate Content</TabsTrigger>
            <TabsTrigger value="create" data-testid="create-tab">Create Agent</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4">
            <div className="space-y-3">
              {agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="no-agents-message">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AI agents created yet</p>
                  <p className="text-sm">Create your first AI assistant to get started</p>
                </div>
              ) : (
                agents.map((agent: AIAgent) => (
                  <Card key={agent.id} className="border-l-4 border-l-blue-500" data-testid={`agent-card-${agent.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getAgentIcon(agent.agentType)}
                          <div>
                            <h4 className="font-medium" data-testid={`agent-name-${agent.id}`}>{agent.name}</h4>
                            <p className="text-sm text-muted-foreground">{getAgentTypeLabel(agent.agentType)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.isActive ? "default" : "secondary"} data-testid={`agent-status-${agent.id}`}>
                            {agent.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Posts: {agent.performance?.postsCreated || 0}</div>
                            <div>Engagement: {agent.performance?.engagementGenerated || 0}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select AI Agent</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  data-testid="agent-selector"
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent: AIAgent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} - {getAgentTypeLabel(agent.agentType)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Content Prompt</label>
                <Textarea
                  placeholder="Describe what content you want your AI agent to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-1"
                  rows={4}
                  data-testid="content-prompt"
                />
              </div>

              <Button 
                onClick={handleGenerateContent}
                disabled={!selectedAgent || !prompt || generateContentMutation.isPending}
                className="w-full"
                data-testid="generate-content-button"
              >
                {generateContentMutation.isPending ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>

              {generateContentMutation.data && (
                <Card className="mt-4" data-testid="generated-content">
                  <CardHeader>
                    <CardTitle className="text-sm">Generated Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap" data-testid="generated-text">
                      {generateContentMutation.data.content}
                    </p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Generated by agent {generateContentMutation.data.agentId} at {new Date(generateContentMutation.data.timestamp).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Agent Type</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-md"
                  value={newAgentType}
                  onChange={(e) => setNewAgentType(e.target.value)}
                  data-testid="agent-type-selector"
                >
                  <option value="content_assistant">Content Assistant - Helps create engaging posts</option>
                  <option value="engagement_manager">Engagement Manager - Manages interactions</option>
                  <option value="trend_analyzer">Trend Analyzer - Identifies trending topics</option>
                  <option value="network_growth">Network Growth - Expands your connections</option>
                  <option value="content_scheduler">Content Scheduler - Optimizes posting times</option>
                </select>
              </div>

              <Button 
                onClick={handleCreateAgent}
                disabled={createAgentMutation.isPending}
                className="w-full"
                data-testid="create-agent-button"
              >
                {createAgentMutation.isPending ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" />
                    Create AI Agent
                  </>
                )}
              </Button>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">🚀 Powered by 0G Compute Network</h4>
                <p className="text-xs text-muted-foreground">
                  Your AI agents run on the decentralized 0G Compute Network, ensuring privacy, 
                  authenticity, and true ownership of your AI assistants.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}