import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mic, Users, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

interface SpeakingSession {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentRegistrations: number;
  isActive: boolean;
}

interface SessionStats {
  totalSessions: number;
  totalRegistrations: number;
  activeAttendance: number;
}

interface Speaker {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
}

const createSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  speakerId: z.string().optional(), // Optional speaker selection from dropdown
  speakerName: z.string().min(1, "Speaker name is required"),
  speakerBio: z.string().optional(),
  speakerCompany: z.string().optional(),
  speakerJobTitle: z.string().optional(),
  sessionType: z.enum(["keynote", "panel", "presentation", "demo", "fireside_chat"]),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  venue: z.string().min(1, "Venue is required"),
  maxCapacity: z.number().min(1, "Capacity must be at least 1"),
  audienceLevel: z.enum(["all", "beginner", "intermediate", "advanced", "business_leaders"]),
  keyTakeaways: z.string().optional(),
  isActive: z.boolean().default(true),
}).superRefine(({ startTime, endTime }, ctx) => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  } catch (error) {
    // Invalid date format will be caught by string validation
  }
});

type CreateSessionFormData = z.infer<typeof createSessionSchema>;

export default function SpeakingSessionManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading: sessionsLoading } = useQuery<SpeakingSession[]>({
    queryKey: ['/api/ai-summit/speaking-sessions']
  });

  const { data: stats, isLoading: statsLoading } = useQuery<SessionStats>({
    queryKey: ['/api/admin/speaking-session-stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch speakers for dropdown
  const { data: speakers, isLoading: speakersLoading } = useQuery<Speaker[]>({
    queryKey: ['/api/admin/speakers'],
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const createSessionForm = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      sessionType: "presentation",
      audienceLevel: "all",
      duration: 45,
      maxCapacity: 50,
      isActive: true,
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSessionFormData) =>
      apiRequest('POST', '/api/ai-summit/speaking-sessions', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Speaking session created successfully!",
      });
      createSessionForm.reset();
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/speaking-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/speaking-session-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create speaking session",
        variant: "destructive",
      });
    },
  });

  if (sessionsLoading || statsLoading) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Speaking Session Management</h1>
            <p className="text-muted-foreground">Manage AI Summit speaking sessions and track attendance</p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mic className="h-8 w-8 text-purple-600" />
            Speaking Session Management
          </h1>
          <p className="text-muted-foreground">Manage AI Summit speaking sessions and track real-time attendance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-sessions">
                {stats?.totalSessions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-registrations">
                {stats?.totalRegistrations || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Attending</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="active-attendance">
                {stats?.activeAttendance || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Live attendance via QR scans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Session List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Speaking Sessions</CardTitle>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-add-session">
                    <Plus className="h-4 w-4" />
                    Add Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Speaking Session</DialogTitle>
                    <DialogDescription>
                      Add a new speaking session for the AI Summit 2025
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...createSessionForm}>
                    <form onSubmit={createSessionForm.handleSubmit((data) => createSessionMutation.mutate(data))} className="space-y-4">
                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createSessionForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Session Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter session title" {...field} data-testid="input-session-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter session description" {...field} data-testid="textarea-session-description" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Speaker Information */}
                        <div className="col-span-2">
                          <FormField
                            control={createSessionForm.control}
                            name="speakerId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Speaker (Optional)</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    // Handle manual entry case
                                    if (value === "manual") {
                                      field.onChange(undefined); // Don't send speakerId for manual entry
                                      return;
                                    }
                                    
                                    field.onChange(value);
                                    // Auto-populate speaker fields when speaker is selected
                                    if (value && speakers) {
                                      const selectedSpeaker = speakers.find(s => s.id === value);
                                      if (selectedSpeaker) {
                                        const fullName = selectedSpeaker.firstName && selectedSpeaker.lastName 
                                          ? `${selectedSpeaker.firstName} ${selectedSpeaker.lastName}` 
                                          : selectedSpeaker.name;
                                        createSessionForm.setValue('speakerName', fullName || '');
                                        createSessionForm.setValue('speakerCompany', selectedSpeaker.company || '');
                                        createSessionForm.setValue('speakerJobTitle', selectedSpeaker.jobTitle || '');
                                      }
                                    }
                                  }}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-speaker">
                                      <SelectValue placeholder="Choose from registered speakers or enter manually below" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="manual">
                                      Manual Entry (No Speaker Selected)
                                    </SelectItem>
                                    {speakers?.map((speaker) => {
                                      const displayName = speaker.firstName && speaker.lastName 
                                        ? `${speaker.firstName} ${speaker.lastName}` 
                                        : speaker.name;
                                      const subtitle = [speaker.jobTitle, speaker.company].filter(Boolean).join(' at ');
                                      return (
                                        <SelectItem key={speaker.id} value={speaker.id}>
                                          <div className="flex flex-col">
                                            <span className="font-medium">{displayName}</span>
                                            {subtitle && (
                                              <span className="text-sm text-muted-foreground">{subtitle}</span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={createSessionForm.control}
                          name="speakerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Speaker Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter speaker name" {...field} data-testid="input-speaker-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="speakerCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Speaker Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter company name" {...field} data-testid="input-speaker-company" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="speakerJobTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Speaker Job Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter job title" {...field} data-testid="input-speaker-job-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="sessionType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Session Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-session-type">
                                    <SelectValue placeholder="Select session type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="keynote">Keynote</SelectItem>
                                  <SelectItem value="presentation">Presentation</SelectItem>
                                  <SelectItem value="panel">Panel Discussion</SelectItem>
                                  <SelectItem value="demo">Live Demo</SelectItem>
                                  <SelectItem value="fireside_chat">Fireside Chat</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="audienceLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Audience Level *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-audience-level">
                                    <SelectValue placeholder="Select audience level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">All Levels</SelectItem>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="business_leaders">Business Leaders</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Schedule & Venue */}
                        <FormField
                          control={createSessionForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Date & Time *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field} 
                                  data-testid="input-start-time"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Date & Time *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="datetime-local" 
                                  {...field} 
                                  data-testid="input-end-time"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="venue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Venue *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Main Auditorium" {...field} data-testid="input-venue" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="maxCapacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Capacity *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-max-capacity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes) *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="15"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-duration"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Optional Fields */}
                        <FormField
                          control={createSessionForm.control}
                          name="speakerBio"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Speaker Bio</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter speaker biography" {...field} data-testid="textarea-speaker-bio" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createSessionForm.control}
                          name="keyTakeaways"
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Key Takeaways</FormLabel>
                              <FormControl>
                                <Textarea placeholder="What will attendees learn from this session?" {...field} data-testid="textarea-key-takeaways" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                          data-testid="button-cancel-session"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createSessionMutation.isPending}
                          data-testid="button-create-session"
                        >
                          {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {!sessions || sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <p>No speaking sessions found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                    data-testid={`session-${session.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{session.title}</h3>
                        <Badge variant={session.isActive ? "default" : "secondary"}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {session.currentRegistrations}/{session.maxCapacity} registered
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Capacity: {Math.round((session.currentRegistrations / session.maxCapacity) * 100)}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((session.currentRegistrations / session.maxCapacity) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}