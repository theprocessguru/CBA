import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, ExternalLink, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface WorkshopBooking {
  id: string;
  workshopTitle: string;
  workshopDescription?: string;
  providerName: string;
  providerEmail: string;
  scheduledDate?: string;
  scheduledTime?: string;
  duration?: string;
  location?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookingDate: string;
  workshopId?: string;
  price?: number;
  maxParticipants?: number;
  currentParticipants?: number;
}

interface WorkshopBookingsSectionProps {
  userId: string;
}

export function WorkshopBookingsSection({ userId }: WorkshopBookingsSectionProps) {
  const [, setLocation] = useLocation();
  
  // Fetch user's workshop bookings
  const { data: bookings = [], isLoading, error } = useQuery<WorkshopBooking[]>({
    queryKey: [`/api/users/${userId}/workshop-bookings`],
    enabled: !!userId,
  });

  // Group bookings by status
  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'confirmed' && 
    (!booking.scheduledDate || new Date(booking.scheduledDate) >= new Date())
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || 
    (booking.scheduledDate && new Date(booking.scheduledDate) < new Date())
  );
  
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  const handleViewWorkshopDetails = (workshopId?: string, workshopTitle?: string) => {
    if (workshopId) {
      setLocation(`/workshops/${workshopId}`);
    } else if (workshopTitle) {
      // If no ID, search for workshop by title
      setLocation(`/workshops?search=${encodeURIComponent(workshopTitle)}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Time TBD';
    return timeString;
  };

  const WorkshopCard = ({ booking }: { booking: WorkshopBooking }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {booking.workshopTitle}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <User className="w-4 h-4" />
              <span>by {booking.providerName}</span>
            </div>
          </div>
          <Badge className={getStatusColor(booking.status)}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </div>
        
        {booking.workshopDescription && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {booking.workshopDescription}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          {booking.scheduledDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.scheduledDate)}</span>
            </div>
          )}
          
          {booking.scheduledTime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(booking.scheduledTime)}</span>
              {booking.duration && <span>({booking.duration})</span>}
            </div>
          )}
          
          {booking.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{booking.location}</span>
            </div>
          )}
          
          {booking.price && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Price: £{booking.price}</span>
            </div>
          )}
          
          {booking.maxParticipants && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Participants: {booking.currentParticipants || 0} / {booking.maxParticipants}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewWorkshopDetails(booking.workshopId, booking.workshopTitle)}
            data-testid={`button-view-workshop-${booking.id}`}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {booking.status === 'confirmed' && booking.scheduledDate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Add to calendar functionality could go here
                const calendarEvent = {
                  title: booking.workshopTitle,
                  start: new Date(booking.scheduledDate),
                  description: `Workshop by ${booking.providerName}`
                };
                console.log('Add to calendar:', calendarEvent);
              }}
              data-testid={`button-add-calendar-${booking.id}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Workshop Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">Loading your workshop bookings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Workshop Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Failed to load workshop bookings. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Workshop Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Workshop Bookings</h3>
            <p className="text-gray-600 mb-4">
              You haven't booked any workshops yet. Browse our available workshops to get started!
            </p>
            <Button
              onClick={() => setLocation('/workshops')}
              data-testid="button-browse-workshops"
            >
              Browse Workshops
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Workshop Bookings
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/workshops')}
            data-testid="button-browse-more-workshops"
          >
            Browse More
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Upcoming Workshops */}
        {upcomingBookings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Upcoming Workshops ({upcomingBookings.length})
            </h3>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <WorkshopCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Workshops */}
        {pendingBookings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Pending Confirmations ({pendingBookings.length})
            </h3>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <WorkshopCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Past Workshops */}
        {pastBookings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Completed Workshops ({pastBookings.length})
            </h3>
            <div className="space-y-4">
              {pastBookings.slice(0, 3).map((booking) => (
                <WorkshopCard key={booking.id} booking={booking} />
              ))}
            </div>
            {pastBookings.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/profile/workshop-history')}
                className="w-full mt-2"
                data-testid="button-view-all-history"
              >
                View All Workshop History ({pastBookings.length})
              </Button>
            )}
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}