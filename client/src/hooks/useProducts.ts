import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useGetProducts({ 
  categoryId, 
  search, 
  isService, 
  isPublic,
  businessId,
  limit 
}: { 
  categoryId?: number; 
  search?: string; 
  isService?: boolean;
  isPublic?: boolean;
  businessId?: number;
  limit?: number 
}) {
  let endpoint = '/api/products';
  let queryString = '';
  
  if (businessId) {
    endpoint = `/api/businesses/${businessId}/products`;
  } else {
    if (categoryId !== undefined) {
      queryString += `categoryId=${categoryId}&`;
    }
    
    if (search) {
      queryString += `search=${encodeURIComponent(search)}&`;
    }
    
    if (isService !== undefined) {
      queryString += `isService=${isService}&`;
    }
    
    if (isPublic !== undefined) {
      queryString += `isPublic=${isPublic}&`;
    }
    
    if (limit) {
      queryString += `limit=${limit}&`;
    }
    
    // Remove trailing & if present
    if (queryString.endsWith('&')) {
      queryString = queryString.slice(0, -1);
    }
  }
  
  return useQuery<Product[]>({
    queryKey: [`${endpoint}${queryString ? `?${queryString}` : ''}`],
  });
}

export function useGetMyProducts() {
  return useQuery<Product[]>({
    queryKey: ['/api/my/products'],
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (productData: any) => {
      return apiRequest("POST", "/api/my/products", productData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/products'] });
      toast({
        title: "Success",
        description: "Your product has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/my/products/${id}`, data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/products'] });
      toast({
        title: "Success",
        description: "Your product has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/my/products/${id}`);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/products'] });
      toast({
        title: "Success",
        description: "Your product has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    },
  });
}
