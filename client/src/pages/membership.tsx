import { useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import BottomNavigation from "@/components/ui/bottom-navigation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Check, Crown, Star, Users, Heart, Gift } from "lucide-react";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const membershipPlans = [
  {
    id: "free-trial",
    name: "Free Trial Membership",
    price: 0,
    period: "12 months free",
    description: "Get started with CBA - first year absolutely free!",
    features: [
      "Basic business listing",
      "Contact information display", 
      "Member directory access",
      "Monthly newsletter",
      "Community events access",
      "12 months completely free",
      "Optional donation welcome"
    ],
    icon: Users,
    popular: true,
    isFree: true
  },
  {
    id: "standard",
    name: "Standard Membership",
    price: 29.99,
    period: "monthly",
    description: "Perfect for established businesses",
    features: [
      "Everything in Free Trial",
      "Priority business listing",
      "Product & service showcase",
      "Special offers posting",
      "Enhanced profile features",
      "Business referral system"
    ],
    icon: Star,
    popular: false
  },
  {
    id: "premium",
    name: "Premium Membership",
    price: 49.99,
    period: "monthly", 
    description: "Maximum exposure and business growth tools",
    features: [
      "Everything in Standard",
      "Featured business placement",
      "Unlimited product listings",
      "Premium offer highlighting",
      "Advanced analytics",
      "Priority customer support",
      "Co-marketing opportunities",
      "Exclusive premium events"
    ],
    icon: Crown,
    popular: false
  }
];

const CheckoutForm = ({ planId, amount, isDonation = false }: { planId: string, amount: number, isDonation?: boolean }) => {
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
          return_url: `${window.location.origin}/dashboard?${isDonation ? 'donation=success' : 'membership=success'}`,
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
        {isProcessing ? "Processing..." : isDonation ? `Donate £${amount}` : `Pay £${amount}`}
      </Button>
    </form>
  );
};

const DonationForm = () => {
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const predefinedAmounts = [5, 10, 25, 50, 100];

  const handleDonationSubmit = async () => {
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/create-donation", {
        amount,
        donorName: donorName.trim(),
        message: message.trim()
      });
      
      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } else {
        throw new Error("Failed to create donation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm 
          planId="donation" 
          amount={parseFloat(donationAmount)} 
          isDonation={true}
        />
      </Elements>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="donation-amount">Donation Amount (£)</Label>
        <div className="flex flex-wrap gap-2 mt-2 mb-3">
          {predefinedAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={donationAmount === amount.toString() ? "default" : "outline"}
              size="sm"
              onClick={() => setDonationAmount(amount.toString())}
            >
              £{amount}
            </Button>
          ))}
        </div>
        <Input
          id="donation-amount"
          type="number"
          placeholder="Enter custom amount"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          min="1"
          step="0.01"
        />
      </div>

      <div>
        <Label htmlFor="donor-name">Your Name (Optional)</Label>
        <Input
          id="donor-name"
          placeholder="Enter your name"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          placeholder="Leave a message with your donation"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
        />
      </div>

      <Button 
        onClick={handleDonationSubmit}
        disabled={isLoading || !donationAmount}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Continue to Payment"}
      </Button>
    </div>
  );
};

const MembershipPage = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  const handleSelectPlan = async (planId: string, amount: number) => {
    // Handle free trial separately
    if (planId === "free-trial") {
      setShowDonation(true);
      setSelectedPlan(planId);
      return;
    }

    setIsLoading(true);
    try {
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

  // Show donation form for free trial
  if (selectedPlan === "free-trial" && showDonation) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <PageHeader 
          title="Support CBA with a Donation"
          showBack={true}
          onBack={() => {
            setSelectedPlan(null);
            setShowDonation(false);
          }}
        />
        
        <div className="p-4 pb-24">
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Gift className="h-5 w-5" />
                Free Trial Membership Activated!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Congratulations! Your free 12-month trial membership is ready to activate. 
                As a new member, you have access to all basic CBA benefits at no cost.
              </p>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Your Free Benefits Include:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>✓ Basic business listing</li>
                  <li>✓ Member directory access</li>
                  <li>✓ Monthly newsletter</li>
                  <li>✓ Community events access</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Optional Donation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-600 mb-6">
                While your membership is completely free, CBA relies on donations to support our community initiatives, 
                events, and member services. Any contribution helps us grow stronger together.
              </p>
              
              <DonationForm />
              
              <Separator className="my-6" />
              
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: "Welcome to CBA!",
                      description: "Your free membership is now active. Welcome to the community!",
                    });
                    window.location.href = "/dashboard";
                  }}
                >
                  Skip Donation & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

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
                    {isLoading ? "Loading..." : 
                     plan.isFree ? "Start Free Trial" : 
                     `Choose ${plan.name}`}
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