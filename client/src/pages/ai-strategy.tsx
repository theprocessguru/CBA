import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, TrendingUp, Users, Lightbulb, CheckCircle, ArrowRight, Building2 } from "lucide-react";
import { Link } from "wouter";

const AIStrategy = () => {
  const strategyServices = [
    {
      title: "AI Readiness Assessment",
      description: "Comprehensive evaluation of your business's AI potential and current capabilities",
      features: [
        "Current state analysis",
        "AI opportunity identification", 
        "Technology gap assessment",
        "ROI potential evaluation",
        "Implementation roadmap"
      ],
      tier: "Growth+",
      duration: "2-3 weeks",
      deliverables: "Assessment report + Strategic recommendations"
    },
    {
      title: "AI Transformation Strategy",
      description: "Custom AI strategy to transform your business operations and competitive position",
      features: [
        "Vision and goal alignment",
        "AI use case prioritization",
        "Technology stack recommendations",
        "Change management plan",
        "Success metrics definition"
      ],
      tier: "Strategic+",
      duration: "4-6 weeks", 
      deliverables: "Strategic plan + Implementation timeline"
    },
    {
      title: "AI Implementation Consulting",
      description: "End-to-end guidance for implementing AI solutions across your organization",
      features: [
        "Vendor selection support",
        "Technical architecture design",
        "Integration planning",
        "Team training programs",
        "Performance monitoring setup"
      ],
      tier: "Strategic+",
      duration: "8-12 weeks",
      deliverables: "Implementation guide + Training materials"
    },
    {
      title: "AI Governance & Ethics",
      description: "Establish responsible AI practices and governance frameworks",
      features: [
        "Ethics framework development",
        "Risk management protocols",
        "Compliance guidelines",
        "Data governance policies",
        "Audit and monitoring systems"
      ],
      tier: "Patron+",
      duration: "6-8 weeks",
      deliverables: "Governance framework + Policy documentation"
    },
    {
      title: "AI Center of Excellence",
      description: "Build internal AI capabilities and innovation centers",
      features: [
        "Team structure design",
        "Skill development programs",
        "Innovation processes",
        "Knowledge sharing platforms",
        "Continuous improvement frameworks"
      ],
      tier: "Partner Only",
      duration: "3-6 months",
      deliverables: "Center setup + Operating procedures"
    },
    {
      title: "AI ROI Optimization",
      description: "Maximize return on investment from your AI initiatives",
      features: [
        "Performance measurement",
        "Cost optimization analysis",
        "Value realization tracking",
        "Continuous improvement",
        "Strategic adjustment recommendations"
      ],
      tier: "Partner Only",
      duration: "Ongoing",
      deliverables: "Monthly reports + Optimization recommendations"
    }
  ];

  const industryFocus = [
    {
      industry: "Manufacturing",
      icon: <Building2 className="h-8 w-8" />,
      aiApplications: [
        "Predictive maintenance",
        "Quality control automation",
        "Supply chain optimization",
        "Production planning"
      ]
    },
    {
      industry: "Retail & E-commerce",
      icon: <TrendingUp className="h-8 w-8" />,
      aiApplications: [
        "Personalized recommendations",
        "Inventory optimization",
        "Dynamic pricing",
        "Customer service automation"
      ]
    },
    {
      industry: "Healthcare",
      icon: <Users className="h-8 w-8" />,
      aiApplications: [
        "Diagnostic assistance",
        "Treatment optimization",
        "Patient monitoring",
        "Operational efficiency"
      ]
    },
    {
      industry: "Financial Services",
      icon: <Target className="h-8 w-8" />,
      aiApplications: [
        "Risk assessment",
        "Fraud detection",
        "Algorithmic trading",
        "Customer insights"
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold">AI Strategy & Consulting</h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Transform your business with expert AI strategy consulting. From assessment to implementation, 
              we help you harness the full potential of artificial intelligence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Expert AI Consultants
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Proven Methodologies
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white px-4 py-2">
                Industry-Specific Solutions
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Strategy Services */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">AI Strategy Services</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Comprehensive AI consulting services tailored to your business needs and maturity level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {strategyServices.map((service, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <Badge className={getTierBadgeColor(service.tier)} variant="secondary">
                      {service.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-neutral-900">{service.title}</CardTitle>
                  <p className="text-neutral-600">{service.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Key Features:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-neutral-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Duration:</span>
                        <span className="font-medium">{service.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Deliverables:</span>
                        <span className="font-medium text-right">{service.deliverables}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4" variant="outline">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Industry Focus */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Industry-Specific AI Solutions</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We specialize in AI applications across diverse industries, understanding unique challenges and opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryFocus.map((industry, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    {industry.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">{industry.industry}</h3>
                  <ul className="space-y-2">
                    {industry.aiApplications.map((application, appIndex) => (
                      <li key={appIndex} className="text-sm text-neutral-600">
                        {application}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Process Overview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">Our Strategic Approach</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              A proven methodology that ensures successful AI transformation and measurable business impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              {
                step: "1",
                title: "Discovery",
                description: "Understanding your business, challenges, and AI opportunities",
                icon: <Target className="h-6 w-6" />
              },
              {
                step: "2",
                title: "Assessment",
                description: "Evaluating current capabilities and identifying gaps",
                icon: <CheckCircle className="h-6 w-6" />
              },
              {
                step: "3",
                title: "Strategy",
                description: "Developing comprehensive AI strategy and roadmap",
                icon: <Brain className="h-6 w-6" />
              },
              {
                step: "4",
                title: "Implementation",
                description: "Executing AI initiatives with expert guidance",
                icon: <Building2 className="h-6 w-6" />
              },
              {
                step: "5",
                title: "Optimization",
                description: "Continuous improvement and value maximization",
                icon: <TrendingUp className="h-6 w-6" />
              }
            ].map((phase, index) => (
              <div key={index} className="text-center">
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  {phase.icon}
                </div>
                <div className="text-2xl font-bold text-indigo-600 mb-2">{phase.step}</div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{phase.title}</h3>
                <p className="text-sm text-neutral-600">{phase.description}</p>
                {index < 4 && (
                  <ArrowRight className="h-6 w-6 text-neutral-400 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-6 text-indigo-600" />
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              Ready to Transform Your Business with AI?
            </h3>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Our AI strategy experts are ready to help you unlock the transformative power of artificial intelligence 
              for your business. Let's discuss your AI journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3">
                  Schedule Strategy Consultation
                </Button>
              </Link>
              <Link to="/membership-benefits">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  View Strategy Packages
                </Button>
              </Link>
              <Link to="/ai-services">
                <Button size="lg" variant="ghost" className="px-8 py-3">
                  Explore AI Services
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIStrategy;