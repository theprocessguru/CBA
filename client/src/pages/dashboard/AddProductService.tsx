import { useState } from "react";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { useGetBusiness } from "@/hooks/useBusiness";
import { Product, Category } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

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

interface AddProductServiceProps {
  editingProduct?: Product | null;
}

const AddProductService = ({ editingProduct }: AddProductServiceProps) => {
  const [, setLocation] = useLocation();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();
  
  const { data: business, isLoading: isLoadingBusiness } = useGetBusiness();
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

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
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: editingProduct?.name || "",
      description: editingProduct?.description || "",
      price: editingProduct?.price ? String(editingProduct.price) : "",
      imageUrl: editingProduct?.imageUrl || "",
      isService: editingProduct?.isService || false,
      isPublic: editingProduct?.isPublic !== false,
      categoryId: editingProduct?.categoryId ? String(editingProduct.categoryId) : "",
    },
  });
  
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
          toast({
            title: "Success",
            description: `${transformedData.isService ? 'Service' : 'Product'} updated successfully!`,
          });
          setLocation('/dashboard/products-services');
        }
      });
    } else {
      createProduct.mutate(transformedData, {
        onSuccess: () => {
          toast({
            title: "Success", 
            description: `${transformedData.isService ? 'Service' : 'Product'} created successfully!`,
          });
          setLocation('/dashboard/products-services');
        }
      });
    }
  };

  // Show loading state
  if (isLoadingBusiness || isLoadingCategories) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/products-services')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  // Show business profile required message
  if (!business) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/products-services')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation('/dashboard/products-services')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products & Services
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900">
          {editingProduct ? 'Edit' : 'Add'} {form.watch('isService') ? 'Service' : 'Product'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingProduct ? 'Update' : 'Create New'} {form.watch('isService') ? 'Service' : 'Product'}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                        
                        <div className="flex items-center gap-4">
                          <div>
                            <label className="cursor-pointer">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={isUploadingImage}
                                asChild
                              >
                                <span>
                                  <Upload className="mr-2 h-4 w-4" />
                                  {isUploadingImage ? "Uploading..." : "Upload Image"}
                                </span>
                              </Button>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, field.onChange);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          
                          <span className="text-sm text-gray-500">or</span>
                          
                          <Input
                            placeholder="Or enter image URL"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        
                        <p className="text-sm text-gray-500">
                          Upload or provide a URL for your product/service image
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                  className="flex-1"
                >
                  {createProduct.isPending || updateProduct.isPending
                    ? "Saving..." 
                    : editingProduct 
                      ? "Update" 
                      : "Create"
                  }
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/dashboard/products-services')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProductService;