import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Upload, Database, Users, Building, AlertTriangle, CheckCircle2, Loader2, ExternalLink, Download, FileSpreadsheet, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BulkSyncResults {
  totalUsers: number;
  totalSpeakers: number;
  totalExhibitors: number;
  totalAttendees: number;
  totalBusinesses: number;
  successfulSyncs: number;
  failedSyncs: number;
  errors: string[];
}

interface BulkSyncResponse {
  message: string;
  results: BulkSyncResults;
}

interface DatabaseStats {
  totalUsers: number;
  totalAttendees: number;
  totalSpeakers: number;
  totalExhibitors: number;
  totalBusinesses: number;
}

export default function BulkSync() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [syncResults, setSyncResults] = useState<BulkSyncResults | null>(null);

  // Get database stats
  const { data: dbStats, isLoading: statsLoading } = useQuery<DatabaseStats>({
    queryKey: ['/api/admin/database-stats'],
  });

  // Bulk sync mutation
  const bulkSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/myt-automation/bulk-sync');
      return await response.json();
    },
    onSuccess: (data: BulkSyncResponse) => {
      setSyncResults(data.results);
      toast({
        title: "Bulk Sync Completed!",
        description: `Successfully synced ${data.results.successfulSyncs} contacts to MYT Automation.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Sync Failed",
        description: error.message || "An error occurred during bulk sync",
        variant: "destructive",
      });
    },
  });

  const totalRecords = dbStats ? 
    (dbStats.totalUsers || 0) + 
    (dbStats.totalAttendees || 0) + 
    (dbStats.totalSpeakers || 0) + 
    (dbStats.totalExhibitors || 0) + 
    (dbStats.totalBusinesses || 0) : 0;

  const progressPercentage = syncResults 
    ? Math.round(((syncResults.successfulSyncs + syncResults.failedSyncs) / Math.max(totalRecords, 1)) * 100)
    : 0;

  // Export handlers
  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export/${type}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cba_${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `Successfully exported ${type} data as CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to export ${type} data`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MYT Automation Bulk Sync</h1>
          <p className="text-muted-foreground">
            Transfer all existing data to MYT Automation for centralized management
          </p>
        </div>
      </div>

      {/* Current Database Stats */}
      <Card className="mb-6" data-testid="card-database-stats">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Database Overview
          </CardTitle>
          <CardDescription>
            Overview of data that will be synced to MYT Automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600" data-testid="text-total-users">
                  {dbStats?.totalUsers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-attendees">
                  {dbStats?.totalAttendees || 0}
                </div>
                <div className="text-sm text-muted-foreground">Attendees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600" data-testid="text-total-speakers">
                  {dbStats?.totalSpeakers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Speakers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600" data-testid="text-total-exhibitors">
                  {dbStats?.totalExhibitors || 0}
                </div>
                <div className="text-sm text-muted-foreground">Exhibitors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600" data-testid="text-total-businesses">
                  {dbStats?.totalBusinesses || 0}
                </div>
                <div className="text-sm text-muted-foreground">Businesses</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export Card */}
      <Card className="mb-6" data-testid="card-data-export">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Data to CSV
          </CardTitle>
          <CardDescription>
            Download your data as CSV files for backup or import into other systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={() => handleExport('users')}
                variant="outline"
                className="justify-start"
                disabled={!dbStats?.totalUsers}
                data-testid="button-export-users"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Users ({dbStats?.totalUsers || 0})
              </Button>
              
              <Button
                onClick={() => handleExport('ai-summit')}
                variant="outline"
                className="justify-start"
                disabled={!dbStats?.totalAttendees}
                data-testid="button-export-ai-summit"
              >
                <Download className="h-4 w-4 mr-2" />
                Export AI Summit ({dbStats?.totalAttendees || 0})
              </Button>
              
              <Button
                onClick={() => handleExport('speakers')}
                variant="outline"
                className="justify-start"
                disabled={!dbStats?.totalSpeakers}
                data-testid="button-export-speakers"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Speakers ({dbStats?.totalSpeakers || 0})
              </Button>
              
              <Button
                onClick={() => handleExport('exhibitors')}
                variant="outline"
                className="justify-start"
                disabled={!dbStats?.totalExhibitors}
                data-testid="button-export-exhibitors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Exhibitors ({dbStats?.totalExhibitors || 0})
              </Button>
              
              <Button
                onClick={() => handleExport('businesses')}
                variant="outline"
                className="justify-start"
                disabled={!dbStats?.totalBusinesses}
                data-testid="button-export-businesses"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Businesses ({dbStats?.totalBusinesses || 0})
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <Button
                onClick={() => handleExport('all')}
                className="w-full md:w-auto"
                size="lg"
                disabled={!totalRecords}
                data-testid="button-export-all"
              >
                <Package className="h-4 w-4 mr-2" />
                Export All Data ({totalRecords} records)
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Downloads a combined CSV with all users, registrations, speakers, and businesses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Action Card */}
      <Card className="mb-6" data-testid="card-sync-action">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Data Transfer
          </CardTitle>
          <CardDescription>
            This will transfer all existing data to MYT Automation with proper tags and custom fields
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>What this sync does:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Transfers all {totalRecords} records to MYT Automation</li>
                <li>Applies proper tags (CBA Member, AI Summit 2025, Speaker, etc.)</li>
                <li>Adds custom fields for complete data mapping</li>
                <li>Triggers automated workflows for speakers and exhibitors</li>
                <li>Updates existing contacts without creating duplicates</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => bulkSyncMutation.mutate()}
              disabled={bulkSyncMutation.isPending || !totalRecords}
              size="lg"
              data-testid="button-start-sync"
            >
              {bulkSyncMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {bulkSyncMutation.isPending ? "Syncing..." : "Start Bulk Sync"}
            </Button>
            
            {totalRecords === 0 && (
              <Badge variant="secondary">No data to sync</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Progress */}
      {(bulkSyncMutation.isPending || syncResults) && (
        <Card className="mb-6" data-testid="card-sync-progress">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {bulkSyncMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
              Sync Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bulkSyncMutation.isPending ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg font-medium">Syncing data to MYT Automation...</div>
                  <div className="text-sm text-muted-foreground">
                    This may take several minutes depending on the amount of data
                  </div>
                </div>
                <Progress value={50} className="w-full" />
              </div>
            ) : syncResults && (
              <div className="space-y-4">
                <Progress value={progressPercentage} className="w-full" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-600" data-testid="text-successful-syncs">
                      {syncResults.successfulSyncs}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-red-600" data-testid="text-failed-syncs">
                      {syncResults.failedSyncs}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600" data-testid="text-total-processed">
                      {syncResults.successfulSyncs + syncResults.failedSyncs}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Processed</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-purple-600" data-testid="text-completion-rate">
                      {progressPercentage}%
                    </div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Report */}
      {syncResults && syncResults.errors.length > 0 && (
        <Card className="mb-6" data-testid="card-error-report">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Sync Errors ({syncResults.errors.length})
            </CardTitle>
            <CardDescription>
              The following records failed to sync. You may need to manually review these.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {syncResults.errors.map((error, index) => (
                  <div key={index} className="text-sm bg-red-50 dark:bg-red-950 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Success Message & Next Steps */}
      {syncResults && syncResults.failedSyncs === 0 && (
        <Card className="border-green-200 dark:border-green-800" data-testid="card-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              Sync Completed Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700 dark:text-green-300">
                All {syncResults.successfulSyncs} records have been successfully transferred to MYT Automation. 
                You can now manage all your contacts, workflows, and communications from one central location.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <a 
                    href="https://app.gohighlevel.com/v2/location/contacts" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-testid="link-view-contacts"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Contacts in MYT Automation
                  </a>
                </Button>
                
                <Button variant="outline" onClick={() => navigate("/admin")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}