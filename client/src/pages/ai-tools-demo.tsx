import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, BarChart3, FileText, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function AIToolsDemo() {
  const { user } = useAuth();
  const [contentPrompt, setContentPrompt] = useState("");
  const [contentType, setContentType] = useState<'marketing' | 'business' | 'social' | 'blog'>('marketing');
  const [analyticsData, setAnalyticsData] = useState("");
  const [analysisType, setAnalysisType] = useState<'performance' | 'market' | 'financial' | 'customer'>('performance');
  
  const queryClient = useQueryClient();

  // Content Generation Mutation
  const contentMutation = useMutation({
    mutationFn: async ({ prompt, type }: { prompt: string; type: string }) => {
      const response = await apiRequest('POST', '/api/ai/generate-content', {
        prompt,
        contentType: type
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/usage'] });
    }
  });

  // Business Analytics Mutation
  const analyticsMutation = useMutation({
    mutationFn: async ({ data, type }: { data: string; type: string }) => {
      const response = await apiRequest('POST', '/api/ai/analyze-business', {
        data,
        analysisType: type
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/usage'] });
    }
  });

  // AI Usage Stats
  const { data: usageStats } = useQuery<{
    remainingCredits?: number;
    usedThisMonth?: number;
  }>({
    queryKey: ['/api/ai/usage'],
    enabled: !!user
  });

  const handleGenerateContent = () => {
    if (!contentPrompt.trim()) return;
    contentMutation.mutate({ prompt: contentPrompt, type: contentType });
  };

  const handleAnalyzeData = () => {
    if (!analyticsData.trim()) return;
    analyticsMutation.mutate({ data: analyticsData, type: analysisType });
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-gray-600">Please log in to access AI tools.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Business Tools</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Powered by ChatGPT Teams - Professional AI tools to help grow your business
        </p>
        {usageStats && (
          <div className="flex justify-center gap-4 mt-4">
            <Badge variant="outline">
              AI Credits: {usageStats.remainingCredits || 'Unlimited'}
            </Badge>
            <Badge variant="outline">
              This Month: {usageStats.usedThisMonth || 0} requests
            </Badge>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Content Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Content Generator
            </CardTitle>
            <p className="text-sm text-gray-600">
              Create professional marketing content, blog posts, and social media copy
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Content Type</label>
              <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing Copy</SelectItem>
                  <SelectItem value="business">Business Content</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="blog">Blog Post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Your Prompt</label>
              <Textarea
                placeholder="e.g., Write a promotional message for our new business networking event..."
                value={contentPrompt}
                onChange={(e) => setContentPrompt(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleGenerateContent}
              disabled={contentMutation.isPending || !contentPrompt.trim()}
              className="w-full"
            >
              {contentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Content'
              )}
            </Button>
            
            {contentMutation.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Generated Content:</h4>
                <p className="text-sm whitespace-pre-wrap">{contentMutation.data.content}</p>
              </div>
            )}
            
            {contentMutation.error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                Error generating content. Please try again.
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Business Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Business Analytics
            </CardTitle>
            <p className="text-sm text-gray-600">
              Get AI-powered insights from your business data and performance metrics
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Analysis Type</label>
              <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance Analysis</SelectItem>
                  <SelectItem value="market">Market Analysis</SelectItem>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="customer">Customer Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Business Data</label>
              <Textarea
                placeholder="Paste your business data, metrics, or describe your situation for AI analysis..."
                value={analyticsData}
                onChange={(e) => setAnalyticsData(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              onClick={handleAnalyzeData}
              disabled={analyticsMutation.isPending || !analyticsData.trim()}
              className="w-full"
            >
              {analyticsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Data'
              )}
            </Button>
            
            {analyticsMutation.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">AI Analysis:</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Summary:</strong>
                    <p>{analyticsMutation.data.summary}</p>
                  </div>
                  {analyticsMutation.data.key_insights && (
                    <div>
                      <strong>Key Insights:</strong>
                      <ul className="list-disc list-inside">
                        {analyticsMutation.data.key_insights.map((insight: string, index: number) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analyticsMutation.data.recommendations && (
                    <div>
                      <strong>Recommendations:</strong>
                      <ul className="list-disc list-inside">
                        {analyticsMutation.data.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {analyticsMutation.error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                Error analyzing data. Please try again.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional AI Tools Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium mb-1">Document Analysis</h3>
            <p className="text-sm text-gray-600">AI analysis of contracts, financials, and legal documents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium mb-1">Business Strategy</h3>
            <p className="text-sm text-gray-600">AI-generated strategies, risk assessments, and optimization</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-medium mb-1">Smart Automation</h3>
            <p className="text-sm text-gray-600">AI-powered workflows and customer support automation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}