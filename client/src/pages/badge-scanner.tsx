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
  const [checkInType, setCheckInType] = useState<'check_in' | 'check_out'>('check_in');
  const [location, setLocation] = useState('main_entrance');
  const [staffMember, setStaffMember] = useState('');
  const [notes, setNotes] = useState('');
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      checkInType,
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInType">Action</Label>
                  <Select value={checkInType} onValueChange={(value: 'check_in' | 'check_out') => setCheckInType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check_in">Check In</SelectItem>
                      <SelectItem value="check_out">Check Out</SelectItem>
                    </SelectContent>
                  </Select>
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
                 checkInType === 'check_in' ? 'Check In' : 'Check Out'}
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