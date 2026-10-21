/**
 * One-shot "why were you signed out" notice, carried across the hard
 * `window.location.href` navigation that doLogout ends with (which destroys
 * any in-page toast). Follows the same sessionStorage + TTL + one-shot
 * pattern as app/_libs/postLoginRedirect.ts, and for the same reason:
 * sessionStorage keeps the notice scoped to the tab that actually got
 * signed out rather than broadcasting it to every open tab the way
 * localStorage would.
 */

const NOTICE_KEY = 'bb_auth_notice';
const NOTICE_AT_KEY = 'bb_auth_notice_at';

/** Anything older than this is treated as stale/unrelated to the current landing. */
const NOTICE_TTL_MS = 60 * 1000;

export type AuthNoticeReason = 'SESSION_REVOKED' | 'INVALID_TOKEN' | 'REFRESH_FAILED';

export interface AuthNotice {
    reason: AuthNoticeReason;
    /**
     * bb-api's own user-facing explanation, when it has one — currently
     * only SESSION_REVOKED carries one, worded server-side per its
     * revokedReason (NEW_LOGIN, REUSE_DETECTED, ADMIN, LOGOUT). Prefer this
     * over any client-hardcoded copy so wording changes on bb-api's side
     * don't need a bb-app release; the consumer still falls back to its own
     * copy when this is absent (older bb-api, or a reason with no server
     * message).
     */
    message?: string;
}

function clear(): void {
    try {
        sessionStorage.removeItem(NOTICE_KEY);
        sessionStorage.removeItem(NOTICE_AT_KEY);
    } catch {
        // storage unavailable — nothing to clean up
    }
}

export function setAuthNotice(reason: AuthNoticeReason, message?: string): void {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        sessionStorage.setItem(NOTICE_KEY, JSON.stringify({ reason, message }));
        sessionStorage.setItem(NOTICE_AT_KEY, `${Date.now()}`);
    } catch {
        // storage unavailable — the redirect will just land without a message
    }
}

/** Returns the pending notice and clears it, so it is surfaced at most once. */
export function consumeAuthNotice(): AuthNotice | null {
    if (typeof window === 'undefined') {
        return null;
    }

    let raw: string | null = null;
    let storedAt: string | null = null;
    try {
        raw = sessionStorage.getItem(NOTICE_KEY);
        storedAt = sessionStorage.getItem(NOTICE_AT_KEY);
    } catch {
        return null;
    }

    if (!raw) {
        return null;
    }
    clear();

    if (storedAt && Date.now() - Number(storedAt) > NOTICE_TTL_MS) {
        return null;
    }

    let parsed: { reason?: string; message?: string };
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (
        parsed.reason === 'SESSION_REVOKED' ||
        parsed.reason === 'INVALID_TOKEN' ||
        parsed.reason === 'REFRESH_FAILED'
    ) {
        return { reason: parsed.reason, message: parsed.message };
    }
    return null;
}
