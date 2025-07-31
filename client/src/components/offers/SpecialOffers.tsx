import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag, Clock, Store, ExternalLink, AlertCircle, Crown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Offer } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const SpecialOffers = () => {
  const { isAuthenticated } = useAuth();
  const { data: offers, isLoading, error } = useQuery<Offer[]>({
    queryKey: ['/api/offers'],
  });

  const calculateMemberPrice = (offer: Offer) => {
    if (!offer.originalPrice) return null;
    
    if (offer.memberDiscountPercentage) {
      return offer.originalPrice * (1 - offer.memberDiscountPercentage / 100);
    } else if (offer.memberDiscountValue) {
      return Math.max(0, offer.originalPrice - offer.memberDiscountValue);
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Unable to load offers</h3>
            <p className="text-red-700">There was an error loading the special offers. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Special Offers</h1>
        <p className="text-gray-600">
          Discover exclusive deals and discounts from our member businesses. 
          Support local commerce while saving money.
        </p>
      </div>

      {offers && offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      <Store className="inline w-4 h-4 mr-1" />
                      {offer.business?.name || 'Member Business'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {offer.discountPercentage && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {offer.discountPercentage}% OFF
                      </Badge>
                    )}
                    {offer.discountValue && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        £{offer.discountValue} OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {offer.imageUrl && (
                  <div className="relative">
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <p className="text-gray-700 text-sm line-clamp-3">
                  {offer.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {offer.validUntil ? (
                      `Valid until ${formatDate(new Date(offer.validUntil))}`
                    ) : (
                      'Ongoing offer'
                    )}
                  </div>
                  {offer.isActive ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                <Button className="w-full" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 border-dashed border-2">
          <CardContent className="p-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No special offers available</h3>
            <p className="text-gray-600 mb-6">
              Check back soon for exclusive deals and discounts from our member businesses.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/directory'}>
              Browse Member Directory
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpecialOffers;