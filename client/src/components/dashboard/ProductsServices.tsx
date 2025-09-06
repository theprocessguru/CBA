import { useState } from "react";
import { useGetMyProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { useGetBusiness } from "@/hooks/useBusiness";
import { Product, Category } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, PenSquare, Trash2, Tag, FileText, MoreVertical, Upload, X } from "lucide-react";
import { useLocation } from "wouter";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

// Product form schema
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  price: z.string().optional(),
  imageUrl: z.string().optional(),
  isService: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  categoryId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductsServices = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [productsToShow, setProductsToShow] = useState<"all" | "products" | "services">("all");
  const [, setLocation] = useLocation();
  
  const { data: business, isLoading: isLoadingBusiness, error: businessError } = useGetBusiness();
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useGetMyProducts();
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  // Image upload functionality
  const handleImageUpload = async (file: File, setValue: (value: string) => void) => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      const result = await response.json();
      setValue(result.imageUrl);
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      isService: false,
      isPublic: true,
      categoryId: "",
    },
  });
  
  const openCreateDialog = () => {
    form.reset({
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      isService: false,
      isPublic: true,
      categoryId: "",
    });
    setEditingProduct(null);
    setIsCreateDialogOpen(true);
  };
  
  const openEditDialog = (product: Product) => {
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price ? String(product.price) : "",
      imageUrl: product.imageUrl || "",
      isService: product.isService || false,
      isPublic: product.isPublic !== false, // default to true if undefined
      categoryId: product.categoryId ? String(product.categoryId) : "",
    });
    setEditingProduct(product);
    setIsCreateDialogOpen(true);
  };
  
  const onSubmit = (data: ProductFormValues) => {
    // Transform the data to correct types
    const transformedData = {
      ...data,
      price: data.price && data.price !== "" ? parseFloat(data.price) : null,
      categoryId: data.categoryId && data.categoryId !== "" && data.categoryId !== "none" ? parseInt(data.categoryId) : null,
      imageUrl: data.imageUrl || undefined
    };

    if (editingProduct) {
      updateProduct.mutate({ 
        id: editingProduct.id, 
        data: transformedData
      }, {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        }
      });
    } else {
      createProduct.mutate(transformedData, {
        onSuccess: () => {
          setIsCreateDialogOpen(false);
        }
      });
    }
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
  if (!business || businessError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Business Profile Required</h2>
          <p className="text-neutral-600 mb-6">
            You need to create your business profile before you can manage products and services.
          </p>
          <Button asChild>
            <a href="/dashboard/business-profile">Create Business Profile</a>
          </Button>
        </div>
      </div>
    );
  }

  // Filter products based on selected tab
  const filteredProducts = products?.filter(product => {
    if (productsToShow === "all") return true;
    if (productsToShow === "products") return !product.isService;
    if (productsToShow === "services") return product.isService;
    return true;
  });
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
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
        value={productsToShow} 
        onValueChange={(value) => setProductsToShow(value as any)}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden bg-neutral-100">
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
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    {product.isService && (
                      <span className="text-xs font-medium bg-secondary-light text-white px-2 py-0.5 rounded-full">Service</span>
                    )}
                    {!product.isPublic && (
                      <span className="text-xs font-medium bg-neutral-500 text-white px-2 py-0.5 rounded-full">Private</span>
                    )}
                  </div>
                </div>
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {product.price !== null && product.price !== undefined 
                      ? formatCurrency(Number(product.price)) 
                      : "Price on request"}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(product)}>
                        <PenSquare className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(`delete-product-${product.id}`)?.click();
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                        <AlertDialogTrigger className="hidden" id={`delete-product-${product.id}`} />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <AlertDialog>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete {product.name}. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-neutral-50 border-dashed border-2">
          <CardContent className="p-6 text-center">
            <Package className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No products or services yet</h3>
            <p className="text-neutral-600 mb-4">Add your first product or service to get started.</p>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product/Service" : "Add New Product/Service"}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="isService"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                      <div className="space-y-1 leading-none">
                        <FormLabel>This is a service</FormLabel>
                        <FormDescription>
                          Select if you're offering a service rather than a physical product
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publicly visible</FormLabel>
                        <FormDescription>
                          Make this visible in the public marketplace
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Product/Service Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your product or service" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="Leave blank for 'Price on request'" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {field.value && (
                          <div className="relative">
                            <img 
                              src={field.value} 
                              alt="Product image" 
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6"
                              onClick={() => field.onChange("")}
                            >
                              <X size={12} />
                            </Button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            disabled={isUploadingImage}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.capture = 'environment';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(file, field.onChange);
                              };
                              input.click();
                            }}
                          >
                            {isUploadingImage ? (
                              <>Uploading...</>
                            ) : (
                              <>
                                <Upload size={16} className="mr-2" />
                                Upload Image
                              </>
                            )}
                          </Button>
                        </div>
                        <Input 
                          placeholder="Or enter image URL" 
                          value={field.value}
                          onChange={field.onChange}
                          className="text-sm"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload or provide a URL for your product/service image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {createProduct.isPending || updateProduct.isPending
                    ? "Saving..." 
                    : editingProduct 
                      ? "Update" 
                      : "Create"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsServices;
