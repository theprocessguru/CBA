import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error(`Auth check failed: ${response.status}`);
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 30000, // 30 seconds
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always check on mount
  });

  // When user is null (401 response), treat as not loading and not authenticated
  const isAuthenticated = !!user && !error;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}
