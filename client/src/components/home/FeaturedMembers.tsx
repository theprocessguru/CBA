import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Business } from "@shared/schema";

const FeaturedMembers = () => {
  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: ['/api/businesses?limit=3'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 font-accent mb-2">Featured Association Members</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Discover some of our standout local businesses making a difference in the Croydon community.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="h-48 overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-1/4 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : businesses && businesses.length > 0 ? (
            businesses.map((business) => (
              <Card key={business.id} className="bg-neutral-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                <div className="h-48 overflow-hidden">
                  {business.coverImage ? (
                    <img 
                      src={business.coverImage} 
                      alt={business.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt={business.name} 
                      className="w-full h-full object-cover" 
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-secondary-light text-white rounded-full mb-3">
                    {business.categoryId ? `Category ${business.categoryId}` : 'Business'}
                  </span>
                  <h3 className="text-xl font-bold mb-2 text-neutral-900">{business.name}</h3>
                  <p className="text-neutral-600 mb-4 line-clamp-2">{business.description || 'No description available'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-medium">
                      {business.city || 'Croydon'}
                    </span>
                    <Link href={`/business/${business.id}`}>
                      <span className="text-secondary hover:text-secondary-dark transition font-medium flex items-center cursor-pointer">
                        View Profile
                        <ChevronRight className="ml-2 w-4 h-4" />
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-neutral-500">No featured members found.</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/directory">
            <Button
              variant="outline"
              className="inline-flex items-center px-6 py-3 border border-primary text-primary bg-white hover:bg-primary hover:text-white font-semibold rounded-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <span>View Full Directory</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMembers;
