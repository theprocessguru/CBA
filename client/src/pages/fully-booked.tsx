import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserPlus, 
  Users, 
  Mic, 
  Building, 
  BookOpen, 
  Star,
  CheckCircle,
  Heart,
  MessageCircle
} from "lucide-react";

const FullyBooked = () => {
  return (
    <>
      <Helmet>
        <title>AI Summit 2025 - Fully Booked | CBA</title>
        <meta name="description" content="The First AI Summit Croydon 2025 workshops, speaking slots, and exhibition spaces are now fully booked. Attendee registration still available." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center space-y-6">
              <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
                ✨ UNPRECEDENTED DEMAND
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                AI Summit 2025
                <span className="block text-3xl md:text-5xl text-purple-200">Fully Booked!</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Due to overwhelming response, our workshops, speaking opportunities, and exhibition spaces are now completely sold out
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>January 27, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>LSBU Croydon</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fully Booked Sections */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Sold Out Notice */}
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-red-700 flex items-center justify-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  Summit Capacity Reached
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-red-600 font-medium">
                  Thank you for the incredible response! Speaking slots and exhibition spaces are now fully booked, but workshops are still available:
                </p>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-semibold">Workshops</span>
                    </div>
                    <Link href="/event-booking">
                      <Badge className="bg-green-100 text-green-800 w-full cursor-pointer hover:bg-green-200">STILL AVAILABLE</Badge>
                    </Link>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                      <Mic className="h-5 w-5" />
                      <span className="font-semibold">Speaking Slots</span>
                    </div>
                    <Badge className="bg-red-100 text-red-800 w-full">FULLY BOOKED</Badge>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                      <Building className="h-5 w-5" />
                      <span className="font-semibold">Exhibition Spaces</span>
                    </div>
                    <Badge className="bg-red-100 text-red-800 w-full">FULLY BOOKED</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Still Available */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-green-700 flex items-center justify-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  Attendee Registration Still Available
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-lg text-green-600 font-medium">
                  Good news! We still have attendee spots available for you to join this incredible AI learning experience.
                </p>
                
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">As an Attendee, You'll Still Enjoy:</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Access to all keynote presentations</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Networking opportunities with 400+ attendees</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>AI demonstration zones</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Exhibition hall access</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Complimentary refreshments</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <span>Exclusive AI resources and takeaways</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/ai-summit">
                    <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 font-semibold shadow-lg">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Register as Attendee - FREE
                    </Button>
                  </Link>
                  <Link href="/my-registrations">
                    <Button variant="outline" className="text-lg px-8 py-4 font-semibold">
                      <Calendar className="h-5 w-5 mr-2" />
                      View My Schedule
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-800 flex items-center justify-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Thank You for Your Interest
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600 text-lg">
                  Your enthusiasm has made this the most successful AI event in South London's history!
                </p>
                
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">Stay Connected for Future Opportunities</h3>
                  <div className="space-y-2 text-blue-700">
                    <p>🚀 Priority access to future AI Summit events</p>
                    <p>📧 Exclusive AI business insights and updates</p>
                    <p>🤝 Year-round networking opportunities</p>
                    <p>💡 Advanced workshops and masterclasses</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Link href="/membership">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                      <Star className="h-4 w-4 mr-2" />
                      Join CBA Membership
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" className="px-6 py-3">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullyBooked;