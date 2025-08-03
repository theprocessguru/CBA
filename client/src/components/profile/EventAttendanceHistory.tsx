import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Users,
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventAttendance {
  eventId: number;
  eventName: string;
  eventDate: string;
  location: string;
  eventType: string;
  attendanceStatus: 'registered' | 'checked_in' | 'checked_out' | 'no_show';
  checkInTime?: string;
  checkOutTime?: string;
  scansReceived: number;
  scansGiven: number;
  registrationDate: string;
}

interface EventAttendanceHistoryProps {
  userId: string;
  showTitle?: boolean;
  compact?: boolean;
}

export function EventAttendanceHistory({ userId, showTitle = true, compact = false }: EventAttendanceHistoryProps) {
  // Fetch user's event attendance history
  const { data: attendanceHistory = [], isLoading } = useQuery<EventAttendance[]>({
    queryKey: ['/api/user-attendance-history', userId],
    enabled: !!userId
  });

  // Fetch user's scan analytics
  const { data: scanAnalytics = {} } = useQuery<{
    totalScans?: number;
    uniqueScannedUsers?: number;
    duplicateScans?: number;
    sessionsCount?: number;
    avgScansPerSession?: number;
  }>({
    queryKey: ['/api/scan-analytics/scanner', userId],
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <Card className={cn(compact && "border-0 shadow-none")}>
        {showTitle && (
          <CardHeader className={cn(compact && "pb-3")}>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Attendance History
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={cn(compact && "pt-0")}>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEvents = attendanceHistory.length;
  const attendedEvents = attendanceHistory.filter(e => e.attendanceStatus === 'checked_in' || e.attendanceStatus === 'checked_out').length;
  const noShows = attendanceHistory.filter(e => e.attendanceStatus === 'no_show').length;
  const attendanceRate = totalEvents > 0 ? Math.round((attendedEvents / totalEvents) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked_in':
      case 'checked_out':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'registered':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'no_show':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'checked_in':
      case 'checked_out':
        return <Badge variant="default" className="bg-green-100 text-green-800">Attended</Badge>;
      case 'registered':
        return <Badge variant="secondary">Registered</Badge>;
      case 'no_show':
        return <Badge variant="destructive">No Show</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={cn(compact && "border-0 shadow-none")}>
      {showTitle && (
        <CardHeader className={cn(compact && "pb-3")}>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Attendance History
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className={cn(compact && "pt-0")}>
        {/* Summary Stats */}
        {!compact && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Activity className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-600">{totalEvents}</p>
              <p className="text-xs text-blue-600">Total Events</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{attendedEvents}</p>
              <p className="text-xs text-green-600">Attended</p>
            </div>
            
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-600">{attendanceRate}%</p>
              <p className="text-xs text-orange-600">Attendance Rate</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-600">{scanAnalytics?.totalScans || 0}</p>
              <p className="text-xs text-purple-600">Network Scans</p>
            </div>
          </div>
        )}

        {/* Event List */}
        {attendanceHistory.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Event History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This user hasn't registered for any events yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attendanceHistory
              .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
              .slice(0, compact ? 5 : undefined)
              .map((event) => (
                <div
                  key={`${event.eventId}-${event.registrationDate}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(event.attendanceStatus)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {event.eventName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.checkInTime && (
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Check-in: {new Date(event.checkInTime).toLocaleTimeString()}</span>
                          {event.checkOutTime && (
                            <span>Check-out: {new Date(event.checkOutTime).toLocaleTimeString()}</span>
                          )}
                        </div>
                      )}
                      {(event.scansReceived > 0 || event.scansGiven > 0) && (
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>Scanned: {event.scansGiven} people</span>
                          <span>Scanned by: {event.scansReceived} people</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.attendanceStatus)}
                    <Badge variant="outline" className="text-xs">
                      {event.eventType}
                    </Badge>
                  </div>
                </div>
              ))}
              
            {compact && attendanceHistory.length > 5 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  +{attendanceHistory.length - 5} more events
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}