import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QrCode, UserCheck, UserX, Clock, MapPin, Users, Activity } from 'lucide-react';

interface CheckInResult {
  success: boolean;
  badge?: any;
  checkInType: 'check_in' | 'check_out';
  message: string;
  isFirstCheckIn?: boolean;
}

interface AttendeeStats {
  totalBadgesIssued: number;
  badgesByType: {
    attendee: number;
    exhibitor: number;
    speaker: number;
    volunteer: number;
    team: number;
  };
  currentlyCheckedIn: number;
  totalCheckIns: number;
  totalCheckOuts: number;
}

export default function BadgeScanner() {
  const [badgeId, setBadgeId] = useState('');
  const [scanMode, setScanMode] = useState<'check_in' | 'check_out'>('check_in');
  const [location, setLocation] = useState('main_entrance');
  const [staffMember, setStaffMember] = useState('');
  const [notes, setNotes] = useState('');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simple access control - in production, this would be more secure
  const validateAccess = (code: string) => {
    const validCodes = ['VOLUNTEER2025', 'STAFF2025', 'ADMIN2025'];
    return validCodes.includes(code.toUpperCase());
  };

  const handleAccessSubmit = () => {
    if (validateAccess(accessCode)) {
      setIsAuthorized(true);
      toast({
        title: "Access Granted",
        description: "You can now scan attendee badges",
      });
    } else {
      toast({
        title: "Access Denied", 
        description: "Invalid access code. Please contact event organizers.",
        variant: "destructive",
      });
    }
  };

  // Show access control screen if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="h-6 w-6" />
              Badge Scanner Access
            </CardTitle>
            <CardDescription>
              Enter your volunteer or staff access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                type="password"
                placeholder="Enter access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAccessSubmit()}
              />
            </div>
            <Button onClick={handleAccessSubmit} className="w-full">
              Access Scanner
            </Button>
            <div className="text-xs text-gray-500 text-center">
              Only authorized volunteers and staff can access the badge scanner.
              Contact event organizers if you need an access code.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Focus input on mount and after each scan
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get attendee statistics
  const { data: stats, refetch: refetchStats } = useQuery<AttendeeStats>({
    queryKey: ['/api/ai-summit/attendee-stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (data: {
      badgeId: string;
      checkInType: 'check_in' | 'check_out';
      location: string;
      staffMember?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/ai-summit/check-in', data);
      return response.json();
    },
    onSuccess: (result: CheckInResult) => {
      setLastResult(result);
      setBadgeId('');
      setNotes('');
      inputRef.current?.focus();
      refetchStats();
      
      if (result.success) {
        toast({
          title: result.checkInType === 'check_in' ? 'Check-in Successful' : 'Check-out Successful',
          description: result.message,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Check-in Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to process check-in. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Email badge mutation for sending printable badges
  const emailBadgeMutation = useMutation({
    mutationFn: async (data: { badgeId: string; email: string }) => {
      const response = await apiRequest('POST', '/api/ai-summit/email-badge', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Printable badge has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send badge email",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!badgeId.trim()) {
      toast({
        title: 'Badge ID Required',
        description: 'Please enter or scan a badge ID',
        variant: 'destructive',
      });
      return;
    }

    checkInMutation.mutate({
      badgeId: badgeId.trim(),
      checkInType: scanMode,
      location,
      staffMember: staffMember || undefined,
      notes: notes || undefined,
    });
  };

  const handleBadgeIdChange = (value: string) => {
    setBadgeId(value);
    // Auto-submit if badge ID looks complete (our format: AIS2025-XXXXXXXX)
    if (value.match(/^AIS2025-[A-Z0-9]{8}$/)) {
      setTimeout(() => {
        if (value === badgeId) { // Make sure it hasn't changed
          handleSubmit(new Event('submit') as any);
        }
      }, 100);
    }
  };

  const getParticipantTypeColor = (type: string) => {
    switch (type) {
      case 'speaker': return 'bg-purple-100 text-purple-800';
      case 'exhibitor': return 'bg-blue-100 text-blue-800';
      case 'volunteer': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Summit Badge Scanner</h1>
        <p className="text-gray-600">Check attendees in and out of the event</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Badges</p>
                <p className="text-2xl font-bold">{stats?.totalBadgesIssued || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currently Present</p>
                <p className="text-2xl font-bold text-green-600">{stats?.currentlyCheckedIn || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Check-ins</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.totalCheckIns || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Check-outs</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.totalCheckOuts || 0}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badge Type Breakdown */}
      {stats && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badge Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.badgesByType.attendee}</p>
                <Badge variant="secondary">Attendees</Badge>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.badgesByType.exhibitor}</p>
                <Badge className="bg-blue-100 text-blue-800">Exhibitors</Badge>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.badgesByType.speaker}</p>
                <Badge className="bg-purple-100 text-purple-800">Speakers</Badge>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.badgesByType.volunteer}</p>
                <Badge className="bg-green-100 text-green-800">Volunteers</Badge>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.badgesByType.team}</p>
                <Badge className="bg-orange-100 text-orange-800">Team</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Badge Scanner
            </CardTitle>
            <CardDescription>
              Scan QR code or manually enter badge ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="badgeId">Badge ID</Label>
                <Input
                  ref={inputRef}
                  id="badgeId"
                  value={badgeId}
                  onChange={(e) => handleBadgeIdChange(e.target.value)}
                  placeholder="AIS2025-XXXXXXXX"
                  className="font-mono"
                  autoComplete="off"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Scan QR code or type badge ID manually
                </p>
              </div>

              {/* Scan Mode Selection - Prominent Buttons */}
              <div className="space-y-3">
                <Label>Scan Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={scanMode === 'check_in' ? 'default' : 'outline'}
                    onClick={() => setScanMode('check_in')}
                    className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                      scanMode === 'check_in' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'border-green-600 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm font-medium">Check In</span>
                  </Button>
                  <Button
                    type="button"
                    variant={scanMode === 'check_out' ? 'default' : 'outline'}
                    onClick={() => setScanMode('check_out')}
                    className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                      scanMode === 'check_out' 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'border-orange-600 text-orange-600 hover:bg-orange-50'
                    }`}
                  >
                    <UserX className="h-6 w-6" />
                    <span className="text-sm font-medium">Check Out</span>
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {scanMode === 'check_in' 
                    ? 'Scanning people into the building' 
                    : 'Scanning people out of the building'
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main_entrance">Main Entrance</SelectItem>
                    <SelectItem value="exhibition_hall">Exhibition Hall</SelectItem>
                    <SelectItem value="conference_room">Conference Room</SelectItem>
                    <SelectItem value="networking_area">Networking Area</SelectItem>
                    <SelectItem value="registration_desk">Registration Desk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="staffMember">Staff Member (Optional)</Label>
                <Input
                  id="staffMember"
                  value={staffMember}
                  onChange={(e) => setStaffMember(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={checkInMutation.isPending}
              >
                {checkInMutation.isPending ? 'Processing...' : 
                 scanMode === 'check_in' ? 'Check In' : 'Check Out'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Last Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Last Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastResult ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${
                  lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-medium ${
                    lastResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {lastResult.message}
                  </p>
                </div>

                {lastResult.badge && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Participant:</span>
                      <span className="text-sm">{lastResult.badge.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Badge ID:</span>
                      <span className="text-sm font-mono">{lastResult.badge.badgeId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge className={getParticipantTypeColor(lastResult.badge.participantType)}>
                        {lastResult.badge.participantType}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{lastResult.badge.email}</span>
                    </div>
                    
                    {lastResult.badge.company && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Company:</span>
                        <span className="text-sm">{lastResult.badge.company}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Action:</span>
                      <Badge variant={lastResult.checkInType === 'check_in' ? 'default' : 'secondary'}>
                        {lastResult.checkInType === 'check_in' ? 'Checked In' : 'Checked Out'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time:</span>
                      <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                    </div>
                    
                    {/* Email Badge Button */}
                    <div className="pt-2 border-t">
                      <Button 
                        onClick={() => emailBadgeMutation.mutate({
                          badgeId: lastResult.badge.badgeId,
                          email: lastResult.badge.email
                        })}
                        disabled={emailBadgeMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {emailBadgeMutation.isPending ? 'Sending...' : 'Email Printable Badge'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <QrCode className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No scans yet</p>
                <p className="text-sm">Scan a badge to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Scanner Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">QR Code Scanning</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Click in the Badge ID field to focus</li>
                <li>• Use any QR code scanner app or device</li>
                <li>• Badge will auto-submit when complete ID is detected</li>
                <li>• Format: AIS2025-XXXXXXXX</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Manual Entry</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Type the badge ID manually if QR code is damaged</li>
                <li>• Select Check In/Check Out action</li>
                <li>• Choose appropriate location</li>
                <li>• Add notes if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}