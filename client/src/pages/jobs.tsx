import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Calendar,
  Building,
  Search,
  Filter,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  workMode: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  applicationEmail?: string;
  applicationUrl?: string;
  deadline?: string;
  isActive: boolean;
  views: number;
  createdAt: string;
  category?: string;
  experienceLevel?: string;
  tags?: string[];
}

interface JobApplication {
  jobId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  coverLetter?: string;
  cvData?: string;
  cvFileName?: string;
  cvFileType?: string;
  linkedinProfile?: string;
}

export default function Jobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [workModeFilter, setWorkModeFilter] = useState("");
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applicationForm, setApplicationForm] = useState<JobApplication>({
    jobId: 0,
    applicantName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
    applicantEmail: user?.email || "",
    applicantPhone: "",
    coverLetter: "",
    linkedinProfile: "",
  });

  // Fetch jobs
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Submit job application
  const applyMutation = useMutation({
    mutationFn: async (application: JobApplication) => {
      return apiRequest("POST", `/api/jobs/${application.jobId}/apply`, application);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your job application has been submitted successfully!",
      });
      setIsApplyDialogOpen(false);
      setCvFile(null);
      setApplicationForm({
        jobId: 0,
        applicantName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "",
        applicantEmail: user?.email || "",
        applicantPhone: "",
        coverLetter: "",
        linkedinProfile: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs/my-applications"] });
    },
    onError: () => {
      toast({
        title: "Application Failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle CV file upload
  const handleCvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "CV file must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }

      setCvFile(file);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setApplicationForm(prev => ({
          ...prev,
          cvData: base64String.split(",")[1], // Remove data:type;base64, prefix
          cvFileName: file.name,
          cvFileType: file.type,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open application dialog
  const handleApplyClick = (job: Job) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply for jobs",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedJob(job);
    setApplicationForm(prev => ({
      ...prev,
      jobId: job.id,
    }));
    setIsApplyDialogOpen(true);
  };

  // Submit application
  const handleSubmitApplication = () => {
    if (!applicationForm.applicantName || !applicationForm.applicantEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate(applicationForm);
  };

  // Filter jobs
  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesJobType = !jobTypeFilter || jobTypeFilter === "all" || job.jobType === jobTypeFilter;
    const matchesWorkMode = !workModeFilter || workModeFilter === "all" || job.workMode === workModeFilter;
    
    return matchesSearch && matchesLocation && matchesJobType && matchesWorkMode && job.isActive;
  });

  const formatSalary = (job: Job) => {
    if (job.salary) return job.salary;
    if (job.salaryMin && job.salaryMax) {
      return `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) return `From £${job.salaryMin.toLocaleString()}`;
    if (job.salaryMax) return `Up to £${job.salaryMax.toLocaleString()}`;
    return "Competitive";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
        <p className="text-gray-600">Find your next career opportunity</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Input
              placeholder="Location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            
            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="temporary">Temporary</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Work Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="on-site">On-site</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs?.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="capitalize">
                  {job.jobType.replace("-", " ")}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {job.workMode}
                </Badge>
              </div>
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-1 mb-1">
                  <Building className="h-3 w-3" />
                  {job.company}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </div>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>{formatSalary(job)}</span>
                </div>
                
                {job.experienceLevel && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="capitalize">{job.experienceLevel} Level</span>
                  </div>
                )}
                
                {job.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Apply by {format(new Date(job.deadline), "MMM d, yyyy")}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Posted {format(new Date(job.createdAt), "MMM d")}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                {job.description}
              </p>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleApplyClick(job)}
              >
                Apply Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredJobs?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      )}

      {/* Application Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              at {selectedJob?.company} · {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={applicationForm.applicantName}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantName: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={applicationForm.applicantEmail}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantEmail: e.target.value }))}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={applicationForm.applicantPhone}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, applicantPhone: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>
              
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={applicationForm.linkedinProfile}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, linkedinProfile: e.target.value }))}
                  placeholder="linkedin.com/in/yourprofile"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cv">Upload CV (PDF or Word, max 5MB)</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="cv"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCvUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {cvFile ? cvFile.name : "Choose CV File"}
                </Button>
                {cvFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    CV uploaded successfully
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                value={applicationForm.coverLetter}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                placeholder="Tell us why you're interested in this position..."
                rows={6}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitApplication}
              disabled={applyMutation.isPending}
            >
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}