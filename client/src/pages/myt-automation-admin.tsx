import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, XCircle, Users, RefreshCw, TestTube } from "lucide-react";
import { Helmet } from "react-helmet";

export default function MyTAutomationAdmin() {
  const { toast } = useToast();
  const [syncEmail, setSyncEmail] = useState("");
  const [syncBusinessName, setSyncBusinessName] = useState("");

  // Test MyT Automation connection
  const { data: connectionStatus, isLoading: testingConnection, refetch: testConnection } = useQuery({
    queryKey: ["/api/ghl/test-connection"],
    enabled: false,
  });

  // Type the connection status response
  const connectionData = connectionStatus as { message?: string } | undefined;

  // Sync member mutation
  const syncMemberMutation = useMutation({
    mutationFn: async (data: { email: string; businessName?: string }) => {
      const response = await apiRequest("POST", "/api/ghl/sync-member", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Member Synced Successfully",
        description: `Member synced to MyT Automation. Contact ID: ${data.ghlContactId}`,
      });
      setSyncEmail("");
      setSyncBusinessName("");
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync member to MyT Automation",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = () => {
    testConnection();
  };

  const handleSyncMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncEmail) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to sync",
        variant: "destructive",
      });
      return;
    }
    syncMemberMutation.mutate({ 
      email: syncEmail, 
      businessName: syncBusinessName || undefined 
    });
  };

  return (
    <>
      <Helmet>
        <title>MyT Automation Integration Admin - CBA</title>
        <meta name="description" content="Manage MyT Automation integration settings and sync data for Croydon Business Association." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MyT Automation Integration</h1>
          <p className="text-lg text-gray-600">Manage your MyT Automation connection and sync data</p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connectionData?.message ? (
                  connectionData.message.includes("successful") ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <Badge variant="destructive">
                        Connection Failed
                      </Badge>
                    </>
                  )
                ) : (
                  <>
                    <div className="h-5 w-5 rounded-full bg-gray-400" />
                    <Badge variant="secondary">
                      Not Tested
                    </Badge>
                  </>
                )}
                <span className="text-sm text-gray-600">
                  {connectionData?.message || "Click test to check connection"}
                </span>
              </div>
              <Button 
                onClick={handleTestConnection}
                disabled={testingConnection}
                size="sm"
              >
                {testingConnection ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Member Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Manual Member Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSyncMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="syncEmail">Email Address *</Label>
                  <Input
                    id="syncEmail"
                    type="email"
                    value={syncEmail}
                    onChange={(e) => setSyncEmail(e.target.value)}
                    placeholder="member@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="syncBusinessName">Business Name (Optional)</Label>
                  <Input
                    id="syncBusinessName"
                    type="text"
                    value={syncBusinessName}
                    onChange={(e) => setSyncBusinessName(e.target.value)}
                    placeholder="Business Name"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={syncMemberMutation.isPending}
                className="w-full md:w-auto"
              >
                {syncMemberMutation.isPending ? "Syncing..." : "Sync Member to GHL"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Integration Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Integration Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Automatic Sync Events</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI Summit registrations</li>
                  <li>• Exhibitor applications</li>
                  <li>• Speaker applications</li>
                  <li>• New member signups</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">GHL Contact Data</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Contact information</li>
                  <li>• Event-specific tags</li>
                  <li>• Custom field mapping</li>
                  <li>• Business details</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-900 mb-2">Integration Active</h3>
              <p className="text-sm text-blue-700">
                GHL integration is configured and ready. All new registrations and applications 
                will automatically sync to your GoHighLevel account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}