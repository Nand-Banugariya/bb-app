import { NextRequest, NextResponse } from 'next/server';
import { authCookieWriteOptions } from '@lib/auth/authCookieOptions';

/**
 * Request gate (Next 16 `proxy`, formerly `middleware`), ported from bb-app's middleware.ts:
 *   1. Optional HTTP basic auth for non-production environments (ENABLE_BASIC_AUTH=1).
 *   2. `/login?sessionId=…` (admin sign-in hand-over) clears any existing `auth` cookie.
 *   3. Signed-out visitors go to /login, keeping invite tokens and a `next=` deep link.
 *   4. Signed-in visitors carrying invite tokens are sent straight to the invite page.
 *   5. A managed session's access token is refreshed server-side just before it expires.
 * Runs on the Node runtime (the Next 16 default for proxy).
 */

// Server-only: reads the original .env names; nothing here reaches the browser.
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT ?? process.env.NEXT_API_ENDPOINT;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuthCookie = Record<string, any>;

function readAuthCookie(req: NextRequest): AuthCookie | null {
    const raw = req.cookies.get('auth')?.value;
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

/** `NextResponse.next()`, forwarding request changes made here (the refreshed auth cookie). */
function nextResponse(req: NextRequest, forwardHeaders = false): NextResponse {
    if (!forwardHeaders) return NextResponse.next();
    return NextResponse.next({ request: { headers: new Headers(req.headers) } });
}

// ============================================================================
// BASIC AUTH
// ============================================================================

/**
 * Returns a 401 challenge when credentials are missing or wrong, or null to continue.
 * (bb-app answered a failure with a rewrite to the same URL, which let the request through.)
 */
function checkBasicAuth(req: NextRequest): NextResponse | null {
    const challenge = () =>
        new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic realm="BetterBugs", charset="UTF-8"' }
        });

    const header = req.headers.get('authorization');
    if (!header?.startsWith('Basic ')) return challenge();

    let user = '';
    let pwd = '';
    try {
        const decoded = atob(header.slice('Basic '.length));
        const separator = decoded.indexOf(':');
        user = decoded.slice(0, separator);
        pwd = decoded.slice(separator + 1);
    } catch {
        return challenge();
    }

    const validUser = process.env.BASIC_AUTH_USER;
    const validPassword = process.env.BASIC_AUTH_PASSWORD;
    if (validUser && validPassword && user === validUser && pwd === validPassword) {
        return null;
    }
    return challenge();
}

// ============================================================================
// SIGNED-OUT VISITORS
// ============================================================================

/** Pages a signed-out visitor may open. Onboarding pages always need a session. */
function isPublicPath(pathname: string): boolean {
    if (pathname.includes('onboarding')) return false;
    return (
        pathname === '/login' ||
        pathname.startsWith('/login/') ||
        pathname === '/session' ||
        pathname.startsWith('/session/')
    );
}

/**
 * Redirects to /login with the invite/request tokens and the deep link preserved.
 * `req.nextUrl.clone()` keeps every other search param (e.g. betterbugs-recording).
 */
function redirectToLogin(req: NextRequest): NextResponse {
    const url = req.nextUrl.clone();
    const pathname = req.nextUrl.pathname;
    const token = req.nextUrl.searchParams.get('token');

    url.pathname = '/login';

    if (token && pathname.includes('invite-user')) {
        url.searchParams.delete('token');
        url.searchParams.set('inviteUserToken', token);
    } else if (token && pathname.includes('approve-request')) {
        url.searchParams.delete('token');
        url.searchParams.set('requestToken', token);
    } else if (pathname.startsWith('/join/') || pathname.startsWith('/join-project/')) {
        // Invite links carry their token in the path, not a query param, so it has to be lifted
        // out before the redirect drops it.
        const inviteToken = pathname.split('/')[2];
        if (inviteToken) {
            url.searchParams.set(
                pathname.startsWith('/join-project/') ? 'joinProjectToken' : 'joinToken',
                inviteToken
            );
        }
    }

    // Remember where the visitor was headed (a session link shared in Slack, a settings deep
    // link…) so sign-in can bring them back. Same-origin path + query only; invite/request
    // links already carry their own token above.
    const isTokenLink =
        (token && (pathname.includes('invite-user') || pathname.includes('approve-request'))) ||
        pathname.startsWith('/join/') ||
        pathname.startsWith('/join-project/');
    if (!isTokenLink && pathname !== '/' && !pathname.startsWith('/login')) {
        url.searchParams.set('next', `${pathname}${req.nextUrl.search}`);
    }

    const response = NextResponse.redirect(url);

    // Preserve the Intercom install redirect.
    const original = req.nextUrl.toString();
    if (original.includes('intercom')) {
        response.cookies.set('redirectUrl', original);
    }

    return response;
}

// ============================================================================
// SIGNED-IN VISITORS
// ============================================================================

/** Sends a signed-in visitor carrying an invite/request token to the page that handles it. */
function handleTokenRedirects(req: NextRequest): NextResponse | null {
    const searchParams = req.nextUrl.searchParams;

    const joinToken = searchParams.get('joinToken');
    if (joinToken) {
        const url = req.nextUrl.clone();
        url.pathname = `/join/${joinToken}`;
        url.searchParams.delete('joinToken');
        return NextResponse.redirect(url);
    }

    const joinProjectToken = searchParams.get('joinProjectToken');
    if (joinProjectToken) {
        const url = req.nextUrl.clone();
        url.pathname = `/join-project/${joinProjectToken}`;
        url.searchParams.delete('joinProjectToken');
        return NextResponse.redirect(url);
    }

    const inviteUserToken = searchParams.get('inviteUserToken');
    if (inviteUserToken) {
        const url = req.nextUrl.clone();
        url.pathname = '/invite-user';
        url.searchParams.set('token', inviteUserToken);
        url.searchParams.delete('inviteUserToken');
        return NextResponse.redirect(url);
    }

    const requestToken = searchParams.get('requestToken');
    if (requestToken) {
        const url = req.nextUrl.clone();
        url.pathname = '/approve-request';
        url.searchParams.set('token', requestToken);
        url.searchParams.delete('requestToken');
        return NextResponse.redirect(url);
    }

    return null;
}

// ============================================================================
// AUTH TOKEN REFRESH (opt-in short-lived-access-token flow)
//
// Inert until bb-api ships deviceId support and sets bb_refresh_token for the app's domain —
// every short-circuit below falls through to `next()` with no network call, no redirect and
// never a sign-out. It never fetches user data (an API call per request is what caused bb-app's
// MIDDLEWARE_INVOCATION_TIMEOUT); it only refreshes when the access token in the `auth` cookie
// is at/near expiry, roughly once per token TTL per active user.
// ============================================================================

const REFRESH_SKEW_MS = 60 * 1000;
const REFRESH_TIMEOUT_MS = 1500;
const REFRESH_PENDING_COOKIE = 'bb_refresh_pending';
const REFRESH_PENDING_TTL_SECONDS = 15;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeReadJson(response: Response): Promise<any> {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

/** Skip prefetches, RSC data requests, and non-navigation asset/XHR traffic. */
function isDocumentNavigation(req: NextRequest): boolean {
    if (req.headers.get('next-router-prefetch')) return false;
    if (req.headers.get('rsc')) return false;
    const secFetchMode = req.headers.get('sec-fetch-mode');
    if (secFetchMode) return secFetchMode === 'navigate';
    return (req.headers.get('accept') || '').includes('text/html');
}

/**
 * If the access token in the `auth` cookie is stale and a refresh looks possible, refreshes it
 * against bb-api and rewrites the `auth` cookie on both the in-flight request and the response.
 * Returns null when there's nothing to do; on failure it returns a plain pass-through (with a
 * short "don't retry yet" marker cookie), so a failure is always invisible to the user.
 */
async function maybeRefreshAccessToken(
    req: NextRequest,
    authCookie: AuthCookie
): Promise<NextResponse | null> {
    const expiresAt = authCookie?.accessTokenExpiresAt;
    if (typeof expiresAt !== 'number') return null; // unmanaged/legacy session
    if (expiresAt - Date.now() > REFRESH_SKEW_MS) return null;
    const refreshCookie = req.cookies.get('bb_refresh_token')?.value;
    if (!refreshCookie) return null;
    if (req.cookies.get(REFRESH_PENDING_COOKIE)) return null; // a recent attempt failed
    if (!isDocumentNavigation(req)) return null;

    const markPending = () => {
        const res = nextResponse(req);
        res.cookies.set(REFRESH_PENDING_COOKIE, '1', {
            path: '/',
            maxAge: REFRESH_PENDING_TTL_SECONDS
        });
        return res;
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

    try {
        const upstream = await fetch(`${API_ENDPOINT}/auth/refresh`, {
            method: 'POST',
            headers: {
                cookie: `bb_refresh_token=${refreshCookie}`,
                'content-type': 'application/json'
            },
            body: '{}',
            cache: 'no-store',
            signal: controller.signal
        });

        const parsed = upstream.ok ? await upstream.json() : await safeReadJson(upstream);

        // Unlike the client refresh (refreshClient.ts), this can't usefully retry on
        // REFRESH_ALREADY_ROTATED: `refreshCookie` is a snapshot of this request's Cookie
        // header, so a retry would fail identically. Fall through, keep the current token, and
        // let the client-side refresh lifecycle (which sees the live cookie jar) catch up.
        const accessToken = parsed?.accessToken;
        const expiresIn = parsed?.expiresIn;

        if (!upstream.ok || !accessToken) {
            // A malformed/empty 200 is treated as a failure — writing `undefined` over a
            // working accessToken would break the session for every later request/tab.
            return markPending();
        }

        const nextAuthCookie = {
            ...authCookie,
            session: { ...authCookie.session, accessToken },
            accessTokenExpiresAt: Date.now() + expiresIn * 1000
        };
        const serialised = JSON.stringify(nextAuthCookie);

        // Make the refreshed token visible to this same render (forwarded request headers).
        req.cookies.set('auth', serialised);
        const res = nextResponse(req, true);

        // Persist to the browser with the same options the client writer uses.
        res.cookies.set('auth', serialised, authCookieWriteOptions());
        res.cookies.delete(REFRESH_PENDING_COOKIE);

        // Forward bb-api's rotated refresh cookie verbatim — the reason this lives in the proxy
        // rather than a Server Component (which can't set cookies).
        upstream.headers.getSetCookie().forEach((value) => res.headers.append('set-cookie', value));

        return res;
    } catch {
        // Timeout, network error or malformed response — never sign out or redirect from here.
        return markPending();
    } finally {
        clearTimeout(timeout);
    }
}

// ============================================================================
// PROXY
// ============================================================================

export async function proxy(req: NextRequest) {
    // 1. Basic auth (non-production environments).
    if (process.env.ENABLE_BASIC_AUTH === '1') {
        const challenge = checkBasicAuth(req);
        if (challenge) return challenge;
    }

    const pathname = req.nextUrl.pathname;

    // 2. Admin sign-in hand-over: start from a clean session.
    if (pathname === '/login' && req.nextUrl.searchParams.get('sessionId')) {
        const response = NextResponse.next();
        response.cookies.delete('auth');
        return response;
    }

    // 3. Signed out: public pages pass, everything else goes to /login.
    const authCookie = readAuthCookie(req);
    if (!authCookie) {
        if (isPublicPath(pathname)) return NextResponse.next();
        return redirectToLogin(req);
    }

    // 4. Signed in with an invite/request token: go handle it.
    const tokenRedirect = handleTokenRedirects(req);
    if (tokenRedirect) return tokenRedirect;

    // 5. Refresh a stale-but-managed access token before it's used downstream.
    if (!pathname.startsWith('/login')) {
        const refreshResponse = await maybeRefreshAccessToken(req, authCookie);
        if (refreshResponse) return refreshResponse;
    }

    // Onboarding and every other signed-in page: let the page decide (server components read
    // who-am-i via getAuthenticatedUserData; the proxy deliberately makes no user-data calls).
    return nextResponse(req);
}

export const config = {
    matcher: [
        // Everything except API routes, Next internals and static assets.
        '/((?!api|_next/static|_next/image|favicon.ico|images|videos|fonts|manifest.webmanifest|sw|workbox).*)'
    ]
};
