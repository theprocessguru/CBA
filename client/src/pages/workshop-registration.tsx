import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Clock, MapPin, Users, Calendar, User, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface Workshop {
  id: number;
  title: string;
  description: string;
  facilitator: string;
  facilitatorBio: string;
  facilitatorCompany: string;
  duration: number;
  startTime: string;
  endTime: string;
  room: string;
  maxCapacity: number;
  currentRegistrations: number;
  category: string;
  tags: string;
  prerequisites: string;
  learningObjectives: string;
  materials: string;
  registrationDeadline: string;
}

interface WorkshopCapacity {
  current: number;
  max: number;
  available: number;
}

interface RegistrationData {
  workshopId: number;
  attendeeName: string;
  attendeeEmail: string;
  attendeeCompany: string;
  attendeeJobTitle: string;
  experienceLevel: string;
  specificInterests: string;
  dietaryRequirements: string;
  accessibilityNeeds: string;
}

export default function WorkshopRegistration() {
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    workshopId: 0,
    attendeeName: "",
    attendeeEmail: "",
    attendeeCompany: "",
    attendeeJobTitle: "",
    experienceLevel: "beginner",
    specificInterests: "",
    dietaryRequirements: "",
    accessibilityNeeds: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active workshops
  const { data: workshops = [], isLoading: workshopsLoading } = useQuery({
    queryKey: ["/api/workshops"],
    select: (data) => data as Workshop[],
  });

  // Fetch workshop capacity for each workshop
  const workshopCapacities = useQuery({
    queryKey: ["/api/ai-summit/workshop-capacities"],
    queryFn: async () => {
      const capacities: Record<number, WorkshopCapacity> = {};
      for (const workshop of workshops) {
        try {
          const response = await apiRequest("GET", `/api/ai-summit/workshops/${workshop.id}/capacity`);
          const capacity = await response.json();
          capacities[workshop.id] = capacity;
        } catch (error) {
          console.error(`Failed to fetch capacity for workshop ${workshop.id}:`, error);
          capacities[workshop.id] = { current: 0, max: workshop.maxCapacity, available: workshop.maxCapacity };
        }
      }
      return capacities;
    },
    enabled: workshops.length > 0,
  });

  // Workshop registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationData) => {
      const response = await apiRequest("POST", `/api/ai-summit/workshops/register-public`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You've been registered for the workshop. Check your email for confirmation and QR code.",
      });
      setShowRegistrationForm(false);
      setSelectedWorkshop(null);
      setRegistrationData({
        workshopId: 0,
        attendeeName: "",
        attendeeEmail: "",
        attendeeCompany: "",
        attendeeJobTitle: "",
        experienceLevel: "beginner",
        specificInterests: "",
        dietaryRequirements: "",
        accessibilityNeeds: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-summit/workshop-capacities"] });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register for workshop. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, h:mm a");
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800",
      intermediate: "bg-yellow-100 text-yellow-800",
      advanced: "bg-red-100 text-red-800",
      business: "bg-blue-100 text-blue-800",
      technical: "bg-purple-100 text-purple-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleRegister = (workshop: Workshop) => {
    // Redirect to login page for registration
    window.location.href = '/login';
  };

  const isWorkshopFull = (workshopId: number) => {
    const capacity = workshopCapacities.data?.[workshopId];
    return capacity ? capacity.available <= 0 : false;
  };

  const isRegistrationDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (workshopsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading workshops...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Summit 2025 - Workshop Registration
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Register for hands-on workshops and interactive sessions. Limited spaces available - secure your spot today!
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-600">
            <Calendar className="h-4 w-4" />
            <span>January 27, 2025 | LSBU London South Bank University Croydon</span>
          </div>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {workshops.map((workshop) => {
            const capacity = workshopCapacities.data?.[workshop.id];
            const isFull = isWorkshopFull(workshop.id);
            const isDeadlinePassed = isRegistrationDeadlinePassed(workshop.registrationDeadline);
            const canRegister = !isFull && !isDeadlinePassed;

            return (
              <Card key={workshop.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight">{workshop.title}</CardTitle>
                        <Badge className={getCategoryColor(workshop.category)}>
                          {workshop.category}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {workshop.description}
                      </CardDescription>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span>
                            <strong>{workshop.facilitator}</strong>
                            {workshop.facilitatorCompany && ` - ${workshop.facilitatorCompany}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatDateTime(workshop.startTime)} - {formatDateTime(workshop.endTime)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{workshop.room}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className={`${isFull ? 'text-red-600' : 'text-gray-600'}`}>
                            {capacity ? `${capacity.current}/${capacity.max}` : `0/${workshop.maxCapacity}`} registered
                            {isFull && <span className="text-red-600 font-medium ml-1">(Full)</span>}
                          </span>
                        </div>
                      </div>

                      {workshop.prerequisites && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span><strong>Prerequisites:</strong> {workshop.prerequisites}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {!canRegister && (
                        <div className="flex items-center gap-4 text-sm">
                          {isFull && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>Workshop is full</span>
                            </div>
                          )}
                          {isDeadlinePassed && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="h-4 w-4" />
                              <span>Registration deadline passed</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => handleRegister(workshop)}
                        disabled={!canRegister}
                        className="w-full sm:w-auto min-w-32"
                        variant={canRegister ? "default" : "secondary"}
                      >
                        {canRegister ? "Register Now" : "Registration Closed"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {workshops.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workshops available</h3>
            <p className="text-gray-600">Workshop schedule will be published soon. Check back later!</p>
          </div>
        )}

      </div>
    </div>
  );
}