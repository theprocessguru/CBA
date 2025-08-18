import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, MapPin, Users, DollarSign, Clock, Star } from "lucide-react";
import type { BusinessEvent } from "@shared/schema";

export default function BusinessEventManagement() {
  const [selectedEvent, setSelectedEvent] = useState<BusinessEvent | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/my-business-events"],
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/business-events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-business-events"] });
      setIsCreateMode(false);
      toast({
        title: "Event Created",
        description: "Your event has been submitted for approval.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/business-events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-business-events"] });
      setSelectedEvent(null);
      toast({
        title: "Event Updated",
        description: "Your event has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/business-events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-business-events"] });
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const eventData = {
      eventName: formData.get("eventName"),
      description: formData.get("description"),
      eventType: formData.get("eventType"),
      eventDate: formData.get("eventDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      venue: formData.get("venue"),
      venueAddress: formData.get("venueAddress"),
      maxCapacity: parseInt(formData.get("maxCapacity") as string) || null,
      isTicketed: formData.get("isTicketed") === "true",
      ticketPrice: Math.round((parseFloat(formData.get("ticketPrice") as string) || 0) * 100), // Convert to pence
      memberDiscount: parseInt(formData.get("memberDiscount") as string) || 0,
      registrationRequired: formData.get("registrationRequired") === "true",
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      websiteUrl: formData.get("websiteUrl"),
      specialOffers: formData.get("specialOffers"),
      requirements: formData.get("requirements"),
      tags: formData.get("tags"),
    };

    if (selectedEvent) {
      updateEventMutation.mutate({ id: selectedEvent.id, data: eventData });
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  const getStatusBadge = (event: BusinessEvent) => {
    if (!event.isApproved) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Approval</Badge>;
    }
    if (!event.isActive) {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Inactive</Badge>;
    }
    if (event.isFeatured) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Star className="w-3 h-3 mr-1" />Featured</Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  };

  const EventForm = ({ event }: { event?: BusinessEvent | null }) => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="eventName">Event Name *</Label>
          <Input name="eventName" defaultValue={event?.eventName || ""} required />
        </div>
        <div>
          <Label htmlFor="eventType">Event Type *</Label>
          <Select name="eventType" defaultValue={event?.eventType || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
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
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea name="description" defaultValue={event?.description || ""} rows={3} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="eventDate">Event Date *</Label>
          <Input type="date" name="eventDate" defaultValue={event?.eventDate || ""} required />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time *</Label>
          <Input type="time" name="startTime" defaultValue={event?.startTime || ""} required />
        </div>
        <div>
          <Label htmlFor="endTime">End Time *</Label>
          <Input type="time" name="endTime" defaultValue={event?.endTime || ""} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="venue">Venue Name *</Label>
          <Input name="venue" defaultValue={event?.venue || ""} required />
        </div>
        <div>
          <Label htmlFor="venueAddress">Venue Address</Label>
          <Input name="venueAddress" defaultValue={event?.venueAddress || ""} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxCapacity">Max Capacity</Label>
          <Input type="number" name="maxCapacity" defaultValue={event?.maxCapacity || ""} min="1" />
        </div>
        <div>
          <Label htmlFor="isTicketed">Ticketed Event</Label>
          <Select name="isTicketed" defaultValue={event?.isTicketed ? "true" : "false"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Free Event</SelectItem>
              <SelectItem value="true">Ticketed Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ticketPrice">Ticket Price (£)</Label>
          <Input 
            type="number" 
            step="0.01" 
            name="ticketPrice" 
            defaultValue={event?.ticketPrice ? (event.ticketPrice / 100).toFixed(2) : ""} 
            min="0" 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="memberDiscount">Member Discount (%)</Label>
          <Input type="number" name="memberDiscount" defaultValue={event?.memberDiscount || 0} min="0" max="100" />
        </div>
        <div>
          <Label htmlFor="registrationRequired">Registration Required</Label>
          <Select name="registrationRequired" defaultValue={event?.registrationRequired ? "true" : "false"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Registration Required</SelectItem>
              <SelectItem value="false">Drop-in Event</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input type="email" name="contactEmail" defaultValue={event?.contactEmail || ""} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input name="contactPhone" defaultValue={event?.contactPhone || ""} />
        </div>
      </div>

      <div>
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input type="url" name="websiteUrl" defaultValue={event?.websiteUrl || ""} />
      </div>

      <div>
        <Label htmlFor="specialOffers">Special Offers</Label>
        <Textarea name="specialOffers" defaultValue={event?.specialOffers || ""} placeholder="Any special offers for attendees..." />
      </div>

      <div>
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea name="requirements" defaultValue={event?.requirements || ""} placeholder="Age restrictions, dress code, what to bring..." />
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input name="tags" defaultValue={event?.tags || ""} placeholder="e.g., fashion, tech, food, community" />
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setSelectedEvent(null);
            setIsCreateMode(false);
          }}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createEventMutation.isPending || updateEventMutation.isPending}
        >
          {createEventMutation.isPending || updateEventMutation.isPending ? "Saving..." : selectedEvent ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
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
        <h1 className="text-3xl font-bold mb-2">Business Event Management</h1>
        <p className="text-gray-600">Promote your business events to CBA members and the local community.</p>
      </div>

      {!isCreateMode && !selectedEvent && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Events</h2>
            <Button onClick={() => setIsCreateMode(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </div>

          <div className="grid gap-6">
            {(events as BusinessEvent[]).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No events created yet</h3>
                  <p className="text-gray-600 mb-4">Start promoting your business by creating your first event.</p>
                  <Button onClick={() => setIsCreateMode(true)}>Create Your First Event</Button>
                </CardContent>
              </Card>
            ) : (
              (events as BusinessEvent[]).map((event: BusinessEvent) => (
                <Card key={event.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {event.eventName}
                          {getStatusBadge(event)}
                        </CardTitle>
                        <CardDescription className="capitalize">
                          {event.eventType.replace('_', ' ')} • {event.eventDate} • {event.startTime} - {event.endTime}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedEvent(event)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          disabled={deleteEventMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                      {event.isTicketed && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                          £{((event.ticketPrice || 0) / 100).toFixed(2)}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        {event.registrationRequired ? "Registration Required" : "Drop-in"}
                      </div>
                    </div>
                    {event.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {(isCreateMode || selectedEvent) && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedEvent ? "Edit Event" : "Create New Event"}</CardTitle>
            <CardDescription>
              {selectedEvent ? "Update your event details" : "Fill in the details for your business event. All events require admin approval before going live."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm event={selectedEvent} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}