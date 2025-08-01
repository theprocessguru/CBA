import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 60000, // 60 seconds - cache auth state longer
    refetchInterval: false, // Don't auto-refetch
    refetchOnWindowFocus: false, // Don't refetch on focus
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
