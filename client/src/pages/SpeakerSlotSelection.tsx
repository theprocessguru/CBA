import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

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
  isBreak: boolean;
  displayOrder: number;
  isAvailable: boolean;
  speakers?: Array<{
    speakerId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
}

interface SpeakerData {
  name: string;
  email: string;
  company: string;
  talkTitle: string;
  talkDescription: string;
  sessionType: string;
}

export default function SpeakerSlotSelection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Fetch AI Summit time slots
  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ["/api/events/1/time-slots"], // AI Summit event ID = 1
  });

  // Fetch current user's speaker data
  const { data: speakerData } = useQuery<SpeakerData>({
    queryKey: ["/api/speaker/profile"],
    enabled: !!user,
  });

  // Book time slot mutation
  const bookSlotMutation = useMutation({
    mutationFn: async (slotId: number) => {
      return apiRequest(`/api/time-slots/${slotId}/book`, "POST", {
        speakerId: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your presentation slot has been booked successfully.",
      });
      // Refresh time slots
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Unable to book this time slot.",
        variant: "destructive",
      });
    },
  });

  const handleBookSlot = (slotId: number) => {
    if (!speakerData?.talkTitle) {
      toast({
        title: "Complete Your Speaker Profile",
        description: "Please submit your speaker interest form with talk details first.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedSlotId(slotId);
    bookSlotMutation.mutate(slotId);
  };

  const getSlotTypeColor = (slotType: string) => {
    switch (slotType) {
      case 'keynote': return 'bg-red-100 text-red-800';
      case 'talk': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'panel': return 'bg-purple-100 text-purple-800';
      case 'demo': return 'bg-orange-100 text-orange-800';
      case 'break': return 'bg-gray-100 text-gray-800';
      case 'transition': return 'bg-gray-100 text-gray-800';
      case 'closing': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading available time slots...</div>
      </div>
    );
  }

  const availableSlots = (timeSlots as TimeSlot[]).filter(slot => 
    !slot.isBreak && 
    slot.slotType !== 'closing' && 
    slot.slotType !== 'transition' &&
    (!slot.speakers || slot.speakers.length === 0)
  );

  const bookedSlots = (timeSlots as TimeSlot[]).filter(slot => 
    slot.speakers && slot.speakers.some(s => s.speakerId === user?.id)
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Summit - Speaker Slot Selection</h1>
        <p className="text-muted-foreground">
          Choose your preferred presentation time slot for October 1st, 2025
        </p>
      </div>

      {/* Speaker Profile Status */}
      {speakerData ? (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Speaker Profile Complete
            </CardTitle>
            <CardDescription>
              <strong>Talk:</strong> {speakerData.talkTitle}<br/>
              <strong>Type:</strong> {speakerData.sessionType}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Complete Your Speaker Profile
            </CardTitle>
            <CardDescription>
              You need to submit your speaker interest form before booking a time slot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/ai-summit/speaker-interest'}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Submit Speaker Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Your Booked Slots */}
      {bookedSlots.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Booked Presentation</CardTitle>
          </CardHeader>
          <CardContent>
            {bookedSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div>
                  <h3 className="font-semibold">{slot.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(slot.startTime), "h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {slot.room}
                    </span>
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">Booked</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Available Time Slots</CardTitle>
          <CardDescription>
            Choose from 25-minute or 50-minute presentation slots (includes Q&A time). Room transitions handled automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {availableSlots.map((slot) => (
              <div key={slot.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{slot.title}</h3>
                      <Badge className={getSlotTypeColor(slot.slotType)}>
                        {slot.slotType}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {slot.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(slot.startTime), "h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {Math.round((new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / 60000)} mins
                        </Badge>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {slot.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Capacity: {slot.maxCapacity}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleBookSlot(slot.id)}
                    disabled={!speakerData?.talkTitle || bookSlotMutation.isPending}
                    className="ml-4"
                  >
                    {bookSlotMutation.isPending && selectedSlotId === slot.id 
                      ? "Booking..." 
                      : "Book This Slot"
                    }
                  </Button>
                </div>
              </div>
            ))}
            
            {availableSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>All presentation slots are currently booked.</p>
                <p className="text-sm mt-2">Contact the organizers if you need assistance.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Schedule Overview */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Full Event Schedule - October 1st, 2025</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b">
              <span className="font-medium">10:00 AM</span>
              <span>Doors Open - Registration & Networking</span>
            </div>
            {(timeSlots as TimeSlot[])
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((slot) => (
                <div key={slot.id} className="flex justify-between py-1 border-b">
                  <span className="font-medium">
                    {format(new Date(slot.startTime), "h:mm a")}
                  </span>
                  <span className="flex items-center gap-2">
                    {slot.title}
                    {slot.speakers && slot.speakers.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {slot.speakers.map(s => `${s.firstName} ${s.lastName}`).join(", ")}
                      </Badge>
                    )}
                  </span>
                </div>
              ))}
            <div className="flex justify-between py-1 font-medium">
              <span>4:00 PM</span>
              <span>Event Ends</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}