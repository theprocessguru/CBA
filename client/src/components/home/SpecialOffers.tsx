import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Store, Calendar, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Offer } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

const SpecialOffers = () => {
  const { isAuthenticated } = useAuth();
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ['/api/offers?limit=3'],
  });

  const calculateMemberPrice = (offer: Offer) => {
    if (!offer.originalPrice) return null;
    
    const originalPrice = typeof offer.originalPrice === 'string' ? parseFloat(offer.originalPrice) : offer.originalPrice;
    
    if (offer.memberDiscountPercentage) {
      return originalPrice * (1 - offer.memberDiscountPercentage / 100);
    } else if (offer.memberDiscountValue) {
      const discountValue = typeof offer.memberDiscountValue === 'string' ? parseFloat(offer.memberDiscountValue) : offer.memberDiscountValue;
      return Math.max(0, originalPrice - discountValue);
    }
    return null;
  };

  return (
    <section className="py-12 bg-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 font-accent mb-2">Special Offers for Members</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Exclusive deals and discounts available to Croydon Business Association members.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-white rounded-lg overflow-hidden shadow-md border border-neutral-200 hover:shadow-lg transition">
                <div className="h-48 overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center text-sm">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : offers && offers.length > 0 ? (
            offers.map((offer) => (
              <Card key={offer.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-neutral-200 hover:shadow-lg transition">
                <div className="h-48 overflow-hidden">
                  {offer.imageUrl ? (
                    <img 
                      src={offer.imageUrl} 
                      alt={offer.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt="Special offer" 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-neutral-900">{offer.title}</h3>
                    <div className="flex flex-col items-end space-y-1">
                      {offer.memberOnlyDiscount && isAuthenticated ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                          <Crown className="w-3 h-3 mr-1" />
                          Member Only
                        </Badge>
                      ) : null}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-white">
                        {offer.discountPercentage 
                          ? `${offer.discountPercentage}% OFF` 
                          : offer.discountValue 
                            ? `£${offer.discountValue} OFF` 
                            : 'SPECIAL OFFER'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {/* Member-exclusive pricing display */}
                  {offer.memberOnlyDiscount && isAuthenticated && offer.originalPrice && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Member Price:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-600 dark:text-blue-400 line-through">
                            £{Number(offer.originalPrice).toFixed(2)}
                          </span>
                          <span className="text-lg font-bold text-blue-800 dark:text-blue-200">
                            £{calculateMemberPrice(offer)?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        You save £{offer.originalPrice && calculateMemberPrice(offer) 
                          ? (Number(offer.originalPrice) - calculateMemberPrice(offer)!).toFixed(2) 
                          : '0.00'
                        }!
                      </div>
                    </div>
                  )}
                  <p className="text-neutral-600 mb-4">{offer.description || 'No description available'}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">
                      <Store className="inline mr-2 h-4 w-4" />
                      Business {offer.businessId}
                    </span>
                    <span className="text-neutral-500">
                      <Calendar className="inline mr-2 h-4 w-4" />
                      Valid until: {offer.validUntil 
                        ? new Date(offer.validUntil).toLocaleDateString() 
                        : 'No expiration'
                      }
                    </span>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <Link href={`/business/${offer.businessId}`}>
                      <Button className="block w-full text-center px-4 py-2 bg-secondary hover:bg-secondary-dark text-white font-semibold rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary">
                        <span>View Details</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-neutral-500">No special offers found.</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 bg-primary-light rounded-lg p-6 md:p-8">
          <div className="md:flex items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-xl md:text-2xl font-bold text-white font-accent mb-2">Member Exclusive Benefits</h3>
              <p className="text-neutral-100">Join the Croydon Business Association today to access exclusive deals and connect with other local businesses.</p>
            </div>
            <div className="flex-shrink-0">
              <Link href="/register">
                <Button 
                  className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-md shadow-md hover:bg-neutral-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  size="lg"
                >
                  <span>Become a Member</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
