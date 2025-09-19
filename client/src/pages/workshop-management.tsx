import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Clock, MapPin, Star } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { AISummitWorkshop, AISummitSpeakingSession } from "@shared/schema";

export default function WorkshopManagement() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'workshops' | 'sessions'>('workshops');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Workshop form state
  const [workshopForm, setWorkshopForm] = useState({
    title: '',
    description: '',
    facilitator: '',
    startTime: '',
    endTime: '',
    room: '',
    maxCapacity: 20,
    isActive: true
  });

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    speaker: '',
    startTime: '',
    endTime: '',
    room: '',
    maxCapacity: 50,
    isActive: true
  });

  // Fetch workshops
  const { data: workshops = [], isLoading: workshopsLoading } = useQuery({
    queryKey: ['/api/workshops'],
    enabled: true,
  });

  // Fetch sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/ai-summit/speaking-sessions'],
    enabled: true,
  });

  // Create workshop mutation
  const createWorkshopMutation = useMutation({
    mutationFn: async (workshopData: typeof workshopForm) => {
      return await apiRequest('POST', '/api/ai-summit/workshops', workshopData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/workshops'] });
      toast({
        title: "Success",
        description: "Workshop created successfully!",
      });
      setShowCreateForm(false);
      setWorkshopForm({
        title: '',
        description: '',
        facilitator: '',
        startTime: '',
        endTime: '',
        room: '',
        maxCapacity: 20,
        isActive: true
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create workshop",
        variant: "destructive",
      });
    },
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: typeof sessionForm) => {
      return await apiRequest('POST', '/api/ai-summit/speaking-sessions', sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-summit/speaking-sessions'] });
      toast({
        title: "Success",
        description: "Speaking session created successfully!",
      });
      setShowCreateForm(false);
      setSessionForm({
        title: '',
        description: '',
        speaker: '',
        startTime: '',
        endTime: '',
        room: '',
        maxCapacity: 50,
        isActive: true
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create speaking session",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkshopMutation.mutate(workshopForm);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    createSessionMutation.mutate(sessionForm);
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              You need to be logged in to access workshop management.
            </p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Summit Workshop & Session Management
          </h1>
          <p className="text-gray-600">
            Manage workshops and speaking sessions for the AI Summit event
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('workshops')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'workshops'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Workshops
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Speaking Sessions
          </button>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create {activeTab === 'workshops' ? 'Workshop' : 'Speaking Session'}
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Create New {activeTab === 'workshops' ? 'Workshop' : 'Speaking Session'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={activeTab === 'workshops' ? handleCreateWorkshop : handleCreateSession}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={activeTab === 'workshops' ? workshopForm.title : sessionForm.title}
                      onChange={(e) => {
                        if (activeTab === 'workshops') {
                          setWorkshopForm({ ...workshopForm, title: e.target.value });
                        } else {
                          setSessionForm({ ...sessionForm, title: e.target.value });
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="facilitator">
                      {activeTab === 'workshops' ? 'Facilitator' : 'Speaker'}
                    </Label>
                    <Input
                      id="facilitator"
                      value={activeTab === 'workshops' ? workshopForm.facilitator : sessionForm.speaker}
                      onChange={(e) => {
                        if (activeTab === 'workshops') {
                          setWorkshopForm({ ...workshopForm, facilitator: e.target.value });
                        } else {
                          setSessionForm({ ...sessionForm, speaker: e.target.value });
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={activeTab === 'workshops' ? workshopForm.startTime : sessionForm.startTime}
                      onChange={(e) => {
                        if (activeTab === 'workshops') {
                          setWorkshopForm({ ...workshopForm, startTime: e.target.value });
                        } else {
                          setSessionForm({ ...sessionForm, startTime: e.target.value });
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={activeTab === 'workshops' ? workshopForm.endTime : sessionForm.endTime}
                      onChange={(e) => {
                        if (activeTab === 'workshops') {
                          setWorkshopForm({ ...workshopForm, endTime: e.target.value });
                        } else {
                          setSessionForm({ ...sessionForm, endTime: e.target.value });
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="room">Room/Location</Label>
                    <Input
                      id="room"
                      value={activeTab === 'workshops' ? workshopForm.room : sessionForm.room}
                      onChange={(e) => {
                        if (activeTab === 'workshops') {
                          setWorkshopForm({ ...workshopForm, room: e.target.value });
                        } else {
                          setSessionForm({ ...sessionForm, room: e.target.value });
                        }
                      }}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxCapacity">Max Capacity</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      min="1"
                      value={activeTab === 'workshops' ? workshopForm.maxCapacity : sessionForm.maxCapacity}
                      onChange={(e) => {
                        if (activeTab === 'workshops') {
                          setWorkshopForm({ ...workshopForm, maxCapacity: parseInt(e.target.value) });
                        } else {
                          setSessionForm({ ...sessionForm, maxCapacity: parseInt(e.target.value) });
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={activeTab === 'workshops' ? workshopForm.description : sessionForm.description}
                    onChange={(e) => {
                      if (activeTab === 'workshops') {
                        setWorkshopForm({ ...workshopForm, description: e.target.value });
                      } else {
                        setSessionForm({ ...sessionForm, description: e.target.value });
                      }
                    }}
                    rows={3}
                    required
                  />
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    type="submit"
                    disabled={createWorkshopMutation.isPending || createSessionMutation.isPending}
                  >
                    {(createWorkshopMutation.isPending || createSessionMutation.isPending) ? 'Creating...' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {activeTab === 'workshops' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshopsLoading ? (
              <div className="col-span-full text-center py-8">Loading workshops...</div>
            ) : workshops.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No workshops found. Create your first workshop to get started.
              </div>
            ) : (
              workshops.map((workshop: AISummitWorkshop) => (
                <Card key={workshop.id} className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workshop.title}</CardTitle>
                      <Badge variant={workshop.isActive ? "default" : "secondary"}>
                        {workshop.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{workshop.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span>{workshop.facilitator}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDateTime(workshop.startTime)} - {formatDateTime(workshop.endTime)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{workshop.room}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Capacity: {workshop.maxCapacity} participants</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessionsLoading ? (
              <div className="col-span-full text-center py-8">Loading speaking sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No speaking sessions found. Create your first session to get started.
              </div>
            ) : (
              sessions.map((session: AISummitSpeakingSession) => (
                <Card key={session.id} className="h-fit">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">{session.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span>{session.speaker}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{session.room}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>Capacity: {session.maxCapacity} attendees</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}