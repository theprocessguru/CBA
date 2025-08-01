import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 60000, // 60 seconds - cache auth state longer
    refetchInterval: false, // Don't auto-refetch
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: false, // Don't refetch on mount if cached data exists
  });

  // When user is null (401 response), treat as not loading and not authenticated
  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}
