import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Business, Category } from "@shared/schema";
import { Plus, Upload, X } from "lucide-react";

// Extended validation schema for business profile
const businessProfileSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  address: z.string().optional(),
  city: z.string().default("Croydon"),
  postcode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  logo: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  coverImage: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
  categoryId: z.string().optional(),
  established: z.string().optional(),
  employeeCount: z.string().optional(),
});

type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

const BusinessProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const { data: business, isLoading: isLoadingBusiness } = useQuery<Business>({
    queryKey: ['/api/my/business'],
    enabled: !!user,
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Convert business data for form defaults
  const getDefaultValues = (business: Business | undefined): BusinessProfileFormValues => {
    return {
      name: business?.name || "",
      description: business?.description || "",
      address: business?.address || "",
      city: business?.city || "Croydon",
      postcode: business?.postcode || "",
      phone: business?.phone || "",
      email: business?.email || "",
      website: business?.website || "",
      logo: business?.logo || "",
      coverImage: business?.coverImage || "",
      categoryId: business?.categoryId ? String(business.categoryId) : "",
      established: business?.established || "",
      employeeCount: business?.employeeCount ? String(business.employeeCount) : "",
    };
  };
  
  const form = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: getDefaultValues(business),
  });
  
  // Update form values when business data is loaded
  useState(() => {
    if (business) {
      form.reset(getDefaultValues(business));
    }
  });
  
  // Mutation for creating/updating business profile
  const updateBusinessMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest("POST", "/api/my/business", data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/business'] });
      toast({
        title: "Success",
        description: "Your business profile has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update business profile",
        variant: "destructive",
      });
    },
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      return await response.json();
    },
    onError: (error) => {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async (file: File, fieldName: 'logo' | 'coverImage') => {
    if (fieldName === 'logo') setIsUploadingLogo(true);
    if (fieldName === 'coverImage') setIsUploadingCover(true);

    try {
      const result = await uploadImageMutation.mutateAsync(file);
      form.setValue(fieldName, result.imageUrl);
      toast({
        title: "Image Uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      // Error already handled in mutation
    } finally {
      if (fieldName === 'logo') setIsUploadingLogo(false);
      if (fieldName === 'coverImage') setIsUploadingCover(false);
    }
  };

  // Mutation for creating new category
  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiRequest("POST", "/api/categories", data);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create category');
      }
      return await response.json();
    },
    onSuccess: async (newCategory: Category) => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      // Auto-select the newly created category
      form.setValue("categoryId", String(newCategory.id));
      setIsAddCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      toast({
        title: "Success",
        description: "New category added and selected",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: BusinessProfileFormValues) => {
    const formattedData = {
      ...data,
      categoryId: data.categoryId && data.categoryId !== "" ? parseInt(data.categoryId) : undefined,
      employeeCount: data.employeeCount && data.employeeCount !== "" ? parseInt(data.employeeCount) : undefined,
    };
    updateBusinessMutation.mutate(formattedData);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate category names (case-insensitive)
    const isDuplicate = categories?.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: "This category already exists. Please choose a different name.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate({
      name: newCategoryName.trim(),
      description: newCategoryDescription.trim() || `${newCategoryName.trim()} category`,
    });
  };
  
  const isLoading = isLoadingBusiness || isLoadingCategories;
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Business Profile</h1>
      <p className="text-neutral-600 mb-6">
        Complete your business profile to be visible in the directory and marketplace.
      </p>
      
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            This information will be displayed publicly to help customers find and contact your business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Business Name" {...field} />
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
                      <FormLabel>Business Description*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your business, services, and unique selling points" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a clear, concise description of your business (10-500 characters).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Category</FormLabel>
                        <div className="flex gap-2">
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                                <DialogDescription>
                                  Create a new business category if you don't see yours in the list. We'll check for duplicates to keep the list clean.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Category Name*</label>
                                  <Input
                                    placeholder="e.g., Automotive Services"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                                  <Textarea
                                    placeholder="Brief description of this category"
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    className="min-h-[80px]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsAddCategoryOpen(false);
                                    setNewCategoryName("");
                                    setNewCategoryDescription("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleAddCategory}
                                  disabled={createCategoryMutation.isPending}
                                >
                                  {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormDescription>
                          Select your business category or add a new one if not listed
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="established"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Established</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 2010" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-medium">Contact Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postcode</FormLabel>
                          <FormControl>
                            <Input placeholder="Postcode" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="business@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <h3 className="text-lg font-medium">Media</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Logo</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {field.value && (
                              <div className="relative">
                                <img 
                                  src={field.value} 
                                  alt="Business logo" 
                                  className="w-32 h-32 object-cover rounded-lg border"
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
                                disabled={isUploadingLogo}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.capture = 'environment';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleImageUpload(file, 'logo');
                                  };
                                  input.click();
                                }}
                              >
                                {isUploadingLogo ? (
                                  <>Uploading...</>
                                ) : (
                                  <>
                                    <Upload size={16} className="mr-2" />
                                    Upload Logo
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
                          Upload or provide a URL for your business logo
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {field.value && (
                              <div className="relative">
                                <img 
                                  src={field.value} 
                                  alt="Cover image" 
                                  className="w-full h-32 object-cover rounded-lg border"
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
                                disabled={isUploadingCover}
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.capture = 'environment';
                                  input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) handleImageUpload(file, 'coverImage');
                                  };
                                  input.click();
                                }}
                              >
                                {isUploadingCover ? (
                                  <>Uploading...</>
                                ) : (
                                  <>
                                    <Upload size={16} className="mr-2" />
                                    Upload Cover
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
                          Upload or provide a URL for your business cover image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="min-w-[120px]"
                    disabled={updateBusinessMutation.isPending}
                  >
                    {updateBusinessMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessProfile;
