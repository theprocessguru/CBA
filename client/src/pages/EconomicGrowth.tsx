import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Handshake, 
  DollarSign, 
  BarChart3,
  Rocket,
  Calendar,
  CheckCircle,
  Clock,
  Zap
} from "lucide-react";

const ComingSoonPage = () => {
  const [selectedPhase, setSelectedPhase] = useState("phase1");

  const features = {
    myt: [
      {
        title: "Investment Matching Hub",
        description: "Connect local businesses with investors, angels, and grants through automated workflows",
        icon: <DollarSign className="h-8 w-8" />,
        benefits: ["Automated investor outreach", "Pipeline management", "Meeting coordination"],
        phase: 1
      },
      {
        title: "Skills Exchange Network", 
        description: "Business owners mentoring startups and peer-to-peer service marketplace",
        icon: <Users className="h-8 w-8" />,
        benefits: ["Service provider matching", "Skills assessment workflows", "Project tracking"],
        phase: 1
      },
      {
        title: "Local Procurement Marketplace",
        description: "Smart matching system connecting Croydon businesses as suppliers and buyers",
        icon: <Building2 className="h-8 w-8" />,
        benefits: ["Supplier verification", "Bid management", "Contract automation"],
        phase: 2
      },
      {
        title: "Business Intelligence Sharing",
        description: "Industry benchmarking and market insights for Croydon businesses",
        icon: <BarChart3 className="h-8 w-8" />,
        benefits: ["Weekly industry insights", "Automated surveys", "Performance benchmarking"],
        phase: 2
      }
    ],
    app: [
      {
        title: "Real-Time Economic Impact Tracking",
        description: "Live dashboard showing actual economic impact from CBA initiatives",
        icon: <TrendingUp className="h-8 w-8" />,
        benefits: ["Event attendance analytics", "Economic multiplier tracking", "ROI measurement"],
        phase: 1,
        status: "In Development"
      },
      {
        title: "Partnership Connection System",
        description: "Track and measure business-to-business connections and collaborations",
        icon: <Handshake className="h-8 w-8" />,
        benefits: ["Connection tracking", "Partnership analytics", "Networking insights"],
        phase: 1,
        status: "Active"
      },
      {
        title: "QR Code Integration",
        description: "Seamless event check-ins and attendance tracking for economic impact",
        icon: <Zap className="h-8 w-8" />,
        benefits: ["Instant check-ins", "Real-time capacity", "Attendance analytics"],
        phase: 1,
        status: "Active"
      }
    ]
  };

  const implementationPhases = [
    {
      phase: 1,
      title: "Foundation Phase",
      timeline: "Q1 2025",
      status: "In Progress",
      progress: 75,
      description: "Core infrastructure and immediate impact features",
      deliverables: [
        "Real-time economic impact dashboard (75% complete)",
        "MYT Automation integration setup",
        "Investment matching workflows",
        "Skills exchange platform launch"
      ]
    },
    {
      phase: 2,
      title: "Marketplace Phase", 
      timeline: "Q2 2025",
      status: "Planned",
      progress: 0,
      description: "Local procurement and business intelligence features",
      deliverables: [
        "Local procurement marketplace",
        "Supplier verification system",
        "Business intelligence automation",
        "Enhanced economic tracking"
      ]
    },
    {
      phase: 3,
      title: "Innovation Phase",
      timeline: "Q3 2025", 
      status: "Concept",
      progress: 0,
      description: "Advanced features and economic multipliers",
      deliverables: [
        "Local loyalty currency system",
        "Innovation challenge platform",
        "Advanced analytics dashboard",
        "Economic impact predictions"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="h-4 w-4 mr-2" />
            Coming Soon
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Economic Growth Engine
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Revolutionary features designed to drive mass economic growth for Croydon businesses 
          through AI-powered automation and real-time analytics
        </p>
      </div>

      {/* Implementation Timeline */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Implementation Roadmap</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {implementationPhases.map((phase) => (
            <Card key={phase.phase} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    Phase {phase.phase}
                    {phase.status === "In Progress" && <Clock className="h-4 w-4 ml-2 text-blue-500" />}
                    {phase.status === "Planned" && <Calendar className="h-4 w-4 ml-2 text-yellow-500" />}
                  </CardTitle>
                  <Badge variant={phase.status === "In Progress" ? "default" : "secondary"}>
                    {phase.status}
                  </Badge>
                </div>
                <CardDescription>{phase.title} - {phase.timeline}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{phase.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <Progress value={phase.progress} className="h-2" />
                </div>
                <ul className="space-y-2">
                  {phase.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Breakdown */}
      <Tabs defaultValue="myt" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="myt">MYT Automation Features</TabsTrigger>
          <TabsTrigger value="app">Custom App Features</TabsTrigger>
        </TabsList>

        <TabsContent value="myt" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Powered by MYT Automation</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Automated workflows and relationship management for scalable economic growth
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.myt.map((feature, idx) => (
              <Card key={idx} className="h-full">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <Badge variant="outline">Phase {feature.phase}</Badge>
                    </div>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIdx) => (
                      <li key={benefitIdx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="app" className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Custom App Integration</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time data tracking and specialized features for immediate impact measurement
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.app.map((feature, idx) => (
              <Card key={idx} className="h-full">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">Phase {feature.phase}</Badge>
                        {feature.status && (
                          <Badge variant={feature.status === "Active" ? "default" : "secondary"}>
                            {feature.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIdx) => (
                      <li key={benefitIdx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Expected Impact */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            Expected Economic Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">£5M+</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Additional Economic Activity</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">500+</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Business Partnerships Formed</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">200+</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Local Procurement Matches</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600">£2M+</div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Investment Capital Secured</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center mt-12">
        <h3 className="text-2xl font-bold mb-4">Want Early Access?</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Join our beta program and be the first to experience these revolutionary economic growth features
        </p>
        <Button size="lg" className="mr-4">
          Join Beta Program
        </Button>
        <Button variant="outline" size="lg">
          Get Notified
        </Button>
      </div>
    </div>
  );
};

export default ComingSoonPage;