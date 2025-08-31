import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add auth token if available (for Replit environment)
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers,
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Clear invalid token from localStorage
            if (authToken) {
              localStorage.removeItem('authToken');
            }
            return null; // Not authenticated
          }
          throw new Error(`Auth check failed: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log("Auth check successful:", userData?.email);
        return userData;
      } catch (error) {
        console.error("Auth fetch error:", error);
        // Clear potentially invalid token on any error
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          localStorage.removeItem('authToken');
        }
        return null;
      }
    },
    retry: false,
    staleTime: 1000, // Short stale time for responsive auth updates
    refetchInterval: false,
    refetchOnWindowFocus: true, // Recheck when user returns to tab
    refetchOnMount: true, // Always check on mount
    gcTime: 0, // Don't cache failed results
    networkMode: 'online', // Skip if offline
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
