import { useState, useEffect } from 'react';
import { X, Clock, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';

interface CountdownPopupProps {
  targetDate: string; // ISO date string like "2025-10-01T10:00:00"
  onClose: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownPopup = ({ targetDate, onClose }: CountdownPopupProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 shadow-2xl">
        <CardContent className="p-6 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            data-testid="button-close-countdown-popup"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full">
                <Clock className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🚀 AI Summit 2025 Starting Soon!
            </h2>
            <p className="text-gray-600">
              Don't miss out! Register now for workshops and speaking sessions.
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center">
              <div className="bg-purple-600 text-white rounded-lg p-3">
                <div className="text-2xl font-bold">{timeLeft.days}</div>
                <div className="text-xs uppercase tracking-wide">Days</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-lg p-3">
                <div className="text-2xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs uppercase tracking-wide">Hours</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-indigo-600 text-white rounded-lg p-3">
                <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs uppercase tracking-wide">Min</div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-purple-700 text-white rounded-lg p-3">
                <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                <div className="text-xs uppercase tracking-wide">Sec</div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-white/70 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span><strong>Date:</strong> 1 October 2025</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-purple-600" />
              <span><strong>Time:</strong> 10:00 AM - 4:00 PM</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="h-4 w-4 text-purple-600" />
              <span><strong>Status:</strong> Attendee seats still available for workshops & talks</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/event-booking">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
                data-testid="button-register-workshops"
              >
                Register for Workshops Now
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                variant="outline" 
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                data-testid="button-login-register"
              >
                Login to Book Your Spot
              </Button>
            </Link>
          </div>

          {/* Urgency Message */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ⏰ <span className="font-medium">Limited time remaining</span> to secure your workshop seats!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CountdownPopup;