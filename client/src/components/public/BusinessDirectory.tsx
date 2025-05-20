import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Business, Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Phone, Mail, Building, ArrowRight, Clock } from "lucide-react";
import { getRandomCoverImage } from "@/lib/utils";

const BusinessDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  
  const { data: businesses, isLoading: isLoadingBusinesses } = useQuery<Business[]>({
    queryKey: [`/api/businesses${categoryFilter && categoryFilter !== 'all' ? `?categoryId=${categoryFilter}` : ''}`],
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  useEffect(() => {
    if (businesses) {
      setFilteredBusinesses(
        businesses.filter(business => {
          if (!searchQuery) return true;
          
          const query = searchQuery.toLowerCase();
          return (
            business.name.toLowerCase().includes(query) ||
            (business.description && business.description.toLowerCase().includes(query))
          );
        })
      );
    }
  }, [businesses, searchQuery]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the effect
  };
  
  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId || !categories) return null;
    const category = categories.find(c => c.id === categoryId);
    return category?.name || null;
  };
  
  const isLoading = isLoadingBusinesses || isLoadingCategories;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold font-accent mb-4">Croydon Business Directory</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Discover businesses in the Croydon area. Support local commerce and connect with businesses in your community.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input 
                type="text" 
                placeholder="Search businesses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-1/3">
              <Select 
                value={categoryFilter} 
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">
              Search
            </Button>
          </div>
        </form>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="h-48 overflow-hidden">
                {business.coverImage ? (
                  <img 
                    src={business.coverImage}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={getRandomCoverImage(business.id)}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-neutral-900">{business.name}</h3>
                  {business.categoryId && getCategoryName(business.categoryId) && (
                    <Badge variant="secondary" className="ml-2">
                      {getCategoryName(business.categoryId)}
                    </Badge>
                  )}
                </div>
                {business.established && (
                  <div className="flex items-center text-neutral-500 text-sm mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    Est. {business.established}
                  </div>
                )}
                <p className="text-neutral-600 mb-4 line-clamp-3">
                  {business.description || "No description available"}
                </p>
                <div className="flex flex-col space-y-2 mb-4">
                  {business.address && (
                    <div className="flex items-center text-neutral-500 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {business.address}
                        {business.postcode && `, ${business.postcode}`}
                      </span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center text-neutral-500 text-sm">
                      <Phone className="h-4 w-4 mr-2" />
                      {business.phone}
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <Link href={`/business/${business.id}`}>
                    <Button variant="outline">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-neutral-50 rounded-lg">
          <Building className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No businesses found</h3>
          <p className="text-neutral-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default BusinessDirectory;
