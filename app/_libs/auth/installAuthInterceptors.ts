/**
 * The response-interceptor half of the opt-in short-lived-token auth flow.
 * (The request interceptor lives in app/_libs/axiosConfig.ts — see the
 * comment there for why the two are split.)
 *
 * Installed once per axios instance (guarded by the WeakSet below) from
 * AuthSessionProvider (app/_component/providers/authSessionProvider.tsx), which is a
 * change from today: the interceptor used to be registered inline in that
 * same render body and re-registered on every re-render, since
 * LayoutContextProvider never unmounts. That's harmless for a plain
 * redirect, but would multiply refresh calls once this module is retrying
 * requests — hence the idempotency guard here.
 */

import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, isManagedSession } from './authCookie';
import { refreshAccessToken } from './refreshClient';

export type AuthNoticeReason = 'SESSION_REVOKED' | 'INVALID_TOKEN' | 'REFRESH_FAILED';

export interface AuthInterceptorHandlers {
    /**
     * Terminal sign-out (sets the one-shot notice, then doLogout(true)).
     * `message` is bb-api's own user-facing explanation, present on
     * SESSION_REVOKED (worded per its revokedReason — NEW_LOGIN,
     * REUSE_DETECTED, ADMIN, LOGOUT — server-side, so client copy doesn't
     * need a release when that wording changes). Read it directly rather
     * than re-deriving a message from `reason`/`revokedReason` here.
     */
    onHardSignOut: (reason: AuthNoticeReason, message?: string) => void;
    /** Today's exact behavior for a code-less 401: redirect to /login. */
    onLegacyUnauthorized: () => void;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
    _bbRetried?: boolean;
}

const installedInstances = new WeakSet<AxiosInstance>();

// A SESSION_REVOKED/INVALID_TOKEN/failed-refresh 401 commonly arrives on
// several in-flight requests at once; without this latch each one would
// independently kick off its own sign-out (posthog.reset(), a racing
// doLogout(), etc). Reset is implicit — this module state doesn't survive
// the full-page navigation doLogout ends with.
let hardSignOutInProgress = false;

function isRefreshUrl(url: string | undefined): boolean {
    return !!url && url.includes('/auth/refresh');
}

/**
 * Attaches the response interceptor exactly once per axios instance.
 * `handlersRef` is a ref object the caller reassigns every render, so the
 * interceptor always calls into the latest router/doLogout/dispatch
 * closures without ever needing to re-register itself.
 */
export function installAuthResponseInterceptor(
    instance: AxiosInstance,
    handlersRef: { current: AuthInterceptorHandlers }
): void {
    if (installedInstances.has(instance)) {
        return;
    }
    installedInstances.add(instance);

    instance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const status = error?.response?.status;
            if (status !== 401) {
                return Promise.reject(error);
            }

            const cfg: RetryableConfig | undefined = error?.config;
            if (!cfg || isRefreshUrl(cfg.url)) {
                // Never handle /auth/refresh's own errors here — that's
                // refreshClient.ts's job, and it runs on a bare axios
                // instance this interceptor is never attached to anyway.
                // This check stays as a second line of defense.
                return Promise.reject(error);
            }

            const code = error?.response?.data?.code as string | undefined;

            // Stale-token retry: bb-api looks an access token up by exact
            // string match with no expiry check, so a token that was merely
            // rotated away by another request also 401s as INVALID_TOKEN —
            // indistinguishable from a genuinely bad one. Combined with the
            // many call sites that pass a Bearer header captured in a React
            // closure, treat "the header doesn't match the live cookie" as
            // recoverable before branching on the error code at all.
            if (!cfg._bbRetried && cfg.headers?.authorization) {
                const live = getAccessToken();
                if (live && cfg.headers.authorization !== `Bearer ${live}`) {
                    cfg._bbRetried = true;
                    cfg.headers.authorization = `Bearer ${live}`;
                    return instance.request(cfg);
                }
            }

            const handlers = handlersRef.current;

            const hardSignOut = (reason: AuthNoticeReason, message?: string) => {
                if (hardSignOutInProgress) {
                    return;
                }
                hardSignOutInProgress = true;
                handlers.onHardSignOut(reason, message);
            };

            switch (code) {
                case 'TOKEN_EXPIRED': {
                    if (cfg._bbRetried) {
                        return Promise.reject(error);
                    }
                    const token = await refreshAccessToken({ reason: code });
                    if (!token) {
                        hardSignOut('REFRESH_FAILED');
                        return Promise.reject(error);
                    }
                    cfg._bbRetried = true;
                    // Must overwrite, not just fill — the request
                    // interceptor only sets this header when absent, and
                    // ~40 call sites pass it explicitly with the old token.
                    cfg.headers = cfg.headers ?? {};
                    cfg.headers.authorization = `Bearer ${token}`;
                    return instance.request(cfg);
                }
                case 'SESSION_REVOKED': {
                    // Fires on ANY authenticated endpoint the moment a
                    // revoked token is next used — not just /auth/* calls —
                    // the instant another device's login (or an admin
                    // action, or reuse-detection) ends this session. Always
                    // a hard sign-out with an explanation, never a silent
                    // refresh: there is no valid session left to refresh
                    // into.
                    const message = error?.response?.data?.message as string | undefined;
                    hardSignOut('SESSION_REVOKED', message);
                    return Promise.reject(error);
                }
                case 'INVALID_TOKEN':
                    // Only reached if the stale-token retry above didn't
                    // already resolve it.
                    hardSignOut('INVALID_TOKEN');
                    return Promise.reject(error);
                default: {
                    // Code-less 401: either the legacy (not-yet-deployed)
                    // backend, where this is every 401, or a genuinely
                    // code-less bb-api 401 (e.g. a plain-string
                    // UnauthorizedException). If this session is otherwise
                    // managed, still give a refresh a chance before falling
                    // back to today's redirect.
                    if (isManagedSession() && !cfg._bbRetried) {
                        const token = await refreshAccessToken({ reason: 'UNCODED_401' });
                        if (token) {
                            cfg._bbRetried = true;
                            cfg.headers = cfg.headers ?? {};
                            cfg.headers.authorization = `Bearer ${token}`;
                            return instance.request(cfg);
                        }
                    }
                    handlers.onLegacyUnauthorized();
                    return Promise.reject(error);
                }
            }
        }
    );
}
