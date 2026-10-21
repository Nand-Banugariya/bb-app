import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { readAuthCookie } from '@lib/auth/authCookie';
import { env } from '@lib/env';

let axiosClientInstance: AxiosInstance | null = null;
const isServer = typeof window === 'undefined';
const baseURL = env.apiEndpoint;

/** The normalized error every failed `fetch()` throws. */
export interface ApiError extends Error {
    responseStatus?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseData?: any;
}

// Registered exactly once, at instance-creation time, rather than in a React component's render
// body — a request fired from a child component's own mount effect can run before the
// outermost provider's effect, so anything short of instance-creation-time registration risks
// first-paint requests going out with no auth header. Reads the cookie fresh via
// readAuthCookie() on every request rather than closing over a value, so a rotated token (see
// app/_libs/auth/authCookie.ts) is always picked up immediately. Only sets these headers when
// an access token exists, and only fills authorization/bb-application/bb-version when not
// already set by the caller.
function attachAuthRequestInterceptor(instance: AxiosInstance): void {
    instance.interceptors.request.use(
        (config) => {
            const accessToken = readAuthCookie()?.session?.accessToken;
            if (accessToken) {
                if (!config.headers?.['authorization']) {
                    config.headers['authorization'] = `Bearer ${accessToken}`;
                }
                if (!config.headers?.['bb-application']) {
                    config.headers['bb-application'] = env.bbApplicationHeader;
                }
                if (!config.headers?.['bb-version']) {
                    config.headers['bb-version'] = env.bbVersion;
                }
            }
            config.headers['cache'] = 'no-store';
            return config;
        },
        (error) => Promise.reject(error)
    );
}

/** The shared client-side axios instance (the 401/refresh interceptor attaches to this one). */
export const API = (force = false): AxiosInstance => {
    if (axiosClientInstance && !force) {
        return axiosClientInstance;
    }
    axiosClientInstance = axios.create({ baseURL });
    attachAuthRequestInterceptor(axiosClientInstance);
    return axiosClientInstance;
};

/**
 * Every API call goes through here. Resolves to `response.data`; on failure throws an
 * `ApiError` carrying bb-api's `responseStatus` / `responseData` so callers can branch on codes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetch: (config: AxiosRequestConfig) => Promise<any> = async (config) => {
    try {
        // Guard against URLs built from empty path params (e.g. an unset workspaceId producing
        // `/workspace//price-preview`). These never match a backend route and surface as
        // confusing 404s — fail fast instead. The `(?<!:)` excludes the `//` of absolute URLs.
        if (config.url && /(?<!:)\/\//.test(config.url)) {
            throw new Error(`Malformed API URL (empty path segment): ${config.url}`);
        }

        let response = null;
        if (isServer) {
            // Deliberately no refresh-on-401 here. A Server Component can't set cookies (Next
            // only allows that from Server Actions / Route Handlers), so refreshing here would
            // obtain a working access token while silently discarding the rotated refresh
            // cookie the response carried — leaving the browser holding a spent refresh token
            // that trips bb-api's reuse-detection and gets the session revoked. A plain 401
            // (handled gracefully by every caller, e.g. getAuthenticatedUserData() returning
            // null) is a far better failure mode. SSR staleness is covered by proxy.ts, which
            // can write cookies, plus the client-side refresh lifecycle on hydration.
            const axiosServerInstance = axios.create({ baseURL });

            axiosServerInstance.interceptors.request.use(
                async (requestConfig) => {
                    const { readCookie } = await import('@/app/action');
                    const authCookie = await readCookie('auth');

                    if (authCookie?.session?.accessToken) {
                        requestConfig.headers['authorization'] =
                            `Bearer ${authCookie.session.accessToken}`;
                    }
                    requestConfig.headers['bb-application'] = env.bbApplicationHeader;
                    requestConfig.headers['bb-version'] = env.bbVersion;
                    requestConfig.headers['cache'] = 'no-store';

                    return requestConfig;
                },
                (error) => Promise.reject(error)
            );
            response = await axiosServerInstance.request(config);
        } else {
            response = await API().request(config);
        }

        return response?.data;
    } catch (e: unknown) {
        const err = e as {
            message?: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            response?: { status?: number; data?: any };
        };
        if (err?.response?.data?.message) {
            const customError: ApiError = new Error(
                err.response.data.message || 'Bad response from server'
            );
            customError.responseStatus = err.response.data.statusCode || err.response.status;
            customError.responseData = err.response.data;
            throw customError;
        }
        throw new Error(err?.message || 'Bad response from server');
    }
};
