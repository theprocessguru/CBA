import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 30000, // 30 seconds
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
