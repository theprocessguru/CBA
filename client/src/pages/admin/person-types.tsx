import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Users, Star } from "lucide-react";

interface PersonType {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

interface UserPersonType {
  id: number;
  userId: string;
  personTypeId: number;
  isPrimary: boolean;
  assignedAt: string;
  assignedBy?: string;
  notes?: string;
}

export default function AdminPersonTypes() {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [editingType, setEditingType] = useState<PersonType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    color: "#6B7280",
    icon: "User",
    priority: 100,
  });

  const [assignData, setAssignData] = useState({
    personTypeId: "",
    isPrimary: false,
    notes: "",
  });

  // Fetch person types
  const { data: personTypes = [], isLoading: isLoadingTypes } = useQuery<PersonType[]>({
    queryKey: ["/api/person-types"],
  });

  // Fetch all users for assignment
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch user's person types
  const { data: userPersonTypes = [], refetch: refetchUserTypes } = useQuery<UserPersonType[]>({
    queryKey: [`/api/users/${selectedUserId}/person-types`],
    enabled: !!selectedUserId,
  });

  // Create person type mutation
  const createTypeMutation = useMutation({
    mutationFn: (data: Partial<PersonType>) =>
      apiRequest("POST", "/api/admin/person-types", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/person-types"] });
      toast({
        title: "Success",
        description: "Person type created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create person type",
        variant: "destructive",
      });
    },
  });

  // Update person type mutation
  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PersonType> }) =>
      apiRequest("PUT", `/api/admin/person-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/person-types"] });
      toast({
        title: "Success",
        description: "Person type updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingType(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update person type",
        variant: "destructive",
      });
    },
  });

  // Delete person type mutation
  const deleteTypeMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/person-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/person-types"] });
      toast({
        title: "Success",
        description: "Person type deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete person type",
        variant: "destructive",
      });
    },
  });

  // Assign person type to user mutation
  const assignTypeMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("POST", `/api/admin/users/${selectedUserId}/person-types`, data),
    onSuccess: () => {
      refetchUserTypes();
      toast({
        title: "Success",
        description: "Person type assigned successfully",
      });
      setIsAssignDialogOpen(false);
      setAssignData({ personTypeId: "", isPrimary: false, notes: "" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign person type",
        variant: "destructive",
      });
    },
  });

  // Remove person type from user mutation
  const removeTypeMutation = useMutation({
    mutationFn: (personTypeId: number) =>
      apiRequest("DELETE", `/api/admin/users/${selectedUserId}/person-types/${personTypeId}`),
    onSuccess: () => {
      refetchUserTypes();
      toast({
        title: "Success",
        description: "Person type removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove person type",
        variant: "destructive",
      });
    },
  });

  // Set primary person type mutation
  const setPrimaryMutation = useMutation({
    mutationFn: (personTypeId: number) =>
      apiRequest("PUT", `/api/admin/users/${selectedUserId}/person-types/${personTypeId}/primary`),
    onSuccess: () => {
      refetchUserTypes();
      toast({
        title: "Success",
        description: "Primary person type updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update primary person type",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      color: "#6B7280",
      icon: "User",
      priority: 100,
    });
  };

  const handleEditClick = (type: PersonType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      displayName: type.displayName,
      description: type.description || "",
      color: type.color || "#6B7280",
      icon: type.icon || "User",
      priority: type.priority,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    createTypeMutation.mutate(formData);
  };

  const handleUpdateSubmit = () => {
    if (editingType) {
      updateTypeMutation.mutate({
        id: editingType.id,
        data: formData,
      });
    }
  };

  const handleAssignSubmit = () => {
    assignTypeMutation.mutate({
      personTypeId: parseInt(assignData.personTypeId),
      isPrimary: assignData.isPrimary,
      notes: assignData.notes,
    });
  };

  const getPersonTypeName = (personTypeId: number) => {
    const type = personTypes.find(t => t.id === personTypeId);
    return type?.displayName || "Unknown";
  };

  const getUserName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  };

  if (isLoadingTypes || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Person Types Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Person Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Person Type</DialogTitle>
              <DialogDescription>
                Add a new person type that can be assigned to users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Internal Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., councillor"
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g., Councillor"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description of this person type"
                />
              </div>
              <div>
                <Label htmlFor="color">Badge Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon Name</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., User, Star, Building"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority (lower = higher priority)</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>
              <Button 
                onClick={handleCreateSubmit}
                disabled={createTypeMutation.isPending}
              >
                {createTypeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Person Type
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Person Types List */}
      <Card>
        <CardHeader>
          <CardTitle>Person Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Internal Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.displayName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{type.name}</TableCell>
                  <TableCell className="text-sm">{type.description || "-"}</TableCell>
                  <TableCell>{type.priority}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: type.color || "#6B7280" }}
                      />
                      <span className="text-xs">{type.color}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={type.isActive ? "default" : "secondary"}>
                      {type.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTypeMutation.mutate(type.id)}
                        disabled={deleteTypeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Person Type Assignment */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Person Types to Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {getUserName(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!selectedUserId}>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Person Type</DialogTitle>
                  <DialogDescription>
                    Assign a person type to the selected user
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="personType">Person Type</Label>
                    <Select
                      value={assignData.personTypeId}
                      onValueChange={(value) => setAssignData({ ...assignData, personTypeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person type" />
                      </SelectTrigger>
                      <SelectContent>
                        {personTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrimary"
                      checked={assignData.isPrimary}
                      onChange={(e) => setAssignData({ ...assignData, isPrimary: e.target.checked })}
                    />
                    <Label htmlFor="isPrimary">Set as primary type</Label>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={assignData.notes}
                      onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                      placeholder="Add any notes about this assignment"
                    />
                  </div>
                  <Button
                    onClick={handleAssignSubmit}
                    disabled={!assignData.personTypeId || assignTypeMutation.isPending}
                  >
                    {assignTypeMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Assign Person Type
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {selectedUserId && userPersonTypes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Assigned Person Types</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead>Assigned At</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPersonTypes.map((userType) => (
                    <TableRow key={userType.id}>
                      <TableCell>{getPersonTypeName(userType.personTypeId)}</TableCell>
                      <TableCell>
                        {userType.isPrimary ? (
                          <Star className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPrimaryMutation.mutate(userType.personTypeId)}
                          >
                            Set Primary
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(userType.assignedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {userType.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTypeMutation.mutate(userType.personTypeId)}
                          disabled={removeTypeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Person Type</DialogTitle>
            <DialogDescription>
              Update the person type details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Internal Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-displayName">Display Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Badge Color</Label>
              <Input
                id="edit-color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-icon">Icon Name</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-priority">Priority</Label>
              <Input
                id="edit-priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
            </div>
            <Button
              onClick={handleUpdateSubmit}
              disabled={updateTypeMutation.isPending}
            >
              {updateTypeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Person Type
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}