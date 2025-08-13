import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { 
  ExternalLink, 
  MapPin, 
  Users, 
  Award, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Building,
  Star,
  Sparkles
} from "lucide-react";

interface Sponsor {
  id: number;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  logo_url: string;
  package_name: string;
  package_price: number;
  status: string;
  notes: string;
  created_at: string;
}

interface SponsorProfile {
  companyName: string;
  description: string;
  industry: string;
  founded: number;
  employees: string;
  location: string;
  specialties: string[];
  achievements: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

// Extended sponsor profiles with detailed information
const sponsorProfiles: Record<string, SponsorProfile> = {
  "TechCorp Solutions": {
    companyName: "TechCorp Solutions",
    description: "Leading AI technology company specializing in enterprise automation and machine learning solutions. We help businesses transform their operations through cutting-edge artificial intelligence.",
    industry: "Technology & AI",
    founded: 2015,
    employees: "500-1000",
    location: "London, UK",
    specialties: ["AI Development", "Machine Learning", "Automation", "Data Analytics", "Cloud Computing"],
    achievements: [
      "Winner of AI Innovation Award 2024",
      "Recognized as Top AI Company by Tech Weekly",
      "Served over 1,000 enterprise clients",
      "£50M in funding raised"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/techcorp-solutions",
      twitter: "https://twitter.com/techcorp_ai"
    }
  },
  "Digital Dynamics": {
    companyName: "Digital Dynamics",
    description: "Premium digital transformation consultancy helping businesses leverage AI and automation to drive growth and efficiency.",
    industry: "Consulting & Digital Services",
    founded: 2018,
    employees: "100-200",
    location: "Manchester, UK",
    specialties: ["Digital Transformation", "AI Consulting", "Process Optimization", "Business Intelligence"],
    achievements: [
      "Digital Excellence Award 2023",
      "Top 50 Consulting Firms UK",
      "98% client satisfaction rate",
      "200+ successful transformations"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/digital-dynamics-uk"
    }
  },
  "Innovation Labs": {
    companyName: "Innovation Labs",
    description: "Research and development company focused on breakthrough AI technologies and their practical applications in business.",
    industry: "Research & Development",
    founded: 2020,
    employees: "50-100",
    location: "Cambridge, UK",
    specialties: ["AI Research", "Innovation", "Prototyping", "Technology Transfer"],
    achievements: [
      "15 patents in AI technology",
      "University of Cambridge partnership",
      "£10M research grants secured",
      "Featured in Nature AI journal"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/innovation-labs-cambridge",
      twitter: "https://twitter.com/innovlabs_uk"
    }
  },
  "MyT Ai": {
    companyName: "MyT Ai",
    description: "Leading AI solutions provider specializing in business automation and intelligent systems for SMEs. CBA Board Member committed to democratizing AI for local businesses.",
    industry: "Artificial Intelligence",
    founded: 2019,
    employees: "25-50",
    location: "Croydon, UK",
    specialties: ["AI Implementation", "Business Automation", "Chatbot Development", "Machine Learning", "SME Solutions"],
    achievements: [
      "CBA Board Member",
      "500+ SMEs automated",
      "Local Business AI Pioneer Award",
      "95% customer retention rate"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/myt-ai",
      twitter: "https://twitter.com/myt_ai"
    }
  },
  "MyT Automation": {
    companyName: "MyT Automation",
    description: "Process automation experts helping businesses streamline operations and increase efficiency. Proud CBA Board Member driving digital transformation in Croydon.",
    industry: "Business Automation",
    founded: 2020,
    employees: "20-40",
    location: "Croydon, UK",
    specialties: ["Process Automation", "Workflow Optimization", "RPA", "Digital Transformation", "Efficiency Consulting"],
    achievements: [
      "CBA Board Member",
      "200+ processes automated",
      "40% average efficiency gain for clients",
      "Automation Excellence Award 2024"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/myt-automation"
    }
  },
  "The Process Guru": {
    companyName: "The Process Guru",
    description: "Business process optimization consultancy transforming operations for sustainable growth. CBA Board Member passionate about helping local businesses thrive.",
    industry: "Business Consulting",
    founded: 2017,
    employees: "15-30",
    location: "Croydon, UK",
    specialties: ["Process Optimization", "Lean Six Sigma", "Operations Excellence", "Change Management", "Strategic Planning"],
    achievements: [
      "CBA Board Member",
      "300+ businesses transformed",
      "ISO 9001 certified",
      "Best Consulting Firm - Croydon 2023"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/theprocessguru"
    }
  },
  "Freshfield Markets": {
    companyName: "Freshfield Markets",
    description: "Premium fresh produce and gourmet food marketplace serving Croydon and surrounding areas. CBA Board Member supporting local food businesses.",
    industry: "Food & Retail",
    founded: 2015,
    employees: "50-100",
    location: "Croydon, UK",
    specialties: ["Fresh Produce", "Local Sourcing", "Gourmet Foods", "Sustainable Retail", "Community Markets"],
    achievements: [
      "CBA Board Member",
      "100+ local suppliers supported",
      "Sustainable Retailer of the Year",
      "Community Champion Award 2024"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/freshfield-markets"
    }
  },
  "Joseph's Fruit and Veg Store": {
    companyName: "Joseph's Fruit and Veg Store",
    description: "Family-run fresh produce store in Surrey Street Market, serving Croydon for over 30 years. CBA Board Member representing traditional market traders.",
    industry: "Retail - Fresh Produce",
    founded: 1992,
    employees: "5-10",
    location: "Surrey Street Market, Croydon",
    specialties: ["Fresh Fruits", "Vegetables", "Exotic Produce", "Local Sourcing", "Personal Service"],
    achievements: [
      "CBA Board Member",
      "30+ years in business",
      "Surrey Street Market Institution",
      "Best Fresh Produce - Croydon 2023"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/josephs-fruit-veg"
    }
  },
  "Sauba and Daughters Accountancy": {
    companyName: "Sauba and Daughters Accountancy",
    description: "Chartered accountants providing comprehensive financial services and business advisory. CBA Board Member dedicated to supporting local business growth.",
    industry: "Accounting & Finance",
    founded: 2008,
    employees: "15-25",
    location: "Croydon, UK",
    specialties: ["Tax Planning", "Business Advisory", "Audit Services", "Financial Planning", "SME Accounting"],
    achievements: [
      "CBA Board Member",
      "ACCA Chartered Certified",
      "400+ businesses supported",
      "Excellence in Client Service Award"
    ],
    socialMedia: {
      linkedin: "https://linkedin.com/company/sauba-daughters"
    }
  },
  "Wagner Caleap Consultancy": {
    companyName: "Wagner Caleap Consultancy",
    description: "Strategic business consultancy specializing in growth strategies and organizational transformation. CBA Board Member championing business excellence.",
    industry: "Management Consulting",
    founded: 2016,
    employees: "10-20",
    location: "Croydon, UK",
    specialties: ["Growth Strategy", "Organizational Development", "Leadership Coaching", "Market Analysis", "Business Transformation"],
    achievements: [
      "CBA Board Member",
      "150+ successful transformations",
      "Management Consultancy of the Year",
      "5x average ROI for clients"
    ],
    website: "https://wagnercaleap.com",
    socialMedia: {
      linkedin: "https://linkedin.com/company/wagner-caleap"
    }
  }
};

const packageStyles = {
  "Board Member": { color: "bg-gradient-to-r from-purple-500 to-indigo-700 text-white", icon: "🏛️" },
  "Platinum": { color: "bg-gradient-to-r from-gray-300 to-gray-500 text-white", icon: "👑" },
  "Gold": { color: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white", icon: "🥇" },
  "Silver": { color: "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800", icon: "🥈" },
  "Bronze": { color: "bg-gradient-to-r from-orange-400 to-orange-600 text-white", icon: "🥉" },
  "Supporting": { color: "bg-gradient-to-r from-blue-400 to-blue-600 text-white", icon: "🤝" },
  "Community": { color: "bg-gradient-to-r from-green-400 to-green-600 text-white", icon: "🌟" },
  "Individual": { color: "bg-gradient-to-r from-purple-400 to-purple-600 text-white", icon: "⭐" }
};

export function SponsorSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  
  const { data: sponsors, isLoading } = useQuery({
    queryKey: ['/api/event-sponsors'],
    queryFn: async () => {
      const response = await fetch('/api/event-sponsors');
      if (!response.ok) throw new Error('Failed to fetch sponsors');
      return response.json();
    }
  });

  // Auto-rotate sponsors every 8 seconds
  useEffect(() => {
    if (!sponsors || sponsors.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [sponsors]);

  const nextSponsor = () => {
    if (sponsors && sponsors.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }
  };

  const previousSponsor = () => {
    if (sponsors && sponsors.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + sponsors.length) % sponsors.length);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-64"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!sponsors || sponsors.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          Sponsor Spotlight
        </h2>
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No sponsors to showcase at this time.</p>
            <p className="text-sm mt-2">
              Interested in sponsoring? <a href="/ai-summit" className="text-blue-600 hover:underline">Learn more</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentSponsor = sponsors[currentIndex];
  const profile = sponsorProfiles[currentSponsor?.company_name];
  const packageStyle = packageStyles[currentSponsor?.package_name as keyof typeof packageStyles] || packageStyles["Community"];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Sparkles className="h-6 w-6 text-yellow-500" />
        Sponsor Spotlight
      </h2>
      
      <Card className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-lg">
        <CardHeader className="relative">
          <div className="absolute top-4 right-4 z-10">
            <Badge className={`${packageStyle.color} px-3 py-1 text-sm font-semibold`}>
              {packageStyle.icon} {currentSponsor.package_name} Sponsor
            </Badge>
          </div>
          
          {/* Navigation */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={previousSponsor}
              className="bg-white/80 hover:bg-white shadow-md"
              disabled={sponsors.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={nextSponsor}
              className="bg-white/80 hover:bg-white shadow-md"
              disabled={sponsors.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-gray-100">
              {currentSponsor.logo_url ? (
                <img
                  src={currentSponsor.logo_url}
                  alt={`${currentSponsor.company_name} logo`}
                  className="w-16 h-16 object-contain"
                />
              ) : (
                <Building className="h-12 w-12 text-gray-400" />
              )}
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
            {currentSponsor.company_name}
          </h3>
          
          {profile && (
            <p className="text-center text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {profile.description}
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {profile && (
            <>
              {/* Company Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-xs text-gray-600">Founded</p>
                  <p className="font-semibold text-gray-900">{profile.founded}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-gray-600">Employees</p>
                  <p className="font-semibold text-gray-900">{profile.employees}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <MapPin className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-xs text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{profile.location}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Award className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                  <p className="text-xs text-gray-600">Industry</p>
                  <p className="font-semibold text-gray-900 text-xs">{profile.industry}</p>
                </div>
              </div>
              
              {/* Specialties */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Specialties
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Contact Information */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {currentSponsor.website && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(currentSponsor.website, '_blank')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
              </Button>
            )}
            
            {currentSponsor.email && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`mailto:${currentSponsor.email}`, '_blank')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
            )}
            
            {profile && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Building className="h-4 w-4 mr-2" />
                    Full Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {currentSponsor.logo_url ? (
                          <img
                            src={currentSponsor.logo_url}
                            alt={`${currentSponsor.company_name} logo`}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <Building className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      {currentSponsor.company_name}
                      <Badge className={`${packageStyle.color} ml-auto`}>
                        {packageStyle.icon} {currentSponsor.package_name}
                      </Badge>
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                      <p className="text-gray-600 leading-relaxed">{profile.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Company Details</h4>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Industry:</span> {profile.industry}</p>
                          <p><span className="text-gray-600">Founded:</span> {profile.founded}</p>
                          <p><span className="text-gray-600">Employees:</span> {profile.employees}</p>
                          <p><span className="text-gray-600">Location:</span> {profile.location}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                        <div className="space-y-2 text-sm">
                          {currentSponsor.contact_name && (
                            <p><span className="text-gray-600">Contact:</span> {currentSponsor.contact_name}</p>
                          )}
                          {currentSponsor.email && (
                            <p><span className="text-gray-600">Email:</span> {currentSponsor.email}</p>
                          )}
                          {currentSponsor.phone && (
                            <p><span className="text-gray-600">Phone:</span> {currentSponsor.phone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Achievements</h4>
                      <ul className="space-y-2">
                        {profile.achievements.map((achievement, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {(profile.socialMedia.linkedin || profile.socialMedia.twitter || profile.socialMedia.facebook) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Social Media</h4>
                        <div className="flex gap-2">
                          {profile.socialMedia.linkedin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(profile.socialMedia.linkedin, '_blank')}
                            >
                              LinkedIn
                            </Button>
                          )}
                          {profile.socialMedia.twitter && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(profile.socialMedia.twitter, '_blank')}
                            >
                              Twitter
                            </Button>
                          )}
                          {profile.socialMedia.facebook && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(profile.socialMedia.facebook, '_blank')}
                            >
                              Facebook
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {/* Sponsor Counter */}
          {sponsors.length > 1 && (
            <div className="flex justify-center items-center gap-2 pt-2">
              {sponsors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {sponsors.length > 1 && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing {currentIndex + 1} of {sponsors.length} sponsors • Auto-rotating every 8 seconds
        </p>
      )}
    </div>
  );
}