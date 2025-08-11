import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, DollarSign, Building, Plus, Search, Filter } from "lucide-react";
import type { JobPosting } from "@shared/schema";

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [category, setCategory] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: user } = useQuery({ queryKey: ["/api/auth/user"] });
  
  const { data: jobs = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/jobs", { search, location, jobType, workMode, category, experienceLevel }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (location) params.append("location", location);
      if (jobType) params.append("jobType", jobType);
      if (workMode) params.append("workMode", workMode);
      if (category) params.append("category", category);
      if (experienceLevel) params.append("experienceLevel", experienceLevel);
      
      const response = await fetch(`/api/jobs?${params}`);
      if (!response.ok) throw new Error("Failed to fetch jobs");
      return response.json();
    },
  });

  const formatSalary = (job: JobPosting) => {
    if (job.salary) return job.salary;
    if (job.salaryMin && job.salaryMax) {
      return `£${job.salaryMin.toLocaleString()} - £${job.salaryMax.toLocaleString()}`;
    }
    if (job.salaryMin) return `From £${job.salaryMin.toLocaleString()}`;
    if (job.salaryMax) return `Up to £${job.salaryMax.toLocaleString()}`;
    return "Competitive";
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getJobTypeBadgeColor = (type: string) => {
    switch (type) {
      case "full-time": return "bg-green-100 text-green-800";
      case "part-time": return "bg-blue-100 text-blue-800";
      case "contract": return "bg-purple-100 text-purple-800";
      case "freelance": return "bg-orange-100 text-orange-800";
      case "internship": return "bg-pink-100 text-pink-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkModeBadgeColor = (mode: string) => {
    switch (mode) {
      case "remote": return "bg-indigo-100 text-indigo-800";
      case "hybrid": return "bg-cyan-100 text-cyan-800";
      case "onsite": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Board</h1>
          <p className="text-muted-foreground mt-2">
            Find your next opportunity within the CBA network
          </p>
        </div>
        {user && (
          <Link href="/jobs/post">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full md:w-40"
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <Select value={jobType} onValueChange={setJobType}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

              <Select value={workMode} onValueChange={setWorkMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Work Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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

              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Jobs List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-muted-foreground mb-3">
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
                          <span>{formatSalary(job)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {job.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={getJobTypeBadgeColor(job.jobType)}>
                          {job.jobType.replace("-", " ")}
                        </Badge>
                        <Badge className={getWorkModeBadgeColor(job.workMode)}>
                          {job.workMode}
                        </Badge>
                        {job.experienceLevel && (
                          <Badge variant="outline">{job.experienceLevel}</Badge>
                        )}
                        {job.category && (
                          <Badge variant="outline">{job.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(job.createdAt)}
                      </p>
                      {job.deadline && (
                        <p className="text-sm text-orange-600 mt-1">
                          Deadline: {formatDate(job.deadline)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* User Links */}
      {user && (
        <div className="flex gap-4 mt-8 pt-8 border-t">
          <Link href="/jobs/my-jobs">
            <Button variant="outline">My Job Postings</Button>
          </Link>
          <Link href="/jobs/applications">
            <Button variant="outline">My Applications</Button>
          </Link>
        </div>
      )}
    </div>
  );
}