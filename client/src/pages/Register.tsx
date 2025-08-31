import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, User, Building, GraduationCap, Home, Users, Mic, Heart, Crown } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    homeAddress: "",
    homeCity: "",
    homePostcode: "",
    businessAddress: "",
    businessCity: "",
    businessPostcode: "",
    // Business details
    businessName: "",
    businessDescription: "",
    businessWebsite: "",
    businessPhone: "",
    businessEmail: "",
    businessCategory: "",
    employeeCount: "",
    established: "",
    // Educator details
    schoolName: "",
    educatorRole: "",
    subjectTaught: "",
    schoolType: "",
  });
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<number[]>([]);
  const [hasExistingBusiness, setHasExistingBusiness] = useState<boolean | null>(null);
  const [showBusinessAddress, setShowBusinessAddress] = useState(false);
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);
  const [showOrganizationMemberships, setShowOrganizationMemberships] = useState(false);
  const [showEducatorDetails, setShowEducatorDetails] = useState(false);
  const [organizationMemberships, setOrganizationMemberships] = useState([{
    organizationName: '',
    organizationType: '',
    role: '',
    isActive: true,
    description: '',
    contactEmail: '',
    contactPhone: '',
    websiteUrl: ''
  }]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available person types
  const { data: personTypes = [] } = useQuery({
    queryKey: ['/api/person-types'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/person-types');
      return response.json();
    }
  });

  // Filter person types for self-registration (exclude admin-only ones)
  const selfRegisterPersonTypes = personTypes.filter((type: any) => 
    !['administrator', 'staff', 'sponsor', 'vip', 'councillor', 'speaker'].includes(type.name)
  );

  // Fetch business categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/categories');
      return response.json();
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      phone: string;
      homeAddress: string;
      homeCity: string;
      homePostcode: string;
      businessAddress?: string;
      businessCity?: string;
      businessPostcode?: string;
      businessName?: string;
      businessDescription?: string;
      businessWebsite?: string;
      businessPhone?: string;
      businessEmail?: string;
      businessCategory?: string;
      employeeCount?: string;
      established?: string;
      organizationMemberships?: any[];
      personTypeIds: number[]; 
    }) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "Welcome to Croydon Business Association.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation("/trial-membership");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      homeAddress: formData.homeAddress,
      homeCity: formData.homeCity,
      homePostcode: formData.homePostcode,
      businessAddress: showBusinessAddress ? formData.businessAddress : undefined,
      businessCity: showBusinessAddress ? formData.businessCity : undefined,
      businessPostcode: showBusinessAddress ? formData.businessPostcode : undefined,
      businessName: showBusinessDetails ? formData.businessName : undefined,
      businessDescription: showBusinessDetails ? formData.businessDescription : undefined,
      businessWebsite: showBusinessDetails ? formData.businessWebsite : undefined,
      businessPhone: showBusinessDetails ? formData.businessPhone : undefined,
      businessEmail: showBusinessDetails ? formData.businessEmail : undefined,
      businessCategory: showBusinessDetails ? formData.businessCategory : undefined,
      employeeCount: showBusinessDetails ? formData.employeeCount : undefined,
      established: showBusinessDetails ? formData.established : undefined,
      organizationMemberships: showOrganizationMemberships ? organizationMemberships.filter(org => org.organizationName) : undefined,
      personTypeIds: selectedPersonTypes,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleOrganizationChange = (index: number, field: string, value: string) => {
    setOrganizationMemberships(prev => prev.map((org, i) => 
      i === index ? { ...org, [field]: value } : org
    ));
  };

  const addOrganization = () => {
    setOrganizationMemberships(prev => [...prev, {
      organizationName: '',
      organizationType: '',
      role: '',
      isActive: true,
      description: '',
      contactEmail: '',
      contactPhone: '',
      websiteUrl: ''
    }]);
  };

  const removeOrganization = (index: number) => {
    if (organizationMemberships.length > 1) {
      setOrganizationMemberships(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handlePersonTypeChange = (personTypeId: number, checked: boolean) => {
    setSelectedPersonTypes(prev => {
      const newTypes = checked 
        ? [...prev, personTypeId]
        : prev.filter(id => id !== personTypeId);
      
      // Check if business-related types are selected
      const businessTypes = selfRegisterPersonTypes.filter(type => 
        ['business', 'business_owner'].includes(type.name)
      ).map(type => type.id);
      
      const hasBusinessType = newTypes.some(id => businessTypes.includes(id));
      setShowBusinessAddress(hasBusinessType);
      setShowBusinessDetails(hasBusinessType);
      
      // Check if community group type is selected
      const communityGroupTypes = selfRegisterPersonTypes.filter((type: any) => 
        type.name === 'community_group'
      ).map((type: any) => type.id);
      const hasCommunityGroupType = newTypes.some(id => communityGroupTypes.includes(id));
      setShowOrganizationMemberships(hasCommunityGroupType);
      
      // Check if educator type is selected
      const educatorTypes = selfRegisterPersonTypes.filter((type: any) => 
        type.name === 'educator'
      ).map((type: any) => type.id);
      const hasEducatorType = newTypes.some(id => educatorTypes.includes(id));
      setShowEducatorDetails(hasEducatorType);
      
      return newTypes;
    });
  };

  // Person type icons mapping
  const getPersonTypeIcon = (typeName: string) => {
    const iconMap: Record<string, any> = {
      'attendee': User,
      'business': Building,
      'business_owner': Building,
      'student': GraduationCap,
      'resident': Home,
      'exhibitor': Users,
      'speaker': Mic,
      'volunteer': Heart,
      'vip': Crown,
      'councillor': Users,
      'media': Mic,
      'educator': GraduationCap,
    };
    return iconMap[typeName] || User;
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Join CBA</CardTitle>
          <CardDescription>
            Create your Croydon Business Association account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Smith"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Mobile Phone <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+44 7xxx xxx xxx"
              />
              <p className="text-xs text-gray-500 mt-1">Required for QR code access to events</p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>
            
            {/* Home Address Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Home Address <span className="text-red-500">*</span></Label>
              <Input
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                required
                placeholder="123 Main Street, Apartment 4B"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="homeCity"
                  value={formData.homeCity}
                  onChange={handleChange}
                  required
                  placeholder="Croydon"
                />
                <Input
                  name="homePostcode"
                  value={formData.homePostcode}
                  onChange={handleChange}
                  required
                  placeholder="CR0 1AB"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Person Type Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">I am a: <span className="text-red-500">*</span></Label>
              <p className="text-xs text-gray-500">Select all that apply to you</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {selfRegisterPersonTypes.map((type: any) => {
                  const Icon = getPersonTypeIcon(type.name);
                  return (
                    <div key={type.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={`person-type-${type.id}`}
                        checked={selectedPersonTypes.includes(type.id)}
                        onCheckedChange={(checked) => handlePersonTypeChange(type.id, checked as boolean)}
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <div>
                          <Label 
                            htmlFor={`person-type-${type.id}`} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {type.displayName}
                          </Label>
                          {type.description && (
                            <p className="text-xs text-gray-500">{type.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {selectedPersonTypes.length === 0 && (
                <p className="text-xs text-red-500">Please select at least one option</p>
              )}
            </div>

            {/* Business Details Section - Conditional */}
            {showBusinessDetails && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Business Information</Label>
                </div>
                <p className="text-xs text-gray-500">Since you selected business owner/member, please provide your business details for our directory</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required={showBusinessDetails}
                      placeholder="Your Business Ltd"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessCategory">Category</Label>
                    <select
                      id="businessCategory"
                      name="businessCategory"
                      value={formData.businessCategory}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select category...</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessDescription">Business Description</Label>
                  <Textarea
                    id="businessDescription"
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="Brief description of your business and services..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessPhone">Business Phone</Label>
                    <Input
                      id="businessPhone"
                      name="businessPhone"
                      type="tel"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      placeholder="+44 20 xxxx xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Business Email</Label>
                    <Input
                      id="businessEmail"
                      name="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={handleChange}
                      placeholder="info@yourbusiness.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessWebsite">Business Website</Label>
                  <Input
                    id="businessWebsite"
                    name="businessWebsite"
                    type="url"
                    value={formData.businessWebsite}
                    onChange={handleChange}
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="established">Year Established</Label>
                    <Input
                      id="established"
                      name="established"
                      value={formData.established}
                      onChange={handleChange}
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <select
                      id="employeeCount"
                      name="employeeCount"
                      value={formData.employeeCount}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select size...</option>
                      <option value="1">Just me (1)</option>
                      <option value="2-5">Small (2-5)</option>
                      <option value="6-10">Medium (6-10)</option>
                      <option value="11-50">Growing (11-50)</option>
                      <option value="51-200">Large (51-200)</option>
                      <option value="200+">Enterprise (200+)</option>
                    </select>
                  </div>
                </div>

                {/* Business Address Section */}
                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-medium">Business Address</Label>
                  <Input
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    placeholder="Business address (if different from home)"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      name="businessCity"
                      value={formData.businessCity}
                      onChange={handleChange}
                      placeholder="Croydon"
                    />
                    <Input
                      name="businessPostcode"
                      value={formData.businessPostcode}
                      onChange={handleChange}
                      placeholder="CR0 1AB"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Organization Memberships Section - Conditional */}
            {showOrganizationMemberships && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <Label className="text-lg font-medium">Community Group Memberships</Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOrganization}
                  >
                    Add Organization
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Tell us about the community groups, associations, or organizations you belong to</p>
                
                {organizationMemberships.map((org, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Organization {index + 1}</h4>
                      {organizationMemberships.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrganization(index)}
                          className="text-red-600"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`orgName-${index}`}>Organization Name <span className="text-red-500">*</span></Label>
                        <Input
                          id={`orgName-${index}`}
                          value={org.organizationName}
                          onChange={(e) => handleOrganizationChange(index, 'organizationName', e.target.value)}
                          required
                          placeholder="e.g., Croydon Residents Association"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`orgType-${index}`}>Organization Type <span className="text-red-500">*</span></Label>
                        <select
                          id={`orgType-${index}`}
                          value={org.organizationType}
                          onChange={(e) => handleOrganizationChange(index, 'organizationType', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select type...</option>
                          <option value="community_group">Community Group</option>
                          <option value="residents_association">Residents Association</option>
                          <option value="charity">Charity</option>
                          <option value="ngo">NGO</option>
                          <option value="professional_body">Professional Body</option>
                          <option value="trade_union">Trade Union</option>
                          <option value="sports_club">Sports Club</option>
                          <option value="cultural_group">Cultural Group</option>
                          <option value="religious_organization">Religious Organization</option>
                          <option value="volunteer_group">Volunteer Group</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`role-${index}`}>Your Role <span className="text-red-500">*</span></Label>
                        <select
                          id={`role-${index}`}
                          value={org.role}
                          onChange={(e) => handleOrganizationChange(index, 'role', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select role...</option>
                          <option value="member">Member</option>
                          <option value="committee_member">Committee Member</option>
                          <option value="chair">Chair/President</option>
                          <option value="vice_chair">Vice Chair</option>
                          <option value="secretary">Secretary</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="coordinator">Coordinator</option>
                          <option value="director">Director</option>
                          <option value="trustee">Trustee</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor={`contactEmail-${index}`}>Organization Contact Email</Label>
                        <Input
                          id={`contactEmail-${index}`}
                          type="email"
                          value={org.contactEmail}
                          onChange={(e) => handleOrganizationChange(index, 'contactEmail', e.target.value)}
                          placeholder="contact@organization.org"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`contactPhone-${index}`}>Organization Contact Phone</Label>
                        <Input
                          id={`contactPhone-${index}`}
                          type="tel"
                          value={org.contactPhone}
                          onChange={(e) => handleOrganizationChange(index, 'contactPhone', e.target.value)}
                          placeholder="+44 20 xxxx xxxx"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`website-${index}`}>Organization Website</Label>
                        <Input
                          id={`website-${index}`}
                          type="url"
                          value={org.websiteUrl}
                          onChange={(e) => handleOrganizationChange(index, 'websiteUrl', e.target.value)}
                          placeholder="https://www.organization.org"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${index}`}>Role Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={org.description}
                        onChange={(e) => handleOrganizationChange(index, 'description', e.target.value)}
                        placeholder="Describe your role and activities in this organization..."
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Educator Details Section - Conditional */}
            {showEducatorDetails && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Education Information</Label>
                </div>
                <p className="text-xs text-gray-500">Since you selected educator, please provide your education details</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schoolName">School/Institution Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      required={showEducatorDetails}
                      placeholder="e.g., Croydon High School"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schoolType">Institution Type</Label>
                    <select
                      id="schoolType"
                      name="schoolType"
                      value={formData.schoolType}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select type...</option>
                      <option value="primary">Primary School</option>
                      <option value="secondary">Secondary School</option>
                      <option value="college">College</option>
                      <option value="university">University</option>
                      <option value="vocational">Vocational Training</option>
                      <option value="private">Private Institution</option>
                      <option value="public">Public Institution</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="educatorRole">Your Role <span className="text-red-500">*</span></Label>
                    <select
                      id="educatorRole"
                      name="educatorRole"
                      value={formData.educatorRole}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required={showEducatorDetails}
                    >
                      <option value="">Select role...</option>
                      <option value="teacher">Teacher</option>
                      <option value="head_teacher">Head Teacher</option>
                      <option value="deputy_head">Deputy Head</option>
                      <option value="professor">Professor</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="teaching_assistant">Teaching Assistant</option>
                      <option value="tutor">Tutor</option>
                      <option value="administrator">Administrator</option>
                      <option value="support_staff">Support Staff</option>
                      <option value="supply_teacher">Supply Teacher</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="subjectTaught">Subject/Area Taught</Label>
                    <Input
                      id="subjectTaught"
                      name="subjectTaught"
                      value={formData.subjectTaught}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics, English, Science"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending || selectedPersonTypes.length === 0}
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{" "}
              <Link href="/login">
                <a className="text-primary hover:text-primary-dark font-medium">
                  Sign in here
                </a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}