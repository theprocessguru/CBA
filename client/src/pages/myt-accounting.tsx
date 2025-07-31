import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Scan, 
  FileText, 
  Calculator, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Bot, 
  Clock, 
  Building,
  User,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link } from "wouter";

export default function MyTAccounting() {
  const [annualIncome, setAnnualIncome] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const checkIncomeThreshold = () => {
    const income = parseFloat(annualIncome);
    if (income >= 50000) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI Document Scanning",
      description: "Advanced AI technology automatically scans and extracts data from all your documents - receipts, invoices, bank statements, and more."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "No Bookkeeper Needed",
      description: "Our AI eliminates the need for traditional bookkeeping services, saving you thousands of pounds annually."
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "HMRC Compliant",
      description: "Automatically generates HMRC-compliant records and reports, ensuring you meet all tax obligations."
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      title: "Real-time Analytics",
      description: "Instant insights into your financial health with automated profit & loss, cash flow, and tax calculations."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-level Security",
      description: "Your financial data is protected with enterprise-grade encryption and security protocols."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "24/7 Processing",
      description: "Our AI works around the clock, processing documents and updating your accounts in real-time."
    }
  ];

  const pricingTiers = [
    {
      name: "Basic",
      price: "£5",
      originalPrice: "£10",
      discount: "50% OFF for CBA Members",
      description: "Essential accounting for micro businesses",
      features: [
        "AI document scanning (up to 50 docs/month)",
        "Basic expense tracking",
        "HMRC compliance reports",
        "Mobile app access",
        "Email support"
      ]
    },
    {
      name: "Starter",
      price: "£19",
      originalPrice: "£29",
      discount: "35% OFF",
      description: "Perfect for sole traders and small businesses",
      features: [
        "AI document scanning (up to 100 docs/month)",
        "Basic bookkeeping automation",
        "HMRC compliance checks",
        "Mobile app access",
        "Email support"
      ]
    },
    {
      name: "Growth",
      price: "£39",
      originalPrice: "£59",
      discount: "35% OFF",
      description: "For growing businesses with higher volume",
      features: [
        "AI document scanning (up to 500 docs/month)",
        "Advanced bookkeeping automation",
        "Real-time financial dashboards",
        "VAT management",
        "Priority support",
        "Bank feed integration"
      ],
      popular: true
    },
    {
      name: "Professional",
      price: "£79",
      originalPrice: "£119",
      discount: "35% OFF",
      description: "For established businesses and Ltd companies",
      features: [
        "Unlimited AI document scanning",
        "Complete bookkeeping automation",
        "Advanced analytics & forecasting",
        "Multi-entity management",
        "Dedicated account manager",
        "API access",
        "Custom reporting"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            MyT Accounting & Bookkeeping
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Revolutionary AI-powered accounting software that scans all your documents, 
            eliminating the need for traditional bookkeepers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Income Warning Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                HMRC Filing Requirements Check
              </CardTitle>
              <CardDescription>
                Check if you need HMRC-compliant accounting software for your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="income">Annual Income (£)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="50000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    onBlur={checkIncomeThreshold}
                  />
                </div>
                <div>
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sole-trader">Sole Trader</SelectItem>
                      <SelectItem value="ltd-company">Ltd Company</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={checkIncomeThreshold} className="w-full">
                Check Requirements
              </Button>

              {showWarning && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-800">HMRC Filing Required</AlertTitle>
                  <AlertDescription className="text-amber-700">
                    <p className="mb-2">
                      <strong>Important:</strong> With an annual income over £50,000, you are required to use 
                      HMRC-compliant accounting software for your tax filings.
                    </p>
                    <p className="mb-3">
                      MyT Accounting Software is fully HMRC-approved and will ensure you meet all 
                      legal requirements while saving you money on bookkeeping costs.
                    </p>
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">MyT Software is HMRC Making Tax Digital compliant</span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose MyT Accounting?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of accounting with AI-powered automation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              CBA Member Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Exclusive discounts for Croydon Business Association members - Starting from just £5 + VAT per month
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="mb-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {tier.discount}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-gray-500 line-through">{tier.originalPrice}</span>
                    <span className="text-sm text-gray-500">/month + VAT</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={tier.popular ? "default" : "outline"}>
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Revolutionize Your Accounting?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who have eliminated bookkeeping costs with MyT's AI technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Your Free Trial
            </Button>
            <Link href="/membership-benefits">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View All CBA Benefits
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}