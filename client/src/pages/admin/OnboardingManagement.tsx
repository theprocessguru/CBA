import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Send, 
  Users, 
  Search,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Eye,
  FileText
} from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  participantType?: string;
  membershipTier?: string;
  createdAt: string;
  emailVerified: boolean;
}

interface PersonType {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface EmailCommunication {
  id: number;
  userId: string;
  subject: string;
  content?: string;
  emailType: string;
  status: string;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  metadata?: any;
}

export default function OnboardingManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedUserForEmails, setSelectedUserForEmails] = useState<User | null>(null);
  const [userEmails, setUserEmails] = useState<EmailCommunication[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch person types
  const { data: personTypes = [], isLoading: typesLoading } = useQuery<PersonType[]>({
    queryKey: ["/api/person-types"],
  });

  // Send onboarding mutation
  const sendOnboarding = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("POST", "/api/onboarding/send", { userId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Onboarding message sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send onboarding message",
        variant: "destructive",
      });
    },
  });

  // Bulk send onboarding mutation
  const bulkSendOnboarding = useMutation({
    mutationFn: async (userIds: string[]) => {
      return apiRequest("POST", "/api/onboarding/bulk", { userIds });
    },
    onSuccess: (_, userIds) => {
      toast({
        title: "Success",
        description: `Onboarding messages sent to ${userIds.length} users`,
      });
      setSelectedUsers([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send bulk onboarding messages",
        variant: "destructive",
      });
    },
  });

  // Fetch email history for a user
  const fetchUserEmails = async (user: User) => {
    setLoadingEmails(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/emails`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const emails = await response.json();
        setUserEmails(emails);
        setSelectedUserForEmails(user);
        setShowEmailModal(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch email history",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email history",
        variant: "destructive",
      });
    } finally {
      setLoadingEmails(false);
    }
  };

  // Filter users based on search and type
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === "all" || user.participantType === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const getTypeColor = (type?: string) => {
    switch(type) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'speaker': return 'bg-blue-100 text-blue-800';
      case 'sponsor': return 'bg-green-100 text-green-800';
      case 'exhibitor': return 'bg-orange-100 text-orange-800';
      case 'volunteer': return 'bg-pink-100 text-pink-800';
      case 'team_member': return 'bg-red-100 text-red-800';
      case 'student': return 'bg-yellow-100 text-yellow-800';
      case 'councillor': return 'bg-indigo-100 text-indigo-800';
      case 'media': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (usersLoading || typesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboarding Management</h1>
        <p className="text-gray-600">Send personalized welcome messages to users based on their role</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.emailVerified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => !u.emailVerified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="speaker">Speaker</SelectItem>
                <SelectItem value="exhibitor">Exhibitor</SelectItem>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="team_member">Team Member</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="councillor">Councillor</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={() => bulkSendOnboarding.mutate(selectedUsers)}
              disabled={selectedUsers.length === 0 || bulkSendOnboarding.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Send to Selected ({selectedUsers.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(user.participantType)}>
                      {user.participantType || 'attendee'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.company || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.membershipTier || 'Starter'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchUserEmails(user)}
                        disabled={loadingEmails}
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Emails
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendOnboarding.mutate(user.id)}
                        disabled={sendOnboarding.isPending}
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        Send
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email History Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Email History - {selectedUserForEmails?.firstName} {selectedUserForEmails?.lastName}
            </DialogTitle>
            <DialogDescription>
              {selectedUserForEmails?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {userEmails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p>No emails have been sent to this user yet</p>
              </div>
            ) : (
              userEmails.map((email) => (
                <Card key={email.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">{email.subject}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">
                          {email.emailType}
                        </Badge>
                        <Badge 
                          className={
                            email.status === 'sent' 
                              ? 'bg-green-100 text-green-800' 
                              : email.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {email.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(email.sentAt), "MMM d, yyyy h:mm a")}
                    </div>
                  </div>
                  
                  {email.content && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div 
                        className="text-sm prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: email.content }}
                      />
                    </div>
                  )}
                  
                  {email.metadata && (
                    <div className="mt-3 text-sm text-gray-600">
                      {email.metadata.personType && (
                        <p>Person Type: <span className="font-medium">{email.metadata.personType}</span></p>
                      )}
                      {email.metadata.templateUsed && (
                        <p>Template: <span className="font-medium">{email.metadata.templateUsed}</span></p>
                      )}
                      {email.metadata.mytTags && email.metadata.mytTags.length > 0 && (
                        <p>Tags: <span className="font-medium">{email.metadata.mytTags.join(', ')}</span></p>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}