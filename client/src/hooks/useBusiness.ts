import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Business } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useGetBusiness(id?: string | number) {
  return useQuery<Business>({
    queryKey: id ? [`/api/businesses/${id}`] : ['/api/my/business'],
    enabled: !!id || true,
  });
}

export function useGetFeaturedBusinesses(limit: number = 3) {
  return useQuery<Business[]>({
    queryKey: [`/api/businesses?limit=${limit}`],
  });
}

export function useGetBusinesses({ 
  categoryId, 
  search, 
  limit 
}: { 
  categoryId?: number; 
  search?: string; 
  limit?: number 
}) {
  let queryString = '';
  
  if (categoryId) {
    queryString += `categoryId=${categoryId}&`;
  }
  
  if (search) {
    queryString += `search=${encodeURIComponent(search)}&`;
  }
  
  if (limit) {
    queryString += `limit=${limit}&`;
  }
  
  // Remove trailing & if present
  if (queryString.endsWith('&')) {
    queryString = queryString.slice(0, -1);
  }
  
  return useQuery<Business[]>({
    queryKey: [`/api/businesses${queryString ? `?${queryString}` : ''}`],
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (businessData: any) => {
      return apiRequest("POST", "/api/my/business", businessData);
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
}
