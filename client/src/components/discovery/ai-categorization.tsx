import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Tag, Sparkles, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  confidence: number;
  color: string;
  postCount: number;
}

interface AICategorizationStats {
  totalPosts: number;
  categorizedPosts: number;
  pendingPosts: number;
  accuracy: number;
  categories: ContentCategory[];
}

export function AICategorization() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/ai/categorization/stats'],
    queryFn: async () => {
      const response = await fetch('/api/ai/categorization/stats');
      if (!response.ok) throw new Error('Failed to fetch categorization stats');
      return response.json() as AICategorizationStats;
    },
  });

  const categorizeMutation = useMutation({
    mutationFn: async (postIds?: string[]) => {
      const response = await fetch('/api/ai/categorization/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postIds }),
      });
      if (!response.ok) throw new Error('Categorization failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/categorization/stats'] });
      toast({
        title: "AI Categorization Complete",
        description: "Content has been successfully categorized with AI tagging.",
      });
    },
    onError: () => {
      toast({
        title: "Categorization Failed",
        description: "Failed to categorize content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRunCategorization = () => {
    categorizeMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Content Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = stats ? (stats.categorizedPosts / stats.totalPosts) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* AI Categorization Overview */}
      <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Content Categorization
            </div>
            <Button
              onClick={handleRunCategorization}
              disabled={categorizeMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              data-testid="button-run-categorization"
            >
              {categorizeMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {categorizeMutation.isPending ? 'Processing...' : 'Run AI Categorization'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Categorization Progress</span>
              <span className="font-medium">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats?.categorizedPosts || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Categorized</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats?.pendingPosts || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats?.accuracy || 0}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
            </div>
          </div>

          {/* AI Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Auto-Tagging</h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Automatic hashtag generation based on content analysis
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-green-900 dark:text-green-100">Smart Categories</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                AI-powered content categorization for better discovery
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">Quality Analysis</h3>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Content quality scoring and engagement prediction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Categories */}
      <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Content Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.categories && stats.categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.categories.map((category) => (
                <div 
                  key={category.id} 
                  className="p-4 rounded-lg border-2 hover:shadow-lg transition-all"
                  style={{ borderColor: category.color }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      style={{ backgroundColor: category.color, color: 'white' }}
                      className="font-medium"
                    >
                      {category.name}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-3 h-3" />
                      {Math.round(category.confidence)}%
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {category.description}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Posts: {category.postCount}</span>
                    <Progress value={category.confidence} className="w-16 h-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No categories available yet</p>
              <p className="text-sm">Run AI categorization to generate content categories</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}