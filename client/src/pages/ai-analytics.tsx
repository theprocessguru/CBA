import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, Brain, Zap, Target, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const AIAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState("performance");

  const analyticsServices = [
    {
      category: "Real-time Analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-600",
      services: [
        {
          title: "Live Business Dashboard",
          description: "Real-time monitoring of key business metrics with AI-powered insights",
          metrics: ["Revenue tracking", "Customer activity", "Performance KPIs", "Market changes"],
          tier: "Growth+"
        },
        {
          title: "Predictive Analytics Engine",
          description: "AI-powered forecasting for sales, demand, and market trends",
          metrics: ["Sales forecasts", "Demand predictions", "Market trend analysis", "Risk indicators"],
          tier: "Strategic+"
        },
        {
          title: "Anomaly Detection System",
          description: "Automatically identify unusual patterns and potential issues",
          metrics: ["Performance anomalies", "Security threats", "Process deviations", "Quality issues"],
          tier: "Growth+"
        }
      ]
    },
    {
      category: "Customer Intelligence",
      icon: <Users className="h-8 w-8" />,
      color: "from-purple-500 to-pink-600",
      services: [
        {
          title: "Customer Journey Mapping",
          description: "AI-powered analysis of customer interactions and behavior patterns",
          metrics: ["Journey stages", "Conversion points", "Drop-off analysis", "Engagement tracking"],
          tier: "Strategic+"
        },
        {
          title: "Sentiment Analysis",
          description: "Real-time analysis of customer feedback and social media sentiment",
          metrics: ["Customer satisfaction", "Brand perception", "Review analysis", "Social sentiment"],
          tier: "Growth+"
        },
        {
          title: "Behavioral Analytics",
          description: "Deep insights into customer behavior and preferences",
          metrics: ["Usage patterns", "Preference analysis", "Segmentation", "Lifetime value"],
          tier: "Strategic+"
        }
      ]
    },
    {
      category: "Market Intelligence",
      icon: <Target className="h-8 w-8" />,
      color: "from-green-500 to-emerald-600",
      services: [
        {
          title: "Competitive Intelligence",
          description: "AI-driven analysis of competitor activities and market positioning",
          metrics: ["Competitor tracking", "Market share", "Pricing analysis", "Strategy insights"],
          tier: "Strategic+"
        },
        {
          title: "Market Signal Detection",
          description: "Early identification of market trends and opportunities",
          metrics: ["Trend indicators", "Opportunity alerts", "Risk signals", "Market shifts"],
          tier: "Partner Only"
        },
        {
          title: "Industry Trend Forecasting",
          description: "Predict industry changes and market movements",
          metrics: ["Industry trends", "Technology adoption", "Regulatory changes", "Economic indicators"],
          tier: "Strategic+"
        }
      ]
    }
  ];

  const mockAnalyticsData = {
    performance: {
      title: "Business Performance Analytics",
      metrics: [
        { label: "Revenue Growth", value: "+23.5%", trend: "up", color: "text-green-600" },
        { label: "Customer Acquisition", value: "+18.2%", trend: "up", color: "text-green-600" },
        { label: "Operational Efficiency", value: "+15.7%", trend: "up", color: "text-green-600" },
        { label: "Cost Reduction", value: "-12.3%", trend: "down", color: "text-green-600" }
      ],
      insights: [
        "Q4 revenue trending 25% above target",
        "Customer acquisition costs decreased by 15%",
        "Operational efficiency improved significantly",
        "Marketing ROI increased by 32%"
      ]
    },
    customer: {
      title: "Customer Intelligence Dashboard",
      metrics: [
        { label: "Customer Satisfaction", value: "94.2%", trend: "up", color: "text-blue-600" },
        { label: "Net Promoter Score", value: "76", trend: "up", color: "text-blue-600" },
        { label: "Retention Rate", value: "89.1%", trend: "up", color: "text-blue-600" },
        { label: "Churn Risk", value: "3.2%", trend: "down", color: "text-green-600" }
      ],
      insights: [
        "Customer satisfaction at all-time high",
        "Strong loyalty indicators across segments",
        "Proactive retention strategies working",
        "Premium customers showing 95% retention"
      ]
    },
    market: {
      title: "Market Intelligence Overview",
      metrics: [
        { label: "Market Share", value: "12.8%", trend: "up", color: "text-purple-600" },
        { label: "Competitive Position", value: "#3", trend: "up", color: "text-purple-600" },
        { label: "Market Growth", value: "+8.5%", trend: "up", color: "text-purple-600" },
        { label: "Opportunity Score", value: "87/100", trend: "up", color: "text-purple-600" }
      ],
      insights: [
        "Market share growing faster than competitors",
        "Strong positioning in key segments",
        "Multiple expansion opportunities identified",
        "Technology adoption driving growth"
      ]
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "Growth+": return "bg-green-100 text-green-800";
      case "Strategic+": return "bg-purple-100 text-purple-800";
      case "Partner Only": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const currentData = mockAnalyticsData[selectedMetric as keyof typeof mockAnalyticsData];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <Eye className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">AI Analytics & Intelligence</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Harness the power of AI to gain deep insights into your business performance, 
              customer behavior, and market opportunities with real-time analytics and predictive intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Real-time Insights
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Predictive Analytics
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Market Intelligence
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Interactive Analytics Dashboard */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Live Analytics Dashboard</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Real-time business intelligence powered by AI analytics and machine learning.
            </p>
          </div>

          {/* Dashboard Controls */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-lg p-1 shadow-md">
              {Object.entries(mockAnalyticsData).map(([key, data]) => (
                <Button
                  key={key}
                  variant={selectedMetric === key ? "default" : "ghost"}
                  onClick={() => setSelectedMetric(key)}
                  className="mx-1"
                >
                  {data.title.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>

          {/* Live Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {currentData.metrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-600">{metric.label}</h3>
                    <TrendingUp className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-neutral-500">Live data</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                AI-Generated Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-neutral-700">{insight}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Services */}
        <div className="space-y-16">
          {analyticsServices.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-8">
              <div className="text-center">
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${category.color} text-white mb-4`}>
                  {category.icon}
                </div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">{category.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.services.map((service, serviceIndex) => (
                  <Card key={serviceIndex} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <Badge className={getTierBadgeColor(service.tier)} variant="secondary">
                          {service.tier}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-neutral-900">{service.title}</CardTitle>
                      <p className="text-neutral-600">{service.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-neutral-900">Key Metrics:</h4>
                        <ul className="space-y-2">
                          {service.metrics.map((metric, metricIndex) => (
                            <li key={metricIndex} className="flex items-center text-sm text-neutral-600">
                              <Target className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                              {metric}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-4" variant="outline">
                          View Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ROI Calculator */}
        <Card className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-6 text-green-600" />
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              AI Analytics ROI Calculator
            </h3>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Calculate the potential return on investment from implementing AI analytics in your business.
              Our customers typically see 200-400% ROI within 12 months.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">35%</div>
                <div className="text-sm text-neutral-600">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">50%</div>
                <div className="text-sm text-neutral-600">Faster Decision Making</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">25%</div>
                <div className="text-sm text-neutral-600">Revenue Increase</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                Calculate Your ROI
              </Button>
              <Link to="/ai-tools">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Try Analytics Tools
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="ghost" className="px-8 py-3">
                  Schedule Demo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAnalytics;