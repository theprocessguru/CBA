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
  BookOpen
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
  const [showExhibitorForm, setShowExhibitorForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [showSponsorForm, setShowSponsorForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    participantType: "attendee",
    customRole: "",
    company: "",
    jobTitle: "",
    phoneNumber: "",
    businessType: "",
    aiInterest: "",
    accessibilityNeeds: "",
    comments: ""
  });

  // Auto-populate form when user data is available
  useEffect(() => {
    if (user && showRegistrationForm) {
      const userFirstName = (user as any).firstName || "";
      const userLastName = (user as any).lastName || "";
      const userEmail = (user as any).email || "";
      setRegistrationData(prev => ({
        ...prev,
        name: `${userFirstName} ${userLastName}`.trim() || "",
        email: userEmail,
        company: prev.company || "",
        jobTitle: prev.jobTitle || "",
        phoneNumber: prev.phoneNumber || "",
        businessType: prev.businessType || "Technology",
        aiInterest: prev.aiInterest || "Learning about AI for small business",
        accessibilityNeeds: prev.accessibilityNeeds || "None",
        comments: prev.comments || ""
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
    agreesToTerms: false
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
    price: "FREE to attend",
    capacity: "Limited places available",
    registration: "Required - Book your free ticket now"
  };

  const speakers = [
    {
      name: "Dr. Sarah Chen",
      title: "AI Research Director, Tech Innovation Hub",
      topic: "The Future of AI in Small Business",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Leading AI researcher with 15+ years experience in business automation"
    },
    {
      name: "Marcus Johnson",
      title: "CEO, AI Solutions Ltd",
      topic: "Implementing AI on a Budget",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Serial entrepreneur who built three successful AI startups"
    },
    {
      name: "Dr. Priya Patel",
      title: "AI Ethics Consultant",
      topic: "Responsible AI for Business",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Expert in AI ethics and compliance frameworks"
    }
  ];

  // Second Floor Auditorium - Main speaking opportunities with large presentation screen
  const auditoriumSchedule = [
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

  // Large Classroom - Workshop sessions with two screens, seats ~65 people
  const classroomSchedule = [
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
      const response = await apiRequest("POST", "/api/ai-summit-registration", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "Thank you for registering for the AI Summit. You'll receive a confirmation email shortly.",
      });
      setShowRegistrationForm(false);
      setRegistrationData({
        name: "",
        email: "",
        participantType: "attendee",
        customRole: "",
        company: "",
        jobTitle: "",
        phoneNumber: "",
        businessType: "",
        aiInterest: "",
        accessibilityNeeds: "",
        comments: ""
      });
      // Refresh registration status
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register. Please try again.",
        variant: "destructive",
      });
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
    onError: (error) => {
      toast({
        title: "Exhibitor Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register as exhibitor. Please try again.",
        variant: "destructive",
      });
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
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit speaker interest. Please try again.",
        variant: "destructive",
      });
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
        agreesToTerms: false
      });
    },
    onError: (error) => {
      toast({
        title: "Volunteer Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register as volunteer. Please try again.",
        variant: "destructive",
      });
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
    onError: (error) => {
      toast({
        title: "Sponsor Registration Failed",
        description: error instanceof Error ? error.message : "Failed to register as sponsor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registrationData);
  };

  const handleExhibitorRegistration = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleInputChange = (field: string, value: string) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
                🚀 INAUGURAL EVENT
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                First AI Summit
                <span className="block text-3xl md:text-5xl text-blue-200">Croydon 2025</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Educate • Motivate • Develop • Inspire • Empower
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
                        <a className="bg-purple-600 text-white hover:bg-purple-700 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                          <Star className="h-5 w-5" />
                          My QR Code
                        </a>
                      </Link>
                      <Link href="/my-registrations">
                        <a className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                          <Calendar className="h-5 w-5" />
                          My Schedule
                        </a>
                      </Link>
                    </div>
                  ) : (
                    <Link href="/workshop-registration">
                      <a className="bg-green-500 text-white hover:bg-green-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Workshop Registration
                      </a>
                    </Link>
                  )}
                </div>
                <div className="pt-4">
                  <Link href="/my-registrations">
                    <a className="bg-blue-500 text-white hover:bg-blue-600 text-lg px-8 py-4 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-4">
                      <Calendar className="h-5 w-5" />
                      My Schedule & Calendar
                    </a>
                  </Link>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-base px-5 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      onClick={() => setShowExhibitorForm(true)}
                    >
                      <Building className="h-5 w-5" />
                      Exhibit Your Business
                    </button>
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-base px-5 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      onClick={() => setShowSpeakerForm(true)}
                    >
                      <Mic className="h-5 w-5" />
                      Speak at Summit
                    </button>
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-base px-5 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      onClick={() => setShowVolunteerForm(true)}
                    >
                      <UserPlus className="h-5 w-5" />
                      Volunteer with Us
                    </button>
                    <button 
                      className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-base px-5 py-3 font-semibold rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                      onClick={() => setShowSponsorForm(true)}
                    >
                      <Trophy className="h-5 w-5" />
                      Become a Sponsor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Event Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">About the AI Summit</CardTitle>
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
                  <h3 className="font-bold text-lg mb-2">Secure Your Spot</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Free admission but places are limited. Register now to guarantee your attendance.
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
                    <span>{(registrationStatus as any)?.isRegistered ? "✓ Registered" : "Register Now"}</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="schedule" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="workshops">Workshops</TabsTrigger>
              <TabsTrigger value="exhibition">Exhibition</TabsTrigger>
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

                {/* Auditorium Schedule */}
                <TabsContent value="auditorium" className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">Second Floor Auditorium</h3>
                    <p className="text-sm text-purple-800">Main speaking opportunities with large presentation screen. Capacity: 120 people</p>
                  </div>
                  {auditoriumSchedule.map((session, index) => (
                    <Card key={index} className={`${getSessionColor(session.type)} hover:shadow-md transition-shadow`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getSessionIcon(session.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-neutral-900">{session.title}</h3>
                              <Badge variant="outline" className="w-fit">
                                {session.time}
                              </Badge>
                            </div>
                            {session.speaker && (
                              <p className="text-sm font-medium text-neutral-700 mb-1">
                                Speaker: {session.speaker}
                              </p>
                            )}
                            <p className="text-sm text-neutral-600">{session.description}</p>
                            {session.capacity && (
                              <p className="text-xs text-neutral-500 mt-2">Capacity: {session.capacity}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Classroom Schedule */}
                <TabsContent value="classroom" className="space-y-4">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">Large Classroom</h3>
                    <p className="text-sm text-green-800">Workshop sessions with two screens, seats around 65 people. Hands-on activities.</p>
                  </div>
                  {classroomSchedule.map((session, index) => (
                    <Card key={index} className={`${getSessionColor(session.type)} hover:shadow-md transition-shadow`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getSessionIcon(session.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-neutral-900">{session.title}</h3>
                              <Badge variant="outline" className="w-fit">
                                {session.time}
                              </Badge>
                            </div>
                            {session.speaker && (
                              <p className="text-sm font-medium text-neutral-700 mb-1">
                                Speaker: {session.speaker}
                              </p>
                            )}
                            <p className="text-sm text-neutral-600">{session.description}</p>
                            {session.capacity && (
                              <p className="text-xs text-neutral-500 mt-1">Capacity: {session.capacity}</p>
                            )}
                            {session.requirements && (
                              <p className="text-xs text-orange-600 mt-1">Requirements: {session.requirements}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                {/* Exhibition Schedule */}
                <TabsContent value="exhibition" className="space-y-4">
                  <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Large 3rd Floor Space</h3>
                    <p className="text-sm text-red-800">Micro Business Exhibition with open format. Interactive displays and networking.</p>
                  </div>
                  {exhibitionSchedule.map((session, index) => (
                    <Card key={index} className={`${getSessionColor(session.type)} hover:shadow-md transition-shadow`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getSessionIcon(session.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-neutral-900">{session.title}</h3>
                              <Badge variant="outline" className="w-fit">
                                {session.time}
                              </Badge>
                            </div>
                            {session.speaker && (
                              <p className="text-sm font-medium text-neutral-700 mb-1">
                                Speaker: {session.speaker}
                              </p>
                            )}
                            <p className="text-sm text-neutral-600">{session.description}</p>
                            {session.capacity && (
                              <p className="text-xs text-neutral-500 mt-1">Format: {session.capacity}</p>
                            )}
                            {session.features && (
                              <p className="text-xs text-blue-600 mt-1">Features: {session.features}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="speakers" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Featured Speakers</h2>
                <p className="text-lg text-neutral-600">Learn from AI experts and industry leaders</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {speakers.map((speaker, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <img 
                        src={speaker.image} 
                        alt={speaker.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                      <CardTitle className="text-xl">{speaker.name}</CardTitle>
                      <p className="text-sm text-blue-600 font-medium">{speaker.title}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="font-medium text-blue-900">Topic:</p>
                          <p className="text-sm text-blue-800">{speaker.topic}</p>
                        </div>
                        <p className="text-sm text-neutral-600">{speaker.bio}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="workshops" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Hands-on Workshops</h2>
                <p className="text-lg text-neutral-600">Practical AI skills you can use immediately</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {workshops.map((workshop, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{workshop.title}</CardTitle>
                        <Badge className={`${
                          workshop.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          workshop.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {workshop.level}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {workshop.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {workshop.capacity}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-neutral-700 mb-4">{workshop.description}</p>
                      <div>
                        <p className="font-medium text-sm mb-2">Tools Covered:</p>
                        <div className="flex flex-wrap gap-2">
                          {workshop.tools.map((tool, toolIndex) => (
                            <Badge key={toolIndex} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                      <p className="text-xs text-purple-600 mt-2 font-medium">Base rate: £147 per m²</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Exhibition Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">AI startups showcasing innovative solutions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">Live demonstrations of AI tools and services</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">Networking opportunities with AI entrepreneurs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">Product launches and exclusive previews</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                        <span className="text-sm">Investment and partnership opportunities</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-green-800">Exhibit at the Summit</CardTitle>
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
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold transition-all duration-200 shadow-lg"
                  onClick={() => setShowSpeakerForm(true)}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  <span>Speak at Summit</span>
                </Button>
                <Button 
                  size="lg" 
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold transition-all duration-200 shadow-lg"
                  onClick={() => setShowVolunteerForm(true)}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  <span>Volunteer with Us</span>
                </Button>
                <Link to="/membership-benefits">
                  <Button size="lg" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold transition-all duration-200 shadow-lg">
                    <Users className="mr-2 h-5 w-5" />
                    <span>Join CBA Membership</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Form Modal */}
        {showRegistrationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Register for AI Summit 2025</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowRegistrationForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={registrationData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={registrationData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input
                        id="company"
                        type="text"
                        value={registrationData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        type="text"
                        value={registrationData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Your role/position"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        required
                        value={registrationData.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="Your contact number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select value={registrationData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="small-business">Small Business</SelectItem>
                          <SelectItem value="medium-enterprise">Medium Enterprise</SelectItem>
                          <SelectItem value="large-corporation">Large Corporation</SelectItem>
                          <SelectItem value="freelancer">Freelancer/Consultant</SelectItem>
                          <SelectItem value="non-profit">Non-Profit</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aiInterest">AI Interest/Focus Area</Label>
                    <Select value={registrationData.aiInterest} onValueChange={(value) => handleInputChange('aiInterest', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="What aspect of AI interests you most?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content-creation">Content Creation & Marketing</SelectItem>
                        <SelectItem value="automation">Business Process Automation</SelectItem>
                        <SelectItem value="customer-service">Customer Service AI</SelectItem>
                        <SelectItem value="data-analytics">Data Analytics & Insights</SelectItem>
                        <SelectItem value="chatbots">Chatbots & Virtual Assistants</SelectItem>
                        <SelectItem value="productivity">Productivity Tools</SelectItem>
                        <SelectItem value="general-learning">General AI Learning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accessibilityNeeds">Accessibility Requirements</Label>
                    <Input
                      id="accessibilityNeeds"
                      type="text"
                      value={registrationData.accessibilityNeeds}
                      onChange={(e) => handleInputChange('accessibilityNeeds', e.target.value)}
                      placeholder="Any accessibility support needed"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comments">Additional Comments/Questions</Label>
                    <Textarea
                      id="comments"
                      value={registrationData.comments}
                      onChange={(e) => handleInputChange('comments', e.target.value)}
                      placeholder="Any questions or additional information..."
                      rows={3}
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Event Details:</strong> October 1st, 2025 • 10:00 AM - 4:00 PM • LSBU Croydon • FREE Admission
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      By registering, you agree to receive event updates and information about CBA services. You can unsubscribe at any time.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowRegistrationForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registering..." : "Complete Registration"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Exhibitor Registration Modal */}
        {showExhibitorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Exhibitor Registration</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowExhibitorForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleExhibitorRegistration} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        type="text"
                        required
                        value={exhibitorData.companyName}
                        onChange={(e) => handleExhibitorInputChange('companyName', e.target.value)}
                        placeholder="Your company name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactName">Contact Person *</Label>
                      <Input
                        id="contactName"
                        type="text"
                        required
                        value={exhibitorData.contactName}
                        onChange={(e) => handleExhibitorInputChange('contactName', e.target.value)}
                        placeholder="Full name of main contact"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exhibitorEmail">Email Address *</Label>
                      <Input
                        id="exhibitorEmail"
                        type="email"
                        required
                        value={exhibitorData.email}
                        onChange={(e) => handleExhibitorInputChange('email', e.target.value)}
                        placeholder="contact@company.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exhibitorPhone">Phone Number *</Label>
                      <Input
                        id="exhibitorPhone"
                        type="tel"
                        required
                        value={exhibitorData.phone}
                        onChange={(e) => handleExhibitorInputChange('phone', e.target.value)}
                        placeholder="07123 456789"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={exhibitorData.website}
                        onChange={(e) => handleExhibitorInputChange('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="boothRequirements">Exhibition Space Options *</Label>
                      <Select value={exhibitorData.boothRequirements} onValueChange={(value) => handleExhibitorInputChange('boothRequirements', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select space option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="space-2x2">Space Only 2x2 metres - 2-4 people (£588)</SelectItem>
                          <SelectItem value="space-2x3">Space Only 2x3 metres - 2-4 people (£882)</SelectItem>
                          <SelectItem value="space-2x4">Space Only 2x4 metres - 2-4 people (£1,176)</SelectItem>
                          <SelectItem value="space-3x3">Space Only 3x3 metres - 2-4 people (£1,323)</SelectItem>
                          <SelectItem value="space-3x4">Space Only 3x4 metres - 2-4 people (£1,764)</SelectItem>
                          <SelectItem value="table-2">Table for 2 people exactly (£882)</SelectItem>
                          <SelectItem value="table-4">Table for 4 people exactly (£1,764)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Space-only:</strong> Bring your own stand (2-4 staff). <strong>Tables:</strong> Fixed seating for exact number.
                        All prices include event access and basic amenities.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessDescription">Business Description</Label>
                    <Textarea
                      id="businessDescription"
                      value={exhibitorData.businessDescription}
                      onChange={(e) => handleExhibitorInputChange('businessDescription', e.target.value)}
                      placeholder="Briefly describe your business and what you do..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="productsServices">Products/Services to Showcase</Label>
                    <Textarea
                      id="productsServices"
                      value={exhibitorData.productsServices}
                      onChange={(e) => handleExhibitorInputChange('productsServices', e.target.value)}
                      placeholder="What will you be showcasing at the event?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exhibitionGoals">Exhibition Goals</Label>
                    <Textarea
                      id="exhibitionGoals"
                      value={exhibitorData.exhibitionGoals}
                      onChange={(e) => handleExhibitorInputChange('exhibitionGoals', e.target.value)}
                      placeholder="What do you hope to achieve from exhibiting at this event?"
                      rows={2}
                    />
                  </div>

                  {/* Attendee Management Section */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Attendee Details</h3>
                      <p className="text-sm text-gray-600">Limited to 2-4 people per space/table</p>
                    </div>
                    
                    {exhibitorData.attendees.map((attendee, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Attendee {index + 1}</h4>
                          {exhibitorData.attendees.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAttendee(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`attendee-name-${index}`}>Full Name *</Label>
                            <Input
                              id={`attendee-name-${index}`}
                              type="text"
                              value={attendee.name}
                              onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                              placeholder="Enter full name"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`attendee-email-${index}`}>Email Address *</Label>
                            <Input
                              id={`attendee-email-${index}`}
                              type="email"
                              value={attendee.email}
                              onChange={(e) => handleAttendeeChange(index, 'email', e.target.value)}
                              placeholder="Enter email address"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`attendee-title-${index}`}>Job Title</Label>
                            <Input
                              id={`attendee-title-${index}`}
                              type="text"
                              value={attendee.jobTitle}
                              onChange={(e) => handleAttendeeChange(index, 'jobTitle', e.target.value)}
                              placeholder="Enter job title"
                            />
                          </div>
                        </div>
                        
                        <ParticipantTypeSelector
                          value={attendee.participantType || "exhibitor"}
                          customRole={attendee.customRole || ""}
                          onValueChange={(type, customRole) => {
                            handleAttendeeChange(index, 'participantType', type);
                            handleAttendeeChange(index, 'customRole', customRole || '');
                          }}
                          label={`Role for ${attendee.name || `Attendee ${index + 1}`}`}
                        />
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`attendee-speaker-${index}`}
                            checked={attendee.isSpeaker}
                            onCheckedChange={(checked) => handleAttendeeChange(index, 'isSpeaker', !!checked)}
                          />
                          <Label htmlFor={`attendee-speaker-${index}`} className="text-sm font-medium">
                            This person will also be speaking/presenting
                          </Label>
                        </div>
                        
                        {attendee.isSpeaker && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                            <h5 className="font-medium text-blue-900">Speaker Information</h5>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <Label htmlFor={`speaker-bio-${index}`}>Speaker Bio</Label>
                                <Textarea
                                  id={`speaker-bio-${index}`}
                                  value={attendee.speakerBio}
                                  onChange={(e) => handleAttendeeChange(index, 'speakerBio', e.target.value)}
                                  placeholder="Brief professional bio for this speaker..."
                                  rows={2}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`presentation-title-${index}`}>Presentation/Workshop Title</Label>
                                <Input
                                  id={`presentation-title-${index}`}
                                  type="text"
                                  value={attendee.presentationTitle}
                                  onChange={(e) => handleAttendeeChange(index, 'presentationTitle', e.target.value)}
                                  placeholder="Title of your presentation or workshop"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor={`presentation-desc-${index}`}>Presentation Description</Label>
                                <Textarea
                                  id={`presentation-desc-${index}`}
                                  value={attendee.presentationDescription}
                                  onChange={(e) => handleAttendeeChange(index, 'presentationDescription', e.target.value)}
                                  placeholder="Describe what you'll be presenting..."
                                  rows={2}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {exhibitorData.attendees.length < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addAttendee}
                        className="w-full border-dashed"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Another Attendee
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="referralSource">How did you hear about this event?</Label>
                    <Select value={exhibitorData.referralSource} onValueChange={(value) => handleExhibitorInputChange('referralSource', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CBA Website">CBA Website</SelectItem>
                        <SelectItem value="Email Newsletter">Email Newsletter</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Word of Mouth">Word of Mouth</SelectItem>
                        <SelectItem value="Industry Publication">Industry Publication</SelectItem>
                        <SelectItem value="Partner Organization">Partner Organization</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="electricalNeeds"
                        checked={exhibitorData.electricalNeeds}
                        onCheckedChange={(checked) => handleExhibitorInputChange('electricalNeeds', !!checked)}
                      />
                      <Label htmlFor="electricalNeeds">I require electrical connection for my booth</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="internetNeeds"
                        checked={exhibitorData.internetNeeds}
                        onCheckedChange={(checked) => handleExhibitorInputChange('internetNeeds', !!checked)}
                      />
                      <Label htmlFor="internetNeeds">I require internet connection for my booth</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="previousExhibitor"
                        checked={exhibitorData.previousExhibitor}
                        onCheckedChange={(checked) => handleExhibitorInputChange('previousExhibitor', !!checked)}
                      />
                      <Label htmlFor="previousExhibitor">I have exhibited at CBA events before</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequirements">Special Requirements</Label>
                    <Textarea
                      id="specialRequirements"
                      value={exhibitorData.specialRequirements}
                      onChange={(e) => handleExhibitorInputChange('specialRequirements', e.target.value)}
                      placeholder="Any special setup requirements, accessibility needs, or other requests..."
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                    <Checkbox
                      id="agreesToTerms"
                      checked={exhibitorData.agreesToTerms}
                      onCheckedChange={(checked) => handleExhibitorInputChange('agreesToTerms', !!checked)}
                      required
                    />
                    <Label htmlFor="agreesToTerms" className="text-sm">
                      I agree to the exhibitor terms and conditions and understand that booth allocation is subject to availability *
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowExhibitorForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={exhibitorMutation.isPending || !exhibitorData.agreesToTerms}
                    >
                      {exhibitorMutation.isPending ? "Registering..." : "Submit Exhibitor Application"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Speaker Interest Form Modal */}
        {showSpeakerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Speaker Interest - AI Summit 2025</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSpeakerForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleSpeakerSubmission} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="speakerName">Full Name *</Label>
                        <Input
                          id="speakerName"
                          type="text"
                          required
                          value={speakerData.name}
                          onChange={(e) => handleSpeakerInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="speakerEmail">Email Address *</Label>
                        <Input
                          id="speakerEmail"
                          type="email"
                          required
                          value={speakerData.email}
                          onChange={(e) => handleSpeakerInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="speakerPhone">Phone Number *</Label>
                        <Input
                          id="speakerPhone"
                          type="tel"
                          required
                          value={speakerData.phone}
                          onChange={(e) => handleSpeakerInputChange('phone', e.target.value)}
                          placeholder="Your contact number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="speakerCompany">Company/Organization</Label>
                        <Input
                          id="speakerCompany"
                          type="text"
                          value={speakerData.company}
                          onChange={(e) => handleSpeakerInputChange('company', e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="speakerJobTitle">Job Title</Label>
                        <Input
                          id="speakerJobTitle"
                          type="text"
                          value={speakerData.jobTitle}
                          onChange={(e) => handleSpeakerInputChange('jobTitle', e.target.value)}
                          placeholder="Your role/position"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="speakerWebsite">Website (Optional)</Label>
                        <Input
                          id="speakerWebsite"
                          type="url"
                          value={speakerData.website}
                          onChange={(e) => handleSpeakerInputChange('website', e.target.value)}
                          placeholder="https://your-website.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="speakerLinkedIn">LinkedIn Profile (Optional)</Label>
                        <Input
                          id="speakerLinkedIn"
                          type="url"
                          value={speakerData.linkedIn}
                          onChange={(e) => handleSpeakerInputChange('linkedIn', e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="speakerBio">Bio/Background *</Label>
                      <Textarea
                        id="speakerBio"
                        required
                        value={speakerData.bio}
                        onChange={(e) => handleSpeakerInputChange('bio', e.target.value)}
                        placeholder="Brief background about yourself, your expertise, and why you're qualified to speak on AI topics (200-300 words)..."
                        rows={4}
                      />
                    </div>
                    
                    {/* Account Creation Fields */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4 mt-4">
                      <h4 className="font-semibold text-neutral-800">Create Your Speaker Account</h4>
                      <p className="text-sm text-gray-600">You'll need an account to manage your speaker profile and access event resources.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="speakerPassword">Password *</Label>
                          <Input
                            id="speakerPassword"
                            type="password"
                            required
                            value={speakerData.password || ''}
                            onChange={(e) => handleSpeakerInputChange('password', e.target.value)}
                            placeholder="Create a strong password"
                          />
                          <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
                        </div>
                        <div>
                          <Label htmlFor="speakerConfirmPassword">Confirm Password *</Label>
                          <Input
                            id="speakerConfirmPassword"
                            type="password"
                            required
                            value={speakerData.confirmPassword || ''}
                            onChange={(e) => handleSpeakerInputChange('confirmPassword', e.target.value)}
                            placeholder="Re-enter your password"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Talk Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Session Details</h3>
                    <div>
                      <Label htmlFor="sessionType">Session Type *</Label>
                      <Select 
                        value={speakerData.sessionType || "talk"} 
                        onValueChange={(value) => handleSpeakerInputChange('sessionType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select session type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="talk">
                            <div className="flex flex-col">
                              <span className="font-medium">Speaking/Presentation</span>
                              <span className="text-xs text-gray-500">Share knowledge, insights, or case studies</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="workshop">
                            <div className="flex flex-col">
                              <span className="font-medium">Workshop/Hands-on Session</span>
                              <span className="text-xs text-gray-500">Interactive session with practical activities</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="talkTitle">
                        {speakerData.sessionType === 'workshop' ? 'Workshop Title *' : 'Talk Title *'}
                      </Label>
                      <Input
                        id="talkTitle"
                        type="text"
                        required
                        value={speakerData.talkTitle}
                        onChange={(e) => handleSpeakerInputChange('talkTitle', e.target.value)}
                        placeholder={speakerData.sessionType === 'workshop' ? 
                          "Enter your workshop title (e.g., 'Building Your First AI Chatbot')" : 
                          "Enter your talk title (e.g., 'AI Tools for Small Business Growth')"
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="talkDescription">
                        {speakerData.sessionType === 'workshop' ? 'Workshop Description *' : 'Talk Description *'}
                      </Label>
                      <Textarea
                        id="talkDescription"
                        required
                        value={speakerData.talkDescription}
                        onChange={(e) => handleSpeakerInputChange('talkDescription', e.target.value)}
                        placeholder={speakerData.sessionType === 'workshop' ? 
                          "Detailed description of your workshop: What will participants do? What tools/skills will they practice? What will they build or create? (300-500 words)..." :
                          "Detailed description of your talk content, key points you'll cover, and learning outcomes for attendees (300-500 words)..."
                        }
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="talkDuration">Preferred Duration</Label>
                        <Select value={speakerData.talkDuration} onValueChange={(value) => handleSpeakerInputChange('talkDuration', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {speakerData.sessionType === 'workshop' ? (
                              <>
                                <SelectItem value="15">15 minutes (short workshop)</SelectItem>
                                <SelectItem value="45">45 minutes (full workshop)</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="15">15 minutes (standard talk)</SelectItem>
                                <SelectItem value="45">45 minutes (extended talk)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          {speakerData.sessionType === 'workshop' ? 
                            "Workshops need more time for hands-on activities" : 
                            "Remember: 5min room entry + content + 5min Q&A + 5min exit"
                          }
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="audienceLevel">Target Audience Level</Label>
                        <Select value={speakerData.audienceLevel} onValueChange={(value) => handleSpeakerInputChange('audienceLevel', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner">Beginner (No AI experience)</SelectItem>
                            <SelectItem value="Intermediate">Intermediate (Some AI knowledge)</SelectItem>
                            <SelectItem value="Advanced">Advanced (AI practitioners)</SelectItem>
                            <SelectItem value="Mixed">Mixed (All levels)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="keyTakeaways">Key Takeaways *</Label>
                      <Textarea
                        id="keyTakeaways"
                        required
                        value={speakerData.keyTakeaways}
                        onChange={(e) => handleSpeakerInputChange('keyTakeaways', e.target.value)}
                        placeholder="List 3-5 key takeaways attendees will gain from your talk..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Speaking Experience */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Speaking Experience</h3>
                    <div>
                      <Label htmlFor="speakingExperience">Previous Speaking Experience</Label>
                      <Textarea
                        id="speakingExperience"
                        value={speakerData.speakingExperience}
                        onChange={(e) => handleSpeakerInputChange('speakingExperience', e.target.value)}
                        placeholder="Describe your previous speaking experience, events you've spoken at, topics covered, etc. (If this is your first time, please mention that)..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="previousSpeaking"
                        checked={speakerData.previousSpeaking}
                        onCheckedChange={(checked) => handleSpeakerInputChange('previousSpeaking', !!checked)}
                      />
                      <Label htmlFor="previousSpeaking">I have spoken at professional events before</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="interactiveElements"
                        checked={speakerData.interactiveElements}
                        onCheckedChange={(checked) => handleSpeakerInputChange('interactiveElements', !!checked)}
                      />
                      <Label htmlFor="interactiveElements">My talk will include interactive elements (Q&A, demos, activities)</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="handoutsProvided"
                        checked={speakerData.handoutsProvided}
                        onCheckedChange={(checked) => handleSpeakerInputChange('handoutsProvided', !!checked)}
                      />
                      <Label htmlFor="handoutsProvided">I will provide handouts or resources for attendees</Label>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Additional Information</h3>
                    <div>
                      <Label htmlFor="motivationToSpeak">Why do you want to speak at the AI Summit?</Label>
                      <Textarea
                        id="motivationToSpeak"
                        value={speakerData.motivationToSpeak}
                        onChange={(e) => handleSpeakerInputChange('motivationToSpeak', e.target.value)}
                        placeholder="Tell us about your motivation and how your talk will benefit the Croydon business community..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="techRequirements">Technical Requirements</Label>
                      <Textarea
                        id="techRequirements"
                        value={speakerData.techRequirements}
                        onChange={(e) => handleSpeakerInputChange('techRequirements', e.target.value)}
                        placeholder="Any specific technical requirements for your presentation (projector, microphone, internet, specific software, etc.)..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
                    <Checkbox
                      id="speakerAgreesToTerms"
                      checked={speakerData.agreesToTerms}
                      onCheckedChange={(checked) => handleSpeakerInputChange('agreesToTerms', !!checked)}
                      required
                    />
                    <Label htmlFor="speakerAgreesToTerms" className="text-sm">
                      I agree to the speaker terms and conditions and understand that speaker selection is subject to program committee review *
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowSpeakerForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      disabled={speakerMutation.isPending || !speakerData.agreesToTerms}
                    >
                      {speakerMutation.isPending ? "Submitting..." : "Submit Speaker Interest"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Registration Form Modal */}
        {showVolunteerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Volunteer Registration - AI Summit 2025</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowVolunteerForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleVolunteerRegistration} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="volunteerName">Full Name *</Label>
                        <Input
                          id="volunteerName"
                          type="text"
                          required
                          value={volunteerData.name}
                          onChange={(e) => handleVolunteerInputChange('name', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="volunteerEmail">Email Address *</Label>
                        <Input
                          id="volunteerEmail"
                          type="email"
                          required
                          value={volunteerData.email}
                          onChange={(e) => handleVolunteerInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="volunteerPhone">Phone Number *</Label>
                        <Input
                          id="volunteerPhone"
                          type="tel"
                          required
                          value={volunteerData.phone}
                          onChange={(e) => handleVolunteerInputChange('phone', e.target.value)}
                          placeholder="Your contact number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact *</Label>
                        <Input
                          id="emergencyContact"
                          type="text"
                          required
                          value={volunteerData.emergencyContact}
                          onChange={(e) => handleVolunteerInputChange('emergencyContact', e.target.value)}
                          placeholder="Name and phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Volunteer Role & Availability */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Volunteer Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="volunteerRole">Preferred Role *</Label>
                        <select
                          id="volunteerRole"
                          required
                          value={volunteerData.role}
                          onChange={(e) => handleVolunteerInputChange('role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a role</option>
                          <option value="registration">Registration & Check-in</option>
                          <option value="usher">Event Usher</option>
                          <option value="technical">Technical Support</option>
                          <option value="catering">Catering Support</option>
                          <option value="speaker-assistant">Speaker Assistant</option>
                          <option value="general">General Support</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="volunteerShift">Preferred Shift *</Label>
                        <select
                          id="volunteerShift"
                          required
                          value={volunteerData.shift}
                          onChange={(e) => handleVolunteerInputChange('shift', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a shift</option>
                          <option value="full-day">Full Day (9:00 AM - 5:00 PM)</option>
                          <option value="morning">Morning (9:00 AM - 1:00 PM)</option>
                          <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                          <option value="setup">Setup (8:00 AM - 10:00 AM)</option>
                          <option value="cleanup">Cleanup (4:00 PM - 6:00 PM)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="volunteerExperience">Previous Volunteer Experience</Label>
                      <Textarea
                        id="volunteerExperience"
                        value={volunteerData.experience}
                        onChange={(e) => handleVolunteerInputChange('experience', e.target.value)}
                        placeholder="Tell us about any previous volunteer or event experience..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="volunteerAvailability">Additional Availability Notes</Label>
                      <Textarea
                        id="volunteerAvailability"
                        value={volunteerData.availability}
                        onChange={(e) => handleVolunteerInputChange('availability', e.target.value)}
                        placeholder="Any specific availability constraints or preferences..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Practical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Practical Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tShirtSize">T-Shirt Size *</Label>
                        <select
                          id="tShirtSize"
                          required
                          value={volunteerData.tShirtSize}
                          onChange={(e) => handleVolunteerInputChange('tShirtSize', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select size</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="dietaryRequirements">Dietary Requirements</Label>
                        <Input
                          id="dietaryRequirements"
                          type="text"
                          value={volunteerData.dietaryRequirements}
                          onChange={(e) => handleVolunteerInputChange('dietaryRequirements', e.target.value)}
                          placeholder="Any dietary restrictions or allergies"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                    <Checkbox
                      id="volunteerAgreesToTerms"
                      checked={volunteerData.agreesToTerms}
                      onCheckedChange={(checked) => handleVolunteerInputChange('agreesToTerms', !!checked)}
                      required
                    />
                    <Label htmlFor="volunteerAgreesToTerms" className="text-sm">
                      I agree to volunteer at the AI Summit 2025 and understand the commitment involved. I will receive a confirmation email with further details. *
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowVolunteerForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={volunteerMutation.isPending || !volunteerData.agreesToTerms}
                    >
                      {volunteerMutation.isPending ? "Submitting..." : "Register as Volunteer"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Volunteer Registration Form Modal */}
        {showVolunteerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Volunteer Registration - AI Summit 2025</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowVolunteerForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleVolunteerRegistration} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="volunteerName">Full Name *</Label>
                        <Input
                          id="volunteerName"
                          type="text"
                          required
                          value={volunteerData.name}
                          onChange={(e) => handleVolunteerInputChange('name', e.target.value)}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="volunteerEmail">Email Address *</Label>
                        <Input
                          id="volunteerEmail"
                          type="email"
                          required
                          value={volunteerData.email}
                          onChange={(e) => handleVolunteerInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="volunteerPhone">Phone Number *</Label>
                      <Input
                        id="volunteerPhone"
                        type="tel"
                        required
                        value={volunteerData.phone}
                        onChange={(e) => handleVolunteerInputChange('phone', e.target.value)}
                        placeholder="Your contact number"
                      />
                    </div>
                  </div>

                  {/* Volunteer Preferences */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Volunteer Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="volunteerRole">Preferred Role</Label>
                        <select
                          id="volunteerRole"
                          value={volunteerData.role}
                          onChange={(e) => handleVolunteerInputChange('role', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a role...</option>
                          <option value="registration">Registration & Check-in</option>
                          <option value="tech-support">Technical Support</option>
                          <option value="speaker-assistance">Speaker Assistance</option>
                          <option value="general-support">General Event Support</option>
                          <option value="networking">Networking Facilitation</option>
                          <option value="photography">Photography/Social Media</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="volunteerShift">Preferred Shift</Label>
                        <select
                          id="volunteerShift"
                          value={volunteerData.shift}
                          onChange={(e) => handleVolunteerInputChange('shift', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select a shift...</option>
                          <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                          <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                          <option value="full-day">Full Day (8:00 AM - 4:00 PM)</option>
                          <option value="setup">Setup Only (8:00 AM - 10:00 AM)</option>
                          <option value="cleanup">Cleanup Only (4:00 PM - 6:00 PM)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="volunteerExperience">Previous Volunteer Experience</Label>
                      <Textarea
                        id="volunteerExperience"
                        value={volunteerData.experience}
                        onChange={(e) => handleVolunteerInputChange('experience', e.target.value)}
                        placeholder="Tell us about any previous volunteer experience at events or relevant skills..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tShirtSize">T-Shirt Size</Label>
                        <select
                          id="tShirtSize"
                          value={volunteerData.tShirtSize}
                          onChange={(e) => handleVolunteerInputChange('tShirtSize', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select size...</option>
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          id="emergencyContact"
                          type="text"
                          value={volunteerData.emergencyContact}
                          onChange={(e) => handleVolunteerInputChange('emergencyContact', e.target.value)}
                          placeholder="Name and phone number"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="volunteerAvailability">Availability & Special Notes</Label>
                      <Textarea
                        id="volunteerAvailability"
                        value={volunteerData.availability}
                        onChange={(e) => handleVolunteerInputChange('availability', e.target.value)}
                        placeholder="Any specific availability constraints or special notes..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dietaryRequirements">Dietary Requirements (for volunteer lunch)</Label>
                      <Input
                        id="dietaryRequirements"
                        type="text"
                        value={volunteerData.dietaryRequirements}
                        onChange={(e) => handleVolunteerInputChange('dietaryRequirements', e.target.value)}
                        placeholder="Any dietary restrictions or preferences"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                    <Checkbox
                      id="volunteerAgreesToTerms"
                      checked={volunteerData.agreesToTerms}
                      onCheckedChange={(checked) => handleVolunteerInputChange('agreesToTerms', !!checked)}
                      required
                    />
                    <Label htmlFor="volunteerAgreesToTerms" className="text-sm">
                      I agree to volunteer at the AI Summit 2025 and understand the responsibilities and commitment required *
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowVolunteerForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={volunteerMutation.isPending || !volunteerData.agreesToTerms}
                    >
                      {volunteerMutation.isPending ? "Submitting..." : "Register as Volunteer"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Sponsor Registration Form Modal */}
        {showSponsorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neutral-900">Sponsor Registration - AI Summit 2025</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSponsorForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleSponsorRegistration} className="space-y-4">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sponsorCompanyName">Company Name *</Label>
                        <Input
                          id="sponsorCompanyName"
                          type="text"
                          required
                          value={sponsorData.companyName}
                          onChange={(e) => handleSponsorInputChange('companyName', e.target.value)}
                          placeholder="Your company name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsorContactName">Contact Person *</Label>
                        <Input
                          id="sponsorContactName"
                          type="text"
                          required
                          value={sponsorData.contactName}
                          onChange={(e) => handleSponsorInputChange('contactName', e.target.value)}
                          placeholder="Full name of main contact"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sponsorEmail">Email Address *</Label>
                        <Input
                          id="sponsorEmail"
                          type="email"
                          required
                          value={sponsorData.contactEmail}
                          onChange={(e) => handleSponsorInputChange('contactEmail', e.target.value)}
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsorPhone">Phone Number *</Label>
                        <Input
                          id="sponsorPhone"
                          type="tel"
                          required
                          value={sponsorData.contactPhone}
                          onChange={(e) => handleSponsorInputChange('contactPhone', e.target.value)}
                          placeholder="Your contact number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Creation */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Create Your Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sponsorPassword">Password *</Label>
                        <Input
                          id="sponsorPassword"
                          type="password"
                          required
                          value={sponsorData.password}
                          onChange={(e) => handleSponsorInputChange('password', e.target.value)}
                          placeholder="At least 8 characters"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sponsorConfirmPassword">Confirm Password *</Label>
                        <Input
                          id="sponsorConfirmPassword"
                          type="password"
                          required
                          value={sponsorData.confirmPassword}
                          onChange={(e) => handleSponsorInputChange('confirmPassword', e.target.value)}
                          placeholder="Re-enter your password"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      You'll use your email and password to log in to your sponsor account after registration.
                    </p>
                  </div>

                  {/* Sponsorship Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Sponsorship Details</h3>
                    <div>
                      <Label htmlFor="sponsorWebsite">Company Website</Label>
                      <Input
                        id="sponsorWebsite"
                        type="url"
                        value={sponsorData.companyWebsite}
                        onChange={(e) => handleSponsorInputChange('companyWebsite', e.target.value)}
                        placeholder="https://www.yourcompany.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sponsorPackage">Preferred Sponsorship Package *</Label>
                      <select
                        id="sponsorPackage"
                        required
                        value={sponsorData.packageName}
                        onChange={(e) => handleSponsorInputChange('packageName', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select a package...</option>
                        <option value="Platinum">Platinum Sponsor (£5,000)</option>
                        <option value="Gold">Gold Sponsor (£2,500)</option>
                        <option value="Silver">Silver Sponsor (£1,000)</option>
                        <option value="Bronze">Bronze Sponsor (£500)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sponsorDescription">Company Description</Label>
                      <Textarea
                        id="sponsorDescription"
                        value={sponsorData.companyDescription}
                        onChange={(e) => handleSponsorInputChange('companyDescription', e.target.value)}
                        placeholder="Tell us about your company and what you do..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sponsorRequests">Special Requests or Questions</Label>
                      <Textarea
                        id="sponsorRequests"
                        value={sponsorData.specialRequests}
                        onChange={(e) => handleSponsorInputChange('specialRequests', e.target.value)}
                        placeholder="Any specific requirements or questions about sponsorship..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-purple-50 rounded-lg">
                    <Checkbox
                      id="sponsorAgreesToTerms"
                      checked={sponsorData.agreesToTerms}
                      onCheckedChange={(checked) => handleSponsorInputChange('agreesToTerms', !!checked)}
                      required
                    />
                    <Label htmlFor="sponsorAgreesToTerms" className="text-sm">
                      I agree to the sponsorship terms and conditions and understand the commitments involved *
                    </Label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowSponsorForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      disabled={sponsorMutation.isPending || !sponsorData.agreesToTerms}
                    >
                      {sponsorMutation.isPending ? "Creating Account..." : "Register as Sponsor"}
                    </Button>
                  </div>
                </form>
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