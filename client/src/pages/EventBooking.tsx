import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft } from "lucide-react";
import { EventBookingTab } from "@/components/profile/EventBookingTab";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function EventBooking() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Event Booking | Croydon Business Association</title>
        <meta name="description" content="Book your seats for AI Summit sessions and workshops" />
      </Helmet>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              Event Booking
            </h1>
            <p className="text-gray-600 mt-1">Register for AI Summit sessions and manage your bookings</p>
          </div>
        </div>

        {/* Event Booking Content */}
        <Card>
          <CardContent className="p-6">
            <EventBookingTab />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}