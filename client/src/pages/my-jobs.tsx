import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Users, Calendar, Briefcase } from "lucide-react";
import type { JobPosting } from "@shared/schema";

export default function MyJobs() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  
  const { data: jobs = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/my-jobs"],
    enabled: !!user,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiRequest("PUT", `/api/jobs/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      toast({
        title: "Job status updated",
        description: "The job posting status has been changed.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update job status",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      toast({
        title: "Job deleted",
        description: "The job posting has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete job posting",
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
            <p className="text-muted-foreground">Please log in to view your job postings.</p>
            <Button onClick={() => navigate("/login")} className="mt-4">
              Go to Login
            </Button>
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
          <p className="mt-4 text-muted-foreground">Loading your job postings...</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/jobs")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Job Postings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your job listings and view applications
          </p>
        </div>
        <Link href="/jobs/post">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No job postings yet</h3>
            <p className="text-muted-foreground mb-4">
              Start hiring by posting your first job opening.
            </p>
            <Link href="/jobs/post">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Job
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription>
                      {job.company} • {job.location}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground mr-2">
                      {job.isActive ? "Active" : "Inactive"}
                    </label>
                    <Switch
                      checked={job.isActive}
                      onCheckedChange={(checked) => 
                        toggleActiveMutation.mutate({ id: job.id, isActive: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">
                    {job.jobType.replace("-", " ")}
                  </Badge>
                  <Badge variant="outline">
                    {job.workMode}
                  </Badge>
                  {job.category && (
                    <Badge variant="outline">{job.category}</Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="outline">{job.experienceLevel}</Badge>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {formatDate(job.createdAt)}</span>
                  </div>
                  {job.views > 0 && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{job.views} views</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline: {formatDate(job.deadline)}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>

                <div className="flex gap-2">
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/jobs/${job.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/jobs/${job.id}/applications`}>
                    <Button variant="outline" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Applications
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this job posting?")) {
                        deleteMutation.mutate(job.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}