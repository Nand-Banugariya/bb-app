'use client';

import * as React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCookies } from 'react-cookie';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { toast } from 'sonner';
import { useOnboardingContext } from '@components/contexts/onboardingContext';
import SessionConflictModal from '@components/modals/sessionConflictModal';
import SignedOutNoticeModal from '@components/modals/signedOutNoticeModal';
import type { RootState } from '@redux/reducers';
import {
    githubLoginAPI,
    googleLoginAPI,
    loginFromAdminAPI,
    otpVerificationAPI,
    resendOtpAPI
} from '@redux/services/auth.api';
import {
    doLogin,
    doLoginConfirm,
    fetchLoginUser,
    loginConflictReset,
    loginReset,
    loginSessionConflict,
    loginUserReset,
    type LoginPayload,
    type LoginState,
    type LoginUserState
} from '@redux/slices/auth';
import { analytics } from '@lib/analytics';
import { persistLoginResponse } from '@lib/auth/authCookie';
import { asSessionConflict } from '@lib/auth/authErrors';
import { consumeAuthNotice, type AuthNotice } from '@lib/auth/authNotice';
import { joinRedirectPath, parseOAuthState } from '@lib/auth/joinTokens';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    UTM_SOURCES_FOR_FREE_TRIAL_90_DAYS
} from '@lib/constants';
import useLoginStatus from '@lib/customHooks/useLoginStatus';
import { env } from '@lib/env';
import { BB_UID_COOKIE, getAnalyticsCookieOptions } from '@lib/helpers';
import { logger } from '@lib/logger';
import {
    clearPostLoginRedirect,
    peekPostLoginRedirect,
    setPostLoginRedirect
} from '@lib/postLoginRedirect';
import { type LoginFormInputs, LoginFormValidateSchema } from '@lib/schemas/loginFormSchema';
import LoginView from './login.view';

/**
 * Turnstile runs invisibly. `pending` until it hands us a token, `ready` once it has (or when
 * captcha is disabled), `error` when it can't load (ad blockers, network). The form always
 * renders, and a submit made before `ready` waits for the token.
 */
export type CaptchaStatus = 'pending' | 'ready' | 'error';

export type LoginMethod = 'github' | 'google' | 'sso' | 'email';

/** Seconds before "Resend" unlocks after a code is sent. */
const OTP_RESEND_COOLDOWN = 45;

type AppDispatch = ThunkDispatch<RootState, unknown, UnknownAction>;

/** The fields of a login / OTP / OAuth response this page acts on. */
interface AuthResponse {
    user?: {
        id?: string;
        email?: string;
        name?: string;
        isOnboarded?: boolean;
        isWorkspaceOnboarded?: boolean;
        isSSOOnboarded?: boolean;
        samlFlowId?: string | null;
    };
    session?: { id?: string; accessToken?: string };
    expiresIn?: number;
    workspaceId?: string;
    projectId?: string;
    baseUrl?: string;
    onboarded?: boolean;
    isWorkspaceOnboarded?: boolean;
    invitationToken?: string | null;
    requestToken?: string | null;
    inviteLinkToken?: string | null;
    projectInviteLinkToken?: string | null;
    otpRef?: string;
    doOnboarding?: boolean;
    loginMethod?: LoginMethod;
}

type DisplayNotice = { reason: AuthNotice['reason']; message: string };

/**
 * The one-shot "why you were signed out" notice, left in sessionStorage by the auth interceptor's
 * hard sign-out. Read when the page subscribes (after mount, never during render) and kept until
 * dismissed, so a remount (Strict Mode) can't lose it.
 */
const signOutNoticeStore = (() => {
    let notice: DisplayNotice | null = null;
    const listeners = new Set<() => void>();
    const emit = () => listeners.forEach((listener) => listener());
    return {
        subscribe(listener: () => void) {
            listeners.add(listener);
            const pending = consumeAuthNotice();
            // INVALID_TOKEN: no message and no modal, per spec.
            if (pending?.reason === 'SESSION_REVOKED') {
                notice = {
                    reason: 'SESSION_REVOKED',
                    message: pending.message || ERROR_MESSAGES.auth.sessionRevoked
                };
                queueMicrotask(emit);
            } else if (pending?.reason === 'REFRESH_FAILED') {
                notice = { reason: 'REFRESH_FAILED', message: ERROR_MESSAGES.auth.sessionExpired };
                queueMicrotask(emit);
            }
            return () => listeners.delete(listener);
        },
        getSnapshot: () => notice,
        getServerSnapshot: () => null,
        dismiss() {
            notice = null;
            emit();
        }
    };
})();

/**
 * Resend countdown that restarts whenever a new code is sent (`codeRef` changes). Restarting is
 * done while rendering (React's "adjust state on prop change" pattern), ticking in a timeout.
 */
function useResendCountdown(codeRef: string | null) {
    const [state, setState] = React.useState({ codeRef, seconds: OTP_RESEND_COOLDOWN });
    if (state.codeRef !== codeRef) {
        setState({ codeRef, seconds: OTP_RESEND_COOLDOWN });
    }
    const { seconds } = state;
    React.useEffect(() => {
        if (!codeRef || seconds <= 0) return;
        const timer = setTimeout(
            () => setState((current) => ({ ...current, seconds: current.seconds - 1 })),
            1000
        );
        return () => clearTimeout(timer);
    }, [codeRef, seconds]);
    return state.codeRef === codeRef ? seconds : OTP_RESEND_COOLDOWN;
}

const isTrialSource = (source: string | null | undefined): source is string =>
    Boolean(source && UTM_SOURCES_FOR_FREE_TRIAL_90_DAYS.includes(source.trim()));

const LoginController = () => {
    const searchParams = useSearchParams();
    const emailParam = searchParams?.get('email');
    // Sign-in from the website (/login?email=…): the email is simply the form's starting value.
    const { register, formState, setValue, handleSubmit, reset, watch } = useForm<LoginFormInputs>({
        resolver: yupResolver(LoginFormValidateSchema),
        defaultValues: { email: emailParam ? decodeURIComponent(emailParam) : '' }
    });
    const [cookies, setCookie, removeCookie] = useCookies([
        'auth',
        'utm_source',
        'redirectUrl',
        BB_UID_COOKIE
    ]);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const store = useStore<RootState>();

    const codeParam = searchParams?.get('code');
    const appParam = searchParams?.get('app');
    const submitParam = searchParams?.get('submit');
    const stateParam = searchParams?.get('state');
    const sessionId = searchParams?.get('sessionId');
    const isSocialCallback = Boolean(codeParam && appParam);
    const isAutoSubmit = Boolean(emailParam) && submitParam === 'true';

    // `state` is the OAuth round-trip parameter: on a Google/GitHub callback the URL is
    // `/login?code=…&app=…&state=…` and the original query string is gone, so invite tokens only
    // survive inside it (put there by login.view). Parsed tolerantly — a provider echoing
    // something we didn't send must not throw.
    const oauthState = React.useMemo(() => parseOAuthState(stateParam), [stateParam]);

    // Held in state, not read off the URL, because the OAuth and session-conflict paths learn
    // them after the first render (from `state`, or bb-api echoing them back on the response).
    const [inviteUserToken, setInviteUserToken] = React.useState(
        searchParams?.get('inviteUserToken') ?? oauthState.inviteUserToken ?? null
    );
    const [requestToken, setRequestToken] = React.useState(
        searchParams?.get('requestToken') ?? oauthState.requestToken ?? null
    );
    const [joinToken, setJoinToken] = React.useState(
        searchParams?.get('joinToken') ?? oauthState.joinToken ?? null
    );
    const [joinProjectToken, setJoinProjectToken] = React.useState(
        searchParams?.get('joinProjectToken') ?? oauthState.joinProjectToken ?? null
    );

    const {
        utmSourceToken: contextUtmToken,
        setUTMSourceToken,
        onboardingDomains,
        submittingForm
    } = useOnboardingContext();
    const urlUtmToken = searchParams?.get('utm_source') || cookies.utm_source || null;
    const utmSourceToken: string | null = urlUtmToken ?? contextUtmToken;

    const loginState: LoginState = useSelector((state: RootState) => state.login);
    const loginUserState: LoginUserState = useSelector((state: RootState) => state.loginUser);
    const isLogin = useLoginStatus(loginState);

    const [isOnboarding, setIsOnboarding] = React.useState(false);
    const [isWorkspaceOnboarding, setIsWorkspaceOnboarding] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [otpError, setOtpError] = React.useState<string | null>(null);
    // A resend issues a new code reference; until then it's the one from the login response.
    const [resentOtpRef, setResentOtpRef] = React.useState<string | null>(null);
    const otpRef: string | null = resentOtpRef ?? loginState?.data?.otpRef ?? null;
    const isVerificationPage = Boolean(loginState?.data?.otpRef);
    const counter = useResendCountdown(isVerificationPage ? otpRef : null);
    const [isVerificationLoading, setIsVerificationLoading] = React.useState(false);
    const [isResendOtpSet, setIsResendOtpSet] = React.useState(false);
    const [isResendLoading, setIsResendLoading] = React.useState(false);
    // Admin hand-off and social callbacks start working on arrival.
    const [isLoading, setIsLoading] = React.useState(Boolean(sessionId) || isSocialCallback);
    const [isVerificationSuccess, setIsVerificationSuccess] = React.useState(false);
    const [isFullyOnboardedUser, setIsFullyOnboardedUser] = React.useState(false);
    const [isConfirmingSessionConflict, setIsConfirmingSessionConflict] = React.useState(false);

    const signOutNotice = React.useSyncExternalStore(
        signOutNoticeStore.subscribe,
        signOutNoticeStore.getSnapshot,
        signOutNoticeStore.getServerSnapshot
    );

    // Latched once a remembered redirect has been followed, so the async loginUser fetch that
    // follows can't re-run the redirect effect and bounce the user to the default landing page.
    const postLoginRedirectDoneRef = React.useRef(false);

    // ---- Captcha -------------------------------------------------------------------------
    const captchaRef = React.useRef<TurnstileInstance>(null);
    const [captchaStatus, setCaptchaStatus] = React.useState<CaptchaStatus>(
        env.enableCaptcha ? 'pending' : 'ready'
    );
    // A submit made before Turnstile produced a token waits here and goes out in onSuccess.
    const pendingSubmitRef = React.useRef<LoginPayload | null>(null);
    const [isAwaitingCaptcha, setIsAwaitingCaptcha] = React.useState(
        isAutoSubmit && env.enableCaptcha
    );

    const getCaptchaToken = () => captchaRef.current?.getResponse() || '';

    // A token is single-use: after any attempt that consumed it, get a fresh one.
    const resetCaptcha = () => {
        if (!env.enableCaptcha) return;
        setCaptchaStatus('pending');
        captchaRef.current?.reset();
        captchaRef.current?.render();
    };

    // ---- After sign-in --------------------------------------------------------------------
    const buildAuthPayload = (res: AuthResponse) => ({
        user: { email: res.user?.email, name: res.user?.name || '' },
        session: res.session,
        workspace: res.workspaceId || '',
        project: res.projectId || '',
        baseUrl: res.baseUrl || ''
    });

    const loadLoginUser = (res: AuthResponse, method: LoginMethod) =>
        dispatch(fetchLoginUser({ authorization: `Bearer ${res.session?.accessToken}` }, method));

    const handleOnBoarding = (res: AuthResponse, method: LoginMethod = 'email') => {
        try {
            // A stale notice must never leak into a later successful login.
            consumeAuthNotice();
            if (res.user?.email && res.user?.id) {
                analytics.identify(res.user.email, { user_id: res.user.id, email: res.user.email });
            }
            analytics.capture('login_successfull', {
                user_email: res.user?.email,
                user_id: res.user?.id,
                method
            });
            // bb-api echoes back whichever invite-link token the login carried. Latching it here
            // lets the session-conflict confirm path (a second response) still land on the invite.
            if (res.inviteLinkToken) setJoinToken(res.inviteLinkToken);
            if (res.projectInviteLinkToken) setJoinProjectToken(res.projectInviteLinkToken);
            setIsOnboarding(res.user?.isOnboarded ?? res.onboarded ?? false);
            setIsWorkspaceOnboarding(
                res.user?.isWorkspaceOnboarded ?? res.isWorkspaceOnboarded ?? false
            );

            const persistSession = () => {
                persistLoginResponse(buildAuthPayload(res), res.expiresIn);
                if (res.user?.id)
                    setCookie(BB_UID_COOKIE, res.user.id, getAnalyticsCookieOptions());
            };

            if (res.invitationToken || res.requestToken) {
                setInviteUserToken(res.invitationToken ?? null);
                setRequestToken(res.requestToken ?? null);
                loadLoginUser(res, method);
            } else if (!res.user?.isOnboarded || !res.user?.isWorkspaceOnboarded) {
                // New user or workspace onboarding still to do: the redirect effect sends them on.
                persistSession();
                setIsLoading(false);
                setIsVerificationSuccess(true);
                setIsVerificationLoading(false);
                loadLoginUser(res, method);
            } else {
                persistSession();
                setIsVerificationSuccess(true);
                setIsFullyOnboardedUser(true);
                setIsVerificationLoading(false);
                // Let "Signing you in" show before the redirect.
                setTimeout(() => loadLoginUser(res, method), 2000);
            }
        } catch (error) {
            logger.error(error);
            setIsVerificationLoading(false);
        }
    };

    // ---- Email sign-in ----------------------------------------------------------------------
    const submitLogin = async (values: LoginPayload, captchaToken = getCaptchaToken()) => {
        const loginPayload: Record<string, unknown> = { email: values.email, captchaToken };
        if (inviteUserToken) loginPayload.invitationToken = inviteUserToken;
        if (isTrialSource(utmSourceToken)) loginPayload.utmSourceToken = utmSourceToken;
        if (requestToken) loginPayload.requestToken = requestToken;
        // Handed to bb-api so it echoes them back on the login response — that's what keeps the
        // join alive through a SESSION_CONFLICT confirm round-trip.
        if (joinToken) loginPayload.inviteLinkToken = joinToken;
        if (joinProjectToken) loginPayload.projectInviteLinkToken = joinProjectToken;

        await dispatch(doLogin(loginPayload as unknown as LoginPayload));

        const { data, error } = store.getState().login;
        if (data?.doOnboarding) {
            handleOnBoarding(data as AuthResponse, (data as AuthResponse).loginMethod || 'email');
        } else if (error) {
            resetCaptcha();
        }
    };

    const onSubmit = (values: LoginPayload) => {
        if (captchaStatus !== 'ready') {
            // Queue it; Turnstile's onSuccess sends it. After a failure this doubles as "try again".
            pendingSubmitRef.current = values;
            setIsAwaitingCaptcha(true);
            if (captchaStatus === 'error') resetCaptcha();
            return;
        }
        void submitLogin(values);
    };

    const captchaHandlers = {
        onSuccess: (token: string) => {
            setCaptchaStatus('ready');
            const pending = pendingSubmitRef.current;
            if (pending) {
                pendingSubmitRef.current = null;
                setIsAwaitingCaptcha(false);
                void submitLogin(pending, token);
            }
        },
        onError: () => {
            setCaptchaStatus('error');
            pendingSubmitRef.current = null;
            setIsAwaitingCaptcha(false);
        },
        onExpire: () => setCaptchaStatus('pending')
    };

    // ---- One-time code -------------------------------------------------------------------
    const handleVerificationSubmit = async (userOtp?: string) => {
        const code = userOtp ?? otp;
        setOtpError(null);
        if (isVerificationLoading || code.length !== 6 || !otpRef) return;
        setIsVerificationLoading(true);
        try {
            const payload: Record<string, unknown> = { otp: Number(code), otpRef };
            if (inviteUserToken) payload.invitationToken = inviteUserToken;
            if (isTrialSource(utmSourceToken)) payload.utmSourceToken = utmSourceToken;
            if (requestToken) payload.requestToken = requestToken;
            if (joinToken) payload.inviteLinkToken = joinToken;
            if (joinProjectToken) payload.projectInviteLinkToken = joinProjectToken;
            const res = (await otpVerificationAPI(payload as never)) as AuthResponse | undefined;
            if (res?.user && res.session?.accessToken) {
                handleOnBoarding(res, 'email');
            } else {
                setIsVerificationLoading(false);
                setIsVerificationSuccess(false);
                setIsFullyOnboardedUser(false);
            }
        } catch (error) {
            const conflict = asSessionConflict(error);
            setIsVerificationLoading(false);
            if (conflict) {
                // The code was consumed correctly server-side: leave the code step alone and
                // just surface the dialog.
                dispatch(loginSessionConflict({ ...conflict, method: 'email' }));
                return;
            }
            logger.error(error);
            // Keep the digits so one typo can be fixed in place; select them so typing replaces
            // the whole code.
            setOtpError(ERROR_MESSAGES.auth.verificationCode);
            const otpInput = document.querySelector<HTMLInputElement>('#otpInputContainer input');
            otpInput?.focus();
            otpInput?.select();
        }
    };

    const handleResendCode = async () => {
        if (counter !== 0 || isResendOtpSet || isResendLoading) return;
        setIsResendLoading(true);
        setIsResendOtpSet(true);
        try {
            const res = (await resendOtpAPI({
                userId: loginState?.data?.user?.id,
                otpRef
            } as never)) as { otpRef?: string } | undefined;
            if (res?.otpRef) {
                toast.success(SUCCESS_MESSAGES.auth.sentOTP);
                // A new reference restarts the countdown.
                setResentOtpRef(res.otpRef);
                setOtp('');
                setOtpError(null);
                setIsResendOtpSet(false);
            }
        } catch {
            toast.error(ERROR_MESSAGES.catchCommonError);
            setIsResendOtpSet(false);
        } finally {
            setIsResendLoading(false);
        }
    };

    // ---- Back to the email step / dialogs ---------------------------------------------------
    const resetLoginFlow = () => {
        dispatch(loginReset());
        dispatch(loginUserReset());
        setOtp('');
        setOtpError(null);
        setResentOtpRef(null);
        setIsVerificationLoading(false);
        setIsResendOtpSet(false);
        setIsResendLoading(false);
        setIsLoading(false);
        setIsVerificationSuccess(false);
        setIsFullyOnboardedUser(false);
        resetCaptcha();
    };

    const backToLoginClick = () => {
        resetLoginFlow();
        setValue('email', '');
        reset();
    };

    const handleSessionConflictConfirm = async () => {
        // Explicit re-entrancy guard, not just the button's `disabled`: bb-api treats the
        // confirmationToken as single-use, so a fast double-click would 401 the second send.
        if (isConfirmingSessionConflict || !loginState?.sessionConflict) return;
        setIsConfirmingSessionConflict(true);
        try {
            await dispatch(
                doLoginConfirm({
                    confirmationToken: loginState.sessionConflict.confirmationToken,
                    method: loginState.sessionConflict.method
                })
            );
            const { data } = store.getState().login;
            if (data?.doOnboarding) {
                handleOnBoarding(
                    data as AuthResponse,
                    (data as AuthResponse).loginMethod || 'email'
                );
            }
        } finally {
            setIsConfirmingSessionConflict(false);
        }
    };

    const handleSessionConflictCancel = () => {
        // Closing backs all the way out to the email step: the code was already consumed by the
        // attempt that hit the conflict, so there's nothing left to verify.
        dispatch(loginConflictReset());
        resetLoginFlow();
    };

    // ---- Arrival effects (external systems only: no state set synchronously) --------------

    // `?next=` is set by the proxy when a signed-out visitor opens a deep link. Every sign-in
    // path (email, Google/GitHub, SSO, onboarding) lands back there.
    React.useEffect(() => {
        const next = searchParams?.get('next');
        if (next) setPostLoginRedirect(next);
    }, [searchParams]);

    // Share the campaign token with the onboarding pages.
    React.useEffect(() => {
        if (urlUtmToken) setUTMSourceToken(urlUtmToken);
    }, [urlUtmToken, setUTMSourceToken]);

    // Support/admin "sign in as" hand-off: /login?sessionId=…
    const signInFromAdmin = React.useEffectEvent(async (id: string, isCancelled: () => boolean) => {
        try {
            const res = (await loginFromAdminAPI({ sessionId: id } as never)) as
                | AuthResponse
                | undefined;
            if (isCancelled()) return;
            if (res?.user && res.session?.accessToken) {
                handleOnBoarding(res, 'email');
            } else {
                setIsLoading(false);
                toast.error(ERROR_MESSAGES.auth.verificationCode);
            }
        } catch {
            if (isCancelled()) return;
            setIsLoading(false);
            toast.error(ERROR_MESSAGES.catchCommonError);
        }
    });
    React.useEffect(() => {
        if (!sessionId) return;
        let cancelled = false;
        // Started from a promise callback: the hand-off updates state once the API answers.
        void Promise.resolve().then(() => signInFromAdmin(sessionId, () => cancelled));
        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    // Google / GitHub callback: /login?code=…&app=google|github&state=…
    const signInWithProvider = React.useEffectEvent(
        async (code: string, method: 'github' | 'google', isCancelled: () => boolean) => {
            // Every token the login carries comes back inside `state`; bb-api echoes them back so
            // a conflict confirm still finishes on the invite.
            const payload: Record<string, unknown> = {
                code: method === 'google' ? encodeURIComponent(code) : code,
                captchaToken: getCaptchaToken()
            };
            if (method === 'google') payload.utmSourceToken = utmSourceToken;
            if (oauthState.inviteUserToken) payload.invitationToken = oauthState.inviteUserToken;
            if (oauthState.utmSourceToken) payload.utmSourceToken = oauthState.utmSourceToken;
            if (oauthState.requestToken) payload.requestToken = oauthState.requestToken;
            if (oauthState.joinToken) payload.inviteLinkToken = oauthState.joinToken;
            if (oauthState.joinProjectToken) {
                payload.projectInviteLinkToken = oauthState.joinProjectToken;
            }
            const providerName = method === 'github' ? 'GitHub' : 'Google';
            try {
                const call = method === 'github' ? githubLoginAPI : googleLoginAPI;
                const res = (await call(payload as never)) as AuthResponse | undefined;
                if (isCancelled()) return;
                if (res?.user && res.session?.accessToken) {
                    handleOnBoarding(res, method);
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                if (isCancelled()) return;
                const conflict = asSessionConflict(error);
                setIsLoading(false);
                if (conflict) {
                    dispatch(loginSessionConflict({ ...conflict, method }));
                    return;
                }
                logger.error(error);
                toast.error(
                    `Couldn’t sign in with ${providerName}. Try again, or continue with email.`
                );
                // Back to the sign-in form (the overlay keys off ?code&app).
                router.replace('/login');
            }
        }
    );
    React.useEffect(() => {
        if (!codeParam || (appParam !== 'github' && appParam !== 'google')) return;
        let cancelled = false;
        // Started from a promise callback: the exchange updates state once the API answers.
        void Promise.resolve().then(() => signInWithProvider(codeParam, appParam, () => cancelled));
        return () => {
            cancelled = true;
        };
    }, [codeParam, appParam]);

    // Sign-in from the website (/login?email=…&submit=true): the email is prefilled through the
    // form's defaultValues; submit it straight away without captcha, or once Turnstile has a
    // token (queued for onSuccess).
    const autoSubmitFromWebsite = React.useEffectEvent((userEmail: string) => {
        if (env.enableCaptcha) {
            pendingSubmitRef.current = { email: userEmail };
        } else {
            void submitLogin({ email: userEmail }, '');
        }
    });
    React.useEffect(() => {
        if (!emailParam || !isAutoSubmit) return;
        // Started from a promise callback: the submit updates state, and must not run
        // synchronously inside the effect.
        void Promise.resolve().then(() => autoSubmitFromWebsite(decodeURIComponent(emailParam)));
    }, [emailParam, isAutoSubmit]);

    // After sign-in: go to the right place.
    const followPostLoginRedirect = React.useEffectEvent(() => {
        if (!(cookies?.auth?.session?.id && isLogin)) return;
        if (postLoginRedirectDoneRef.current) {
            return () => {
                dispatch(loginReset());
            };
        }
        if (inviteUserToken) {
            router.push(`/invite-user?token=${inviteUserToken}`);
            return;
        }
        // An invite link is its own onboarding: the user may have no workspace yet and joining
        // gives them one, so it jumps the onboarding gate below like an emailed invite does.
        const joinPath = joinRedirectPath({ joinToken, joinProjectToken });
        if (joinPath) {
            router.push(joinPath);
            return;
        }

        const timers: ReturnType<typeof setTimeout>[] = [];
        if (isOnboarding && isWorkspaceOnboarding) {
            const sessionRedirectUrl = peekPostLoginRedirect();
            const redirectUrl: string | undefined = cookies?.redirectUrl;
            const user = loginUserState?.data?.user;
            if (requestToken) {
                router.push(`/approve-request?token=${requestToken}`);
            } else if (redirectUrl) {
                removeCookie('redirectUrl');
                router.push(redirectUrl);
            } else if (sessionRedirectUrl) {
                clearPostLoginRedirect();
                postLoginRedirectDoneRef.current = true;
                router.push(sessionRedirectUrl);
            } else if (!user?.isOnboarded) {
                router.push('/user/onboarding');
            } else if (!user?.isWorkspaceOnboarded) {
                router.push('/workspace/onboarding');
            } else {
                // `/` works out where to land server-side (Get Started for new users, else their
                // baseUrl). An SSO user still mid-onboarding goes straight to their baseUrl.
                const isSSOOnboardingPending = !user?.isSSOOnboarded && !!user?.samlFlowId;
                const baseUrl: string | undefined = loginUserState?.data?.baseUrl?.trim();
                router.push(baseUrl && isSSOOnboardingPending ? baseUrl : '/');
            }
        } else if (!isOnboarding) {
            timers.push(setTimeout(() => router.push('/user/onboarding'), 2000));
        } else if (!isWorkspaceOnboarding) {
            timers.push(setTimeout(() => router.push('/workspace/onboarding'), 2000));
        }
        return () => {
            timers.forEach(clearTimeout);
            dispatch(loginReset());
        };
    });
    // Re-evaluate (as bb-app does) when the session, onboarding flags or join tokens change.
    const sessionCookieId: string | undefined = cookies?.auth?.session?.id;
    const userIsOnboarded: boolean | undefined = loginUserState?.data?.user?.isOnboarded;
    const userIsWorkspaceOnboarded: boolean | undefined =
        loginUserState?.data?.user?.isWorkspaceOnboarded;
    React.useEffect(
        () => followPostLoginRedirect(),
        [
            isOnboarding,
            isWorkspaceOnboarding,
            sessionCookieId,
            isLogin,
            userIsOnboarded,
            userIsWorkspaceOnboarded,
            joinToken,
            joinProjectToken
        ]
    );

    return (
        <>
            <LoginView
                register={register}
                formState={formState}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                watch={watch}
                setEmail={(value) => setValue('email', value, { shouldValidate: true })}
                loginState={loginState}
                loginUserState={loginUserState}
                isVerificationPage={isVerificationPage}
                otpRef={otpRef}
                counter={counter}
                otp={otp}
                setOtp={setOtp}
                otpError={otpError}
                setOtpError={setOtpError}
                handleResendCode={handleResendCode}
                handleVerificationSubmit={handleVerificationSubmit}
                isVerificationLoading={isVerificationLoading}
                isResendOtpSet={isResendOtpSet}
                isResendLoading={isResendLoading}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                isVerificationSuccess={isVerificationSuccess}
                isFullyOnboardedUser={isFullyOnboardedUser}
                captchaRef={captchaRef}
                captchaStatus={captchaStatus}
                captchaHandlers={captchaHandlers}
                isAwaitingCaptcha={isAwaitingCaptcha}
                resetCaptcha={resetCaptcha}
                backToLoginClick={backToLoginClick}
                onboardingDomains={onboardingDomains}
                submittingForm={submittingForm}
            />
            <SessionConflictModal
                conflict={loginState?.sessionConflict || null}
                isConfirming={isConfirmingSessionConflict}
                onConfirm={handleSessionConflictConfirm}
                onCancel={handleSessionConflictCancel}
            />
            <SignedOutNoticeModal notice={signOutNotice} onDismiss={signOutNoticeStore.dismiss} />
        </>
    );
};

export default LoginController;
