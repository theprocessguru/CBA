import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  Users, 
  Mic, 
  Wrench,
  Building,
  Coffee,
  UserPlus,
  Trophy,
  Lightbulb,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ScheduleItem {
  id?: number;
  title: string;
  description: string;
  speaker: string;
  sessionType: string;
  venue: string;
  startTime: string;
  endTime: string;
  capacity: number;
  actualSpeakingTime: number;
  requirements?: string;
  features?: string;
}

const VENUES = [
  { value: "auditorium", label: "2nd Floor Auditorium", capacity: 120 },
  { value: "classroom", label: "Large Classroom", capacity: 65 },
  { value: "exhibition", label: "3rd Floor Exhibition", capacity: 200 }
];

const SESSION_TYPES = [
  { value: "keynote", label: "Keynote", icon: Mic, color: "purple" },
  { value: "talk", label: "Talk/Presentation", icon: Users, color: "blue" },
  { value: "workshop", label: "Workshop", icon: Wrench, color: "green" },
  { value: "panel", label: "Panel Discussion", icon: Users, color: "indigo" },
  { value: "demo", label: "Demo/Showcase", icon: Lightbulb, color: "yellow" },
  { value: "networking", label: "Networking", icon: Users, color: "emerald" },
  { value: "break", label: "Break", icon: Coffee, color: "orange" },
  { value: "registration", label: "Registration", icon: UserPlus, color: "sky" },
  { value: "exhibition", label: "Exhibition", icon: Building, color: "red" },
];

export default function AISummitSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string>("all");
  
  const [formData, setFormData] = useState<ScheduleItem>({
    title: "",
    description: "",
    speaker: "",
    sessionType: "",
    venue: "",
    startTime: "",
    endTime: "",
    capacity: 0,
    actualSpeakingTime: 0,
    requirements: "",
    features: ""
  });

  // Calculate actual speaking time based on session duration
  const calculateSpeakingTime = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2025-10-01T${startTime}`);
    const end = new Date(`2025-10-01T${endTime}`);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Subtract: 5 min entry + 5 min exit + 5 min Q&A = 15 minutes
    return Math.max(0, totalMinutes - 15);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const speakingTime = calculateSpeakingTime(newFormData.startTime, newFormData.endTime);
    
    setFormData({
      ...newFormData,
      actualSpeakingTime: speakingTime
    });
  };

  const handleVenueChange = (venue: string) => {
    const venueInfo = VENUES.find(v => v.value === venue);
    setFormData({
      ...formData,
      venue,
      capacity: venueInfo?.capacity || 0
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      speaker: "",
      sessionType: "",
      venue: "",
      startTime: "",
      endTime: "",
      capacity: 0,
      actualSpeakingTime: 0,
      requirements: "",
      features: ""
    });
    setEditingItem(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.venue || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.actualSpeakingTime <= 0) {
      toast({
        title: "Invalid Timing",
        description: "Session must be longer than 15 minutes to account for entry, exit, and Q&A time",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to database
    toast({
      title: "Schedule Item Added",
      description: `${formData.title} scheduled for ${formData.actualSpeakingTime} minutes of content`
    });

    setShowCreateDialog(false);
    resetForm();
  };

  const getSessionIcon = (type: string) => {
    const sessionType = SESSION_TYPES.find(t => t.value === type);
    if (!sessionType) return <Calendar className="h-4 w-4" />;
    const Icon = sessionType.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getSessionColor = (type: string) => {
    const sessionType = SESSION_TYPES.find(t => t.value === type);
    return sessionType?.color || "gray";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Summit Schedule Management</h2>
          <p className="text-muted-foreground">
            Manage speaking sessions and workshops. Each session includes 5min entry + content + 5min Q&A + 5min exit.
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule Item
        </Button>
      </div>

      {/* Timing Guidelines Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Session Timing Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">30-Minute Slot Breakdown:</h4>
              <ul className="text-sm space-y-1">
                <li>• 5 minutes: Room entry & scanning</li>
                <li>• 15 minutes: Actual speaking/content</li>
                <li>• 5 minutes: Q&A session</li>
                <li>• 5 minutes: Room exit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">60-Minute Slot Breakdown:</h4>
              <ul className="text-sm space-y-1">
                <li>• 5 minutes: Room entry & scanning</li>
                <li>• 45 minutes: Workshop/extended content</li>
                <li>• 5 minutes: Q&A session</li>
                <li>• 5 minutes: Room exit</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Venue Filter */}
      <div className="flex gap-2">
        <Button 
          variant={selectedVenue === "all" ? "default" : "outline"}
          onClick={() => setSelectedVenue("all")}
        >
          All Venues
        </Button>
        {VENUES.map(venue => (
          <Button 
            key={venue.value}
            variant={selectedVenue === venue.value ? "default" : "outline"}
            onClick={() => setSelectedVenue(venue.value)}
          >
            {venue.label}
          </Button>
        ))}
      </div>

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {VENUES.map(venue => (
          <Card key={venue.value} className={selectedVenue !== "all" && selectedVenue !== venue.value ? "opacity-50" : ""}>
            <CardHeader>
              <CardTitle className="text-lg">{venue.label}</CardTitle>
              <p className="text-sm text-muted-foreground">Capacity: {venue.capacity} people</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">No sessions scheduled yet</p>
                <p className="text-xs text-blue-600">Click "Add Schedule Item" to create sessions</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setEditingItem(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Schedule Item" : "Add Schedule Item"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., AI Tools for Small Business"
                />
              </div>
              <div>
                <Label htmlFor="speaker">Speaker/Facilitator</Label>
                <Input
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                  placeholder="e.g., Dr. Sarah Chen"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what attendees will learn or experience"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionType">Session Type *</Label>
                <Select value={formData.sessionType} onValueChange={(value) => setFormData({...formData, sessionType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="venue">Venue *</Label>
                <Select value={formData.venue} onValueChange={handleVenueChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUES.map(venue => (
                      <SelectItem key={venue.value} value={venue.value}>
                        {venue.label} (Cap: {venue.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange('startTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange('endTime', e.target.value)}
                />
              </div>
              <div>
                <Label>Speaking Time</Label>
                <div className="mt-2 p-2 bg-green-50 rounded border">
                  <div className="text-lg font-semibold text-green-700">
                    {formData.actualSpeakingTime} minutes
                  </div>
                  <div className="text-xs text-green-600">
                    Content time after entry/Q&A/exit
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Input
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  placeholder="e.g., Bring laptop, Basic Excel knowledge"
                />
              </div>
              <div>
                <Label htmlFor="features">Special Features</Label>
                <Input
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="e.g., Live demo, Interactive session"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowCreateDialog(false);
                setEditingItem(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? "Update Session" : "Add Session"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}