import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { Business, Product } from "@shared/schema";
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  Package, 
  QrCode, 
  Building2,
  Star,
  Gift,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Target
} from "lucide-react";
import { Link } from "wouter";
import QRCodeCustomization from "./QRCodeCustomization";

interface ProfileCompletionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  weight: number;
  actionText: string;
  actionLink: string;
  icon: React.ReactNode;
  benefits: string[];
}

const BusinessProfileCompletion = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: business } = useQuery<Business>({
    queryKey: ['/api/my/business'],
    enabled: !!user,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/my/products'],
    enabled: !!user,
  });

  // Calculate completion items
  const getCompletionItems = (): ProfileCompletionItem[] => {
    const hasDescription = business?.description && business.description.length >= 10;
    const hasContactInfo = business?.phone || business?.email || business?.website;
    const hasLocation = business?.address && business?.city;
    const hasLogo = business?.logo && business.logo.length > 0;
    const hasProducts = products && products.length > 0;
    const hasQrHandle = user?.qrHandle && user.qrHandle.length > 0;

    return [
      {
        id: "business-bio",
        title: "Business Description",
        description: "Tell potential customers about your business",
        completed: hasDescription,
        weight: 30,
        actionText: "Add Description",
        actionLink: "/dashboard/business-profile",
        icon: <Building2 className="h-4 w-4" />,
        benefits: [
          "Appear higher in search results",
          "Build trust with potential customers",
          "Clearly communicate your value proposition"
        ]
      },
      {
        id: "contact-info",
        title: "Contact Information",
        description: "Phone, email, or website for customers to reach you",
        completed: hasContactInfo,
        weight: 20,
        actionText: "Add Contact Info",
        actionLink: "/dashboard/business-profile",
        icon: <User className="h-4 w-4" />,
        benefits: [
          "Enable direct customer inquiries",
          "Increase booking opportunities",
          "Professional appearance in directory"
        ]
      },
      {
        id: "location",
        title: "Business Location", 
        description: "Address and location details",
        completed: hasLocation,
        weight: 15,
        actionText: "Add Location",
        actionLink: "/dashboard/business-profile",
        icon: <Target className="h-4 w-4" />,
        benefits: [
          "Local customers can find you",
          "Appear in location-based searches",
          "Enable foot traffic and directions"
        ]
      },
      {
        id: "business-logo",
        title: "Business Logo",
        description: "Upload your logo for brand recognition",
        completed: hasLogo,
        weight: 10,
        actionText: "Upload Logo",
        actionLink: "/dashboard/business-profile", 
        icon: <Star className="h-4 w-4" />,
        benefits: [
          "Professional brand appearance",
          "Instant brand recognition",
          "Stand out in listings"
        ]
      },
      {
        id: "products-services",
        title: "Products & Services",
        description: "List what you offer to attract customers",
        completed: hasProducts,
        weight: 20,
        actionText: "Add Products/Services",
        actionLink: "/dashboard/products-services",
        icon: <Package className="h-4 w-4" />,
        benefits: [
          "Showcase your offerings",
          "Generate sales inquiries", 
          "Appear in product searches"
        ]
      },
      {
        id: "qr-customization",
        title: "Custom QR Handle",
        description: "Personalize your QR code for networking",
        completed: hasQrHandle,
        weight: 5,
        actionText: "Customize QR Code",
        actionLink: "/dashboard/qr-customization",
        icon: <QrCode className="h-4 w-4" />,
        benefits: [
          "Professional networking appearance",
          "Easy to remember QR identifier",
          "Personal branding at events"
        ]
      }
    ];
  };

  const completionItems = getCompletionItems();
  const completedItems = completionItems.filter(item => item.completed);
  const incompleteItems = completionItems.filter(item => !item.completed);
  
  const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = completedItems.reduce((sum, item) => sum + item.weight, 0);
  const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

  // Show different states based on completion
  if (completionPercentage === 100) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Profile Complete!</h3>
                <p className="text-sm text-green-700">Your business is ready to attract customers</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              100% Complete
            </Badge>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="/business-directory">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                View Your Listing
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button size="sm" variant="outline">
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-amber-900">Complete Your Business Profile</CardTitle>
              <p className="text-sm text-amber-700">
                {completionPercentage}% complete • {incompleteItems.length} items remaining
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {completionPercentage}%
          </Badge>
        </div>
        <Progress value={completionPercentage} className="h-2 bg-amber-100" />
      </CardHeader>

      <CardContent className="pt-0">
        {completionPercentage < 50 && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Boost your visibility!</strong> Businesses with complete profiles get 3x more customer inquiries.
            </AlertDescription>
          </Alert>
        )}

        {/* Priority incomplete items */}
        <div className="space-y-3 mb-4">
          {incompleteItems.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <Link href={item.actionLink}>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  {item.actionText}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Show all items in collapsible */}
        {incompleteItems.length > 2 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-amber-700 hover:text-amber-800">
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show fewer items
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show {incompleteItems.length - 2} more items
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {incompleteItems.slice(2).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <Link href={item.actionLink}>
                    <Button size="sm" variant="outline">
                      {item.actionText}
                    </Button>
                  </Link>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* QR Code Quick Setup */}
        {incompleteItems.find(item => item.id === "qr-customization") && (
          <div className="mt-4">
            <QRCodeCustomization showFull={false} />
          </div>
        )}

        {/* Benefits highlight */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-4 w-4 text-blue-600" />
            <p className="font-medium text-blue-900">Benefits of completing your profile:</p>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 3x higher visibility in business directory</li>
            <li>• Eligible for featured listing opportunities</li>
            <li>• Professional QR code for networking events</li>
            <li>• Access to detailed analytics and insights</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileCompletion;