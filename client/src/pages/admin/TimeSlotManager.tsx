import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Users, Edit, Trash2, Plus, UserCheck } from "lucide-react";
import { format } from "date-fns";

interface TimeSlot {
  id: number;
  eventId: number;
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
  speakers?: Array<{
    id: number;
    name: string;
    email: string;
    jobTitle: string;
  }>;
}

interface Speaker {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  linkedIn?: string;
  talkTitle?: string;
  talkDescription?: string;
}

export default function TimeSlotManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignSpeakerDialogOpen, setIsAssignSpeakerDialogOpen] = useState(false);

  // Fetch time slots
  const { data: timeSlots = [], isLoading } = useQuery<TimeSlot[]>({
    queryKey: ['/api/events/1/time-slots'],
  });

  // Fetch speakers
  const { data: speakers = [] } = useQuery<Speaker[]>({
    queryKey: ['/api/events/1/speakers'],
  });

  // Create time slot mutation
  const createSlotMutation = useMutation({
    mutationFn: async (slotData: any) => {
      const response = await apiRequest('POST', '/api/events/1/time-slots', slotData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/time-slots'] });
      setIsAddDialogOpen(false);
      toast({ title: "Time slot created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update time slot mutation
  const updateSlotMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/events/1/time-slots/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/time-slots'] });
      setIsEditDialogOpen(false);
      toast({ title: "Time slot updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete time slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/events/1/time-slots/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/time-slots'] });
      toast({ title: "Time slot deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Assign speaker mutation
  const assignSpeakerMutation = useMutation({
    mutationFn: async ({ slotId, speakerId }: { slotId: number; speakerId: number }) => {
      const response = await apiRequest('POST', `/api/events/1/time-slots/${slotId}/assign-speaker`, { speakerId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events/1/time-slots'] });
      setIsAssignSpeakerDialogOpen(false);
      toast({ title: "Speaker assigned successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getSlotTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'keynote': return 'bg-red-100 text-red-800';
      case 'talk': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'panel': return 'bg-purple-100 text-purple-800';
      case 'demo': return 'bg-orange-100 text-orange-800';
      case 'break': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TimeSlotForm = ({ slot, onSubmit }: { slot?: TimeSlot; onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      title: slot?.title || '',
      description: slot?.description || '',
      slotType: slot?.slotType || 'talk',
      startTime: slot ? slot.startTime.slice(0, 16) : '',
      endTime: slot ? slot.endTime.slice(0, 16) : '',
      room: slot?.room || 'Main Hall',
      maxCapacity: slot?.maxCapacity || 200,
      isBreak: slot?.isBreak || false,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="slotType">Slot Type</Label>
          <Select value={formData.slotType} onValueChange={(value) => setFormData({ ...formData, slotType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="talk">Speaking Opportunity</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="keynote">Keynote</SelectItem>
              <SelectItem value="panel">Panel Discussion</SelectItem>
              <SelectItem value="demo">Demo</SelectItem>
              <SelectItem value="break">Break</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
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
          <div>
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="maxCapacity">Max Capacity</Label>
            <Input
              id="maxCapacity"
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isBreak"
            checked={formData.isBreak}
            onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })}
            className="rounded border-gray-300"
          />
          <Label htmlFor="isBreak">Is Break/Non-bookable slot</Label>
        </div>

        <Button type="submit" className="w-full">
          {slot ? 'Update Time Slot' : 'Create Time Slot'}
        </Button>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Time Slot Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage AI Summit time slots, assign speakers, and organize the event schedule
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Time Slot</DialogTitle>
            </DialogHeader>
            <TimeSlotForm onSubmit={(data) => createSlotMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {timeSlots.map((slot: TimeSlot) => (
          <Card key={slot.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-lg">{slot.title}</h3>
                  <Badge className={getSlotTypeBadgeColor(slot.slotType)}>
                    {slot.slotType}
                  </Badge>
                  {slot.isBreak && (
                    <Badge variant="outline">Non-bookable</Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-3">{slot.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {format(new Date(slot.startTime), "h:mm a")} - {format(new Date(slot.endTime), "h:mm a")}
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

                {slot.speakers && slot.speakers.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">Assigned Speakers:</h4>
                    <div className="space-y-1">
                      {slot.speakers.map((speaker) => (
                        <div key={speaker.id} className="flex items-center gap-2 text-sm">
                          <UserCheck className="h-3 w-3 text-green-600" />
                          <span>{speaker.name} ({speaker.jobTitle})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!slot.isBreak && (
                  <Dialog open={isAssignSpeakerDialogOpen && selectedSlot?.id === slot.id} onOpenChange={(open) => {
                    setIsAssignSpeakerDialogOpen(open);
                    if (open) setSelectedSlot(slot);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assign Speaker
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Speaker to {slot.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          {speakers.map((speaker: Speaker) => (
                            <div key={speaker.id} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <p className="font-medium">{speaker.name}</p>
                                <p className="text-sm text-muted-foreground">{speaker.jobTitle}</p>
                                {speaker.talkTitle && (
                                  <p className="text-sm font-medium text-blue-600">{speaker.talkTitle}</p>
                                )}
                              </div>
                              <Button 
                                size="sm"
                                onClick={() => assignSpeakerMutation.mutate({ slotId: slot.id, speakerId: speaker.id })}
                              >
                                Assign
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <Dialog open={isEditDialogOpen && selectedSlot?.id === slot.id} onOpenChange={(open) => {
                  setIsEditDialogOpen(open);
                  if (open) setSelectedSlot(slot);
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Edit Time Slot</DialogTitle>
                    </DialogHeader>
                    <TimeSlotForm 
                      slot={selectedSlot!} 
                      onSubmit={(data) => updateSlotMutation.mutate({ id: selectedSlot!.id, data })} 
                    />
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this time slot?')) {
                      deleteSlotMutation.mutate(slot.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}