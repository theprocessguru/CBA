import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, MapPin, Calendar, Check, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TimeSlot {
  id: number;
  title: string;
  description: string;
  slotType: string;
  startTime: string;
  endTime: string;
  room: string;
  maxCapacity: number;
  currentAttendees: number;
  speakers: Array<{
    speakerId: string;
    role: string;
    firstName: string;
    lastName: string;
  }>;
}

interface Registration {
  timeSlotId: number;
  attendanceStatus: string;
}

export default function AttendeeBooking() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available time slots
  const { data: timeSlots, isLoading: slotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ['/api/events/1/time-slots'],
    enabled: isAuthenticated
  });

  // Fetch user's registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery<Registration[]>({
    queryKey: ['/api/my-time-slot-registrations'],
    enabled: isAuthenticated
  });

  // Register for time slot mutation
  const registerMutation = useMutation({
    mutationFn: async (slotId: number) => {
      return apiRequest('POST', `/api/events/1/time-slots/${slotId}/register`, {
        badgeId: (user as any)?.qrHandle || `USER-${user?.id}` // Use QR handle as badge ID
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've been registered for the session!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/time-slots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-time-slot-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for session",
        variant: "destructive",
      });
    }
  });

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: async (slotId: number) => {
      return apiRequest('DELETE', `/api/events/1/time-slots/${slotId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Cancelled",
        description: "Your registration has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/time-slots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-time-slot-registrations'] });
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

  if (slotsLoading || registrationsLoading) {
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

  const isRegistered = (slotId: number) => {
    return registrations?.some(r => r.timeSlotId === slotId);
  };

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return "TBD";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "TBD";
      return format(date, "h:mm a");
    } catch (error) {
      return "TBD";
    }
  };

  const getSlotTypeColor = (slotType: string) => {
    switch (slotType) {
      case 'keynote': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-blue-100 text-blue-800';
      case 'talk': return 'bg-green-100 text-green-800';
      case 'break': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpeakingDuration = (slotType: string) => {
    return slotType === 'workshop' ? '45 minutes' : '15 minutes';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Summit 2025 - Book Your Sessions</h1>
        <p className="text-gray-600">
          Reserve your seats for talks and workshops. Use your QR code badge for attendance tracking.
        </p>
      </div>

      <div className="grid gap-6">
        {timeSlots?.map((slot) => {
          if (slot.slotType === 'break') return null; // Don't show breaks for booking
          
          const registered = isRegistered(slot.id);
          
          // Enforce strict capacity limits: Auditorium=80, Classroom=65
          let maxAllowed = slot.maxCapacity;
          if (slot.room === 'Auditorium' && maxAllowed > 80) {
            maxAllowed = 80;
          } else if (slot.room === 'Classroom' && maxAllowed > 65) {
            maxAllowed = 65;
          }
          
          const isFull = slot.currentAttendees >= maxAllowed;
          const availableSeats = maxAllowed - slot.currentAttendees;

          return (
            <Card key={slot.id} className={`${
              registered ? 'ring-2 ring-green-500' : 
              isFull ? 'opacity-75 bg-gray-50' :
              availableSeats <= 5 ? 'ring-2 ring-red-400 animate-pulse' :
              ''
            }`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {slot.title}
                      <Badge className={getSlotTypeColor(slot.slotType)}>
                        {slot.slotType} - {getSpeakingDuration(slot.slotType)}
                      </Badge>
                      {registered && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Registered
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-gray-600">{slot.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {slot.room}
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
                        {slot.room === 'Auditorium' && 'Max capacity: 80'}
                        {slot.room === 'Classroom' && 'Max capacity: 65'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {slot.speakers.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Speakers:</h4>
                    <div className="flex flex-wrap gap-2">
                      {slot.speakers.map((speaker, index) => (
                        <Badge key={index} variant="outline">
                          {speaker.firstName} {speaker.lastName} ({speaker.role})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-600">October 1, 2025</span>
                  </div>

                  <div className="flex gap-2">
                    {registered ? (
                      <Button
                        variant="outline"
                        onClick={() => cancelMutation.mutate(slot.id)}
                        disabled={cancelMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel Registration
                      </Button>
                    ) : isFull ? (
                      <Button
                        disabled
                        variant="outline"
                        className="cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Sold Out
                      </Button>
                    ) : (
                      <Button
                        onClick={() => registerMutation.mutate(slot.id)}
                        disabled={registerMutation.isPending}
                        className={`${
                          availableSeats <= 5 ? 'bg-red-600 hover:bg-red-700' :
                          availableSeats <= 10 ? 'bg-orange-600 hover:bg-orange-700' :
                          ''
                        }`}
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
        })}
      </div>

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