import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  Globe,
  Linkedin,
  Clock,
  MessageSquare,
  Search,
  Download,
  Plus,
  Eye,
  EyeOff
} from "lucide-react";

interface SpeakerRegistration {
  id: string;
  speakerName: string;
  speakerEmail: string;
  speakerPhone: string;
  speakerCompany: string;
  speakerJobTitle: string;
  speakerWebsite?: string;
  speakerLinkedIn?: string;
  speakerBio: string;
  sessionType: string;
  talkTitle: string;
  talkDescription: string;
  talkDuration: string;
  audienceLevel: string;
  speakingExperience?: string;
  previousSpeaking: boolean;
  techRequirements?: string;
  availableSlots?: string;
  motivationToSpeak?: string;
  keyTakeaways?: string;
  interactiveElements: boolean;
  handoutsProvided: boolean;
  createdAt: string;
  status?: string;
}

const createSpeakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  website: z.string().optional(),
  linkedIn: z.string().optional(),
  bio: z.string().min(1, "Bio is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  sessionType: z.enum(["keynote", "talk", "panel", "workshop", "demo"]),
  talkTitle: z.string().min(1, "Talk title is required"),
  talkDescription: z.string().min(1, "Talk description is required"),
  talkDuration: z.string().min(1, "Duration is required"),
  audienceLevel: z.enum(["beginner", "intermediate", "advanced", "all"]),
  speakingExperience: z.string().optional(),
  previousSpeaking: z.boolean().default(false),
  techRequirements: z.string().optional(),
  availableSlots: z.string().optional(),
  motivationToSpeak: z.string().optional(),
  keyTakeaways: z.string().min(1, "Key takeaways are required"),
  interactiveElements: z.boolean().default(false),
  handoutsProvided: z.boolean().default(false),
  agreesToTerms: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateSpeakerFormData = z.infer<typeof createSpeakerSchema>;

export default function SpeakerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: speakers, isLoading, error } = useQuery<SpeakerRegistration[]>({
    queryKey: ["/api/admin/speakers"],
  });

  const createSpeakerForm = useForm<CreateSpeakerFormData>({
    resolver: zodResolver(createSpeakerSchema),
    defaultValues: {
      sessionType: "talk",
      audienceLevel: "all",
      talkDuration: "30",
      previousSpeaking: false,
      interactiveElements: false,
      handoutsProvided: false,
      agreesToTerms: true,
    },
  });

  const createSpeakerMutation = useMutation({
    mutationFn: (data: CreateSpeakerFormData) =>
      apiRequest('/api/ai-summit-speaker-interest', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Speaker created successfully!",
      });
      createSpeakerForm.reset();
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/speakers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create speaker",
        variant: "destructive",
      });
    },
  });

  const filteredSpeakers = speakers?.filter(speaker => {
    const matchesSearch = 
      speaker.speakerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.speakerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.speakerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      speaker.talkTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || speaker.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (!speakers) return;
    
    const csv = [
      ["Name", "Email", "Phone", "Company", "Job Title", "Session Type", "Talk Title", "Duration", "Audience Level", "Status", "Registered Date"],
      ...speakers.map(s => [
        s.speakerName,
        s.speakerEmail,
        s.speakerPhone,
        s.speakerCompany,
        s.speakerJobTitle,
        s.sessionType,
        s.talkTitle,
        s.talkDuration + " mins",
        s.audienceLevel,
        s.status || "pending",
        format(new Date(s.createdAt), "yyyy-MM-dd")
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `speakers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const getSessionTypeColor = (type: string) => {
    switch(type) {
      case 'keynote': return 'bg-purple-100 text-purple-800';
      case 'talk': return 'bg-blue-100 text-blue-800';
      case 'panel': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      case 'demo': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceLevelColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'all': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-800">Failed to load speaker registrations. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Speaker Management</h1>
          <p className="text-gray-600 mt-1">Manage AI Summit speaker registrations and proposals</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-speaker">
                <Plus className="h-4 w-4" />
                Add Speaker
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Speaker</DialogTitle>
                <DialogDescription>
                  Create a new speaker account for the AI Summit 2025
                </DialogDescription>
              </DialogHeader>

              <Form {...createSpeakerForm}>
                <form onSubmit={createSpeakerForm.handleSubmit((data) => createSpeakerMutation.mutate(data))} className="space-y-6">
                  
                  {/* Speaker Information Section */}
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Speaker Information</h3>
                      <p className="text-sm text-gray-600">Personal details and contact information</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createSpeakerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter full name" {...field} data-testid="input-speaker-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} data-testid="input-speaker-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} data-testid="input-speaker-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} data-testid="input-speaker-company" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter job title" {...field} data-testid="input-speaker-job-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter website URL" {...field} data-testid="input-speaker-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="linkedIn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LinkedIn</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter LinkedIn URL" {...field} data-testid="input-speaker-linkedin" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="speakingExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Speaking Experience</FormLabel>
                            <FormControl>
                              <Input placeholder="Years of speaking experience" {...field} data-testid="input-speaking-experience" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Speaker Bio *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter speaker biography and credentials" {...field} data-testid="textarea-speaker-bio" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password Fields */}
                      <FormField
                        control={createSpeakerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter password (min 8 chars)"
                                  {...field}
                                  data-testid="input-speaker-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm password"
                                  {...field}
                                  data-testid="input-speaker-confirm-password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Session Information Section */}
                  <div className="space-y-4">
                    <div className="border-b pb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Session Information</h3>
                      <p className="text-sm text-gray-600">Details about what they will be presenting</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createSpeakerForm.control}
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
                                <SelectItem value="talk">Talk/Presentation</SelectItem>
                                <SelectItem value="panel">Panel Discussion</SelectItem>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="demo">Demo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
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
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="talkDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Duration *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 30, 45, 60 minutes" {...field} data-testid="input-talk-duration" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="availableSlots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Time Slots</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Morning, Afternoon, Any" {...field} data-testid="input-available-slots" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="talkTitle"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Session Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter session/presentation title" {...field} data-testid="input-talk-title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="talkDescription"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Session Description *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe what the session will cover" {...field} data-testid="textarea-talk-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="keyTakeaways"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Key Takeaways *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="What will attendees learn from this session?" {...field} data-testid="textarea-key-takeaways" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="techRequirements"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Technical Requirements</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Any special tech setup needed for the session?" {...field} data-testid="textarea-tech-requirements" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createSpeakerForm.control}
                        name="motivationToSpeak"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Why This Session?</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Why is this session important for the AI Summit?" {...field} data-testid="textarea-motivation" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      data-testid="button-cancel-speaker"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createSpeakerMutation.isPending}
                      data-testid="button-create-speaker"
                    >
                      {createSpeakerMutation.isPending ? "Creating..." : "Create Speaker"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Speakers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{speakers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Registered speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keynotes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers?.filter(s => s.sessionType === 'keynote').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Keynote speakers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workshops</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers?.filter(s => s.sessionType === 'workshop').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Workshop leaders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panels</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {speakers?.filter(s => s.sessionType === 'panel').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Panel participants</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, company, or talk title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                All ({speakers?.length || 0})
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
                size="sm"
              >
                Pending Review
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                onClick={() => setFilterStatus("approved")}
                size="sm"
              >
                Approved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speaker List */}
      <div className="space-y-4">
        {filteredSpeakers && filteredSpeakers.length > 0 ? (
          filteredSpeakers.map((speaker) => (
            <Card key={speaker.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Speaker Info Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{speaker.speakerName}</h3>
                      <p className="text-gray-600">{speaker.speakerJobTitle} at {speaker.speakerCompany}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getSessionTypeColor(speaker.sessionType)}>
                        {speaker.sessionType}
                      </Badge>
                      <Badge className={getAudienceLevelColor(speaker.audienceLevel)}>
                        {speaker.audienceLevel}
                      </Badge>
                      {speaker.talkDuration && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {speaker.talkDuration} mins
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Talk Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{speaker.talkTitle}</h4>
                    <p className="text-gray-600 text-sm">{speaker.talkDescription}</p>
                  </div>

                  {/* Contact & Links */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${speaker.speakerEmail}`} className="hover:text-blue-600">
                        {speaker.speakerEmail}
                      </a>
                    </div>
                    {speaker.speakerPhone && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="h-4 w-4" />
                        {speaker.speakerPhone}
                      </div>
                    )}
                    {speaker.speakerWebsite && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Globe className="h-4 w-4" />
                        <a href={speaker.speakerWebsite} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          Website
                        </a>
                      </div>
                    )}
                    {speaker.speakerLinkedIn && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Linkedin className="h-4 w-4" />
                        <a href={speaker.speakerLinkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  {speaker.speakerBio && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600">{speaker.speakerBio}</p>
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Registered: {format(new Date(speaker.createdAt), "dd MMM yyyy, HH:mm")}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {speaker.previousSpeaking ? "Experienced Speaker" : "New Speaker"}
                      </Badge>
                      {speaker.interactiveElements && (
                        <Badge variant="outline">Interactive Session</Badge>
                      )}
                      {speaker.handoutsProvided && (
                        <Badge variant="outline">Handouts Provided</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || filterStatus !== "all" 
                  ? "No speakers found matching your criteria." 
                  : "No speaker registrations yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}