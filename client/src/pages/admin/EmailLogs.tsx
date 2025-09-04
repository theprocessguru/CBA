import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Send, AlertCircle, CheckCircle, Eye, MousePointer, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

interface EmailLog {
  id: number;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  subject: string;
  emailType: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  openedAt: string | null;
  clickedAt: string | null;
  metadata: any;
}

interface EmailStatistics {
  overall: {
    totalEmails: number;
    sentEmails: number;
    failedEmails: number;
    openedEmails: number;
    clickedEmails: number;
  };
  byType: Array<{
    emailType: string;
    totalEmails: number;
    sentEmails: number;
    failedEmails: number;
  }>;
  recentActivity: number;
}

export default function EmailLogs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filters
  const [page, setPage] = useState(1);
  const [emailType, setEmailType] = useState("");
  const [status, setStatus] = useState("");
  const [searchUserId, setSearchUserId] = useState("");
  
  // Fetch email statistics
  const { data: statistics } = useQuery<EmailStatistics>({
    queryKey: ['/api/admin/email/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email/statistics');
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    }
  });

  // Fetch email logs
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['/api/admin/email/logs', { page, emailType, status, userId: searchUserId }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });
      if (emailType && emailType !== 'all') params.append('emailType', emailType);
      if (status && status !== 'all') params.append('status', status);
      if (searchUserId) params.append('userId', searchUserId);
      
      const response = await fetch(`/api/admin/email/logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch email logs');
      return response.json();
    }
  });

  // Mass verification email mutation
  const massVerificationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/email/send-mass-verification');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Mass Verification Complete",
        description: `Successfully sent ${data.totalSent} emails, ${data.totalFailed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/statistics'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send mass verification emails",
        variant: "destructive",
      });
    },
  });

  // Mass verification email to ALL users mutation
  const massVerificationAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/email/send-mass-verification-all');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🎯 Mass Verification Email Sent to ALL Users",
        description: `Successfully sent verification emails to ALL 360 users: ${data.totalSent} sent, ${data.totalFailed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/statistics'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send mass verification emails to all users",
        variant: "destructive",
      });
    },
  });

  // Mass password reset email mutation
  const massPasswordResetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/email/send-mass-password-reset');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🔐 Mass Password Reset Complete",
        description: `Successfully sent ${data.totalSent} password reset emails to users without passwords, ${data.totalFailed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/statistics'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send mass password reset emails",
        variant: "destructive",
      });
    },
  });

  // Mass welcome email mutation
  const massWelcomeEmailMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/email/send-mass-welcome');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "🌐 AI Summit Ad Hoc Email Complete",
        description: `Successfully sent ${data.totalSent} AI Summit emails to all users, ${data.totalFailed} failed`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/logs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email/statistics'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send mass welcome emails",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Sent</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEmailTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      verification: "bg-blue-100 text-blue-800",
      welcome: "bg-green-100 text-green-800",
      password_reset: "bg-yellow-100 text-yellow-800",
      admin_welcome: "bg-purple-100 text-purple-800",
      notification: "bg-gray-100 text-gray-800",
      onboarding: "bg-indigo-100 text-indigo-800",
      general: "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={typeColors[type] || "bg-gray-100 text-gray-800"}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title="Email Management"
        subtitle="Monitor email delivery, track engagement, and manage mass email campaigns"
      />

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.overall.totalEmails}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successfully Sent</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.overall.sentEmails}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.overall.totalEmails > 0 
                  ? `${Math.round((statistics.overall.sentEmails / statistics.overall.totalEmails) * 100)}% success rate`
                  : '0% success rate'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.overall.failedEmails}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opened</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statistics.overall.openedEmails}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.overall.sentEmails > 0 
                  ? `${Math.round((statistics.overall.openedEmails / statistics.overall.sentEmails) * 100)}% open rate`
                  : '0% open rate'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.recentActivity}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Mass Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Mass Email Actions</CardTitle>
          <CardDescription>Send verification emails to users or password reset emails to imported users without passwords</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Send to Unverified Users */}
            <div>
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will send verification emails to all users who haven't verified their email addresses. 
                  Users who were imported without going through the normal registration process will receive verification links.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => massVerificationMutation.mutate()}
                disabled={massVerificationMutation.isPending}
                className="w-full sm:w-auto"
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                {massVerificationMutation.isPending ? "Sending..." : "Send to Unverified Users Only"}
              </Button>
            </div>

            {/* Send to ALL Users */}
            <div className="border-t pt-6">
              <Alert className="mb-4 border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>🎯 Send to ALL 360 users:</strong> This will send verification emails to EVERYONE in the database, 
                  including both verified and unverified users. Use this for important announcements or when you need 
                  to re-verify all accounts.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => massVerificationAllMutation.mutate()}
                disabled={massVerificationAllMutation.isPending}
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {massVerificationAllMutation.isPending ? 'Sending to All Users...' : '🎯 Send Verification Email to ALL 360 Users'}
              </Button>
            </div>

            {/* Send Password Reset Emails */}
            <div className="border-t pt-6">
              <Alert className="mb-4 border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>🔐 Password Reset for Imported Users:</strong> This will send password reset emails to all 337 users 
                  who were imported without passwords. They'll receive secure 24-hour reset links to create their own passwords.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => massPasswordResetMutation.mutate()}
                disabled={massPasswordResetMutation.isPending}
                className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {massPasswordResetMutation.isPending ? "Sending Reset Links..." : "🔐 Send Password Reset Emails"}
              </Button>
            </div>

            {/* Send Ad Hoc Email (AI Summit) */}
            <div className="border-t pt-6">
              <Alert className="mb-4 border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>🌐 AI Summit 2025 Ad Hoc Email:</strong> Send the AI Summit welcome/confirmation email to all active users. 
                  Features keynote speakers (Jim Jordan, Lisa Allen, Saffron Saunders), event details, and registration confirmation.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => massWelcomeEmailMutation.mutate()}
                disabled={massWelcomeEmailMutation.isPending}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {massWelcomeEmailMutation.isPending ? "Sending AI Summit Emails..." : "🌐 Send AI Summit Ad Hoc Email"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Type Statistics */}
      {statistics?.byType && statistics.byType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Email Types</CardTitle>
            <CardDescription>Breakdown of emails by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.byType.map((type) => (
                <div key={type.emailType} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    {getEmailTypeBadge(type.emailType)}
                    <span className="text-lg font-semibold">{type.totalEmails}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {type.sentEmails} sent, {type.failedEmails} failed
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
          <CardDescription>View and filter all emails sent from the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={emailType} onValueChange={setEmailType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
                <SelectItem value="welcome">Welcome</SelectItem>
                <SelectItem value="password_reset">Password Reset</SelectItem>
                <SelectItem value="admin_welcome">Admin Welcome</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search by user ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="w-full sm:w-48"
            />
          </div>

          {/* Email Logs Table */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logsData?.logs ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Engagement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsData.logs.map((log: EmailLog) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.userFirstName} {log.userLastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.userEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.subject}
                        </TableCell>
                        <TableCell>
                          {getEmailTypeBadge(log.emailType)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(log.sentAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {log.openedAt && (
                              <Badge variant="outline" className="text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                Opened
                              </Badge>
                            )}
                            {log.clickedAt && (
                              <Badge variant="outline" className="text-xs">
                                <MousePointer className="w-3 h-3 mr-1" />
                                Clicked
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {logsData.pagination && logsData.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {logsData.pagination.page} of {logsData.pagination.pages} 
                    ({logsData.pagination.total} total emails)
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= logsData.pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No email logs found.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}