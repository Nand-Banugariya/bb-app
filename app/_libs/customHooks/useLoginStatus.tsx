'use client';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { BB_UID_COOKIE, getAnalyticsCookieOptions } from '@lib/helpers';
import { persistAuthPayload } from '@lib/auth/authCookie';
import { LoginState, fetchLoginUser } from '@redux/slices/auth';
import type { RootState } from '@redux/reducers';
import type { AppDispatch } from '@redux/store';

/**
 * Login status for the sign-in flows: once a login response arrives it fetches who-am-i, and
 * once who-am-i succeeds it writes the `auth` cookie (and the analytics uid cookie) and
 * reports `true`.
 *
 * bb-app kept `isLogin` in state and set it from an effect; here it's derived from the
 * who-am-i result instead (same moment, no extra render). The cookie write still happens in
 * the effect below, which runs before the caller's own effects in the same commit.
 */
const useLoginStatus = (loginState: LoginState) => {
    const loginUser = useSelector((state: RootState) => state.loginUser);
    const [, setCookie] = useCookies([BB_UID_COOKIE]);
    const dispatch = useDispatch<AppDispatch>();

    const isLogin = Boolean(
        loginUser?.isLogin === true && loginUser?.data && loginUser?.data?.session?.id
    );

    useEffect(() => {
        if (!isLogin) return;
        const payload = {
            user: {
                email: loginUser?.data?.user?.email,
                name: loginUser?.data?.user?.name || ''
            },
            session: loginUser?.data?.session,
            workspace: loginUser?.data?.workspaceId,
            project: loginUser?.data?.projectId,
            baseUrl: loginUser?.data?.baseUrl
        };
        const selectionPayload = {
            workspace: loginUser?.data?.workspaceId,
            project: loginUser?.data?.projectId
        };
        localStorage.setItem('selectedProject', JSON.stringify(selectionPayload));
        // who-am-i carries no expiresIn, so this never stamps a fresh expiry —
        // persistAuthPayload's never-downgrade rule keeps a managed session's current access
        // token/expiry intact here.
        persistAuthPayload(payload);
        if (loginUser?.data?.user?.id) {
            setCookie(BB_UID_COOKIE, loginUser.data.user.id, getAnalyticsCookieOptions());
        }
    }, [isLogin, loginUser, setCookie]);

    useEffect(() => {
        if (loginState?.data?.session?.accessToken) {
            dispatch(
                fetchLoginUser({
                    authorization: `Bearer ${loginState?.data?.session?.accessToken}`
                })
            );
        }
    }, [loginState, dispatch]);

    return isLogin;
};

export default useLoginStatus;
