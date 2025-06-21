import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge,
  BadgeProps,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, UserX, Search, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users', searchTerm, selectedStatus === "all" ? undefined : selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus !== "all") params.append('status', selectedStatus);
      return fetch(`/api/admin/users?${params}`).then(res => res.json());
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/suspend`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setSuspendingUser(null);
      setSuspensionReason("");
      toast({
        title: "User Suspended",
        description: "The user account has been suspended successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  const reactivateUserMutation = useMutation({
    mutationFn: (userId: string) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/reactivate`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Reactivated",
        description: "The user account has been reactivated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reactivate user",
        variant: "destructive",
      });
    },
  });

  const handleSuspendUser = () => {
    if (!suspendingUser || !suspensionReason.trim()) return;

    suspendUserMutation.mutate({
      userId: suspendingUser.id,
      reason: suspensionReason,
    });
  };

  const getStatusBadge = (status: string): { variant: BadgeProps["variant"]; icon: React.ReactNode } => {
    switch (status) {
      case "active":
        return { variant: "default", icon: <UserCheck className="h-3 w-3 mr-1" /> };
      case "suspended":
        return { variant: "destructive", icon: <UserX className="h-3 w-3 mr-1" /> };
      case "closed":
        return { variant: "secondary", icon: <UserX className="h-3 w-3 mr-1" /> };
      default:
        return { variant: "secondary", icon: <UserCheck className="h-3 w-3 mr-1" /> };
    }
  };

  const statusCounts = {
    all: users?.length || 0,
    active: users?.filter(u => u.accountStatus === "active").length || 0,
    suspended: users?.filter(u => u.accountStatus === "suspended").length || 0,
    closed: users?.filter(u => u.accountStatus === "closed").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Management - Admin - Croydon Business Association</title>
        <meta name="description" content="Manage user accounts, suspend or reactivate accounts for membership management." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">User Management</h1>
          <p className="text-neutral-600">Manage member accounts, handle suspensions and payment issues.</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Users</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="sm:w-48">
                <Label htmlFor="status">Account Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                    <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
                    <SelectItem value="suspended">Suspended ({statusCounts.suspended})</SelectItem>
                    <SelectItem value="closed">Closed ({statusCounts.closed})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users ({users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users && users.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const statusInfo = getStatusBadge(user.accountStatus || "active");
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt=""
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                                {user.firstName?.charAt(0) || user.email?.charAt(0) || "?"}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.firstName || "No name"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.icon}
                            {(user.accountStatus || "active").charAt(0).toUpperCase() + 
                             (user.accountStatus || "active").slice(1)}
                          </Badge>
                          {user.accountStatus === "suspended" && user.suspensionReason && (
                            <div className="text-xs text-neutral-500 mt-1">
                              {user.suspensionReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.accountStatus === "suspended" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => reactivateUserMutation.mutate(user.id)}
                                disabled={reactivateUserMutation.isPending}
                                className="text-green-600 hover:text-green-700"
                              >
                                Reactivate
                              </Button>
                            ) : user.accountStatus === "active" ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSuspendingUser(user)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Suspend
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center">
                                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                                      Suspend User Account
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-sm text-neutral-600 mb-2">
                                        You're about to suspend: <span className="font-medium">
                                          {user.firstName && user.lastName 
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.email}
                                        </span>
                                      </p>
                                      
                                      <Label htmlFor="suspensionReason">Reason for suspension</Label>
                                      <Textarea
                                        id="suspensionReason"
                                        placeholder="e.g., Payment overdue, Business closed, Terms violation..."
                                        value={suspensionReason}
                                        onChange={(e) => setSuspensionReason(e.target.value)}
                                        className="mt-1"
                                      />
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={handleSuspendUser}
                                        disabled={suspendUserMutation.isPending || !suspensionReason.trim()}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                      >
                                        {suspendUserMutation.isPending ? "Suspending..." : "Suspend Account"}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          setSuspendingUser(null);
                                          setSuspensionReason("");
                                        }}
                                        className="flex-1"
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No users found
                </h3>
                <p className="text-neutral-600">
                  {searchTerm || selectedStatus !== "all" 
                    ? "Try adjusting your search or filter criteria." 
                    : "No users have been created yet."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UserManagement;