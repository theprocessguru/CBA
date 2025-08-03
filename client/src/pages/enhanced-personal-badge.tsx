import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, QrCode, MapPin, Clock, Users, TrendingUp, BarChart3, Download, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface CBAEvent {
  id: number;
  eventName: string;
  eventSlug: string;
  description: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  venueAddress: string;
  maxCapacity: number;
  currentRegistrations: number;
  tags: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface PersonalBadgeEvent {
  id: number;
  personalBadgeId: number;
  eventId: number;
  roleAtEvent: string;
  badgeDesign: string;
  customFields: string;
  qrCodeData: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedOut: boolean;
  checkedOutAt?: string;
  badgePrinted: boolean;
  badgePrintedAt?: string;
  isActive: boolean;
  event?: CBAEvent;
}

interface EventRegistration {
  id: number;
  eventId: number;
  participantName: string;
  participantEmail: string;
  registrationStatus: string;
  checkedIn: boolean;
  checkedInAt?: string;
  noShow: boolean;
  feedbackRating?: number;
  registeredAt: string;
  event?: CBAEvent;
}

interface AttendanceAnalytics {
  id: number;
  eventId: number;
  userEmail: string;
  attendancePattern: string;
  totalEventsRegistered: number;
  totalEventsAttended: number;
  totalNoShows: number;
  attendanceRate: string;
  lastEventAttended?: string;
}

export default function EnhancedPersonalBadge() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [badgeFormData, setBadgeFormData] = useState({
    roleAtEvent: "attendee",
    badgeDesign: "standard",
    customFields: ""
  });

  // Fetch CBA events
  const { data: cbaEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/cba-events"],
  });

  // Fetch personal badge events
  const { data: personalBadgeEvents = [], isLoading: badgeEventsLoading } = useQuery({
    queryKey: ["/api/personal-badge-events"],
  });

  // Fetch event registrations for current user
  const { data: eventRegistrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/my-event-registrations"],
  });

  // Fetch attendance analytics
  const { data: attendanceAnalytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/my-attendance-analytics"],
  });

  // Create personal badge event mutation
  const createBadgeEventMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/personal-badge-events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal badge linked to event successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-badge-events"] });
      setBadgeFormData({
        roleAtEvent: "attendee",
        badgeDesign: "standard",
        customFields: ""
      });
      setSelectedEventId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to link badge to event",
        variant: "destructive",
      });
    },
  });

  // Download badge mutation
  const downloadBadgeMutation = useMutation({
    mutationFn: (badgeEventId: number) => 
      fetch(`/api/download-personal-badge/${badgeEventId}`)
        .then(res => res.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `personal-badge-${badgeEventId}.html`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Badge downloaded successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download badge",
        variant: "destructive",
      });
    },
  });

  const handleCreateBadgeEvent = () => {
    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "Please select an event",
        variant: "destructive",
      });
      return;
    }

    const qrCodeData = JSON.stringify({
      type: "personal_badge_event",
      eventId: selectedEventId,
      roleAtEvent: badgeFormData.roleAtEvent,
      timestamp: new Date().toISOString(),
    });

    createBadgeEventMutation.mutate({
      eventId: selectedEventId,
      roleAtEvent: badgeFormData.roleAtEvent,
      badgeDesign: badgeFormData.badgeDesign,
      customFields: badgeFormData.customFields,
      qrCodeData,
    });
  };

  const getAttendanceRate = () => {
    if (!attendanceAnalytics || attendanceAnalytics.length === 0) return "0";
    const totalRegistered = attendanceAnalytics.reduce((sum, a) => sum + a.totalEventsRegistered, 0);
    const totalAttended = attendanceAnalytics.reduce((sum, a) => sum + a.totalEventsAttended, 0);
    return totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : "0";
  };

  const getAttendancePattern = () => {
    if (!attendanceAnalytics || attendanceAnalytics.length === 0) return "No data";
    const patterns = attendanceAnalytics.map(a => a.attendancePattern).filter(Boolean);
    if (patterns.length === 0) return "No pattern";
    const mostCommon = patterns.reduce((a, b, i, arr) =>
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
    return mostCommon || "No pattern";
  };

  const formatEventDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPP");
    } catch {
      return "Invalid date";
    }
  };

  const formatEventTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), "p");
    } catch {
      return "Invalid time";
    }
  };

  if (eventsLoading || badgeEventsLoading || registrationsLoading || analyticsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your event data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Enhanced Personal Badge System</h1>
          <p className="text-gray-600">
            Link your personal badges to specific events with date/time tracking and attendance analytics
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="create-badge">Create Badge</TabsTrigger>
            <TabsTrigger value="my-badges">My Badges</TabsTrigger>
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cbaEvents?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Available events</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Badges</CardTitle>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{personalBadgeEvents?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Event badges created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registrations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventRegistrations?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Events registered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getAttendanceRate()}%</div>
                  <p className="text-xs text-muted-foreground">Overall attendance</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Attendance Pattern Analysis
                </CardTitle>
                <CardDescription>
                  Your event attendance behavior and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Pattern:</span>
                    <Badge variant={getAttendancePattern() === "regular" ? "default" : "secondary"}>
                      {getAttendancePattern()}
                    </Badge>
                  </div>
                  {attendanceAnalytics && attendanceAnalytics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Registered</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {attendanceAnalytics.reduce((sum, a) => sum + a.totalEventsRegistered, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Attended</div>
                        <div className="text-2xl font-bold text-green-600">
                          {attendanceAnalytics.reduce((sum, a) => sum + a.totalEventsAttended, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">No Shows</div>
                        <div className="text-2xl font-bold text-red-600">
                          {attendanceAnalytics.reduce((sum, a) => sum + a.totalNoShows, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Last Attended</div>
                        <div className="text-sm text-gray-600">
                          {attendanceAnalytics[0]?.lastEventAttended 
                            ? format(parseISO(attendanceAnalytics[0].lastEventAttended), "MMM d, yyyy")
                            : "Never"
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-badge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Link Badge to Event</CardTitle>
                <CardDescription>
                  Create a personal badge linked to a specific event with date/time tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-select">Select Event</Label>
                  <Select value={selectedEventId?.toString() || ""} onValueChange={(value) => setSelectedEventId(Number(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {cbaEvents?.map((event: CBAEvent) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{event.eventName}</span>
                            <span className="text-sm text-gray-500">
                              {formatEventDate(event.eventDate)} • {event.venue}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-select">Role at Event</Label>
                  <Select value={badgeFormData.roleAtEvent} onValueChange={(value) => setBadgeFormData({...badgeFormData, roleAtEvent: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendee">Attendee</SelectItem>
                      <SelectItem value="speaker">Speaker</SelectItem>
                      <SelectItem value="exhibitor">Exhibitor</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="design-select">Badge Design</Label>
                  <Select value={badgeFormData.badgeDesign} onValueChange={(value) => setBadgeFormData({...badgeFormData, badgeDesign: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="speaker">Speaker</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-fields">Custom Information (Optional)</Label>
                  <Textarea
                    id="custom-fields"
                    placeholder="Enter any custom information for this badge..."
                    value={badgeFormData.customFields}
                    onChange={(e) => setBadgeFormData({...badgeFormData, customFields: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleCreateBadgeEvent}
                  disabled={createBadgeEventMutation.isPending || !selectedEventId}
                  className="w-full"
                >
                  {createBadgeEventMutation.isPending ? "Creating..." : "Create Personal Badge"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-badges" className="space-y-6">
            <div className="grid gap-6">
              {!personalBadgeEvents || personalBadgeEvents.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <QrCode className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-center">
                      No personal badges created yet. Create your first badge by linking it to an event.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                personalBadgeEvents?.map((badgeEvent: PersonalBadgeEvent) => (
                  <Card key={badgeEvent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            {badgeEvent.event?.eventName || "Unknown Event"}
                          </CardTitle>
                          <CardDescription>
                            {badgeEvent.event && (
                              <>
                                {formatEventDate(badgeEvent.event.eventDate)} • {formatEventTime(badgeEvent.event.startTime)}
                                <br />
                                {badgeEvent.event.venue}
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={badgeEvent.roleAtEvent === "speaker" ? "default" : "secondary"}>
                          {badgeEvent.roleAtEvent}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center gap-1">
                            {badgeEvent.checkedIn ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Check-in: {badgeEvent.checkedIn ? "Yes" : "No"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {badgeEvent.badgePrinted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                            <span>Printed: {badgeEvent.badgePrinted ? "Yes" : "No"}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadBadgeMutation.mutate(badgeEvent.id)}
                          disabled={downloadBadgeMutation.isPending}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <div className="grid gap-6">
              {!eventRegistrations || eventRegistrations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 text-center">
                      No event registrations found. Register for events to see them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                eventRegistrations?.map((registration: EventRegistration) => (
                  <Card key={registration.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {registration.event?.eventName || "Unknown Event"}
                          </CardTitle>
                          <CardDescription>
                            Registered: {format(parseISO(registration.registeredAt), "PPP p")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={registration.registrationStatus === "confirmed" ? "default" : "secondary"}>
                            {registration.registrationStatus}
                          </Badge>
                          {registration.noShow && (
                            <Badge variant="destructive">No Show</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center gap-1">
                            {registration.checkedIn ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Attended: {registration.checkedIn ? "Yes" : "No"}</span>
                          </div>
                          {registration.feedbackRating && (
                            <div className="flex items-center gap-1">
                              <span>Rating: {registration.feedbackRating}/5</span>
                            </div>
                          )}
                        </div>
                        {registration.event && (
                          <div className="text-sm text-gray-600">
                            {formatEventDate(registration.event.eventDate)} • {registration.event.venue}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Detailed Attendance Analytics
                </CardTitle>
                <CardDescription>
                  Your comprehensive event participation patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!attendanceAnalytics || attendanceAnalytics.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No attendance data available yet. Attend some events to see your analytics.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {attendanceAnalytics?.map((analytics: AttendanceAnalytics) => (
                      <div key={analytics.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-600">Events Registered</div>
                            <div className="text-2xl font-bold">{analytics.totalEventsRegistered}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Events Attended</div>
                            <div className="text-2xl font-bold text-green-600">{analytics.totalEventsAttended}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">No Shows</div>
                            <div className="text-2xl font-bold text-red-600">{analytics.totalNoShows}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-600">Attendance Rate</div>
                            <div className="text-2xl font-bold">{parseFloat(analytics.attendanceRate).toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <Badge variant={analytics.attendancePattern === "regular" ? "default" : "secondary"}>
                            Pattern: {analytics.attendancePattern || "Unknown"}
                          </Badge>
                          {analytics.lastEventAttended && (
                            <span className="text-sm text-gray-600">
                              Last attended: {format(parseISO(analytics.lastEventAttended), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}