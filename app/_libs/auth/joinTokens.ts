/**
 * Invite-link tokens across an authentication round trip.
 *
 * `/join/<token>` and `/join-project/<token>` bounce an unauthenticated
 * visitor to `/login?joinToken=…` (see proxy.ts). For the email + OTP
 * path that is enough: the browser never leaves `/login`, so the query string
 * is still there when the login finishes.
 *
 * Every other path leaves the app entirely and comes back on a URL we do not
 * control the query string of:
 *
 *   - Google / GitHub return to `/login?code=…&app=…`, keeping only whatever
 *     was put in the OAuth `state` parameter.
 *   - SSO returns to `/login/sso/callback?saml_access_code=…`, keeping only
 *     whatever was put in the SAML RelayState (bb-api threads that through
 *     `verify-sso-email` → `redeem-sso-user-data`).
 *
 * Without carrying the token through those, the join is silently dropped: the
 * user signs in fine and lands on their own workspace, with nothing to say the
 * invite they clicked was ever seen. So the token rides `state` where there is
 * one, with a sessionStorage copy as the same-tab fallback the SSO flow
 * already uses for `inviteUserToken`.
 */

export interface JoinTokens {
    /** Workspace invite link — `/join/<token>`. */
    joinToken?: string | null;
    /** Project invite link — `/join-project/<token>`. */
    joinProjectToken?: string | null;
}

const SSO_JOIN_TOKEN_KEY = 'joinToken';
const SSO_JOIN_PROJECT_TOKEN_KEY = 'joinProjectToken';

/** True when either kind of invite-link token is present. */
export const hasJoinToken = (tokens: JoinTokens | null | undefined): boolean =>
    Boolean(tokens?.joinToken || tokens?.joinProjectToken);

/**
 * Where a login carrying an invite-link token should land, or null if it
 * carries none. A workspace token wins over a project one if both somehow
 * arrive together — joining the workspace is the strictly smaller grant.
 */
export const joinRedirectPath = (tokens: JoinTokens | null | undefined): string | null => {
    if (tokens?.joinToken) {
        return `/join/${tokens.joinToken}`;
    }
    if (tokens?.joinProjectToken) {
        return `/join-project/${tokens.joinProjectToken}`;
    }
    return null;
};

/** Reads both tokens off a URL's query string. */
export const readJoinTokens = (
    searchParams: URLSearchParams | ReadonlyURLSearchParamsLike | null | undefined
): JoinTokens => ({
    joinToken: searchParams?.get('joinToken') ?? null,
    joinProjectToken: searchParams?.get('joinProjectToken') ?? null
});

/** The read-only slice of URLSearchParams that next/navigation hands back. */
interface ReadonlyURLSearchParamsLike {
    get(name: string): string | null;
}

/**
 * The OAuth `state` round-trip parameter, as this app uses it: a JSON object
 * of whatever tokens the login is carrying.
 *
 * Parsing is deliberately total — `state` comes back from a third party, and a
 * provider that echoes something we did not send (or nothing at all) must
 * degrade to "no tokens", not throw partway through the login handler and
 * abandon a user who has already authenticated with Google.
 */
export interface OAuthLoginState extends JoinTokens {
    inviteUserToken?: string | null;
    requestToken?: string | null;
    utmSourceToken?: string | null;
}

export const parseOAuthState = (state: string | null | undefined): OAuthLoginState => {
    if (!state) {
        return {};
    }
    try {
        const parsed = JSON.parse(state);
        return parsed && typeof parsed === 'object' ? (parsed as OAuthLoginState) : {};
    } catch {
        return {};
    }
};

/**
 * Serializes the tokens a social login is carrying, or null when it carries
 * none (in which case the caller leaves `state` off the authorize URL
 * entirely, exactly as before).
 *
 * Every present token is included. The previous per-token if/else chain meant
 * a visitor who arrived on an invite link with a UTM tag kept only whichever
 * branch was checked first.
 */
export const buildOAuthState = (state: OAuthLoginState): string | null => {
    const entries = Object.entries(state).filter(([, value]) => Boolean(value));
    return entries.length ? JSON.stringify(Object.fromEntries(entries)) : null;
};

/**
 * Keeps the tokens on an in-app navigation that would otherwise drop them —
 * "Continue with SSO" (/login → /login/sso) and "Login without SSO" going
 * back. Same reason the OAuth buttons need `state`: the destination page reads
 * these off its own query string.
 */
export const withLoginTokens = (
    path: string,
    tokens: {
        inviteUserToken?: string | null;
        requestToken?: string | null;
        joinToken?: string | null;
        joinProjectToken?: string | null;
    }
): string => {
    const params = new URLSearchParams();
    Object.entries(tokens).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });
    const query = params.toString();
    return query ? `${path}?${query}` : path;
};

/**
 * The SSO fallback. bb-api carries these through the SAML RelayState, which is
 * what makes an IdP-initiated or cross-tab flow work; this copy covers the
 * ordinary same-tab case against an API that has not shipped the RelayState
 * change yet. Mirrors how `inviteUserToken` / `requestToken` are already
 * stashed by sso.controller.tsx.
 */
export const stashSSOJoinTokens = (tokens: JoinTokens): void => {
    // Writes *or clears*, so each SSO attempt fully replaces the last one. A
    // plain sign-in started in a tab that previously abandoned an invite must
    // not inherit that invite and land on a /join page nobody asked for.
    const write = (key: string, value: string | null | undefined) => {
        if (value) {
            window.sessionStorage.setItem(key, value);
        } else {
            window.sessionStorage.removeItem(key);
        }
    };
    try {
        write(SSO_JOIN_TOKEN_KEY, tokens.joinToken);
        write(SSO_JOIN_PROJECT_TOKEN_KEY, tokens.joinProjectToken);
    } catch {
        // storage unavailable — the RelayState copy is the one that matters
    }
};

export const readSSOJoinTokens = (): JoinTokens => {
    try {
        return {
            joinToken: window.sessionStorage.getItem(SSO_JOIN_TOKEN_KEY),
            joinProjectToken: window.sessionStorage.getItem(SSO_JOIN_PROJECT_TOKEN_KEY)
        };
    } catch {
        return {};
    }
};

/**
 * One-shot, like the notice in authNotice.ts: a token left behind after the
 * user chose not to join would hijack their *next* SSO sign-in in the same
 * tab and send them back to an invite they already walked away from.
 */
export const clearSSOJoinTokens = (): void => {
    try {
        window.sessionStorage.removeItem(SSO_JOIN_TOKEN_KEY);
        window.sessionStorage.removeItem(SSO_JOIN_PROJECT_TOKEN_KEY);
    } catch {
        // storage unavailable — nothing to clean up
    }
};
