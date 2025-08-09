import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Mail, Key, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });

  // Fetch all administrators
  const { data: admins, isLoading } = useQuery({
    queryKey: ['/api/admin/users?status=active'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?status=active');
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      // Filter to show only admins
      return users.filter((user: any) => user.isAdmin);
    }
  });

  // Create administrator mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('/api/admin/users/create-admin', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Administrator Created",
        description: data.emailSent 
          ? "Welcome email sent with temporary password" 
          : `Temporary password: ${data.tempPassword}`,
        variant: data.emailSent ? "default" : "warning"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowAddForm(false);
      setFormData({ email: "", firstName: "", lastName: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create administrator",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email domain
    if (!formData.email.endsWith('@croydonba.org.uk')) {
      toast({
        title: "Invalid Email",
        description: "Administrator email must be @croydonba.org.uk domain",
        variant: "destructive"
      });
      return;
    }

    createAdminMutation.mutate(formData);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Administrator Management</h1>
        <p className="text-muted-foreground">
          Manage administrator accounts and permissions
        </p>
      </div>

      {/* Add Administrator Form */}
      {showAddForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Administrator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="admin@croydonba.org.uk"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Must use @croydonba.org.uk domain
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notification
                </h4>
                <p className="text-sm text-blue-800">
                  A welcome email will be sent with a temporary password that must be changed on first login.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createAdminMutation.isPending}>
                  {createAdminMutation.isPending ? "Creating..." : "Create Administrator"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ email: "", firstName: "", lastName: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Administrators List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Administrators
            </CardTitle>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Administrator
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading administrators...</div>
          ) : (
            <div className="space-y-4">
              {admins && admins.length > 0 ? (
                admins.map((admin: any) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {admin.firstName?.[0]}{admin.lastName?.[0]}
                      </div>
                      <div>
                        <div className="font-medium">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {admin.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Key className="h-3 w-3" />
                        {admin.qrHandle || "N/A"}
                      </Badge>
                      {admin.accountStatus === 'active' ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Suspended
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No administrators found
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div className="mt-8 pt-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {admins?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Administrators
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {admins?.filter((a: any) => a.accountStatus === 'active').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Accounts
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  @croydonba.org.uk
                </div>
                <div className="text-sm text-muted-foreground">
                  Required Domain
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}