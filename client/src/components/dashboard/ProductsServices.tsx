import { useState } from "react";
import { useGetMyProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useGetBusiness } from "@/hooks/useBusiness";
import { useQuery } from "@tanstack/react-query";
import { Product, Category } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Plus, PenSquare, Trash2, Tag, FileText, MoreVertical } from "lucide-react";
import { useLocation } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

const ProductsServices = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [productsToShow, setProductsToShow] = useState<"all" | "products" | "services">("all");
  const [, setLocation] = useLocation();
  
  const { data: business, isLoading: isLoadingBusiness, error: businessError } = useGetBusiness();
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useGetMyProducts();
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const deleteProduct = useDeleteProduct();
  
  const openEditDialog = (product: Product) => {
    // Navigate to edit page with product data
    setLocation(`/dashboard/add-product-service?edit=${product.id}`);
  };
  
  const handleDeleteProduct = (id: number) => {
    deleteProduct.mutate(id);
  };
  
  // Show loading state
  if (isLoadingBusiness || isLoadingProducts || isLoadingCategories) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show business profile required message
  if (!business) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Products & Services</h1>
            <p className="text-neutral-600">Manage your products and services to showcase in the marketplace.</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">You need to create your business profile before adding products or services.</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => setLocation('/dashboard/business-profile')}>
                Create Business Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error states
  if (businessError || productsError) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Products & Services</h1>
            <p className="text-neutral-600">Manage your products and services to showcase in the marketplace.</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Error loading data. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter products based on selected tab
  const filteredProducts = products?.filter(product => {
    if (productsToShow === "products") return !product.isService;
    if (productsToShow === "services") return product.isService;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Products & Services</h1>
          <p className="text-neutral-600">Manage your products and services to showcase in the marketplace.</p>
        </div>
        <Button 
          onClick={() => setLocation('/dashboard/add-product-service')} 
          className="mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      
      <Tabs 
        defaultValue="all" 
        className="w-full"
        onValueChange={(value) => setProductsToShow(value as "all" | "products" | "services")}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({products?.length || 0})</TabsTrigger>
          <TabsTrigger value="products">
            Products ({products?.filter(p => !p.isService).length || 0})
          </TabsTrigger>
          <TabsTrigger value="services">
            Services ({products?.filter(p => p.isService).length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <ProductGrid products={filteredProducts} categories={categories || []} onEdit={openEditDialog} onDelete={handleDeleteProduct} />
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          <ProductGrid products={filteredProducts} categories={categories || []} onEdit={openEditDialog} onDelete={handleDeleteProduct} />
        </TabsContent>
        <TabsContent value="services" className="mt-6">
          <ProductGrid products={filteredProducts} categories={categories || []} onEdit={openEditDialog} onDelete={handleDeleteProduct} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductGrid = ({ products, categories, onEdit, onDelete }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products or services</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first product or service.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => {
        const category = categories.find(c => c.id === product.categoryId);
        
        return (
          <Card key={product.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {product.isService ? (
                    <Tag className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Package className="h-4 w-4 text-green-600" />
                  )}
                  <Badge variant={product.isService ? "secondary" : "default"}>
                    {product.isService ? "Service" : "Product"}
                  </Badge>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <PenSquare className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your {product.isService ? 'service' : 'product'} "{product.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(product.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div>
                <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                {category && (
                  <p className="text-sm text-gray-500 mt-1">{category.name}</p>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {product.imageUrl && (
                <div className="mb-3">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {product.price ? (
                    <span className="font-semibold text-lg">
                      {formatCurrency(product.price)}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Price on request</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Badge 
                    variant={product.isPublic ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {product.isPublic ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductsServices;