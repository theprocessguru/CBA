import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { QrCode, Download, User, Building, Phone, Crown, Copy, Check } from "lucide-react";

interface PersonalBadge {
  id: number;
  userId: string;
  badgeId: string;
  qrHandle: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BadgeProfile {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  jobTitle: string;
  phone: string;
  bio: string;
  qrHandle: string;
  membershipTier: string;
}

const PersonalBadgePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [badgeProfile, setBadgeProfile] = useState<BadgeProfile>({
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    jobTitle: '',
    phone: '',
    bio: '',
    qrHandle: '',
    membershipTier: ''
  });

  // Fetch user's personal badge
  const { data: personalBadge, isLoading: badgeLoading } = useQuery<PersonalBadge>({
    queryKey: ['/api/my-personal-badge'],
    retry: false,
  });

  // Fetch user profile for badge
  const { data: profile, isLoading: profileLoading } = useQuery<BadgeProfile>({
    queryKey: ['/api/my-badge-profile'],
    retry: false,
  });

  useEffect(() => {
    if (profile) {
      setBadgeProfile(profile);
    }
  }, [profile]);

  // Create personal badge
  const createBadgeMutation = useMutation({
    mutationFn: async (data: Partial<BadgeProfile>) => {
      return apiRequest('POST', '/api/create-personal-badge', data);
    },
    onSuccess: () => {
      toast({
        title: "Personal Badge Created",
        description: "Your reusable personal badge has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-personal-badge'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Badge",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update badge profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<BadgeProfile>) => {
      return apiRequest('PUT', '/api/update-badge-profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your badge profile has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-badge-profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-personal-badge'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!badgeProfile.qrHandle) {
      toast({
        title: "QR Handle Required",
        description: "Please enter your custom QR handle (e.g., 'theprocessguru')",
        variant: "destructive",
      });
      return;
    }

    if (personalBadge) {
      updateProfileMutation.mutate(badgeProfile);
    } else {
      createBadgeMutation.mutate(badgeProfile);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to Clipboard",
      description: `Badge ID "${text}" copied to clipboard`,
    });
  };

  const downloadBadge = () => {
    if (personalBadge) {
      window.open(`/api/download-personal-badge/${personalBadge.badgeId}`, '_blank');
    }
  };

  const getBadgeColor = (membershipTier: string) => {
    switch (membershipTier) {
      case 'Partner': return 'bg-purple-500';
      case 'Patron Tier': return 'bg-gold-500';
      case 'Strategic Tier': return 'bg-red-500';
      case 'Growth Tier': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const isLoading = badgeLoading || profileLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>My Personal Badge - Croydon Business Association</title>
        <meta name="description" content="Create and manage your personal reusable badge for all CBA events" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <QrCode className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Personal Badge</h1>
          <p className="text-lg text-gray-600">
            Create your reusable badge for all CBA events with a custom QR handle
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Badge Setup Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Badge Profile Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={badgeProfile.firstName}
                      onChange={(e) => setBadgeProfile(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={badgeProfile.lastName}
                      onChange={(e) => setBadgeProfile(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="qrHandle">QR Handle *</Label>
                  <Input
                    id="qrHandle"
                    value={badgeProfile.qrHandle}
                    onChange={(e) => setBadgeProfile(prev => ({ ...prev, qrHandle: e.target.value.toLowerCase() }))}
                    placeholder="theprocessguru"
                    pattern="[a-z0-9]+"
                    title="Only lowercase letters and numbers allowed"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This will be your unique identifier (e.g., "theprocessguru")
                  </p>
                </div>

                <div>
                  <Label htmlFor="title">Title/Position</Label>
                  <Input
                    id="title"
                    value={badgeProfile.title}
                    onChange={(e) => setBadgeProfile(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Mayor, Executive Mayor, CEO, Founder"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={badgeProfile.company}
                    onChange={(e) => setBadgeProfile(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={badgeProfile.jobTitle}
                    onChange={(e) => setBadgeProfile(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Your job title"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    value={badgeProfile.phone}
                    onChange={(e) => setBadgeProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+44 7xxx xxx xxx"
                    type="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    value={badgeProfile.bio}
                    onChange={(e) => setBadgeProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Brief description about yourself"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || createBadgeMutation.isPending || updateProfileMutation.isPending}
                >
                  {personalBadge ? "Update Badge Profile" : "Create Personal Badge"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Badge Preview */}
          <div className="space-y-6">
            {personalBadge && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <QrCode className="h-5 w-5 mr-2" />
                      Your Personal Badge
                    </span>
                    <Badge className={`${getBadgeColor(badgeProfile.membershipTier)} text-white`}>
                      {badgeProfile.membershipTier || 'Member'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center space-y-4">
                    <div className={`w-24 h-24 ${getBadgeColor(badgeProfile.membershipTier)} rounded-full mx-auto flex items-center justify-center`}>
                      <QrCode className="h-12 w-12 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {badgeProfile.firstName} {badgeProfile.lastName}
                      </h3>
                      {badgeProfile.title && (
                        <p className="text-sm text-purple-600 font-medium flex items-center justify-center">
                          <Crown className="h-4 w-4 mr-1" />
                          {badgeProfile.title}
                        </p>
                      )}
                      {badgeProfile.jobTitle && (
                        <p className="text-sm text-gray-600">{badgeProfile.jobTitle}</p>
                      )}
                      {badgeProfile.company && (
                        <p className="text-sm text-gray-700 flex items-center justify-center">
                          <Building className="h-4 w-4 mr-1" />
                          {badgeProfile.company}
                        </p>
                      )}
                      {badgeProfile.phone && (
                        <p className="text-sm text-gray-600 flex items-center justify-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {badgeProfile.phone}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm font-medium">Badge ID:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{personalBadge.badgeId}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(personalBadge.badgeId)}
                          className="p-1 h-auto"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm font-medium">QR Handle:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">@{badgeProfile.qrHandle}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <Button onClick={downloadBadge} className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Badge
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Your badge will automatically change color based on your role in each event:
                      </p>
                      <div className="flex justify-center space-x-2 mt-2">
                        <Badge className="bg-blue-500 text-white">Guest</Badge>
                        <Badge className="bg-green-500 text-white">Member</Badge>
                        <Badge className="bg-red-500 text-white">Exhibitor</Badge>
                        <Badge className="bg-purple-500 text-white">VIP</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!personalBadge && !isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Personal Badge Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create your personal badge to use across all CBA events
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalBadgePage;