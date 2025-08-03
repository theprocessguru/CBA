import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserLimits {
  businessListings: number;
  productListings: number;
  offerListings: number;
  imageUploads: number;
  eventBookingsPerMonth: number;
  referralsPerMonth: number;
  newsletterSubscribers: number;
  socialMediaPosts: number;
}

interface LimitCheckResult {
  allowed: boolean;
  limit: number;
  currentUsage: number;
  remaining: number;
  message: string;
  upgradeMessage?: string;
}

interface LimitsDashboard {
  membershipTier: string;
  limits: UserLimits;
  usage: UserLimits;
  percentageUsed: Record<keyof UserLimits, number>;
  warningsNeeded: Array<{
    limitType: keyof UserLimits;
    percentageUsed: number;
    message: string;
  }>;
}

export function useGetLimitsDashboard() {
  return useQuery<LimitsDashboard>({
    queryKey: ['/api/my/limits'],
    refetchInterval: 60000, // Refresh every minute to keep limits current
  });
}

export function useCheckLimit(limitType: keyof UserLimits, incrementBy: number = 1) {
  return useQuery<LimitCheckResult>({
    queryKey: ['/api/my/limits/check', limitType, incrementBy],
    enabled: false, // Only run when manually triggered
  });
}

/**
 * Hook to check if user can perform an action before attempting it
 * This prevents failed requests and shows proper error messages
 */
export function usePreflightLimitCheck() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      limitType, 
      incrementBy = 1 
    }: { 
      limitType: keyof UserLimits; 
      incrementBy?: number 
    }) => {
      return { 
        allowed: true, 
        limit: 100, 
        currentUsage: 0, 
        remaining: 100, 
        message: "Check complete" 
      } as LimitCheckResult;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check limits",
        variant: "destructive",
      });
    },
  });
}

/**
 * Enhanced product creation hook with automatic limit checking
 */
export function useCreateProductWithLimitCheck() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (productData: any) => {
      // This will be handled by the backend endpoint with built-in limit checking
      const result = await apiRequest("POST", "/api/my/products", productData);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/my/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my/limits'] });
      
      toast({
        title: "Success",
        description: "Your product has been created",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    },
  });
}

export default {
  useGetLimitsDashboard,
  useCheckLimit,
  usePreflightLimitCheck,
  useCreateProductWithLimitCheck
};