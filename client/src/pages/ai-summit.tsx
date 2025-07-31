import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
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
  Coffee
} from "lucide-react";
import { Link } from "wouter";

const AISummit = () => {
  const [selectedSession, setSelectedSession] = useState("");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showExhibitorForm, setShowExhibitorForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: "",
    email: "",
    company: "",
    jobTitle: "",
    phoneNumber: "",
    businessType: "",
    aiInterest: "",
    accessibilityNeeds: "",
    comments: ""
  });
  const [exhibitorData, setExhibitorData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    businessDescription: "",
    productsServices: "",
    exhibitionGoals: "",
    boothRequirements: "Standard",
    electricalNeeds: false,
    internetNeeds: false,
    specialRequirements: "",
    marketingMaterials: "",
    numberOfAttendees: 2,
    previousExhibitor: false,
    referralSource: "",
    agreesToTerms: false
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
    talkTitle: "",
    talkDescription: "",
    talkDuration: "30",
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

  const schedule = [
    {
      time: "9:30 - 10:00",
      title: "Registration & Welcome Coffee",
      type: "registration",
      speaker: "CBA Team",
      description: "Network with fellow attendees and collect your summit materials"
    },
    {
      time: "10:00 - 10:30",
      title: "Opening Keynote: AI Revolution in Croydon",
      type: "keynote",
      speaker: "Jose Martinez, CBA Founder",
      description: "How Croydon is becoming the AI capital of South London"
    },
    {
      time: "10:30 - 11:15",
      title: "The Future of AI in Small Business",
      type: "talk",
      speaker: "Dr. Sarah Chen",
      description: "Practical AI applications that every small business can implement"
    },
    {
      time: "11:15 - 11:30",
      title: "Coffee Break & Networking",
      type: "break",
      speaker: "",
      description: "Connect with other entrepreneurs and AI enthusiasts"
    },
    {
      time: "11:30 - 12:15",
      title: "Workshop: AI Tools for Content Creation",
      type: "workshop",
      speaker: "LSBU Students & Volunteers",
      description: "Hands-on session with ChatGPT, Midjourney, and business AI tools"
    },
    {
      time: "12:15 - 13:00",
      title: "Implementing AI on a Budget",
      type: "talk",
      speaker: "Marcus Johnson",
      description: "Real-world case studies of affordable AI implementation"
    },
    {
      time: "13:00 - 14:00",
      title: "Lunch & Micro Business Exhibition",
      type: "exhibition",
      speaker: "",
      description: "Explore AI startups and connect with innovative businesses"
    },
    {
      time: "14:00 - 14:45",
      title: "Workshop: AI for Customer Service",
      type: "workshop",
      speaker: "CBA AI Experts",
      description: "Build your first chatbot and automate customer interactions"
    },
    {
      time: "14:45 - 15:30",
      title: "Responsible AI for Business",
      type: "talk",
      speaker: "Dr. Priya Patel",
      description: "Ethics, compliance, and best practices for AI adoption"
    },
    {
      time: "15:30 - 16:00",
      title: "Panel Discussion & Closing",
      type: "panel",
      speaker: "All Speakers + CBA Team",
      description: "Q&A session and next steps for AI adoption in Croydon"
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
        company: "",
        jobTitle: "",
        phoneNumber: "",
        businessType: "",
        aiInterest: "",
        accessibilityNeeds: "",
        comments: ""
      });
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
        boothRequirements: "Standard",
        electricalNeeds: false,
        internetNeeds: false,
        specialRequirements: "",
        marketingMaterials: "",
        numberOfAttendees: 2,
        previousExhibitor: false,
        referralSource: "",
        agreesToTerms: false
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
        title: "Speaker Interest Submitted!",
        description: "Thank you for your interest in speaking. Our program committee will review your submission and contact you soon.",
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
        talkTitle: "",
        talkDescription: "",
        talkDuration: "30",
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
    exhibitorMutation.mutate(exhibitorData);
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

  const handleSpeakerInputChange = (field: string, value: string | boolean | string[]) => {
    setSpeakerData(prev => ({
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
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4"
                    onClick={() => setShowRegistrationForm(true)}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register FREE - Limited Places
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-6 py-4"
                    onClick={() => setShowExhibitorForm(true)}
                  >
                    <Building className="mr-2 h-5 w-5" />
                    Exhibit Your Business
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-6 py-4"
                    onClick={() => setShowSpeakerForm(true)}
                  >
                    <Mic className="mr-2 h-5 w-5" />
                    Speak at Summit
                  </Button>
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
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowRegistrationForm(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register Now
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
                <p className="text-lg text-neutral-600">Full day program from 10 AM to 4 PM</p>
              </div>

              <div className="space-y-4">
                {schedule.map((session, index) => (
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                    <div className="space-y-2 text-sm text-green-700">
                      <div>• Free exhibition space for CBA members</div>
                      <div>• Direct access to potential customers</div>
                      <div>• Networking with investors and partners</div>
                      <div>• Exposure to local media and influencers</div>
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
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  onClick={() => setShowRegistrationForm(true)}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  <span>Register for FREE</span>
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
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 font-semibold"
                  onClick={() => setShowSpeakerForm(true)}
                >
                  <Mic className="mr-2 h-5 w-5" />
                  <span>Speak at Summit</span>
                </Button>
                <Link to="/membership-benefits">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
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
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
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
                      <Label htmlFor="exhibitorPhone">Phone Number</Label>
                      <Input
                        id="exhibitorPhone"
                        type="tel"
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

                    <div>
                      <Label htmlFor="boothRequirements">Booth Requirements</Label>
                      <Select value={exhibitorData.boothRequirements} onValueChange={(value) => handleExhibitorInputChange('boothRequirements', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select booth type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard Booth (3x3m)</SelectItem>
                          <SelectItem value="Premium">Premium Booth (3x6m)</SelectItem>
                          <SelectItem value="Custom">Custom Requirements</SelectItem>
                        </SelectContent>
                      </Select>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="numberOfAttendees">Number of Staff Attending</Label>
                      <Input
                        id="numberOfAttendees"
                        type="number"
                        min="1"
                        max="10"
                        value={exhibitorData.numberOfAttendees}
                        onChange={(e) => handleExhibitorInputChange('numberOfAttendees', parseInt(e.target.value) || 2)}
                      />
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
                        <Label htmlFor="speakerPhone">Phone Number</Label>
                        <Input
                          id="speakerPhone"
                          type="tel"
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
                  </div>

                  {/* Talk Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neutral-800">Proposed Talk Details</h3>
                    <div>
                      <Label htmlFor="talkTitle">Talk Title *</Label>
                      <Input
                        id="talkTitle"
                        type="text"
                        required
                        value={speakerData.talkTitle}
                        onChange={(e) => handleSpeakerInputChange('talkTitle', e.target.value)}
                        placeholder="Enter your proposed talk title"
                      />
                    </div>

                    <div>
                      <Label htmlFor="talkDescription">Talk Description *</Label>
                      <Textarea
                        id="talkDescription"
                        required
                        value={speakerData.talkDescription}
                        onChange={(e) => handleSpeakerInputChange('talkDescription', e.target.value)}
                        placeholder="Detailed description of your talk content, key points you'll cover, and learning outcomes for attendees (300-500 words)..."
                        rows={5}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="talkDuration">Preferred Duration</Label>
                        <Select value={speakerData.talkDuration} onValueChange={(value) => handleSpeakerInputChange('talkDuration', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select talk duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
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
      </div>
    </>
  );
};

export default AISummit;