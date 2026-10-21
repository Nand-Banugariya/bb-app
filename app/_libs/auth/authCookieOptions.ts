/**
 * Shared `auth` cookie write-options computation. Deliberately dependency-free
 * (no `universal-cookie`, no `document`, no Next.js APIs) so it can be
 * imported from BOTH the browser-side writer (authCookie.ts) and
 * proxy.ts, which must not pull in
 * anything with browser-only assumptions.
 */

export function authCookieWriteOptions() {
    // Computed fresh on every call rather than once at module load (as
    // bb-app's helpers.tsx `cookieOptions` is), so a write actually
    // extends the cookie's expiry instead of reusing a stale timestamp.
    const expires = new Date();
    expires.setTime(expires.getTime() + 2190 * 60 * 60 * 1000);
    return { path: '/', secure: false, httpOnly: false, expires };
}
