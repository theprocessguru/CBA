import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  BarChart3,
  Download,
  Calendar,
  Clock,
  MapPin,
  Award,
  TrendingUp,
  ArrowLeft,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Link } from 'wouter';

interface SessionReport {
  sessionId: number;
  sessionName: string;
  sessionType: 'workshop' | 'talk' | 'networking' | 'break' | 'exhibition';
  room: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  peakAttendance: number;
  averageAttendance: number;
}

interface ExhibitionReport {
  areaId: string;
  areaName: string;
  totalVisitors: number;
  uniqueVisitors: number;
  averageVisitDuration: number;
  peakOccupancy: number;
  maxCapacity: number;
}

interface EventReport {
  eventId: number;
  eventName: string;
  eventDate: string;
  totalRegistered: number;
  totalAttended: number;
  overallAttendanceRate: number;
  noShows: number;
  peakOccupancy: number;
  averageOccupancy: number;
  sessionReports: SessionReport[];
  exhibitionReports: ExhibitionReport[];
  reportGeneratedAt: string;
}

interface Event {
  id: number;
  eventName: string;
  eventDate: string;
  isActive: boolean;
}

export default function AttendanceReportPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Fetch events from both sources
  const { data: cbaEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/cba-events'],
  });
  
  const { data: generalEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  // Combine both event sources
  const events = [
    ...cbaEvents.map((event: any) => ({
      ...event,
      eventName: event.eventName || event.title || 'Unnamed Event',
      eventDate: event.eventDate || event.startDate || '',
      isActive: event.isActive !== undefined ? event.isActive : (event.status === 'published')
    })),
    ...generalEvents.map((event: any) => ({
      ...event,
      eventName: event.title || event.eventName || 'Unnamed Event',
      eventDate: event.startDate || event.eventDate || '',
      isActive: event.status === 'published'
    }))
  ];

  // Get events that have finished or are currently running
  const reportableEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    const today = new Date();
    return eventDate <= today; // Show events that have started
  });

  // Fetch final attendance report
  const { data: report, isLoading, refetch } = useQuery<EventReport>({
    queryKey: ['/api/admin/attendance/final-report', selectedEventId],
    enabled: !!selectedEventId,
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    if (rate >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const downloadReport = () => {
    if (!report) return;
    
    const reportData = {
      eventName: report.eventName,
      eventDate: report.eventDate,
      overallStats: {
        totalRegistered: report.totalRegistered,
        totalAttended: report.totalAttended,
        attendanceRate: report.overallAttendanceRate,
        noShows: report.noShows
      },
      sessionBreakdown: report.sessionReports.map(session => ({
        sessionName: session.sessionName,
        type: session.sessionType,
        room: session.room,
        time: `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`,
        registered: session.totalRegistered,
        attended: session.totalAttended,
        attendanceRate: session.attendanceRate
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${report.eventName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            <h1 className="text-3xl font-bold text-gray-900">Final Attendance Report</h1>
            <p className="text-gray-600">Complete attendance breakdown by event and sessions</p>
          </div>
        </div>
        
        {report && (
          <Button onClick={downloadReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
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
                  <SelectValue placeholder="Select an event to generate report" />
                </SelectTrigger>
                <SelectContent>
                  {reportableEvents.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.eventName} - {formatDate(event.eventDate)}
                    </SelectItem>
                  ))}
                  {reportableEvents.length === 0 && (
                    <SelectItem value="none" disabled>
                      No events available for reporting
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => refetch()}
              disabled={!selectedEventId || isLoading}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Report</h3>
            <p className="text-gray-600">Processing attendance data...</p>
          </CardContent>
        </Card>
      )}

      {!selectedEventId && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Event</h3>
            <p className="text-gray-600">Choose an event to generate a comprehensive attendance report.</p>
          </CardContent>
        </Card>
      )}

      {report && !isLoading && (
        <>
          {/* Event Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Event Overview: {report.eventName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {report.totalAttended}
                  </div>
                  <div className="text-sm text-gray-600">Total Attended</div>
                  <div className="text-xs text-gray-500 mt-1">
                    out of {report.totalRegistered} registered
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {report.overallAttendanceRate}%
                  </div>
                  <div className="text-sm text-gray-600">Attendance Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    overall event attendance
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {report.peakOccupancy}
                  </div>
                  <div className="text-sm text-gray-600">Peak Occupancy</div>
                  <div className="text-xs text-gray-500 mt-1">
                    maximum simultaneous attendees
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {report.noShows}
                  </div>
                  <div className="text-sm text-gray-600">No Shows</div>
                  <div className="text-xs text-gray-500 mt-1">
                    registered but didn't attend
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Report generated: {formatDate(report.reportGeneratedAt)} at {formatTime(report.reportGeneratedAt)}</span>
                  <span>Event date: {formatDate(report.eventDate)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exhibition Areas Report */}
          {report.exhibitionReports && report.exhibitionReports.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Exhibition Areas Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.exhibitionReports.map((area) => (
                    <Card key={area.areaId} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {area.areaName}
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Visitors:</span>
                            <span className="font-bold text-lg text-green-600">
                              {area.totalVisitors}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Unique Visitors:</span>
                            <span className="font-medium">
                              {area.uniqueVisitors}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Peak Occupancy:</span>
                            <span className="font-medium">
                              {area.peakOccupancy}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Avg Visit Time:</span>
                            <span className="font-medium">
                              {area.averageVisitDuration} min
                            </span>
                          </div>
                          
                          <div className="pt-2 border-t">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-green-500 transition-all"
                                style={{ 
                                  width: `${Math.min((area.peakOccupancy / area.maxCapacity) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Peak Utilization</span>
                              <span>Capacity: {area.maxCapacity}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Session Breakdown: Individual Talks & Workshops
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.sessionReports.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No session data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {report.sessionReports.map((session) => (
                    <Card key={session.sessionId} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {session.sessionName}
                              </h4>
                              <Badge variant="outline">
                                {session.sessionType}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {session.room}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(session.startTime)} - {formatTime(session.endTime)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {session.totalAttended}
                              </div>
                              <div className="text-xs text-gray-600">Attended</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {session.totalRegistered}
                              </div>
                              <div className="text-xs text-gray-600">Registered</div>
                            </div>
                            
                            <div className="text-center">
                              <div className={`text-2xl font-bold rounded px-2 py-1 ${getAttendanceColor(session.attendanceRate)}`}>
                                {session.attendanceRate}%
                              </div>
                              <div className="text-xs text-gray-600">Rate</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {session.peakAttendance}
                              </div>
                              <div className="text-xs text-gray-600">Peak</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-500 transition-all"
                              style={{ width: `${Math.min(session.attendanceRate, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Attendance Rate</span>
                            <span>Capacity: {session.maxCapacity}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}