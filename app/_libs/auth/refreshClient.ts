/**
 * Client-side access-token refresh for bb-api's opt-in short-lived-token
 * flow. Talks to POST /auth/refresh directly on a bare axios instance (not
 * the shared API() instance) so the response interceptor installed by
 * installAuthInterceptors.ts can never see this call and recurse into it.
 *
 * Entirely inert for an unmanaged (legacy) session — see isManagedSession()
 * in authCookie.ts, which every entry point here checks before doing
 * anything.
 */

import axios from 'axios';
import {
    getAccessToken,
    getMsUntilAccessTokenExpiry,
    isManagedSession,
    rotateAccessToken
} from './authCookie';
import { env } from '../env';

const REFRESH_URL = `${env.apiEndpoint}/auth/refresh`;

// How far ahead of expiry to refresh proactively. Derived from the observed
// TTL rather than a hardcoded constant, clamped to a sane range.
const MIN_LEAD_MS = 30 * 1000;
const MAX_LEAD_MS = 120 * 1000;
const LEAD_FRACTION = 0.2;

// A refresh already believed to be fresh enough (another tab just rotated
// it) is treated as "not stale" within this skew.
const FRESHNESS_SKEW_MS = 5 * 1000;

// setTimeout is clamped by browsers around ~24.8 days (2^31 - 1 ms); re-arm
// in hops well under that so a very long TTL never overflows.
const MAX_TIMER_HOP_MS = 10 * 60 * 1000;

let inFlightRefresh: Promise<string | null> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let lifecycleListenersAttached = false;

function clearRefreshTimer(): void {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callRefreshEndpoint(): Promise<{ accessToken: string; expiresIn?: number }> {
    // Empty body: rely on the httpOnly bb_refresh_token cookie per the DTO's
    // own guidance, rather than trying to read a token JS can never see.
    const response = await axios.post(REFRESH_URL, {}, { withCredentials: true, timeout: 10000 });
    if (!response.data?.accessToken) {
        // A malformed/empty 200 (proxy hiccup, backend bug) must not be
        // treated as success — rotateAccessToken would otherwise write
        // `undefined` over a working access token.
        throw new Error('Refresh response missing accessToken');
    }
    return response.data;
}

async function doRefresh(): Promise<string | null> {
    // Cross-tab short-circuit: if another tab already rotated the cookie
    // past our freshness skew, use that instead of hitting the network.
    const msLeft = getMsUntilAccessTokenExpiry();
    if (msLeft !== null && msLeft > FRESHNESS_SKEW_MS) {
        return getAccessToken() ?? null;
    }

    try {
        const { accessToken, expiresIn } = await callRefreshEndpoint();
        rotateAccessToken({ accessToken, expiresIn });
        armProactiveTimer();
        return accessToken;
    } catch (error: unknown) {
        const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
        if (code === 'REFRESH_ALREADY_ROTATED') {
            // Another concurrent request (another tab, most likely) already
            // rotated this exact refresh token moments ago — benign per
            // bb-api's contract. Give its cookie write a beat, then retry
            // once; if it recurs, fall back to whatever the cookie now
            // holds rather than treating this as a failure.
            await sleep(250);
            try {
                const { accessToken, expiresIn } = await callRefreshEndpoint();
                rotateAccessToken({ accessToken, expiresIn });
                armProactiveTimer();
                return accessToken;
            } catch {
                return getAccessToken() ?? null;
            }
        }
        // Any other failure (invalid/expired refresh token, no cookie,
        // network error, CORS misconfiguration): this function never signs
        // anyone out — the caller decides what a null result means.
        return null;
    }
}

/** Single-flight: concurrent callers share the same in-flight request. */
// `reason` (TOKEN_EXPIRED, PROACTIVE_TIMER, …) documents each call site; it isn't sent anywhere.
export const refreshAccessToken: (opts?: { reason?: string }) => Promise<string | null> = () => {
    if (!inFlightRefresh) {
        inFlightRefresh = doRefresh().finally(() => {
            inFlightRefresh = null;
        });
    }
    return inFlightRefresh;
};

function armProactiveTimer(): void {
    clearRefreshTimer();
    if (typeof window === 'undefined' || !isManagedSession()) {
        return;
    }

    const msLeft = getMsUntilAccessTokenExpiry();
    if (msLeft === null) {
        return;
    }

    const lead = Math.min(MAX_LEAD_MS, Math.max(MIN_LEAD_MS, msLeft * LEAD_FRACTION));
    const delay = Math.max(0, msLeft - lead);

    if (delay > MAX_TIMER_HOP_MS) {
        refreshTimer = setTimeout(armProactiveTimer, MAX_TIMER_HOP_MS);
        return;
    }

    refreshTimer = setTimeout(() => {
        refreshAccessToken({ reason: 'PROACTIVE_TIMER' });
    }, delay);
}

function checkAndRefreshIfStale(): void {
    if (!isManagedSession()) {
        return;
    }
    const msLeft = getMsUntilAccessTokenExpiry();
    if (msLeft === null || msLeft <= MIN_LEAD_MS) {
        refreshAccessToken({ reason: 'VISIBILITY_CHECK' });
    } else {
        armProactiveTimer();
    }
}

/**
 * Arms the proactive timer and the visibility/focus/online listeners that
 * catch up a throttled background tab. No-ops entirely for an unmanaged
 * session. Returns a cleanup function.
 */
export function startRefreshLifecycle(): () => void {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    armProactiveTimer();

    if (!lifecycleListenersAttached) {
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('focus', checkAndRefreshIfStale);
        window.addEventListener('online', checkAndRefreshIfStale);
        lifecycleListenersAttached = true;
    }

    return () => {
        clearRefreshTimer();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('focus', checkAndRefreshIfStale);
        window.removeEventListener('online', checkAndRefreshIfStale);
        lifecycleListenersAttached = false;
    };
}

function onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
        checkAndRefreshIfStale();
    }
}

/** Called from doLogout, before the cookie is cleared, so a stray refresh can't resurrect it. */
export function stopRefreshLifecycle(): void {
    clearRefreshTimer();
    inFlightRefresh = null;
}
