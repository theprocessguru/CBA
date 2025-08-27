import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, MessageSquare, CheckCircle, XCircle, Search, Building2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Connection {
  id: number;
  partner_name: string;
  partner_email: string;
  partner_company: string;
  partner_job_title: string;
  partner_id: string;
  connection_type: string;
  created_at: string;
}

interface ConnectionRequest {
  id: number;
  requester_name: string;
  requester_email: string;
  requester_company: string;
  requester_job_title: string;
  request_message: string;
  connection_type: string;
  requested_at: string;
}

interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  company: string;
  job_title: string;
  bio: string;
  connection_exists: boolean;
}

export default function Connections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonType, setSelectedPersonType] = useState("");
  const [connectionType, setConnectionType] = useState("network");
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's connections
  const { data: connections = [], isLoading: connectionsLoading } = useQuery<Connection[]>({
    queryKey: ['/api/connections'],
  });

  // Fetch pending requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery<ConnectionRequest[]>({
    queryKey: ['/api/connections/requests'],
  });

  // Fetch directory users
  const { data: directoryUsers = [], isLoading: directoryLoading } = useQuery<DirectoryUser[]>({
    queryKey: ['/api/connections/directory', searchTerm, selectedPersonType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedPersonType) params.append('personType', selectedPersonType);
      
      const response = await fetch(`/api/connections/directory?${params}`);
      if (!response.ok) throw new Error('Failed to fetch directory');
      return response.json();
    },
  });

  // Send connection request mutation
  const sendRequestMutation = useMutation({
    mutationFn: (data: { receiverId: string; connectionType: string; requestMessage?: string }) => 
      apiRequest('POST', '/api/connections/request', data),
    onSuccess: () => {
      toast({ title: "Connection request sent!", description: "Your request has been sent successfully." });
      queryClient.invalidateQueries({ queryKey: ['/api/connections/directory'] });
      setSelectedUser(null);
      setRequestMessage("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to send request", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    }
  });

  // Respond to request mutation
  const respondToRequestMutation = useMutation({
    mutationFn: ({ requestId, status, responseMessage }: { requestId: number; status: string; responseMessage?: string }) =>
      apiRequest('PATCH', `/api/connections/${requestId}/respond`, { status, responseMessage }),
    onSuccess: () => {
      toast({ title: "Response sent!", description: "Your response has been recorded." });
      queryClient.invalidateQueries({ queryKey: ['/api/connections/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to respond", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    }
  });

  const handleSendRequest = () => {
    if (!selectedUser) return;
    
    sendRequestMutation.mutate({
      receiverId: selectedUser.id,
      connectionType,
      requestMessage: requestMessage.trim() || undefined,
    });
  };

  const handleRespondToRequest = (requestId: number, status: 'accepted' | 'declined') => {
    respondToRequestMutation.mutate({ requestId, status });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Connections</h1>
        <p className="text-gray-600">Connect with other members, build partnerships, and grow your network.</p>
      </div>

      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Users size={16} />
            My Connections ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Requests ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="directory" className="flex items-center gap-2">
            <UserPlus size={16} />
            Find Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
              <CardDescription>
                Your established partnerships and network connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionsLoading ? (
                <div className="text-center py-8">Loading your connections...</div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start building your network by connecting with other members.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connections.map((connection) => (
                    <Card key={connection.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{connection.partner_name}</h4>
                          <p className="text-sm text-gray-600">{connection.partner_job_title}</p>
                          <p className="text-sm text-gray-500">{connection.partner_company}</p>
                        </div>
                        <Badge variant="secondary">{connection.connection_type}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Connected {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Connection requests awaiting your response
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    New connection requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{request.requester_name}</h4>
                          <p className="text-sm text-gray-600">{request.requester_job_title}</p>
                          <p className="text-sm text-gray-500">{request.requester_company}</p>
                          {request.request_message && (
                            <p className="mt-2 text-sm bg-gray-50 p-2 rounded">
                              "{request.request_message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Requested {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            onClick={() => handleRespondToRequest(request.id, 'accepted')}
                            disabled={respondToRequestMutation.isPending}
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRespondToRequest(request.id, 'declined')}
                            disabled={respondToRequestMutation.isPending}
                          >
                            <XCircle size={16} className="mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <CardTitle>Find New Connections</CardTitle>
              <CardDescription>
                Browse members and send connection requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, company, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedPersonType} onValueChange={setSelectedPersonType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="resident">Resident</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {directoryLoading ? (
                <div className="text-center py-8">Loading directory...</div>
              ) : directoryUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {directoryUsers.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div>
                        <h4 className="font-semibold">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.job_title}</p>
                        <p className="text-sm text-gray-500">{user.company}</p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{user.bio}</p>
                        )}
                      </div>
                      <div className="mt-4">
                        {user.connection_exists ? (
                          <Button disabled size="sm" className="w-full">
                            <Users size={16} className="mr-1" />
                            Connected
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="w-full" onClick={() => setSelectedUser(user)}>
                                <UserPlus size={16} className="mr-1" />
                                Connect
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Connection Request</DialogTitle>
                                <DialogDescription>
                                  Send a connection request to {user.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Connection Type</label>
                                  <Select value={connectionType} onValueChange={setConnectionType}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="network">Networking</SelectItem>
                                      <SelectItem value="partner">Business Partner</SelectItem>
                                      <SelectItem value="collaborator">Collaborator</SelectItem>
                                      <SelectItem value="mentor">Mentor</SelectItem>
                                      <SelectItem value="mentee">Mentee</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Message (Optional)</label>
                                  <Textarea
                                    placeholder="Introduce yourself and explain why you'd like to connect..."
                                    value={requestMessage}
                                    onChange={(e) => setRequestMessage(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={handleSendRequest}
                                  disabled={sendRequestMutation.isPending}
                                >
                                  Send Request
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}