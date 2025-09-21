import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, MapPin, Calendar, Check, X, AlertTriangle, Mic } from "lucide-react";
import { format } from "date-fns";

interface WorkshopEvent {
  id: number;
  eventName: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxCapacity: number;
  currentRegistrations: number;
  eventDate: string;
  registrationFee: number;
  memberPrice: number;
}

interface SpeakingSession {
  id: number;
  title: string;
  description: string;
  speakerName: string;
  speakerBio: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxCapacity: number;
  currentRegistrations: number;
  sessionType: string;
  audienceLevel: string;
  isActive: boolean;
}

interface Registration {
  id: number;
  eventId: number;
  eventName: string;
  attendanceStatus: string;
}

export default function AttendeeBooking() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available workshops
  const { data: workshops, isLoading: workshopsLoading } = useQuery<WorkshopEvent[]>({
    queryKey: ['/api/workshops'],
    enabled: isAuthenticated
  });

  // Fetch available speaking sessions
  const { data: speakingSessions, isLoading: speakingSessionsLoading } = useQuery<SpeakingSession[]>({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    enabled: isAuthenticated
  });

  // Fetch user's registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ['/api/my-registrations'],
    enabled: isAuthenticated
  });

  // Register for workshop mutation
  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest('POST', `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've been registered for the workshop!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workshops'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for session",
        variant: "destructive",
      });
    }
  });

  // Register for speaking session mutation
  const registerSpeakingMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      return apiRequest('POST', `/api/ai-summit/speaking-sessions/${sessionId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've been registered for the speaking session!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/speaking-sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for speaking session",
        variant: "destructive",
      });
    }
  });

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: async (registrationId: number) => {
      return apiRequest('DELETE', `/api/my-registrations/${registrationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Cancelled",
        description: "Your registration has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workshops'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/speaking-sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel registration",
        variant: "destructive",
      });
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
            <p className="text-gray-600">You need to be logged in to book sessions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (workshopsLoading || speakingSessionsLoading || registrationsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const isRegistered = (eventId: number) => {
    return registrations?.some(r => r.eventId === eventId);
  };
  
  const getRegistrationId = (eventId: number) => {
    return registrations?.find(r => r.eventId === eventId)?.id;
  };

  const formatTime = (timeString: string | null | undefined) => {
    if (!timeString) return "TBD";
    
    try {
      // Handle time strings like "13:00:00"
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const minute = parseInt(minutes);
        
        if (hour === 0 && minute === 0) return "TBD";
        
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
      }
      
      // Handle full date strings
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "TBD";
      return format(date, "h:mm a");
    } catch (error) {
      return "TBD";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Summit 2025 - Book Your Sessions</h1>
        <p className="text-gray-600">
          Reserve your seats for workshops and speaking sessions. Use your QR code badge for attendance tracking.
        </p>
      </div>

      <Tabs defaultValue="workshops" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workshops" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Workshops
          </TabsTrigger>
          <TabsTrigger value="speaking" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Talks/Speaker Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workshops">
          <div className="grid gap-6">
            {workshops?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No workshops available</h3>
                  <p className="text-gray-600">Check back later for available sessions.</p>
                </CardContent>
              </Card>
            ) : (
              workshops?.map((workshop) => {
                const registered = isRegistered(workshop.id);
                const registrationId = getRegistrationId(workshop.id);
                
                const isFull = workshop.currentRegistrations >= workshop.maxCapacity;
                const availableSeats = workshop.maxCapacity - workshop.currentRegistrations;

                return (
                  <Card key={workshop.id} className={`${
                    registered ? 'ring-2 ring-green-500' : 
                    isFull ? 'opacity-75 bg-gray-50' :
                    availableSeats <= 5 ? 'ring-2 ring-red-400 animate-pulse' :
                    ''
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {workshop.eventName}
                            <Badge className="bg-blue-100 text-blue-800">
                              Workshop - 30 minutes
                            </Badge>
                            {registered && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Registered
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-gray-600">{workshop.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(workshop.startTime)} - {formatTime(workshop.endTime)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {workshop.venue || 'TBD'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {workshop.eventDate || 'TBD'}
                          </div>
                          <div className="mt-2">
                            {isFull ? (
                              <Badge className="bg-red-100 text-red-800 font-bold px-3 py-1">
                                SOLD OUT
                              </Badge>
                            ) : (
                              <div className={`inline-flex items-center px-3 py-1 rounded-lg font-medium ${
                                availableSeats <= 5 ? 'bg-red-100 text-red-800' :
                                availableSeats <= 10 ? 'bg-orange-100 text-orange-800' :
                                availableSeats <= 20 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                <Users className="w-4 h-4 mr-1" />
                                <span className="font-bold text-lg">{availableSeats}</span>
                                <span className="ml-1 text-sm">seats left</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Max capacity: {workshop.maxCapacity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            {workshop.registrationFee > 0 ? `£${workshop.registrationFee}` : 'Free'}
                            {workshop.memberPrice > 0 && workshop.memberPrice < workshop.registrationFee && (
                              <span className="ml-2 text-green-600">Members: £{workshop.memberPrice}</span>
                            )}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {registered ? (
                            <Button
                              variant="outline"
                              onClick={() => cancelMutation.mutate(registrationId!)}
                              disabled={cancelMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-cancel-${workshop.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel Registration
                            </Button>
                          ) : isFull ? (
                            <Button
                              disabled
                              variant="outline"
                              className="cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300"
                              data-testid={`button-soldout-${workshop.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Sold Out
                            </Button>
                          ) : (
                            <Button
                              onClick={() => registerMutation.mutate(workshop.id)}
                              disabled={registerMutation.isPending}
                              className={`${
                                availableSeats <= 5 ? 'bg-red-600 hover:bg-red-700' :
                                availableSeats <= 10 ? 'bg-orange-600 hover:bg-orange-700' :
                                ''
                              }`}
                              data-testid={`button-register-${workshop.id}`}
                            >
                              {availableSeats <= 5 && (
                                <AlertTriangle className="w-4 h-4 mr-1 animate-pulse" />
                              )}
                              Book Seat
                              {availableSeats <= 5 && (
                                <span className="ml-1 text-xs">(Only {availableSeats} left!)</span>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="speaking">
          <div className="grid gap-6">
            {speakingSessions?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Mic className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No speaking sessions available</h3>
                  <p className="text-gray-600">Check back later for available talks and presentations.</p>
                </CardContent>
              </Card>
            ) : (
              speakingSessions?.map((session) => {
                const registered = isRegistered(session.id);
                const registrationId = getRegistrationId(session.id);
                
                const isFull = session.currentRegistrations >= session.maxCapacity;
                const availableSeats = session.maxCapacity - session.currentRegistrations;

                return (
                  <Card key={session.id} className={`${
                    registered ? 'ring-2 ring-green-500' : 
                    isFull ? 'opacity-75 bg-gray-50' :
                    availableSeats <= 5 ? 'ring-2 ring-red-400 animate-pulse' :
                    ''
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {session.title}
                            <Badge className="bg-purple-100 text-purple-800">
                              {session.sessionType || 'Talk'}
                            </Badge>
                            {registered && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Registered
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-gray-600 mt-1">{session.description}</p>
                          {session.speakerName && (
                            <p className="text-sm text-gray-500 mt-2">
                              <span className="font-medium">Speaker:</span> {session.speakerName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {session.venue || 'TBD'}
                          </div>
                          {session.audienceLevel && (
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                              <Users className="w-4 h-4 mr-1" />
                              {session.audienceLevel}
                            </div>
                          )}
                          <div className="mt-2">
                            {isFull ? (
                              <Badge className="bg-red-100 text-red-800 font-bold px-3 py-1">
                                SOLD OUT
                              </Badge>
                            ) : (
                              <div className={`inline-flex items-center px-3 py-1 rounded-lg font-medium ${
                                availableSeats <= 5 ? 'bg-red-100 text-red-800' :
                                availableSeats <= 10 ? 'bg-orange-100 text-orange-800' :
                                availableSeats <= 20 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                <Users className="w-4 h-4 mr-1" />
                                <span className="font-bold text-lg">{availableSeats}</span>
                                <span className="ml-1 text-sm">seats left</span>
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1">
                              Max capacity: {session.maxCapacity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">Free Session</span>
                        </div>

                        <div className="flex gap-2">
                          {registered ? (
                            <Button
                              variant="outline"
                              onClick={() => cancelMutation.mutate(registrationId!)}
                              disabled={cancelMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`button-cancel-session-${session.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel Registration
                            </Button>
                          ) : isFull ? (
                            <Button
                              disabled
                              variant="outline"
                              className="cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300"
                              data-testid={`button-soldout-session-${session.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Sold Out
                            </Button>
                          ) : (
                            <Button
                              onClick={() => registerSpeakingMutation.mutate(session.id)}
                              disabled={registerSpeakingMutation.isPending}
                              className={`${
                                availableSeats <= 5 ? 'bg-red-600 hover:bg-red-700' :
                                availableSeats <= 10 ? 'bg-orange-600 hover:bg-orange-700' :
                                'bg-purple-600 hover:bg-purple-700'
                              }`}
                              data-testid={`button-register-session-${session.id}`}
                            >
                              {availableSeats <= 5 && (
                                <AlertTriangle className="w-4 h-4 mr-1 animate-pulse" />
                              )}
                              Book Seat
                              {availableSeats <= 5 && (
                                <span className="ml-1 text-xs">(Only {availableSeats} left!)</span>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {registrations && registrations.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Registered Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              You are registered for {registrations.length} session{registrations.length !== 1 ? 's' : ''}. 
              Your QR code badge will be scanned at each session for attendance tracking.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}