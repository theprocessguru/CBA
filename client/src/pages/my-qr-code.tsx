import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Mail, Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIRegistration {
  eventName: string;
  participantType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  badgeId?: string;
  registrationData?: any;
}

export default function MyQRCode() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch user's AI Summit registrations
  const { data: registrations = [], isLoading } = useQuery<AIRegistration[]>({
    queryKey: ["/api/user/ai-summit-registrations"],
    enabled: isAuthenticated,
  });

  const sendBadgeEmail = async (badgeId: string, email: string) => {
    try {
      const response = await apiRequest("POST", "/api/ai-summit/send-badge-email", {
        badgeId,
        email
      });
      
      if (response.ok) {
        toast({
          title: "Badge Sent!",
          description: "Your QR code badge has been sent to your email.",
        });
      } else {
        throw new Error("Failed to send badge");
      }
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Could not send badge email. Please try again.",
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

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>My QR Code - Loading | Croydon Business Association</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const mainRegistration = registrations.find(reg => reg.badgeId);

  return (
    <>
      <Helmet>
        <title>My QR Code - AI Summit Badge | Croydon Business Association</title>
        <meta name="description" content="Access your AI Summit QR code badge and event registration details." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My AI Summit QR Code</h1>
            <p className="text-gray-600">
              Your unique QR code for the First AI Summit Croydon 2025 - October 1st
            </p>
          </div>

          {mainRegistration ? (
            <div className="space-y-6">
              {/* QR Code Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Your QR Code Badge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{mainRegistration.eventName}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {mainRegistration.participantType}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{mainRegistration.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{mainRegistration.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{mainRegistration.venue}</span>
                        </div>
                      </div>

                      {mainRegistration.badgeId && (
                        <div className="flex items-center gap-2 text-sm mb-4">
                          <Ticket className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">Badge ID: {mainRegistration.badgeId}</span>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => sendBadgeEmail(mainRegistration.badgeId!, user?.email!)}
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Email My Badge
                        </Button>
                        <Link href="/my-registrations">
                          <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                            <Calendar className="h-4 w-4" />
                            View All Registrations
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Display Area */}
                    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white">
                      <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <QrCode className="h-20 w-20 text-gray-400" />
                        <div className="text-center text-sm text-gray-500 absolute">
                          QR Code will display here after you receive your badge email
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 text-center max-w-xs">
                        Present this QR code at the event entrance for check-in
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Use Your QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li><strong>Save your badge:</strong> Click "Email My Badge" to receive a printable version</li>
                    <li><strong>Print your badge:</strong> Download and print the badge on A4 paper</li>
                    <li><strong>Bring to event:</strong> Present your QR code at the entrance on October 1st</li>
                    <li><strong>Quick check-in:</strong> Staff will scan your code for instant event access</li>
                    <li><strong>Workshop access:</strong> Use the same code for workshop and session registration</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* No Registration Card */
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 text-gray-400 mx-auto" />
                  <h2 className="text-xl font-semibold text-gray-900">No AI Summit Registration Found</h2>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have an active AI Summit registration yet. Register for the event to get your QR code badge.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/ai-summit">
                      <Button className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Register for AI Summit
                      </Button>
                    </Link>
                    <Link href="/my-profile">
                      <Button variant="outline" className="flex items-center gap-2">
                        View My Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}