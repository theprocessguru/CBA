import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ContentReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Badge,
  BadgeProps,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, Eye, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ContentReports = () => {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState("pending");
  const [reviewingReport, setReviewingReport] = useState<ContentReport | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<ContentReport[]>({
    queryKey: ['/api/admin/content-reports', selectedTab === "all" ? undefined : selectedTab],
    queryFn: () => {
      const params = selectedTab === "all" ? "" : `?status=${selectedTab}`;
      return fetch(`/api/admin/content-reports${params}`).then(res => res.json());
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/admin/content-reports/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content-reports'] });
      setReviewingReport(null);
      setAdminNotes("");
      toast({
        title: "Report Updated",
        description: "The report status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update report",
        variant: "destructive",
      });
    },
  });

  const handleReportAction = (status: string) => {
    if (!reviewingReport) return;

    updateReportMutation.mutate({
      id: reviewingReport.id,
      data: {
        status,
        adminNotes,
      },
    });
  };

  const getStatusBadge = (status: string): { variant: BadgeProps["variant"]; icon: React.ReactNode } => {
    switch (status) {
      case "pending":
        return { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> };
      case "reviewed":
        return { variant: "default", icon: <Eye className="h-3 w-3 mr-1" /> };
      case "resolved":
        return { variant: "default", icon: <CheckCircle className="h-3 w-3 mr-1" /> };
      case "dismissed":
        return { variant: "destructive", icon: <XCircle className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> };
    }
  };

  const getReasonLabel = (reason: string) => {
    const reasons: Record<string, string> = {
      inappropriate: "Inappropriate Content",
      spam: "Spam",
      misleading: "Misleading Information",
      offensive: "Offensive Language",
      other: "Other",
    };
    return reasons[reason] || reason;
  };

  const reportCounts = {
    pending: reports?.filter(r => r.status === "pending").length || 0,
    reviewed: reports?.filter(r => r.status === "reviewed").length || 0,
    resolved: reports?.filter(r => r.status === "resolved").length || 0,
    dismissed: reports?.filter(r => r.status === "dismissed").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 md:px-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Content Reports - Admin - Croydon Business Association</title>
        <meta name="description" content="Review and manage content reports from community members." />
      </Helmet>

      <div className="space-y-6 px-4 md:px-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Content Reports</h1>
            <p className="text-neutral-600">Review and manage reports from community members about inappropriate content.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending" className="relative">
              Pending
              {reportCounts.pending > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                  {reportCounts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed ({reportCounts.reviewed})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({reportCounts.resolved})</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed ({reportCounts.dismissed})</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {reports && reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => {
                  const statusInfo = getStatusBadge(report.status);
                  return (
                    <Card key={report.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Flag className="h-4 w-4 text-red-500" />
                            <CardTitle className="text-lg">
                              {report.contentType.charAt(0).toUpperCase() + report.contentType.slice(1)} Report #{report.id}
                            </CardTitle>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.icon}
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </Badge>
                          </div>
                          <span className="text-sm text-neutral-500">
                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-neutral-700">Reason:</p>
                            <p className="text-sm text-neutral-600">{getReasonLabel(report.reason)}</p>
                          </div>
                          
                          {report.description && (
                            <div>
                              <p className="text-sm font-medium text-neutral-700">Description:</p>
                              <p className="text-sm text-neutral-600">{report.description}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="text-sm text-neutral-500">
                              Content: {report.contentType} ID #{report.contentId}
                            </div>
                            
                            {report.status === "pending" && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    onClick={() => setReviewingReport(report)}
                                  >
                                    Review
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Review Report #{report.id}</DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="adminNotes">Admin Notes</Label>
                                      <Textarea
                                        id="adminNotes"
                                        placeholder="Add notes about your review..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => handleReportAction("resolved")}
                                        disabled={updateReportMutation.isPending}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        Resolve
                                      </Button>
                                      <Button
                                        onClick={() => handleReportAction("dismissed")}
                                        disabled={updateReportMutation.isPending}
                                        variant="outline"
                                        className="flex-1"
                                      >
                                        Dismiss
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>

                          {report.adminNotes && (
                            <div className="pt-3 border-t">
                              <p className="text-sm font-medium text-neutral-700">Admin Notes:</p>
                              <p className="text-sm text-neutral-600">{report.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Flag className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No reports found
                </h3>
                <p className="text-neutral-600">
                  {selectedTab === "pending" 
                    ? "No pending reports to review." 
                    : `No ${selectedTab} reports found.`}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ContentReports;