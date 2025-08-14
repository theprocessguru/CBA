import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  appliedAt: string;
  reviewedAt?: string;
  cvFileName?: string;
}

export default function MyApplications() {
  const { user } = useAuth();

  // Fetch user's applications
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/jobs/my-applications"],
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "reviewed":
        return <Eye className="h-4 w-4" />;
      case "shortlisted":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "hired":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "reviewed":
        return "secondary";
      case "shortlisted":
        return "success";
      case "rejected":
        return "destructive";
      case "hired":
        return "success";
      default:
        return "default";
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Login Required</h3>
            <p className="text-gray-600 mb-4">Please login to view your job applications</p>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Job Applications</h1>
        <p className="text-gray-600">Track the status of your job applications</p>
      </div>

      {applications && applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
                    <CardDescription>{application.company}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(application.status) as any} className="capitalize">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(application.status)}
                      {application.status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Applied: {format(new Date(application.appliedAt), "MMM d, yyyy")}</span>
                  </div>
                  
                  {application.reviewedAt && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span>Reviewed: {format(new Date(application.reviewedAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  
                  {application.cvFileName && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>CV: {application.cvFileName}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link href="/jobs">
                    <Button variant="outline" size="sm">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Job
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">You haven't applied to any jobs yet</p>
            <Link href="/jobs">
              <Button>
                Browse Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}