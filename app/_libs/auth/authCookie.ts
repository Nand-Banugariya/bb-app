/**
 * Centralised read/write for the `auth` cookie's token + expiry, for the
 * opt-in short-lived-access-token flow (see the auth integration plan).
 *
 * The `auth` cookie itself is unchanged in shape/ownership — it stays a
 * non-httpOnly, `path: '/'` cookie written via react-cookie so both the
 * ~25 components doing `useCookies(['auth'])` and the browser extension's
 * `chrome.cookies.onChanged` watcher keep working exactly as they do today.
 * This module only adds one new top-level field, `accessTokenExpiresAt`
 * (an absolute epoch-ms timestamp derived from the login/refresh response's
 * relative `expiresIn`), and centralises every write so a rotated token
 * always lands back in the cookie for the many call sites that read it
 * directly.
 *
 * A session with no `accessTokenExpiresAt` is a "legacy" / unmanaged
 * session (the current backend, or a login that didn't send deviceId) —
 * `isManagedSession()` is the single gate every other piece of the new auth
 * flow (proactive refresh, the interceptor's refresh branches, the
 * proxy.ts refresh) checks before doing anything, which is what keeps
 * this whole feature inert until bb-api ships it.
 */

import Cookies from 'universal-cookie';
import { authCookieWriteOptions } from './authCookieOptions';

export interface AuthCookiePayload {
    user?: { email?: string; name?: string; [key: string]: unknown };
    session?: { id?: string; accessToken?: string; [key: string]: unknown };
    workspace?: string;
    project?: string;
    baseUrl?: string;
    /** Epoch ms. Absolute, because expiresIn is relative to receipt time and
     *  the cookie itself outlives any single access token by design. */
    accessTokenExpiresAt?: number;
    [key: string]: unknown;
}

const AUTH_COOKIE_NAME = 'auth';

// Fresh instance for reads: `.get()` re-parses document.cookie on every
// call, so this can never serve a value from a stale closure the way the
// old per-component `useCookies` destructuring could.
const readerCookies = typeof window !== 'undefined' ? new Cookies() : null;

type SetCookieFn = (name: string, value: unknown, options?: Record<string, unknown>) => void;

// The one react-cookie setter this module writes through, so writes are
// visible to every `useCookies(['auth'])` consumer via react-cookie's shared
// singleton instance. Registered from AuthSessionProvider
// (app/_component/providers/authSessionProvider.tsx). Until it's registered (very early boot), writes fall
// back to a plain universal-cookie instance below — correct for storage,
// just not reactive for already-mounted consumers.
let registeredSetCookie: SetCookieFn | null = null;

export function registerAuthCookieWriter(setCookie: SetCookieFn): void {
    registeredSetCookie = setCookie;
}

function writeAuthCookie(value: AuthCookiePayload): void {
    if (typeof window === 'undefined') {
        return;
    }
    const serialised = JSON.stringify(value);
    const options = authCookieWriteOptions();
    if (registeredSetCookie) {
        registeredSetCookie(AUTH_COOKIE_NAME, serialised, options);
        return;
    }
    // Fallback: still a correct write (and still visible to
    // chrome.cookies.onChanged / server-side readCookie), just not reactive
    // for components already subscribed via useCookies.
    new Cookies().set(AUTH_COOKIE_NAME, serialised, options);
}

/** Fresh parse of document.cookie. `undefined` on the server or if unset/unparsable. */
export function readAuthCookie(): AuthCookiePayload | undefined {
    if (!readerCookies) {
        return undefined;
    }
    const value = readerCookies.get(AUTH_COOKIE_NAME);
    return value && typeof value === 'object' ? (value as AuthCookiePayload) : undefined;
}

/**
 * Merge-write: preserves every field not present in `next`. If the existing
 * cookie is a managed session and `next` carries no fresh
 * `accessTokenExpiresAt`, the existing access token + expiry are kept
 * rather than overwritten — this is what stops a `who-am-i` (or any other
 * response that spreads a stale `session`) that was in flight during a
 * rotation from writing the pre-rotation token back over a freshly-rotated
 * one, since bb-api's who-am-i looks the session up by the exact token
 * presented in that request.
 *
 * This rule applies to every caller of persistAuthPayload, not just
 * who-am-i's — including accept-invitation/accept-request/onboarding
 * responses (app/invite-user/inviteUser.controller.tsx,
 * app/approve-request/approveUser.controller.tsx,
 * app/_component/contexts/onboardingContext.tsx), none of which carry
 * expiresIn either. In the rare case one of those responses' `session`
 * actually reflects a *newer* token than what's in the cookie (e.g. a
 * refresh completed mid-request), that newer token is discarded here and
 * the request pairs a now-superseded accessToken with the response's other
 * fields. This is intentionally accepted rather than "fixed" by trusting
 * `next.session.accessToken` whenever present: preferring the cookie's own
 * token is the safer default, and the fallout — a request 401s once — is
 * self-healing via the interceptor's stale-token retry / TOKEN_EXPIRED
 * refresh path (installAuthInterceptors.ts), not a lost session.
 */
export function persistAuthPayload(next: Partial<AuthCookiePayload>): void {
    if (typeof window === 'undefined') {
        return;
    }
    const current = readAuthCookie();
    const merged: AuthCookiePayload = { ...current, ...next };

    const nextCarriesFreshExpiry = Object.prototype.hasOwnProperty.call(
        next,
        'accessTokenExpiresAt'
    );
    if (current?.accessTokenExpiresAt && !nextCarriesFreshExpiry) {
        merged.session = { ...next.session, accessToken: current.session?.accessToken };
        merged.accessTokenExpiresAt = current.accessTokenExpiresAt;
    }

    writeAuthCookie(merged);
}

/** For the login/confirm funnel: stamps accessTokenExpiresAt from a relative expiresIn (seconds). */
export function persistLoginResponse(
    payload: Partial<AuthCookiePayload>,
    expiresIn?: number
): void {
    const next: Partial<AuthCookiePayload> = { ...payload };
    if (typeof expiresIn === 'number' && Number.isFinite(expiresIn)) {
        next.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
    }
    persistAuthPayload(next);
}

/** Rotate-in-place: the single call refreshClient.ts uses on a successful /auth/refresh. */
export function rotateAccessToken(params: { accessToken: string; expiresIn?: number }): void {
    if (typeof window === 'undefined') {
        return;
    }
    const current = readAuthCookie();
    // No existing managed session to rotate (e.g. a refresh landing after
    // logout already cleared the cookie) — never resurrect a partial cookie.
    if (!current) {
        return;
    }
    const next: AuthCookiePayload = {
        ...current,
        session: { ...current.session, accessToken: params.accessToken },
        accessTokenExpiresAt:
            typeof params.expiresIn === 'number'
                ? Date.now() + params.expiresIn * 1000
                : current.accessTokenExpiresAt
    };
    writeAuthCookie(next);
}

export function getAccessToken(): string | undefined {
    return readAuthCookie()?.session?.accessToken;
}

/** True once a login has opted into the new flow (an expiry is being tracked). */
export function isManagedSession(): boolean {
    return typeof readAuthCookie()?.accessTokenExpiresAt === 'number';
}

export function getMsUntilAccessTokenExpiry(): number | null {
    const expiresAt = readAuthCookie()?.accessTokenExpiresAt;
    return typeof expiresAt === 'number' ? expiresAt - Date.now() : null;
}
