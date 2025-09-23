import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mic, 
  Wrench,
  Coffee,
  Building,
  BookOpen
} from "lucide-react";

interface ScheduleProps {
  variant?: 'full' | 'compact' | 'auditorium' | 'workshops' | 'exhibitions';
  showRegistrationLinks?: boolean;
  className?: string;
}

interface Session {
  id: number;
  title: string;
  description?: string;
  facilitator?: string;
  facilitatorCompany?: string;
  startTime: string;
  endTime: string;
  venue?: string;
  room?: string;
  maxCapacity?: number;
  currentRegistrations?: number;
  sessionType?: string;
  audienceLevel?: string;
}

interface Workshop extends Session {
  eventName?: string;
  eventDate?: string;
  registrationFee?: number;
  memberPrice?: number;
}

interface Exhibitor {
  id: number;
  companyName: string;
  contactName?: string;
  businessDescription?: string;
  productsServices?: string;
  standLocation?: string;
  standNumber?: string;
}

export function AISummitSchedule({ 
  variant = 'full', 
  showRegistrationLinks = false,
  className = "" 
}: ScheduleProps) {
  
  // Fetch live speaking sessions
  const { data: speakingSessions = [], isLoading: speakingLoading } = useQuery<Session[]>({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    retry: false,
  });

  // Fetch live workshops
  const { data: workshops = [], isLoading: workshopsLoading } = useQuery<Workshop[]>({
    queryKey: ['/api/workshops'],
    retry: false,
  });

  // Fetch live exhibitors
  const { data: exhibitors = [], isLoading: exhibitorsLoading } = useQuery<Exhibitor[]>({
    queryKey: ['/api/ai-summit/exhibitors'],
    retry: false,
  });

  // Format time helper
  const formatSessionTime = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: false 
        });
      };
      
      return `${formatTime(start)} - ${formatTime(end)}`;
    } catch (error) {
      return "TBD";
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'keynote': return <Mic className="h-5 w-5 text-purple-600" />;
      case 'talk': return <Users className="h-5 w-5 text-blue-600" />;
      case 'workshop': return <Wrench className="h-5 w-5 text-green-600" />;
      case 'break': return <Coffee className="h-5 w-5 text-orange-600" />;
      case 'exhibition': return <Building className="h-5 w-5 text-red-600" />;
      case 'panel': return <Users className="h-5 w-5 text-indigo-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSessionColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'keynote': return 'bg-purple-50 border-purple-200';
      case 'talk': return 'bg-blue-50 border-blue-200';
      case 'workshop': return 'bg-green-50 border-green-200';
      case 'break': return 'bg-orange-50 border-orange-200';
      case 'exhibition': return 'bg-red-50 border-red-200';
      case 'panel': return 'bg-indigo-50 border-indigo-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // Render loading state
  if (speakingLoading || workshopsLoading || exhibitorsLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Auditorium schedule only
  if (variant === 'auditorium') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">2nd Floor Auditorium Schedule</h3>
        <p className="text-sm text-gray-600">Main Talks • 80 seats</p>
        {speakingSessions.map((session) => (
          <Card key={session.id} className={`border ${getSessionColor(session.sessionType || 'talk')}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getSessionIcon(session.sessionType || 'talk')}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{formatSessionTime(session.startTime, session.endTime)}</span>
                    <Badge variant="outline">{session.sessionType || 'Talk'}</Badge>
                  </div>
                  <h4 className="font-medium mb-1">{session.title}</h4>
                  {session.facilitator && (
                    <p className="text-sm text-gray-600">
                      {session.facilitator}
                      {session.facilitatorCompany && ` - ${session.facilitatorCompany}`}
                    </p>
                  )}
                  {session.description && (
                    <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Workshops schedule only
  if (variant === 'workshops') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Large Classroom Schedule</h3>
        <p className="text-sm text-gray-600">Workshops • 65 seats</p>
        {workshops.map((workshop) => (
          <Card key={workshop.id} className="border border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{formatSessionTime(workshop.startTime, workshop.endTime)}</span>
                    <Badge className="bg-green-100 text-green-800">Workshop</Badge>
                  </div>
                  <h4 className="font-medium mb-1">{workshop.eventName || workshop.title}</h4>
                  {workshop.facilitator && (
                    <p className="text-sm text-gray-600">
                      {workshop.facilitator}
                      {workshop.facilitatorCompany && ` - ${workshop.facilitatorCompany}`}
                    </p>
                  )}
                  {workshop.description && (
                    <p className="text-sm text-gray-500 mt-1">{workshop.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    {workshop.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{workshop.venue}</span>
                      </div>
                    )}
                    {workshop.maxCapacity && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{workshop.maxCapacity} capacity</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Exhibitions only
  if (variant === 'exhibitions') {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">3rd Floor Exhibition Space</h3>
        <p className="text-sm text-gray-600">Micro Expo • Open format</p>
        
        {exhibitors && exhibitors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exhibitors.map((exhibitor, index) => (
              <Card key={exhibitor.id || index} className="border border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-blue-800">
                        {exhibitor.companyName}
                      </h4>
                      {exhibitor.contactName && (
                        <p className="text-sm text-blue-600 mb-1">
                          Contact: {exhibitor.contactName}
                        </p>
                      )}
                      <p className="text-sm text-blue-600">
                        {exhibitor.businessDescription || exhibitor.productsServices || 'Innovative business solutions'}
                      </p>
                      {exhibitor.standLocation && (
                        <p className="text-xs text-blue-500 mt-2">
                          📍 {exhibitor.standLocation} {exhibitor.standNumber && `- Stand ${exhibitor.standNumber}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Exhibition Spaces Available</h4>
            <p className="text-gray-600 mb-4">
              We're currently finalizing our exhibitor lineup. Check back soon!
            </p>
          </div>
        )}
      </div>
    );
  }

  // Compact variant - for embedded use
  if (variant === 'compact') {
    const allSessions = [
      ...speakingSessions.map(s => ({ ...s, type: 'speaking' })),
      ...workshops.map(w => ({ ...w, type: 'workshop' }))
    ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return (
      <div className={`space-y-2 ${className}`}>
        {allSessions.slice(0, 5).map((session, index) => (
          <div key={`${session.type}-${session.id}`} className="flex items-center gap-3 p-2 bg-white rounded border">
            {getSessionIcon(session.sessionType || session.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{session.title || (session as any).eventName}</div>
              <div className="text-xs text-gray-500">
                {formatSessionTime(session.startTime, session.endTime)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Full variant - complete schedule view
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Event Schedule</h2>
        <p className="text-gray-600">Three venues running simultaneously from 10 AM to 4 PM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auditorium */}
        <div>
          <AISummitSchedule variant="auditorium" />
        </div>

        {/* Workshops */}
        <div>
          <AISummitSchedule variant="workshops" />
        </div>

        {/* Exhibitions */}
        <div>
          <AISummitSchedule variant="exhibitions" />
        </div>
      </div>
    </div>
  );
}

export default AISummitSchedule;