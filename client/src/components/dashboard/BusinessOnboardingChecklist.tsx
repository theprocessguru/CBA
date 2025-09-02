import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { Business, Product } from "@shared/schema";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Star,
  Users,
  Building2,
  Package,
  QrCode,
  Calendar,
  Trophy,
  Target,
  Gift,
  ArrowRight,
  Lightbulb,
  Shield,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  isNext: boolean;
  actionText: string;
  actionLink: string;
  icon: React.ReactNode;
  estimatedTime: string;
  benefits: string[];
  tips: string[];
}

const BusinessOnboardingChecklist = () => {
  const { user } = useAuth();
  const [showCompleted, setShowCompleted] = useState(false);

  const { data: business } = useQuery<Business>({
    queryKey: ['/api/my/business'],
    enabled: !!user,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/my/products'],
    enabled: !!user,
  });

  // Calculate completion status for each step
  const getOnboardingSteps = (): OnboardingStep[] => {
    const hasBasicInfo = business?.name && business.name.length > 0;
    const hasDescription = business?.description && business.description.length >= 10;
    const hasContactInfo = business?.phone || business?.email || business?.website;
    const hasLocation = business?.address && business?.city;
    const hasLogo = business?.logo && business.logo.length > 0;
    const hasProducts = products && products.length > 0;
    const hasQrHandle = user?.qrHandle && user.qrHandle.length > 0;
    const hasMultipleProducts = products && products.length >= 3;

    const steps = [
      {
        id: "basic-info",
        title: "Set Up Business Information",
        description: "Add your business name and basic details",
        completed: hasBasicInfo,
        isNext: !hasBasicInfo,
        actionText: "Add Business Info",
        actionLink: "/dashboard/business-profile",
        icon: <Building2 className="h-5 w-5" />,
        estimatedTime: "2 minutes",
        benefits: [
          "Appear in business directory searches",
          "Build credibility with customers",
          "Enable business discovery"
        ],
        tips: [
          "Use your official business name",
          "Include your industry/sector",
          "Make sure contact details are current"
        ]
      },
      {
        id: "business-description",
        title: "Write Your Business Description",
        description: "Tell potential customers what makes your business special",
        completed: hasDescription,
        isNext: hasBasicInfo && !hasDescription,
        actionText: "Add Description",
        actionLink: "/dashboard/business-profile",
        icon: <Users className="h-5 w-5" />,
        estimatedTime: "5 minutes",
        benefits: [
          "3x higher customer inquiries",
          "Better search visibility",
          "Clear value proposition"
        ],
        tips: [
          "Focus on what problems you solve",
          "Mention your unique selling points",
          "Keep it conversational and engaging",
          "Include key services or specialties"
        ]
      },
      {
        id: "contact-location",
        title: "Add Contact & Location Details",
        description: "Help customers find and contact you",
        completed: hasContactInfo && hasLocation,
        isNext: hasDescription && (!hasContactInfo || !hasLocation),
        actionText: "Add Contact Info",
        actionLink: "/dashboard/business-profile",
        icon: <Target className="h-5 w-5" />,
        estimatedTime: "3 minutes",
        benefits: [
          "Enable direct customer contact",
          "Local search visibility",
          "Professional appearance"
        ],
        tips: [
          "Add multiple contact methods",
          "Include your best phone number",
          "Website should be professional",
          "Address helps with local SEO"
        ]
      },
      {
        id: "business-logo",
        title: "Upload Your Business Logo",
        description: "Professional branding for instant recognition",
        completed: hasLogo,
        isNext: hasContactInfo && hasLocation && !hasLogo,
        actionText: "Upload Logo",
        actionLink: "/dashboard/business-profile",
        icon: <Star className="h-5 w-5" />,
        estimatedTime: "1 minute",
        benefits: [
          "Professional brand appearance",
          "Instant recognition",
          "Stand out in listings"
        ],
        tips: [
          "Use high-quality image (PNG preferred)",
          "Square format works best",
          "Keep file size under 2MB",
          "Ensure logo is clear and readable"
        ]
      },
      {
        id: "first-product",
        title: "Add Your First Product/Service",
        description: "Showcase what you offer to attract customers",
        completed: hasProducts,
        isNext: hasLogo && !hasProducts,
        actionText: "Add Products/Services",
        actionLink: "/dashboard/products-services",
        icon: <Package className="h-5 w-5" />,
        estimatedTime: "10 minutes",
        benefits: [
          "Generate sales inquiries",
          "Showcase your offerings",
          "Appear in product searches"
        ],
        tips: [
          "Start with your most popular service",
          "Include clear descriptions",
          "Add pricing if appropriate",
          "Use appealing product images"
        ]
      },
      {
        id: "qr-customization",
        title: "Personalize Your QR Code",
        description: "Professional networking identity for events",
        completed: hasQrHandle,
        isNext: hasProducts && !hasQrHandle,
        actionText: "Customize QR Code",
        actionLink: "/dashboard/profile",
        icon: <QrCode className="h-5 w-5" />,
        estimatedTime: "2 minutes",
        benefits: [
          "Professional networking appearance",
          "Easy to remember identifier",
          "Enhanced event experience"
        ],
        tips: [
          "Use your business name or initials",
          "Keep it short and memorable",
          "Avoid special characters",
          "Consider including CBA or year"
        ]
      },
      {
        id: "expand-catalog",
        title: "Add More Products/Services",
        description: "Build a comprehensive catalog of your offerings",
        completed: hasMultipleProducts,
        isNext: hasQrHandle && !hasMultipleProducts,
        actionText: "Add More Products",
        actionLink: "/dashboard/products-services",
        icon: <TrendingUp className="h-5 w-5" />,
        estimatedTime: "15 minutes",
        benefits: [
          "Maximize sales opportunities",
          "Complete service overview",
          "Better customer discovery"
        ],
        tips: [
          "Add 3-5 key products/services",
          "Organize by categories",
          "Include seasonal offerings",
          "Update pricing regularly"
        ]
      }
    ];

    return steps;
  };

  const steps = getOnboardingSteps();
  const completedSteps = steps.filter(step => step.completed);
  const nextStep = steps.find(step => step.isNext);
  const remainingSteps = steps.filter(step => !step.completed);
  const completionPercentage = Math.round((completedSteps.length / steps.length) * 100);

  // Show congratulations if fully complete
  if (completionPercentage === 100) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Onboarding Complete! 🎉</h3>
              <p className="text-green-700">
                Your business profile is fully set up and ready to attract customers.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Link href="/business-directory">
                <Button className="bg-green-600 hover:bg-green-700">
                  View Your Listing
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="outline">
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Business Setup Checklist
            </CardTitle>
            <CardDescription>
              Complete these steps to maximize your business visibility and opportunities
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {completedSteps.length} of {steps.length} complete
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-3" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completionPercentage}% complete</span>
            <span>Est. {Math.max(5, remainingSteps.reduce((sum, step) => sum + parseInt(step.estimatedTime), 0))} minutes remaining</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Next Step Highlight */}
        {nextStep && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Next step:</strong> {nextStep.title} ({nextStep.estimatedTime})
                </div>
                <Link href={nextStep.actionLink}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    {nextStep.actionText}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Setup Progress</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? "Hide completed" : "Show completed"}
            </Button>
          </div>

          {steps
            .filter(step => showCompleted || !step.completed || step.isNext)
            .map((step, index) => (
              <div key={step.id} className="space-y-3">
                <div className={`p-4 rounded-lg border ${
                  step.completed 
                    ? "border-green-200 bg-green-50" 
                    : step.isNext 
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? "bg-green-100 text-green-600" 
                          : step.isNext 
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                      }`}>
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className={`font-medium ${
                            step.completed ? "text-green-900" : 
                            step.isNext ? "text-blue-900" : "text-gray-700"
                          }`}>
                            {step.title}
                          </h5>
                          {step.isNext && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Next
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          step.completed ? "text-green-700" : 
                          step.isNext ? "text-blue-700" : "text-gray-600"
                        }`}>
                          {step.description}
                        </p>
                        
                        {!step.completed && (step.isNext || showCompleted) && (
                          <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <h6 className="font-medium text-gray-900 mb-1">Benefits:</h6>
                                <ul className="space-y-1">
                                  {step.benefits.map((benefit, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-600">
                                      <Shield className="h-3 w-3 text-green-500" />
                                      {benefit}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h6 className="font-medium text-gray-900 mb-1">Tips:</h6>
                                <ul className="space-y-1">
                                  {step.tips.slice(0, 2).map((tip, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-600">
                                      <Gift className="h-3 w-3 text-amber-500" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!step.completed && (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">{step.estimatedTime}</span>
                        <Link href={step.actionLink}>
                          <Button size="sm" variant={step.isNext ? "default" : "outline"}>
                            {step.actionText}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="flex justify-center">
                    <div className="h-6 w-px bg-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Motivation Section */}
        <Separator />
        <div className="text-center space-y-3">
          <h4 className="font-medium text-gray-900">Why Complete Your Profile?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="font-medium">3x More Visibility</p>
              <p className="text-gray-600">Complete profiles get significantly more customer views</p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <p className="font-medium">Event Benefits</p>
              <p className="text-gray-600">Access to exclusive networking and business events</p>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-4 w-4 text-amber-600" />
              </div>
              <p className="font-medium">Premium Features</p>
              <p className="text-gray-600">Unlock analytics, featured listings, and more</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessOnboardingChecklist;