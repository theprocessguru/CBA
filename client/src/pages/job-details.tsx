import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building, MapPin, DollarSign, Clock, Briefcase, Calendar, Eye, Send } from "lucide-react";
import type { JobPosting } from "@shared/schema";

const applicationSchema = z.object({
  applicantName: z.string().min(1, "Name is required"),
  applicantEmail: z.string().email("Valid email is required"),
  applicantPhone: z.string().optional(),
  coverLetter: z.string().min(100, "Cover letter must be at least 100 characters"),
  linkedinProfile: z.string().url("Valid URL required").optional().or(z.literal("")),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function JobDetails() {
  const [_, params] = useRoute("/jobs/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  
  const jobId = params?.id ? parseInt(params.id) : null;
  
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  
  const { data: job, isLoading } = useQuery<JobPosting>({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !!jobId,
  });

  const { data: applications = [] } = useQuery({
    queryKey: [`/api/jobs/${jobId}/applications`],
    enabled: !!jobId && !!user && job?.userId === user?.id,
  });

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
      applicantEmail: user?.email || "",
      applicantPhone: "",
      coverLetter: "",
      linkedinProfile: "",
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      return apiRequest("POST", `/api/jobs/${jobId}/apply`, data);
    },
    onSuccess: () => {
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
      setShowApplicationDialog(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      toast({
        title: "Job deleted",
        description: "The job posting has been removed.",
      });
      navigate("/jobs");
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete job posting",
        variant: "destructive",
      });
    },
  });

  if (!jobId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p>Invalid job ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Job not found</h3>
            <p className="text-muted-foreground">This job posting may have been removed or expired.</p>
            <Button onClick={() => navigate("/jobs")} className="mt-4">
              Back to Jobs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatSalary = () => {
    if (job.salary) return job.salary;
    if (job.salaryMin && job.salaryMax) {
      return `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()} per year`;
    }
    if (job.salaryMin) return `From £${job.salaryMin.toLocaleString()} per year`;
    if (job.salaryMax) return `Up to £${job.salaryMax.toLocaleString()} per year`;
    return "Competitive salary";
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isOwner = user && job.userId === user.id;
  const canApply = user && !isOwner;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/jobs")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
              <CardDescription className="text-base">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary()}</span>
                  </div>
                  {job.views > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{job.views} views</span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/jobs/${job.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this job posting?")) {
                      deleteMutation.mutate();
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">
              {job.jobType.replace("-", " ")}
            </Badge>
            <Badge variant="secondary">
              {job.workMode}
            </Badge>
            {job.experienceLevel && (
              <Badge variant="outline">{job.experienceLevel}</Badge>
            )}
            {job.category && (
              <Badge variant="outline">{job.category}</Badge>
            )}
            {job.tags && job.tags.map((tag, index) => (
              <Badge key={index} variant="outline">{tag}</Badge>
            ))}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Job Description</h3>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requirements && (
            <div>
              <h3 className="font-semibold mb-2">Requirements</h3>
              <p className="whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}

          {job.benefits && (
            <div>
              <h3 className="font-semibold mb-2">Benefits</h3>
              <p className="whitespace-pre-wrap">{job.benefits}</p>
            </div>
          )}

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p>
              <Calendar className="w-4 h-4 inline mr-1" />
              Posted on {formatDate(job.createdAt)}
            </p>
            {job.deadline && (
              <p className="text-orange-600 mt-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Application deadline: {formatDate(job.deadline)}
              </p>
            )}
          </div>

          {canApply && (
            <div className="flex gap-4">
              {job.applicationUrl && (
                <Button asChild>
                  <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                    Apply on Company Website
                  </a>
                </Button>
              )}
              {job.applicationEmail && (
                <Button asChild variant={job.applicationUrl ? "outline" : "default"}>
                  <a href={`mailto:${job.applicationEmail}?subject=Application for ${job.title}`}>
                    Apply via Email
                  </a>
                </Button>
              )}
              {!job.applicationUrl && !job.applicationEmail && (
                <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg">
                      <Send className="w-4 h-4 mr-2" />
                      Apply Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        Submit your application to {job.company}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => applyMutation.mutate(data))} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="applicantName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="applicantEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="applicantPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="linkedinProfile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>LinkedIn Profile (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coverLetter"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Letter</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={8}
                                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowApplicationDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={applyMutation.isPending}>
                            {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {isOwner && applications.length > 0 && (
            <div>
              <Separator className="my-6" />
              <h3 className="font-semibold mb-4">Applications ({applications.length})</h3>
              <Button onClick={() => navigate(`/jobs/${job.id}/applications`)}>
                View Applications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}