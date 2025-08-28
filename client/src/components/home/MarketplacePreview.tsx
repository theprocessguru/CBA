import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@shared/schema";

const MarketplacePreview = () => {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Sample images for categories if no image URL provided
  const categoryImages = [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Technology
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Food & Dining
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Professional
    "https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"  // Retail
  ];

  // Display at most 4 categories
  const displayCategories = categories?.slice(0, 4) || [];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 font-accent mb-2">Explore Our Marketplace</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Discover products and services from local Croydon businesses. Support the local economy and find what you need.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="group">
                <div className="bg-neutral-100 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition h-40 relative">
                  <Skeleton className="w-full h-full" />
                </div>
              </div>
            ))
          ) : displayCategories.length > 0 ? (
            displayCategories.map((category, index) => (
              <Link key={category.id} href={`/marketplace?category=${category.id}`}>
                <div className="group cursor-pointer">
                  <div className="bg-neutral-100 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition h-40 relative">
                    <img 
                      src={category.imageUrl || categoryImages[index % categoryImages.length]} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent">
                      <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="text-white font-medium text-lg">{category.name}</h3>
                        <p className="text-neutral-200 text-sm">{Math.floor(Math.random() * 40) + 10} providers</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-4 text-center py-8">
              <p className="text-neutral-500">No categories found.</p>
            </div>
          )}
        </div>
        
        <div className="mt-10">
          <div className="bg-neutral-100 rounded-lg p-6 md:p-8">
            <div className="md:flex items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-6">
                <h3 className="text-xl md:text-2xl font-bold text-neutral-900 font-accent mb-2">Shop Local, Think Local, Stay Local</h3>
                <p className="text-neutral-600">Explore our comprehensive directory of local businesses and discover why supporting local matters.</p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/marketplace">
                  <Button 
                    className="inline-block px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold rounded-md shadow-md transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                    size="lg"
                  >
                    <span>View All Categories</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplacePreview;
