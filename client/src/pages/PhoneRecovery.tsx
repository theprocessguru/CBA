import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PhoneRecovery() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updatePhoneMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const response = await apiRequest("POST", "/api/user/update-phone", { phone: phoneNumber });
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Phone Number Updated!",
        description: "Thank you for updating your contact information. You'll now receive important event updates.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update phone number. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with at least 10 digits.",
        variant: "destructive",
      });
      return;
    }
    
    updatePhoneMutation.mutate(phone);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-gray-600">
                Your phone number has been successfully updated. You'll now receive important AI Summit updates and notifications.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-6 w-6 text-blue-600" />
            <CardTitle>Update Your Phone Number</CardTitle>
          </div>
          <CardDescription>
            We need your phone number to send you important AI Summit updates, schedule changes, and safety notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Due to a technical issue, your phone number wasn't saved during registration. Please provide it now to ensure you receive all event communications.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 20 xxxx xxxx"
                required
                className="mt-1"
                data-testid="input-phone"
              />
              <p className="text-sm text-gray-500 mt-1">
                We'll only use this for event-related communications
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={updatePhoneMutation.isPending}
              data-testid="button-update-phone"
            >
              {updatePhoneMutation.isPending ? "Updating..." : "Update Phone Number"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}