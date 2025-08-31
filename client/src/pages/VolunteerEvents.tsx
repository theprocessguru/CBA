import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, Heart, HandHelping, AlertCircle, CheckCircle, Navigation } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  status: string;
  eventType: string;
  tags: string[];
  volunteerRoles?: VolunteerRole[];
}

interface VolunteerRole {
  id: number;
  eventId: number;
  roleName: string;
  roleDescription: string;
  requirements?: string;
  timeCommitment?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  maxVolunteers: number;
  currentVolunteers: number;
  isActive: boolean;
}

interface VolunteerSignup {
  id: number;
  eventId: number;
  volunteerRoleId?: number;
  name: string;
  email: string;
  role: string;
  status: string;
  signedUpAt: string;
}

export default function VolunteerEventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedRole, setSelectedRole] = useState<VolunteerRole | null>(null);
  const [showVolunteerDialog, setShowVolunteerDialog] = useState(false);

  // Fetch published events with volunteer opportunities
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/volunteer/events"],
  });

  // Fetch user's volunteer signups
  const { data: myVolunteerSignups = [] } = useQuery<VolunteerSignup[]>({
    queryKey: ["/api/volunteer/my-signups"],
    enabled: isAuthenticated,
  });

  // Volunteer signup mutation
  const volunteerMutation = useMutation({
    mutationFn: async (signupData: any) => {
      const response = await apiRequest("POST", `/api/volunteer/events/${selectedEvent?.id}/signup`, signupData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer/my-signups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer/events"] });
      setShowVolunteerDialog(false);
      setSelectedEvent(null);
      setSelectedRole(null);
      toast({
        title: "Volunteer Signup Successful",
        description: "Thank you for volunteering! You'll receive confirmation details via email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Signup Failed",
        description: "Failed to sign up as volunteer: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleVolunteerSignup = (formData: FormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to volunteer for events",
        variant: "destructive",
      });
      return;
    }

    const signupData = {
      volunteerRoleId: selectedRole?.id,
      name: formData.get("volunteerName"),
      email: formData.get("volunteerEmail"),
      phone: formData.get("volunteerPhone"),
      role: selectedRole?.roleName || "General Volunteer",
      experience: formData.get("experience"),
      availability: formData.get("availability"),
      tShirtSize: formData.get("tShirtSize"),
      emergencyContact: formData.get("emergencyContact"),
    };

    volunteerMutation.mutate(signupData);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "workshop": return <HandHelping className="w-5 h-5" />;
      case "seminar": return <Users className="w-5 h-5" />;
      case "networking": return <Heart className="w-5 h-5" />;
      case "conference": return <Calendar className="w-5 h-5" />;
      default: return <HandHelping className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "workshop": return "bg-blue-100 text-blue-800";
      case "seminar": return "bg-green-100 text-green-800";
      case "networking": return "bg-purple-100 text-purple-800";
      case "conference": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isSignedUpForEvent = (eventId: number) => {
    return myVolunteerSignups.some(signup => signup.eventId === eventId);
  };

  const getSignedUpRole = (eventId: number) => {
    const signup = myVolunteerSignups.find(signup => signup.eventId === eventId);
    return signup?.role || null;
  };

  const getDirectionsToVenue = (location: string) => {
    const encodedLocation = encodeURIComponent(location);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
    window.open(mapsUrl, '_blank');
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading volunteer opportunities...</div>;
  }

  const upcomingEvents = events.filter(event => 
    event.status === 'published' && new Date(event.startDate) > new Date()
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            Volunteer Opportunities
          </h1>
          <p className="text-muted-foreground">Make a difference by volunteering at upcoming events</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            {myVolunteerSignups.length} Events Volunteering
          </div>
          <div className="text-sm text-muted-foreground">Your impact matters!</div>
        </div>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12">
          <HandHelping className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Volunteer Opportunities Available</h3>
          <p className="text-muted-foreground">Check back soon for upcoming events that need volunteers!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => {
            const isSignedUp = isSignedUpForEvent(event.id);
            const signedUpRole = getSignedUpRole(event.id);
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      {getEventTypeIcon(event.eventType)}
                      <span>{event.title}</span>
                    </CardTitle>
                    <Badge className={getEventTypeColor(event.eventType)}>
                      {event.eventType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(event.startDate), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(new Date(event.startDate), "h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center flex-1 min-w-0">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 h-7 px-2 text-xs"
                        onClick={() => getDirectionsToVenue(event.location)}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>

                  {/* Volunteer Role Information */}
                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2 flex items-center">
                      <HandHelping className="w-4 h-4 mr-1" />
                      Volunteer Roles Needed:
                    </div>
                    {event.volunteerRoles && event.volunteerRoles.length > 0 ? (
                      <div className="space-y-2">
                        {event.volunteerRoles.slice(0, 2).map((role) => (
                          <div key={role.id} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium">{role.roleName}</div>
                            <div className="text-muted-foreground truncate">{role.roleDescription}</div>
                            <div className="flex justify-between mt-1">
                              <span>{role.timeCommitment || "Flexible timing"}</span>
                              <span className="text-green-600">
                                {role.currentVolunteers}/{role.maxVolunteers} signed up
                              </span>
                            </div>
                          </div>
                        ))}
                        {event.volunteerRoles.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{event.volunteerRoles.length - 2} more roles available
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                        General volunteering opportunities available
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4">
                    {isSignedUp ? (
                      <div className="space-y-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Signed Up as {signedUpRole}
                        </Button>
                        <div className="text-xs text-center text-muted-foreground">
                          Thank you for volunteering! Check your email for details.
                        </div>
                      </div>
                    ) : isAuthenticated ? (
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700" 
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowVolunteerDialog(true);
                        }}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Volunteer for This Event
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => window.location.href = '/login'}
                      >
                        Login to Volunteer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Volunteer Signup Dialog */}
      <Dialog open={showVolunteerDialog} onOpenChange={setShowVolunteerDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Heart className="w-5 h-5 text-red-500 mr-2" />
              Volunteer for {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {/* Show Available Roles */}
          {selectedEvent?.volunteerRoles && selectedEvent.volunteerRoles.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">Select Volunteer Role:</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedEvent.volunteerRoles.map((role) => (
                  <div 
                    key={role.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedRole?.id === role.id 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{role.roleName}</div>
                        <div className="text-xs text-muted-foreground mt-1">{role.roleDescription}</div>
                        {role.requirements && (
                          <div className="text-xs text-blue-600 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            {role.requirements}
                          </div>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {role.timeCommitment && <span>⏰ {role.timeCommitment}</span>}
                          {role.location && <span>📍 {role.location}</span>}
                        </div>
                      </div>
                      <div className="text-xs text-green-600 ml-2">
                        {role.currentVolunteers}/{role.maxVolunteers} volunteers
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            handleVolunteerSignup(new FormData(e.currentTarget));
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volunteerName">Full Name</Label>
                <Input 
                  name="volunteerName" 
                  defaultValue={user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : ''}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="volunteerEmail">Email Address</Label>
                <Input 
                  type="email" 
                  name="volunteerEmail" 
                  defaultValue={(user as any)?.email || ''}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volunteerPhone">Phone Number</Label>
                <Input name="volunteerPhone" type="tel" required />
              </div>
              <div>
                <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                <select name="tShirtSize" className="w-full p-2 border border-gray-300 rounded-md" required>
                  <option value="">Select size...</option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="XXXL">XXXL</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Volunteer Experience (Optional)</Label>
              <Textarea 
                name="experience" 
                rows={2}
                placeholder="Brief description of any relevant volunteer experience..."
              />
            </div>

            <div>
              <Label htmlFor="availability">Your Availability</Label>
              <Textarea 
                name="availability" 
                rows={2}
                placeholder="When are you available to volunteer? Any time constraints?"
                required
              />
            </div>

            <div>
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input 
                name="emergencyContact" 
                placeholder="Name and phone number of emergency contact"
                required
              />
            </div>

            {selectedRole && (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="font-medium text-red-800">Selected Role: {selectedRole.roleName}</div>
                <div className="text-sm text-red-600 mt-1">{selectedRole.roleDescription}</div>
                {selectedRole.timeCommitment && (
                  <div className="text-sm text-red-600 mt-1">Time Commitment: {selectedRole.timeCommitment}</div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={volunteerMutation.isPending}>
              {volunteerMutation.isPending ? "Signing Up..." : "Complete Volunteer Signup"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}