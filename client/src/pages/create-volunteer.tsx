import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, GraduationCap, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';

export default function CreateVolunteerPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qrHandle: '',
    university: '',
    studentId: '',
    course: '',
    yearOfStudy: '',
    communityRole: '',
    volunteerExperience: '',
    bio: ''
  });

  const { toast } = useToast();

  const createVolunteerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/create-volunteer-user', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Volunteer Created Successfully!",
        description: `QR Handle: ${data.user.qrHandle}`,
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        qrHandle: '',
        university: '',
        studentId: '',
        course: '',
        yearOfStudy: '',
        communityRole: '',
        volunteerExperience: '',
        bio: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Could not create volunteer profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in first name, last name, and email",
        variant: "destructive",
      });
      return;
    }

    // Generate QR handle if not provided
    if (!formData.qrHandle) {
      const handle = `VOLUNTEER-${formData.firstName.toUpperCase()}-${Date.now()}`;
      setFormData(prev => ({ ...prev, qrHandle: handle }));
      createVolunteerMutation.mutate({ ...formData, qrHandle: handle });
    } else {
      createVolunteerMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Create Volunteer Profile - CBA</title>
        <meta name="description" content="Create a volunteer profile for event participation" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-8 w-8 text-blue-600" />
              Create Volunteer Profile
            </h1>
            <p className="text-gray-600 mt-2">Create a new volunteer profile for event scanning and tracking</p>
          </div>
          <Link href="/test-qr-codes">
            <Button variant="outline">
              View Test QR Codes
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Volunteer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="volunteer@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="07123 456789"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qrHandle">QR Handle (Optional)</Label>
                <Input
                  id="qrHandle"
                  value={formData.qrHandle}
                  onChange={(e) => handleInputChange('qrHandle', e.target.value)}
                  placeholder="Leave blank to auto-generate"
                />
                <p className="text-xs text-gray-500">
                  This will be the scannable ID for events. If left blank, one will be generated automatically.
                </p>
              </div>

              {/* Student/University Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Student Information (if applicable)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">University/Institution</Label>
                    <Input
                      id="university"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      placeholder="e.g., London South Bank University"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => handleInputChange('studentId', e.target.value)}
                      placeholder="e.g., LSBU12345"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course/Subject</Label>
                    <Input
                      id="course"
                      value={formData.course}
                      onChange={(e) => handleInputChange('course', e.target.value)}
                      placeholder="e.g., Computer Science, Business Management"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearOfStudy">Year of Study</Label>
                    <Select value={formData.yearOfStudy} onValueChange={(value) => handleInputChange('yearOfStudy', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                        <SelectItem value="Masters">Masters</SelectItem>
                        <SelectItem value="PhD">PhD</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Volunteer Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Volunteer Details</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="communityRole">Community Role</Label>
                    <Input
                      id="communityRole"
                      value={formData.communityRole}
                      onChange={(e) => handleInputChange('communityRole', e.target.value)}
                      placeholder="e.g., Student Volunteer, Community Helper, Event Assistant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="volunteerExperience">Volunteer Experience</Label>
                    <Textarea
                      id="volunteerExperience"
                      value={formData.volunteerExperience}
                      onChange={(e) => handleInputChange('volunteerExperience', e.target.value)}
                      placeholder="Describe any previous volunteer experience or skills..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Brief description about yourself..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <Button 
                  type="submit" 
                  disabled={createVolunteerMutation.isPending}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {createVolunteerMutation.isPending ? 'Creating Profile...' : 'Create Volunteer Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Fill out the volunteer information form above</li>
              <li>Click "Create Volunteer Profile" to generate the volunteer user</li>
              <li>The system will create a unique QR handle for scanning</li>
              <li>Visit the <Link href="/test-qr-codes" className="text-blue-600 hover:underline">Test QR Codes</Link> page to see the scannable code</li>
              <li>Use the <Link href="/organizer-scanner" className="text-blue-600 hover:underline">Organizer Scanner</Link> to test scanning functionality</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}