import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Product, Category } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, Package, PoundSterling, Store, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [productType, setProductType] = useState<"all" | "products" | "services">("all");
  
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: [`/api/products${selectedCategory ? `?categoryId=${selectedCategory}` : ''}${productType !== "all" ? `&isService=${productType === "services"}` : ''}`],
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by filtering the products in the UI
  };
  
  const filteredProducts = products?.filter(product => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  });
  
  const getCategoryName = (categoryId?: number | null) => {
    if (!categoryId || !categories) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Uncategorized";
  };
  
  const isLoading = isLoadingProducts || isLoadingCategories;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold font-accent mb-4">Croydon Business Marketplace</h1>
        <p className="text-neutral-600 max-w-2xl mx-auto">
          Discover products and services from local Croydon businesses. Shop local, think local, stay local.
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Product Type</h4>
                  <Tabs 
                    defaultValue="all" 
                    value={productType} 
                    onValueChange={(value) => setProductType(value as any)}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="products">Products</TabsTrigger>
                      <TabsTrigger value="services">Services</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Categories</h4>
                  <RadioGroup 
                    value={selectedCategory} 
                    onValueChange={setSelectedCategory}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="category-all" />
                      <Label htmlFor="category-all">All Categories</Label>
                    </div>
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(category.id)} id={`category-${category.id}`} />
                        <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setProductType("all");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:w-3/4">
          <Card className="mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <Input 
                    type="text" 
                    placeholder="Search products and services..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-1/4" />
                      <Skeleton className="h-10 w-24 rounded-md" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="h-48 overflow-hidden bg-neutral-100 relative">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
                        <Package size={48} />
                      </div>
                    )}
                    
                    {product.isService && (
                      <div className="absolute top-2 right-2 bg-secondary text-white px-2 py-1 rounded text-xs font-medium">
                        Service
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <Badge variant="outline">
                        {getCategoryName(product.categoryId)}
                      </Badge>
                    </div>
                    <p className="text-neutral-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary flex items-center">
                        <PoundSterling className="h-4 w-4 mr-1" />
                        {product.price !== null && product.price !== undefined 
                          ? formatCurrency(Number(product.price)).replace('£', '') 
                          : "Price on request"}
                      </span>
                      <Link href={`/business/${product.businessId}`}>
                        <Button variant="outline" size="sm">
                          View Business
                          <Store className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-neutral-50 rounded-lg">
              <Package className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No products or services found</h3>
              <p className="text-neutral-600 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setProductType("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
