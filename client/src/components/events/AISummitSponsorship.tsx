import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Trophy,
  Award,
  Medal,
  Star,
  Building,
  Users,
  Megaphone,
  Globe,
  Package,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SponsorshipPackage {
  id: number;
  name: string;
  level: number;
  price: string;
  icon: React.ElementType;
  color: string;
  benefits: string[];
  available: boolean;
  maxSponsors?: number;
  currentSponsors: number;
}

const sponsorshipPackages: SponsorshipPackage[] = [
  {
    id: 1,
    name: "Platinum Partner",
    level: 4,
    price: "£5,000",
    icon: Trophy,
    color: "bg-gradient-to-r from-slate-400 to-slate-600",
    available: true,
    maxSponsors: 2,
    currentSponsors: 0,
    benefits: [
      "Premium logo placement on all event materials",
      "Co-branded lanyards for all attendees",
      "Large banner ads on CBA website (12 months)",
      "Premium exhibition booth space",
      "30-minute keynote speaking slot",
      "Access to full attendee list",
      "10 social media mentions",
      "VIP passes for 10 team members",
      "Exclusive networking dinner invitation",
      "Post-event report and analytics",
    ],
  },
  {
    id: 2,
    name: "Gold Sponsor",
    level: 3,
    price: "£3,000",
    icon: Award,
    color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
    available: true,
    maxSponsors: 3,
    currentSponsors: 1,
    benefits: [
      "Logo on event website and materials",
      "Medium banner ads on CBA website (6 months)",
      "Standard exhibition booth space",
      "15-minute speaking slot",
      "5 social media mentions",
      "VIP passes for 5 team members",
      "Networking lounge access",
      "Post-event attendee summary",
    ],
  },
  {
    id: 3,
    name: "Silver Sponsor",
    level: 2,
    price: "£1,500",
    icon: Medal,
    color: "bg-gradient-to-r from-gray-400 to-gray-600",
    available: true,
    maxSponsors: 5,
    currentSponsors: 2,
    benefits: [
      "Logo on event website",
      "Small banner ads on CBA website (3 months)",
      "Small exhibition space",
      "3 social media mentions",
      "VIP passes for 3 team members",
      "Networking opportunities",
    ],
  },
  {
    id: 4,
    name: "Bronze Supporter",
    level: 1,
    price: "£750",
    icon: Star,
    color: "bg-gradient-to-r from-orange-400 to-orange-600",
    available: true,
    benefits: [
      "Logo on event website",
      "Thank you mention during event",
      "2 social media mentions",
      "VIP passes for 2 team members",
      "Event program listing",
    ],
  },
];

export default function AISummitSponsorship() {
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipPackage | null>(null);
  const [sponsorForm, setSponsorForm] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    companyWebsite: "",
    companyDescription: "",
    specialRequests: "",
  });

  const handleSponsorshipInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPackage) return;

    try {
      const response = await fetch("/api/sponsorship/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          ...sponsorForm,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sponsorship Inquiry Sent!",
          description: "We'll contact you within 24 hours to discuss your sponsorship.",
        });
        setSponsorForm({
          companyName: "",
          contactName: "",
          contactEmail: "",
          contactPhone: "",
          companyWebsite: "",
          companyDescription: "",
          specialRequests: "",
        });
        setSelectedPackage(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send sponsorship inquiry. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-neutral-900">
          Become an AI Summit Sponsor
        </h2>
        <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
          Partner with the Croydon Business Association to support local businesses and 
          educate the community about AI innovation. All sponsorship proceeds go directly 
          to CBA's mission of helping businesses thrive and empowering our community.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">100% of proceeds support CBA's community mission</span>
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      {/* Why Sponsor Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Why Sponsor the AI Summit?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Reach Your Target Audience
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Connect with 500+ business leaders and decision makers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Showcase your products to innovation-focused businesses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Build relationships with the local business community</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Support the Community
              </h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Help educate businesses about AI opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Enable CBA to provide more business support services</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Position your brand as a community champion</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsorship Packages */}
      <div className="grid md:grid-cols-2 gap-6">
        {sponsorshipPackages.map((pkg) => {
          const Icon = pkg.icon;
          const spotsLeft = pkg.maxSponsors ? pkg.maxSponsors - pkg.currentSponsors : null;
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative overflow-hidden ${!pkg.available ? 'opacity-60' : ''}`}
            >
              <div className={`h-2 ${pkg.color}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${pkg.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      <p className="text-2xl font-bold text-primary mt-1">{pkg.price}</p>
                    </div>
                  </div>
                  {spotsLeft !== null && (
                    <Badge variant={spotsLeft > 0 ? "default" : "secondary"}>
                      {spotsLeft > 0 ? `${spotsLeft} spots left` : "Sold out"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-neutral-700">Package Benefits:</h4>
                  <ul className="space-y-1.5">
                    {pkg.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-neutral-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={!pkg.available || (pkg.maxSponsors && spotsLeft === 0)}
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      {pkg.maxSponsors && spotsLeft === 0 ? "Sold Out" : "Become a Sponsor"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Sponsorship Inquiry - {pkg.name}</DialogTitle>
                      <DialogDescription>
                        Fill out the form below and we'll contact you within 24 hours to discuss your sponsorship.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <form onSubmit={handleSponsorshipInquiry} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            required
                            value={sponsorForm.companyName}
                            onChange={(e) => setSponsorForm({...sponsorForm, companyName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Contact Name *</Label>
                          <Input
                            id="contactName"
                            required
                            value={sponsorForm.contactName}
                            onChange={(e) => setSponsorForm({...sponsorForm, contactName: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Email *</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            required
                            value={sponsorForm.contactEmail}
                            onChange={(e) => setSponsorForm({...sponsorForm, contactEmail: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactPhone">Phone</Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            value={sponsorForm.contactPhone}
                            onChange={(e) => setSponsorForm({...sponsorForm, contactPhone: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite">Company Website</Label>
                        <Input
                          id="companyWebsite"
                          type="url"
                          value={sponsorForm.companyWebsite}
                          onChange={(e) => setSponsorForm({...sponsorForm, companyWebsite: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Company Description</Label>
                        <Textarea
                          id="companyDescription"
                          rows={3}
                          value={sponsorForm.companyDescription}
                          onChange={(e) => setSponsorForm({...sponsorForm, companyDescription: e.target.value})}
                          placeholder="Tell us about your company and what you do..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialRequests">Special Requests or Questions</Label>
                        <Textarea
                          id="specialRequests"
                          rows={3}
                          value={sponsorForm.specialRequests}
                          onChange={(e) => setSponsorForm({...sponsorForm, specialRequests: e.target.value})}
                          placeholder="Any specific requirements or questions about the sponsorship?"
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                          Submit Sponsorship Inquiry
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Sponsorship Option */}
      <Card className="bg-gradient-to-r from-primary-light/10 to-secondary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Custom Sponsorship Packages
          </CardTitle>
          <CardDescription>
            Have specific sponsorship needs? We can create a custom package tailored to your objectives and budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 mb-4">
            Whether you want to sponsor specific sessions, provide technology demonstrations, 
            or have other creative ideas, we're open to discussing custom arrangements that 
            benefit both your organization and our community.
          </p>
          <Button variant="outline" className="w-full sm:w-auto">
            <Megaphone className="mr-2 h-4 w-4" />
            Contact Us for Custom Options
          </Button>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Questions About Sponsorship?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-neutral-600">
            Contact our sponsorship team for more information:
          </p>
          <div className="space-y-1">
            <p className="font-medium">Email: sponsors@cba.org.uk</p>
            <p className="font-medium">Phone: 020 8555 0123</p>
          </div>
          <p className="text-xs text-neutral-500 pt-2">
            All sponsorship proceeds support CBA's mission to help businesses grow and educate our community.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}