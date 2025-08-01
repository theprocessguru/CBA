import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Users, Ticket, GraduationCap, Award, Star } from "lucide-react";
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
  registrationFee: string | number;
  status: string;
  eventType: string;
  tags: string[];
  createdAt: string;
}

interface EventRegistration {
  id: number;
  eventId: number;
  ticketId: string;
  participantName: string;
  participantEmail: string;
  registrationType: string;
  status: string;
}

// Membership benefits for events
const membershipEventBenefits = {
  "Starter Tier": {
    freeEvents: 2,
    discountPercent: 0,
    priorityBooking: false,
    features: ["Access to basic workshops", "Digital certificates"]
  },
  "Growth Tier": {
    freeEvents: 5,
    discountPercent: 25,
    priorityBooking: true,
    features: ["Access to all workshops", "Priority booking", "25% discount on paid events", "Physical certificates"]
  },
  "Strategic Tier": {
    freeEvents: 10,
    discountPercent: 50,
    priorityBooking: true,
    features: ["Unlimited workshop access", "50% discount on all events", "VIP seating", "1-on-1 networking sessions"]
  },
  "Patron Tier": {
    freeEvents: 999,
    discountPercent: 75,
    priorityBooking: true,
    features: ["Unlimited free events", "75% discount on premium events", "Speaker meet & greet", "Exclusive content access"]
  },
  "Partner": {
    freeEvents: 999,
    discountPercent: 100,
    priorityBooking: true,
    features: ["All events completely free", "Co-hosting opportunities", "Speaking opportunities", "Brand partnerships"]
  }
};

export default function EventsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showBenefitsDialog, setShowBenefitsDialog] = useState(false);

  // Fetch published events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch user's registrations
  const { data: userRegistrations = [] } = useQuery<EventRegistration[]>({
    queryKey: ["/api/user/event-registrations"],
    enabled: isAuthenticated,
  });

  // Register for event mutation
  const registerMutation = useMutation({
    mutationFn: async (registrationData: any) => {
      const response = await apiRequest("POST", `/api/events/${selectedEvent?.id}/register`, registrationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/event-registrations"] });
      setShowRegistrationDialog(false);
      setSelectedEvent(null);
      toast({
        title: "Registration Successful",
        description: "You have been registered for the event. Check your email for the ticket.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Failed to register for event: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = (formData: FormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to register for events",
        variant: "destructive",
      });
      return;
    }

    const registrationData = {
      participantName: formData.get("participantName"),
      participantEmail: formData.get("participantEmail"),
      participantPhone: formData.get("participantPhone"),
      registrationType: "general",
      specialRequirements: formData.get("specialRequirements"),
    };

    registerMutation.mutate(registrationData);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "workshop": return <GraduationCap className="w-5 h-5" />;
      case "seminar": return <Award className="w-5 h-5" />;
      case "networking": return <Users className="w-5 h-5" />;
      case "training": return <Star className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "workshop": return "bg-blue-100 text-blue-800";
      case "seminar": return "bg-green-100 text-green-800";
      case "networking": return "bg-purple-100 text-purple-800";
      case "training": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateEventPrice = (basePrice: number) => {
    if (!user || basePrice === 0) return basePrice;
    
    const membershipTier = (user as any).membershipTier || "Starter Tier";
    const benefits = membershipEventBenefits[membershipTier as keyof typeof membershipEventBenefits];
    
    if (!benefits) return basePrice;
    
    const discountAmount = (basePrice * benefits.discountPercent) / 100;
    return Math.max(0, basePrice - discountAmount);
  };

  const getMembershipBenefits = () => {
    if (!user) return null;
    const membershipTier = (user as any).membershipTier || "Starter Tier";
    return membershipEventBenefits[membershipTier as keyof typeof membershipEventBenefits];
  };

  const isUserRegistered = (eventId: number) => {
    return userRegistrations.some(reg => reg.eventId === eventId);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading events...</div>;
  }

  const publishedEvents = events.filter(event => event.status === 'published');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground">Discover workshops, seminars, and networking opportunities</p>
        </div>
        {isAuthenticated && (
          <Dialog open={showBenefitsDialog} onOpenChange={setShowBenefitsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                My Benefits
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Your Event Benefits</DialogTitle>
              </DialogHeader>
              {getMembershipBenefits() && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge className="text-lg px-4 py-2">{(user as any)?.membershipTier}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Free Events:</span>
                      <span className="text-sm">{getMembershipBenefits()?.freeEvents === 999 ? "Unlimited" : getMembershipBenefits()?.freeEvents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Event Discount:</span>
                      <span className="text-sm">{getMembershipBenefits()?.discountPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Priority Booking:</span>
                      <span className="text-sm">{getMembershipBenefits()?.priorityBooking ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Benefits Include:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      {getMembershipBenefits()?.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {publishedEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Available</h3>
          <p className="text-muted-foreground">Check back soon for upcoming workshops and seminars!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedEvents.map((event) => {
            const originalPrice = parseFloat(event.registrationFee.toString()) || 0;
            const memberPrice = calculateEventPrice(originalPrice);
            const isRegistered = isUserRegistered(event.id);
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-300">
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
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      Max {event.maxCapacity} attendees
                    </div>
                  </div>

                  {/* Pricing Information */}
                  <div className="pt-2 border-t">
                    {originalPrice === 0 ? (
                      <div className="text-lg font-bold text-green-600">FREE</div>
                    ) : (
                      <div className="space-y-1">
                        {isAuthenticated && memberPrice < originalPrice ? (
                          <div>
                            <div className="text-lg font-bold text-green-600">£{memberPrice.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              <span className="line-through">£{originalPrice.toFixed(2)}</span>
                              <span className="ml-2 text-green-600">
                                {getMembershipBenefits()?.discountPercent}% member discount
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-lg font-bold">£{originalPrice.toFixed(2)}</div>
                        )}
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
                    {isRegistered ? (
                      <Button className="w-full" disabled>
                        <Ticket className="w-4 h-4 mr-2" />
                        Registered
                      </Button>
                    ) : isAuthenticated ? (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowRegistrationDialog(true);
                        }}
                      >
                        Register Now
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => window.location.href = '/login'}
                      >
                        Login to Register
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleRegister(new FormData(e.currentTarget));
          }} className="space-y-4">
            <div>
              <Label htmlFor="participantName">Full Name</Label>
              <Input 
                name="participantName" 
                defaultValue={user ? `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() : ''}
                required 
              />
            </div>
            <div>
              <Label htmlFor="participantEmail">Email Address</Label>
              <Input 
                type="email" 
                name="participantEmail" 
                defaultValue={(user as any)?.email || ''}
                required 
              />
            </div>
            <div>
              <Label htmlFor="participantPhone">Phone Number (Optional)</Label>
              <Input name="participantPhone" type="tel" />
            </div>
            <div>
              <Label htmlFor="specialRequirements">Special Requirements (Optional)</Label>
              <Textarea 
                name="specialRequirements" 
                rows={2}
                placeholder="Dietary requirements, accessibility needs, etc."
              />
            </div>

            {/* Pricing Summary */}
            {selectedEvent && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Cost:</span>
                  <div className="text-right">
                    {selectedEvent.registrationFee === 0 ? (
                      <span className="text-lg font-bold text-green-600">FREE</span>
                    ) : (
                      <div>
                        <span className="text-lg font-bold">£{calculateEventPrice(selectedEvent.registrationFee).toFixed(2)}</span>
                        {isAuthenticated && calculateEventPrice(selectedEvent.registrationFee) < selectedEvent.registrationFee && (
                          <div className="text-sm text-muted-foreground">
                            <span className="line-through">£{selectedEvent.registrationFee.toFixed(2)}</span>
                            <span className="ml-1 text-green-600">Member discount applied</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Registering..." : "Complete Registration"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}