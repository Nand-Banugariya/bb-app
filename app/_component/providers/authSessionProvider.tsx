'use client';

import * as React from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { API } from '@lib/axiosConfig';
import { readAuthCookie, registerAuthCookieWriter } from '@lib/auth/authCookie';
import {
    installAuthResponseInterceptor,
    type AuthInterceptorHandlers
} from '@lib/auth/installAuthInterceptors';
import { startRefreshLifecycle, stopRefreshLifecycle } from '@lib/auth/refreshClient';
import { setAuthNotice } from '@lib/auth/authNotice';
import { BB_UID_COOKIE, delete_cookie, getCrossDomainCookieDomain } from '@lib/helpers';
import { analytics } from '@lib/analytics';
import { logger } from '@lib/logger';
import { loginReset, loginUserReset, logoutUser } from '@redux/slices/auth';
import type { AppDispatch } from '@redux/store';

type AuthSessionContextValue = {
    /**
     * Signs out: stops token refresh, calls /auth/logout (unless `noApiCall`), clears the auth
     * cookies, Redux and local storage, then reloads to the app root.
     */
    logout: (noApiCall?: boolean, reason?: string) => Promise<void>;
};

const AuthSessionContext = React.createContext<AuthSessionContextValue | null>(null);

async function performLogout(dispatch: AppDispatch, noApiCall = false, reason?: string) {
    // Stop the refresh timer before clearing the cookie, so a refresh already in flight can't
    // write a rotated token back into a cookie that's about to be deleted.
    stopRefreshLifecycle();
    const sessionId = readAuthCookie()?.session?.id;
    try {
        if (sessionId) {
            // Record why a non-user-initiated logout happened before resetting analytics
            // identity, so unexpected logouts are analyzable.
            if (reason) analytics.capture('user_logged_out', { reason, sessionId });
            await logoutUser({ noApiCall, sessionId, reason });
        }
    } catch (error) {
        logger.error(error);
    }
    delete_cookie('auth');
    delete_cookie(BB_UID_COOKIE, getCrossDomainCookieDomain());
    dispatch(loginReset());
    dispatch(loginUserReset());
    localStorage.removeItem('selectedProject');
    localStorage.removeItem('onboarding_form_data');
    localStorage.removeItem('invitedUsers');
    setTimeout(() => {
        window.location.href = window.location.origin;
    }, 500);
}

/**
 * The client side of bb-app's session handling (the auth wiring that lived in layoutContext):
 *   - gives authCookie.ts react-cookie's setter, so cookie rotations re-render every
 *     useCookies(['auth']) consumer;
 *   - installs the 401 response interceptor (refresh + retry, hard sign-out with a one-shot
 *     notice for revoked/invalid sessions, soft redirect to /login for a legacy 401);
 *   - runs the proactive access-token refresh while a session exists.
 * Mounted once in app/layout.tsx, inside ReduxProvider and CookiesProvider.
 */
function AuthSessionProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const [{ auth }, setAuthCookie] = useCookies(['auth']);

    const hasSession = Boolean(auth?.session?.accessToken);
    const accessTokenExpiresAt = auth?.accessTokenExpiresAt;

    // Latest handlers for the interceptor, which is installed once and reads them via the ref.
    const handlersRef = React.useRef<AuthInterceptorHandlers>({
        onHardSignOut: () => {},
        onLegacyUnauthorized: () => {}
    });

    React.useLayoutEffect(() => {
        registerAuthCookieWriter(
            setAuthCookie as (
                name: string,
                value: unknown,
                options?: Record<string, unknown>
            ) => void
        );
        handlersRef.current = {
            onHardSignOut: (reason, message) => {
                // Set before logout's hard navigation, which would destroy an in-page toast.
                setAuthNotice(reason, message);
                performLogout(dispatch, true);
            },
            // A code-less 401 (every 401 until bb-api ships the new flow) is a soft redirect
            // that keeps invite/request tokens. It still clears the stale cookie and Redux
            // state itself, otherwise the next page would re-fetch who-am-i and 401 again.
            onLegacyUnauthorized: () => {
                delete_cookie('auth');
                delete_cookie(BB_UID_COOKIE, getCrossDomainCookieDomain());
                dispatch(loginReset());
                dispatch(loginUserReset());
                const { pathname, search, href } = window.location;
                if (href.includes('intercom')) {
                    localStorage.setItem('sessionRedirectUrl', href);
                }
                const token = new URLSearchParams(search).get('token');
                if (token && pathname.includes('invite-user')) {
                    router.push(`/login?inviteUserToken=${encodeURIComponent(token)}`);
                } else if (token && pathname.includes('approve-request')) {
                    router.push(`/login?requestToken=${encodeURIComponent(token)}`);
                } else {
                    router.push('/login');
                }
            }
        };
    });

    React.useLayoutEffect(() => {
        installAuthResponseInterceptor(API(), handlersRef);
    }, []);

    // Proactive refresh + visibility/focus/online catch-up while signed in. Inert for a
    // session that hasn't opted into the short-lived-token flow (see isManagedSession()).
    // Re-armed when a login or rotation stamps a new expiry.
    React.useEffect(() => {
        if (!hasSession) return;
        return startRefreshLifecycle();
    }, [hasSession, accessTokenExpiresAt]);

    // Created once: `dispatch` is stable for the store's lifetime.
    const [value] = React.useState<AuthSessionContextValue>(() => ({
        logout: (noApiCall, reason) => performLogout(dispatch, noApiCall, reason)
    }));

    return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

function useAuthSession() {
    const context = React.useContext(AuthSessionContext);
    if (!context) throw new Error('useAuthSession must be used within AuthSessionProvider.');
    return context;
}

export { AuthSessionProvider, useAuthSession };
