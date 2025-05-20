import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Business, Product, Offer, Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Users, 
  Clock, 
  Tag, 
  Package, 
  Store,
  CalendarDays
} from "lucide-react";
import { formatCurrency, formatDate, getRandomCoverImage } from "@/lib/utils";

interface BusinessDetailsProps {
  businessId: number | string;
}

const BusinessDetails = ({ businessId }: BusinessDetailsProps) => {
  const { data: business, isLoading: isLoadingBusiness } = useQuery<Business>({
    queryKey: [`/api/businesses/${businessId}`],
    enabled: !!businessId,
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: [`/api/businesses/${businessId}/products`],
    enabled: !!businessId,
  });
  
  const { data: offers, isLoading: isLoadingOffers } = useQuery<Offer[]>({
    queryKey: [`/api/businesses/${businessId}/offers`],
    enabled: !!businessId,
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId || !categories) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name || null;
  };
  
  const isLoading = isLoadingBusiness || isLoadingProducts || isLoadingOffers || isLoadingCategories;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3">
            <Skeleton className="w-full h-96 rounded-lg" />
          </div>
          <div className="lg:w-2/3 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!business) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Building className="h-16 w-16 mx-auto text-neutral-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Business Not Found</h1>
        <p className="text-neutral-600 mb-6">The business you are looking for does not exist or has been removed.</p>
        <Link href="/directory">
          <Button>
            Return to Directory
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <Card className="overflow-hidden">
            <div className="h-72 overflow-hidden">
              {business.coverImage ? (
                <img 
                  src={business.coverImage}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={getRandomCoverImage(parseInt(businessId.toString()))}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                {business.logo ? (
                  <div className="h-16 w-16 mr-4 rounded-md overflow-hidden">
                    <img 
                      src={business.logo}
                      alt={`${business.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 mr-4 rounded-md bg-primary flex items-center justify-center text-white font-bold text-xl">
                    {business.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{business.name}</h2>
                  {business.categoryId && getCategoryName(business.categoryId) && (
                    <Badge variant="secondary" className="mt-1">
                      {getCategoryName(business.categoryId)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                {business.address && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-neutral-700">{business.address}</p>
                      {business.postcode && <p className="text-neutral-700">{business.postcode}</p>}
                      {business.city && <p className="text-neutral-700">{business.city}</p>}
                    </div>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 mr-3 text-neutral-500" />
                    <a href={`tel:${business.phone}`} className="text-neutral-700 hover:text-primary">
                      {business.phone}
                    </a>
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-neutral-500" />
                    <a href={`mailto:${business.email}`} className="text-neutral-700 hover:text-primary">
                      {business.email}
                    </a>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-3 text-neutral-500" />
                    <a 
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-700 hover:text-primary truncate"
                    >
                      {business.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                {business.established && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-neutral-500" />
                    <p className="text-neutral-700">Established {business.established}</p>
                  </div>
                )}
                
                {business.employeeCount && (
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-neutral-500" />
                    <p className="text-neutral-700">{business.employeeCount} employees</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <Button className="w-full" variant="secondary">
                  Contact Business
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>About {business.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700 whitespace-pre-line">
                {business.description || "No description available."}
              </p>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="products" className="mt-8">
            <TabsList className="mb-4">
              <TabsTrigger value="products" className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Products & Services
              </TabsTrigger>
              <TabsTrigger value="offers" className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Special Offers
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products & Services
                  </CardTitle>
                  <CardDescription>
                    Explore what {business.name} has to offer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {products.map((product) => (
                        <Card key={product.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold">{product.name}</h3>
                              {product.isService && (
                                <Badge variant="outline">Service</Badge>
                              )}
                            </div>
                            <p className="text-neutral-600 mb-2 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-primary">
                                {product.price !== null && product.price !== undefined 
                                  ? formatCurrency(Number(product.price)) 
                                  : "Price on request"}
                              </span>
                              {product.categoryId && getCategoryName(product.categoryId) && (
                                <span className="text-xs text-neutral-500">
                                  {getCategoryName(product.categoryId)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                      <p className="text-neutral-500">No products or services listed yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="offers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Special Offers
                  </CardTitle>
                  <CardDescription>
                    Exclusive deals and discounts from {business.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingOffers ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mb-4" />
                            <div className="flex justify-between items-center">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-4 w-1/3" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : offers && offers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {offers
                        .filter(offer => offer.isActive && (!offer.validUntil || new Date(offer.validUntil) >= new Date()))
                        .map((offer) => (
                          <Card key={offer.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{offer.title}</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-white">
                                  {offer.discountPercentage 
                                    ? `${offer.discountPercentage}% OFF` 
                                    : offer.discountValue 
                                      ? `£${offer.discountValue} OFF` 
                                      : 'SPECIAL OFFER'
                                  }
                                </span>
                              </div>
                              <p className="text-neutral-600 mb-4">{offer.description}</p>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-neutral-500 flex items-center">
                                  <Store className="inline mr-2 h-4 w-4" />
                                  {business.name}
                                </span>
                                <span className="text-neutral-500 flex items-center">
                                  <CalendarDays className="inline mr-2 h-4 w-4" />
                                  {offer.validUntil 
                                    ? `Until: ${formatDate(offer.validUntil)}` 
                                    : 'No expiration'
                                  }
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Tag className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                      <p className="text-neutral-500">No special offers available at this time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetails;
