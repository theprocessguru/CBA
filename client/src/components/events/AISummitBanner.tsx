import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

const AISummitBanner = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-16 right-8 w-8 h-8 bg-white rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-8 left-12 w-6 h-6 bg-white rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-4 right-16 w-10 h-10 bg-white rounded-full animate-pulse delay-300"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative">
        <div className="text-center space-y-4">
          {/* Event Badge */}
          <div className="flex justify-center">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2 font-semibold">
              <Sparkles className="mr-2 h-4 w-4" />
              INAUGURAL EVENT - FREE ADMISSION
            </Badge>
          </div>
          
          {/* Main Title */}
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            🚀 First AI Summit Croydon
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 font-medium">
            Position Yourself at the Forefront of AI Innovation
          </p>
          
          {/* Event Details */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm md:text-base py-4">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">October 1st, 2025</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="font-medium">10 AM - 4 PM</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">LSBU Croydon</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Users className="h-4 w-4" />
              <span className="font-medium text-green-200">Limited Places</span>
            </div>
          </div>
          
          {/* Value Proposition */}
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-blue-100 mb-4">
              Join industry experts, entrepreneurs, and AI enthusiasts for a day of learning, networking, 
              and hands-on workshops. Discover how AI can transform your business.
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-sm font-medium">Expert Talks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🛠️</div>
                <div className="text-sm font-medium">Hands-on Workshops</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🤝</div>
                <div className="text-sm font-medium">Networking</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-sm font-medium">AI Exhibition</div>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/ai-summit">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3">
                <Users className="mr-2 h-5 w-5" />
                <span>Register FREE Now</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/membership-benefits">
              <Button size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3">
                <span>Join CBA Membership</span>
              </Button>
            </Link>
          </div>
          
          {/* Urgency Indicator */}
          <div className="pt-4">
            <p className="text-sm text-yellow-200 font-medium">
              ⚡ Secure your spot today - Places filling fast!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISummitBanner;