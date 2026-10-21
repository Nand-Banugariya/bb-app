import 'server-only';
import { readCookie } from '@/app/action';
import type { LoginDataResponse } from '@redux/slices/auth';

// Server-only: reads the original .env name (never exposed to the browser).
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT ?? process.env.NEXT_API_ENDPOINT;

/**
 * Fetches the signed-in user (who-am-i) for server components and layouts. Not for proxy.ts:
 * an API call there on every request is what caused bb-app's middleware timeouts.
 *
 * No caching, so data is fresh after onboarding / invite flows. Returns null when signed out
 * or on any failure.
 */
export async function getAuthenticatedUserData(): Promise<LoginDataResponse | null> {
    try {
        const authCookie = await readCookie('auth');

        if (!authCookie?.session?.accessToken) {
            return null;
        }

        const response = await fetch(`${API_ENDPOINT}/auth/who-am-i`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${authCookie.session.accessToken}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            console.error('Failed to fetch user data:', response.statusText);
            return null;
        }

        return (await response.json()) as LoginDataResponse;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

/** The `auth` cookie without any API call — for cheap checks. */
export async function getAuthCookie() {
    try {
        return await readCookie('auth');
    } catch (error) {
        console.error('Error reading auth cookie:', error);
        return null;
    }
}

/** True when the `auth` cookie holds a session (id + access token). */
export async function isAuthenticated(): Promise<boolean> {
    const authCookie = await getAuthCookie();
    return !!(authCookie?.session?.id && authCookie?.session?.accessToken);
}
