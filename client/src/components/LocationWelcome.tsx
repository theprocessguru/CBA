import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, X } from "lucide-react";

interface Venue {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  radius: number; // meters
}

const VENUES: Venue[] = [
  {
    name: "London South Bank University",
    latitude: 51.4989,
    longitude: -0.1018,
    address: "103 Borough Rd, London SE1 0AA",
    radius: 200 // 200 meters radius
  },
  {
    name: "Croydon Business Centre",
    latitude: 51.3762,
    longitude: -0.0982,
    address: "Croydon, London",
    radius: 200
  }
];

export function LocationWelcome() {
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
  const [nearbyVenue, setNearbyVenue] = useState<Venue | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState<string[]>([]);
  const { toast } = useToast();

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Check if user is near any venue
  const checkNearbyVenue = (position: GeolocationPosition) => {
    for (const venue of VENUES) {
      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        venue.latitude,
        venue.longitude
      );

      if (distance <= venue.radius && !hasWelcomed.includes(venue.name)) {
        setNearbyVenue(venue);
        setShowWelcome(true);
        setHasWelcomed([...hasWelcomed, venue.name]);
        
        // Show welcome toast
        toast({
          title: `Welcome to ${venue.name}! 🎉`,
          description: "We're excited to have you here today. Check out what's happening!",
          duration: 5000,
        });
        
        break;
      }
    }
  };

  // Request location permission
  const requestLocationPermission = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position);
          setLocationEnabled(true);
          checkNearbyVenue(position);
          
          // Set up continuous tracking
          const watchId = navigator.geolocation.watchPosition(
            (newPosition) => {
              setUserLocation(newPosition);
              checkNearbyVenue(newPosition);
            },
            (error) => {
              console.error("Location error:", error);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            }
          );

          // Cleanup on unmount
          return () => navigator.geolocation.clearWatch(watchId);
        },
        (error) => {
          console.error("Location permission denied:", error);
          toast({
            title: "Location Access",
            description: "Enable location to get venue directions and welcome messages.",
            variant: "default",
          });
        }
      );
    }
  };

  // Get directions to a venue
  const getDirections = (venue: Venue) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}&destination_place_id=${encodeURIComponent(venue.name)}`;
    window.open(mapsUrl, '_blank');
  };

  useEffect(() => {
    // Check if user has previously granted location permission
    if ("permissions" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          requestLocationPermission();
        }
      });
    }
  }, []);

  return (
    <>
      {/* Location Permission Request */}
      {!locationEnabled && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <Card className="shadow-lg border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Enable Location Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Get directions to event venues and receive welcome messages when you arrive.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={requestLocationPermission}
                  className="flex-1"
                >
                  Enable
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setLocationEnabled(true)}
                  className="flex-1"
                >
                  Not Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Welcome Message */}
      {showWelcome && nearbyVenue && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4">
          <Card className="shadow-xl border-primary bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 h-6 w-6"
                onClick={() => setShowWelcome(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg pr-8">
                Welcome to {nearbyVenue.name}! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                We're thrilled to have you here! Don't forget to check in at the registration desk.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{nearbyVenue.address}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => getDirections(nearbyVenue)}
                  className="flex-1"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowWelcome(false)}
                  className="flex-1"
                >
                  Got It!
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}