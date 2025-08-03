import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRScanner } from '@/components/scanning/QRScanner';
import { 
  Camera, 
  Play, 
  Square, 
  Users, 
  Zap, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ScanSession {
  id: number;
  scannerId: string;
  eventId: number;
  sessionStart: string;
  sessionEnd?: string;
  totalScans: number;
  uniqueScans: number;
  duplicateScans: number;
  sessionNotes?: string;
}

interface ScanRecord {
  id: number;
  scannerId: string;
  scannedUserId: string;
  eventId?: number;
  scanType: 'check_in' | 'check_out' | 'verification' | 'networking';
  scanTimestamp: string;
  location?: string;
  duplicateScanFlag: boolean;
  deviceInfo?: string;
  scanNotes?: string;
}

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

export default function EventScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [activeSession, setActiveSession] = useState<ScanSession | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's scanner assignments
  const { data: scannerAssignments = [], isLoading: loadingAssignments } = useQuery<EventScanner[]>({
    queryKey: ['/api/my-scanner-assignments'],
    enabled: true
  });

  // Fetch events for selection
  const { data: events = [] } = useQuery<any[]>({
    queryKey: ['/api/cba-events'],
    enabled: true
  });

  // Fetch active session
  const { data: currentSession } = useQuery<ScanSession | null>({
    queryKey: ['/api/scan-session/active', selectedEvent],
    enabled: !!selectedEvent
  });

  // Fetch scan history for current user
  const { data: scanHistory = [] } = useQuery<ScanRecord[]>({
    queryKey: ['/api/my-scan-history'],
    enabled: true
  });

  // Start scan session mutation
  const startSessionMutation = useMutation({
    mutationFn: async (data: { eventId: number; sessionNotes?: string }) => {
      const response = await fetch('/api/scan-session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to start session');
      return response.json();
    },
    onSuccess: (session) => {
      setActiveSession(session);
      setIsScanning(true);
      toast({
        title: "Scan session started",
        description: "You can now start scanning QR codes",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scan-session/active'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to start session",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // End scan session mutation
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: number) => {
      const stats = calculateSessionStats();
      const response = await fetch(`/api/scan-session/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stats),
      });
      if (!response.ok) throw new Error('Failed to end session');
      return response.json();
    },
    onSuccess: () => {
      setActiveSession(null);
      setIsScanning(false);
      setSessionTime('00:00:00');
      toast({
        title: "Scan session ended",
        description: "Session data has been saved",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scan-session/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-scan-history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to end session",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Record scan mutation
  const recordScanMutation = useMutation({
    mutationFn: async (scanData: { 
      scannedUserId: string; 
      eventId?: number; 
      scanType: string; 
      location?: string;
      scanNotes?: string;
    }) => {
      const response = await fetch('/api/scan-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData),
      });
      if (!response.ok) throw new Error('Failed to record scan');
      return response.json();
    },
    onSuccess: (data) => {
      const { scan, isDuplicate } = data;
      toast({
        title: isDuplicate ? "Duplicate scan detected" : "Scan recorded",
        description: isDuplicate 
          ? "This person was recently scanned" 
          : "Successfully recorded interaction",
        variant: isDuplicate ? "destructive" : "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/my-scan-history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Scan failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Fetch user by QR handle
  const fetchUserByQR = async (qrHandle: string) => {
    const response = await fetch(`/api/user-by-qr/${qrHandle}`);
    if (!response.ok) throw new Error('User not found');
    return response.json();
  };

  // Calculate session statistics
  const calculateSessionStats = () => {
    if (!scanHistory || !activeSession) return { totalScans: 0, uniqueScans: 0, duplicateScans: 0 };
    
    const sessionScans = scanHistory.filter((scan) => 
      new Date(scan.scanTimestamp) >= new Date(activeSession.sessionStart)
    );
    
    const uniqueUsers = new Set(sessionScans.map((scan) => scan.scannedUserId));
    const duplicates = sessionScans.filter((scan) => scan.duplicateScanFlag);
    
    return {
      totalScans: sessionScans.length,
      uniqueScans: uniqueUsers.size,
      duplicateScans: duplicates.length
    };
  };

  // Handle QR code scan
  const handleScan = async (qrCode: string) => {
    try {
      // Extract QR handle from URL or use as is
      const qrHandle = qrCode.includes('/') ? qrCode.split('/').pop() : qrCode;
      if (!qrHandle) throw new Error('Invalid QR code format');

      // Fetch user data
      const userData = await fetchUserByQR(qrHandle);
      
      // Record the scan
      recordScanMutation.mutate({
        scannedUserId: userData.id,
        eventId: selectedEvent || undefined,
        scanType: 'networking',
        location: 'Scanner App'
      });
      
    } catch (error: any) {
      toast({
        title: "Scan error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Start scanning session
  const handleStartSession = () => {
    if (!selectedEvent) {
      toast({
        title: "No event selected",
        description: "Please select an event first",
        variant: "destructive",
      });
      return;
    }
    
    startSessionMutation.mutate({ 
      eventId: selectedEvent,
      sessionNotes: 'Mobile scanner session'
    });
  };

  // End scanning session
  const handleEndSession = () => {
    if (activeSession) {
      endSessionMutation.mutate(activeSession.id);
    }
  };

  // Update session timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession) {
      interval = setInterval(() => {
        const start = new Date(activeSession.sessionStart);
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setSessionTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  // Set active session from query
  useEffect(() => {
    if (currentSession && !activeSession) {
      setActiveSession(currentSession as ScanSession);
    }
  }, [currentSession, activeSession]);

  const sessionStats = activeSession ? {
    ...calculateSessionStats(),
    sessionTime
  } : undefined;

  const canScan = scannerAssignments.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event Scanner</h1>
        <Badge variant={activeSession ? "default" : "secondary"}>
          {activeSession ? "Active Session" : "Ready to Scan"}
        </Badge>
      </div>

      {/* Scanner Assignments */}
      {!canScan && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-800 dark:text-orange-200">
                  No Scanner Access
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  You don't have scanner permissions for any events. Contact an admin to get assigned.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {canScan && (
        <>
          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Scanner Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scannerAssignments.map((assignment) => {
                const event = events.find((e) => e.id === assignment.eventId);
                return (
                  <div
                    key={assignment.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedEvent === assignment.eventId
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedEvent(assignment.eventId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{event?.eventName || 'Unknown Event'}</h3>
                        <p className="text-sm text-gray-600">
                          Role: {assignment.scannerRole} • Scans: {assignment.totalScansCompleted}
                        </p>
                      </div>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Session Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scanning Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeSession ? (
                <Button
                  onClick={handleStartSession}
                  disabled={!selectedEvent || startSessionMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Scanning Session
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setIsScanning(true)}
                      className="flex-1 mr-2"
                      size="lg"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Scan QR Code
                    </Button>
                    <Button
                      onClick={handleEndSession}
                      variant="destructive"
                      disabled={endSessionMutation.isPending}
                      size="lg"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </div>

                  {/* Session Stats */}
                  {sessionStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-blue-600">{sessionStats.totalScans}</p>
                        <p className="text-xs text-blue-600">Total Scans</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <UserCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-green-600">{sessionStats.uniqueScans}</p>
                        <p className="text-xs text-green-600">Unique People</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <UserX className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-orange-600">{sessionStats.duplicateScans}</p>
                        <p className="text-xs text-orange-600">Duplicates</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-purple-600">{sessionStats.sessionTime}</p>
                        <p className="text-xs text-purple-600">Session Time</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Scans */}
          {scanHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Scans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scanHistory.slice(0, 5).map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">User: {scan.scannedUserId}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(scan.scanTimestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={scan.duplicateScanFlag ? "destructive" : "default"}>
                          {scan.scanType}
                        </Badge>
                        {scan.duplicateScanFlag && (
                          <Badge variant="outline">Duplicate</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* QR Scanner Modal */}
      <QRScanner
        isActive={isScanning}
        onScan={handleScan}
        onClose={() => setIsScanning(false)}
        sessionStats={sessionStats}
      />
    </div>
  );
}