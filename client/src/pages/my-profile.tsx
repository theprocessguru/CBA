import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Calendar, 
  MapPin, 
  Clock,
  Users,
  Briefcase,
  Mail,
  Phone,
  Building,
  Ticket
} from "lucide-react";

const MyProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    bio: ""
  });

  // Get user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: (profile as any).firstName || "",
        lastName: (profile as any).lastName || "",
        email: (profile as any).email || "",
        phone: (profile as any).phone || "",
        company: (profile as any).company || "",
        jobTitle: (profile as any).jobTitle || "",
        bio: (profile as any).bio || ""
      });
    }
  }, [profile]);

  // Get user's AI Summit registrations
  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/my-event-registrations"],
    enabled: isAuthenticated
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      await apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        company: profile.company || "",
        jobTitle: profile.jobTitle || "",
        bio: profile.bio || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">Please log in to view your profile.</p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>My Profile - Croydon Business Association</title>
        <meta name="description" content="Manage your profile and view your AI Summit registrations." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your event registrations</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="events">Event Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{(profile as any)?.firstName || "Not provided"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{(profile as any)?.lastName || "Not provided"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900 font-medium">{(profile as any)?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">{(profile as any)?.phone || "Not provided"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Enter company name"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">{(profile as any)?.company || "Not provided"}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <Input
                          id="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="Enter job title"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900 font-medium">{(profile as any)?.jobTitle || "Not provided"}</p>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Membership Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Membership Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Membership Tier</span>
                  <Badge variant="secondary">{(profile as any)?.membershipTier || "Starter Tier"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <Badge variant={(profile as any)?.membershipStatus === 'active' ? 'default' : 'secondary'}>
                    {(profile as any)?.membershipStatus || "trial"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-900">
                    {(profile as any)?.createdAt ? new Date((profile as any).createdAt).toLocaleDateString() : "Recently joined"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {registrationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : registrations && (registrations as any).length > 0 ? (
                  <div className="space-y-4">
                    {(registrations as any).map((registration: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{registration.eventName}</h3>
                          <Badge variant="outline">{registration.participantType}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{registration.eventDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{registration.eventTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{registration.venue}</span>
                          </div>
                        </div>
                        {registration.badgeId && (
                          <div className="flex items-center gap-2 text-sm">
                            <Ticket className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">Badge ID: {registration.badgeId}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <Users className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600">No event registrations found.</p>
                    <p className="text-sm text-gray-500">When you register for events, they'll appear here.</p>
                    <Link href="/ai-summit">
                      <Button variant="outline">
                        Register for AI Summit
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyProfile;