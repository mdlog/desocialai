/**
 * CSRF Token Helper
 * Manages CSRF token fetching and caching for API requests
 */

let cachedCsrfToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

/**
 * Get CSRF token (with caching)
 * Fetches token from server and caches it for subsequent requests
 */
export async function getCsrfToken(): Promise<string> {
    // Return cached token if available
    if (cachedCsrfToken) {
        return cachedCsrfToken;
    }

    // If already fetching, wait for that promise
    if (tokenFetchPromise) {
        return tokenFetchPromise;
    }

    // Fetch new token
    tokenFetchPromise = (async () => {
        try {
            const response = await fetch('/api/csrf-token', {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch CSRF token');
            }

            const data = await response.json();
            cachedCsrfToken = data.csrfToken;
            tokenFetchPromise = null;

            return cachedCsrfToken!;
        } catch (error) {
            tokenFetchPromise = null;
            throw error;
        }
    })();

    return tokenFetchPromise;
}

/**
 * Clear cached CSRF token
 * Call this when token becomes invalid (e.g., 403 error)
 */
export function clearCsrfToken(): void {
    cachedCsrfToken = null;
    tokenFetchPromise = null;
}

/**
 * Make API request with CSRF token
 * Automatically includes CSRF token in headers
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await getCsrfToken();

    const headers = new Headers(options.headers);
    headers.set('X-CSRF-Token', token);

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    // If 403, token might be invalid - clear cache and retry once
    if (response.status === 403) {
        clearCsrfToken();
        const newToken = await getCsrfToken();
        headers.set('X-CSRF-Token', newToken);

        return fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });
    }

    return response;
}
