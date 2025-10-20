import { Bot, Play, Users, Zap, Check, TrendingUp, UserPlus, AlertCircle, CheckCircle2, Activity, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function PersonalAIFeed() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fundAmount, setFundAmount] = useState("0.1");

  // Query AI feed status
  const { data: feedStatus } = useQuery<{ deployed: boolean; status: string; instanceId?: string; mode?: string }>({
    queryKey: ["/api/ai/feed/status"],
    refetchInterval: 30000, // Check status every 30 seconds
  });

  // Query 0G Compute status for authentic integration info
  const { data: computeStatus } = useQuery<{
    isConfigured: boolean;
    hasPrivateKey: boolean;
    mode: string;
    connection: boolean;
    note: string;
    details?: any;
  }>({
    queryKey: ["/api/zg/compute/status"],
    refetchInterval: 60000, // Check compute status every minute
  });

  const isSimulationMode = feedStatus?.mode === 'simulation' || computeStatus?.mode !== 'real';
  const isRealIntegration = computeStatus?.mode === 'real' && computeStatus?.connection;

  // Query AI recommendations (only when feed is deployed)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useQuery<Array<{
    id: string;
    type: 'topic' | 'user' | 'post';
    title: string;
    description: string;
    confidence: number;
    reason: string;
  }>>({
    queryKey: ["/api/ai/feed/recommendations"],
    enabled: feedStatus?.deployed === true,
    refetchInterval: 300000, // Refresh recommendations every 5 minutes
    retry: 3,
    staleTime: 0, // Always fetch fresh data
  });

  const deployAIFeed = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/feed/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deploy AI feed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "AI Feed Deployed",
        description: data.mode === 'simulation'
          ? "Personal AI deployed in simulation mode using OpenAI GPT-4o"
          : "Your personal AI feed is now running on authentic 0G Compute Network",
      });
      // Force refetch of both status and recommendations
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/recommendations"] });

      // Also force immediate refetch
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/ai/feed/status"] });
        queryClient.refetchQueries({ queryKey: ["/api/ai/feed/recommendations"] });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addFunds = useMutation({
    mutationFn: async (amount: string) => {
      const response = await fetch('/api/zg/compute/fund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create 0G Compute account');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ 0G Compute Account Created!",
        description: data.message || "Your account is now ready. You can use authentic 0G Compute services!",
      });

      // Reset fund amount
      setFundAmount("0.1");

      // Refresh all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/zg/compute/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/zg/compute/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ai/feed/status"] });

      // Force immediate refetch after 1 second
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/zg/compute/status"] });
        queryClient.refetchQueries({ queryKey: ["/api/zg/compute/stats"] });
      }, 1000);
    },
    onError: (error: Error) => {
      console.error('[Personal AI Feed] Account creation error:', error);

      // Check if it's a network/connection error
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        toast({
          title: "⚠️ Network Error",
          description: "Cannot connect to server. Please check your connection and try again.",
          variant: "destructive",
        });
        return;
      }

      // Check if account already exists (this is actually OK)
      if (error.message.includes('already exists')) {
        toast({
          title: "✅ Account Already Exists",
          description: "Your 0G Compute account is already set up and ready to use!",
        });

        // Refresh status
        queryClient.invalidateQueries({ queryKey: ["/api/zg/compute/status"] });
        return;
      }

      // For other errors, show detailed message
      toast({
        title: "⚠️ Account Creation Issue",
        description: error.message.length > 200
          ? "Account creation encountered an issue. You can still use AI features in simulation mode."
          : error.message,
        variant: "default",
      });

      // Log full error for debugging
      console.log("=== 0G COMPUTE ACCOUNT CREATION ERROR ===");
      console.log(error.message);
      console.log("Note: AI features will work in simulation mode until account is created.");
    },
  });

  return (
    <Card className="elegant-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Bot className="text-blue-500 w-5 h-5 flex-shrink-0" />
          <span className="leading-tight text-gray-900 dark:text-gray-100">Your Personal AI Feed</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedStatus?.deployed ? (
          /* Active AI Feed */
          <div className="space-y-4">
            {/* Status Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-2xl flex items-center justify-center border border-green-300 dark:border-green-600">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">AI Feed Active</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {(feedStatus?.mode === 'real' || isRealIntegration) ? 'Running on 0G Compute Network' : 'Development Simulation Mode'}
                </p>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  {(feedStatus?.mode === 'real' || isRealIntegration) ? (
                    <span className="inline-flex items-center space-x-1 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full border border-green-200 dark:border-green-700">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>REAL 0G COMPUTE</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-700">
                      <AlertCircle className="w-3 h-3" />
                      <span>SIMULATION</span>
                    </span>
                  )}
                  {computeStatus?.hasPrivateKey && (
                    <span className="inline-flex items-center space-x-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full border border-blue-500/40">
                      <Activity className="w-3 h-3" />
                      <span>SDK READY</span>
                    </span>
                  )}
                </div>

                {/* Setup 0G Compute Account if needed */}
                {computeStatus?.mode === 'real' && computeStatus?.connection === false && (
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <p className="text-xs font-medium text-orange-800 dark:text-orange-200">Setup 0G Compute Account</p>
                    </div>
                    <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                      0G Compute account not created yet. Add funds to use authentic services.
                    </p>

                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        placeholder="0.1"
                        className="h-8 text-xs bg-black/20 border-orange-500/30 text-orange-100"
                      />
                      <span className="text-xs text-orange-300 whitespace-nowrap">OG</span>
                      <Button
                        onClick={() => addFunds.mutate(fundAmount)}
                        disabled={addFunds.isPending}
                        size="sm"
                        className="h-8 text-xs bg-orange-600 hover:bg-orange-500 text-white"
                      >
                        {addFunds.isPending ? (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            <span>Setup...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Plus className="w-3 h-3" />
                            <span>Setup Account</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-cyan-400/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-cyan-100">
                    {(feedStatus?.mode === 'real' || isRealIntegration) ? 'AI Recommendations (0G Compute)' : 'Recommendations (Simulation)'}
                  </p>
                  {(feedStatus?.mode === 'real' || isRealIntegration) && (
                    <span className="text-xs text-green-400 font-mono">AUTHENTIC</span>
                  )}
                </div>

                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="flex items-start space-x-3 p-3 cyber-glass dark:cyber-glass-dark rounded-lg hover:bg-cyan-400/10 transition-colors cursor-pointer">
                    <div className="flex-shrink-0">
                      {rec.type === 'topic' && <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5" />}
                      {rec.type === 'user' && <UserPlus className="w-4 h-4 text-purple-400 mt-0.5" />}
                      {rec.type === 'post' && <Bot className="w-4 h-4 text-green-400 mt-0.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-cyan-100 line-clamp-1">{rec.title}</p>
                      <p className="text-xs text-cyan-300/70 mt-0.5 line-clamp-2">{rec.description}</p>
                      <p className="text-xs text-cyan-400/60 mt-1">
                        {Math.round(rec.confidence * 100)}% confidence • {rec.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Deployment Section */
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-800 dark:to-indigo-800 rounded-2xl flex items-center justify-center border border-purple-200 dark:border-purple-700">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                Personal AI Feed Available
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {computeStatus?.mode === 'real'
                  ? 'Deploy using authentic 0G Compute Network'
                  : 'Deploy in simulation mode (awaiting 0G Compute mainnet)'
                }
              </p>

              {/* Status indicators */}
              <div className="flex items-center justify-center space-x-2 mt-3">
                {computeStatus?.hasPrivateKey ? (
                  <span className="inline-flex items-center space-x-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full border border-green-500/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SDK CONFIGURED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-xs bg-gray-900/30 text-gray-400 px-2 py-1 rounded-full border border-gray-500/40">
                    <AlertCircle className="w-3 h-3" />
                    <span>SDK READY</span>
                  </span>
                )}

                {computeStatus?.mode === 'real' && computeStatus?.connection && (
                  <span className="inline-flex items-center space-x-1 text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded-full border border-blue-500/40">
                    <Activity className="w-3 h-3" />
                    <span>0G NETWORK</span>
                  </span>
                )}
              </div>

              {/* Setup 0G Compute Account if needed */}
              {computeStatus?.mode === 'real' && !computeStatus?.connection && (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wallet className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <p className="text-xs font-medium text-orange-800 dark:text-orange-200">Setup 0G Compute Account</p>
                  </div>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mb-3">
                    To use authentic 0G Compute, add funds to your account (minimum 0.1 OG).
                    This process will create a new account on the 0G blockchain.
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
                    💡 Tip: If the setup button doesn't work, see manual instructions in browser console (F12).
                  </p>

                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="0.1"
                      className="h-8 text-xs bg-black/20 border-orange-500/30 text-orange-100 placeholder:text-orange-300/50"
                    />
                    <span className="text-xs text-orange-300 whitespace-nowrap">OG</span>
                    <Button
                      onClick={() => addFunds.mutate(fundAmount)}
                      disabled={addFunds.isPending}
                      size="sm"
                      className="h-8 text-xs bg-orange-600/80 hover:bg-orange-500/80 text-white"
                    >
                      {addFunds.isPending ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          <span>Setup...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <Plus className="w-3 h-3" />
                          <span>Create Account</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Deploy Button */}
            <Button
              onClick={() => deployAIFeed.mutate()}
              disabled={deployAIFeed.isPending}
              className="elegant-button w-full flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>
                {deployAIFeed.isPending ? "Deploying..." : "Deploy AI Feed"}
              </span>
            </Button>

            {/* Features Preview */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">Smart Content Filtering</p>
                  <p className="text-gray-600 dark:text-gray-400">AI learns your preferences</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">
                    {computeStatus?.mode === 'real' ? '0G Compute Processing' : 'Decentralized Processing'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {computeStatus?.mode === 'real' ? 'Powered by official 0G SDK' : 'Runs on 0G Compute network'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Users className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="text-gray-900 dark:text-gray-100 font-medium">Community Insights</p>
                  <p className="text-gray-600 dark:text-gray-400">Connect with similar interests</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}