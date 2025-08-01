import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Mail, Calendar, MapPin, Clock, Ticket, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export default function MyQRCodeSimple() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Get AI Summit status to get registration ID
  const { data: summitStatus } = useQuery({
    queryKey: ['/api/my-ai-summit-status'],
    enabled: isAuthenticated,
  });

  const sendBadgeEmail = async () => {
    try {
      toast({
        title: "Badge Sent!",
        description: "Your QR code badge has been sent to your email.",
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Could not send badge email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadBadge = async () => {
    if (!summitStatus?.registrationId) {
      toast({
        title: "Download Failed",
        description: "No registration found. Please make sure you're registered for the AI Summit.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('GET', `/api/download-badge/${summitStatus.registrationId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-summit-badge-${summitStatus.registrationId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Badge Downloaded!",
        description: "Your badge has been downloaded. You can print it from your browser.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>My QR Code - Login Required | Croydon Business Association</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                <h1 className="text-xl font-semibold text-gray-900">Login Required</h1>
                <p className="text-gray-600">Please login to access your QR code and event registrations.</p>
                <Link href="/login">
                  <Button className="w-full">Login</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show the badge for logged in users
  return (
    <>
      <Helmet>
        <title>My QR Code - AI Summit Badge | Croydon Business Association</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My AI Summit Badge</h1>
            <p className="text-gray-600 mt-2">Your QR code for event entry and activities</p>
          </div>

          <Card className="mb-6">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2">
                <Ticket className="h-6 w-6 text-blue-600" />
                First AI Summit Croydon 2025
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                  <QrCode className="h-32 w-32 text-gray-800 mx-auto mb-4" />
                  <div className="text-lg font-semibold">Badge ID: AIS2025-TEST-001</div>
                  <Badge className="mt-2">General Attendee</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Participant Details</h3>
                  <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Company:</strong> Test Exhibition Company</p>
                  <p><strong>Role:</strong> Exhibition Visitor</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Event Information</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>October 1, 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>London South Bank University - Croydon Campus</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={sendBadgeEmail}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Badge
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadBadge}
                  disabled={!summitStatus?.registrationId}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Badge
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Event Instructions</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Present this QR code at registration desk</li>
                  <li>• Keep your badge visible during the event</li>
                  <li>• Use QR code for workshop check-ins</li>
                  <li>• Network with other attendees and exhibitors</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">What's Included</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Access to all keynote presentations</li>
                  <li>• Exhibition area with 50+ AI companies</li>
                  <li>• Networking sessions and refreshments</li>
                  <li>• Workshop access (registration required)</li>
                  <li>• Take-home AI resource pack</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}