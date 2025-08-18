import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, DollarSign, Clock, Star, Search, Filter, ExternalLink, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type BusinessEvent = {
  id: number;
  eventName: string;
  eventSlug: string;
  description: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  maxCapacity: number;
  currentRegistrations: number;
  isTicketed: boolean;
  ticketPrice: number;
  memberDiscount: number;
  registrationRequired: boolean;
  isFeatured: boolean;
  tags: string;
  imageUrl: string;
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
  specialOffers: string;
  requirements: string;
  businessName: string;
  businessAddress: string;
  businessLogo: string;
  createdAt: string;
};

export default function BusinessEvents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<BusinessEvent | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/business-events"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      return apiRequest("POST", `/api/business-events/${eventId}/register`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-events"] });
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event!",
      });
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const filteredEvents = (events as BusinessEvent[]).filter((event: BusinessEvent) => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || event.eventType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getEventTypeBadge = (type: string) => {
    const badges = {
      product_launch: { label: "Product Launch", color: "bg-purple-50 text-purple-700 border-purple-200" },
      workshop: { label: "Workshop", color: "bg-blue-50 text-blue-700 border-blue-200" },
      grand_opening: { label: "Grand Opening", color: "bg-green-50 text-green-700 border-green-200" },
      sale: { label: "Sale", color: "bg-red-50 text-red-700 border-red-200" },
      community_event: { label: "Community", color: "bg-orange-50 text-orange-700 border-orange-200" },
      networking: { label: "Networking", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      other: { label: "Other", color: "bg-gray-50 text-gray-700 border-gray-200" },
    };
    
    const badge = badges[type as keyof typeof badges] || badges.other;
    return <Badge variant="outline" className={badge.color}>{badge.label}</Badge>;
  };

  const formatPrice = (price: number, memberDiscount: number, isMember: boolean) => {
    if (price === 0) return "Free";
    
    const actualPrice = isMember && memberDiscount > 0 
      ? price * (1 - memberDiscount / 100)
      : price;
    
    return `£${(actualPrice / 100).toFixed(2)}${isMember && memberDiscount > 0 ? ` (${memberDiscount}% member discount)` : ''}`;
  };

  const EventDetailsModal = ({ event }: { event: BusinessEvent }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{event.eventName}</h2>
              <p className="text-gray-600">{event.businessName}</p>
            </div>
            <div className="flex items-center gap-2">
              {event.isFeatured && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Star className="w-3 h-3 mr-1" />Featured
                </Badge>
              )}
              {getEventTypeBadge(event.eventType)}
            </div>
          </div>

          {event.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">About This Event</h3>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Event Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  {event.eventDate} • {event.startTime} - {event.endTime}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  {event.venue}
                  {event.venueAddress && <span className="text-gray-500 ml-1">• {event.venueAddress}</span>}
                </div>
                {event.maxCapacity && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    {event.currentRegistrations}/{event.maxCapacity} registered
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  {event.registrationRequired ? "Registration Required" : "Drop-in Event"}
                </div>
                {event.isTicketed && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                    {formatPrice(event.ticketPrice, event.memberDiscount, true)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                {event.contactEmail && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-500" />
                    <a href={`mailto:${event.contactEmail}`} className="text-blue-600 hover:underline">
                      {event.contactEmail}
                    </a>
                  </div>
                )}
                {event.contactPhone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <a href={`tel:${event.contactPhone}`} className="text-blue-600 hover:underline">
                      {event.contactPhone}
                    </a>
                  </div>
                )}
                {event.websiteUrl && (
                  <div className="flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2 text-gray-500" />
                    <a 
                      href={event.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {event.specialOffers && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Special Offers</h3>
              <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{event.specialOffers}</p>
            </div>
          )}

          {event.requirements && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="text-gray-700">{event.requirements}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>
              Close
            </Button>
            {isAuthenticated && event.registrationRequired && (
              <Button 
                onClick={() => registerMutation.mutate(event.id)}
                disabled={registerMutation.isPending || (event.maxCapacity && event.currentRegistrations >= event.maxCapacity)}
              >
                {registerMutation.isPending ? "Registering..." : 
                 (event.maxCapacity && event.currentRegistrations >= event.maxCapacity) ? "Event Full" : "Register"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Events</h1>
        <p className="text-gray-600">Discover exciting events hosted by local businesses in our community.</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search events or businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="product_launch">Product Launch</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="grand_opening">Grand Opening</SelectItem>
            <SelectItem value="sale">Sale/Promotion</SelectItem>
            <SelectItem value="community_event">Community Event</SelectItem>
            <SelectItem value="networking">Networking</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event: BusinessEvent) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{event.eventName}</CardTitle>
                      {event.isFeatured && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Star className="w-3 h-3 mr-1" />Featured
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      <span className="font-medium">{event.businessName}</span> • {event.eventDate} • {event.startTime} - {event.endTime}
                    </CardDescription>
                  </div>
                  {getEventTypeBadge(event.eventType)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {event.venue}
                  </div>
                  {event.maxCapacity && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-500" />
                      {event.currentRegistrations}/{event.maxCapacity}
                    </div>
                  )}
                  {event.isTicketed ? (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      £{(event.ticketPrice / 100).toFixed(2)}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      Free
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {event.registrationRequired ? "Registration Required" : "Drop-in"}
                  </div>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                )}
                {event.specialOffers && (
                  <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                    <strong>Special Offer:</strong> {event.specialOffers}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedEvent && <EventDetailsModal event={selectedEvent} />}
    </div>
  );
}