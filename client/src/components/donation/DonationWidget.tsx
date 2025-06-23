import { useState } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Gift } from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

const DonationCheckoutForm = ({ amount }: { amount: number }) => {
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
          return_url: `${window.location.origin}/dashboard?donation=success`,
        },
      });

      if (error) {
        toast({
          title: "Donation Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Donation Error", 
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Donate £${amount}`}
      </Button>
    </form>
  );
};

interface DonationWidgetProps {
  trigger?: React.ReactNode;
  showInline?: boolean;
}

export const DonationWidget = ({ trigger, showInline = false }: DonationWidgetProps) => {
  const { toast } = useToast();
  const [donationAmount, setDonationAmount] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

  const resetForm = () => {
    setDonationAmount("");
    setDonorName("");
    setMessage("");
    setClientSecret("");
    setIsLoading(false);
  };

  const donationForm = (
    <div className="space-y-4">
      {!clientSecret ? (
        <>
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
        </>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <DonationCheckoutForm amount={parseFloat(donationAmount)} />
        </Elements>
      )}
    </div>
  );

  if (showInline) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support CBA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600 mb-4">
            Help support CBA's community initiatives and member services with a donation.
          </p>
          {donationForm}
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Gift className="h-4 w-4" />
            Make a Donation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Support CBA
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Your donation helps CBA support local businesses and strengthen our community.
          </p>
          {donationForm}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationWidget;