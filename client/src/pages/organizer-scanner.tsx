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
import { useScannerSounds } from '@/hooks/useScannerSounds';
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
  university?: string;
  studentId?: string;
  course?: string;
  yearOfStudy?: string;
  communityRole?: string;
  volunteerExperience?: string;
  currentStatus?: 'checked_in' | 'checked_out' | 'unknown';
  lastScanTime?: string;
  totalSessionTime?: number; // in minutes
  sessionCount?: number;
  isRegistered?: boolean;
  registrationId?: number | null;
}

interface ScanRecord {
  id: number;
  attendeeName: string;
  badgeId: string;
  scanType: 'check_in' | 'check_out' | 'verification';
  scanLocation: string;
  scanTimestamp: string;
  eventName: string;
  sessionDuration?: number;
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
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [scanType, setScanType] = useState<'check_in' | 'check_out' | 'verification'>('check_in');
  const [scanLocation, setScanLocation] = useState('LSBU - Main Entrance');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showSpotRegistration, setShowSpotRegistration] = useState(false);
  const [spotRegData, setSpotRegData] = useState({ name: '', email: '', company: '', jobTitle: '', phone: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { playScanSound } = useScannerSounds();

  // Fetch available events for assignment
  const { data: events = [], isLoading: eventsLoading } = useQuery<EventOption[]>({
    queryKey: ['/api/cba-events/active'],
    enabled: isAuthenticated
  });

  // AI Summit sessions for quick assignment
  const { data: aiSummitSessions = [] } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/sessions'],
    enabled: isAuthenticated
  });

  // Fetch recent scan history for selected event
  const { data: recentScanHistory = [] } = useQuery<ScanRecord[]>({
    queryKey: ['/api/scan-history', selectedEventId],
    enabled: isAuthenticated && !!selectedEventId,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Look up attendee by badge ID with current status
  const lookupMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      const response = await apiRequest('GET', `/api/attendee-lookup/${badgeId}?includeStatus=true&eventId=${selectedEventId}`);
      return response.json();
    },
    onSuccess: (data) => {
      setScannedAttendee(data);
      setManualBadgeId('');
      
      // Play sound based on registration status
      if (data.isRegistered) {
        playScanSound({ type: 'success' });
        toast({
          title: "✅ Registered Attendee",
          description: `${data.name} is registered for AI Summit`,
        });
      } else {
        playScanSound({ type: 'warning' });
        toast({
          title: "⚠️ Not Registered",
          description: `${data.name} is not registered for AI Summit. They may need to register on-the-spot.`,
          variant: "destructive",
        });
      }
      
      // Auto-suggest scan type based on current status
      if (data.currentStatus === 'checked_in') {
        setScanType('check_out');
      } else {
        setScanType('check_in');
      }
    },
    onError: (error: any) => {
      playScanSound({ type: 'error' });
      toast({
        title: "❌ Attendee Not Found",
        description: error.message || "Could not find attendee with this badge ID",
        variant: "destructive",
      });
      setScannedAttendee(null);
    },
  });

  // Spot registration mutation
  const spotRegistrationMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; company?: string; jobTitle?: string; phone?: string; existingUserId?: string }) => {
      const response = await apiRequest('POST', '/api/ai-summit/spot-registration', data);
      return response.json();
    },
    onSuccess: (data) => {
      playScanSound({ type: 'success' });
      toast({
        title: "✅ Registration Successful",
        description: `${data.registration.name} has been registered for AI Summit`,
      });
      
      // Re-lookup the attendee after successful registration
      lookupMutation.mutate(data.badgeId);
      setShowSpotRegistration(false);
      setSpotRegData({ name: '', email: '', company: '', jobTitle: '', phone: '' });
    },
    onError: (error: any) => {
      playScanSound({ type: 'error' });
      toast({
        title: "❌ Registration Failed",
        description: error.message || "Could not complete spot registration",
        variant: "destructive",
      });
    },
  });

  // Process scan (check-in/check-out/verification)
  const processScanMutation = useMutation({
    mutationFn: async (data: {
      badgeId: string;
      eventId: string;
      scanType: 'check_in' | 'check_out' | 'verification';
      scanLocation: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/process-scan', data);
      return response.json();
    },
    onSuccess: (data) => {
      const actionText = scanType === 'check_in' ? 'checked in' : 
                       scanType === 'check_out' ? 'checked out' : 'verified';
      
      toast({
        title: `Successfully ${actionText}`,
        description: data.sessionDuration ? 
          `${scannedAttendee?.name} ${actionText}. Session duration: ${Math.round(data.sessionDuration)} minutes` :
          `${scannedAttendee?.name} ${actionText}`,
      });
      
      // Add to scan history
      setScanHistory(prev => [{
        id: data.id,
        attendeeName: scannedAttendee?.name || 'Unknown',
        badgeId: data.badgeId,
        scanType: data.scanType,
        scanLocation: data.scanLocation,
        scanTimestamp: data.scanTimestamp,
        eventName: events.find(e => e.id.toString() === selectedEventId)?.eventName || 'Unknown Event',
        sessionDuration: data.sessionDuration
      }, ...prev.slice(0, 19)]);

      // Update session analytics
      if (activeSession) {
        setActiveSession(prev => ({
          ...prev,
          totalScans: prev.totalScans + 1,
          uniqueScans: data.isNewAttendee ? prev.uniqueScans + 1 : prev.uniqueScans
        }));
      }

      // Clear form and refresh attendee status
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

  const handleProcessScan = () => {
    if (!scannedAttendee || !selectedEventId) {
      toast({
        title: "Missing Information",
        description: "Please scan an attendee and select an event",
        variant: "destructive",
      });
      return;
    }

    // Check if trying to check in an unregistered attendee
    if (!scannedAttendee.isRegistered && scanType === 'check_in') {
      playScanSound({ type: 'warning' });
      toast({
        title: "⚠️ Registration Required",
        description: `${scannedAttendee.name} must be registered for AI Summit before checking in. Use the 'Register Now' button to complete their registration first.`,
        variant: "destructive",
      });
      return;
    }

    processScanMutation.mutate({
      badgeId: scannedAttendee.badgeId,
      eventId: selectedEventId,
      scanType,
      scanLocation,
      notes: notes.trim() || undefined
    });
  };

  // Start scanning session
  const startSessionMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiRequest('POST', '/api/start-scan-session', { eventId });
      return response.json();
    },
    onSuccess: (data) => {
      setActiveSession(data);
      toast({
        title: "Scanning Session Started",
        description: `Now tracking attendance for ${events.find(e => e.id.toString() === selectedEventId)?.eventName}`,
      });
    }
  });

  // End scanning session
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiRequest('POST', '/api/end-scan-session', { sessionId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Scanning Session Ended",
        description: "Session analytics have been saved",
      });
      setActiveSession(null);
    }
  });

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
                    <QRScanner 
                      isActive={isScanning}
                      onScan={handleQRScan} 
                      onClose={() => setIsScanning(false)}
                    />
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
                <div className={`mt-4 p-4 rounded-lg ${
                  scannedAttendee.isRegistered 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-yellow-50 border border-yellow-300'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {scannedAttendee.isRegistered ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800">✅ Registered Attendee</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-800">⚠️ Not Registered</span>
                        </>
                      )}
                    </div>
                    {!scannedAttendee.isRegistered && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSpotRegData({
                            name: scannedAttendee.name,
                            email: scannedAttendee.email,
                            company: scannedAttendee.company || '',
                            jobTitle: scannedAttendee.jobTitle || '',
                            phone: ''
                          });
                          setShowSpotRegistration(true);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        📝 Register Now
                      </Button>
                    )}
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
                    {scannedAttendee.university && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">University:</span>
                        <span className="text-xs">{scannedAttendee.university}</span>
                      </div>
                    )}
                    {scannedAttendee.course && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Course:</span>
                        <span className="text-xs">{scannedAttendee.course}</span>
                      </div>
                    )}
                    {scannedAttendee.yearOfStudy && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="text-xs">{scannedAttendee.yearOfStudy}</span>
                      </div>
                    )}
                    {scannedAttendee.communityRole && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="text-xs">{scannedAttendee.communityRole}</span>
                      </div>
                    )}
                    
                    {/* Registration Status */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-600 font-medium">Registration Status:</span>
                      <Badge variant={scannedAttendee.isRegistered ? 'default' : 'destructive'}>
                        {scannedAttendee.isRegistered ? 'Registered ✓' : 'Not Registered ✗'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Spot Registration Modal */}
              {showSpotRegistration && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Quick Registration
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="spot-name">Name *</Label>
                        <Input
                          id="spot-name"
                          value={spotRegData.name}
                          onChange={(e) => setSpotRegData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spot-email">Email *</Label>
                        <Input
                          id="spot-email"
                          type="email"
                          value={spotRegData.email}
                          onChange={(e) => setSpotRegData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="email@example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spot-company">Company</Label>
                        <Input
                          id="spot-company"
                          value={spotRegData.company}
                          onChange={(e) => setSpotRegData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Company name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spot-job">Job Title</Label>
                        <Input
                          id="spot-job"
                          value={spotRegData.jobTitle}
                          onChange={(e) => setSpotRegData(prev => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="Job title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="spot-phone">Phone</Label>
                        <Input
                          id="spot-phone"
                          value={spotRegData.phone}
                          onChange={(e) => setSpotRegData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Phone number"
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowSpotRegistration(false);
                            setSpotRegData({ name: '', email: '', company: '', jobTitle: '', phone: '' });
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (!spotRegData.name || !spotRegData.email) {
                              toast({
                                title: "Missing Information",
                                description: "Name and email are required",
                                variant: "destructive",
                              });
                              return;
                            }
                            spotRegistrationMutation.mutate({
                              ...spotRegData,
                              existingUserId: scannedAttendee?.source === 'qr_handle' ? scannedAttendee.badgeId : undefined
                            });
                          }}
                          disabled={spotRegistrationMutation.isPending}
                          className="flex-1"
                        >
                          {spotRegistrationMutation.isPending ? 'Registering...' : 'Register'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Tracking Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Attendance Tracking
              </CardTitle>
              {activeSession && (
                <div className="text-sm text-green-600 font-medium">
                  📊 Session Active: {activeSession.totalScans} scans, {activeSession.uniqueScans} unique
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label htmlFor="event-select">Select Event</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an event to track attendance" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length > 0 && (
                      <>
                        <SelectItem value="cba-events-header" disabled>CBA Events</SelectItem>
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
                  </SelectContent>
                </Select>
              </div>

              {/* Session Controls */}
              {selectedEventId && (
                <div className="flex gap-2">
                  {!activeSession ? (
                    <Button 
                      onClick={() => startSessionMutation.mutate(selectedEventId)}
                      disabled={startSessionMutation.isPending}
                      className="flex-1"
                    >
                      {startSessionMutation.isPending ? 'Starting...' : '▶️ Start Session'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => endSessionMutation.mutate(activeSession.id)}
                      disabled={endSessionMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {endSessionMutation.isPending ? 'Ending...' : '⏹️ End Session'}
                    </Button>
                  )}
                </div>
              )}

              {/* Current Attendee Status */}
              {scannedAttendee && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{scannedAttendee.name}</span>
                    <Badge variant={scannedAttendee.currentStatus === 'checked_in' ? 'default' : 'secondary'}>
                      {scannedAttendee.currentStatus === 'checked_in' ? '✅ Checked In' : 
                       scannedAttendee.currentStatus === 'checked_out' ? '🚪 Checked Out' : '❓ Unknown'}
                    </Badge>
                  </div>
                  
                  {scannedAttendee.lastScanTime && (
                    <p className="text-xs text-gray-600 mb-2">
                      Last scan: {new Date(scannedAttendee.lastScanTime).toLocaleString('en-GB')}
                    </p>
                  )}
                  
                  {scannedAttendee.totalSessionTime && (
                    <p className="text-xs text-gray-600 mb-2">
                      Total time today: {Math.round(scannedAttendee.totalSessionTime)} minutes
                    </p>
                  )}
                  
                  {scannedAttendee.sessionCount && scannedAttendee.sessionCount > 1 && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Multiple sessions: {scannedAttendee.sessionCount} entries/exits
                    </p>
                  )}
                </div>
              )}

              {/* Scan Controls */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={scanType === 'check_in' ? 'default' : 'outline'}
                  onClick={() => setScanType('check_in')}
                  className="text-xs"
                >
                  ➡️ Check In
                </Button>
                <Button
                  variant={scanType === 'check_out' ? 'default' : 'outline'}
                  onClick={() => setScanType('check_out')}
                  className="text-xs"
                >
                  ⬅️ Check Out
                </Button>
                <Button
                  variant={scanType === 'verification' ? 'default' : 'outline'}
                  onClick={() => setScanType('verification')}
                  className="text-xs"
                >
                  ✓ Verify
                </Button>
              </div>

              {/* Scan Location */}
              <div className="space-y-2">
                <Label htmlFor="scan-location">Scan Location</Label>
                <Select value={scanLocation} onValueChange={setScanLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* LSBU Venue */}
                    <SelectItem value="LSBU - Main Entrance">🏢 LSBU - Main Entrance</SelectItem>
                    <SelectItem value="LSBU - Auditorium">🎯 LSBU - Auditorium</SelectItem>
                    <SelectItem value="LSBU - Workshop Room">🏫 LSBU - Workshop Room</SelectItem>
                    <SelectItem value="LSBU - Exhibition Space">🎪 LSBU - Exhibition Space</SelectItem>
                    <SelectItem value="LSBU - Refreshments">☕ LSBU - Refreshments</SelectItem>
                    <SelectItem value="LSBU - In and Out">🚪 LSBU - In and Out</SelectItem>
                    
                    {/* Metrobank Venue */}
                    <SelectItem value="Metrobank - Main Entrance">🏢 Metrobank - Main Entrance</SelectItem>
                    <SelectItem value="Metrobank - Auditorium">🎯 Metrobank - Auditorium</SelectItem>
                    <SelectItem value="Metrobank - Workshop Room">🏫 Metrobank - Workshop Room</SelectItem>
                    <SelectItem value="Metrobank - Exhibition Space">🎪 Metrobank - Exhibition Space</SelectItem>
                    <SelectItem value="Metrobank - Refreshments">☕ Metrobank - Refreshments</SelectItem>
                    <SelectItem value="Metrobank - In and Out">🚪 Metrobank - In and Out</SelectItem>
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
                  placeholder="Add any notes about this scan..."
                  rows={2}
                />
              </div>

              {/* Process Scan Button */}
              <Button 
                onClick={handleProcessScan}
                disabled={!scannedAttendee || !selectedEventId || processScanMutation.isPending || 
                         (!scannedAttendee?.isRegistered && scanType === 'check_in')}
                className={`w-full ${
                  !scannedAttendee?.isRegistered && scanType === 'check_in' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : ''
                }`}
                size="lg"
              >
                {processScanMutation.isPending ? 'Processing...' : 
                 (!scannedAttendee?.isRegistered && scanType === 'check_in') ? '🚫 Registration Required' :
                 scanType === 'check_in' ? '➡️ Process Check-In' :
                 scanType === 'check_out' ? '⬅️ Process Check-Out' : '✓ Process Verification'}
              </Button>
              
              {!scannedAttendee?.isRegistered && scanType === 'check_in' && (
                <p className="text-sm text-red-600 text-center mt-2">
                  ⚠️ This person must be registered before checking in to AI Summit
                </p>
              )}

              {/* Ready Status */}
              {scannedAttendee && selectedEventId && scannedAttendee.isRegistered && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Ready to process:</strong> {scanType.replace('_', ' ')} for {scannedAttendee.name} at {scanLocation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scan History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Scans
              {(recentScanHistory.length > 0 || scanHistory.length > 0) && (
                <Badge variant="secondary">{recentScanHistory.length || scanHistory.length}</Badge>
              )}
            </CardTitle>
            {selectedEventId && (
              <p className="text-sm text-gray-600">
                Showing scans for {events.find(e => e.id.toString() === selectedEventId)?.eventName || 'selected event'}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {(!recentScanHistory.length && !scanHistory.length) ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scans recorded yet</p>
                <p className="text-sm">
                  {selectedEventId ? 'Start scanning attendees to track attendance' : 'Select an event to view scan history'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Show recent scans from API first, then local scans */}
                {[...recentScanHistory, ...scanHistory].slice(0, 20).map((scan, index) => (
                  <div key={scan.id || `local-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        scan.scanType === 'check_in' ? 'bg-green-500' :
                        scan.scanType === 'check_out' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{scan.attendeeName}</p>
                        <p className="text-xs text-gray-600">
                          {scan.scanType === 'check_in' ? '➡️ Checked in' :
                           scan.scanType === 'check_out' ? '⬅️ Checked out' : '✓ Verified'} 
                          at {scan.scanLocation}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.scanTimestamp).toLocaleString('en-GB')}
                          {scan.sessionDuration && ` • Session: ${Math.round(scan.sessionDuration)} min`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{scan.eventName}</p>
                      <p className="text-xs font-mono text-gray-400">{scan.badgeId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}