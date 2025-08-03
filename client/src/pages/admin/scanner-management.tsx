import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Shield, 
  BarChart3, 
  Clock,
  ArrowLeft,
  Search,
  UserCheck,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface EventScanner {
  id: number;
  userId: string;
  eventId: number;
  scannerRole: 'admin' | 'volunteer' | 'team_member';
  permissions: string[];
  assignedAt: string;
  isActive: boolean;
  totalScansCompleted: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  title?: string;
}

export default function ScannerManagementPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/cba-events'],
    enabled: true
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: true
  });

  // Fetch scanners for selected event
  const { data: eventScanners = [] } = useQuery<EventScanner[]>({
    queryKey: ['/api/event-scanners/event', selectedEventId],
    enabled: !!selectedEventId
  });

  // Fetch scan analytics for selected event
  const { data: scanAnalytics = {} } = useQuery<{
    totalScans?: number;
    uniqueScannedUsers?: number;
    totalScanners?: number;
    duplicateScans?: number;
  }>({
    queryKey: ['/api/scan-analytics/event', selectedEventId],
    enabled: !!selectedEventId
  });

  // Assign scanner mutation
  const assignScannerMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      eventId: number;
      scannerRole: string;
      permissions: string[];
    }) => {
      const response = await fetch('/api/event-scanners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to assign scanner');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scanner assigned",
        description: "User has been successfully assigned as scanner",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/event-scanners'] });
      setShowAssignForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Assignment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Deactivate scanner mutation
  const deactivateScannerMutation = useMutation({
    mutationFn: async (scannerId: number) => {
      const response = await fetch(`/api/event-scanners/${scannerId}/deactivate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to deactivate scanner');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scanner deactivated",
        description: "Scanner has been deactivated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/event-scanners'] });
    },
    onError: (error: any) => {
      toast({
        title: "Deactivation failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAssignScanner = (formData: FormData) => {
    const data = {
      userId: formData.get('userId') as string,
      eventId: selectedEventId!,
      scannerRole: formData.get('scannerRole') as string,
      permissions: ['scan_attendees', 'view_analytics']
    };
    
    assignScannerMutation.mutate(data);
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Event Scanner Management</h1>
        </div>
        {selectedEventId && (
          <Button
            onClick={() => setShowAssignForm(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assign Scanner
          </Button>
        )}
      </div>

      {/* Event Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedEventId === event.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedEventId(event.id)}
              >
                <h3 className="font-medium">{event.eventName}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {event.location}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedEventId && (
        <>
          {/* Event Analytics */}
          {scanAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Scans</p>
                      <p className="text-2xl font-bold">{scanAnalytics.totalScans || 0}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unique Attendees</p>
                      <p className="text-2xl font-bold">{scanAnalytics.uniqueScannedUsers || 0}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Scanners</p>
                      <p className="text-2xl font-bold">{scanAnalytics.totalScanners || 0}</p>
                    </div>
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Duplicates</p>
                      <p className="text-2xl font-bold">{scanAnalytics.duplicateScans || 0}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Current Scanners */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Current Scanners - {selectedEvent?.eventName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventScanners.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Scanners Assigned
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Assign team members or volunteers as scanners for this event
                  </p>
                  <Button onClick={() => setShowAssignForm(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign First Scanner
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventScanners.map((scanner) => {
                    const user = users.find(u => u.id === scanner.userId);
                    return (
                      <div
                        key={scanner.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium">
                              {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {user?.email} • {user?.company}
                            </p>
                            <p className="text-xs text-gray-500">
                              Assigned: {new Date(scanner.assignedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {scanner.totalScansCompleted} scans
                            </p>
                            <Badge 
                              variant={scanner.scannerRole === 'admin' ? 'default' : 'secondary'}
                            >
                              {scanner.scannerRole}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={scanner.isActive ? 'default' : 'destructive'}
                            >
                              {scanner.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            
                            {scanner.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deactivateScannerMutation.mutate(scanner.id)}
                                disabled={deactivateScannerMutation.isPending}
                              >
                                Deactivate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Assign Scanner Form */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAssignScanner(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userId">Select User</Label>
                  <Select name="userId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scannerRole">Scanner Role</Label>
                  <Select name="scannerRole" defaultValue="volunteer" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin Scanner</SelectItem>
                      <SelectItem value="team_member">Team Member</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" disabled={assignScannerMutation.isPending}>
                    Assign Scanner
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAssignForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}