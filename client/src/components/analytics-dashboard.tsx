import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Share,
  Target,
  Brain,
  Zap
} from 'lucide-react';

interface UserAnalytics {
  userId: string;
  engagementMetrics: {
    totalLikes: number;
    totalComments: number;
    totalReposts: number;
    averageEngagementRate: number;
    peakEngagementTimes: string[];
  };
  contentAnalysis: {
    topTopics: Array<{
      topic: string;
      frequency: number;
      engagementScore: number;
      trendingStatus: 'rising' | 'stable' | 'declining';
    }>;
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
      overallSentiment: 'positive' | 'neutral' | 'negative';
    };
  };
  networkGrowth: {
    followersGrowthRate: number;
    followingGrowthRate: number;
    networkQualityScore: number;
    communityEngagement: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: number;
  }>;
  lastUpdated: Date;
}

interface TrendAnalysis {
  trends: Array<{
    trend: string;
    growth: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  generatedAt: Date;
  confidence: number;
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [viralContent, setViralContent] = useState('');
  const [viralPrediction, setViralPrediction] = useState<any>(null);

  // Fetch user analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<UserAnalytics>({
    queryKey: ['/api/analytics/user', { range: timeRange }],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  // Fetch trend analysis
  const { data: trends, isLoading: trendsLoading } = useQuery<TrendAnalysis>({
    queryKey: ['/api/analytics/trends'],
    refetchInterval: 600000 // Refresh every 10 minutes
  });

  const handleViralPrediction = async () => {
    if (!viralContent.trim()) return;

    try {
      const response = await fetch('/api/analytics/predict-viral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: viralContent })
      });
      
      if (response.ok) {
        const prediction = await response.json();
        setViralPrediction(prediction);
      }
    } catch (error) {
      console.error('Viral prediction failed:', error);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  if (analyticsLoading) {
    return (
      <Card data-testid="analytics-loading">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Advanced Analytics Dashboard
            <Badge variant="secondary">AI-Powered Insights</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range as any)}
                data-testid={`timerange-${range}`}
              >
                {range}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="overview-tab">Overview</TabsTrigger>
          <TabsTrigger value="content" data-testid="content-tab">Content Analysis</TabsTrigger>
          <TabsTrigger value="trends" data-testid="trends-tab">Trends</TabsTrigger>
          <TabsTrigger value="viral" data-testid="viral-tab">Viral Predictor</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card data-testid="likes-metric">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">Total Likes</span>
                    </div>
                    <div className="text-2xl font-bold mt-2" data-testid="total-likes">
                      {analytics.engagementMetrics.totalLikes}
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="comments-metric">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Comments</span>
                    </div>
                    <div className="text-2xl font-bold mt-2" data-testid="total-comments">
                      {analytics.engagementMetrics.totalComments}
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="reposts-metric">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Share className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Total Reposts</span>
                    </div>
                    <div className="text-2xl font-bold mt-2" data-testid="total-reposts">
                      {analytics.engagementMetrics.totalReposts}
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="engagement-rate-metric">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Engagement Rate</span>
                    </div>
                    <div className="text-2xl font-bold mt-2" data-testid="engagement-rate">
                      {analytics.engagementMetrics.averageEngagementRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Network Growth */}
              <Card>
                <CardHeader>
                  <CardTitle>Network Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Network Quality Score</span>
                      <span className="font-bold" data-testid="network-quality-score">
                        {analytics.networkGrowth.networkQualityScore}%
                      </span>
                    </div>
                    <Progress value={analytics.networkGrowth.networkQualityScore} className="w-full" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Followers Growth</span>
                        <div className="font-bold" data-testid="followers-growth">
                          {analytics.networkGrowth.followersGrowthRate > 0 ? '+' : ''}
                          {analytics.networkGrowth.followersGrowthRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Community Engagement</span>
                        <div className="font-bold" data-testid="community-engagement">
                          {analytics.networkGrowth.communityEngagement}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg" data-testid={`recommendation-${index}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{rec.title}</span>
                              <Badge className={getPriorityColor(rec.priority)}>
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-green-600">
                              +{rec.estimatedImpact}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Content Analysis Tab */}
        <TabsContent value="content" className="space-y-6">
          {analytics && (
            <>
              {/* Top Topics */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.contentAnalysis.topTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`topic-${index}`}>
                        <div className="flex items-center gap-3">
                          {getTrendIcon(topic.trendingStatus)}
                          <div>
                            <span className="font-medium">{topic.topic}</span>
                            <div className="text-sm text-muted-foreground">
                              Frequency: {topic.frequency} | Engagement: {topic.engagementScore}
                            </div>
                          </div>
                        </div>
                        <Badge variant={topic.trendingStatus === 'rising' ? 'default' : 'secondary'}>
                          {topic.trendingStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <span className={`text-lg font-bold ${getSentimentColor(analytics.contentAnalysis.sentimentDistribution.overallSentiment)}`}>
                        Overall: {analytics.contentAnalysis.sentimentDistribution.overallSentiment.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.contentAnalysis.sentimentDistribution.positive}%
                        </div>
                        <span className="text-sm text-muted-foreground">Positive</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-600">
                          {analytics.contentAnalysis.sentimentDistribution.neutral}%
                        </div>
                        <span className="text-sm text-muted-foreground">Neutral</span>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {analytics.contentAnalysis.sentimentDistribution.negative}%
                        </div>
                        <span className="text-sm text-muted-foreground">Negative</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Trends
                  <Badge variant="outline">
                    Confidence: {(trends.confidence * 100).toFixed(0)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`trend-${index}`}>
                      <div>
                        <span className="font-medium">{trend.trend}</span>
                        <div className="text-sm text-muted-foreground">
                          Growth: {trend.growth}% | Impact: {trend.impact}
                        </div>
                      </div>
                      <Badge variant={trend.impact === 'high' ? 'default' : 'secondary'}>
                        {trend.impact} impact
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Viral Predictor Tab */}
        <TabsContent value="viral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Viral Content Predictor
                <Badge variant="secondary">AI-Powered</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Content to Analyze</label>
                  <textarea
                    className="w-full mt-1 p-3 border rounded-md resize-none"
                    rows={4}
                    placeholder="Enter your content here to predict viral potential..."
                    value={viralContent}
                    onChange={(e) => setViralContent(e.target.value)}
                    data-testid="viral-content-input"
                  />
                </div>

                <Button 
                  onClick={handleViralPrediction}
                  disabled={!viralContent.trim()}
                  className="w-full"
                  data-testid="predict-viral-button"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Predict Viral Potential
                </Button>

                {viralPrediction && (
                  <Card className="mt-4" data-testid="viral-prediction-result">
                    <CardContent className="p-4">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-purple-600" data-testid="viral-score">
                          {viralPrediction.viralScore}%
                        </div>
                        <span className="text-sm text-muted-foreground">Viral Potential</span>
                      </div>
                      
                      <Progress value={viralPrediction.viralScore} className="w-full mb-4" />
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Success Factors:</h4>
                        <ul className="text-sm space-y-1">
                          {viralPrediction.factors?.map((factor: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              {factor}
                            </li>
                          ))}
                        </ul>
                        
                        {viralPrediction.improvements && (
                          <>
                            <h4 className="font-medium mt-4">Suggestions for Improvement:</h4>
                            <ul className="text-sm space-y-1">
                              {viralPrediction.improvements.map((improvement: string, index: number) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}