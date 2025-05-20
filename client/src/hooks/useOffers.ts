import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Offer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useGetOffers(limit?: number) {
  return useQuery<Offer[]>({
    queryKey: [`/api/offers${limit ? `?limit=${limit}` : ''}`],
  });
}

export function useGetBusinessOffers(businessId: number) {
  return useQuery<Offer[]>({
    queryKey: [`/api/businesses/${businessId}/offers`],
    enabled: !!businessId,
  });
}

export function useGetMyOffers() {
  return useQuery<Offer[]>({
    queryKey: ['/api/my/offers'],
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (offerData: any) => {
      return apiRequest("POST", "/api/my/offers", offerData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/offers'] });
      toast({
        title: "Success",
        description: "Your special offer has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create special offer",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/my/offers/${id}`, data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/offers'] });
      toast({
        title: "Success",
        description: "Your special offer has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update special offer",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/my/offers/${id}`);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/offers'] });
      toast({
        title: "Success",
        description: "Your special offer has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete special offer",
        variant: "destructive",
      });
    },
  });
}
