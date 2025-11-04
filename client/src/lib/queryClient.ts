import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getCsrfToken, clearCsrfToken } from "./csrf";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const isFormData = data instanceof FormData;

  // Get CSRF token for state-changing requests
  const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method.toUpperCase());
  let csrfToken: string | undefined;

  if (needsCsrf) {
    try {
      csrfToken = await getCsrfToken();
    } catch (error) {
      console.error('[API Request] Failed to get CSRF token:', error);
    }
  }

  // Build headers
  const headers: Record<string, string> = {};
  if (!isFormData && data) {
    headers["Content-Type"] = "application/json";
  }
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    credentials: "include",
  });

  // If 403, might be invalid CSRF token - clear cache and retry once
  if (res.status === 403 && needsCsrf) {
    console.log('[API Request] Got 403, clearing CSRF token and retrying...');
    clearCsrfToken();

    try {
      const newToken = await getCsrfToken();
      headers["X-CSRF-Token"] = newToken;

      const retryRes = await fetch(url, {
        method,
        headers,
        body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
        credentials: "include",
      });

      await throwIfResNotOk(retryRes);
      return retryRes;
    } catch (retryError) {
      console.error('[API Request] Retry failed:', retryError);
      await throwIfResNotOk(res); // Throw original error
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);

      // Safe JSON parsing with better error handling
      const text = await res.text();
      if (!text || text.trim() === '') {
        return null;
      }

      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('JSON Parse Error:', {
          error,
          responseText: text.substring(0, 200),
          queryKey: queryKey.join("/")
        });
        throw new Error(`Invalid JSON response from ${queryKey.join("/")}: ${(error as Error).message}`);
      }
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
