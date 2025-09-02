import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  QrCode, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Download,
  Eye,
  Sparkles,
  User,
  Building,
  Calendar
} from "lucide-react";
import { Link } from "wouter";

const qrCustomizationSchema = z.object({
  qrHandle: z.string()
    .min(3, "QR handle must be at least 3 characters")
    .max(20, "QR handle must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores allowed")
    .transform(val => val.toUpperCase()),
});

type QRCustomizationFormValues = z.infer<typeof qrCustomizationSchema>;

interface QRCodeCustomizationProps {
  showFull?: boolean;
}

const QRCodeCustomization = ({ showFull = false }: QRCodeCustomizationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const form = useForm<QRCustomizationFormValues>({
    resolver: zodResolver(qrCustomizationSchema),
    defaultValues: {
      qrHandle: user?.qrHandle || "",
    },
  });

  // Check if QR handle is available
  const checkAvailability = async (handle: string) => {
    if (!handle || handle.length < 3) return false;
    setIsChecking(true);
    try {
      const response = await apiRequest("POST", "/api/check-qr-handle", { qrHandle: handle });
      const data = await response.json();
      return data.available;
    } catch (error) {
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Update QR handle mutation
  const updateQRHandleMutation = useMutation({
    mutationFn: async (data: QRCustomizationFormValues) => {
      const response = await apiRequest("POST", "/api/update-qr-handle", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update QR handle");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "QR Handle Updated!",
        description: "Your custom QR handle has been saved successfully.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update QR handle",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: QRCustomizationFormValues) => {
    updateQRHandleMutation.mutate(data);
  };

  const copyQRHandle = () => {
    if (user?.qrHandle) {
      navigator.clipboard.writeText(user.qrHandle);
      toast({
        title: "Copied!",
        description: "QR handle copied to clipboard",
      });
    }
  };

  // Generate suggested handles based on user info
  const generateSuggestions = () => {
    if (!user) return [];
    
    const suggestions = [];
    const firstName = user.firstName?.toUpperCase() || "";
    const lastName = user.lastName?.toUpperCase() || "";
    const businessName = (user as any)?.businessName?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";
    
    if (firstName && lastName) {
      suggestions.push(`${firstName}-${lastName}`);
      suggestions.push(`${firstName}${lastName}`);
      suggestions.push(`${firstName.charAt(0)}${lastName}`);
    }
    if (businessName) {
      suggestions.push(businessName);
      suggestions.push(`${businessName}-CBA`);
    }
    if (firstName) {
      suggestions.push(`${firstName}-CBA-2025`);
    }
    
    return suggestions.slice(0, 3);
  };

  const hasQRHandle = user?.qrHandle && user.qrHandle.length > 0;

  if (!showFull && hasQRHandle) {
    // Compact view when QR handle is set
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <QrCode className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Custom QR: {user.qrHandle}</p>
                <p className="text-sm text-green-700">Ready for networking!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyQRHandle}
                className="border-green-300 text-green-700 hover:bg-green-100"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Link href="/my-qr-code-simple">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showFull && !hasQRHandle) {
    // Compact prompt when QR handle is not set
    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                <QrCode className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">Customize Your QR Code</p>
                <p className="text-sm text-amber-700">Stand out at networking events</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Customize Your QR Handle
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Your QR handle is how other business members will see you when they scan your code at events.
                        Choose something professional and memorable!
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={form.control}
                      name="qrHandle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom QR Handle*</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input 
                                placeholder="YOUR-BUSINESS-NAME" 
                                {...field}
                                className="font-mono uppercase"
                              />
                              {field.value && field.value.length >= 3 && (
                                <div className="text-sm text-gray-600">
                                  Preview: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{field.value}</span>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            3-20 characters. Letters, numbers, hyphens and underscores only.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Suggestions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Suggestions:</p>
                      <div className="flex flex-wrap gap-2">
                        {generateSuggestions().map((suggestion, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => form.setValue("qrHandle", suggestion)}
                            className="text-xs"
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-700">Benefits of a custom QR handle:</p>
                      <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-blue-500" />
                          <span>Professional appearance at events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-green-500" />
                          <span>Easy to remember for follow-ups</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-purple-500" />
                          <span>Branded networking experience</span>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateQRHandleMutation.isPending || isChecking}
                      >
                        {updateQRHandleMutation.isPending ? "Saving..." : "Save Handle"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full detailed view
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Customization
        </CardTitle>
        <CardDescription>
          Customize your QR handle for professional networking at events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasQRHandle ? (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>QR Handle Set:</strong> {user.qrHandle}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={copyQRHandle}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Handle
              </Button>
              <Link href="/my-qr-code-simple">
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  View QR Code
                </Button>
              </Link>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Handle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Same dialog content as above */}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Set up your custom QR handle to make a professional impression at networking events.
              </AlertDescription>
            </Alert>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-600 hover:bg-amber-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Set Up QR Handle
                </Button>
              </DialogTrigger>
              <DialogContent>
                {/* Same dialog content as above */}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeCustomization;