import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { QRScanner } from '@/components/scanning/QRScanner';
import { getDisplayParticipantType, getParticipantTypeColor } from '@/utils/participantTypeUtils';
import { 
  Camera, 
  Users, 
  Clock, 
  Calendar,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Scan,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { apiRequest } from '@/lib/queryClient';

interface AttendeeInfo {
  badgeId: string;
  name: string;
  email: string;
  participantType: string;
  customRole?: string;
  company?: string;
  jobTitle?: string;
}

interface EventOption {
  id: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  status: string;
}

export default function OrganizerScannerPage() {
  const { user, isAuthenticated } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAttendee, setScannedAttendee] = useState<AttendeeInfo | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [manualBadgeId, setManualBadgeId] = useState('');
  const [notes, setNotes] = useState('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available events for assignment
  const { data: events = [], isLoading: eventsLoading } = useQuery<EventOption[]>({
    queryKey: ['/api/cba-events/active'],
    enabled: isAuthenticated
  });

  // AI Summit sessions for quick assignment
  const { data: aiSummitSessions = [] } = useQuery({
    queryKey: ['/api/ai-summit/sessions'],
    enabled: isAuthenticated
  });

  // Look up attendee by badge ID
  const lookupMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const response = await apiRequest('GET', `/api/attendee-lookup/${badgeId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setScannedAttendee(data);
      setManualBadgeId('');
    },
    onError: (error: any) => {
      toast({
        title: "Attendee Not Found",
        description: error.message || "Could not find attendee with this badge ID",
        variant: "destructive",
      });
      setScannedAttendee(null);
    },
  });

  // Assign attendee to event
  const assignMutation = useMutation({
    mutationFn: async (data: {
      badgeId: string;
      eventId: string;
      eventType: 'cba_event' | 'ai_summit_session';
      assignedBy: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/assign-to-event', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Successfully Assigned",
        description: `${scannedAttendee?.name} has been assigned to the event`,
      });
      
      // Add to scan history
      setScanHistory(prev => [{
        ...data,
        attendeeName: scannedAttendee?.name,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      // Clear form
      setScannedAttendee(null);
      setSelectedEventId('');
      setNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Could not assign attendee to event",
        variant: "destructive",
      });
    },
  });

  const handleQRScan = (data: string) => {
    console.log('QR Code scanned:', data);
    // Handle different QR code formats
    let badgeId = data;
    
    // Extract badge ID from various formats
    if (data.includes('badgeId=')) {
      const match = data.match(/badgeId=([^&]+)/);
      badgeId = match ? match[1] : data;
    } else if (data.startsWith('CBA-') || data.startsWith('AIS2025-')) {
      badgeId = data;
    }
    
    lookupMutation.mutate(badgeId);
    setIsScanning(false);
  };

  const handleManualLookup = () => {
    if (!manualBadgeId.trim()) {
      toast({
        title: "Badge ID Required",
        description: "Please enter a badge ID to look up",
        variant: "destructive",
      });
      return;
    }
    lookupMutation.mutate(manualBadgeId.trim());
  };

  const handleAssignToEvent = () => {
    if (!scannedAttendee || !selectedEventId) {
      toast({
        title: "Missing Information",
        description: "Please scan an attendee and select an event",
        variant: "destructive",
      });
      return;
    }

    // Determine event type based on selected event
    const eventType = selectedEventId.startsWith('session-') ? 'ai_summit_session' : 'cba_event';
    const actualEventId = selectedEventId.replace('session-', '');

    assignMutation.mutate({
      badgeId: scannedAttendee.badgeId,
      eventId: actualEventId,
      eventType,
      assignedBy: user?.name || 'Event Organizer',
      notes: notes.trim() || undefined
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Please log in to access the organizer scanner</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Helmet>
        <title>Event Organizer Scanner - CBA</title>
        <meta name="description" content="Scan attendee QR codes and assign them to events in real-time" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Scan className="h-8 w-8 text-blue-600" />
              Event Organizer Scanner
            </h1>
            <p className="text-gray-600 mt-2">Scan attendee badges and assign them to events</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Attendee Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Scanner */}
              <div className="text-center">
                {isScanning ? (
                  <div className="space-y-4">
                    <QRScanner onScan={handleQRScan} />
                    <Button 
                      variant="outline" 
                      onClick={() => setIsScanning(false)}
                    >
                      Stop Scanning
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setIsScanning(true)}
                    className="w-full"
                    size="lg"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Start QR Code Scanner
                  </Button>
                )}
              </div>

              <Separator />

              {/* Manual Entry */}
              <div className="space-y-3">
                <Label htmlFor="manual-badge">Or Enter Badge ID Manually</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-badge"
                    value={manualBadgeId}
                    onChange={(e) => setManualBadgeId(e.target.value)}
                    placeholder="Enter badge ID (e.g., CBA-12345, AIS2025-ABCD1234)"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLookup()}
                  />
                  <Button 
                    onClick={handleManualLookup}
                    disabled={lookupMutation.isPending}
                  >
                    {lookupMutation.isPending ? 'Looking up...' : 'Lookup'}
                  </Button>
                </div>
              </div>

              {/* Scanned Attendee Info */}
              {scannedAttendee && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Attendee Found</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{scannedAttendee.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Badge ID:</span>
                      <span className="font-mono text-xs">{scannedAttendee.badgeId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <Badge className={getParticipantTypeColor(scannedAttendee.participantType)}>
                        {getDisplayParticipantType(scannedAttendee.participantType, scannedAttendee.customRole)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="text-xs">{scannedAttendee.email}</span>
                    </div>
                    {scannedAttendee.company && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="text-xs">{scannedAttendee.company}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Assignment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Event Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label htmlFor="event-select">Select Event</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event to assign attendee" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* CBA Events */}
                    {events.length > 0 && (
                      <>
                        <SelectItem value="" disabled>CBA Events</SelectItem>
                        {events.map(event => (
                          <SelectItem key={event.id} value={event.id.toString()}>
                            <div className="flex flex-col">
                              <span>{event.eventName}</span>
                              <span className="text-xs text-gray-500">
                                {event.eventDate} • {event.venue}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {/* AI Summit Sessions */}
                    {aiSummitSessions.length > 0 && (
                      <>
                        <SelectItem value="" disabled>AI Summit Sessions</SelectItem>
                        {aiSummitSessions.map((session: any) => (
                          <SelectItem key={`session-${session.id}`} value={`session-${session.id}`}>
                            <div className="flex flex-col">
                              <span>{session.title}</span>
                              <span className="text-xs text-gray-500">
                                {session.sessionTime} • {session.room}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this assignment..."
                  rows={3}
                />
              </div>

              {/* Assign Button */}
              <Button 
                onClick={handleAssignToEvent}
                disabled={!scannedAttendee || !selectedEventId || assignMutation.isPending}
                className="w-full"
                size="lg"
              >
                {assignMutation.isPending ? 'Assigning...' : 'Assign to Event'}
              </Button>

              {/* Assignment Status */}
              {scannedAttendee && selectedEventId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Ready to assign:</strong> {scannedAttendee.name} to selected event
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Assignments */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanHistory.map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{assignment.attendeeName}</div>
                        <div className="text-sm text-gray-500">
                          Assigned to event at {new Date(assignment.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}