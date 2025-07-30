import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, FileText, MessageSquare, BarChart3, Wand2, Zap, Users, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

const AITools = () => {
  const { isAuthenticated, user } = useAuth();
  const [contentPrompt, setContentPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const aiTools = [
    {
      id: "content-generator",
      title: "AI Content Generator",
      description: "Generate marketing content, blog posts, and social media copy",
      icon: <FileText className="h-6 w-6" />,
      tier: "Growth+",
      available: true
    },
    {
      id: "business-analyzer",
      title: "Business Analytics AI",
      description: "Analyze business data and generate insights",
      icon: <BarChart3 className="h-6 w-6" />,
      tier: "Strategic+",
      available: true
    },
    {
      id: "chatbot-builder",
      title: "Chatbot Builder",
      description: "Create custom chatbots for your business",
      icon: <MessageSquare className="h-6 w-6" />,
      tier: "Strategic+",
      available: true
    },
    {
      id: "process-optimizer",
      title: "Process Optimization AI",
      description: "Identify and optimize business processes",
      icon: <Zap className="h-6 w-6" />,
      tier: "Strategic+",
      available: true
    },
    {
      id: "customer-insights",
      title: "Customer Insights AI",
      description: "Analyze customer behavior and preferences",
      icon: <Users className="h-6 w-6" />,
      tier: "Patron+",
      available: true
    },
    {
      id: "marketing-optimizer",
      title: "Marketing Campaign AI",
      description: "Optimize marketing campaigns with AI",
      icon: <Target className="h-6 w-6" />,
      tier: "Patron+",
      available: true
    },
    {
      id: "custom-ai",
      title: "Custom AI Models",
      description: "Build and train custom AI models for your business",
      icon: <Bot className="h-6 w-6" />,
      tier: "Partner Only",
      available: true
    },
    {
      id: "ai-assistant",
      title: "Business AI Assistant",
      description: "24/7 AI assistant for business queries and tasks",
      icon: <Wand2 className="h-6 w-6" />,
      tier: "Partner Only",
      available: true
    }
  ];

  const generateContent = async () => {
    if (!contentPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI content generation
    setTimeout(() => {
      const sampleContent = `Here's AI-generated content based on your prompt: "${contentPrompt}"

**Marketing Copy:**
Transform your business with cutting-edge solutions designed for modern entrepreneurs. Our innovative approach combines industry expertise with personalized service to deliver exceptional results.

**Key Benefits:**
• Streamlined operations for maximum efficiency
• Data-driven insights for informed decision making
• Scalable solutions that grow with your business
• Expert support when you need it most

**Call to Action:**
Ready to take your business to the next level? Contact us today for a free consultation and discover how our solutions can drive your success.

*This content was generated using AI and can be customized further based on your specific needs.*`;
      
      setGeneratedContent(sampleContent);
      setIsGenerating(false);
    }, 2000);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "Growth+": return "bg-green-100 text-green-800";
      case "Strategic+": return "bg-purple-100 text-purple-800";
      case "Patron+": return "bg-orange-100 text-orange-800";
      case "Partner Only": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Bot className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-4">AI Tools Access</h2>
            <p className="text-neutral-600 mb-6">
              Please log in to access our comprehensive AI tools and services.
            </p>
            <Link to="/login">
              <Button className="w-full">Log In to Access AI Tools</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <Bot className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">AI Tools & Services</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Access powerful AI tools designed to streamline your business operations and drive growth.
            </p>
            <Badge variant="secondary" className="bg-white/20 text-white">
              Member Access
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tools" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
            <TabsTrigger value="content-gen">Content Generator</TabsTrigger>
            <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-8">
            {/* AI Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiTools.map((tool) => (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        {tool.icon}
                      </div>
                      <Badge className={getTierBadgeColor(tool.tier)} variant="secondary">
                        {tool.tier}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <p className="text-sm text-neutral-600">{tool.description}</p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full" 
                      variant={tool.available ? "default" : "secondary"}
                      disabled={!tool.available}
                    >
                      {tool.available ? "Launch Tool" : "Coming Soon"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content-gen" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>AI Content Generator</span>
                </CardTitle>
                <p className="text-neutral-600">
                  Generate high-quality marketing content, blog posts, and social media copy using AI.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Content Prompt</label>
                  <Textarea
                    placeholder="Describe the type of content you need (e.g., 'Write a marketing email for a new product launch in the tech industry')"
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={generateContent}
                  disabled={isGenerating || !contentPrompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? "Generating Content..." : "Generate Content"}
                </Button>
                
                {generatedContent && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Generated Content</label>
                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">Copy to Clipboard</Button>
                      <Button variant="outline" size="sm">Edit Content</Button>
                      <Button variant="outline" size="sm">Save as Template</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Business Analytics AI</span>
                </CardTitle>
                <p className="text-neutral-600">
                  Upload your business data and get AI-powered insights and recommendations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Sales Performance</h4>
                    <p className="text-sm text-neutral-600 mb-3">Analyze sales trends and forecasts</p>
                    <Button variant="outline" size="sm" className="w-full">Upload Sales Data</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Customer Analytics</h4>
                    <p className="text-sm text-neutral-600 mb-3">Understand customer behavior patterns</p>
                    <Button variant="outline" size="sm" className="w-full">Upload Customer Data</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Marketing ROI</h4>
                    <p className="text-sm text-neutral-600 mb-3">Measure marketing campaign effectiveness</p>
                    <Button variant="outline" size="sm" className="w-full">Upload Campaign Data</Button>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Financial Insights</h4>
                    <p className="text-sm text-neutral-600 mb-3">AI-powered financial analysis</p>
                    <Button variant="outline" size="sm" className="w-full">Upload Financial Data</Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upgrade CTA */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-neutral-900 mb-4">
              Unlock Advanced AI Tools
            </h3>
            <p className="text-lg text-neutral-600 mb-6">
              Upgrade your membership to access premium AI features, custom model training, and dedicated AI support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/membership-benefits">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  View Membership Plans
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Schedule AI Consultation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AITools;