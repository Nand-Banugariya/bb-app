/**
 * Error-shape helpers for bb-api's opt-in auth flow. `app/_libs/axiosConfig.ts`'s
 * `fetch()` wraps every failed request into a plain `Error` with
 * `.responseStatus` / `.responseData` attached (the same shape a few
 * existing call sites already branch on, e.g. FREE_CAP_REACHED in
 * workspaceMemberSettings.view.tsx) — these helpers just give that a name
 * for the new auth-specific codes.
 */

export interface SessionConflictErrorPayload {
    message: string;
    existingSession?: {
        deviceLabel?: string;
        ipAddress?: string;
        lastActiveAt?: string;
    };
    confirmationToken: string;
}

/** The fields of a normalized fetch() error these helpers read (see app/_libs/axiosConfig.ts). */
type ApiErrorLike = {
    responseData?: {
        code?: unknown;
        message?: string;
        existingSession?: SessionConflictErrorPayload['existingSession'];
        confirmationToken?: string;
    };
};

export function getApiErrorCode(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') {
        return undefined;
    }
    const code = (error as ApiErrorLike).responseData?.code;
    return typeof code === 'string' ? code : undefined;
}

/**
 * Returns the SESSION_CONFLICT payload if `error` is a 409 from a
 * login-family call, else null. Never throws — safe to call on any caught
 * error.
 */
export function asSessionConflict(error: unknown): SessionConflictErrorPayload | null {
    if (getApiErrorCode(error) !== 'SESSION_CONFLICT') {
        return null;
    }
    const data = (error as ApiErrorLike).responseData;
    if (!data?.confirmationToken) {
        return null;
    }
    return {
        message: data.message ?? '',
        existingSession: data.existingSession,
        confirmationToken: data.confirmationToken
    };
}
