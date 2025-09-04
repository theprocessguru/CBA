import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  Tag,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Star,
  Upload,
  Image,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";

interface EventData {
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
  registrationDeadline: string;
  isActive: boolean;
  isFeatured: boolean;
  requiresApproval: boolean;
  registrationFee: number;
  memberPrice: number;
  isRecurring: boolean;
  recurringPattern: string;
  tags: string;
  imageUrl: string;
  ghlWorkflowId: string;
  ghlTagName: string;
  createdAt: string;
  updatedAt: string;
}

const eventSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  eventSlug: z.string().min(1, "Event slug is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(1, "Venue is required"),
  venueAddress: z.string().optional(),
  maxCapacity: z.number().min(1, "Capacity must be at least 1"),
  registrationDeadline: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  registrationFee: z.number().min(0, "Fee cannot be negative").default(0),
  memberPrice: z.number().min(0, "Member price cannot be negative").default(0),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
  ghlWorkflowId: z.string().optional(),
  ghlTagName: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function AdminEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need administrator privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
      requiresApproval: false,
      registrationFee: 0,
      memberPrice: 0,
      isRecurring: false,
    },
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageFile(file);
      // Set the base64 string to the form
      form.setValue('imageUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Fetch events
  const { data: events = [], isLoading, refetch } = useQuery<EventData[]>({
    queryKey: ['/api/admin/events'],
    enabled: isAuthenticated && user?.isAdmin
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const response = await apiRequest('POST', '/api/admin/events', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "Event has been created successfully",
      });
      setIsCreateOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (data: EventFormData & { id: number }) => {
      const response = await apiRequest('PUT', `/api/admin/events/${data.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Updated",
        description: "Event has been updated successfully",
      });
      setEditingEvent(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed", 
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/events/${eventId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Event has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/events'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: EventFormData) => {
    if (editingEvent) {
      updateEventMutation.mutate({ ...data, id: editingEvent.id });
    } else {
      createEventMutation.mutate(data);
    }
  };

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
    } catch (error) {
      return '';
    }
  };

  // Helper function to format datetime for input field (YYYY-MM-DDTHH:MM)
  const formatDateTimeForInput = (dateString: string | undefined, timeString: string | undefined) => {
    if (!dateString || !timeString) return '';
    try {
      // Get the base date in YYYY-MM-DD format
      const baseDate = formatDateForInput(dateString);
      if (!baseDate) return '';
      
      // Extract just the time part (HH:MM) from timeString
      const time = timeString.includes(':') ? timeString.slice(0, 5) : '00:00';
      
      // Combine them properly
      return `${baseDate}T${time}`;
    } catch (error) {
      console.error('Date/time formatting error:', error);
      return '';
    }
  };

  const handleEdit = (event: EventData) => {
    setEditingEvent(event);
    setImageFile(null);
    setImagePreview(event.imageUrl || null);
    form.reset({
      eventName: event.eventName,
      eventSlug: event.eventSlug,
      description: event.description || '',
      eventType: event.eventType,
      eventDate: formatDateForInput(event.eventDate),
      startTime: formatDateTimeForInput(event.eventDate, event.startTime),
      endTime: formatDateTimeForInput(event.eventDate, event.endTime),
      venue: event.venue,
      venueAddress: event.venueAddress || '',
      maxCapacity: event.maxCapacity,
      registrationDeadline: formatDateForInput(event.registrationDeadline),
      isActive: event.isActive,
      isFeatured: event.isFeatured,
      requiresApproval: event.requiresApproval,
      registrationFee: event.registrationFee,
      memberPrice: event.memberPrice,
      isRecurring: event.isRecurring,
      recurringPattern: event.recurringPattern || '',
      tags: event.tags || '',
      imageUrl: event.imageUrl || '',
      ghlWorkflowId: event.ghlWorkflowId || '',
      ghlTagName: event.ghlTagName || '',
    });
  };

  const generateSlug = (eventName: string) => {
    return eventName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Function to populate test data for AI Summit 2025
  const populateTestData = () => {
    const testData = {
      eventName: "AI Summit 2025",
      eventSlug: "ai-summit-2025",
      description: "Join us for the premier AI Summit featuring cutting-edge discussions on artificial intelligence, machine learning, and future technology trends. Perfect for business leaders, developers, and tech enthusiasts.",
      eventType: "summit",
      eventDate: "2025-10-01",
      startTime: "2025-10-01T09:00",
      endTime: "2025-10-01T17:00",
      venue: "Croydon Conference Centre",
      venueAddress: "45 High Street, Croydon CR0 1QQ, United Kingdom",
      maxCapacity: 200,
      registrationDeadline: "2025-09-25",
      isActive: true,
      isFeatured: true,
      requiresApproval: false,
      registrationFee: 50.00,
      memberPrice: 35.00,
      isRecurring: false,
      recurringPattern: "",
      tags: "AI, Summit, Technology, Business, Networking, Machine Learning",
      imageUrl: "",
      ghlWorkflowId: "",
      ghlTagName: "",
    };

    // Use form.setValue to populate all fields
    Object.entries(testData).forEach(([key, value]) => {
      form.setValue(key as keyof EventFormData, value);
    });

    toast({
      title: "Test Data Loaded",
      description: "Form populated with AI Summit 2025 test data",
    });
  };

  // Helper function to format dates in UK format
  const formatUKDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      return format(date, 'dd/MM/yyyy', { locale: enGB });
    } catch (error) {
      return dateString || '';
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      workshop: 'bg-blue-100 text-blue-800',
      networking: 'bg-green-100 text-green-800',
      summit: 'bg-purple-100 text-purple-800',
      webinar: 'bg-orange-100 text-orange-800',
      social: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-gray-600 mt-2">Create and manage CBA events</p>
        </div>
        
        <Dialog open={isCreateOpen || !!editingEvent} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingEvent(null);
            setImageFile(null);
            setImagePreview(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Event Name */}
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter event name"
                            onChange={(e) => {
                              field.onChange(e);
                              if (!editingEvent) {
                                form.setValue('eventSlug', generateSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event Slug */}
                  <FormField
                    control={form.control}
                    name="eventSlug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Slug</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="event-url-slug" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event Type */}
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="networking">Networking</SelectItem>
                            <SelectItem value="summit">Summit</SelectItem>
                            <SelectItem value="webinar">Webinar</SelectItem>
                            <SelectItem value="social">Social Event</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Capacity */}
                  <FormField
                    control={form.control}
                    name="maxCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            placeholder="Enter capacity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Event Date */}
                  <FormField
                    control={form.control}
                    name="eventDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Date format in this field follows your browser settings. App displays dates in UK format (DD/MM/YYYY).
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Registration Deadline */}
                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Start Time */}
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Date/time format follows browser settings. App uses UK format.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* End Time */}
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Date/time format follows browser settings. App uses UK format.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Venue */}
                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter venue name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Registration Fee */}
                  <FormField
                    control={form.control}
                    name="registrationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Fee (£)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Member Price */}
                  <FormField
                    control={form.control}
                    name="memberPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member Price (£)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter event description"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Venue Address */}
                <FormField
                  control={form.control}
                  name="venueAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter full venue address"
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Event Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Event is visible and accepting registrations
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Featured</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Show as featured event
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requiresApproval"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requires Approval</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Registrations need admin approval
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="ai, technology, networking" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Event Logo/Image</FormLabel>
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
                                  field.onChange('');
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <X className="w-4 h-4" />
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
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="url"
                                  placeholder="Enter image URL (optional)"
                                  disabled={!!imageFile}
                                />
                              </FormControl>
                            </>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ghlWorkflowId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MyT Automation Workflow ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter MyT Automation workflow ID" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ghlTagName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MyT Automation Tag Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter MyT Automation tag name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingEvent(null);
                      setImageFile(null);
                      setImagePreview(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  {!editingEvent && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={populateTestData}
                      title="Fill form with AI Summit 2025 test data"
                    >
                      Fill Test Data
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Events Created</h3>
            <p className="text-gray-600 mb-4">Create your first event to get started</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{event.eventName}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                      {event.isFeatured && (
                        <Badge variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {!event.isActive && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          deleteEventMutation.mutate(event.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatUKDate(event.eventDate)}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {event.startTime?.slice(0, 5) || 'TBC'} - {event.endTime?.slice(0, 5) || 'TBC'}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {event.venue}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {event.currentRegistrations || 0} / {event.maxCapacity} registered
                  </div>

                  {event.registrationFee > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      £{event.registrationFee} {event.memberPrice > 0 && event.memberPrice !== event.registrationFee && (
                        <span>(Members: £{event.memberPrice})</span>
                      )}
                    </div>
                  )}

                  {event.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Created {new Date(event.createdAt).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex items-center gap-1">
                      {event.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}