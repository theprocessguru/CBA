import { useState, useRef, useEffect } from "react";
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
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Eye, Upload, Image, ChevronRight, Layers, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Event {
  id: number;
  eventName: string;
  title: string;
  description: string;
  eventDate: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  maxCapacity: number;
  registrationFee: number;
  status: string;
  eventType: string;
  tags: string[];
  topicsOfInterest?: string[];
  imageUrl?: string;
  createdAt: string;
}

interface EventRegistration {
  id: number;
  eventId: number;
  attendeeName: string;
  attendeeEmail: string;
  company?: string;
  jobTitle?: string;
  phoneNumber?: string;
  dietaryRequirements?: string;
  registrationType: string;
  registeredAt: string;
  customRole?: string;
  userId?: string;
  pricingStatus?: string;
  paymentStatus?: string;
  adminNotes?: string;
}

interface EventTimeSlot {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  slotType: string; // workshop, presentation, panel, break, networking, q&a
  slotDate: string;
  startTime: string;
  endTime: string;
  room?: string;
  maxCapacity?: number;
  currentAttendees: number;
  speakerId?: string;
  moderatorId?: string;
  isBreak: boolean;
  requiresRegistration: boolean;
  displayOrder: number;
}

export default function EventManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRegistrationsDialog, setShowRegistrationsDialog] = useState(false);
  const [showSubEventsDialog, setShowSubEventsDialog] = useState(false);
  const [showCreateSubEventDialog, setShowCreateSubEventDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all events
  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch registrations for selected event
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery<EventRegistration[]>({
    queryKey: selectedEvent?.id ? [`/api/admin/events/${selectedEvent.id}/registrations`] : [],
    enabled: !!selectedEvent && !!selectedEvent?.id && showRegistrationsDialog,
  });

  // Fetch sub-events (time slots) for selected event
  const { data: subEvents = [], isLoading: subEventsLoading } = useQuery<EventTimeSlot[]>({
    queryKey: selectedEvent?.id ? [`/api/events/${selectedEvent.id}/time-slots`] : [],
    enabled: !!selectedEvent && !!selectedEvent?.id && showSubEventsDialog,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", "/api/admin/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowCreateDialog(false);
      setImageFile(null);
      setImagePreview(null);
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
      const response = await apiRequest("PUT", `/api/admin/events/${id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEditDialog(false);
      setSelectedEvent(null);
      setImageFile(null);
      setImagePreview(null);
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
      await apiRequest("DELETE", `/api/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
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
      eventName: formData.get("title"),
      eventSlug: (formData.get("title") as string)?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '',
      description: formData.get("description"),
      eventDate: formData.get("eventDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      venue: formData.get("location"),
      maxCapacity: parseInt(formData.get("maxCapacity") as string) || 100,
      registrationFee: parseFloat(formData.get("registrationFee") as string) || 0,
      eventType: formData.get("eventType") || "workshop",
      tags: (formData.get("tags") as string)?.split(",").map(tag => tag.trim()) || [],
      topicsOfInterest: formData.get("topicsOfInterest") ? JSON.parse(formData.get("topicsOfInterest") as string) : [],
      isActive: formData.get("isActive") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      requiresApproval: formData.get("requiresApproval") === "on",
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
      eventName: formData.get("title"),
      description: formData.get("description"),
      eventDate: formData.get("eventDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      venue: formData.get("location"),
      maxCapacity: parseInt(formData.get("maxCapacity") as string) || 100,
      registrationFee: parseFloat(formData.get("registrationFee") as string) || 0,
      topicsOfInterest: formData.get("topicsOfInterest") ? JSON.parse(formData.get("topicsOfInterest") as string) : selectedEvent.topicsOfInterest || [],
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
  }) => {
    const [eventType, setEventType] = useState(event?.eventType || "workshop");
    const [customEventType, setCustomEventType] = useState("");
    const [status, setStatus] = useState(event?.status || "draft");
    const [topicsOfInterest, setTopicsOfInterest] = useState<string[]>(event?.topicsOfInterest || []);
    const [newTopic, setNewTopic] = useState("");
    
    // Reset form state when event changes
    useEffect(() => {
      // Check if the event type is one of the predefined types
      const predefinedTypes = ["workshop", "seminar", "networking", "training", "conference", "summit", "community"];
      if (event?.eventType && !predefinedTypes.includes(event.eventType)) {
        setEventType("other");
        setCustomEventType(event.eventType);
      } else {
        setEventType(event?.eventType || "workshop");
        setCustomEventType("");
      }
      setStatus(event?.status || "draft");
      setTopicsOfInterest(event?.topicsOfInterest || []);
    }, [event]);
    
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Use custom event type if "other" is selected
        const finalEventType = eventType === "other" ? customEventType : eventType;
        formData.set("eventType", finalEventType);
        formData.set("status", status);
        
        // Generate eventSlug from title
        const title = formData.get("title") as string;
        const eventSlug = title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';
        formData.set("eventSlug", eventSlug);
        
        // Map form field names to backend schema names
        formData.set("eventName", title);
        formData.set("venue", formData.get("location") as string);
        
        // Add topics of interest to form data
        formData.set("topicsOfInterest", JSON.stringify(topicsOfInterest));
        
        onSubmit(formData);
      }} className="space-y-4">
        <div>
          <Label htmlFor="title">Event Title</Label>
          <Input name="title" defaultValue={event?.eventName || event?.title} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eventType">Event Type (Select or Enter Custom)</Label>
            <Select value={eventType} onValueChange={(value) => {
              setEventType(value);
              if (value !== "other") {
                setCustomEventType("");
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="summit">Summit</SelectItem>
                <SelectItem value="community">Community Event</SelectItem>
                <SelectItem value="other">Other (Use Custom Type)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="customEventType">Or Enter Custom Type</Label>
            <Input 
              name="customEventType" 
              value={customEventType}
              onChange={(e) => {
                setCustomEventType(e.target.value);
                if (e.target.value) {
                  setEventType("other");
                }
              }}
              placeholder="e.g., Hackathon, Meetup, Exhibition"
            />
          </div>
        </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea name="description" defaultValue={event?.description} rows={3} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="eventDate">Event Date</Label>
          <Input 
            type="date" 
            name="eventDate" 
            defaultValue={event?.eventDate || ""}
            required 
          />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input 
            type="time" 
            name="startTime" 
            defaultValue={event?.startTime || ""}
            required 
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input 
            type="time" 
            name="endTime" 
            defaultValue={event?.endTime || ""}
            required 
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input name="location" defaultValue={event?.venue} placeholder="Event venue address" required />
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
          <Select value={status} onValueChange={setStatus}>
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

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            name="isActive" 
            id="isActive" 
            defaultChecked={event?.status === 'published' || !event}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            name="isFeatured" 
            id="isFeatured" 
            className="rounded border-gray-300"
          />
          <Label htmlFor="isFeatured">Featured</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            name="requiresApproval" 
            id="requiresApproval" 
            className="rounded border-gray-300"
          />
          <Label htmlFor="requiresApproval">Requires Approval</Label>
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
        <Label>Topics of Interest</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Define topics that attendees can select from when registering for this event
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g., AI Basics, Career Opportunities"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newTopic.trim() && !topicsOfInterest.includes(newTopic.trim())) {
                    setTopicsOfInterest([...topicsOfInterest, newTopic.trim()]);
                    setNewTopic("");
                  }
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                if (newTopic.trim() && !topicsOfInterest.includes(newTopic.trim())) {
                  setTopicsOfInterest([...topicsOfInterest, newTopic.trim()]);
                  setNewTopic("");
                }
              }}
              disabled={!newTopic.trim()}
            >
              Add Topic
            </Button>
          </div>
          
          {topicsOfInterest.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Topics:</p>
              <div className="flex flex-wrap gap-2">
                {topicsOfInterest.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {topic}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        setTopicsOfInterest(topicsOfInterest.filter((_, i) => i !== index));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Event Logo/Image</Label>
        <div className="space-y-2">
          {(imagePreview || event?.imageUrl) && (
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={imagePreview || event?.imageUrl} 
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
  };

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
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          if (open) {
            setImageFile(null);
            setImagePreview(null);
          }
          setShowCreateDialog(open);
        }}>
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

                  <div className="flex flex-wrap gap-2 pt-3">
                    {(event.eventType === "summit" || event.eventType === "conference") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowSubEventsDialog(true);
                        }}
                        className="text-xs"
                      >
                        <Layers className="w-3 h-3 mr-1" />
                        Sub-Events
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowRegistrationsDialog(true);
                      }}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Attendees
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEvent(event);
                        setImageFile(null);
                        setImagePreview(event.imageUrl || null);
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
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setSelectedEvent(null);
          setImageFile(null);
          setImagePreview(null);
        }
        setShowEditDialog(open);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm 
              event={selectedEvent || undefined} 
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
                <div className="text-sm text-muted-foreground mb-4">
                  Total Registrations: {registrations.length}
                </div>
                {registrations.map((registration: EventRegistration) => (
                  <Card key={registration.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{registration.attendeeName}</p>
                          <p className="text-muted-foreground">{registration.attendeeEmail}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Company</p>
                          <p>{registration.company || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="capitalize">{registration.customRole || registration.registrationType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment</p>
                          <Badge className={
                            registration.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                            registration.pricingStatus === 'free' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {registration.pricingStatus || 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                      {(registration.jobTitle || registration.phoneNumber) && (
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                          {registration.jobTitle && (
                            <div>
                              <span className="text-muted-foreground">Job Title: </span>
                              {registration.jobTitle}
                            </div>
                          )}
                          {registration.phoneNumber && (
                            <div>
                              <span className="text-muted-foreground">Phone: </span>
                              {registration.phoneNumber}
                            </div>
                          )}
                        </div>
                      )}
                      {registration.adminNotes && (
                        <div className="mt-3 text-sm">
                          <span className="text-muted-foreground">Admin Notes: </span>
                          {registration.adminNotes}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        Registered: {new Date(registration.registeredAt).toLocaleDateString('en-GB')}
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

      {/* Sub-Events Dialog */}
      <Dialog open={showSubEventsDialog} onOpenChange={setShowSubEventsDialog}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Sub-Events for {selectedEvent?.eventName || selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Manage workshops, talks, and sessions within this {selectedEvent?.eventType}
              </p>
              <Button
                size="sm"
                onClick={() => setShowCreateSubEventDialog(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Sub-Event
              </Button>
            </div>

            {subEventsLoading ? (
              <p>Loading sub-events...</p>
            ) : subEvents.length > 0 ? (
              <div className="space-y-3">
                {subEvents.map((slot: EventTimeSlot) => (
                  <Card key={slot.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{slot.title}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {slot.slotType}
                          </Badge>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">
                            {format(new Date(`2000-01-01 ${slot.startTime}`), "h:mm a")} - 
                            {format(new Date(`2000-01-01 ${slot.endTime}`), "h:mm a")}
                          </p>
                          {slot.room && (
                            <p className="text-muted-foreground">{slot.room}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {slot.description && (
                        <p className="text-sm text-muted-foreground mb-3">{slot.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        {slot.maxCapacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{slot.currentAttendees}/{slot.maxCapacity}</span>
                          </div>
                        )}
                        {slot.requiresRegistration && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Requires Registration
                          </Badge>
                        )}
                        {slot.isBreak && (
                          <Badge className="bg-gray-100 text-gray-800">
                            Break
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No sub-events yet</p>
                <p className="text-sm text-muted-foreground">
                  Add workshops, talks, or sessions to enrich your {selectedEvent?.eventType}
                </p>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Sub-Event Dialog */}
      <Dialog open={showCreateSubEventDialog} onOpenChange={setShowCreateSubEventDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Sub-Event to {selectedEvent?.eventName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const subEventData = {
              eventId: selectedEvent?.id,
              title: formData.get("title"),
              description: formData.get("description"),
              slotType: formData.get("slotType"),
              slotDate: selectedEvent?.eventDate,
              startTime: formData.get("startTime"),
              endTime: formData.get("endTime"),
              room: formData.get("room"),
              maxCapacity: parseInt(formData.get("maxCapacity") as string) || null,
              requiresRegistration: formData.get("requiresRegistration") === "true",
              isBreak: formData.get("slotType") === "break"
            };
            // TODO: Add mutation to create sub-event
            console.log("Creating sub-event:", subEventData);
            setShowCreateSubEventDialog(false);
          }} className="space-y-4">
            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input name="title" placeholder="e.g., AI Workshop: Getting Started" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slotType">Session Type</Label>
                <Select name="slotType" defaultValue="workshop">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="presentation">Presentation/Talk</SelectItem>
                    <SelectItem value="panel">Panel Discussion</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="exhibition">Exhibition</SelectItem>
                    <SelectItem value="qa">Q&A Session</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="room">Room/Location</Label>
                <Input name="room" placeholder="e.g., Main Hall, Room A" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea name="description" rows={3} placeholder="Brief description of the session" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input type="time" name="startTime" required />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input type="time" name="endTime" required />
              </div>
              <div>
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input type="number" name="maxCapacity" placeholder="Leave empty for unlimited" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                name="requiresRegistration" 
                value="true"
                id="requiresRegistration"
                className="rounded"
              />
              <Label htmlFor="requiresRegistration" className="font-normal">
                Requires separate registration (attendees must book this session)
              </Label>
            </div>

            <Button type="submit" className="w-full">
              Create Sub-Event
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}