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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import { ParticipantTypeSelector } from "@/components/forms/ParticipantTypeSelector";
import { SponsorSpotlight } from "@/components/SponsorSpotlight";

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

  // Fetch person types and categories for the form
  const { data: allPersonTypes = [] } = useQuery<any[]>({
    queryKey: ['/api/person-types'],
    staleTime: 0,
  });

  // Fetch live AI Summit data
  const { data: liveSpeakingSessions = [], isLoading: speakingSessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    retry: false,
  });

  const { data: liveWorkshops = [], isLoading: workshopsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/workshops/active'],
    retry: false,
  });

  // No longer needed - simplified registration


  // Simplified form state
  const [showExhibitorForm, setShowExhibitorForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  
  // Password visibility for simplified form
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password visibility for other forms
  const [showExhibitorPassword, setShowExhibitorPassword] = useState(false);
  const [showExhibitorConfirmPassword, setShowExhibitorConfirmPassword] = useState(false);
  const [showSpeakerPassword, setShowSpeakerPassword] = useState(false);
  const [showSpeakerConfirmPassword, setShowSpeakerConfirmPassword] = useState(false);
  const [showVolunteerPassword, setShowVolunteerPassword] = useState(false);
  const [showVolunteerConfirmPassword, setShowVolunteerConfirmPassword] = useState(false);
  const [showSponsorPassword, setShowSponsorPassword] = useState(false);
  const [showSponsorConfirmPassword, setShowSponsorConfirmPassword] = useState(false);
  // Simplified registration form with only 7 fields
  const [registrationData, setRegistrationData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    participantType: "resident" // "resident" or "business_owner"
  });

  // Auto-populate form when user data is available (simplified)
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
        confirmEmail: userEmail
      }));
    }
  }, [user, showRegistrationForm]);
  const [exhibitorData, setExhibitorData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    businessDescription: "",
    productsServices: "",
    exhibitionGoals: "",
    boothRequirements: "",
    electricalNeeds: false,
    internetNeeds: false,
    specialRequirements: "",
    marketingMaterials: "",
    numberOfAttendees: 2,
    previousExhibitor: false,
    referralSource: "",
    agreesToTerms: false,
    password: "",
    confirmPassword: "",
    attendees: [{
      name: "",
      email: "",
      jobTitle: "",
      participantType: "exhibitor",
      customRole: "",
      isSpeaker: false,
      speakerBio: "",
      presentationTitle: "",
      presentationDescription: ""
    }]
  });

  const [speakerData, setSpeakerData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    website: "",
    linkedIn: "",
    bio: "",
    password: "",
    confirmPassword: "",
    sessionType: "talk",
    talkTitle: "",
    talkDescription: "",
    topicOutline: "",
    preferredDuration: "",
    talkDuration: "15",
    audienceLevel: "Beginner",
    speakingExperience: "",
    previousSpeaking: false,
    techRequirements: "",
    availableSlots: [] as string[],
    motivationToSpeak: "",
    keyTakeaways: "",
    interactiveElements: false,
    handoutsProvided: false,
    agreesToTerms: false
  });

  const [volunteerData, setVolunteerData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    shift: "",
    experience: "",
    availability: "",
    emergencyContact: "",
    tShirtSize: "",
    dietaryRequirements: "",
    agreesToTerms: false,
    password: "",
    confirmPassword: ""
  });

  const [sponsorData, setSponsorData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    password: "",
    confirmPassword: "",
    companyWebsite: "",
    companyDescription: "",
    packageName: "",
    specialRequests: "",
    agreesToTerms: false
  });
  
  const { toast } = useToast();

  const eventDetails = {
    title: "First AI Summit Croydon 2025",
    date: "October 1st, 2025",
    time: "10:00 AM - 4:00 PM",
    venue: "LSBU London South Bank University Croydon",
    price: "Reserve your spot - No payment required",
    capacity: "Limited places available",
    registration: "Required - Reserve now, pay later if applicable"
  };

  // Extract speakers from live speaking sessions data
  const speakers = liveSpeakingSessions.map(session => ({
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
  const auditoriumSchedule = liveSpeakingSessions.map(session => ({
    time: formatSessionTime(session.startTime, session.endTime),
    title: session.title,
    type: session.sessionType?.toLowerCase() || "talk",
    speaker: session.facilitator || "CBA Team",
    description: session.description || "AI Summit session",
    capacity: `${session.maxCapacity} people`
  }));

  // Transform live workshops data into schedule format
  const classroomSchedule = liveWorkshops.map(workshop => ({
    time: formatSessionTime(workshop.startTime, workshop.endTime),
    title: workshop.title,
    type: "workshop",
    speaker: workshop.facilitator || "CBA Team",
    description: workshop.description || "Interactive workshop session",
    capacity: `${workshop.maxCapacity} people`,
    requirements: workshop.prerequisites || "No prerequisites"
  }));

  // Fallback data if API fails (keeping original structure for now)
  const fallbackClassroomSchedule = [
    {
      time: "11:00 - 11:45",
      title: "Workshop: AI Tools for Content Creation",
      type: "workshop",
      speaker: "LSBU Students & Volunteers",
      description: "Hands-on session with ChatGPT, Midjourney, and business AI tools",
      capacity: "30 people",
      requirements: "Bring laptop/tablet"
    },
    {
      time: "12:00 - 12:45",
      title: "Workshop: Building Your First AI Chatbot",
      type: "workshop",
      speaker: "CBA AI Experts",
      description: "Build your first chatbot and automate customer interactions",
      capacity: "25 people",
      requirements: "Basic computer skills"
    },
    {
      time: "13:30 - 14:15",
      title: "Workshop: AI for Data Analysis",
      type: "workshop",
      speaker: "Dr. Michael Roberts",
      description: "Use AI to analyze business data and make informed decisions",
      capacity: "20 people",
      requirements: "Excel knowledge helpful"
    },
    {
      time: "14:30 - 15:15",
      title: "Workshop: AI Marketing Automation",
      type: "workshop",
      speaker: "Sarah Thompson",
      description: "Automate your marketing with AI tools and strategies",
      capacity: "25 people",
      requirements: "Bring business ideas"
    },
    {
      time: "15:30 - 16:00",
      title: "Workshop Showcase & Networking",
      type: "showcase",
      speaker: "All Workshop Leaders",
      description: "Share your workshop creations and connect with participants",
      capacity: "65 people",
      requirements: "None"
    }
  ];

  // Use live data when available, fallback to static data
  const finalClassroomSchedule = liveWorkshops.length > 0 ? classroomSchedule : fallbackClassroomSchedule;
  const finalAuditoriumSchedule = liveSpeakingSessions.length > 0 ? auditoriumSchedule : [
    {
      time: "9:30 - 10:00",
      title: "Registration & Welcome Coffee",
      type: "registration",
      speaker: "CBA Team",
      description: "Network with fellow attendees and collect your summit materials",
      capacity: "All attendees"
    },
    {
      time: "11:00 - 11:30",
      title: "The Future of AI in Small Business",
      type: "talk",
      speaker: "Dr. Sarah Chen",  
      description: "Practical AI applications that every small business can implement",
      capacity: "80 people"
    },
    {
      time: "11:30 - 11:45",
      title: "Coffee Break & Networking",
      type: "break",
      speaker: "",
      description: "Connect with other entrepreneurs and AI enthusiasts",
      capacity: "All attendees"
    },
    {
      time: "12:15 - 13:00",
      title: "Implementing AI on a Budget",
      type: "talk",
      speaker: "Marcus Johnson",
      description: "Real-world case studies of affordable AI implementation",
      capacity: "80 people"
    },
    {
      time: "14:45 - 15:30",
      title: "Responsible AI for Business",
      type: "talk",
      speaker: "Dr. Priya Patel",
      description: "Ethics, compliance, and best practices for AI adoption",
      capacity: "80 people"
    },
    {
      time: "15:30 - 16:00",
      title: "Panel Discussion & Closing",
      type: "panel",
      speaker: "All Speakers + CBA Team",
      description: "Q&A session and next steps for AI adoption in Croydon",
      capacity: "120 people"
    }
  ];

  // Large 3rd Floor Space - Micro Business Exhibition
  const exhibitionSchedule = [
    {
      time: "10:00 - 10:15",
      title: "Final Registration & Badge Setup",
      type: "registration",
      speaker: "CBA Registration Team",
      description: "Complete registration, collect lanyards, print badges for latecomers, and prepare for opening ceremony",
      capacity: "All attendees",
      features: "Badge printing station available"
    },
    {
      time: "10:15 - 10:45",
      title: "Opening Keynote: AI Revolution in Croydon",
      type: "keynote",
      speaker: "Jose Martinez, CBA Founder",
      description: "How Croydon is becoming the AI capital of South London - Main opening speech for all attendees",
      capacity: "All attendees",
      features: "Main opening ceremony"
    },
    {
      time: "10:30 - 16:00",
      title: "Micro Business AI Exhibition",
      type: "exhibition",
      speaker: "AI Startups & Tech Companies",
      description: "Explore innovative AI solutions from local and emerging businesses",
      capacity: "Open format",
      features: "20+ exhibition booths"
    },
    {
      time: "12:00 - 13:00",
      title: "Exhibition Lunch Hour",
      type: "networking",
      speaker: "All Exhibitors",
      description: "Lunch networking with exhibitors and attendees",
      capacity: "Open format",
      features: "Food & refreshments available"
    },
    {
      time: "13:15 - 13:45",
      title: "Exhibitor Spotlight Sessions",
      type: "demo",
      speaker: "Selected Exhibitors",
      description: "15-minute product demos and business pitches",
      capacity: "Standing room",
      features: "Live demonstrations"
    },
    {
      time: "14:00 - 14:30",
      title: "AI Innovation Showcase",
      type: "demo",
      speaker: "Local AI Innovators",
      description: "Showcase of cutting-edge AI applications and tools",
      capacity: "Standing room",
      features: "Interactive displays"
    },
    {
      time: "15:00 - 15:45",
      title: "Business Speed Networking",
      type: "networking",
      speaker: "All Attendees",
      description: "Connect with AI entrepreneurs, investors, and potential partners",
      capacity: "All participants",
      features: "Structured networking"
    }
  ];

  const workshops = [
    {
      title: "AI Tools for Content Creation",
      time: "11:30 - 12:15",
      level: "Beginner",
      capacity: "30 people",
      description: "Learn to use ChatGPT, Midjourney, and other AI tools for marketing content",
      tools: ["ChatGPT", "Midjourney", "Copy.ai", "Canva AI"]
    },
    {
      title: "Building Your First AI Chatbot",
      time: "14:00 - 14:45", 
      level: "Intermediate",
      capacity: "25 people",
      description: "Hands-on workshop to create a customer service chatbot for your business",
      tools: ["Chatfuel", "ManyChat", "Dialogflow", "WordPress AI"]
    },
    {
      title: "AI Data Analysis for Small Business",
      time: "15:45 - 16:30",
      level: "Advanced",
      capacity: "20 people",
      description: "Use AI to analyze business data and make informed decisions",
      tools: ["Google Analytics AI", "Excel AI", "Tableau", "Power BI"]
    }
  ];

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
      // Validate required fields on client-side
      if (!data.firstName?.trim() || !data.lastName?.trim()) {
        throw new Error("First name and last name are required");
      }
      if (!data.email?.trim()) {
        throw new Error("Email address is required");
      }
      if (!data.mobileNumber?.trim()) {
        throw new Error("Phone number is required for event updates and safety notifications");
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        throw new Error("Please provide a valid email address");
      }
      
      // Phone validation - basic check for minimum length
      const cleanPhone = data.mobileNumber.trim().replace(/[\s\-\(\)]/g, '');
      if (cleanPhone.length < 10) {
        throw new Error("Please provide a valid phone number with at least 10 digits");
      }

      const submissionData = {
        ...data,
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        phoneNumber: data.mobileNumber || "",
      };
      const response = await apiRequest("POST", "/api/ai-summit-registration", submissionData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Spot Reserved Successfully!",
        description: data.requiresVerification 
          ? "Your spot is reserved! Please check your email to verify your account and access your reservation details."
          : "Your spot is reserved for the AI Summit! You'll receive a confirmation email with all the details.",
      });
      setShowRegistrationForm(false);
      setRegistrationData({
        firstName: "",
        lastName: "",
        email: "",
        confirmEmail: "",
        mobileNumber: "",
        password: "",
        confirmPassword: "",
        participantType: "resident"
      });
      // Refresh registration status
      refetchStatus();
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      
      // Check if this is a duplicate registration error
      if (error?.response?.status === 409 || error?.message?.includes("already registered")) {
        toast({
          title: "Spot Already Reserved!",
          description: "You're spot is already reserved for the AI Summit. Please login to access your account and badge details.",
          variant: "default",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
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

  const exhibitorMutation = useMutation({
    mutationFn: async (data: typeof exhibitorData) => {
      const response = await apiRequest("POST", "/api/ai-summit-exhibitor-registration", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Exhibitor Registration Successful!",
        description: "Thank you for registering as an exhibitor. We'll contact you shortly with booth details.",
      });
      setShowExhibitorForm(false);
      setExhibitorData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        website: "",
        businessDescription: "",
        productsServices: "",
        exhibitionGoals: "",
        boothRequirements: "",
        electricalNeeds: false,
        internetNeeds: false,
        specialRequirements: "",
        marketingMaterials: "",
        numberOfAttendees: 2,
        previousExhibitor: false,
        referralSource: "",
        agreesToTerms: false,
        password: "",
        confirmPassword: "",
        attendees: [{
          name: "",
          email: "",
          jobTitle: "",
          participantType: "exhibitor",
          customRole: "",
          isSpeaker: false,
          speakerBio: "",
          presentationTitle: "",
          presentationDescription: ""
        }]
      });
    },
    onError: (error: any) => {
      // Check if this is a duplicate registration error
      if (error?.response?.status === 409 || error?.message?.includes("already registered")) {
        toast({
          title: "Spot Already Reserved!",
          description: "You're spot is already reserved for the AI Summit. Please login to access your account and badge details.",
          variant: "default",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast({
          title: "Exhibitor Registration Failed",
          description: error instanceof Error ? error.message : "Failed to register as exhibitor. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const speakerMutation = useMutation({
    mutationFn: async (data: typeof speakerData) => {
      const response = await apiRequest("POST", "/api/ai-summit-speaker-interest", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Speaker Account Created!",
        description: "Your speaker account has been created successfully. You can now log in with your email and password. Our program committee will review your submission and contact you soon.",
      });
      setShowSpeakerForm(false);
      setSpeakerData({
        name: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        website: "",
        linkedIn: "",
        bio: "",
        password: "",
        confirmPassword: "",
        sessionType: "talk",
        talkTitle: "",
        talkDescription: "",
        topicOutline: "",
        preferredDuration: "",
        talkDuration: "15",
        audienceLevel: "Beginner",
        speakingExperience: "",
        previousSpeaking: false,
        techRequirements: "",
        availableSlots: [],
        motivationToSpeak: "",
        keyTakeaways: "",
        interactiveElements: false,
        handoutsProvided: false,
        agreesToTerms: false
      });
    },
    onError: (error: any) => {
      // Check if this is a duplicate registration error
      if (error?.response?.status === 409 || error?.message?.includes("already registered")) {
        toast({
          title: "Spot Already Reserved!",
          description: "You're spot is already reserved for the AI Summit. Please login to access your account and badge details.",
          variant: "default",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast({
          title: "Submission Failed",
          description: error instanceof Error ? error.message : "Failed to submit speaker interest. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const volunteerMutation = useMutation({
    mutationFn: async (data: typeof volunteerData) => {
      const response = await apiRequest("POST", "/api/ai-summit/volunteer-registration", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Volunteer Registration Successful!",
        description: "Thank you for volunteering! We'll contact you with more details about your role and schedule.",
      });
      setShowVolunteerForm(false);
      setVolunteerData({
        name: "",
        email: "",
        phone: "",
        role: "",
        shift: "",
        experience: "",
        availability: "",
        emergencyContact: "",
        tShirtSize: "",
        dietaryRequirements: "",
        agreesToTerms: false,
        password: "",
        confirmPassword: ""
      });
    },
    onError: (error: any) => {
      // Check if this is a duplicate registration error
      if (error?.response?.status === 409 || error?.message?.includes("already registered")) {
        toast({
          title: "Spot Already Reserved!",
          description: "You're spot is already reserved for the AI Summit. Please login to access your account and badge details.",
          variant: "default",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast({
          title: "Volunteer Registration Failed",
          description: error instanceof Error ? error.message : "Failed to register as volunteer. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const sponsorMutation = useMutation({
    mutationFn: async (data: typeof sponsorData) => {
      const response = await apiRequest("POST", "/api/ai-summit-sponsor-registration", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sponsor Account Created!",
        description: "Your sponsor account has been created successfully. You can now log in with your email and password. Our sponsorship team will contact you soon to discuss your package.",
      });
      setShowSponsorForm(false);
      setSponsorData({
        companyName: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        password: "",
        confirmPassword: "",
        companyWebsite: "",
        companyDescription: "",
        packageName: "",
        specialRequests: "",
        agreesToTerms: false
      });
    },
    onError: (error: any) => {
      // Check if this is a duplicate registration error
      if (error?.response?.status === 409 || error?.message?.includes("already registered")) {
        toast({
          title: "Spot Already Reserved!",
          description: "You're spot is already reserved for the AI Summit. Please login to access your account and badge details.",
          variant: "default",
        });
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast({
          title: "Sponsor Registration Failed",
          description: error instanceof Error ? error.message : "Failed to register as sponsor. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!registrationData.firstName?.trim()) {
      toast({
        title: "First Name Required",
        description: "Please enter your first name.",
        variant: "destructive",
      });
      return;
    }

    if (!registrationData.lastName?.trim()) {
      toast({
        title: "Last Name Required", 
        description: "Please enter your last name.",
        variant: "destructive",
      });
      return;
    }

    if (!registrationData.email?.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!registrationData.mobileNumber?.trim()) {
      toast({
        title: "Mobile Number Required",
        description: "Please enter your mobile number for SMS updates and emergency contact.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format  
    const cleanPhone = registrationData.mobileNumber.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please provide a valid mobile number with at least 10 digits.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate passwords match
    if (registrationData.password !== registrationData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your password and confirm password fields match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (registrationData.password && registrationData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate(registrationData);
  };

  const handleExhibitorRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (exhibitorData.password !== exhibitorData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your password and confirm password fields match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (exhibitorData.password && exhibitorData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (!exhibitorData.agreesToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the exhibitor terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate attendee numbers against space/table selection
    const numberOfAttendees = exhibitorData.attendees.length;
    
    if (exhibitorData.boothRequirements === 'table-2' && numberOfAttendees !== 2) {
      toast({
        title: "Registration Error",
        description: "You selected a table for 2 people but have " + numberOfAttendees + " attendees. Please match your space selection with attendee count.",
        variant: "destructive",
      });
      return;
    }
    
    if (exhibitorData.boothRequirements === 'table-4' && numberOfAttendees !== 4) {
      toast({
        title: "Registration Error", 
        description: "You selected a table for 4 people but have " + numberOfAttendees + " attendees. Please match your space selection with attendee count.",
        variant: "destructive",
      });
      return;
    }

    if (numberOfAttendees < 2 || numberOfAttendees > 4) {
      toast({
        title: "Registration Error",
        description: "Number of attendees must be between 2-4 people due to venue capacity constraints.",
        variant: "destructive",
      });
      return;
    }

    // Validate that all attendees have required information
    const incompleteAttendees = exhibitorData.attendees.filter(attendee => !attendee.name.trim() || !attendee.email.trim());
    if (incompleteAttendees.length > 0) {
      toast({
        title: "Registration Error",
        description: "Please provide name and email for all attendees.",
        variant: "destructive",
      });
      return;
    }

    if (!exhibitorData.boothRequirements) {
      toast({
        title: "Registration Error",
        description: "Please select an exhibition space option.",
        variant: "destructive",
      });
      return;
    }

    exhibitorMutation.mutate({
      ...exhibitorData,
      numberOfAttendees: exhibitorData.attendees.length
    });
  };

  const handleSpeakerSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (speakerData.password !== speakerData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your password and confirm password fields match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (speakerData.password && speakerData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (!speakerData.agreesToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the speaker terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    speakerMutation.mutate(speakerData);
  };

  const handleSponsorRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (sponsorData.password !== sponsorData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (sponsorData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sponsorData.agreesToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the sponsorship terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    
    sponsorMutation.mutate(sponsorData);
  };

  const handleVolunteerRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (volunteerData.password !== volunteerData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your password and confirm password fields match.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password length
    if (volunteerData.password && volunteerData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    if (!volunteerData.agreesToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the volunteer terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    volunteerMutation.mutate(volunteerData);
  };

  const handleInputChange = (field: string, value: string | number[] | string[]) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Admin test data fill function
  const fillTestData = () => {
    setRegistrationData({
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@test.com",
      confirmEmail: "john.smith@test.com", 
      mobileNumber: "+44 7700 900123",
      password: "TestPassword123",
      confirmPassword: "TestPassword123",
      participantType: "resident"
    });
  };

  // Organization membership helpers removed for simplified form

  // Organization functions removed for simplified form

  const handleExhibitorInputChange = (field: string, value: string | number | boolean) => {
    setExhibitorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttendeeChange = (index: number, field: string, value: any) => {
    setExhibitorData(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => 
        i === index ? { ...attendee, [field]: value } : attendee
      )
    }));
  };

  const addAttendee = () => {
    if (exhibitorData.attendees.length < 4) {
      setExhibitorData(prev => ({
        ...prev,
        attendees: [...prev.attendees, {
          name: "",
          email: "",
          jobTitle: "",
          participantType: "exhibitor",
          customRole: "",
          isSpeaker: false,
          speakerBio: "",
          presentationTitle: "",
          presentationDescription: ""
        }]
      }));
    }
  };

  const removeAttendee = (index: number) => {
    if (exhibitorData.attendees.length > 1) {
      setExhibitorData(prev => ({
        ...prev,
        attendees: prev.attendees.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSpeakerInputChange = (field: string, value: string | boolean | string[]) => {
    setSpeakerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVolunteerInputChange = (field: string, value: string | boolean) => {
    setVolunteerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSponsorInputChange = (field: string, value: string | boolean) => {
    setSponsorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-white/20 max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-yellow-300">
                  Opening the Future: The Minister for AI Takes the Stage
                </h2>
                <p className="text-lg md:text-xl text-white">
                  Don't Miss Our New AI Minister Kanishka Narayan's Opening Keynote!
                </p>
              </div>
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
                    <Link href="/workshop-registration">
                      <div className="bg-green-500 text-white hover:bg-green-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                        <BookOpen className="h-5 w-5" />
                        Workshop Registration
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 justify-center max-w-4xl mx-auto">
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-sm px-4 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[70px]"
                      onClick={() => setShowExhibitorForm(true)}
                    >
                      <Building className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col text-center">
                        <span className="text-xs leading-tight">Exhibit Your Business</span>
                        <span className="text-xs text-blue-200">From £588</span>
                      </div>
                    </button>
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-sm px-4 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[70px]"
                      onClick={() => setShowSpeakerForm(true)}
                    >
                      <Mic className="h-4 w-4 shrink-0" />
                      <span className="text-xs leading-tight">Speak at Summit</span>
                    </button>
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-sm px-4 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[70px]"
                      onClick={() => setShowVolunteerForm(true)}
                    >
                      <UserPlus className="h-4 w-4 shrink-0" />
                      <span className="text-xs leading-tight">Volunteer with Us</span>
                    </button>
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-sm px-4 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[70px]"
                      onClick={() => setShowSponsorForm(true)}
                    >
                      <Trophy className="h-4 w-4 shrink-0" />
                      <span className="text-xs leading-tight">Become a Sponsor</span>
                    </button>
                  </div>
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
                        <div className="border-l-4 border-blue-600 pl-4">
                          <div className="font-semibold">10:00 AM - Opening Keynote</div>
                          <div className="text-sm text-gray-600">Kanishka Narayan, AI Minister</div>
                          <div className="text-sm text-gray-500">Welcome & AI Future Vision</div>
                        </div>
                        <div className="border-l-4 border-green-600 pl-4">
                          <div className="font-semibold">11:00 AM - AI in Business</div>
                          <div className="text-sm text-gray-600">Industry Panel</div>
                          <div className="text-sm text-gray-500">How AI transforms operations</div>
                        </div>
                        <div className="border-l-4 border-purple-600 pl-4">
                          <div className="font-semibold">1:00 PM - Lunch & Networking</div>
                          <div className="text-sm text-gray-600">All Attendees</div>
                          <div className="text-sm text-gray-500">Food, drinks, connections</div>
                        </div>
                        <div className="border-l-4 border-orange-600 pl-4">
                          <div className="font-semibold">2:30 PM - Future of AI</div>
                          <div className="text-sm text-gray-600">Tech Leaders</div>
                          <div className="text-sm text-gray-500">Emerging technologies & trends</div>
                        </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">AI Startups Showcase</h4>
                          <p className="text-sm text-gray-600">Discover innovative AI solutions from local entrepreneurs</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Tech Demos</h4>
                          <p className="text-sm text-gray-600">Live demonstrations of cutting-edge AI tools</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Networking Hub</h4>
                          <p className="text-sm text-gray-600">Connect with fellow entrepreneurs and investors</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Business Services</h4>
                          <p className="text-sm text-gray-600">AI-powered solutions for your business needs</p>
                        </div>
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
                  <Button 
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 font-semibold text-white"
                    onClick={() => setShowExhibitorForm(true)}
                  >
                    <Building className="mr-2 h-5 w-5" />
                    <span>Apply for Exhibition Space</span>
                  </Button>
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
                    <Button 
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 font-semibold text-white"
                      onClick={() => setShowExhibitorForm(true)}
                    >
                      <span>Apply for Exhibition Space</span>
                    </Button>
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

            <div className="text-center">
              <button 
                className="bg-white text-purple-600 hover:bg-purple-50 text-xl px-8 py-4 font-bold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                onClick={() => setShowExhibitorForm(true)}
              >
                <Building className="h-6 w-6" />
                Reserve Your Exhibition Space
              </button>
              <p className="text-blue-100 mt-2">Limited spaces available • Early bird pricing</p>
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
                <Button 
                  size="lg" 
                  className="bg-purple-600 text-white hover:bg-purple-700 font-semibold"
                  onClick={() => setShowExhibitorForm(true)}
                >
                  <Building className="mr-2 h-5 w-5" />
                  <span>Become an Exhibitor</span>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-green-600 text-white hover:bg-green-700 font-semibold"
                  onClick={() => setShowSpeakerForm(true)}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  <span>Apply to Speak</span>
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Attend the AI Summit by registering</h2>
                  <Button 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={() => setShowRegistrationForm(false)}
                  >
                    <span className="sr-only">Close</span>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-neutral-600 mb-6">
                  Join us for Croydon's first AI Summit on January 25, 2025. Network with entrepreneurs, learn from experts, and explore the future of AI.
                </p>
                
                <ParticipantTypeSelector 
                  personTypes={allPersonTypes}
                  onRegistrationSubmit={handleRegistration}
                  isSubmitting={registrationMutation.isPending}
                  eventSlug="first-ai-summit-croydon-2025"
                />
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
