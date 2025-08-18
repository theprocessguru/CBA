import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Eye, Upload, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxCapacity: number;
  registrationFee: number;
  status: string;
  eventType: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
}

interface EventRegistration {
  id: number;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  registrationType: string;
  status: string;
  registrationDate: string;
  ticketId: string;
}

export default function EventManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRegistrationsDialog, setShowRegistrationsDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch registrations for selected event
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<EventRegistration[]>({
    queryKey: ["/api/events", selectedEvent?.id, "registrations"],
    enabled: !!selectedEvent,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowCreateDialog(false);
      toast({
        title: "Event Created",
        description: "New event has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: any) => {
      const response = await apiRequest("PUT", `/api/events/${id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEditDialog(false);
      setSelectedEvent(null);
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async (formData: FormData) => {
    let imageUrl = formData.get("imageUrl") as string || undefined;
    
    // If there's an image file, convert to base64
    if (imageFile) {
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(imageFile);
      });
    }

    const eventData = {
      title: formData.get("title"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      location: formData.get("location"),
      maxCapacity: parseInt(formData.get("maxCapacity") as string) || 100,
      registrationFee: parseFloat(formData.get("registrationFee") as string) || 0,
      status: formData.get("status") || "draft",
      eventType: formData.get("eventType") || "workshop",
      tags: (formData.get("tags") as string)?.split(",").map(tag => tag.trim()) || [],
      imageUrl: imageUrl,
    };

    createEventMutation.mutate(eventData);
  };

  const handleEditEvent = async (formData: FormData) => {
    if (!selectedEvent) return;

    let imageUrl = formData.get("imageUrl") as string || selectedEvent.imageUrl;
    
    // If there's an image file, convert to base64
    if (imageFile) {
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(imageFile);
      });
    }

    const eventData = {
      id: selectedEvent.id,
      title: formData.get("title"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      location: formData.get("location"),
      maxCapacity: parseInt(formData.get("maxCapacity") as string) || 100,
      registrationFee: parseFloat(formData.get("registrationFee") as string) || 0,
      status: formData.get("status"),
      eventType: formData.get("eventType"),
      tags: (formData.get("tags") as string)?.split(",").map(tag => tag.trim()) || [],
      imageUrl: imageUrl,
    };

    updateEventMutation.mutate(eventData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-100 text-green-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const EventForm = ({ event, onSubmit, submitText }: {
    event?: Event;
    onSubmit: (formData: FormData) => void;
    submitText: string;
  }) => (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(new FormData(e.currentTarget));
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input name="title" defaultValue={event?.title} required />
        </div>
        <div>
          <Label htmlFor="eventType">Event Type</Label>
          <Select name="eventType" defaultValue={event?.eventType || "workshop"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="seminar">Seminar</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea name="description" defaultValue={event?.description} rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date & Time</Label>
          <Input 
            type="datetime-local" 
            name="startDate" 
            defaultValue={event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : ""}
            required 
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date & Time</Label>
          <Input 
            type="datetime-local" 
            name="endDate" 
            defaultValue={event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ""}
            required 
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input name="location" defaultValue={event?.location} placeholder="Event venue address" required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="maxCapacity">Max Capacity</Label>
          <Input type="number" name="maxCapacity" defaultValue={event?.maxCapacity} min="1" required />
        </div>
        <div>
          <Label htmlFor="registrationFee">Registration Fee (£)</Label>
          <Input 
            type="number" 
            step="0.01" 
            name="registrationFee" 
            defaultValue={event?.registrationFee} 
            min="0" 
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={event?.status || "draft"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          name="tags" 
          defaultValue={event?.tags?.join(", ")} 
          placeholder="e.g., business, networking, training"
        />
      </div>

      <div>
        <Label>Event Logo/Image</Label>
        <div className="space-y-2">
          {imagePreview && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Event preview" 
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {imageFile ? 'Change Image' : 'Upload Image'}
            </Button>
            {imageFile && (
              <span className="text-sm text-muted-foreground">
                {imageFile.name}
              </span>
            )}
          </div>
          
          {!imageFile && (
            <>
              <div className="text-sm text-muted-foreground">OR</div>
              <Input 
                name="imageUrl" 
                type="url"
                placeholder="Enter image URL (optional)"
                defaultValue={event?.imageUrl && !imageFile ? event.imageUrl : ''}
                disabled={!!imageFile}
              />
            </>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={createEventMutation.isPending || updateEventMutation.isPending}>
        {submitText}
      </Button>
    </form>
  );

  if (eventsLoading) {
    return <div className="flex justify-center py-8">Loading events...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground">Create and manage general events, workshops, and seminars</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm onSubmit={handleCreateEvent} submitText="Create Event" />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all-events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all-events">All Events</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all-events" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: Event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{event.eventType}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(event.startDate), "MMM dd, yyyy")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {format(new Date(event.startDate), "h:mm a")}
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

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex space-x-2 pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationsDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this event?")) {
                          deleteEventMutation.mutate(event.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="published">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.filter((event: Event) => event.status === 'published').map((event: Event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.filter((event: Event) => event.status === 'draft').map((event: Event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Event Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              event={selectedEvent} 
              onSubmit={handleEditEvent} 
              submitText="Update Event" 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Event Registrations Dialog */}
      <Dialog open={showRegistrationsDialog} onOpenChange={setShowRegistrationsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Registrations - {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {registrationsLoading ? (
              <p>Loading registrations...</p>
            ) : registrations.length > 0 ? (
              <div className="space-y-3">
                {registrations.map((registration: EventRegistration) => (
                  <Card key={registration.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{registration.participantName}</p>
                          <p className="text-muted-foreground">{registration.participantEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p>{registration.participantPhone || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="capitalize">{registration.registrationType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge className={registration.status === 'checked_in' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {registration.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Ticket ID: {registration.ticketId} | Registered: {format(new Date(registration.registrationDate), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No registrations yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}