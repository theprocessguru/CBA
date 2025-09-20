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
  
  // Ensure userRegistrations is always an array to prevent runtime errors
  const safeUserRegistrations = Array.isArray(userRegistrations) ? userRegistrations : [];

  // Fetch live workshops from database
  const { data: liveWorkshops = [] } = useQuery({
    queryKey: ['/api/workshops'],
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
      
      const start = format(startDate, 'H:mm');
      const end = format(endDate, 'H:mm');
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
      title: workshop.title,
      time: formatSessionTime(workshop.startTime, workshop.endTime),
      duration: calculateDuration(workshop.startTime, workshop.endTime),
      location: workshop.room || 'Second Floor Classroom',
      capacity: workshop.maxCapacity || 30
    }));
  };

  const allSessions: Registration[] = convertWorkshopsToSessions(liveWorkshops);

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
    return safeUserRegistrations.some(reg => reg.id === sessionId);
  };

  const hasTimeConflict = (sessionTime: string) => {
    const [startTime] = sessionTime.split(' - ');
    return safeUserRegistrations.some(reg => {
      const [regStartTime] = reg.time.split(' - ');
      return regStartTime === startTime && reg.id !== selectedTimeSlot;
    });
  };

  const parseTime = (timeStr: string) => {
    const [start] = timeStr.split(' - ');
    const [hours, minutes] = start.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const sortedSessions = [...allSessions].sort((a, b) => parseTime(a.time) - parseTime(b.time));

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
                {safeUserRegistrations.map((reg) => (
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
              const conflict = hasTimeConflict(session.time);
              
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
                      
                      <h4 className="font-medium text-gray-900 mb-1">{session.title}</h4>
                      
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
                          variant={conflict ? "secondary" : "default"}
                          size="sm"
                          onClick={() => onRegister?.(session.id)}
                          disabled={conflict}
                          className={conflict ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {conflict ? "Time Conflict" : "Register"}
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