import { useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/page-header";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Crown, Star, Users } from "lucide-react";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const membershipPlans = [
  {
    id: "standard",
    name: "Standard Membership",
    price: 29.99,
    period: "monthly",
    description: "Perfect for small businesses getting started",
    features: [
      "Basic business listing",
      "Contact information display",
      "Member directory access",
      "Monthly newsletter",
      "Community events access"
    ],
    icon: Users,
    popular: false
  },
  {
    id: "premium",
    name: "Premium Membership", 
    price: 49.99,
    period: "monthly",
    description: "Enhanced visibility and networking opportunities",
    features: [
      "Priority business listing",
      "Product & service showcase",
      "Special offers posting",
      "Enhanced profile features",
      "Networking event priority",
      "Business referral system",
      "Analytics dashboard"
    ],
    icon: Star,
    popular: true
  },
  {
    id: "enterprise",
    name: "Enterprise Membership",
    price: 99.99,
    period: "monthly", 
    description: "Maximum exposure and business growth tools",
    features: [
      "Featured business placement",
      "Unlimited product listings",
      "Premium offer highlighting",
      "Advanced analytics",
      "Priority customer support",
      "Co-marketing opportunities",
      "Exclusive enterprise events",
      "Custom business solutions"
    ],
    icon: Crown,
    popular: false
  }
];

const CheckoutForm = ({ planId, amount }: { planId: string, amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?membership=success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Payment Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay £${amount}`}
      </Button>
    </form>
  );
};

const MembershipPage = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectPlan = async (planId: string, amount: number) => {
    setIsLoading(true);
    try {
      // For demo, using payment intent. In production, use subscription endpoint
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount,
        description: `CBA ${planId} membership`
      });
      
      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
        setSelectedPlan(planId);
      } else {
        throw new Error("Failed to create payment");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedPlan && clientSecret) {
    const plan = membershipPlans.find(p => p.id === selectedPlan)!;
    
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageHeader 
          title="Complete Payment"
          showBack={true}
          onBack={() => {
            setSelectedPlan(null);
            setClientSecret("");
          }}
        />
        
        <div className="p-4 pb-24">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <plan.icon className="h-5 w-5" />
                {plan.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary mb-2">
                £{plan.price}
                <span className="text-sm font-normal text-neutral-600">/{plan.period}</span>
              </div>
              <p className="text-neutral-600">{plan.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm planId={selectedPlan} amount={plan.price} />
              </Elements>
            </CardContent>
          </Card>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHeader title="CBA Membership Plans" showBack={true} />
      
      <div className="p-4 pb-24">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Join the Croydon Business Association
          </h2>
          <p className="text-neutral-600">
            Choose the membership plan that best fits your business needs
          </p>
        </div>

        <div className="space-y-4">
          {membershipPlans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-4 bg-primary">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-neutral-600">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        £{plan.price}
                      </div>
                      <div className="text-sm text-neutral-600">/{plan.period}</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id, plan.price)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-900 mb-2">
                Need a Custom Solution?
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Large organizations or unique requirements? We offer tailored packages.
              </p>
              <Button variant="outline" className="border-blue-300 text-blue-700">
                Contact Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default MembershipPage;