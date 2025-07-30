import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap, BarChart3, Shield, Cog, Database, Bell, FileText, TrendingUp, Users, Building, Workflow } from "lucide-react";
import { Link } from "wouter";

const AIAutomation = () => {
  const automationServices = [
    {
      category: "Sales & Revenue Automation",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "from-green-500 to-emerald-600",
      services: [
        {
          title: "AI Sales Forecasting",
          description: "Predict sales trends and revenue with machine learning models",
          features: ["Revenue predictions", "Seasonal analysis", "Market trend detection", "Performance alerts"],
          tier: "Growth+"
        },
        {
          title: "AI Revenue Optimization",
          description: "Optimize pricing and revenue streams using AI analytics",
          features: ["Dynamic pricing", "Revenue stream analysis", "Profit maximization", "Market positioning"],
          tier: "Strategic+"
        },
        {
          title: "AI Customer Retention",
          description: "Identify at-risk customers and automate retention strategies",
          features: ["Churn prediction", "Retention campaigns", "Customer scoring", "Lifecycle automation"],
          tier: "Growth+"
        }
      ]
    },
    {
      category: "Business Intelligence & Analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      color: "from-blue-500 to-indigo-600",
      services: [
        {
          title: "AI Competitor Analysis",
          description: "Monitor competitors and market positioning automatically",
          features: ["Competitive intelligence", "Market share analysis", "Pricing monitoring", "Strategy insights"],
          tier: "Growth+"
        },
        {
          title: "AI Market Research",
          description: "Automated market research and trend analysis",
          features: ["Market sizing", "Trend detection", "Consumer insights", "Opportunity identification"],
          tier: "Growth+"
        },
        {
          title: "AI Financial Modeling",
          description: "Advanced financial analysis and forecasting models",
          features: ["Cash flow predictions", "Investment analysis", "Risk modeling", "Performance metrics"],
          tier: "Strategic+"
        }
      ]
    },
    {
      category: "Operations & Workflow Automation",
      icon: <Workflow className="h-8 w-8" />,
      color: "from-purple-500 to-violet-600",
      services: [
        {
          title: "AI Workflow Automation",
          description: "Automate complex business processes with intelligent workflows",
          features: ["Process automation", "Task routing", "Decision trees", "Exception handling"],
          tier: "Growth+"
        },
        {
          title: "AI Workforce Optimization",
          description: "Optimize team performance and resource allocation",
          features: ["Resource planning", "Performance optimization", "Capacity management", "Skills matching"],
          tier: "Strategic+"
        },
        {
          title: "AI Quality Assurance",
          description: "Automated quality control and process monitoring",
          features: ["Quality scoring", "Process compliance", "Error detection", "Improvement suggestions"],
          tier: "Strategic+"
        }
      ]
    },
    {
      category: "Risk & Compliance Management",
      icon: <Shield className="h-8 w-8" />,
      color: "from-red-500 to-rose-600",
      services: [
        {
          title: "AI Risk Assessment",
          description: "Intelligent risk monitoring and mitigation strategies",
          features: ["Risk scoring", "Threat detection", "Mitigation plans", "Compliance tracking"],
          tier: "Strategic+"
        },
        {
          title: "AI Compliance Monitoring",
          description: "Automated compliance checking and reporting",
          features: ["Regulatory compliance", "Audit trails", "Policy enforcement", "Violation alerts"],
          tier: "Patron+"
        },
        {
          title: "AI Security Analysis",
          description: "Advanced security monitoring and threat detection",
          features: ["Security scanning", "Threat intelligence", "Incident response", "Vulnerability assessment"],
          tier: "Partner Only"
        }
      ]
    },
    {
      category: "Data & Infrastructure Automation",
      icon: <Database className="h-8 w-8" />,
      color: "from-cyan-500 to-teal-600",
      services: [
        {
          title: "AI Data Pipelines",
          description: "Automated data processing and analysis pipelines",
          features: ["Data ingestion", "ETL automation", "Real-time processing", "Data validation"],
          tier: "Strategic+"
        },
        {
          title: "AI System Optimization",
          description: "Optimize system performance and resource usage",
          features: ["Performance tuning", "Resource optimization", "Capacity planning", "Cost reduction"],
          tier: "Partner Only"
        },
        {
          title: "AI Backup Automation",
          description: "Intelligent backup and disaster recovery systems",
          features: ["Automated backups", "Recovery testing", "Data integrity checks", "Disaster planning"],
          tier: "Partner Only"
        }
      ]
    },
    {
      category: "Communication & Reporting",
      icon: <Bell className="h-8 w-8" />,
      color: "from-orange-500 to-amber-600",
      services: [
        {
          title: "AI Notification Systems",
          description: "Smart notification and alert management",
          features: ["Smart alerts", "Priority routing", "Escalation rules", "Multi-channel delivery"],
          tier: "Growth+"
        },
        {
          title: "AI Report Generation",
          description: "Automated business reporting and insights",
          features: ["Executive dashboards", "Automated reports", "Data visualization", "Insight summaries"],
          tier: "Growth+"
        },
        {
          title: "AI Performance Monitoring",
          description: "Continuous performance tracking and optimization",
          features: ["KPI monitoring", "Performance alerts", "Trend analysis", "Benchmarking"],
          tier: "Patron+"
        }
      ]
    }
  ];

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case "Growth+": return "bg-green-100 text-green-800";
      case "Strategic+": return "bg-purple-100 text-purple-800";
      case "Patron+": return "bg-orange-100 text-orange-800";
      case "Partner Only": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <Bot className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">AI Business Automation</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Transform your business with intelligent automation services that streamline operations, 
              enhance decision-making, and drive sustainable growth.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                45+ Automation Services
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Real-time Intelligence
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Enterprise-grade Security
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Service Categories */}
        <div className="space-y-16">
          {automationServices.map((category, categoryIndex) => (
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
                          <Zap className="h-5 w-5" />
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
                        <h4 className="font-semibold text-neutral-900">Key Features:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-neutral-600">
                              <Cog className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-4" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-12 text-center">
            <Bot className="h-16 w-16 mx-auto mb-6 text-blue-600" />
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              Ready to Automate Your Business?
            </h3>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses already using our AI automation services to increase efficiency, 
              reduce costs, and accelerate growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/membership-benefits">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                  View Membership Plans
                </Button>
              </Link>
              <Link to="/ai-tools">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Try AI Tools
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="ghost" className="px-8 py-3">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Process */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">
            Our AI Implementation Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Assessment",
                description: "We analyze your current processes and identify automation opportunities",
                icon: <BarChart3 className="h-6 w-6" />
              },
              {
                step: "2", 
                title: "Strategy",
                description: "Custom AI strategy designed for your specific business needs and goals",
                icon: <Users className="h-6 w-6" />
              },
              {
                step: "3",
                title: "Implementation",
                description: "Seamless integration of AI automation tools into your existing systems",
                icon: <Cog className="h-6 w-6" />
              },
              {
                step: "4",
                title: "Optimization",
                description: "Continuous monitoring and optimization for maximum efficiency and ROI",
                icon: <TrendingUp className="h-6 w-6" />
              }
            ].map((step, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">Step {step.step}</div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAutomation;