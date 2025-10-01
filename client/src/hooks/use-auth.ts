import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/users/me"],
    queryFn: async () => {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    retry: false,
    staleTime: 30000, // 30 seconds
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}