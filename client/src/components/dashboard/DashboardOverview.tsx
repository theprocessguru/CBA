import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import DonationWidget from "@/components/donation/DonationWidget";
import IncomeWarningWidget from "@/components/widgets/IncomeWarningWidget";
import {
  Eye,
  Tag,
  Box,
  Building,
  ChevronUp,
  Plus,
  Gift,
  QrCode,
  Calendar,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePersonTypes } from "@/hooks/usePersonTypes";
import { Business, Offer, Product } from "@shared/schema";
import { RestrictedAccessNotice } from "@/components/RestrictedAccessNotice";
import { hasRestrictedAccess } from "@/lib/accessControl";
import BusinessProfileCompletion from "./BusinessProfileCompletion";

const DashboardOverview = () => {
  const { user } = useAuth();
  const participantType = (user as any)?.participantType;
  const { 
    hasBusinessType, 
    hasVolunteerType, 
    hasResidentType, 
    hasStudentType,
    primaryType,
    assignedTypeNames 
  } = usePersonTypes();
  
  const { data: business, isLoading: isLoadingBusiness } = useQuery<Business>({
    queryKey: ['/api/my/business'],
    enabled: !!user,
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/my/products'],
    enabled: !!business,
  });
  
  const { data: offers, isLoading: isLoadingOffers } = useQuery<Offer[]>({
    queryKey: ['/api/my/offers'],
    enabled: !!business,
  });
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!business) return 0;
    
    const fields = [
      business.name,
      business.description,
      business.address,
      business.phone,
      business.email,
      business.website,
      business.logo,
      business.coverImage,
      business.categoryId,
    ];
    
    const completedFields = fields.filter(field => !!field).length;
    return Math.round((completedFields / fields.length) * 100);
  };
  
  const profileCompletion = calculateProfileCompletion();
  const activeOffers = offers?.filter(offer => offer.isActive) || [];
  const totalProducts = products?.length || 0;
  
  const isLoading = isLoadingBusiness || isLoadingProducts || isLoadingOffers;
  
  // Determine what dashboard content to show based on user types
  const renderPersonalizedDashboard = () => {
    
    // Prioritize based on primary type first, then fallback to any type
    if (primaryType?.name === 'volunteer') {
      return renderVolunteerDashboard();
    }
    if (primaryType?.name === 'resident') {
      return renderResidentDashboard();
    }
    if (primaryType?.name === 'student') {
      return renderStudentDashboard();
    }
    if (primaryType?.name === 'business') {
      return renderBusinessDashboard();
    }
    
    // Fallback logic based on original signup choice taking priority
    // Attendees (original "Resident" signups) always get resident dashboard, regardless of later business roles
    if (assignedTypeNames.includes('attendee')) {
      return renderResidentDashboard();
    }
    
    // Volunteers get volunteer-specific dashboard
    if (hasVolunteerType) {
      return renderVolunteerDashboard();
    }
    
    // True residents get community-focused dashboard  
    if (hasResidentType) {
      return renderResidentDashboard();
    }
    
    // Students get student-specific dashboard
    if (hasStudentType) {
      return renderStudentDashboard();
    }
    
    // Pure business users (who signed up as "Business") get business dashboard
    if (hasBusinessType) {
      return renderBusinessDashboard();
    }
    
    // Final fallback - default to resident dashboard for everyone else
    return renderResidentDashboard();
  };

  const renderVolunteerDashboard = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-2">Welcome, Volunteer!</h2>
        <p className="text-green-700">Thank you for volunteering with Croydon Business Association. Here's your volunteer dashboard.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Upcoming Events</p>
                <p className="text-2xl font-bold text-neutral-900">3</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Events you're volunteering for</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Volunteer Hours</p>
                <p className="text-2xl font-bold text-neutral-900">24</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Hours volunteered this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Impact Score</p>
                <p className="text-2xl font-bold text-neutral-900">98</p>
              </div>
              <ChevronUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Community impact rating</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/event-booking">
          <Button className="w-full justify-start" data-testid="button-event-booking">
            <Calendar className="mr-2 h-4 w-4" />
            Book AI Summit Sessions
          </Button>
        </Link>
        <Link href="/events">
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Events
          </Button>
        </Link>
        <Link href="/volunteer-schedule">
          <Button className="w-full justify-start" variant="outline">
            <Building className="mr-2 h-4 w-4" />
            My Schedule
          </Button>
        </Link>
        <Link href="/scanner">
          <Button className="w-full justify-start" variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            Event Scanner
          </Button>
        </Link>
        <Link href="/volunteer-resources">
          <Button className="w-full justify-start" variant="outline">
            <Gift className="mr-2 h-4 w-4" />
            Resources
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderResidentDashboard = () => (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-teal-800 mb-2">Welcome, Croydon Resident!</h2>
        <p className="text-teal-700">Stay connected with your local business community and discover local opportunities.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Local Events</p>
                <p className="text-2xl font-bold text-neutral-900">8</p>
              </div>
              <Calendar className="h-8 w-8 text-teal-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Community events this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Local Offers</p>
                <p className="text-2xl font-bold text-neutral-900">12</p>
              </div>
              <Tag className="h-8 w-8 text-teal-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Resident discounts available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Local Jobs</p>
                <p className="text-2xl font-bold text-neutral-900">6</p>
              </div>
              <Building className="h-8 w-8 text-teal-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Jobs in your area</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/event-booking">
          <Button className="w-full justify-start" data-testid="button-event-booking">
            <Calendar className="mr-2 h-4 w-4" />
            Book AI Summit Sessions
          </Button>
        </Link>
        <Link href="/events">
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Local Events
          </Button>
        </Link>
        <Link href="/special-offers">
          <Button className="w-full justify-start" variant="outline">
            <Tag className="mr-2 h-4 w-4" />
            Resident Offers
          </Button>
        </Link>
        <Link href="/jobs">
          <Button className="w-full justify-start" variant="outline">
            <Building className="mr-2 h-4 w-4" />
            Local Jobs
          </Button>
        </Link>
        <Link href="/community">
          <Button className="w-full justify-start" variant="outline">
            <Gift className="mr-2 h-4 w-4" />
            Community
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome, Student!</h2>
        <p className="text-blue-700">Access student resources, job opportunities, and networking events to boost your career.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Job Applications</p>
                <p className="text-2xl font-bold text-neutral-900">4</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Applications in progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Network Connections</p>
                <p className="text-2xl font-bold text-neutral-900">15</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Professional connections made</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Skills Events</p>
                <p className="text-2xl font-bold text-neutral-900">7</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">Workshops attended</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/event-booking">
          <Button className="w-full justify-start" data-testid="button-event-booking">
            <Calendar className="mr-2 h-4 w-4" />
            Book AI Summit Sessions
          </Button>
        </Link>
        <Link href="/jobs">
          <Button className="w-full justify-start" variant="outline">
            <Building className="mr-2 h-4 w-4" />
            Find Jobs
          </Button>
        </Link>
        <Link href="/events">
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Workshops
          </Button>
        </Link>
        <Link href="/connections">
          <Button className="w-full justify-start" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Network
          </Button>
        </Link>
        <Link href="/student-resources">
          <Button className="w-full justify-start" variant="outline">
            <Gift className="mr-2 h-4 w-4" />
            Resources
          </Button>
        </Link>
      </div>
    </div>
  );

  const renderBusinessDashboard = () => (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Profile Views</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : "0"}
                </p>
              </div>
              <div className="h-10 w-10 bg-primary-light rounded-full flex items-center justify-center text-white">
                <Eye className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2 flex items-center">
              Start tracking views by completing your profile
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Active Offers</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : activeOffers.length}
                </p>
              </div>
              <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center text-white">
                <Tag className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {activeOffers.length === 0 ? "Create your first offer" : `${activeOffers.length} active offer${activeOffers.length > 1 ? 's' : ''}`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Listed Products</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {isLoading ? <Skeleton className="h-8 w-16" /> : totalProducts}
                </p>
              </div>
              <div className="h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white">
                <Box className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {totalProducts === 0 ? "Add your first product or service" : `${totalProducts} product${totalProducts > 1 ? 's' : ''} and services`}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Profile Completion */}
      <BusinessProfileCompletion />
      
      <div>
        <h4 className="font-medium text-neutral-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href="/event-booking">
            <Button className="w-full justify-start" data-testid="button-event-booking">
              <Calendar className="mr-2 h-4 w-4" />
              Book AI Summit Sessions
            </Button>
          </Link>
          <Link href={hasBusinessType ? "/dashboard/business-profile" : "/my-profile"}>
            <Button className="w-full justify-start" variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </Link>
          {hasBusinessType && (
            <Link href="/dashboard/products-services">
              <Button className="w-full justify-start" variant="outline">
                <Box className="mr-2 h-4 w-4" />
                Add Products
              </Button>
            </Link>
          )}
          {hasBusinessType && (
            <Link href="/dashboard/special-offers">
              <Button className="w-full justify-start" variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Create Offer
              </Button>
            </Link>
          )}
          <Link href="/badge-scanner">
            <Button className="w-full justify-start" variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Scan Badges
            </Button>
          </Link>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Only show HMRC widget for pure business users, not residents */}
          {primaryType?.name === 'business' && (
            <IncomeWarningWidget showTitle={false} />
          )}
          <DonationWidget 
            showInline={true}
            trigger={
              <Button variant="outline" className="w-full gap-2">
                <Gift className="h-4 w-4" />
                Support CBA with a Donation
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard Overview</h1>
      
      {/* Show restricted access notice for limited participant types */}
      <RestrictedAccessNotice participantType={participantType} />
      
      {/* Render personalized dashboard based on user types */}
      {renderPersonalizedDashboard()}
    </div>
  );
};

export default DashboardOverview;
