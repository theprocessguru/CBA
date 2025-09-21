import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Save, Settings, Users, Star, AlertCircle, ChevronDown, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  EducatorSection, 
  VolunteerSection, 
  StudentSection, 
  StartupFounderSection, 
  JobSeekerSection,
  SpeakerSection,
  WorkshopProviderSection,
  ROLE_METADATA,
  type RoleComponentType
} from "@/components/profile/roles";
import { PasswordChangeSection } from "@/components/profile/PasswordChangeSection";
import { WorkshopBookingsSection } from "@/components/profile/WorkshopBookingsSection";
import { apiRequest } from "@/lib/queryClient";
import { PersonType, UserPersonType, User as DbUser } from "@shared/schema";

interface UserWithPersonTypes extends DbUser {
  personTypes?: PersonType[];
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

  // Fetch available person types (only those user can self-assign)
  const { data: availablePersonTypes = [], isLoading: typesLoading } = useQuery<PersonType[]>({
    queryKey: ['/api/person-types/available'],
  });
  
  // Fetch all person types (for admin use)
  const { data: allPersonTypes = [], isLoading: allTypesLoading } = useQuery<PersonType[]>({
    queryKey: ['/api/person-types'],
    enabled: user?.isAdmin || false,
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

  // Self-assign interest types mutation (for users)
  const selfAssignPersonTypeMutation = useMutation({
    mutationFn: async ({ typeId, action }: { typeId: number; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        const response = await fetch('/api/users/me/person-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personTypeId: typeId }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to assign person type');
        }
        return response.json();
      } else if (action === 'remove') {
        const response = await fetch(`/api/users/me/person-types/${typeId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to remove person type');
        }
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Interest Updated",
        description: "Your interest has been updated",
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

  // Admin-only person types mutation (for admins)
  const adminAssignPersonTypeMutation = useMutation({
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
    
    // Find the person type to check if it's admin-only
    const personType = availablePersonTypes.find(pt => pt.id === typeId) || allPersonTypes.find(pt => pt.id === typeId);
    
    if (!personType) {
      toast({
        title: "Error",
        description: "Person type not found",
        variant: "destructive",
      });
      return;
    }
    
    // Handle roles differently from interests
    if (personType.category === 'role') {
      if (isCurrentlyAssigned) {
        // For roles, users cannot directly uncheck - show guidance message
        toast({
          title: "Use Role Form to Deactivate",
          description: "To deactivate this role, please use the deactivation option in the role form below.",
          variant: "default",
        });
        return;
      } else {
        // For now, assign role normally - will add proper activation later
        selfAssignPersonTypeMutation.mutate({ typeId, action: 'add' });
        
        // Auto-open the role section 
        const roleMap: Record<string, string> = {
          'educator': 'educator',
          'volunteer': 'volunteer', 
          'student': 'student',
          'startup_founder': 'startup_founder',
          'job_seeker': 'job_seeker',
          'speaker': 'speaker',
          'workshop_provider': 'workshop_provider'
        };
        
        const roleName = roleMap[personType.name];
        if (roleName) {
          setOpenRoles(prev => {
            const newSet = new Set(prev);
            newSet.add(roleName);
            return newSet;
          });
        }
      }
    } else {
      // Handle interests with normal toggle behavior
      if (isCurrentlyAssigned) {
        // Remove person type
        if (personType.isAdminOnly && !user?.isAdmin) {
          toast({
            title: "Permission Denied",
            description: "Admin-only roles can only be removed by administrators",
            variant: "destructive",
          });
          return;
        }
        
        if (personType.isAdminOnly || user?.isAdmin) {
          adminAssignPersonTypeMutation.mutate({ typeId, action: 'remove' });
        } else {
          selfAssignPersonTypeMutation.mutate({ typeId, action: 'remove' });
        }
      } else {
        // Add person type
        if (personType.isAdminOnly && !user?.isAdmin) {
          toast({
            title: "Permission Denied",
            description: "This role can only be assigned by administrators",
            variant: "destructive",
          });
          return;
        }
        
        if (personType.isAdminOnly || user?.isAdmin) {
          const isPrimary = assignedPersonTypes.length === 0; // First type becomes primary
          adminAssignPersonTypeMutation.mutate({ typeId, action: 'add', isPrimary });
        } else {
          selfAssignPersonTypeMutation.mutate({ typeId, action: 'add' });
        }
      }
    }
  };

  const handleSetPrimary = (typeId: number) => {
    if (assignedPersonTypes.includes(typeId)) {
      setPrimaryPersonType(typeId);
      adminAssignPersonTypeMutation.mutate({ typeId, action: 'setPrimary' });
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
      'job_seeker': 'job_seeker',
      'speaker': 'speaker',
      'workshop_provider': 'workshop_provider'
    };
    
    const assignedRoles: RoleComponentType[] = [];
    assignedPersonTypes.forEach(typeId => {
      const personType = allPersonTypes.find(t => t.id === typeId);
      if (personType && roleMap[personType.name]) {
        const roleName = roleMap[personType.name];
        // Only include role if it's active in rolesData or if rolesData doesn't exist (backward compatibility)
        const roleData = rolesData[roleName];
        if (!roleData || roleData.active !== false) {
          assignedRoles.push(roleName);
        }
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

          {/* Password Change Section */}
          <PasswordChangeSection />

          {/* Workshop Bookings Section */}
          <WorkshopBookingsSection userId={user?.id || ''} />

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
                
                if (roleName === 'educator') {
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
                }
                
                if (roleName === 'volunteer') {
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
                }
                
                if (roleName === 'student') {
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
                }
                
                if (roleName === 'startup_founder') {
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
                }
                
                if (roleName === 'job_seeker') {
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
                }
                
                if (roleName === 'speaker') {
                  return (
                    <SpeakerSection
                      key={roleName}
                      roleData={roleData}
                      onSave={handleSaveRoleData}
                      isSaving={updateRoleDataMutation.isPending}
                      isOpen={isOpen}
                      onToggle={() => toggleRoleSection(roleName)}
                    />
                  );
                }
                
                if (roleName === 'workshop_provider') {
                  return (
                    <WorkshopProviderSection
                      key={roleName}
                      roleData={roleData}
                      onSave={handleSaveRoleData}
                      isSaving={updateRoleDataMutation.isPending}
                      isOpen={isOpen}
                      onToggle={() => toggleRoleSection(roleName)}
                    />
                  );
                }
                
                return null;
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar - Person Types Management */}
        <div className="space-y-6">
          {/* Current Assigned Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Current Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedPersonTypes.length > 0 ? (
                <div className="space-y-3">
                  {userPersonTypes.map((upt) => {
                    const type = [...availablePersonTypes, ...allPersonTypes].find(t => t.id === upt.personTypeId);
                    if (!type) return null;
                    
                    const isPrimary = primaryPersonType === type.id;
                    
                    return (
                      <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(type.color || 'blue')}>
                                {type.displayName}
                              </Badge>
                              {type.isAdminOnly && (
                                <Badge variant="secondary" className="text-xs">
                                  Admin Assigned
                                </Badge>
                              )}
                              {isPrimary && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Category: {type.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!isPrimary && !type.isAdminOnly && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetPrimary(type.id)}
                              disabled={adminAssignPersonTypeMutation.isPending}
                              className="text-xs"
                            >
                              Set Primary
                            </Button>
                          )}
                          
                          {(!type.isAdminOnly || user?.isAdmin) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handlePersonTypeToggle(type.id)}
                              disabled={selfAssignPersonTypeMutation.isPending || adminAssignPersonTypeMutation.isPending}
                              className="text-xs"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No person types assigned yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Show assigned admin-only roles as read-only badges */}
          {userPersonTypes.filter(upt => {
            const personType = allPersonTypes.find(pt => pt.id === upt.personTypeId);
            return personType?.isAdminOnly && !user?.isAdmin;
          }).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Special Roles
                </CardTitle>
                <CardDescription>
                  These roles have been assigned to you by administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userPersonTypes.filter(upt => {
                  const personType = allPersonTypes.find(pt => pt.id === upt.personTypeId);
                  return personType?.isAdminOnly && !user?.isAdmin;
                }).map((upt) => {
                  const personType = allPersonTypes.find(pt => pt.id === upt.personTypeId);
                  if (!personType) return null;
                  
                  return (
                    <div key={upt.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(personType.color || 'blue')}>
                              {personType.displayName}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Assigned by Admin
                            </Badge>
                            {upt.isPrimary && (
                              <Badge variant="outline" className="text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{personType.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Self-Selectable Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Express Your Roles & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select roles and interests to receive relevant opportunities and notifications. 
                  When you select an interest, our admin team will contact you with relevant information and opportunities.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {/* First display roles alphabetically, then interests alphabetically */}
                {[
                  ...availablePersonTypes.filter(type => type.category === 'role').sort((a, b) => a.displayName.localeCompare(b.displayName)),
                  ...availablePersonTypes.filter(type => type.category === 'interest').sort((a, b) => a.displayName.localeCompare(b.displayName))
                ].map((type) => {
                  const isAssigned = assignedPersonTypes.includes(type.id);
                  
                  return (
                    <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={() => handlePersonTypeToggle(type.id)}
                          disabled={selfAssignPersonTypeMutation.isPending}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(type.color || 'blue')}>
                              {type.displayName}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Admin-Only Section */}
          {user?.isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Admin: Assign Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Admin-only roles that can only be assigned by administrators.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  {allPersonTypes.filter(type => type.isAdminOnly).map((type) => {
                    const isAssigned = assignedPersonTypes.includes(type.id);
                    
                    return (
                      <div key={type.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={isAssigned}
                            onCheckedChange={() => handlePersonTypeToggle(type.id)}
                            disabled={adminAssignPersonTypeMutation.isPending}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(type.color || 'blue')}>
                                {type.displayName}
                              </Badge>
                              <Badge variant="destructive" className="text-xs">
                                Admin Only
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Access Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="p-3 bg-blue-50 rounded-lg">
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