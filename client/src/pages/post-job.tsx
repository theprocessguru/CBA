import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  jobType: z.enum(["full-time", "part-time", "contract", "freelance", "internship"]),
  workMode: z.enum(["remote", "hybrid", "onsite"]),
  category: z.string().optional(),
  experienceLevel: z.string().optional(),
  salary: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  description: z.string().min(100, "Description must be at least 100 characters"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  applicationEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  applicationUrl: z.string().url("Valid URL required").optional().or(z.literal("")),
  deadline: z.string().optional(),
  isActive: z.boolean().default(true),
});

type JobForm = z.infer<typeof jobSchema>;

export default function PostJob() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showSalaryRange, setShowSalaryRange] = useState(false);
  
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  const { data: business } = useQuery({ queryKey: ["/api/my/business"] });

  const form = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: business?.name || "",
      location: business?.city || "Croydon",
      jobType: "full-time",
      workMode: "onsite",
      category: "",
      experienceLevel: "",
      salary: "",
      description: "",
      requirements: "",
      benefits: "",
      applicationEmail: user?.email || "",
      applicationUrl: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: JobForm) => {
      // Clean up salary data
      const jobData = {
        ...data,
        salaryMin: showSalaryRange ? data.salaryMin : undefined,
        salaryMax: showSalaryRange ? data.salaryMax : undefined,
        salary: !showSalaryRange ? data.salary : undefined,
      };
      return apiRequest("POST", "/api/jobs", jobData);
    },
    onSuccess: (data) => {
      toast({
        title: "Job posted successfully!",
        description: "Your job listing is now live.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      navigate(`/jobs/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Failed to post job",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Login required</h3>
            <p className="text-muted-foreground">Please log in to post a job.</p>
            <Button onClick={() => navigate("/login")} className="mt-4">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/jobs")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Fill in the details below to create your job listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Croydon, London" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full Time</SelectItem>
                          <SelectItem value="part-time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="freelance">Freelance</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Mode *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="hr">Human Resources</SelectItem>
                          <SelectItem value="customer-service">Customer Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={showSalaryRange}
                    onCheckedChange={setShowSalaryRange}
                  />
                  <label className="text-sm font-medium">
                    Use salary range instead of fixed salary
                  </label>
                </div>

                {showSalaryRange ? (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary (£)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30000" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary (£)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. £35,000 - £45,000 or Competitive" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank if you prefer not to disclose
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={8}
                        placeholder="Provide a detailed description of the role, responsibilities, and what you're looking for..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={6}
                        placeholder="List the required skills, experience, and qualifications..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benefits</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        placeholder="List the benefits and perks of working at your company..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicationEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="hr@company.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Where should applications be sent? Leave blank to use built-in applications.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicationUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com/careers/apply" {...field} />
                      </FormControl>
                      <FormDescription>
                        External application link (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/jobs")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Posting..." : "Post Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}