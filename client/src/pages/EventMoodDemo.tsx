import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoodTracker } from "@/components/MoodTracker";
import { MoodVisualization } from "@/components/MoodVisualization";
import { Brain, Presentation, Users, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AI_SUMMIT_DATE } from "@/lib/constants";

export function EventMoodDemo() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");

  // Fetch live events data
  const { data: liveEvents = [], isLoading: eventsLoading } = useQuery<any[]>({
    queryKey: ['/api/events'],
    retry: false,
  });

  // Fetch AI Summit speaking sessions for session data
  const { data: liveSpeakingSessions = [], isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/ai-summit/speaking-sessions/active'],
    retry: false,
  });

  // Transform live events to match expected format, with corrected AI Summit date
  const events = liveEvents.map(event => {
    if (event.eventName?.includes('AI Summit')) {
      return {
        id: event.id,
        name: event.eventName,
        date: AI_SUMMIT_DATE // Use correct date for AI Summit
      };
    }
    return {
      id: event.id,
      name: event.eventName || event.title,
      date: new Date(event.eventDate || event.startDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  });

  // Default to AI Summit if no live events
  const finalEvents = events.length > 0 ? events : [
    { id: 1, name: "First AI Summit Croydon 2025", date: "January 27, 2025" },
  ];

  // Transform speaking sessions to session names
  const sessions = liveSpeakingSessions.map(session => session.title || session.name).filter(Boolean);
  const finalSessions = sessions.length > 0 ? sessions : [
    "Opening Keynote",
    "AI in Business Workshop",
    "Panel Discussion",
    "Networking Break",
    "Closing Remarks"
  ];

  const selectedEventId = selectedEvent ? parseInt(selectedEvent) : 1;
  const selectedEventData = finalEvents.find(e => e.id === selectedEventId);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Real-time Event Mood Tracking
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Track attendee emotions and sentiment during events in real-time. 
          Understand how your audience feels about different sessions and content.
        </p>
        
        {/* Event Selection */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-gray-600" />
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {finalEvents.map(event => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Session (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {finalSessions.map(session => (
                  <SelectItem key={session} value={session}>
                    {session}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedEventData && (
          <div className="flex items-center justify-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Users className="h-4 w-4 mr-1" />
              Event: {selectedEventData.name}
            </Badge>
            <Badge variant="secondary" className="text-sm">
              Date: {selectedEventData.date}
            </Badge>
          </div>
        )}
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Brain className="h-5 w-5" />
              Mood Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700">
            <p>Attendees can quickly share their emotions using our intuitive mood tracker with emoji-based selection and intensity levels.</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="h-5 w-5" />
              Real-time Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-700">
            <p>View live sentiment data with automatic aggregation, session breakdowns, and trend analysis as the event unfolds.</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Presentation className="h-5 w-5" />
              Session Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-purple-700">
            <p>Track mood changes across different sessions to identify what resonates most with your audience.</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Tracker */}
        <div>
          <MoodTracker 
            eventId={selectedEventId}
            sessionName={selectedSession || undefined}
          />
        </div>

        {/* Mood Visualization */}
        <div>
          <MoodVisualization 
            eventId={selectedEventId}
            autoRefresh={true}
            refreshInterval={10000}
          />
        </div>
      </div>

      {/* Compact Tracker Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Compact Mode</h2>
        <p className="text-gray-600 text-center">
          Perfect for embedding in event apps or displaying on screens throughout the venue
        </p>
        <div className="max-w-md mx-auto">
          <MoodTracker 
            eventId={selectedEventId}
            sessionName={selectedSession || undefined}
            compact={true}
          />
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-medium">Quick Selection</p>
                <p className="text-sm text-gray-600">Attendees choose their mood with visual emoji icons</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <p className="font-medium">Intensity Rating</p>
                <p className="text-sm text-gray-600">Rate feeling intensity from 1-10 using a slider</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <p className="font-medium">Real-time Analysis</p>
                <p className="text-sm text-gray-600">Data is instantly aggregated and visualized for organizers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg">Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Immediate Feedback</p>
                <p className="text-sm text-gray-600">Know if your content is connecting with the audience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Session Optimization</p>
                <p className="text-sm text-gray-600">Adjust presentations based on real-time mood data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Post-Event Analysis</p>
                <p className="text-sm text-gray-600">Use data to improve future events and content</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}