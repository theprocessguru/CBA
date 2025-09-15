import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Save, 
  MapPin, 
  Users, 
  Briefcase, 
  Home,
  CheckCircle,
  AlertCircle,
  Star,
  Building
} from "lucide-react";

interface PersonType {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  priority: number;
  isActive: boolean;
}

interface OrganizationMembership {
  id?: number;
  organizationName: string;
  organizationType: string;
  role: string;
  isActive: boolean;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
}

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  memberSegment: 'resident' | 'business_owner';
  homeAddress?: string;
  homeCity?: string;
  homePostcode?: string;
  homeCountry?: string;
  personTypes: PersonType[];
  organizationMemberships: OrganizationMembership[];
}

// Default organizations that users can join
const AVAILABLE_ORGANIZATIONS = [
  {
    name: "Croydon Business Association",
    type: "business_network",
    description: "Main business association for Croydon"
  },
  {
    name: "Croydon Residents Network",
    type: "community_group",
    description: "Community group for local residents"
  },
  {
    name: "Croydon Volunteer Network",
    type: "volunteer_group",
    description: "Volunteer coordination network"
  },
  {
    name: "Croydon Education Forum",
    type: "professional_body",
    description: "Educational professionals network"
  }
];

export default function ResidentProfile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    memberSegment: 'resident',
    homeCountry: 'UK',
    homeCity: 'Croydon'
  });
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<number[]>([]);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationMembership[]>([]);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/profile'],
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Fetch available person types
  const { data: allPersonTypes = [], isLoading: typesLoading } = useQuery<PersonType[]>({
    queryKey: ['/api/person-types'],
    enabled: isAuthenticated,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', '/api/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      const profileWithDefaults = profile as any;
      setProfileData({
        ...profileWithDefaults,
        memberSegment: profileWithDefaults.memberSegment || 'resident',
        homeCountry: profileWithDefaults.homeCountry || 'UK',
        homeCity: profileWithDefaults.homeCity || 'Croydon'
      });
      
      // Set selected person types
      if (profileWithDefaults.personTypes && Array.isArray(profileWithDefaults.personTypes)) {
        setSelectedPersonTypes(profileWithDefaults.personTypes.filter(pt => pt && pt.id).map((pt: PersonType) => pt.id));
      }
      
      // Set organization memberships
      if (profileWithDefaults.organizationMemberships) {
        setUserOrganizations(profileWithDefaults.organizationMemberships);
      }
    }
  }, [profile]);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    
    const requiredFields = ['firstName', 'lastName', 'email'];
    const optionalFields = ['phone', 'bio'];
    const addressFields = profileData.memberSegment === 'resident' 
      ? ['homeAddress', 'homeCity', 'homePostcode'] 
      : [];
    
    let completedFields = 0;
    let totalFields = requiredFields.length + optionalFields.length + addressFields.length + 2; // +2 for segment and person types
    
    // Check required fields
    requiredFields.forEach(field => {
      if (profileData[field as keyof ProfileData]) completedFields++;
    });
    
    // Check optional fields
    optionalFields.forEach(field => {
      if (profileData[field as keyof ProfileData]) completedFields++;
    });
    
    // Check address fields for residents
    addressFields.forEach(field => {
      if (profileData[field as keyof ProfileData]) completedFields++;
    });
    
    // Check member segment
    if (profileData.memberSegment) completedFields++;
    
    // Check person types
    if (selectedPersonTypes.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const handlePersonTypeToggle = (typeId: number) => {
    setSelectedPersonTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleOrganizationToggle = (orgName: string, orgType: string, isJoining: boolean) => {
    if (isJoining) {
      // Add organization
      const newOrg: OrganizationMembership = {
        organizationName: orgName,
        organizationType: orgType,
        role: 'member',
        isActive: true,
        description: AVAILABLE_ORGANIZATIONS.find(o => o.name === orgName)?.description || ''
      };
      setUserOrganizations(prev => [...prev, newOrg]);
    } else {
      // Remove organization
      setUserOrganizations(prev => 
        prev.filter(org => org.organizationName !== orgName)
      );
    }
  };

  const handleSaveProfile = () => {
    const updateData = {
      ...profileData,
      personTypeIds: selectedPersonTypes,
      organizationMemberships: userOrganizations
    };
    
    updateProfileMutation.mutate(updateData);
  };

  const isOrganizationMember = (orgName: string) => {
    return userOrganizations.some(org => 
      org.organizationName === orgName && org.isActive
    );
  };

  const getPersonTypeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      green: "bg-green-100 text-green-800 border-green-200",
      teal: "bg-teal-100 text-teal-800 border-teal-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const completionPercentage = calculateProfileCompletion();

  if (profileLoading || typesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Helmet>
        <title>My Profile - Croydon Business Association</title>
        <meta name="description" content="Manage your personal profile and membership settings" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and membership settings</p>
          </div>
        </div>
        
        {/* Profile Completion */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Profile Completion</span>
          </div>
          <Progress value={completionPercentage} className="w-32" />
          <p className="text-xs text-gray-600 mt-1">{completionPercentage}% complete</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    data-testid="input-firstName"
                    value={profileData.firstName || ''}
                    onChange={(e) => setProfileData(prev => ({...prev, firstName: e.target.value}))}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    data-testid="input-lastName"
                    value={profileData.lastName || ''}
                    onChange={(e) => setProfileData(prev => ({...prev, lastName: e.target.value}))}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    value={profileData.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  data-testid="textarea-bio"
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Member Segment Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Membership Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={profileData.memberSegment}
                onValueChange={(value: 'resident' | 'business_owner') => 
                  setProfileData(prev => ({...prev, memberSegment: value}))
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
            </CardContent>
          </Card>

          {/* Address Information (for residents) */}
          {profileData.memberSegment === 'resident' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="homeAddress">Home Address</Label>
                  <Input
                    id="homeAddress"
                    data-testid="input-homeAddress"
                    value={profileData.homeAddress || ''}
                    onChange={(e) => setProfileData(prev => ({...prev, homeAddress: e.target.value}))}
                    placeholder="Enter your home address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="homeCity">City</Label>
                    <Input
                      id="homeCity"
                      data-testid="input-homeCity"
                      value={profileData.homeCity || ''}
                      onChange={(e) => setProfileData(prev => ({...prev, homeCity: e.target.value}))}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homePostcode">Postcode</Label>
                    <Input
                      id="homePostcode"
                      data-testid="input-homePostcode"
                      value={profileData.homePostcode || ''}
                      onChange={(e) => setProfileData(prev => ({...prev, homePostcode: e.target.value}))}
                      placeholder="Postcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="homeCountry">Country</Label>
                    <Input
                      id="homeCountry"
                      data-testid="input-homeCountry"
                      value={profileData.homeCountry || ''}
                      onChange={(e) => setProfileData(prev => ({...prev, homeCountry: e.target.value}))}
                      placeholder="Country"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Person Types Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Roles & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select the roles that best describe you. This helps us provide relevant content and opportunities.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allPersonTypes.map((type) => {
                  const isSelected = selectedPersonTypes.includes(type.id);
                  
                  return (
                    <div key={type.id} className="flex items-center space-x-3 border rounded-lg p-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handlePersonTypeToggle(type.id)}
                        data-testid={`checkbox-person-type-${type.name}`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getPersonTypeColor(type.color)}>
                            {type.displayName}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Organization Memberships */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Join organizations and community groups that align with your interests.
              </p>
              
              {AVAILABLE_ORGANIZATIONS.map((org) => {
                const isMember = isOrganizationMember(org.name);
                
                return (
                  <div key={org.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 pr-3">
                      <h4 className="text-sm font-medium">{org.name}</h4>
                      <p className="text-xs text-gray-600">{org.description}</p>
                    </div>
                    <Switch
                      checked={isMember}
                      onCheckedChange={(checked) => handleOrganizationToggle(org.name, org.type, checked)}
                      data-testid={`switch-org-${org.name.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Profile Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Completion</span>
                <span className="text-sm font-medium">{completionPercentage}%</span>
              </div>
              
              <Progress value={completionPercentage} />
              
              <div className="text-xs text-gray-600 space-y-1">
                {completionPercentage < 100 && (
                  <p>Complete your profile to unlock all features!</p>
                )}
                {selectedPersonTypes.length === 0 && (
                  <p>• Select your roles and interests</p>
                )}
                {profileData.memberSegment === 'resident' && !profileData.homeAddress && (
                  <p>• Add your address information</p>
                )}
                {!profileData.phone && (
                  <p>• Add your phone number</p>
                )}
                {!profileData.bio && (
                  <p>• Write a short bio</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveProfile}
          disabled={updateProfileMutation.isPending}
          className="flex items-center gap-2"
          data-testid="button-save-profile"
        >
          <Save className="h-4 w-4" />
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}