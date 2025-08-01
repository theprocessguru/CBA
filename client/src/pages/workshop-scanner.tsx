import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QrCode, UserCheck, UserX, Clock, MapPin, Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

interface WorkshopCheckInResult {
  success: boolean;
  message: string;
  badge?: any;
  workshop?: {
    id: number;
    title: string;
    facilitator: string;
    room: string;
    startTime: string;
    endTime: string;
  };
  registration?: any;
  checkInType: 'check_in' | 'check_out';
}

interface Workshop {
  id: number;
  title: string;
  facilitator: string;
  room: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentRegistrations: number;
  isActive: boolean;
}

export default function WorkshopScanner() {
  const [badgeId, setBadgeId] = useState('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [checkInType, setCheckInType] = useState<'check_in' | 'check_out'>('check_in');
  const [staffMember, setStaffMember] = useState('');
  const [notes, setNotes] = useState('');
  const [lastResult, setLastResult] = useState<WorkshopCheckInResult | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Simple access control
  const validateAccess = (code: string) => {
    const validCodes = ['WORKSHOP2025', 'FACILITATOR2025', 'STAFF2025', 'ADMIN2025'];
    return validCodes.includes(code.toUpperCase());
  };

  const handleAccessSubmit = () => {
    if (validateAccess(accessCode)) {
      setIsAuthorized(true);
      toast({
        title: "Access Granted",
        description: "You can now scan workshop attendee badges",
      });
    } else {
      toast({
        title: "Access Denied", 
        description: "Invalid access code. Please contact workshop facilitators.",
        variant: "destructive",
      });
    }
  };

  // Get active workshops
  const { data: workshops = [], isLoading: workshopsLoading } = useQuery({
    queryKey: ["/api/ai-summit/workshops/active"],
    select: (data) => data as Workshop[],
    enabled: isAuthorized,
  });

  // Workshop check-in mutation
  const workshopCheckInMutation = useMutation({
    mutationFn: async (data: {
      badgeId: string;
      workshopId: number;
      checkInType: 'check_in' | 'check_out';
      location?: string;
      staffMember?: string;
      notes?: string;
    }) => {
      const response = await apiRequest('POST', '/api/ai-summit/workshop-checkin', data);
      return response.json();
    },
    onSuccess: (result: WorkshopCheckInResult) => {
      setLastResult(result);
      setBadgeId('');
      setNotes('');
      inputRef.current?.focus();
      
      if (result.success) {
        toast({
          title: result.checkInType === 'check_in' ? 'Workshop Check-in Successful' : 'Workshop Check-out Successful',
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
        description: 'Failed to process workshop check-in. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    if (!selectedWorkshopId) {
      toast({
        title: 'Workshop Required',
        description: 'Please select a workshop',
        variant: 'destructive',
      });
      return;
    }

    workshopCheckInMutation.mutate({
      badgeId: badgeId.trim(),
      workshopId: parseInt(selectedWorkshopId),
      checkInType,
      location: `workshop_${selectedWorkshopId}`,
      staffMember: staffMember || undefined,
      notes: notes || undefined,
    });
  };

  const handleBadgeIdChange = (value: string) => {
    setBadgeId(value);
    // Auto-submit if badge ID looks complete and workshop is selected
    if (value.match(/^(AIS2025-[A-Z0-9]{8}|WS-\d+-\d+-[A-Z0-9]{9})$/) && selectedWorkshopId) {
      setTimeout(() => {
        if (value === badgeId) {
          handleSubmit(new Event('submit') as any);
        }
      }, 100);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show access control screen if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Workshop Badge Scanner</CardTitle>
            <CardDescription>
              Enter access code to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter workshop access code"
                  onKeyDown={(e) => e.key === 'Enter' && handleAccessSubmit()}
                />
              </div>
              <Button onClick={handleAccessSubmit} className="w-full">
                Authorize Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workshop Badge Scanner</h1>
          <p className="text-gray-600">Scan attendee badges for workshop check-in/out</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Workshop Check-in Scanner
              </CardTitle>
              <CardDescription>
                Select workshop and scan attendee badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="workshop">Workshop *</Label>
                  <Select value={selectedWorkshopId} onValueChange={setSelectedWorkshopId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a workshop" />
                    </SelectTrigger>
                    <SelectContent>
                      {workshops.map((workshop) => (
                        <SelectItem key={workshop.id} value={workshop.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{workshop.title}</span>
                            <span className="text-xs text-gray-500">
                              {workshop.room} • {formatDateTime(workshop.startTime)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="badgeId">Badge ID</Label>
                  <Input
                    ref={inputRef}
                    id="badgeId"
                    value={badgeId}
                    onChange={(e) => handleBadgeIdChange(e.target.value)}
                    placeholder="AIS2025-XXXXXXXX or WS-XX-XXXX-XXXXXXXX"
                    className="font-mono"
                    autoComplete="off"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Scan QR code or type badge ID manually
                  </p>
                </div>

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
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={workshopCheckInMutation.isPending || !selectedWorkshopId}
                  className="w-full"
                >
                  {workshopCheckInMutation.isPending ? 'Processing...' : 
                   checkInType === 'check_in' ? 'Check In' : 'Check Out'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Display */}
          <div className="space-y-6">
            {/* Last Scan Result */}
            {lastResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {lastResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    Last Scan Result
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      lastResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <p className="font-medium">{lastResult.message}</p>
                    </div>

                    {lastResult.success && lastResult.badge && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">Attendee</p>
                          <p>{lastResult.badge.name}</p>
                          {lastResult.badge.company && <p className="text-gray-500">{lastResult.badge.company}</p>}
                        </div>

                        {lastResult.workshop && (
                          <div>
                            <p className="font-medium text-gray-700">Workshop</p>
                            <p>{lastResult.workshop.title}</p>
                            <p className="text-gray-500">{lastResult.workshop.room}</p>
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-gray-700">Badge Type</p>
                          <Badge variant="outline">
                            {lastResult.badge.participantType}
                          </Badge>
                        </div>

                        <div>
                          <p className="font-medium text-gray-700">Action</p>
                          <Badge variant={lastResult.checkInType === 'check_in' ? 'default' : 'secondary'}>
                            {lastResult.checkInType === 'check_in' ? 'Checked In' : 'Checked Out'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Workshop Info */}
            {selectedWorkshopId && workshops.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Current Workshop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const workshop = workshops.find(w => w.id.toString() === selectedWorkshopId);
                    if (!workshop) return null;
                    
                    return (
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{workshop.title}</h3>
                          <p className="text-gray-600">Facilitated by {workshop.facilitator}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{formatDateTime(workshop.startTime)}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{workshop.room}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{workshop.currentRegistrations}/{workshop.maxCapacity} registered</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={workshop.isActive ? "default" : "secondary"}>
                              {workshop.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Scanner Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-semibold mb-1">Workshop Check-in Process</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>1. Select the workshop from the dropdown</li>
                      <li>2. Scan attendee's QR code or enter badge ID</li>
                      <li>3. System verifies workshop registration</li>
                      <li>4. Attendee is checked in for the specific workshop</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-1">Supported Badge Types</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• General event badges (AIS2025-XXXXXXXX)</li>
                      <li>• Workshop-only badges (WS-XX-XXXX-XXXXXXXX)</li>
                      <li>• Both formats support QR scanning</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}