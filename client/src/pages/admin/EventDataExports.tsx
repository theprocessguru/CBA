import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Users, Utensils, Shirt, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  eventType: string;
}

interface VolunteerSummary {
  totalVolunteers: number;
  dietaryRestrictions: Record<string, number>;
  tshirtSizes: Record<string, number>;
  volunteersWithAllergies: number;
  volunteersWithDietaryNotes: number;
}

export default function EventDataExports() {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Fetch published events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  // Fetch volunteer summary for selected event
  const { data: volunteerSummary, isLoading: summaryLoading } = useQuery<VolunteerSummary>({
    queryKey: ["/api/admin/events", selectedEvent?.id, "volunteers", "summary"],
    enabled: !!selectedEvent?.id,
  });

  const downloadVolunteerExport = async (eventId: number) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/volunteers/export`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export volunteers');
      }

      // Get the filename from the response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `event-${eventId}-volunteers.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Volunteer list with dietary information has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to download volunteer list: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const downloadAttendeeExport = async (eventId: number) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}/attendees/export`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export attendees');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `event-${eventId}-attendees.csv`;

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: "Attendee list has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to download attendee list: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Loading events...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Data Exports</h1>
        <p className="text-muted-foreground">Export volunteer and attendee lists with dietary information for event planning</p>
      </div>

      <div className="grid gap-6">
        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Select Event to Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <Badge
                        variant={event.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.startDate), "MMM dd, yyyy")} • {event.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Actions */}
        {selectedEvent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-5 h-5 mr-2" />
                Export Options for "{selectedEvent.title}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      Volunteer Data
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download volunteer list with dietary information, t-shirt sizes, and contact details
                    </p>
                    <Button
                      onClick={() => downloadVolunteerExport(selectedEvent.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Volunteers CSV
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Attendee Data
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Download attendee list with registration details and dietary information
                    </p>
                    <Button
                      onClick={() => downloadAttendeeExport(selectedEvent.id)}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Attendees CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Volunteer Summary */}
        {selectedEvent && volunteerSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="w-5 h-5 mr-2" />
                Volunteer Summary & Dietary Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Total Volunteers */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{volunteerSummary.totalVolunteers}</div>
                  <div className="text-sm text-muted-foreground">Total Volunteers</div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <h4 className="font-medium flex items-center mb-3">
                    <Utensils className="w-4 h-4 mr-2" />
                    Dietary Restrictions
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(volunteerSummary.dietaryRestrictions).map(([restriction, count]) => (
                      <div key={restriction} className="flex justify-between text-sm">
                        <span className="capitalize">{restriction.replace('_', ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                  {volunteerSummary.volunteersWithAllergies > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-1 text-yellow-600" />
                      <strong>{volunteerSummary.volunteersWithAllergies}</strong> volunteers have food allergies
                    </div>
                  )}
                </div>

                {/* T-shirt Sizes */}
                <div>
                  <h4 className="font-medium flex items-center mb-3">
                    <Shirt className="w-4 h-4 mr-2" />
                    T-shirt Sizes
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(volunteerSummary.tshirtSizes).map(([size, count]) => (
                      <div key={size} className="flex justify-between text-sm">
                        <span className="uppercase">{size}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {volunteerSummary.volunteersWithDietaryNotes > 0 && (
                <div className="mt-6 p-3 bg-blue-50 rounded">
                  <div className="text-sm">
                    <strong>{volunteerSummary.volunteersWithDietaryNotes}</strong> volunteers have additional dietary notes.
                    Check the exported CSV for detailed requirements.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!selectedEvent && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Select an Event</h3>
              <p className="text-muted-foreground">Choose an event above to view export options and volunteer summary</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}