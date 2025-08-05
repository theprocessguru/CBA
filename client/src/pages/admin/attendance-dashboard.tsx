import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  UserX,
  TrendingUp,
  Clock,
  MapPin,
  Activity,
  RefreshCw,
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

interface AttendanceData {
  eventId: number;
  eventName: string;
  totalRegistered: number;
  currentlyInside: number;
  totalCheckedIn: number;
  totalCheckedOut: number;
  noShows: number;
  lastCheckInTime?: string;
  occupancyRate: number;
  maxCapacity: number;
}

interface RecentActivity {
  id: string;
  participantName: string;
  action: 'check_in' | 'check_out';
  timestamp: string;
  scannerName?: string;
}

interface Event {
  id: number;
  eventName: string;
  isActive: boolean;
  eventDate: string;
}

export default function AttendanceDashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/cba-events'],
  });

  // Get active events for today
  const activeEvents = events.filter(event => {
    const today = new Date().toDateString();
    const eventDate = new Date(event.eventDate).toDateString();
    return event.isActive && eventDate === today;
  });

  // Auto-select first active event
  useEffect(() => {
    if (activeEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(activeEvents[0].id);
    }
  }, [activeEvents, selectedEventId]);

  // Fetch real-time attendance data
  const { data: attendanceData, refetch: refetchAttendance } = useQuery<AttendanceData>({
    queryKey: ['/api/admin/attendance/real-time', selectedEventId],
    enabled: !!selectedEventId,
    refetchInterval: autoRefresh ? 10000 : false, // Refresh every 10 seconds if auto-refresh is on
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery<RecentActivity[]>({
    queryKey: ['/api/admin/attendance/recent-activity', selectedEventId],
    enabled: !!selectedEventId,
    refetchInterval: autoRefresh ? 5000 : false, // Refresh every 5 seconds
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600 bg-red-100';
    if (rate >= 75) return 'text-orange-600 bg-orange-100';
    if (rate >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Attendance Dashboard</h1>
            <p className="text-gray-600">Real-time event entry and exit tracking</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchAttendance()}
            disabled={!selectedEventId}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </Button>
        </div>
      </div>

      {/* Event Selection */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <Select 
                value={selectedEventId?.toString() || ""} 
                onValueChange={(value) => setSelectedEventId(parseInt(value))}
              >
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select an event to monitor" />
                </SelectTrigger>
                <SelectContent>
                  {activeEvents.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                  {activeEvents.length === 0 && (
                    <SelectItem value="none" disabled>
                      No active events today
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {selectedEvent && (
              <Badge variant="outline" className="text-green-600 bg-green-50">
                <Activity className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedEventId ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
            <p className="text-gray-600">Choose an active event to view real-time attendance data.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Live Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Currently Inside</p>
                    <p className="text-3xl font-bold text-green-600">
                      {attendanceData?.currentlyInside || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  Live count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Checked In</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {attendanceData?.totalCheckedIn || 0}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <Clock className="h-3 w-3 inline mr-1" />
                  All-time entries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {attendanceData?.occupancyRate || 0}%
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-full", getOccupancyColor(attendanceData?.occupancyRate || 0))}>
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <Users className="h-3 w-3 inline mr-1" />
                  {attendanceData?.currentlyInside || 0} / {attendanceData?.maxCapacity || 0} capacity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">No Shows</p>
                    <p className="text-3xl font-bold text-red-600">
                      {attendanceData?.noShows || 0}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <UserX className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  Registered but not attended
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Badge variant="secondary" className="text-xs">
                    Live Updates
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            activity.action === 'check_in' 
                              ? "bg-green-100 text-green-600" 
                              : "bg-blue-100 text-blue-600"
                          )}>
                            {activity.action === 'check_in' ? (
                              <UserCheck className="h-4 w-4" />
                            ) : (
                              <UserX className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.participantName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {capitalize(activity.action.replace('_', ' '))}
                              {activity.scannerName && ` • Scanned by ${activity.scannerName}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(activity.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Event Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Event Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEvent && attendanceData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Event Name:</span>
                      <span className="font-medium">{selectedEvent.eventName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedEvent.eventDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Registered:</span>
                      <span className="font-medium">{attendanceData.totalRegistered}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Attendance Rate:</span>
                      <span className="font-medium">
                        {attendanceData.totalRegistered > 0 
                          ? Math.round((attendanceData.totalCheckedIn / attendanceData.totalRegistered) * 100)
                          : 0}%
                      </span>
                    </div>
                    
                    {attendanceData.lastCheckInTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Last Check-in:</span>
                        <span className="font-medium">
                          {formatTime(attendanceData.lastCheckInTime)}
                        </span>
                      </div>
                    )}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>People Inside Now:</span>
                        <span className="text-green-600">{attendanceData.currentlyInside}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}