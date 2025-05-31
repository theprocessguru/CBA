import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MEMBERSHIP_TIERS } from "@/lib/constants";
import { Heart, Gift, Users, Calendar } from "lucide-react";

interface CbaCause {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
}

const TrialMembership = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCause, setSelectedCause] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("Growth Tier");

  const { data: causes, isLoading: isLoadingCauses } = useQuery<CbaCause[]>({
    queryKey: ['/api/cba-causes'],
  });

  const startTrialMutation = useMutation({
    mutationFn: async (data: { causeId: number; tier: string }) => {
      const response = await apiRequest("POST", "/api/start-trial-membership", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.requiresPayment) {
        // Redirect to payment page with client secret
        window.location.href = `/trial-donation?client_secret=${data.clientSecret}&cause=${selectedCause}`;
      } else {
        toast({
          title: "Trial Membership Started!",
          description: "Welcome to CBA! Your free first year has begun.",
        });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start trial membership",
        variant: "destructive",
      });
    },
  });

  const handleStartTrial = () => {
    if (!selectedCause) {
      toast({
        title: "Please select a cause",
        description: "Choose which CBA cause you'd like to support with your £10 donation.",
        variant: "destructive",
      });
      return;
    }

    startTrialMutation.mutate({
      causeId: parseInt(selectedCause),
      tier: selectedTier,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4">
            Join Croydon Business Association
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Start your membership journey with a free first year! Support our community causes with a £10 donation and unlock business networking opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Membership Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                Free First Year Membership
              </CardTitle>
              <CardDescription>
                Choose your membership tier and start building connections in Croydon's business community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-neutral-900">Select Your Membership Tier:</h3>
                <RadioGroup value={selectedTier} onValueChange={setSelectedTier}>
                  {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={key} id={key} />
                        <Label htmlFor={key} className="flex items-center gap-2 cursor-pointer">
                          <span className={`px-2 py-1 rounded text-xs text-white ${tier.color}`}>
                            {tier.name}
                          </span>
                        </Label>
                      </div>
                      {selectedTier === key && (
                        <div className="ml-6 pl-4 border-l border-neutral-200">
                          <ul className="text-sm text-neutral-600 space-y-1">
                            {tier.features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Trial Benefits</span>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• 12 months free membership</li>
                  <li>• Full access to your selected tier features</li>
                  <li>• Directory listing and networking events</li>
                  <li>• Support a worthy cause in your community</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Cause Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Support a CBA Cause - £10
              </CardTitle>
              <CardDescription>
                Your £10 donation supports important community initiatives. Choose the cause that resonates with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCauses ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : (
                <RadioGroup value={selectedCause} onValueChange={setSelectedCause}>
                  <div className="space-y-4">
                    {causes?.map((cause) => (
                      <div key={cause.id} className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <RadioGroupItem 
                            value={cause.id.toString()} 
                            id={`cause-${cause.id}`}
                            className="mt-1"
                          />
                          <Label 
                            htmlFor={`cause-${cause.id}`} 
                            className="flex-1 cursor-pointer"
                          >
                            <div className="space-y-1">
                              <div className="font-medium text-neutral-900">
                                {cause.name}
                              </div>
                              <div className="text-sm text-neutral-600">
                                {cause.description}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-neutral-500">
                                  Raised: £{cause.raisedAmount} / £{cause.targetAmount}
                                </div>
                                <div className="flex-1 bg-neutral-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-primary h-1.5 rounded-full transition-all"
                                    style={{ 
                                      width: `${Math.min((cause.raisedAmount / cause.targetAmount) * 100, 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-900">£10</div>
                  <div className="text-sm text-neutral-600">One-time donation</div>
                </div>
                <Button 
                  onClick={handleStartTrial}
                  disabled={!selectedCause || startTrialMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {startTrialMutation.isPending ? (
                    "Starting Trial..."
                  ) : (
                    "Start Free Trial & Donate £10"
                  )}
                </Button>
                <p className="text-xs text-neutral-500">
                  Secure payment powered by Stripe. You'll be redirected to complete your donation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrialMembership;