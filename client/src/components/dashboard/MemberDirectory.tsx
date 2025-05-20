import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Business, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Phone, Mail, Globe, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const MemberDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  
  const { data: businesses, isLoading } = useQuery<Business[]>({
    queryKey: [`/api/businesses${categoryFilter ? `?categoryId=${categoryFilter}` : ''}`],
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const filteredBusinesses = businesses?.filter(business => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      business.name.toLowerCase().includes(query) ||
      (business.description && business.description.toLowerCase().includes(query))
    );
  });
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Member Directory</h1>
      <p className="text-neutral-600 mb-6">
        Browse and connect with other association members.
      </p>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            <Input
              placeholder="Search businesses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="h-24 w-24 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <Card key={business.id} className="overflow-hidden hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="h-24 w-24 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                    {business.logo ? (
                      <img 
                        src={business.logo}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xl">
                        {business.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                      <h3 className="text-xl font-bold text-neutral-900">{business.name}</h3>
                      <div>
                        {business.categoryId && (
                          <Badge variant="secondary">
                            {categories?.find(c => c.id === business.categoryId)?.name || `Category ${business.categoryId}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-neutral-600 mb-4 line-clamp-2">{business.description}</p>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {business.phone && (
                        <span className="text-neutral-500 text-sm flex items-center">
                          <Phone size={16} className="mr-2" />
                          {business.phone}
                        </span>
                      )}
                      {business.email && (
                        <span className="text-neutral-500 text-sm flex items-center">
                          <Mail size={16} className="mr-2" />
                          {business.email}
                        </span>
                      )}
                      {business.website && (
                        <span className="text-neutral-500 text-sm flex items-center">
                          <Globe size={16} className="mr-2" />
                          {business.website.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                      {business.address && (
                        <span className="text-neutral-500 text-sm flex items-center">
                          <MapPin size={16} className="mr-2" />
                          {business.address}
                          {business.postcode && `, ${business.postcode}`}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Link href={`/business/${business.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-neutral-50 p-6 text-center">
          <p className="text-neutral-600 mb-4">No businesses found matching your search criteria.</p>
          <Button variant="outline" onClick={() => {
            setSearchQuery("");
            setCategoryFilter("");
          }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MemberDirectory;
