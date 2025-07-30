import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Brain, Zap, Rocket, Settings, Users, BarChart3, Shield } from "lucide-react";
import { Link } from "wouter";

const AIServices = () => {
  const aiServiceCategories = [
    {
      title: "AI Training & Education",
      icon: <Brain className="h-6 w-6" />,
      description: "Comprehensive AI education programs for businesses of all sizes",
      services: [
        "AI Fundamentals Workshops",
        "Business AI Strategy Sessions", 
        "Hands-on AI Tool Training",
        "Industry-Specific AI Applications",
        "AI Ethics & Compliance Training"
      ],
      tiers: ["All Tiers"]
    },
    {
      title: "AI Automation Solutions",
      icon: <Zap className="h-6 w-6" />,
      description: "Streamline business processes with intelligent automation",
      services: [
        "Process Automation Assessment",
        "Workflow Optimization",
        "Document Processing Automation",
        "Customer Service Automation",
        "Data Entry & Processing Automation"
      ],
      tiers: ["Growth+"]
    },
    {
      title: "AI Chatbot Development",
      icon: <Bot className="h-6 w-6" />,
      description: "Custom chatbot solutions for enhanced customer engagement",
      services: [
        "Custom Chatbot Design & Development",
        "Multi-platform Integration",
        "Natural Language Processing Setup",
        "Customer Support Automation",
        "Lead Generation Chatbots"
      ],
      tiers: ["Growth+"]
    },
    {
      title: "AI Content & Marketing",
      icon: <Rocket className="h-6 w-6" />,
      description: "AI-powered content creation and marketing optimization",
      services: [
        "AI Content Generation Tools",
        "Social Media Automation",
        "SEO Optimization with AI",
        "Personalized Marketing Campaigns",
        "Brand Voice AI Training"
      ],
      tiers: ["Strategic+"]
    },
    {
      title: "Custom AI Solutions",
      icon: <Settings className="h-6 w-6" />,
      description: "Tailored AI applications for unique business needs",
      services: [
        "Custom AI Model Development",
        "Data Analytics & Insights",
        "Predictive Analytics Implementation",
        "AI Integration with Existing Systems",
        "Performance Monitoring & Optimization"
      ],
      tiers: ["Strategic+"]
    },
    {
      title: "AI Strategy & Consulting",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "Strategic AI guidance for long-term business growth",
      services: [
        "AI Readiness Assessment",
        "AI Implementation Roadmap",
        "ROI Analysis & Projections",
        "AI Vendor Selection & Partnerships",
        "AI Governance & Risk Management"
      ],
      tiers: ["Patron+"]
    },
    {
      title: "Enterprise AI Support",
      icon: <Shield className="h-6 w-6" />,
      description: "Dedicated AI support for enterprise-level implementations",
      services: [
        "Dedicated AI Support Specialist",
        "24/7 AI System Monitoring",
        "Advanced ML Model Training",
        "AI Infrastructure Management",
        "Enterprise AI Security Solutions"
      ],
      tiers: ["Partner Only"]
    },
    {
      title: "AI Community & Networking",
      icon: <Users className="h-6 w-6" />,
      description: "Connect with AI experts and like-minded businesses",
      services: [
        "AI Business Network Access",
        "Monthly AI Meetups & Events",
        "AI Expert Speaker Sessions",
        "Peer-to-Peer AI Learning Groups",
        "AI Vendor Partnership Access"
      ],
      tiers: ["All Tiers"]
    }
  ];

  const getTierColor = (tiers: string[]) => {
    const tierText = tiers[0];
    if (tierText === "All Tiers") return "bg-blue-100 text-blue-800";
    if (tierText === "Growth+") return "bg-green-100 text-green-800";
    if (tierText === "Strategic+") return "bg-purple-100 text-purple-800";
    if (tierText === "Patron+") return "bg-orange-100 text-orange-800";
    if (tierText === "Partner Only") return "bg-amber-100 text-amber-800";
    return "bg-neutral-100 text-neutral-800";
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Bot className="h-16 w-16 mb-4" />
            </div>
            <h1 className="text-5xl font-bold">
              AI Support & Services
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Empowering Croydon businesses with cutting-edge AI solutions, training, and support 
              to drive innovation and competitive advantage in the digital age.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/membership-benefits">
                <Button size="lg" variant="secondary">
                  View Membership Tiers
                </Button>
              </Link>
              <Link to="/ai-tools">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Access AI Tools
                </Button>
              </Link>
              <Link to="/ai-enterprise">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Enterprise Solutions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* AI Services Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Comprehensive AI Service Categories
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            From basic AI training to enterprise-level custom solutions, we provide AI services 
            tailored to every business stage and membership tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {aiServiceCategories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <Badge className={getTierColor(category.tiers)} variant="secondary">
                      {category.tiers[0]}
                    </Badge>
                  </div>
                </div>
                <p className="text-neutral-600">{category.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.services.map((service, serviceIndex) => (
                    <li key={serviceIndex} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-neutral-700">{service}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                Ready to Transform Your Business with AI?
              </h3>
              <p className="text-lg text-neutral-600 mb-6 max-w-2xl mx-auto">
                Join the Croydon Business Association and unlock access to comprehensive AI support 
                and services designed to accelerate your business growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/membership-benefits">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Explore Membership Plans
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline">
                    Learn About CBA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIServices;