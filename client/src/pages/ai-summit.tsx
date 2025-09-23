import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AI_SUMMIT_DATE } from "@/lib/constants";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mic, 
  Wrench,
  GraduationCap,
  Lightbulb,
  Rocket,
  Brain,
  Zap,
  Star,
  Gift,
  UserPlus,
  Building,
  Coffee,
  Trophy,
  BookOpen,
  Eye,
  EyeOff,
  Home,
  Heart,
  Crown,
  User,
  Plus,
  Shield,
  MessageCircle,
  Briefcase,
  X
} from "lucide-react";
import { Link } from "wouter";
import { SponsorSpotlight } from "@/components/SponsorSpotlight";
import { AISummitSchedule } from "@/components/schedule/AISummitSchedule";

const AISummit = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedSession, setSelectedSession] = useState("");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Check registration status
  const { data: registrationStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/my-ai-summit-status'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch AI Summit event details for dynamic topics
  const { data: aiSummitEvent } = useQuery<any>({
    queryKey: ['/api/events/first-ai-summit-croydon-2025'],
    retry: false,
  });


  // Fetch live AI Summit data
  const { data: liveSpeakingSessions = [], isLoading: speakingSessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    retry: false,
  });

  const { data: liveWorkshops = [], isLoading: workshopsLoading } = useQuery<any[]>({
    queryKey: ['/api/workshops'],
    retry: false,
  });

  // Fetch live exhibitor data
  const { data: liveExhibitors = [], isLoading: exhibitorsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/exhibitors'],
    retry: false,
  });

  // Full registration form with all required fields for account creation + AI Summit registration
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    memberSegment: "resident" // Default to resident
  });

  // State for form validation and password visibility
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);

  // Auto-populate form when user data is available
  useEffect(() => {
    if (user && showRegistrationForm) {
      const userFirstName = (user as any).firstName || "";
      const userLastName = (user as any).lastName || "";
      const userEmail = (user as any).email || "";
      setRegistrationData(prev => ({
        ...prev,
        firstName: userFirstName,
        lastName: userLastName,
        email: userEmail,
        confirmEmail: userEmail // Auto-populate confirm email
      }));
    }
  }, [user, showRegistrationForm]);



  
  const { toast } = useToast();

  const eventDetails = {
    title: "First AI Summit Croydon 2025",
    date: AI_SUMMIT_DATE,
    time: "10:00 AM - 4:00 PM",
    venue: "LSBU London South Bank University Croydon",
    price: "Reserve your spot - No payment required",
    capacity: "Limited places available",
    registration: "Required - Reserve now, pay later if applicable"
  };

  // Extract speakers from live speaking sessions data
  const speakers = (liveSpeakingSessions || []).map(session => ({
    name: session.facilitator || "CBA Team",
    title: session.facilitatorCompany || "Event Team",
    topic: session.title,
    image: session.facilitatorImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
    bio: session.facilitatorBio || "AI Summit speaker"
  }));

  // Format time from database date objects
  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: false 
      });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  // Transform live speaking sessions data into schedule format
  const auditoriumSchedule = (liveSpeakingSessions || []).map(session => ({
    time: formatSessionTime(session.startTime, session.endTime),
    title: session.title,
    type: session.sessionType?.toLowerCase() || "talk",
    speaker: session.facilitator || "CBA Team",
    description: session.description || "AI Summit session",
    capacity: `${session.maxCapacity} people`
  }));

  // Transform live workshops data into schedule format
  const classroomSchedule = (liveWorkshops || []).map(workshop => ({
    time: formatSessionTime(workshop.startTime, workshop.endTime),
    title: workshop.eventName || workshop.title,
    type: "workshop", 
    speaker: workshop.facilitator || "CBA Team",
    description: workshop.description || "Interactive workshop session",
    capacity: `${workshop.maxCapacity} people`,
    requirements: workshop.prerequisites || "No prerequisites"
  }));

  // No fallback data - show empty when no live data available

  // Use live data only - no fallback dummy data
  const finalClassroomSchedule = classroomSchedule;
  const finalAuditoriumSchedule = auditoriumSchedule;

  // Exhibition schedule - no static data, use dynamic content only
  const exhibitionSchedule: any[] = [];

  // Workshops - no static data, use dynamic content only
  const workshops: any[] = [];

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'keynote': return <Mic className="h-5 w-5 text-purple-600" />;
      case 'talk': return <Users className="h-5 w-5 text-blue-600" />;
      case 'workshop': return <Wrench className="h-5 w-5 text-green-600" />;
      case 'break': return <Coffee className="h-5 w-5 text-orange-600" />;
      case 'exhibition': return <Building className="h-5 w-5 text-red-600" />;
      case 'panel': return <Users className="h-5 w-5 text-indigo-600" />;
      case 'registration': return <UserPlus className="h-5 w-5 text-blue-600" />;
      case 'networking': return <Users className="h-5 w-5 text-green-600" />;
      case 'demo': return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'showcase': return <Trophy className="h-5 w-5 text-purple-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const registerMutation = useMutation({
    mutationFn: async (data: typeof registrationData) => {
      // Client-side validation using our validation function
      const validation = validateForm();
      if (!validation.isValid) {
        throw new Error(validation.errors[0]); // Show first error
      }

      try {
        // Step 1: Create user account via /api/auth/register
        const accountData = {
          email: data.email.trim(),
          password: data.password,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.mobileNumber.trim(),
          homeAddress: "Croydon", // Default for AI Summit registrants
          homeCity: "Croydon",
          homePostcode: "CR0 1AA", // Default postcode
          personTypeIds: [1], // Default person type (1 = attendee)
          memberSegment: data.memberSegment // Save resident vs business_owner selection
        };

        const accountResponse = await apiRequest("POST", "/api/auth/register", accountData);
        const accountResult = await accountResponse.json();

        // If account creation successful, proceed to AI Summit registration
        // Step 2: Register for AI Summit via /api/ai-summit-registration
        const summitData = {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.trim(),
          name: `${data.firstName.trim()} ${data.lastName.trim()}`,
          phoneNumber: data.mobileNumber.trim(),
          participantType: "attendee",
          memberSegment: data.memberSegment // Include resident vs business_owner selection
        };

        const summitResponse = await apiRequest("POST", "/api/ai-summit-registration", summitData);
        const summitResult = await summitResponse.json();

        return {
          accountCreated: true,
          summitRegistered: true,
          requiresVerification: accountResult.requiresVerification,
          user: accountResult.user,
          registration: summitResult
        };
      } catch (error: any) {
        // If account creation fails because user exists, try to register for summit anyway
        if (error?.response?.status === 400 && error?.response?.data?.message?.includes("already exists")) {
          try {
            // User exists, just register for AI Summit
            const summitData = {
              firstName: data.firstName.trim(),
              lastName: data.lastName.trim(),
              email: data.email.trim(),
              name: `${data.firstName.trim()} ${data.lastName.trim()}`,
              phoneNumber: data.mobileNumber.trim(),
              participantType: "attendee",
              memberSegment: data.memberSegment // Include resident vs business_owner selection
            };

            const summitResponse = await apiRequest("POST", "/api/ai-summit-registration", summitData);
            const summitResult = await summitResponse.json();

            return {
              accountCreated: false,
              summitRegistered: true,
              existingUser: true,
              registration: summitResult
            };
          } catch (summitError: any) {
            throw summitError;
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setIsRegistrationSuccess(true); // Show success state instead of closing form
      // Refresh registration status
      refetchStatus();
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      
      // Check if this is a duplicate registration error
      if (error?.response?.status === 409 || error?.message?.includes("already registered")) {
        toast({
          title: "Already Registered!",
          description: "You're already registered for the AI Summit. Please login to access your account and badge details.",
          variant: "default",
        });
        setShowRegistrationForm(false);
      } else if (error?.response?.status === 400) {
        // Handle validation errors
        toast({
          title: "Registration Error",
          description: error?.response?.data?.message || error.message || "Please check your information and try again.",
          variant: "destructive",
        });
      } else if (error?.response?.status === 500) {
        // Handle server errors
        toast({
          title: "Server Error",
          description: "There was a problem processing your registration. Please try again in a few moments or contact support if the issue persists.",
          variant: "destructive",
        });
      } else {
        // Handle other errors including client-side validation
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "Failed to register. Please try again.",
          variant: "destructive",
        });
      }
    },
  });





  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use our comprehensive validation function
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show all validation errors
      validation.errors.forEach((error, index) => {
        setTimeout(() => {
          toast({
            title: "Validation Error",
            description: error,
            variant: "destructive",
          });
        }, index * 100); // Stagger error messages
      });
      return;
    }
    
    registerMutation.mutate(registrationData);
  };

  const handleSuccessClose = () => {
    setIsRegistrationSuccess(false);
    setShowRegistrationForm(false);
    setRegistrationData({
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      mobileNumber: "",
      memberSegment: "resident"
    });
  };





  const handleInputChange = (field: string, value: string | number[] | string[]) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Client-side validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Password must contain at least one number" };
    }
    return { isValid: true, message: "" };
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields
    if (!registrationData.firstName.trim()) errors.push("First name is required");
    if (!registrationData.lastName.trim()) errors.push("Last name is required");
    if (!registrationData.email.trim()) errors.push("Email is required");
    if (!registrationData.confirmEmail.trim()) errors.push("Email confirmation is required");
    if (!registrationData.password) errors.push("Password is required");
    if (!registrationData.confirmPassword) errors.push("Password confirmation is required");
    if (!registrationData.mobileNumber.trim()) errors.push("Mobile number is required");

    // Validate email format
    if (registrationData.email && !validateEmail(registrationData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Validate email confirmation
    if (registrationData.email && registrationData.confirmEmail && 
        registrationData.email.trim().toLowerCase() !== registrationData.confirmEmail.trim().toLowerCase()) {
      errors.push("Email addresses do not match");
    }

    // Validate password strength
    if (registrationData.password) {
      const passwordValidation = validatePasswordStrength(registrationData.password);
      if (!passwordValidation.isValid) {
        errors.push(passwordValidation.message);
      }
    }

    // Validate password confirmation
    if (registrationData.password && registrationData.confirmPassword && 
        registrationData.password !== registrationData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    // Validate mobile number
    if (registrationData.mobileNumber) {
      const cleanPhone = registrationData.mobileNumber.replace(/[\s\-\(\)\+]/g, '');
      if (cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
        errors.push("Please provide a valid mobile number with at least 10 digits");
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  // Admin test data fill function (updated with all fields)
  const fillTestData = () => {
    const randomId = Math.floor(Math.random() * 10000);
    setRegistrationData({
      firstName: "John",
      lastName: "Smith", 
      email: `john.smith.${randomId}@test.com`,
      confirmEmail: `john.smith.${randomId}@test.com`,
      password: "TestPass123",
      confirmPassword: "TestPass123",
      mobileNumber: "+44 7700 900123",
      memberSegment: "resident"
    });
  };

  // Add a test button for development (only visible in development)
  const showTestButton = import.meta.env.MODE === 'development';

  // Organization membership helpers removed for simplified form

  // Organization functions removed for simplified form








  const getSessionColor = (type: string) => {
    switch (type) {
      case 'keynote': return 'bg-purple-50 border-purple-200';
      case 'talk': return 'bg-blue-50 border-blue-200';
      case 'workshop': return 'bg-green-50 border-green-200';
      case 'break': return 'bg-orange-50 border-orange-200';
      case 'exhibition': return 'bg-red-50 border-red-200';
      case 'panel': return 'bg-indigo-50 border-indigo-200';
      case 'registration': return 'bg-sky-50 border-sky-200';
      case 'networking': return 'bg-emerald-50 border-emerald-200';
      case 'demo': return 'bg-yellow-50 border-yellow-200';
      case 'showcase': return 'bg-violet-50 border-violet-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>First AI Summit Croydon 2025 - Free AI Event | CBA</title>
        <meta name="description" content="Join the First AI Summit in Croydon on October 1st, 2025. Free to attend event with AI talks, workshops, and micro business exhibition at LSBU. Limited places available - register now!" />
        <meta property="og:title" content="First AI Summit Croydon 2025 - Free AI Event" />
        <meta property="og:description" content="Educational AI event for entrepreneurs and residents. Talks, workshops, and networking at LSBU Croydon. Free admission, limited places." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section with Minister Keynote Announcement */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
                🚀 INAUGURAL EVENT
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                First AI Summit
                <span className="block text-3xl md:text-5xl text-blue-200">Croydon 2025</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Join South London's premier AI technology event - Educate • Motivate • Develop • Inspire • Empower
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{eventDetails.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{eventDetails.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>LSBU Croydon</span>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    className={`${
                      (registrationStatus as any)?.isRegistered 
                        ? "bg-green-500 text-white hover:bg-green-600 cursor-default" 
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    } text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2`}
                    onClick={() => !(registrationStatus as any)?.isRegistered && setShowRegistrationForm(true)}
                    disabled={(registrationStatus as any)?.isRegistered}
                  >
                    {(registrationStatus as any)?.isRegistered ? (
                      <>
                        <UserPlus className="h-5 w-5" />
                        ✓ Registered for AI Summit 
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5" />
                        Register FREE - Limited Places
                      </>
                    )}
                  </button>
                  {(registrationStatus as any)?.isRegistered ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href="/my-qr-code">
                        <div className="bg-purple-600 text-white hover:bg-purple-700 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                          <Star className="h-5 w-5" />
                          My QR Code
                        </div>
                      </Link>
                      <Link href="/my-registrations">
                        <div className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                          <Calendar className="h-5 w-5" />
                          My Schedule
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/fully-booked">
                      <div className="bg-red-500 text-white hover:bg-red-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                        <BookOpen className="h-5 w-5" />
                        Workshops - FULLY BOOKED
                      </div>
                    </Link>
                  )}
                </div>
                <div className="pt-4">
                  <Link href="/my-registrations">
                    <div className="bg-blue-500 text-white hover:bg-blue-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4 cursor-pointer">
                      <Calendar className="h-5 w-5" />
                      My Schedule & Calendar
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Event Schedule moved here to appear above Exhibition options */}
          {/* Tabs Section */}
          <Tabs defaultValue="schedule" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="workshops">Workshops</TabsTrigger>
              <TabsTrigger value="exhibition" className="relative">
                <div className="flex flex-col">
                  <span>Exhibition</span>
                  <span className="text-xs text-purple-600 font-bold">From £588</span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Event Schedule</h2>
                <p className="text-lg text-neutral-600">Three venues running simultaneously from 10 AM to 4 PM</p>
              </div>

              {/* Venue Tabs */}
              <Tabs defaultValue="auditorium" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="auditorium">
                    <div className="text-center">
                      <div className="font-medium">2nd Floor Auditorium</div>
                      <div className="text-xs opacity-75">Main Talks • 80 seats</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="classroom">
                    <div className="text-center">
                      <div className="font-medium">Large Classroom</div>
                      <div className="text-xs opacity-75">Workshops • 65 seats</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="exhibition">
                    <div className="text-center">
                      <div className="font-medium">3rd Floor Space</div>
                      <div className="text-xs opacity-75">Micro Expo • Open format</div>
                    </div>
                  </TabsTrigger>
                </TabsList>

                {/* Schedule content for each venue */}
                <TabsContent value="auditorium" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-center">2nd Floor Auditorium Schedule</h3>
                      <div className="space-y-4">
                        {(liveWorkshops || []).length > 0 ? (
                          (liveWorkshops || []).map((workshop, index) => {
                            const colors = ['blue', 'green', 'purple', 'orange', 'red'];
                            const color = colors[index % colors.length];
                            const startTime = new Date(workshop.startTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            });
                            return (
                              <div key={workshop.id} className={`border-l-4 border-${color}-600 pl-4`}>
                                <div className="font-semibold">{startTime} - {workshop.title}</div>
                                <div className="text-sm text-gray-600">{workshop.facilitator}</div>
                                <div className="text-sm text-gray-500">{workshop.description}</div>
                              </div>
                            );
                          })
                        ) : (
                          <>
                            <div className="border-l-4 border-blue-600 pl-4">
                              <div className="font-semibold">11:00 AM - AI Tools for Content Creation</div>
                              <div className="text-sm text-gray-600">LSBU Students & Volunteers</div>
                              <div className="text-sm text-gray-500">Hands-on session with ChatGPT, Midjourney, and business AI tools</div>
                            </div>
                            <div className="border-l-4 border-green-600 pl-4">
                              <div className="font-semibold">12:00 PM - Building Your First AI Chatbot</div>
                              <div className="text-sm text-gray-600">CBA AI Experts</div>
                              <div className="text-sm text-gray-500">Build your first chatbot and automate customer interactions</div>
                            </div>
                            <div className="border-l-4 border-purple-600 pl-4">
                              <div className="font-semibold">1:30 PM - AI for Data Analysis</div>
                              <div className="text-sm text-gray-600">Dr. Michael Roberts</div>
                              <div className="text-sm text-gray-500">Use AI to analyze business data and make informed decisions</div>
                            </div>
                            <div className="border-l-4 border-orange-600 pl-4">
                              <div className="font-semibold">2:30 PM - AI Marketing Automation</div>
                              <div className="text-sm text-gray-600">Sarah Thompson</div>
                              <div className="text-sm text-gray-500">Automate your marketing with AI tools and strategies</div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="classroom" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-center">Large Classroom Schedule</h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-600 pl-4">
                          <div className="font-semibold">10:30 AM - AI Tools Workshop</div>
                          <div className="text-sm text-gray-600">Hands-on Learning</div>
                          <div className="text-sm text-gray-500">ChatGPT, Claude, practical applications</div>
                        </div>
                        <div className="border-l-4 border-blue-600 pl-4">
                          <div className="font-semibold">12:00 PM - Business Automation</div>
                          <div className="text-sm text-gray-600">Small Business Focus</div>
                          <div className="text-sm text-gray-500">Streamline operations with AI</div>
                        </div>
                        <div className="border-l-4 border-purple-600 pl-4">
                          <div className="font-semibold">2:00 PM - AI Ethics</div>
                          <div className="text-sm text-gray-600">Discussion Panel</div>
                          <div className="text-sm text-gray-500">Responsible AI development</div>
                        </div>
                        <div className="border-l-4 border-orange-600 pl-4">
                          <div className="font-semibold">3:30 PM - Q&A Session</div>
                          <div className="text-sm text-gray-600">Open Discussion</div>
                          <div className="text-sm text-gray-500">Your questions answered</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="exhibition" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-center">3rd Floor Exhibition Space</h3>
                      
                      {/* Loading state */}
                      {exhibitorsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-100 p-4 rounded-lg animate-pulse">
                              <div className="h-4 bg-gray-300 rounded mb-2"></div>
                              <div className="h-3 bg-gray-300 rounded"></div>
                            </div>
                          ))}
                        </div>
                      ) : liveExhibitors && liveExhibitors.length > 0 ? (
                        /* Live exhibitor data */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {liveExhibitors.map((exhibitor, index) => (
                            <div key={exhibitor.id || index} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-semibold mb-2 text-blue-800">
                                {exhibitor.companyName || 'Company Name'}
                              </h4>
                              <p className="text-sm text-blue-600 mb-1">
                                {exhibitor.contactName && `Contact: ${exhibitor.contactName}`}
                              </p>
                              <p className="text-sm text-blue-600">
                                {exhibitor.businessDescription || exhibitor.productsServices || 'Innovative business solutions'}
                              </p>
                              {exhibitor.standLocation && (
                                <p className="text-xs text-blue-500 mt-2">
                                  📍 {exhibitor.standLocation} {exhibitor.standNumber && `- Stand ${exhibitor.standNumber}`}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* No exhibitors message */
                        <div className="text-center py-8">
                          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">Exhibition Spaces Available</h4>
                          <p className="text-gray-600 mb-4">
                            We're currently finalizing our exhibitor lineup. Check back soon to see the amazing companies that will be showcasing their AI innovations!
                          </p>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                              <strong>What to expect:</strong> AI startups, tech demonstrations, networking opportunities, and business service providers
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Exhibition booking notice */}
                      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                        <h4 className="font-semibold text-red-700 mb-2">Exhibition Spaces - FULLY BOOKED</h4>
                        <p className="text-sm text-red-600">
                          All exhibition stands have been reserved. Thank you for the overwhelming response!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="speakers" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Featured Speakers</h2>
                <p className="text-lg text-neutral-600">Industry leaders sharing insights on AI innovation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Crown className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Kanishka Narayan</h3>
                    <p className="text-purple-600 font-semibold mb-2">AI Minister</p>
                    <p className="text-sm text-gray-600">Opening keynote on the future of AI in government and society</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Building className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Tech Industry Panel</h3>
                    <p className="text-green-600 font-semibold mb-2">Business Leaders</p>
                    <p className="text-sm text-gray-600">How AI is transforming business operations and strategy</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Local Entrepreneurs</h3>
                    <p className="text-purple-600 font-semibold mb-2">Startup Founders</p>
                    <p className="text-sm text-gray-600">Success stories from Croydon's growing AI ecosystem</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="workshops" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Interactive Workshops</h2>
                <p className="text-lg text-neutral-600">Hands-on learning experiences for all skill levels</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <BookOpen className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">AI Tools for Everyone</h3>
                        <p className="text-sm text-gray-600">Beginner-friendly</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Learn to use ChatGPT, Claude, and other AI tools effectively for personal and business use.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>10:30 AM - 12:00 PM</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Business Automation</h3>
                        <p className="text-sm text-gray-600">Intermediate</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Automate repetitive tasks and streamline operations using AI-powered tools.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>12:00 PM - 1:00 PM</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Shield className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">AI Ethics & Responsibility</h3>
                        <p className="text-sm text-gray-600">All levels</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Understanding the ethical implications and responsible use of AI technology.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>2:00 PM - 3:00 PM</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-orange-100 p-3 rounded-full">
                        <MessageCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Q&A with Experts</h3>
                        <p className="text-sm text-gray-600">Interactive</p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Open discussion and questions with our panel of AI experts and practitioners.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>3:30 PM - 4:00 PM</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="exhibition" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Micro Business Exhibition</h2>
                <p className="text-lg text-neutral-600">Discover innovative AI startups and connect with entrepreneurs</p>
              </div>

              {/* Exhibition Pricing */}
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-center text-purple-800">Exhibition Pricing</CardTitle>
                  <p className="text-center text-purple-600">Premium exhibition opportunities for micro businesses</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Space Only Options</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 2x2 metres: <strong>£588</strong></li>
                        <li>• 2x3 metres: <strong>£882</strong></li>
                        <li>• 2x4 metres: <strong>£1,176</strong></li>
                        <li>• 3x3 metres: <strong>£1,323</strong></li>
                        <li>• 3x4 metres: <strong>£1,764</strong></li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Bring your own pop-up stand</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-800 mb-2">Table Options</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Table for 2 people: <strong>£882</strong></li>
                        <li>• Table for 4 people: <strong>£1,764</strong></li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Includes table, chairs, and space</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-gray-800 mb-2">What's Included</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Event access</li>
                        <li>• Basic amenities</li>
                        <li>• Promotional opportunities</li>
                        <li>• Networking access</li>
                        <li>• Marketing support</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">£147 per square metre base rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exhibition Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                      <Rocket className="h-6 w-6" />
                      Showcase Your Innovation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 mb-4">
                      Are you an AI startup or business with AI solutions? Showcase your innovation 
                      at our micro business exhibition.
                    </p>
                    <div className="space-y-2 text-sm text-green-700 mb-4">
                      <div>• Premium exhibition opportunity</div>
                      <div>• Direct access to potential customers</div>
                      <div>• Networking with investors and partners</div>
                      <div>• Exposure to local media and influencers</div>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-green-600 mb-4">
                      <p className="text-sm font-semibold text-gray-800">Exhibition Pricing:</p>
                      <p className="text-xs text-gray-600">Space from £588 (2x2m) • Tables from £882 (2 people)</p>
                      <p className="text-xs text-gray-600">£147 per square metre base rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Exhibition Pricing Summary - Prominent Display */}
        <div className="py-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Exhibition Opportunities</h2>
              <p className="text-xl text-blue-100">Showcase your micro business at London's premier AI event</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">Space Only Options</h3>
                <div className="space-y-2 text-lg">
                  <div className="flex justify-between">
                    <span>2×2 metres:</span>
                    <span className="font-bold">£588</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2×3 metres:</span>
                    <span className="font-bold">£882</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3×3 metres:</span>
                    <span className="font-bold">£1,323</span>
                  </div>
                </div>
                <p className="text-sm text-blue-100 mt-3">Bring your own pop-up stand</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">Table Options</h3>
                <div className="space-y-2 text-lg">
                  <div className="flex justify-between">
                    <span>Table for 2 people:</span>
                    <span className="font-bold">£882</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Table for 4 people:</span>
                    <span className="font-bold">£1,764</span>
                  </div>
                </div>
                <p className="text-sm text-blue-100 mt-3">Includes table, chairs & space</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4 text-yellow-300">What's Included</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Event access</li>
                  <li>• Basic amenities</li>
                  <li>• Promotional opportunities</li>
                  <li>• Networking access</li>
                  <li>• Marketing support</li>
                </ul>
                <p className="text-purple-100 font-bold mt-3">Base rate: £147 per m²</p>
              </div>
            </div>

          </div>
        </div>

        {/* Event Statistics */}
        <div className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-600 font-medium">Attendees</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">30+</div>
                <div className="text-gray-600 font-medium">Speakers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">25+</div>
                <div className="text-gray-600 font-medium">Sessions</div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* About The Summit - Enhanced */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">About The Summit</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The South London AI Summit brings together the brightest minds in artificial intelligence, 
                innovative businesses, and tech enthusiasts for a day of learning, networking, and collaboration.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <Rocket className="h-12 w-12 text-blue-600 mb-3 mx-auto" />
                  <CardTitle className="text-xl text-center">For AI Startups</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Showcase your innovative AI solutions, connect with investors, and expand your network in London's growing tech ecosystem.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-blue-600 border-blue-600" />
                      <span className="text-sm">Product demos</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-blue-600 border-blue-600" />
                      <span className="text-sm">Investor meetings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-blue-600 border-blue-600" />
                      <span className="text-sm">Networking events</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-green-50 to-green-100">
                  <Building className="h-12 w-12 text-green-600 mb-3 mx-auto" />
                  <CardTitle className="text-xl text-center">For Businesses</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Discover how AI can transform your operations, improve efficiency, and help your business thrive in the digital age.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-600 border-green-600" />
                      <span className="text-sm">AI adoption workshops</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-600 border-green-600" />
                      <span className="text-sm">Solution providers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-green-600 border-green-600" />
                      <span className="text-sm">Implementation strategies</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <Users className="h-12 w-12 text-purple-600 mb-3 mx-auto" />
                  <CardTitle className="text-xl text-center">For Everyone</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Learn about the latest AI trends, participate in workshops, and be part of South London's growing tech ecosystem.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-purple-600 border-purple-600" />
                      <span className="text-sm">Expert talks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-purple-600 border-purple-600" />
                      <span className="text-sm">Hands-on workshops</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="outline" className="w-2 h-2 p-0 rounded-full bg-purple-600 border-purple-600" />
                      <span className="text-sm">Community building</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Building a Smarter, Fairer Croydon Section */}
          <div className="mb-16">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-center text-neutral-900 mb-6">
                  Building a Smarter, Fairer Croydon with AI
                </h2>
                <p className="text-lg text-center text-gray-700 mb-8 max-w-3xl mx-auto">
                  The AI Summit is more than a tech event—it's a community empowerment initiative bringing together 
                  technology, local businesses, and residents to create a more inclusive and innovative Croydon.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Digital Inclusion</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Ensuring all Croydon residents, regardless of background, have access to AI tools, training, and opportunities.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> Accessible technology
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> Multilingual support
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> Free workshops
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-3 rounded-full">
                        <GraduationCap className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Future Skills for All</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Equipping the community with AI skills for career growth, business development, and personal enrichment.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span> Career switchers support
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span> Small business training
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600">✓</span> Student opportunities
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Family Enrichment</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Showcasing how AI can improve quality of life for families at home, school, and work.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-600">✓</span> Kids & teens activities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-600">✓</span> Senior-friendly tech
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-600">✓</span> Family workshops
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI For Everyone Section */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-900 mb-4">AI For Everyone</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join us for an inclusive event that brings AI technology to all Croydon residents, 
                regardless of age, background, or technical knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100">
                  <Users className="h-12 w-12 text-orange-600 mb-3 mx-auto" />
                  <CardTitle className="text-xl text-center">For Families</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Interactive exhibits and workshops showing how AI can improve daily life at home, school, and work.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-orange-600">•</span> AI in Daily Life Zone
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-600">•</span> Kids & Teens Discovery Lab
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-orange-600">•</span> AI Art & Music Creation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-teal-50 to-teal-100">
                  <Rocket className="h-12 w-12 text-teal-600 mb-3 mx-auto" />
                  <CardTitle className="text-xl text-center">For Career Switchers</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Resources and guidance for those looking to transition into AI-related careers or enhance their skills.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">•</span> AI Career Switchers Hub
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">•</span> Skills Assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-teal-600">•</span> Local Training Opportunities
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <Coffee className="h-12 w-12 text-indigo-600 mb-3 mx-auto" />
                  <CardTitle className="text-xl text-center">For Seniors</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-600 mb-4">
                    Demonstrations and hands-on sessions showing how AI can assist older residents in daily tasks.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-600">•</span> AI for the Elderly
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-600">•</span> Voice Assistant Workshops
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-indigo-600">•</span> Healthcare Monitoring Demos
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Community Partnership</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-lg text-neutral-700">
                    The Croydon Business Association is proud to present the <strong>First AI Summit in Croydon</strong>, 
                    positioning our community as leaders in the AI revolution. This groundbreaking event brings together 
                    entrepreneurs, residents, students, and AI experts for a day of learning and networking.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                    <div className="text-center">
                      <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <GraduationCap className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="font-medium">Educate</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <Lightbulb className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="font-medium">Motivate</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="font-medium">Develop</div>
                    </div>
                    <div className="text-center">
                      <div className="bg-orange-100 p-3 rounded-full w-fit mx-auto mb-2">
                        <Rocket className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="font-medium">Empower</div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Special Thanks:</strong> This event is made possible by the enthusiastic support of 
                      LSBU students and volunteers who are eager for work opportunities in the fast-moving AI sector.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-sm text-neutral-600">{eventDetails.date}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div className="text-sm text-neutral-600">{eventDetails.time}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Venue</div>
                        <div className="text-sm text-neutral-600">{eventDetails.venue}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Gift className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Admission</div>
                        <div className="text-sm text-green-600 font-medium">{eventDetails.price}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Capacity</div>
                        <div className="text-sm text-orange-600">{eventDetails.capacity}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Reserve Your Spot</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    No upfront payment required. Reserve your seat now and we'll handle billing separately if needed.
                  </p>
                  <Button 
                    className={`w-full font-semibold ${
                      (registrationStatus as any)?.isRegistered 
                        ? "bg-green-500 hover:bg-green-600 cursor-default" 
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    onClick={() => !(registrationStatus as any)?.isRegistered && setShowRegistrationForm(true)}
                    disabled={(registrationStatus as any)?.isRegistered}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>{(registrationStatus as any)?.isRegistered ? "✓ Spot Reserved" : "Reserve Your Spot"}</span>
                  </Button>
                  <p className="text-xs text-neutral-500 mt-2">
                    Free for most attendees • Special rates available • Invoicing options
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-12">
            <CardContent className="text-center p-8">
              <h3 className="text-3xl font-bold mb-4">Ready to Join the AI Revolution?</h3>
              <p className="text-xl mb-6 text-blue-100">
                Be part of Croydon's first AI Summit and position yourself at the forefront of technological innovation
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className={`font-semibold ${
                    (registrationStatus as any)?.isRegistered 
                      ? "bg-green-500 text-white hover:bg-green-600 cursor-default" 
                      : "bg-white text-blue-600 hover:bg-blue-50"
                  }`}
                  onClick={() => !(registrationStatus as any)?.isRegistered && setShowRegistrationForm(true)}
                  disabled={(registrationStatus as any)?.isRegistered}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  <span>{(registrationStatus as any)?.isRegistered ? "✓ Registered for FREE" : "Register for FREE"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form Modal */}
        {showRegistrationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6">
                {!isRegistrationSuccess ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-neutral-900">Create Account & Register for AI Summit</h2>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={() => setShowRegistrationForm(false)}
                        data-testid="button-close-form"
                      >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <p className="text-neutral-600 mb-6">
                      Create your account and register for Croydon's first AI Summit. This will give you access to your personal QR code and event details.
                    </p>
                
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={registrationData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={registrationData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={registrationData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmEmail">Confirm Email Address *</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={registrationData.confirmEmail}
                      onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                      required
                      data-testid="input-confirm-email"
                    />
                    {registrationData.email && registrationData.confirmEmail && 
                     registrationData.email.trim().toLowerCase() !== registrationData.confirmEmail.trim().toLowerCase() && (
                      <p className="text-xs text-red-500 mt-1">Email addresses do not match</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={passwordVisible ? "text" : "password"}
                        value={registrationData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        data-testid="input-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {registrationData.password && (
                      <div className="text-xs mt-1">
                        {(() => {
                          const validation = validatePasswordStrength(registrationData.password);
                          return (
                            <p className={validation.isValid ? "text-green-600" : "text-red-500"}>
                              {validation.isValid ? "✓ Password meets requirements" : validation.message}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={confirmPasswordVisible ? "text" : "password"}
                        value={registrationData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                        data-testid="input-confirm-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      >
                        {confirmPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {registrationData.password && registrationData.confirmPassword && 
                     registrationData.password !== registrationData.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="mobileNumber">Mobile Number *</Label>
                    <Input
                      id="mobileNumber"
                      type="tel"
                      value={registrationData.mobileNumber}
                      onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                      placeholder="+44 7700 900123"
                      required
                      data-testid="input-mobile"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required for event updates and emergency contact
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Are you a resident or business owner? *</Label>
                    <RadioGroup
                      value={registrationData.memberSegment}
                      onValueChange={(value: 'resident' | 'business_owner') => 
                        handleInputChange("memberSegment", value)
                      }
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
                    >
                      <div className="flex items-center space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="resident" id="resident" data-testid="radio-resident" />
                        <div className="flex-1">
                          <Label htmlFor="resident" className="flex items-center gap-2 font-medium">
                            <Home className="h-4 w-4" />
                            Resident
                          </Label>
                          <p className="text-sm text-gray-600">Community member and local resident</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 border rounded-lg p-4">
                        <RadioGroupItem value="business_owner" id="business_owner" data-testid="radio-business-owner" />
                        <div className="flex-1">
                          <Label htmlFor="business_owner" className="flex items-center gap-2 font-medium">
                            <Briefcase className="h-4 w-4" />
                            Business Owner
                          </Label>
                          <p className="text-sm text-gray-600">Business owner or entrepreneur</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={registerMutation.isPending}
                    data-testid="button-register-submit"
                  >
                    {registerMutation.isPending ? (
                      <span>Creating Account & Registering...</span>
                    ) : (
                      <span>Create Account & Register for AI Summit</span>
                    )}
                  </Button>
                  
                    <p className="text-xs text-gray-500 text-center">
                      This will create your account and register you for the AI Summit
                    </p>
                    
                    {showTestButton && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={fillTestData}
                        className="w-full mt-2 text-xs"
                      >
                        Fill Test Data (Dev Only)
                      </Button>
                    )}
                  </form>
                </>
                ) : (
                  // Success State with Post-Registration Instructions
                  <div className="text-center space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-green-600">Registration Successful! 🎉</h2>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 hover:bg-gray-100"
                        onClick={handleSuccessClose}
                        data-testid="button-close-success"
                      >
                        <span className="sr-only">Close</span>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-green-800 mb-4">
                        Welcome to the First AI Summit Croydon 2025!
                      </h3>
                      <p className="text-green-700">
                        Your account has been created and you're now registered for the AI Summit. 
                        Follow these simple steps to complete your setup:
                      </p>
                    </div>
                    
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          ✓
                        </div>
                        <div>
                          <h4 className="font-bold text-green-800">Account Created & Verified!</h4>
                          <p className="text-green-700 text-sm">
                            Your account is ready to use immediately. No email verification required - you can log in right away!
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-800">Log In to Your Account</h4>
                          <p className="text-blue-700 text-sm">
                            Use your email and password to log in and access your personalized dashboard right now.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div>
                          <h4 className="font-bold text-orange-800">Access Your QR Code & Badge</h4>
                          <p className="text-orange-700 text-sm">
                            Go to "My QR Code" to view your digital summit badge and QR code for easy check-in.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Link href="/login" className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <User className="mr-2 h-4 w-4" />
                          Go to Login Page
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        onClick={handleSuccessClose}
                        className="flex-1"
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Continue Browsing
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                      <p className="text-sm text-gray-600">
                        <strong>What's Next?</strong> Once you're logged in, you can book workshop sessions, 
                        view the full event schedule, and customize your attendee profile.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sponsor Spotlight Section */}
        <div className="mb-12">
          <SponsorSpotlight />
        </div>
      </div>
    </>
  );
};

export default AISummit;
