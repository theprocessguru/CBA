import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";

interface UserLimits {
  businessListings: number;
  productListings: number;
  offerListings: number;
  imageUploads: number;
  eventBookingsPerMonth: number;
  referralsPerMonth: number;
  newsletterSubscribers: number;
  socialMediaPosts: number;
}

interface LimitsDashboard {
  membershipTier: string;
  limits: UserLimits;
  usage: UserLimits;
  percentageUsed: Record<keyof UserLimits, number>;
  warningsNeeded: Array<{
    limitType: keyof UserLimits;
    percentageUsed: number;
    message: string;
  }>;
}

interface LimitsWidgetProps {
  compact?: boolean;
}

const LimitsWidget = ({ compact = false }: LimitsWidgetProps) => {
  const { data: dashboard, isLoading, error } = useQuery<LimitsDashboard>({
    queryKey: ['/api/my/limits'],
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading limits...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Failed to load limits</div>
        </CardContent>
      </Card>
    );
  }

  const getLimitLabel = (key: keyof UserLimits): string => {
    const labels: Record<keyof UserLimits, string> = {
      businessListings: "Business Listings",
      productListings: "Product Listings",
      offerListings: "Special Offers",
      imageUploads: "Image Uploads",
      eventBookingsPerMonth: "Event Bookings/Month",
      referralsPerMonth: "Referrals/Month",
      newsletterSubscribers: "Newsletter Subscribers",
      socialMediaPosts: "Social Media Posts/Month"
    };
    return labels[key];
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const mainLimits: (keyof UserLimits)[] = [
    'businessListings',
    'productListings', 
    'offerListings',
    'imageUploads'
  ];

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Crown className="h-4 w-4" />
            {dashboard.membershipTier} Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboard.warningsNeeded.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {dashboard.warningsNeeded.length} limit{dashboard.warningsNeeded.length > 1 ? 's' : ''} need attention
              </AlertDescription>
            </Alert>
          )}
          
          {mainLimits.slice(0, 2).map((limitType) => (
            <div key={limitType} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{getLimitLabel(limitType)}</span>
                <span>{dashboard.usage[limitType]}/{dashboard.limits[limitType]}</span>
              </div>
              <Progress 
                value={dashboard.percentageUsed[limitType]} 
                className="h-2"
              />
            </div>
          ))}
          
          <Link href="/dashboard/membership-management">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View All Limits
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Membership Limits - {dashboard.membershipTier}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboard.warningsNeeded.length > 0 && (
            <div className="space-y-2">
              {dashboard.warningsNeeded.map((warning, index) => (
                <Alert key={index} variant={warning.percentageUsed >= 100 ? "destructive" : "default"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainLimits.map((limitType) => (
              <div key={limitType} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {getLimitLabel(limitType)}
                  </span>
                  <Badge variant={dashboard.percentageUsed[limitType] >= 100 ? "destructive" : "secondary"}>
                    {dashboard.usage[limitType]} / {dashboard.limits[limitType]}
                  </Badge>
                </div>
                <Progress 
                  value={dashboard.percentageUsed[limitType]} 
                  className="h-3"
                />
                <div className="text-xs text-muted-foreground">
                  {dashboard.percentageUsed[limitType]}% used
                </div>
              </div>
            ))}
          </div>

          {dashboard.warningsNeeded.length > 0 && (
            <div className="pt-4 border-t">
              <Button asChild className="w-full">
                <Link href="/membership/upgrade">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Upgrade Membership
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Monthly Activity Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {(['eventBookingsPerMonth', 'referralsPerMonth'] as const).map((limitType) => (
              <div key={limitType} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {getLimitLabel(limitType)}
                  </span>
                  <Badge variant="secondary">
                    {dashboard.usage[limitType]} / {dashboard.limits[limitType]}
                  </Badge>
                </div>
                <Progress 
                  value={dashboard.percentageUsed[limitType]} 
                  className="h-3"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LimitsWidget;