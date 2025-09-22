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
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, User, Building, GraduationCap, Home, Users, Mic, Heart, Crown } from "lucide-react";
import { formatToE164, isValidPhoneNumber, getPhoneValidationError } from "@/lib/phone-utils";

export default function Register() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
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
    // Trainer details
    trainingSpecialty: "",
    targetAudience: "",
    trainingMethods: "",
    trainingVenue: "",
    certifications: "",
    // Media details
    mediaOutlet: "",
    mediaType: "",
    coverageArea: "",
    socialMediaHandle: "",
    audienceReach: "",
    specialtyBeats: "",
    // Student details
    studyInstitution: "",
    courseOfStudy: "",
    studyLevel: "",
    yearOfStudy: "",
    expectedGraduation: "",
    studyMode: "",
    // Volunteer details
    volunteerSkills: "",
    volunteerAreas: "",
    volunteerAvailability: "",
    volunteerFrequency: "",
    volunteerExperience: "",
    volunteerTimeSlots: "",
    // Dietary information
    dietaryRestrictions: "",
    allergies: "",
    dietaryNotes: "",
    // T-shirt and sizing info
    tshirtSize: "",
    gender: "",
  });
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<number[]>([]);
  const [hasExistingBusiness, setHasExistingBusiness] = useState<boolean | null>(null);
  const [showBusinessAddress, setShowBusinessAddress] = useState(false);
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);
  const [showOrganizationMemberships, setShowOrganizationMemberships] = useState(false);
  const [showEducatorDetails, setShowEducatorDetails] = useState(false);
  const [showTrainerDetails, setShowTrainerDetails] = useState(false);
  const [showMediaDetails, setShowMediaDetails] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [showVolunteerDetails, setShowVolunteerDetails] = useState(false);
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
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [businessPhoneError, setBusinessPhoneError] = useState<string | null>(null);
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
    
    // Validate required fields
    if (!formData.firstName?.trim()) {
      toast({
        title: "First name required",
        description: "Please enter your first name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.lastName?.trim()) {
      toast({
        title: "Last name required", 
        description: "Please enter your last name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone?.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number for event updates and safety notifications.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email?.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    const cleanPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
    if (cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
      toast({
        title: "Invalid phone number",
        description: "Please provide a valid phone number with at least 10 digits.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear phone validation errors when user starts typing
    if (name === 'phone') {
      setPhoneError(null);
    }
    if (name === 'businessPhone') {
      setBusinessPhoneError(null);
    }
  };

  const handlePhoneBlur = (fieldName: 'phone' | 'businessPhone') => {
    const phoneValue = formData[fieldName];
    if (phoneValue) {
      const error = getPhoneValidationError(phoneValue);
      if (fieldName === 'phone') {
        setPhoneError(error);
      } else {
        setBusinessPhoneError(error);
      }
      
      // Auto-format to E.164 if valid
      if (!error) {
        const formatted = formatToE164(phoneValue);
        setFormData(prev => ({ ...prev, [fieldName]: formatted }));
      }
    }
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
      const businessTypes = selfRegisterPersonTypes.filter((type: any) => 
        ['business', 'business_owner'].includes(type.name)
      ).map((type: any) => type.id);
      
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
      
      // Check if trainer type is selected
      const trainerTypes = selfRegisterPersonTypes.filter((type: any) => 
        type.name === 'trainer'
      ).map((type: any) => type.id);
      const hasTrainerType = newTypes.some(id => trainerTypes.includes(id));
      setShowTrainerDetails(hasTrainerType);
      
      // Check if media type is selected
      const mediaTypes = selfRegisterPersonTypes.filter((type: any) => 
        type.name === 'media'
      ).map((type: any) => type.id);
      const hasMediaType = newTypes.some(id => mediaTypes.includes(id));
      setShowMediaDetails(hasMediaType);
      
      // Check if student type is selected
      const studentTypes = selfRegisterPersonTypes.filter((type: any) => 
        type.name === 'student'
      ).map((type: any) => type.id);
      const hasStudentType = newTypes.some(id => studentTypes.includes(id));
      setShowStudentDetails(hasStudentType);
      
      // Check if volunteer type is selected
      const volunteerTypes = selfRegisterPersonTypes.filter((type: any) => 
        type.name === 'volunteer'
      ).map((type: any) => type.id);
      const hasVolunteerType = newTypes.some(id => volunteerTypes.includes(id));
      setShowVolunteerDetails(hasVolunteerType);
      
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
      'trainer': Users,
    };
    return iconMap[typeName] || User;
  };

  // Fill test data function for admin convenience
  const fillTestData = () => {
    if (!user?.isAdmin) return;
    
    const businessType = personTypes.find((type: any) => type.name === 'business');
    const volunteerType = personTypes.find((type: any) => type.name === 'volunteer');
    
    setFormData({
      email: "test.user@example.com",
      password: "TestPassword123",
      confirmPassword: "TestPassword123",
      firstName: "Test",
      lastName: "User",
      phone: "+44 7700 900123",
      homeAddress: "123 Test Street",
      homeCity: "Croydon",
      homePostcode: "CR0 1AA",
      businessAddress: "456 Business Park",
      businessCity: "London",
      businessPostcode: "SW1A 1AA",
      businessName: "Test Business Ltd",
      businessDescription: "A sample business for testing purposes with comprehensive services",
      businessWebsite: "https://www.testbusiness.co.uk",
      businessPhone: "+44 20 7946 0958",
      businessEmail: "info@testbusiness.co.uk",
      businessCategory: categories[0]?.name || "Technology",
      employeeCount: "10-50",
      established: "2020",
      schoolName: "Test Academy",
      educatorRole: "Senior Teacher",
      subjectTaught: "Computer Science",
      schoolType: "Secondary",
      trainingSpecialty: "Digital Skills",
      targetAudience: "Business Professionals",
      trainingMethods: "Workshops and Online",
      trainingVenue: "Flexible",
      certifications: "Microsoft Certified Trainer",
      mediaOutlet: "Tech Weekly",
      mediaType: "Online Publication",
      coverageArea: "Technology & Business",
      socialMediaHandle: "@techweekly",
      audienceReach: "10000+",
      specialtyBeats: "AI, Startups, Tech Policy",
      studyInstitution: "University of London",
      courseOfStudy: "Business Administration",
      studyLevel: "Undergraduate",
      yearOfStudy: "3",
      expectedGraduation: "2025",
      studyMode: "Full-time",
      volunteerSkills: "Event Management, Marketing",
      volunteerAreas: "Community Outreach",
      volunteerAvailability: "Weekends",
      volunteerFrequency: "Monthly",
      volunteerExperience: "2 years with local charities",
      volunteerTimeSlots: "Saturday mornings",
      dietaryRestrictions: "Vegetarian",
      allergies: "None",
      dietaryNotes: "Prefer plant-based options",
      tshirtSize: "M",
      gender: "prefer-not-to-say"
    });
    
    // Set some person types
    const testTypes = [businessType?.id, volunteerType?.id].filter(Boolean);
    if (testTypes.length > 0) {
      setSelectedPersonTypes(testTypes);
      setShowBusinessDetails(businessType ? true : false);
      setShowVolunteerDetails(volunteerType ? true : false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-neutral-900">Join the CBA</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
          <p className="text-center text-sm text-gray-600 mt-2">
            Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-800">Sign in</Link>
          </p>
        </CardHeader>

        <CardContent>
          {/* Admin Fill Data Button */}
          {user?.isAdmin && (
            <div className="mb-4">
              <Button
                type="button"
                variant="outline" 
                onClick={fillTestData}
                className="w-full bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                title="Fill form with test data for testing purposes"
                data-testid="button-fill-data"
              >
                🧪 Fill with Test Data (Admin Only)
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
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
                <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handlePhoneBlur('phone')}
                required
                placeholder="+447564723762 (E.164 format)"
                className={phoneError ? "border-red-500" : ""}
              />
              {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
              <p className="text-xs text-gray-500 mt-1">Enter UK numbers as +447xxxxxxxxx or international E.164 format</p>
            </div>

            {/* Home Address */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Home Address</Label>
              </div>
              
              <div>
                <Label htmlFor="homeAddress">Street Address <span className="text-red-500">*</span></Label>
                <Input
                  id="homeAddress"
                  name="homeAddress"
                  value={formData.homeAddress}
                  onChange={handleChange}
                  required
                  placeholder="123 High Street"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeCity">City <span className="text-red-500">*</span></Label>
                  <Input
                    id="homeCity"
                    name="homeCity"
                    value={formData.homeCity}
                    onChange={handleChange}
                    required
                    placeholder="Croydon"
                  />
                </div>
                <div>
                  <Label htmlFor="homePostcode">Postcode <span className="text-red-500">*</span></Label>
                  <Input
                    id="homePostcode"
                    name="homePostcode"
                    value={formData.homePostcode}
                    onChange={handleChange}
                    required
                    placeholder="CR0 1XX"
                  />
                </div>
              </div>
            </div>

            {/* T-shirt and Gender - Only show if volunteer is selected */}
            {showVolunteerDetails && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tshirtSize">T-shirt Size</Label>
                  <select
                    id="tshirtSize"
                    name="tshirtSize"
                    value={formData.tshirtSize}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select size...</option>
                    <option value="XS">XS (Extra Small)</option>
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="XXL">XXL (2X Large)</option>
                    <option value="XXXL">XXXL (3X Large)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="gender">Gender (for t-shirt fit)</Label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select fit...</option>
                    <option value="male">Male fit</option>
                    <option value="female">Female fit</option>
                    <option value="unisex">Unisex fit</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            )}
            
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessWebsite">Website</Label>
                    <Input
                      id="businessWebsite"
                      name="businessWebsite"
                      type="url"
                      value={formData.businessWebsite}
                      onChange={handleChange}
                      placeholder="https://www.yourbusiness.com"
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
                      <option value="51-250">Large (51-250)</option>
                      <option value="250+">Enterprise (250+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="established">Year Established</Label>
                  <Input
                    id="established"
                    name="established"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    value={formData.established}
                    onChange={handleChange}
                    placeholder="2020"
                  />
                </div>
              </div>
            )}

            {/* Password Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Choose a strong password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending || selectedPersonTypes.length === 0}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}