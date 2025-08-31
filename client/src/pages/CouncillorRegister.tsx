import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Crown, Building2 } from "lucide-react";

export default function CouncillorRegister() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    title: "",
    council: "",
    ward: "",
    constituency: "",
    homeAddress: "",
    homeCity: "",
    homePostcode: "",
    officeAddress: "",
    officeCity: "",
    officePostcode: "",
    bio: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (data: { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
      phone: string;
      title: string;
      council: string;
      ward: string;
      constituency: string;
      homeAddress: string;
      homeCity: string;
      homePostcode: string;
      officeAddress: string;
      officeCity: string;
      officePostcode: string;
      bio: string;
    }) => {
      const response = await apiRequest("POST", "/api/auth/register-councillor", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Councillor account created!",
        description: "Welcome to Croydon Business Association. Your account is being reviewed.",
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
      title: formData.title,
      council: formData.council,
      ward: formData.ward,
      constituency: formData.constituency,
      homeAddress: formData.homeAddress,
      homeCity: formData.homeCity,
      homePostcode: formData.homePostcode,
      officeAddress: formData.officeAddress,
      officeCity: formData.officeCity,
      officePostcode: formData.officePostcode,
      bio: formData.bio,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Crown className="h-8 w-8 text-primary" />
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Councillor Registration</CardTitle>
          <CardDescription>
            Register as a local councillor with Croydon Business Association
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Details */}
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

            {/* Contact Information */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="councillor@croydon.gov.uk"
              />
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

            {/* Official Position */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Official Position</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Councillor"
                  />
                </div>
                <div>
                  <Label htmlFor="council">Council <span className="text-red-500">*</span></Label>
                  <Input
                    id="council"
                    name="council"
                    value={formData.council}
                    onChange={handleChange}
                    required
                    placeholder="Croydon Council"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    placeholder="e.g., Broad Green"
                  />
                </div>
                <div>
                  <Label htmlFor="constituency">Constituency</Label>
                  <Input
                    id="constituency"
                    name="constituency"
                    value={formData.constituency}
                    onChange={handleChange}
                    placeholder="e.g., Croydon Central"
                  />
                </div>
              </div>
            </div>

            {/* Home Address */}
            <div className="space-y-3 border-t pt-4">
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

            {/* Office Address */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-sm font-medium">Office Address</Label>
              <Input
                name="officeAddress"
                value={formData.officeAddress}
                onChange={handleChange}
                placeholder="Official council office address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="officeCity"
                  value={formData.officeCity}
                  onChange={handleChange}
                  placeholder="Croydon"
                />
                <Input
                  name="officePostcode"
                  value={formData.officePostcode}
                  onChange={handleChange}
                  placeholder="CR0 1AB"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio & Role</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief description of your role and how you support local businesses..."
                className="min-h-[100px]"
              />
            </div>

            {/* Password Fields */}
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
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Register as Councillor"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Not a councillor?{" "}
              <Link href="/register">
                <a className="text-primary hover:text-primary-dark font-medium">
                  Register as general member
                </a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}