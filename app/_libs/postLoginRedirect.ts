/**
 * Post-login redirect helper.
 *
 * When an unauthenticated user opens a private session link we send them to
 * `/login`, remember where they were headed, and put them back there once the
 * login (and, for brand new users, the onboarding) flow finishes.
 *
 * Stored in `sessionStorage` so it survives the full page loads inside the auth
 * flow (OAuth round trips, `window.location.href` navigations at the end of
 * onboarding) without leaking into the user's other tabs.
 */

const REDIRECT_KEY = 'sessionRedirectUrl';
const REDIRECT_AT_KEY = 'sessionRedirectUrlAt';

/** Anything older than this is treated as abandoned. */
const REDIRECT_TTL_MS = 30 * 60 * 1000;

/**
 * Only same-origin, path-style targets are allowed — never an absolute URL
 * coming from the outside, which would turn this into an open redirect.
 */
function isSafeRedirectPath(url: string | null | undefined): url is string {
    return !!url && url.startsWith('/') && !url.startsWith('//');
}

function clear(): void {
    try {
        sessionStorage.removeItem(REDIRECT_KEY);
        sessionStorage.removeItem(REDIRECT_AT_KEY);
    } catch {
        // storage unavailable (private mode / blocked) — nothing to clean up
    }
}

/**
 * Remembers where to land after login. Defaults to the current location,
 * including search params (e.g. `?inviteToken=`) and hash.
 */
export function setPostLoginRedirect(url?: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    const target =
        url ?? `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (!isSafeRedirectPath(target) || target.startsWith('/login')) {
        return;
    }

    try {
        sessionStorage.setItem(REDIRECT_KEY, target);
        sessionStorage.setItem(REDIRECT_AT_KEY, `${Date.now()}`);
    } catch {
        // storage unavailable — redirect simply falls back to the default landing page
    }
}

/** Returns the pending redirect without clearing it. */
export function peekPostLoginRedirect(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    let target: string | null = null;
    let storedAt: string | null = null;

    try {
        target = sessionStorage.getItem(REDIRECT_KEY);
        storedAt = sessionStorage.getItem(REDIRECT_AT_KEY);
    } catch {
        return null;
    }

    if (!isSafeRedirectPath(target)) {
        if (target) {
            clear();
        }
        return null;
    }

    // Values written before this helper existed have no timestamp; honour them.
    if (storedAt && Date.now() - Number(storedAt) > REDIRECT_TTL_MS) {
        clear();
        return null;
    }

    return target;
}

/** Returns the pending redirect and clears it, so it is used at most once. */
export function consumePostLoginRedirect(): string | null {
    const target = peekPostLoginRedirect();
    if (target) {
        clear();
    }
    return target;
}

export function clearPostLoginRedirect(): void {
    clear();
}
