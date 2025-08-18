import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Users, MapPin, Calendar, Check, X } from "lucide-react";
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

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
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
          const isFull = slot.currentAttendees >= slot.maxCapacity;
          const availableSeats = slot.maxCapacity - slot.currentAttendees;

          return (
            <Card key={slot.id} className={`${registered ? 'ring-2 ring-green-500' : ''}`}>
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
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      {availableSeats} of {slot.maxCapacity} seats available
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
                    ) : (
                      <Button
                        onClick={() => registerMutation.mutate(slot.id)}
                        disabled={registerMutation.isPending || isFull}
                        className={isFull ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {isFull ? "Fully Booked" : "Book Seat"}
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