import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  Tag,
  Box,
  Building,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Business, Offer, Product } from "@shared/schema";

const DashboardOverview = () => {
  const { user } = useAuth();
  
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
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Dashboard Overview</h1>
      
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
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h4 className="font-medium text-neutral-900 mb-2">Business Profile Completion</h4>
          {isLoading ? (
            <Skeleton className="h-2.5 w-full mb-2" />
          ) : (
            <>
              <Progress value={profileCompletion} className="h-2.5" />
              <div className="flex justify-between mt-2 text-xs text-neutral-500">
                <span>{profileCompletion}% complete</span>
                <Link href="/dashboard/business-profile">
                  <a className="text-primary hover:text-primary-dark">Complete now</a>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <div>
        <h4 className="font-medium text-neutral-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/dashboard/business-profile">
            <Button className="w-full justify-start" variant="outline">
              <Building className="mr-2 h-4 w-4" />
              Update Profile
            </Button>
          </Link>
          <Link href="/dashboard/products-services">
            <Button className="w-full justify-start" variant="outline">
              <Box className="mr-2 h-4 w-4" />
              Add Products
            </Button>
          </Link>
          <Link href="/dashboard/special-offers">
            <Button className="w-full justify-start" variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Create Offer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
