import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  });
  const [selectedPersonTypes, setSelectedPersonTypes] = useState<number[]>([]);
  const [hasExistingBusiness, setHasExistingBusiness] = useState<boolean | null>(null);
  const [showBusinessAddress, setShowBusinessAddress] = useState(false);
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
      personTypeIds: selectedPersonTypes,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
            
            {/* Business Address Section - Conditional */}
            {showBusinessAddress && (
              <div className="space-y-3 border-t pt-4">
                <Label className="text-sm font-medium">Business Address</Label>
                <p className="text-xs text-gray-500">Since you selected business owner/member, please provide your business address</p>
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
            )}
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