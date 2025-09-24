import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Registration {
  id: string;
  type: 'workshop' | 'talk' | 'exhibition' | 'networking';
  title: string;
  time: string;
  duration: string;
  location: string;
  capacity?: number;
  registered?: boolean;
  description?: string;
  eventId?: string | number; // For matching with user registrations
  startTime?: string; // For better overlap detection
  endTime?: string; // For better overlap detection
}

interface RegistrationCalendarProps {
  userRegistrations?: Registration[];
  onRegister?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

const RegistrationCalendar = ({ 
  userRegistrations = [], 
  onRegister, 
  onCancel 
}: RegistrationCalendarProps) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  
  // Ensure userRegistrations is always an array to prevent runtime errors
  const safeUserRegistrations = Array.isArray(userRegistrations) ? userRegistrations : [];

  // Fetch live workshops from database
  const { data: liveWorkshops = [] } = useQuery({
    queryKey: ['/api/workshops'],
    select: (data) => data || []
  });

  // Fetch live speaking sessions from database
  const { data: liveSpeakingSessions = [] } = useQuery({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    select: (data) => data || []
  });

  // Convert live workshops to Registration format
  const formatSessionTime = (startTime: string, endTime: string) => {
    try {
      // Handle null/undefined/empty values
      if (!startTime || !endTime) {
        return 'TBD';
      }
      
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'TBD';
      }
      
      // Use consistent HH:mm format for reliable comparison
      const start = format(startDate, 'HH:mm');
      const end = format(endDate, 'HH:mm');
      return `${start} - ${end}`;
    } catch (error) {
      console.warn('Error formatting session time:', { startTime, endTime, error });
      return 'TBD';
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      // Handle null/undefined/empty values
      if (!startTime || !endTime) {
        return '30min';
      }
      
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return '30min';
      }
      
      const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      return `${diffMinutes}min`;
    } catch (error) {
      console.warn('Error calculating duration:', { startTime, endTime, error });
      return '30min';
    }
  };

  const convertWorkshopsToSessions = (workshops: any[]): Registration[] => {
    return workshops.map(workshop => ({
      id: `workshop-${workshop.id}`,
      type: 'workshop' as const,
      title: workshop.eventName || workshop.title || 'Workshop',
      time: formatSessionTime(workshop.startTime, workshop.endTime),
      duration: calculateDuration(workshop.startTime, workshop.endTime),
      location: workshop.venue || workshop.room || 'Second Floor Classroom',
      capacity: workshop.maxCapacity || 30,
      description: workshop.description,
      eventId: workshop.id,
      startTime: workshop.startTime,
      endTime: workshop.endTime
    }));
  };

  const convertSpeakingSessionsToSessions = (sessions: any[]): Registration[] => {
    return sessions.map(session => ({
      id: `session-${session.id}`,
      type: 'talk' as const,
      title: session.title || 'Speaking Session',
      time: formatSessionTime(session.startTime, session.endTime),
      duration: calculateDuration(session.startTime, session.endTime),
      location: session.venue || 'Main Auditorium',
      capacity: session.maxCapacity || 100,
      description: session.description,
      eventId: session.id,
      startTime: session.startTime,
      endTime: session.endTime
    }));
  };

  const allSessions: Registration[] = [
    ...convertWorkshopsToSessions(liveWorkshops || []),
    ...convertSpeakingSessionsToSessions(liveSpeakingSessions || [])
  ];

  // Static fallback sessions (kept as backup if needed)
  const staticSessions: Registration[] = [
    {
      id: 'reg-930',
      type: 'networking',
      title: 'Registration & Welcome Coffee',
      time: '9:30 - 10:00',
      duration: '30min',
      location: 'Third Floor Exhibition Area',
      capacity: 200
    },
    {
      id: 'talk-1100',
      type: 'talk',
      title: 'The Future of AI in Small Business',
      time: '11:00 - 11:30',
      duration: '30min',
      location: 'Second Floor Auditorium',
      capacity: 120
    },
    {
      id: 'workshop-1100',
      type: 'workshop',
      title: 'AI Tools for Content Creation',
      time: '11:00 - 11:45',
      duration: '45min',
      location: 'Second Floor Classroom',
      capacity: 30
    },
    {
      id: 'break-1130',
      type: 'networking',
      title: 'Coffee Break & Networking',
      time: '11:30 - 11:45',
      duration: '15min',
      location: 'Third Floor Exhibition Area',
      capacity: 200
    },
    {
      id: 'workshop-1200',
      type: 'workshop',
      title: 'Building Your First AI Chatbot',
      time: '12:00 - 12:45',
      duration: '45min',
      location: 'Second Floor Classroom',
      capacity: 30
    },
    {
      id: 'talk-1215',
      type: 'talk',
      title: 'Implementing AI on a Budget',
      time: '12:15 - 13:00',
      duration: '45min',
      location: 'Second Floor Auditorium',
      capacity: 120
    },
    {
      id: 'lunch-1300',
      type: 'networking',
      title: 'Lunch & Micro Business Exhibition',
      time: '13:00 - 14:30',
      duration: '90min',
      location: 'Third Floor Exhibition Area',
      capacity: 200
    },
    {
      id: 'workshop-1330',
      type: 'workshop',
      title: 'AI for Marketing & Social Media',
      time: '13:30 - 14:15',
      duration: '45min',
      location: 'Second Floor Classroom',
      capacity: 30
    },
    {
      id: 'workshop-1430',
      type: 'workshop',
      title: 'Automating Business Processes with AI',
      time: '14:30 - 15:15',
      duration: '45min',
      location: 'Second Floor Classroom',
      capacity: 30
    },
    {
      id: 'talk-1445',
      type: 'talk',
      title: 'Responsible AI for Business',
      time: '14:45 - 15:30',
      duration: '45min',
      location: 'Second Floor Auditorium',
      capacity: 120
    },
    {
      id: 'panel-1530',
      type: 'talk',
      title: 'Panel Discussion & Closing',
      time: '15:30 - 16:00',
      duration: '30min',
      location: 'Second Floor Auditorium',
      capacity: 120
    }
  ];

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'talk': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'workshop': return 'bg-green-100 text-green-800 border-green-200';
      case 'networking': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'exhibition': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLocationIcon = (location: string) => {
    if (location.includes('Third Floor')) return '🏢';
    if (location.includes('Second Floor')) return '🎤';
    return '📍';
  };

  const isRegistered = (sessionId: string) => {
    // Extract workshop ID from session ID format (workshop-10 -> 10) 
    // or session ID from session ID format (session-8 -> 8)
    const workshopId = sessionId.replace('workshop-', '');
    const speakingSessionId = sessionId.replace('session-', '');
    return safeUserRegistrations.some(reg => 
      reg.id === sessionId || 
      reg.id === workshopId || 
      reg.id === speakingSessionId ||
      reg.eventId?.toString() === workshopId ||
      reg.eventId?.toString() === speakingSessionId
    );
  };

  const hasTimeConflict = (session: Registration) => {
    if (!session.startTime || !session.endTime) return false;
    
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    
    if (isNaN(sessionStart.getTime()) || isNaN(sessionEnd.getTime())) return false;
    
    return safeUserRegistrations.some(reg => {
      // Don't conflict with self
      if (isRegistered(session.id)) return false;
      
      // Check for time overlap using proper interval comparison
      if (reg.startTime && reg.endTime) {
        const regStart = new Date(reg.startTime);
        const regEnd = new Date(reg.endTime);
        
        if (!isNaN(regStart.getTime()) && !isNaN(regEnd.getTime())) {
          // Overlap if: sessionStart < regEnd AND regStart < sessionEnd
          return sessionStart < regEnd && regStart < sessionEnd;
        }
      }
      
      // Fallback to time string comparison for consistency
      const [sessionTimeStart] = session.time.split(' - ');
      const [regTimeStart] = reg.time.split(' - ');
      return sessionTimeStart === regTimeStart;
    });
  };

  const parseTime = (timeStr: string) => {
    try {
      // Handle TBD and invalid times by putting them at the end
      if (!timeStr || timeStr === 'TBD' || !timeStr.includes(':')) {
        return 9999; // Put TBD sessions at the end
      }
      
      const [start] = timeStr.split(' - ');
      const timeParts = start.split(':');
      
      if (timeParts.length < 2) {
        return 9999; // Invalid format, put at end
      }
      
      const [hours, minutes] = timeParts.map(Number);
      
      // Check if we got valid numbers
      if (isNaN(hours) || isNaN(minutes)) {
        return 9999; // Invalid numbers, put at end
      }
      
      return hours * 60 + minutes;
    } catch (error) {
      console.warn('Error parsing time:', timeStr, error);
      return 9999; // Error case, put at end
    }
  };

  const sortedSessions = [...allSessions].sort((a, b) => parseTime(a.time) - parseTime(b.time));

  const toggleSessionDetails = (sessionId: string) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your AI Summit Schedule
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your registrations and avoid double bookings. Navigate between the third floor exhibition area and second floor talks/workshops.
          </p>
        </CardHeader>
        <CardContent>
          {/* Summary of registrations */}
          <div className="mb-6 p-4 border rounded-lg bg-blue-50">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Your Registrations ({safeUserRegistrations.length})
            </h3>
            {safeUserRegistrations.length > 0 ? (
              <div className="space-y-2">
                {[...safeUserRegistrations].sort((a, b) => parseTime(a.time) - parseTime(b.time)).map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{reg.time}</span>
                    <span>{reg.title}</span>
                    <Badge variant="outline" className={getSessionTypeColor(reg.type)}>
                      {reg.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No registrations yet. Select sessions below to register.</p>
            )}
          </div>

          {/* All available sessions */}
          <div className="space-y-4">
            <h3 className="font-medium">All Available Sessions</h3>
            {sortedSessions.map((session) => {
              const registered = isRegistered(session.id);
              const conflict = !registered && hasTimeConflict(session);
              
              return (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 transition-all ${
                    registered 
                      ? 'border-green-200 bg-green-50' 
                      : conflict 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{session.time}</span>
                        <Badge variant="outline" className={getSessionTypeColor(session.type)}>
                          {session.type}
                        </Badge>
                        {conflict && !registered && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Conflict
                          </Badge>
                        )}
                        {registered && (
                          <Badge variant="default" className="bg-green-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>
                      
                      <h4 
                        className="font-medium text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors" 
                        onClick={() => toggleSessionDetails(session.id)}
                      >
                        {session.title} {session.description && (expandedSessions.has(session.id) ? '📖 ▼' : '📖 ▶')}
                      </h4>
                      
                      {/* Expandable course description */}
                      {expandedSessions.has(session.id) && session.description && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="font-medium text-blue-800 mb-2">Course Description:</h5>
                          <p className="text-sm text-blue-700">{session.description}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{getLocationIcon(session.location)} {session.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Max {session.capacity} people</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{session.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {registered ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancel?.(session.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            if (conflict) {
                              // Prevent registration with clear warning
                              alert("⚠️ Cannot register: This session conflicts with one of your existing registrations. Please cancel your conflicting registration first or choose a different session.");
                              return;
                            }
                            onRegister?.(session.id);
                          }}
                          disabled={conflict}
                          className={conflict ? "opacity-50 cursor-not-allowed" : ""}
                          title={conflict ? "This session conflicts with your existing registrations" : ""}
                        >
                          {conflict ? "⚠️ Time Conflict" : "Register"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation tips */}
          <div className="mt-6 p-4 border rounded-lg bg-yellow-50">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-yellow-600" />
              Navigation Tips
            </h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>🏢 <strong>Third Floor:</strong> Exhibition area - networking, coffee breaks, lunch, and micro business expo</p>
              <p>🎤 <strong>Second Floor:</strong> Auditorium (120 seats) for talks, Classroom (30 seats) for workshops</p>
              <p>⚠️ <strong>Planning:</strong> Allow 5 minutes to move between floors. Sessions may have limited capacity.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationCalendar;