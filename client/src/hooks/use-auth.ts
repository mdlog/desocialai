import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      console.log('[useAuth] Fetching user data...');
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('[useAuth] Response status:', response.status);

      if (response.status === 401) {
        // Return null when wallet not connected
        console.log('[useAuth] 401 - Wallet not connected, returning null');
        return null;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await response.json();
      console.log('[useAuth] User data received:', userData);
      return userData;
    },
    retry: false,
    staleTime: 10000, // Match sidebar setting
    refetchOnMount: true, // Enable refetch on mount
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  console.log('[useAuth] Hook state:', { user, isLoading, error, isAuthenticated: !!user });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}