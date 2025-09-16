import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Mail, Key, CheckCircle, XCircle, Edit2, Trash2, MoreVertical, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });
  const [editFormData, setEditFormData] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });

  // Fetch all administrators
  const { data: admins, isLoading } = useQuery({
    queryKey: ['/api/admin/users?status=active'],
    queryFn: async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add auth token if available (for Replit environment)
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('/api/admin/users?status=active', {
        credentials: 'include',
        headers,
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      // Filter to show only admins
      return users.filter((user: any) => user.isAdmin);
    }
  });

  // Create administrator mutation
  const createAdminMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/admin/users/create-admin', data);
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

  // Edit administrator mutation
  const editAdminMutation = useMutation({
    mutationFn: async (data: { userId: string; updates: typeof editFormData }) => {
      return apiRequest('PUT', `/api/admin/users/${data.userId}/edit`, data.updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Administrator details updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowEditDialog(false);
      setSelectedAdmin(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update administrator",
        variant: "destructive"
      });
    }
  });

  // Delete administrator mutation
  const deleteAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      toast({
        title: "Administrator Removed",
        description: "Administrator privileges have been revoked"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowDeleteDialog(false);
      setSelectedAdmin(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove administrator",
        variant: "destructive"
      });
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest('POST', `/api/admin/users/${userId}/resend-welcome`, {});
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Password Reset",
          description: `New password sent to ${data.emailSentTo}`
        });
      } else {
        toast({
          title: "Password Reset",
          description: `New password: ${data.tempPassword}`,
          variant: "warning"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
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

  const handleEdit = (admin: any) => {
    setSelectedAdmin(admin);
    setEditFormData({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email domain
    if (!editFormData.email.endsWith('@croydonba.org.uk')) {
      toast({
        title: "Invalid Email",
        description: "Administrator email must be @croydonba.org.uk domain",
        variant: "destructive"
      });
      return;
    }

    editAdminMutation.mutate({
      userId: selectedAdmin.id,
      updates: editFormData
    });
  };

  const handleDelete = (admin: any) => {
    setSelectedAdmin(admin);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAdmin) {
      deleteAdminMutation.mutate(selectedAdmin.id);
    }
  };

  const handleResetPassword = (admin: any) => {
    resetPasswordMutation.mutate(admin.id);
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(admin)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(admin)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(admin)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>
              Update administrator details. Email must use @croydonba.org.uk domain.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
                placeholder="user@croydonba.org.uk"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editAdminMutation.isPending}>
                {editAdminMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Administrator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedAdmin?.firstName} {selectedAdmin?.lastName} as an administrator? 
              This will revoke their admin privileges and deactivate their account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAdmin(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}