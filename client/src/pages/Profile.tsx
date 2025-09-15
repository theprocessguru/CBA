import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Save, Settings, Users, Star, AlertCircle, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  EducatorSection, 
  VolunteerSection, 
  StudentSection, 
  StartupFounderSection, 
  JobSeekerSection,
  ROLE_METADATA,
  type RoleComponentType
} from "@/components/profile/roles";
import { apiRequest } from "@/lib/queryClient";

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

interface UserPersonType {
  id: number;
  userId: string;
  personTypeId: number;
  isPrimary: boolean;
  assignedAt: string;
  assignedBy: string;
  notes?: string;
}

interface UserWithPersonTypes {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  bio?: string;
  title?: string;
  jobTitle?: string;
  qrHandle?: string;
  membershipTier: string;
  membershipStatus: string;
  isAdmin: boolean;
  personTypes?: PersonType[];
  rolesData?: Record<string, any>;
}

export default function Profile() {
  const [profileData, setProfileData] = useState<UserWithPersonTypes | null>(null);
  const [assignedPersonTypes, setAssignedPersonTypes] = useState<number[]>([]);
  const [primaryPersonType, setPrimaryPersonType] = useState<number | null>(null);
  const [rolesData, setRolesData] = useState<Record<string, any>>({});
  const [openRoles, setOpenRoles] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: user, isLoading: userLoading } = useQuery<UserWithPersonTypes>({
    queryKey: ['/api/auth/user'],
    refetchOnWindowFocus: false,
  });

  // Fetch available person types
  const { data: allPersonTypes = [], isLoading: typesLoading } = useQuery<PersonType[]>({
    queryKey: ['/api/person-types'],
  });

  // Fetch user's current person types
  const { data: userPersonTypes = [], isLoading: userTypesLoading } = useQuery<UserPersonType[]>({
    queryKey: [`/api/users/${user?.id}/person-types`],
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserWithPersonTypes>) => {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update person types mutation
  const updatePersonTypesMutation = useMutation({
    mutationFn: async ({ typeId, action, isPrimary }: { typeId: number; action: 'add' | 'remove' | 'setPrimary'; isPrimary?: boolean }) => {
      if (action === 'add') {
        const response = await fetch(`/api/admin/users/${user?.id}/person-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personTypeId: typeId, isPrimary: isPrimary || false }),
        });
        if (!response.ok) throw new Error('Failed to assign person type');
        return response.json();
      } else if (action === 'remove') {
        const response = await fetch(`/api/admin/users/${user?.id}/person-types/${typeId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove person type');
        return response.json();
      } else if (action === 'setPrimary') {
        const response = await fetch(`/api/admin/users/${user?.id}/person-types/${typeId}/primary`, {
          method: 'PUT',
        });
        if (!response.ok) throw new Error('Failed to set primary person type');
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Person Types Updated",
        description: "Your person types have been updated",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/person-types`] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update role data mutation
  const updateRoleDataMutation = useMutation({
    mutationFn: async (updatedRoleData: Record<string, any>) => {
      return apiRequest('PATCH', '/api/profile', { rolesData: updatedRoleData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update role data",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user) {
      setProfileData(user);
      setRolesData(user.rolesData || {});
    }
  }, [user]);

  useEffect(() => {
    if (userPersonTypes.length > 0) {
      const assignedIds = userPersonTypes.map(upt => upt.personTypeId);
      setAssignedPersonTypes(assignedIds);
      
      const primary = userPersonTypes.find(upt => upt.isPrimary);
      if (primary) {
        setPrimaryPersonType(primary.personTypeId);
      }
    }
  }, [userPersonTypes]);

  const handlePersonTypeToggle = (typeId: number) => {
    const isCurrentlyAssigned = assignedPersonTypes.includes(typeId);
    
    if (isCurrentlyAssigned) {
      // Remove person type
      updatePersonTypesMutation.mutate({ typeId, action: 'remove' });
    } else {
      // Add person type
      const isPrimary = assignedPersonTypes.length === 0; // First type becomes primary
      updatePersonTypesMutation.mutate({ typeId, action: 'add', isPrimary });
    }
  };

  const handleSetPrimary = (typeId: number) => {
    if (assignedPersonTypes.includes(typeId)) {
      setPrimaryPersonType(typeId);
      updatePersonTypesMutation.mutate({ typeId, action: 'setPrimary' });
    }
  };

  const handleSaveProfile = () => {
    if (profileData) {
      updateProfileMutation.mutate(profileData);
    }
  };

  const handleSaveRoleData = async (roleName: string, roleData: Record<string, any>) => {
    const updatedRoleData = {
      ...rolesData,
      [roleName]: roleData
    };
    setRolesData(updatedRoleData);
    await updateRoleDataMutation.mutateAsync(updatedRoleData);
  };

  const toggleRoleSection = (roleName: string) => {
    setOpenRoles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roleName)) {
        newSet.delete(roleName);
      } else {
        newSet.add(roleName);
      }
      return newSet;
    });
  };

  const getAssignedRoles = (): RoleComponentType[] => {
    if (!allPersonTypes || assignedPersonTypes.length === 0) return [];
    
    const roleMap: Record<string, RoleComponentType> = {
      'educator': 'educator',
      'volunteer': 'volunteer', 
      'student': 'student',
      'startup_founder': 'startup_founder',
      'job_seeker': 'job_seeker'
    };
    
    const assignedRoles: RoleComponentType[] = [];
    assignedPersonTypes.forEach(typeId => {
      const personType = allPersonTypes.find(t => t.id === typeId);
      if (personType && roleMap[personType.name]) {
        assignedRoles.push(roleMap[personType.name]);
      }
    });
    
    return assignedRoles;
  };

  const calculateProfileCompletion = (): number => {
    if (!profileData) return 0;
    
    const basicFields = ['firstName', 'lastName', 'email', 'bio'];
    const completedBasic = basicFields.filter(field => 
      profileData[field as keyof UserWithPersonTypes]
    ).length;
    
    const basicCompletion = (completedBasic / basicFields.length) * 50; // 50% for basic info
    
    const assignedRoles = getAssignedRoles();
    if (assignedRoles.length === 0) return Math.round(basicCompletion);
    
    let roleCompletion = 0;
    assignedRoles.forEach(roleName => {
      const roleData = rolesData[roleName] || {};
      const roleFields = Object.keys(roleData).filter(key => 
        roleData[key] && roleData[key] !== ''
      );
      
      // Estimate 8-12 fields per role for completion calculation
      const estimatedFields = 10;
      const completion = Math.min((roleFields.length / estimatedFields) * 100, 100);
      roleCompletion += completion;
    });
    
    const avgRoleCompletion = roleCompletion / assignedRoles.length;
    const totalCompletion = basicCompletion + (avgRoleCompletion * 0.5); // 50% for role data
    
    return Math.round(totalCompletion);
  };

  const getTypeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-800",
      indigo: "bg-indigo-100 text-indigo-800",
      green: "bg-green-100 text-green-800",
      teal: "bg-teal-100 text-teal-800",
      purple: "bg-purple-100 text-purple-800",
      yellow: "bg-yellow-100 text-yellow-800",
      orange: "bg-orange-100 text-orange-800",
      red: "bg-red-100 text-red-800",
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  const getUserAccessDescription = () => {
    const hasBusinessType = assignedPersonTypes.some(id => {
      const type = allPersonTypes.find(t => t.id === id);
      return type?.name === 'business' || type?.name === 'attendee';
    });

    const hasVolunteerType = assignedPersonTypes.some(id => {
      const type = allPersonTypes.find(t => t.id === id);
      return type?.name === 'volunteer';
    });

    const hasResidentType = assignedPersonTypes.some(id => {
      const type = allPersonTypes.find(t => t.id === id);
      return type?.name === 'resident';
    });

    const features = [];
    if (hasBusinessType) {
      features.push("Business profile", "Products & services", "Special offers", "Full marketplace access");
    }
    if (hasVolunteerType) {
      features.push("Volunteer areas", "Event assistance features");
    }
    if (hasResidentType) {
      features.push("Community features", "Local events");
    }
    
    return features.length > 0 ? features.join(", ") : "Basic access only";
  };

  if (userLoading || typesLoading || userTypesLoading || !profileData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and access permissions</p>
        </div>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Profile Completion</h3>
              <p className="text-sm text-gray-600">Complete your profile to unlock all features</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{calculateProfileCompletion()}%</div>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${calculateProfileCompletion()}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback>
                    {profileData.firstName?.[0]}{profileData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{profileData.firstName} {profileData.lastName}</h3>
                  <p className="text-sm text-gray-600">{profileData.email}</p>
                  <Badge variant="outline">{profileData.membershipTier}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName || ''}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, firstName: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName || ''}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, lastName: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, phone: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company || ''}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, company: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={profileData.title || ''}
                    placeholder="e.g., CEO, Mayor, Director"
                    onChange={(e) => setProfileData(prev => prev ? {...prev, title: e.target.value} : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profileData.jobTitle || ''}
                    onChange={(e) => setProfileData(prev => prev ? {...prev, jobTitle: e.target.value} : null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio || ''}
                  placeholder="Tell us about yourself..."
                  onChange={(e) => setProfileData(prev => prev ? {...prev, bio: e.target.value} : null)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Role-Specific Sections */}
          {getAssignedRoles().length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Role-Specific Profiles</h2>
              </div>
              
              {getAssignedRoles().map((roleName) => {
                const roleData = rolesData[roleName] || {};
                const isOpen = openRoles.has(roleName);
                
                switch (roleName) {
                  case 'educator':
                    return (
                      <EducatorSection
                        key={roleName}
                        roleData={roleData}
                        onSave={handleSaveRoleData}
                        isSaving={updateRoleDataMutation.isPending}
                        isOpen={isOpen}
                        onToggle={() => toggleRoleSection(roleName)}
                      />
                    );
                  case 'volunteer':
                    return (
                      <VolunteerSection
                        key={roleName}
                        roleData={roleData}
                        onSave={handleSaveRoleData}
                        isSaving={updateRoleDataMutation.isPending}
                        isOpen={isOpen}
                        onToggle={() => toggleRoleSection(roleName)}
                      />
                    );
                  case 'student':
                    return (
                      <StudentSection
                        key={roleName}
                        roleData={roleData}
                        onSave={handleSaveRoleData}
                        isSaving={updateRoleDataMutation.isPending}
                        isOpen={isOpen}
                        onToggle={() => toggleRoleSection(roleName)}
                      />
                    );
                  case 'startup_founder':
                    return (
                      <StartupFounderSection
                        key={roleName}
                        roleData={roleData}
                        onSave={handleSaveRoleData}
                        isSaving={updateRoleDataMutation.isPending}
                        isOpen={isOpen}
                        onToggle={() => toggleRoleSection(roleName)}
                      />
                    );
                  case 'job_seeker':
                    return (
                      <JobSeekerSection
                        key={roleName}
                        roleData={roleData}
                        onSave={handleSaveRoleData}
                        isSaving={updateRoleDataMutation.isPending}
                        isOpen={isOpen}
                        onToggle={() => toggleRoleSection(roleName)}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>
          )}
        </div>

        {/* Person Types Management */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Access Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your selected types determine what features you can access in the platform.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {allPersonTypes.map((type) => {
                  const isAssigned = assignedPersonTypes.includes(type.id);
                  const isPrimary = primaryPersonType === type.id;
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => handlePersonTypeToggle(type.id)}
                          disabled={updatePersonTypesMutation.isPending}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(type.color)}>
                              {type.displayName}
                            </Badge>
                            {isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                        </div>
                      </div>
                      
                      {isAssigned && !isPrimary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(type.id)}
                          disabled={updatePersonTypesMutation.isPending}
                          className="text-xs"
                        >
                          Set Primary
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm text-blue-800">Your Current Access:</h4>
                <p className="text-sm text-blue-700 mt-1">{getUserAccessDescription()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}