import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  Users, 
  Star, 
  Ticket, 
  Crown, 
  Zap, 
  Shield, 
  Award,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";

// Comprehensive membership benefits matrix
const membershipBenefits = {
  "Starter Tier": {
    color: "bg-gray-100 text-gray-800",
    icon: <Users className="w-5 h-5" />,
    price: "£9.99/month",
    events: {
      freeEvents: 2,
      discountPercent: 0,
      priorityBooking: false,
      features: ["Access to basic workshops", "Digital certificates", "Community forum access"]
    },
    business: {
      directoryListing: true,
      featuredListing: false,
      promotionalSpots: 1,
      features: ["Basic business directory listing", "Member-to-member offers", "Monthly newsletter"]
    },
    networking: {
      networkingEvents: "Limited access",
      oneOnOneSessions: 0,
      mentorshipProgram: false,
      features: ["Basic networking events", "Online community access"]
    },
    support: {
      supportLevel: "Email only",
      responseTime: "48 hours",
      businessReviews: false,
      features: ["Email support", "Resource library access"]
    }
  },
  "Growth Tier": {
    color: "bg-blue-100 text-blue-800",
    icon: <Zap className="w-5 h-5" />,
    price: "£24.99/month",
    events: {
      freeEvents: 5,
      discountPercent: 25,
      priorityBooking: true,
      features: ["Access to all workshops", "Priority booking", "25% discount on paid events", "Physical certificates", "Workshop recordings access"]
    },
    business: {
      directoryListing: true,
      featuredListing: true,
      promotionalSpots: 3,
      features: ["Featured directory listing", "Social media promotion", "Business showcase opportunities", "Monthly promotional spots"]
    },
    networking: {
      networkingEvents: "Full access",
      oneOnOneSessions: 2,
      mentorshipProgram: true,
      features: ["All networking events", "2 monthly 1-on-1 sessions", "Mentorship matching"]
    },
    support: {
      supportLevel: "Phone & Email",
      responseTime: "24 hours",
      businessReviews: true,
      features: ["Priority support", "Monthly business review", "Growth planning assistance"]
    }
  },
  "Strategic Tier": {
    color: "bg-purple-100 text-purple-800",
    icon: <Shield className="w-5 h-5" />,
    price: "£49.99/month",
    events: {
      freeEvents: 10,
      discountPercent: 50,
      priorityBooking: true,
      features: ["Unlimited workshop access", "50% discount on all events", "VIP seating", "1-on-1 networking sessions", "Early access to new workshops"]
    },
    business: {
      directoryListing: true,
      featuredListing: true,
      promotionalSpots: 5,
      features: ["Premium directory placement", "Weekly social promotion", "Guest blog opportunities", "Partnership introductions"]
    },
    networking: {
      networkingEvents: "VIP access",
      oneOnOneSessions: 5,
      mentorshipProgram: true,
      features: ["VIP networking access", "5 monthly 1-on-1 sessions", "Executive networking events", "Industry connections"]
    },
    support: {
      supportLevel: "Dedicated support",
      responseTime: "12 hours",
      businessReviews: true,
      features: ["Dedicated account manager", "Bi-weekly business reviews", "Strategic planning sessions", "Market analysis"]
    }
  },
  "Patron Tier": {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Crown className="w-5 h-5" />,
    price: "£99.99/month",
    events: {
      freeEvents: 999,
      discountPercent: 75,
      priorityBooking: true,
      features: ["Unlimited free events", "75% discount on premium events", "Speaker meet & greet", "Exclusive content access", "Workshop co-hosting opportunities"]
    },
    business: {
      directoryListing: true,
      featuredListing: true,
      promotionalSpots: 10,
      features: ["Top-tier directory placement", "Daily social promotion", "Sponsored content opportunities", "Press release distribution"]
    },
    networking: {
      networkingEvents: "Executive access",
      oneOnOneSessions: 999,
      mentorshipProgram: true,
      features: ["Executive networking circles", "Unlimited 1-on-1 sessions", "Board advisor introductions", "International connections"]
    },
    support: {
      supportLevel: "24/7 premium",
      responseTime: "4 hours",
      businessReviews: true,
      features: ["24/7 premium support", "Weekly strategic reviews", "C-suite advisory", "Crisis management support"]
    }
  },
  "Partner": {
    color: "bg-green-100 text-green-800",
    icon: <Award className="w-5 h-5" />,
    price: "£199.99/month",
    events: {
      freeEvents: 999,
      discountPercent: 100,
      priorityBooking: true,
      features: ["All events completely free", "Co-hosting opportunities", "Speaking opportunities", "Brand partnerships", "Event revenue sharing"]
    },
    business: {
      directoryListing: true,
      featuredListing: true,
      promotionalSpots: 999,
      features: ["Premium brand placement", "Co-marketing opportunities", "Partnership announcements", "Thought leadership platform"]
    },
    networking: {
      networkingEvents: "Host access",
      oneOnOneSessions: 999,
      mentorshipProgram: true,
      features: ["Event hosting privileges", "Unlimited access to all members", "Advisory board participation", "Global network access"]
    },
    support: {
      supportLevel: "White-glove",
      responseTime: "Immediate",
      businessReviews: true,
      features: ["White-glove service", "Daily strategic support", "Board-level advisory", "Custom business solutions"]
    }
  }
};

const BenefitItem = ({ included, text }: { included: boolean; text: string }) => (
  <div className="flex items-center space-x-2">
    {included ? (
      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
    ) : (
      <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />
    )}
    <span className={`text-sm ${included ? "text-gray-900" : "text-gray-400"}`}>
      {text}
    </span>
  </div>
);

export default function MyBenefitsPage() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Membership Benefits</h1>
          <p className="text-muted-foreground mb-8">Please login to view your membership benefits</p>
          <Link href="/login">
            <Button>Login to View Benefits</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentTier = (user as any)?.membershipTier || "Starter Tier";
  const currentBenefits = membershipBenefits[currentTier as keyof typeof membershipBenefits];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Membership Benefits</h1>
        <p className="text-muted-foreground">Your current membership tier and all available benefits</p>
      </div>

      {/* Current Tier Overview */}
      <Card className="mb-8 border-2 border-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentBenefits?.icon}
              <div>
                <CardTitle className="text-xl">Your Current Tier: {currentTier}</CardTitle>
                <p className="text-muted-foreground">{currentBenefits?.price}</p>
              </div>
            </div>
            <Badge className={currentBenefits?.color}>Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Benefits */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Event Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Free Events per Month:</span>
                  <span className="text-sm">{currentBenefits?.events.freeEvents === 999 ? "Unlimited" : currentBenefits?.events.freeEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Event Discount:</span>
                  <span className="text-sm">{currentBenefits?.events.discountPercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Priority Booking:</span>
                  <span className="text-sm">{currentBenefits?.events.priorityBooking ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="space-y-1">
                {currentBenefits?.events.features.map((feature, index) => (
                  <BenefitItem key={index} included={true} text={feature} />
                ))}
              </div>
            </div>
          </div>

          {/* Business Benefits */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Business Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Directory Listing:</span>
                  <span className="text-sm">{currentBenefits?.business.directoryListing ? "Included" : "Not included"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Featured Listing:</span>
                  <span className="text-sm">{currentBenefits?.business.featuredListing ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monthly Promotional Spots:</span>
                  <span className="text-sm">{currentBenefits?.business.promotionalSpots === 999 ? "Unlimited" : currentBenefits?.business.promotionalSpots}</span>
                </div>
              </div>
              <div className="space-y-1">
                {currentBenefits?.business.features.map((feature, index) => (
                  <BenefitItem key={index} included={true} text={feature} />
                ))}
              </div>
            </div>
          </div>

          {/* Networking Benefits */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Networking Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Networking Events:</span>
                  <span className="text-sm">{currentBenefits?.networking.networkingEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">1-on-1 Sessions/Month:</span>
                  <span className="text-sm">{currentBenefits?.networking.oneOnOneSessions === 999 ? "Unlimited" : currentBenefits?.networking.oneOnOneSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Mentorship Program:</span>
                  <span className="text-sm">{currentBenefits?.networking.mentorshipProgram ? "Included" : "Not included"}</span>
                </div>
              </div>
              <div className="space-y-1">
                {currentBenefits?.networking.features.map((feature, index) => (
                  <BenefitItem key={index} included={true} text={feature} />
                ))}
              </div>
            </div>
          </div>

          {/* Support Benefits */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Support Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Support Level:</span>
                  <span className="text-sm">{currentBenefits?.support.supportLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Response Time:</span>
                  <span className="text-sm">{currentBenefits?.support.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Business Reviews:</span>
                  <span className="text-sm">{currentBenefits?.support.businessReviews ? "Included" : "Not included"}</span>
                </div>
              </div>
              <div className="space-y-1">
                {currentBenefits?.support.features.map((feature, index) => (
                  <BenefitItem key={index} included={true} text={feature} />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/events">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Browse Events</h3>
              <p className="text-sm text-muted-foreground">View upcoming workshops and seminars</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/directory">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Member Directory</h3>
              <p className="text-sm text-muted-foreground">Connect with other members</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/membership">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold mb-1">Upgrade Membership</h3>
              <p className="text-sm text-muted-foreground">Get more benefits and features</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* All Tiers Comparison */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Compare All Membership Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Object.entries(membershipBenefits).map(([tierName, benefits]) => (
            <Card key={tierName} className={`${tierName === currentTier ? 'border-2 border-primary' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  {benefits.icon}
                  <div>
                    <CardTitle className="text-sm">{tierName}</CardTitle>
                    <p className="text-xs text-muted-foreground">{benefits.price}</p>
                  </div>
                </div>
                {tierName === currentTier && (
                  <Badge className="w-fit">Current</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <h4 className="font-medium mb-1">Events</h4>
                  <p>Free: {benefits.events.freeEvents === 999 ? "Unlimited" : benefits.events.freeEvents}/month</p>
                  <p>Discount: {benefits.events.discountPercent}%</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Business</h4>
                  <p>Promo spots: {benefits.business.promotionalSpots === 999 ? "Unlimited" : benefits.business.promotionalSpots}/month</p>
                  <p>Featured: {benefits.business.featuredListing ? "Yes" : "No"}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Support</h4>
                  <p>{benefits.support.supportLevel}</p>
                  <p>{benefits.support.responseTime}</p>
                </div>
                {tierName !== currentTier && (
                  <Link href="/membership">
                    <Button size="sm" className="w-full">
                      {tierName > currentTier ? "Upgrade" : "Change Plan"}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}