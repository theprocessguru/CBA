import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  Calendar, 
  MapPin, 
  Clock,
  Users,
  Ticket,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Plus,
  Mic
} from "lucide-react";

export const EventBookingTab = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available workshops for booking 
  const { data: workshops, isLoading: workshopsLoading } = useQuery<any[]>({
    queryKey: ['/api/workshops'],
    enabled: isAuthenticated
  });

  // Fetch available speaking sessions for booking 
  const { data: speakingSessions, isLoading: speakingSessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    enabled: isAuthenticated
  });

  // Combine workshops and speaking sessions into a unified list
  const timeSlots = [
    ...(workshops || []).map(workshop => ({ ...workshop, sessionType: 'workshop' })),
    ...(speakingSessions || []).map(session => ({ ...session, sessionType: 'speaking_session' }))
  ];
  
  const slotsLoading = workshopsLoading || speakingSessionsLoading;

  // Fetch user's current event registrations
  const { data: sessionRegistrations, isLoading: sessionRegistrationsLoading } = useQuery<any[]>({
    queryKey: ['/api/my-registrations'],
    enabled: isAuthenticated
  });

  // Register for session mutation (handles both workshops and speaking sessions)
  const registerMutation = useMutation({
    mutationFn: async ({ eventId, sessionType }: { eventId: number; sessionType: string }) => {
      if (sessionType === 'speaking_session') {
        return apiRequest('POST', `/api/ai-summit/speaking-sessions/${eventId}/register`);
      } else {
        return apiRequest('POST', `/api/events/${eventId}/register`);
      }
    },
    onSuccess: (_, variables) => {
      const sessionName = variables.sessionType === 'speaking_session' ? 'speaking session' : 'workshop';
      toast({
        title: "Registration Successful",
        description: `You've been registered for the ${sessionName}!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workshops'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/speaking-sessions/active'] });
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

  // Cancel registration mutation (handles both workshops and speaking sessions)
  const cancelMutation = useMutation({
    mutationFn: async ({ eventId, sessionType }: { eventId: number; sessionType: string }) => {
      if (sessionType === 'speaking_session') {
        // Note: We need to add this endpoint to the backend if it doesn't exist
        return apiRequest('DELETE', `/api/ai-summit/speaking-sessions/${eventId}/unregister`);
      } else {
        return apiRequest('DELETE', `/api/events/${eventId}/unregister`);
      }
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

  // Helper functions for booking
  const isRegistered = (eventId: number) => {
    return sessionRegistrations?.some(reg => reg.eventId === eventId);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    
    // Handle different time formats
    let date: Date;
    
    // If it's just a time string (HH:MM or HH:MM:SS), assume today's date
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      const today = new Date();
      const [hours, minutes] = timeString.split(':');
      date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));
    } else {
      // Try to parse as a full date/time string
      date = new Date(timeString);
    }
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return timeString; // Return original string if can't parse
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original string if can't parse
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSlotTypeColor = (sessionType: string) => {
    switch (sessionType) {
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'speaking_session': return 'bg-purple-100 text-purple-800';
      case 'keynote': return 'bg-blue-100 text-blue-800';
      case 'talk': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSlotTypeName = (sessionType: string) => {
    switch (sessionType) {
      case 'workshop': return 'Workshop';
      case 'speaking_session': return 'Speaking Session';
      case 'keynote': return 'Keynote';
      case 'talk': return 'Talk';
      default: return 'Session';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/event-booking" data-testid="link-book-workshops">
              <Button className="w-full h-16 flex flex-col items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Book Workshops</span>
              </Button>
            </Link>
            <Link href="/event-booking" data-testid="link-book-speaking">
              <Button className="w-full h-16 flex flex-col items-center gap-2 bg-green-500 hover:bg-green-600 text-white">
                <Mic className="h-5 w-5" />
                <span className="text-sm">Book Speaking Sessions</span>
              </Button>
            </Link>
            <Link href="/my-registrations" data-testid="link-manage-bookings">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center gap-2">
                <Ticket className="h-5 w-5" />
                <span className="text-sm">Manage Bookings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Available Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Available AI Summit Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slotsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : !timeSlots || timeSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sessions available for booking at this time</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {timeSlots.map((session) => {
                const registered = isRegistered(session.id);
                // Handle different data structures for workshops vs speaking sessions
                const maxCapacity = session.maxCapacity || session.max_capacity || 30;
                const currentRegistrations = session.currentRegistrations || session.current_registrations || 0;
                const isFull = currentRegistrations >= maxCapacity;
                const availableSeats = maxCapacity - currentRegistrations;
                
                // Get session title from different possible fields
                const sessionTitle = session.title || session.event_name || session.eventName || 'Untitled Session';
                const sessionDescription = session.description || 'No description available';
                const sessionVenue = session.room || session.venue || 'TBD';

                return (
                  <div
                    key={session.id}
                    className={`border rounded-lg p-4 ${
                      registered ? 'ring-2 ring-green-500 bg-green-50' : 
                      isFull ? 'opacity-75 bg-gray-50' :
                      availableSeats <= 5 ? 'ring-2 ring-red-400' : ''
                    }`}
                    data-testid={`session-${session.id}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 leading-tight">{sessionTitle}</h3>
                          <Badge className={getSlotTypeColor(session.sessionType)}>
                            {getSlotTypeName(session.sessionType)}
                          </Badge>
                          {registered && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Registered
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{sessionDescription}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(session.date || session.startTime || session.start_time)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(session.startTime || session.start_time)} - {formatTime(session.endTime || session.end_time)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {sessionVenue}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">
                              {currentRegistrations}/{maxCapacity}
                              <span className="text-green-600 ml-1">
                                ({availableSeats} left)
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {registered ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelMutation.mutate({ eventId: session.id, sessionType: session.sessionType })}
                            disabled={cancelMutation.isPending}
                            data-testid={`button-cancel-${session.id}`}
                          >
                            Cancel
                          </Button>
                        ) : isFull ? (
                          <Button variant="outline" size="sm" disabled>
                            Full
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => registerMutation.mutate({ eventId: session.id, sessionType: session.sessionType })}
                            disabled={registerMutation.isPending}
                            data-testid={`button-register-${session.id}`}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Register
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {availableSeats <= 5 && availableSeats > 0 && !registered && (
                      <div className="flex items-center gap-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertTriangle className="h-4 w-4" />
                        Only {availableSeats} seats left!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Current Session Registrations */}
      {sessionRegistrations && sessionRegistrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Your Registered Sessions ({sessionRegistrations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">
              You are registered for {sessionRegistrations.length} session{sessionRegistrations.length !== 1 ? 's' : ''}. 
              Your QR code badge will be scanned at each session for attendance tracking.
            </div>
            <div className="space-y-3">
              {sessionRegistrations.map((registration) => {
                const slot = timeSlots?.find(s => s.id === registration.eventId);
                if (!slot) return null;
                
                return (
                  <div key={registration.eventId} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div>
                      <h4 className="font-medium text-gray-900">{slot.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(slot.date || slot.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {slot.room}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Registered
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};