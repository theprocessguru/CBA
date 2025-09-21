import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import RegistrationCalendar from "@/components/RegistrationCalendar";
import { Calendar, Download, QrCode, Mail, Phone, User, Building } from "lucide-react";

interface Registration {
  id: string;
  type: 'workshop' | 'talk' | 'exhibition' | 'networking';
  title: string;
  time: string;
  duration: string;
  location: string;
  capacity?: number;
  registered?: boolean;
  registrationDate?: string;
  badgeData?: {
    qrCode: string;
    participantName: string;
    email: string;
  };
}

const MyRegistrations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Helper functions to format data (matching RegistrationCalendar logic)
  const formatTime = (startTime: string, endTime: string) => {
    try {
      if (!startTime || !endTime) return 'TBD';
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'TBD';
      
      const startHour = start.getHours().toString().padStart(2, '0');
      const startMin = start.getMinutes().toString().padStart(2, '0');
      const endHour = end.getHours().toString().padStart(2, '0');
      const endMin = end.getMinutes().toString().padStart(2, '0');
      
      return `${startHour}:${startMin} - ${endHour}:${endMin}`;
    } catch {
      return 'TBD';
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      if (!startTime || !endTime) return '30min';
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '30min';
      
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return `${diffMinutes}min`;
    } catch {
      return '30min';
    }
  };

  // Fetch user's current registrations
  const { data: userRegistrations = [], isLoading, error } = useQuery<Registration[]>({
    queryKey: ['/api/my-registrations'],
    retry: false,
    select: (data) => {
      // Adapt API data format to match RegistrationCalendar expectations
      return (data || []).map((reg: any) => ({
        ...reg,
        // Add missing fields that RegistrationCalendar expects
        time: reg.startTime && reg.endTime ? formatTime(reg.startTime, reg.endTime) : 'TBD',
        duration: reg.startTime && reg.endTime ? calculateDuration(reg.startTime, reg.endTime) : '30min'
      }));
    }
  });

  // Ensure userRegistrations is always an array to prevent runtime errors
  const safeUserRegistrations = Array.isArray(userRegistrations) ? userRegistrations : [];

  // Register for a session
  const registerMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest('POST', '/api/register-session', { sessionId });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've been registered for the session. Check your email for confirmation.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-registrations'] });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Cancel a registration
  const cancelMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      return apiRequest('DELETE', `/api/my-registrations/${registrationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Cancelled",
        description: "Your registration has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-registrations'] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRegister = (sessionId: string) => {
    registerMutation.mutate(sessionId);
  };

  const handleCancel = (registrationId: string) => {
    cancelMutation.mutate(registrationId);
  };

  const downloadBadge = async (registration: Registration) => {
    if (!registration.badgeData) return;
    
    try {
      const response = await apiRequest('GET', `/api/download-badge/${registration.id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-summit-badge-${registration.id}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download badge. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My AI Summit Registrations - Croydon Business Association</title>
        <meta name="description" content="View and manage your AI Summit registrations. Track your schedule and avoid double bookings." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My AI Summit Registrations</h1>
            <p className="text-gray-600">
              Manage your schedule for the First AI Summit Croydon 2025 - January 27th
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-bold text-blue-600">{safeUserRegistrations.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Workshops</p>
                    <p className="text-2xl font-bold text-green-600">
                      {safeUserRegistrations.filter((r: Registration) => r.type === 'workshop').length}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Talks</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {safeUserRegistrations.filter((r: Registration) => r.type === 'talk').length}
                    </p>
                  </div>
                  <User className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Current Registrations */}
          {safeUserRegistrations.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Current Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {safeUserRegistrations.map((registration: Registration) => (
                    <div key={registration.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={
                              registration.type === 'workshop' 
                                ? 'bg-green-100 text-green-800' 
                                : registration.type === 'talk'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                            }>
                              {registration.type}
                            </Badge>
                            <span className="text-sm font-medium text-gray-600">
                              {registration.time}
                            </span>
                          </div>
                          
                          <h3 className="font-medium text-gray-900 mb-1">
                            {registration.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            📍 {registration.location}
                          </p>
                          
                          {registration.registrationDate && (
                            <p className="text-xs text-gray-500">
                              Registered: {new Date(registration.registrationDate).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {registration.badgeData && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadBadge(registration)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Badge
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancel(registration.id)}
                            disabled={cancelMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registration Calendar */}
          <RegistrationCalendar
            userRegistrations={safeUserRegistrations}
            onRegister={handleRegister}
            onCancel={handleCancel}
          />

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </h4>
                  <p className="text-sm text-gray-600">
                    Contact us at: <a href="mailto:ai-summit@croydonbusiness.org" className="text-blue-600 hover:underline">ai-summit@croydonbusiness.org</a>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Support
                  </h4>
                  <p className="text-sm text-gray-600">
                    Call us at: <a href="tel:+442087654321" className="text-blue-600 hover:underline">+44 208 765 4321</a>
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Registration Changes:</strong> You can modify your registrations up to 24 hours before the event. 
                  On the day of the event, please speak to our staff at the registration desk for any changes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MyRegistrations;