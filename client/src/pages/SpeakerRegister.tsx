import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, Mic, Presentation } from "lucide-react";

export default function SpeakerRegister() {
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
    jobTitle: "",
    company: "",
    bio: "",
    // Speaker profile fields only (NO session data)
    websiteUrl: "",
    linkedinUrl: "",
    speakingExperience: "",
    previousSpeakingEngagements: "",
    availableSlots: "", // When they're available to speak
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/auth/register-speaker-profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Speaker application submitted!",
        description: "Thank you for applying to speak. We'll review your application and get back to you soon.",
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

    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Mic className="h-8 w-8 text-primary" />
            <Presentation className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Speaker Registration</CardTitle>
          <CardDescription>
            Apply to speak at Croydon Business Association events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="speaker@example.com"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                    placeholder="CEO, Expert, Consultant..."
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company/Organization</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="Your company name"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Address</h3>
              <Input
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                required
                placeholder="Full address"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="homeCity"
                  value={formData.homeCity}
                  onChange={handleChange}
                  required
                  placeholder="City"
                />
                <Input
                  name="homePostcode"
                  value={formData.homePostcode}
                  onChange={handleChange}
                  required
                  placeholder="Postcode"
                />
              </div>
            </div>

            {/* Speaker Profile (NO session data) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Speaker Profile</h3>
              
              <div>
                <Label htmlFor="speakingExperience">Speaking Experience</Label>
                <Textarea
                  id="speakingExperience"
                  name="speakingExperience"
                  value={formData.speakingExperience}
                  onChange={handleChange}
                  placeholder="Describe your speaking experience, previous engagements, and relevant expertise..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="previousSpeakingEngagements">Previous Speaking Engagements</Label>
                <Textarea
                  id="previousSpeakingEngagements"
                  name="previousSpeakingEngagements"
                  value={formData.previousSpeakingEngagements}
                  onChange={handleChange}
                  placeholder="List notable conferences, events, or organizations where you've spoken..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="availableSlots">Available Time Slots</Label>
                <Textarea
                  id="availableSlots"
                  name="availableSlots"
                  value={formData.availableSlots}
                  onChange={handleChange}
                  placeholder="When are you available to speak? (e.g., weekday mornings, Friday afternoons, specific dates...)"
                  className="min-h-[60px]"
                />
              </div>
            </div>

            {/* Online Presence */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Online Presence</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                placeholder="Brief professional biography highlighting your expertise and credentials..."
                className="min-h-[100px]"
              />
            </div>

            {/* Password Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Account Security</h3>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Submitting application..." : "Apply to Speak"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Not applying to speak?{" "}
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