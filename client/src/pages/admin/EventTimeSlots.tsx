import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Clock, Users, MapPin, Video, FileText, Calendar, User, Presentation } from "lucide-react";
import { format } from "date-fns";

interface TimeSlot {
  id: number;
  eventId: number;
  title: string;
  description?: string;
  slotType: string;
  startTime: string;
  endTime: string;
  room?: string;
  maxCapacity?: number;
  currentAttendees: number;
  speakerId?: string;
  moderatorId?: string;
  isBreak: boolean;
  materials?: string;
  streamingUrl?: string;
  recordingUrl?: string;
  tags?: string;
  requiresRegistration: boolean;
  displayOrder: number;
  primarySpeaker?: {
    id: string;
    name: string;
    email: string;
  };
  speakers?: Array<{
    speakerId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    title?: string;
    company?: string;
    role: string;
    displayOrder: number;
  }>;
}

interface Event {
  id: number;
  title: string;
  eventDate: string;
  venue: string;
}

interface Speaker {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  title?: string;
  company?: string;
}

export default function EventTimeSlots() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slotType: "presentation",
    startTime: "",
    endTime: "",
    room: "",
    maxCapacity: "",
    speakerId: "",
    moderatorId: "",
    isBreak: false,
    materials: "",
    streamingUrl: "",
    recordingUrl: "",
    tags: "",
    requiresRegistration: false,
    displayOrder: "0",
  });

  // Fetch CBA events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/cba-events"],
  });

  // Fetch speakers (users with speaker participant type)
  const { data: speakers = [], isLoading: speakersLoading } = useQuery({
    queryKey: ["/api/admin/speakers"],
    enabled: !!selectedEventId,
  });

  // Fetch time slots for selected event
  const { data: timeSlots = [], isLoading: slotsLoading, refetch: refetchTimeSlots } = useQuery({
    queryKey: [`/api/events/${selectedEventId}/time-slots`],
    enabled: !!selectedEventId,
  });

  // Create time slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (data: typeof formData & { speakers?: string[] }) => {
      return apiRequest(`/api/events/${selectedEventId}/time-slots`, "POST", {
        ...data,
        maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity) : null,
        displayOrder: parseInt(data.displayOrder),
        speakers: data.speakers?.map((speakerId, index) => ({
          speakerId,
          role: "speaker",
          displayOrder: index,
        })),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Time slot created successfully",
      });
      refetchTimeSlots();
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create time slot",
        variant: "destructive",
      });
    },
  });

  // Update time slot mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData & { speakers?: string[] } }) => {
      return apiRequest(`/api/time-slots/${id}`, "PUT", {
        ...data,
        maxCapacity: data.maxCapacity ? parseInt(data.maxCapacity) : null,
        displayOrder: parseInt(data.displayOrder),
        speakers: data.speakers?.map((speakerId, index) => ({
          speakerId,
          role: "speaker",
          displayOrder: index,
        })),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Time slot updated successfully",
      });
      refetchTimeSlots();
      setIsEditDialogOpen(false);
      setEditingSlot(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update time slot",
        variant: "destructive",
      });
    },
  });

  // Delete time slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/time-slots/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      });
      refetchTimeSlots();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time slot",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      slotType: "presentation",
      startTime: "",
      endTime: "",
      room: "",
      maxCapacity: "",
      speakerId: "",
      moderatorId: "",
      isBreak: false,
      materials: "",
      streamingUrl: "",
      recordingUrl: "",
      tags: "",
      requiresRegistration: false,
      displayOrder: "0",
    });
    setSelectedSpeakers([]);
  };

  const handleEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      title: slot.title,
      description: slot.description || "",
      slotType: slot.slotType,
      startTime: format(new Date(slot.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(slot.endTime), "yyyy-MM-dd'T'HH:mm"),
      room: slot.room || "",
      maxCapacity: slot.maxCapacity?.toString() || "",
      speakerId: slot.speakerId || "",
      moderatorId: slot.moderatorId || "",
      isBreak: slot.isBreak,
      materials: slot.materials || "",
      streamingUrl: slot.streamingUrl || "",
      recordingUrl: slot.recordingUrl || "",
      tags: slot.tags || "",
      requiresRegistration: slot.requiresRegistration,
      displayOrder: slot.displayOrder.toString(),
    });
    setSelectedSpeakers(slot.speakers?.map(s => s.speakerId) || []);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSlot = (id: number) => {
    if (confirm("Are you sure you want to delete this time slot?")) {
      deleteSlotMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    if (editingSlot) {
      updateSlotMutation.mutate({
        id: editingSlot.id,
        data: { ...formData, speakers: selectedSpeakers },
      });
    } else {
      createSlotMutation.mutate({ ...formData, speakers: selectedSpeakers });
    }
  };

  const getSlotTypeIcon = (type: string) => {
    switch (type) {
      case "keynote":
        return <Presentation className="h-4 w-4" />;
      case "workshop":
        return <Users className="h-4 w-4" />;
      case "panel":
        return <User className="h-4 w-4" />;
      case "break":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case "keynote":
        return "bg-purple-100 text-purple-800";
      case "workshop":
        return "bg-blue-100 text-blue-800";
      case "panel":
        return "bg-green-100 text-green-800";
      case "break":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Group time slots by day for better organization
  const groupedTimeSlots = (timeSlots as TimeSlot[]).reduce((acc: Record<string, TimeSlot[]>, slot: TimeSlot) => {
    const date = format(new Date(slot.startTime), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          onClick={() => navigate("/admin")}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Event Time Slots Management</h1>
        <p className="text-muted-foreground">
          Manage event schedules, sessions, and speaker assignments
        </p>
      </div>

      {/* Event Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>
            Choose an event to manage its time slots and schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEventId?.toString() || ""}
            onValueChange={(value) => setSelectedEventId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {(events as Event[]).map((event: Event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.title} - {format(new Date(event.eventDate), "MMMM d, yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Time Slots List */}
      {selectedEventId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Time Slots</CardTitle>
              <CardDescription>
                Manage the schedule and sessions for this event
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <div className="text-center py-8">Loading time slots...</div>
            ) : Object.keys(groupedTimeSlots).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No time slots created yet. Click "Add Time Slot" to create the first one.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTimeSlots).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="font-semibold mb-3 text-lg">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-3">
                      {slots.sort((a: TimeSlot, b: TimeSlot) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map((slot: TimeSlot) => (
                        <div
                          key={slot.id}
                          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getSlotTypeColor(slot.slotType)}>
                                  {getSlotTypeIcon(slot.slotType)}
                                  <span className="ml-1 capitalize">{slot.slotType}</span>
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(slot.startTime), "h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
                                </span>
                                {slot.room && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    {slot.room}
                                  </div>
                                )}
                              </div>
                              
                              <h4 className="font-semibold text-lg mb-1">{slot.title}</h4>
                              
                              {slot.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {slot.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {slot.primarySpeaker && (
                                  <div className="text-sm">
                                    <span className="font-medium">Primary Speaker:</span> {slot.primarySpeaker.name}
                                  </div>
                                )}
                                
                                {slot.speakers && slot.speakers.length > 0 && (
                                  <div className="text-sm">
                                    <span className="font-medium">Additional Speakers:</span>{" "}
                                    {slot.speakers.map((s, i) => (
                                      <span key={s.speakerId}>
                                        {s.firstName} {s.lastName}
                                        {i < slot.speakers!.length - 1 && ", "}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {slot.maxCapacity && (
                                  <div className="text-sm">
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {slot.currentAttendees}/{slot.maxCapacity} attendees
                                  </div>
                                )}
                                
                                {slot.streamingUrl && (
                                  <Badge variant="outline">
                                    <Video className="h-3 w-3 mr-1" />
                                    Live Stream
                                  </Badge>
                                )}
                                
                                {slot.requiresRegistration && (
                                  <Badge variant="outline">Registration Required</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditSlot(slot)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteSlot(slot.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingSlot(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Edit Time Slot" : "Add Time Slot"}</DialogTitle>
            <DialogDescription>
              Configure the details for this event time slot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Session title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slotType">Type *</Label>
                <Select
                  value={formData.slotType}
                  onValueChange={(value) => setFormData({ ...formData, slotType: value })}
                >
                  <SelectTrigger id="slotType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keynote">Keynote</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="panel">Panel Discussion</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Session description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">Room/Location</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="e.g., Main Hall, Room 101"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxCapacity">Max Capacity</Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  placeholder="Maximum attendees"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="speakerId">Primary Speaker</Label>
              <Select
                value={formData.speakerId}
                onValueChange={(value) => setFormData({ ...formData, speakerId: value })}
              >
                <SelectTrigger id="speakerId">
                  <SelectValue placeholder="Select primary speaker" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {(speakers as Speaker[]).map((speaker: Speaker) => (
                    <SelectItem key={speaker.id} value={speaker.id}>
                      {speaker.firstName} {speaker.lastName} {speaker.company && `(${speaker.company})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Additional Speakers</Label>
              <div className="border rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                {(speakers as Speaker[]).map((speaker: Speaker) => (
                  <div key={speaker.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`speaker-${speaker.id}`}
                      checked={selectedSpeakers.includes(speaker.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSpeakers([...selectedSpeakers, speaker.id]);
                        } else {
                          setSelectedSpeakers(selectedSpeakers.filter(id => id !== speaker.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`speaker-${speaker.id}`} className="text-sm">
                      {speaker.firstName} {speaker.lastName} {speaker.company && `(${speaker.company})`}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="streamingUrl">Streaming URL</Label>
                <Input
                  id="streamingUrl"
                  value={formData.streamingUrl}
                  onChange={(e) => setFormData({ ...formData, streamingUrl: e.target.value })}
                  placeholder="Live stream link"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recordingUrl">Recording URL</Label>
                <Input
                  id="recordingUrl"
                  value={formData.recordingUrl}
                  onChange={(e) => setFormData({ ...formData, recordingUrl: e.target.value })}
                  placeholder="Recording link"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="materials">Materials/Resources</Label>
              <Textarea
                id="materials"
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                placeholder="Links to presentations, handouts, etc."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Comma-separated tags (e.g., AI, Technology, Innovation)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isBreak"
                  checked={formData.isBreak}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBreak: checked })}
                />
                <Label htmlFor="isBreak">Is Break/Non-Session</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresRegistration"
                  checked={formData.requiresRegistration}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresRegistration: checked })}
                />
                <Label htmlFor="requiresRegistration">Requires Registration</Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                setEditingSlot(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSlot ? "Update" : "Create"} Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}