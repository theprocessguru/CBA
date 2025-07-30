import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, Cpu, Zap, Users, Settings, BarChart3, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const AIEnterprise = () => {
  const enterpriseFeatures = [
    {
      title: "Dedicated AI Infrastructure",
      description: "Private AI models and computing resources exclusively for your organization",
      icon: <Cpu className="h-8 w-8" />,
      features: [
        "Private cloud deployment",
        "Custom model training",
        "Dedicated GPU resources",
        "99.9% uptime guarantee",
        "Scalable infrastructure"
      ],
      tier: "Partner Exclusive"
    },
    {
      title: "Enterprise Security & Compliance",
      description: "Bank-grade security with full compliance management",
      icon: <Shield className="h-8 w-8" />,
      features: [
        "SOC 2 Type II certified",
        "GDPR compliance",
        "Data residency controls",
        "Advanced encryption",
        "Security auditing"
      ],
      tier: "Partner Exclusive"
    },
    {
      title: "AI Governance Platform",
      description: "Complete oversight and control of all AI implementations",
      icon: <Settings className="h-8 w-8" />,
      features: [
        "AI policy management",
        "Ethics framework",
        "Risk assessment tools",
        "Performance monitoring",
        "Audit trails"
      ],
      tier: "Partner Exclusive"
    },
    {
      title: "Custom AI Development",
      description: "Bespoke AI solutions tailored to your unique business needs",
      icon: <Building2 className="h-8 w-8" />,
      features: [
        "Custom model development",
        "API integrations",
        "Workflow automation",
        "Legacy system integration",
        "Mobile AI applications"
      ],
      tier: "Partner Exclusive"
    },
    {
      title: "24/7 AI Operations Center",
      description: "Round-the-clock monitoring and support for mission-critical AI systems",
      icon: <BarChart3 className="h-8 w-8" />,
      features: [
        "Real-time monitoring",
        "Proactive maintenance",
        "Performance optimization",
        "Incident response",
        "Success metrics tracking"
      ],
      tier: "Partner Exclusive"
    },
    {
      title: "Enterprise AI Training",
      description: "Comprehensive AI education and certification programs",
      icon: <Users className="h-8 w-8" />,
      features: [
        "Executive AI workshops",
        "Technical team training",
        "Certification programs",
        "Best practices guides",
        "Change management"
      ],
      tier: "Partner Exclusive"
    }
  ];

  const industriesSolutions = [
    {
      industry: "Financial Services",
      solutions: [
        "Algorithmic trading systems",
        "Risk assessment and fraud detection",
        "Customer credit scoring",
        "Regulatory compliance automation",
        "Portfolio optimization"
      ],
      icon: <BarChart3 className="h-6 w-6" />,
      caseStudy: "45% reduction in fraud detection time"
    },
    {
      industry: "Healthcare & Life Sciences",
      solutions: [
        "Medical image analysis",
        "Drug discovery acceleration",
        "Patient outcome prediction",
        "Clinical trial optimization",
        "Healthcare operations automation"
      ],
      icon: <Users className="h-6 w-6" />,
      caseStudy: "30% improvement in diagnostic accuracy"
    },
    {
      industry: "Manufacturing & Industry 4.0",
      solutions: [
        "Predictive maintenance systems",
        "Quality control automation",
        "Supply chain optimization",
        "Production planning AI",
        "Safety monitoring systems"
      ],
      icon: <Settings className="h-6 w-6" />,
      caseStudy: "25% reduction in operational costs"
    },
    {
      industry: "Retail & E-commerce",
      solutions: [
        "Personalization engines",
        "Inventory optimization",
        "Dynamic pricing algorithms",
        "Customer service automation",
        "Demand forecasting"
      ],
      icon: <Zap className="h-6 w-6" />,
      caseStudy: "40% increase in customer engagement"
    }
  ];

  const implementationProcess = [
    {
      phase: "Discovery & Strategy",
      duration: "2-4 weeks",
      activities: [
        "AI readiness assessment",
        "Use case identification",
        "ROI analysis",
        "Strategic roadmap development",
        "Team preparation"
      ]
    },
    {
      phase: "Architecture & Design",
      duration: "4-6 weeks", 
      activities: [
        "System architecture design",
        "Security framework setup",
        "Data pipeline design",
        "Integration planning",
        "Performance benchmarks"
      ]
    },
    {
      phase: "Development & Integration",
      duration: "8-16 weeks",
      activities: [
        "Custom AI model development",
        "System integration",
        "Security implementation",
        "Performance optimization",
        "Testing and validation"
      ]
    },
    {
      phase: "Deployment & Optimization",
      duration: "4-8 weeks",
      activities: [
        "Production deployment",
        "Team training",
        "Performance monitoring",
        "Continuous optimization",
        "Success measurement"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 mb-4">
              Enterprise AI Solutions
            </Badge>
            <h1 className="text-5xl font-bold mb-6">
              Transform Your Enterprise with AI
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90 mb-8">
              Deploy enterprise-grade AI solutions with dedicated infrastructure, 
              advanced security, and comprehensive support. Built for organizations 
              that demand the highest levels of performance and compliance.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span>Bank-grade Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Cpu className="h-5 w-5 text-blue-400" />
                <span>Dedicated Infrastructure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>24/7 Expert Support</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-3">
                  Schedule Enterprise Consultation
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Download Enterprise Brochure
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Enterprise Features */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Enterprise AI Platform</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Comprehensive AI infrastructure and services designed for large-scale enterprise deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {feature.tier}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-neutral-900">{feature.title}</CardTitle>
                  <p className="text-neutral-600">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-neutral-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Industry Solutions */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Industry-Specific Solutions</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Proven AI solutions tailored for specific industries with measurable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {industriesSolutions.map((industry, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {industry.icon}
                    </div>
                    <CardTitle className="text-xl">{industry.industry}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                    {industry.caseStudy}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {industry.solutions.map((solution, solutionIndex) => (
                      <li key={solutionIndex} className="flex items-center text-sm text-neutral-600">
                        <ArrowRight className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                        {solution}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Implementation Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">Enterprise Implementation Process</h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Our proven methodology ensures successful enterprise AI deployment with minimal disruption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {implementationProcess.map((phase, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{phase.phase}</h3>
                  <p className="text-sm text-purple-600 font-medium mb-4">{phase.duration}</p>
                  <ul className="text-xs text-neutral-600 space-y-1 text-left">
                    {phase.activities.map((activity, activityIndex) => (
                      <li key={activityIndex} className="flex items-start">
                        <div className="h-1 w-1 bg-neutral-400 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {activity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ROI Calculator */}
        <Card className="mb-20 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              Calculate Your AI ROI
            </h3>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Enterprise AI implementations typically deliver 300-500% ROI within 18 months. 
              Let us calculate the potential impact for your organization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">45%</div>
                <div className="text-sm text-neutral-600">Average Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">3-5x</div>
                <div className="text-sm text-neutral-600">Productivity Improvement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">18</div>
                <div className="text-sm text-neutral-600">Months to Full ROI</div>
              </div>
            </div>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Get Custom ROI Analysis
            </Button>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-slate-900 to-purple-900 text-white">
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-6 text-purple-300" />
            <h3 className="text-3xl font-bold mb-4">
              Ready for Enterprise AI Transformation?
            </h3>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join leading enterprises who have transformed their operations with our AI platform. 
              Schedule a consultation with our enterprise AI specialists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-3">
                  Schedule Enterprise Demo
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Download Technical Specs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIEnterprise;