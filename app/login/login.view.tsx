'use client';

import * as React from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useSearchParams } from 'next/navigation';
import type {
    FormState,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormWatch
} from 'react-hook-form';
import type { LoginPayload, LoginState, LoginUserState } from '@redux/slices/auth';
import { buildOAuthState, withLoginTokens } from '@lib/auth/joinTokens';
import { UTM_SOURCES_FOR_FREE_TRIAL_90_DAYS, githubAuthUrl, googleAuthUrl } from '@lib/constants';
import { env } from '@lib/env';
import type { LoginFormInputs } from '@lib/schemas/loginFormSchema';
import type { OnboardingDomain } from '@components/contexts/onboardingContext';
import type { CaptchaStatus } from './login.controller';
import { CodeStep, EmailStep, SigningInStep, SuccessStep } from './loginSteps';

interface LoginViewProps {
    register: UseFormRegister<LoginFormInputs>;
    formState: FormState<LoginFormInputs>;
    handleSubmit: UseFormHandleSubmit<LoginFormInputs>;
    onSubmit: (data: LoginPayload) => void;
    watch: UseFormWatch<LoginFormInputs>;
    /** Replace the email (the "Did you mean …?" fix). */
    setEmail: (email: string) => void;
    loginState: LoginState;
    loginUserState: LoginUserState;
    isVerificationPage: boolean;
    /** Current code reference; a new one (resend) restarts the code step's expiry. */
    otpRef: string | null;
    counter: number;
    otp: string;
    setOtp: React.Dispatch<React.SetStateAction<string>>;
    otpError: string | null;
    setOtpError: React.Dispatch<React.SetStateAction<string | null>>;
    handleResendCode: () => void;
    handleVerificationSubmit: (userOtp?: string) => Promise<void>;
    isVerificationLoading: boolean;
    isResendOtpSet: boolean;
    isResendLoading: boolean;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isVerificationSuccess: boolean;
    isFullyOnboardedUser: boolean;
    captchaRef: React.Ref<TurnstileInstance>;
    captchaStatus: CaptchaStatus;
    captchaHandlers: {
        onSuccess: (token: string) => void;
        onError: () => void;
        onExpire: () => void;
    };
    isAwaitingCaptcha: boolean;
    resetCaptcha: () => void;
    backToLoginClick: () => void;
    onboardingDomains: OnboardingDomain[];
    submittingForm: string | null;
}

type SocialProvider = 'google' | 'github' | 'sso';

const DOMAIN_PATTERN =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,6}$/;

const hasValidEmailDomain = (email: string | undefined) => {
    const domain = email?.split('@')[1];
    return Boolean(domain && DOMAIN_PATTERN.test(domain));
};

/** Login v2 (BetterBugs Login.html): email → 6-digit code → done, in the capture-frame card. */
const LoginView = ({
    register,
    formState,
    handleSubmit,
    onSubmit,
    watch,
    setEmail,
    loginState,
    loginUserState,
    isVerificationPage,
    otpRef,
    counter,
    otp,
    setOtp,
    otpError,
    setOtpError,
    handleResendCode,
    handleVerificationSubmit,
    isVerificationLoading,
    isResendOtpSet,
    isResendLoading,
    isLoading,
    setIsLoading,
    isVerificationSuccess,
    captchaRef,
    captchaStatus,
    captchaHandlers,
    isAwaitingCaptcha,
    resetCaptcha,
    backToLoginClick
}: LoginViewProps) => {
    const searchParams = useSearchParams();
    const inviteUserToken = searchParams?.get('inviteUserToken');
    const requestToken = searchParams?.get('requestToken');
    const utmSourceToken = searchParams?.get('utm_source');
    // Invite links (`/join/<token>`, `/join-project/<token>`) arrive here as query params via
    // the proxy when the visitor isn't signed in yet.
    const joinToken = searchParams?.get('joinToken');
    const joinProjectToken = searchParams?.get('joinProjectToken');
    const socialApp = searchParams?.get('app');
    const isSocialCallback = Boolean(searchParams?.get('code') && socialApp);

    // The provider button the user clicked, while the browser leaves for it.
    const [pendingProvider, setPendingProvider] = React.useState<SocialProvider | null>(null);
    // Replays the form shake on every rejected submit.
    const [shakeKey, setShakeKey] = React.useState(0);
    // The email step slides in from the left when coming back from the code step.
    const [cameBack, setCameBack] = React.useState(false);

    // Coming back from a provider with the browser's Back button restores this page from the
    // bfcache with the clicked button still spinning.
    React.useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setPendingProvider(null);
                setIsLoading(false);
            }
        };
        window.addEventListener('pageshow', onPageShow);
        return () => window.removeEventListener('pageshow', onPageShow);
    }, [setIsLoading]);

    const email = watch('email') ?? '';
    const emailIsValid = Boolean(email) && !formState.errors.email && hasValidEmailDomain(email);
    const isSubmitInFlight =
        formState.isSubmitting ||
        Boolean(loginState?.isLoading) ||
        Boolean(loginUserState?.isLoading) ||
        isAwaitingCaptcha;
    const isVerifying = isVerificationLoading || Boolean(loginUserState?.isLoading);

    const submit = handleSubmit(onSubmit, () => setShakeKey((n) => n + 1));

    // Enter in the email field submits, same as Continue — explicitly, with preventDefault, so
    // it's a single submit either way.
    const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        if (!isSubmitInFlight) void submit();
    };

    // Everything this login carries, round-tripped through the provider's `state` parameter:
    // Google and GitHub come back to `/login?code=…&app=…` with the original query string gone.
    const goToSocialLogin = (provider: 'google' | 'github', authUrl: string) => {
        setPendingProvider(provider);
        setIsLoading(true);
        const state = buildOAuthState({
            inviteUserToken,
            requestToken,
            joinToken,
            joinProjectToken,
            // Only the sources that grant the 90-day trial are worth carrying through.
            utmSourceToken:
                utmSourceToken && UTM_SOURCES_FOR_FREE_TRIAL_90_DAYS.includes(utmSourceToken.trim())
                    ? utmSourceToken
                    : null
        });
        if (!state) {
            window.location.href = authUrl;
            return;
        }
        const url = new URL(authUrl);
        url.searchParams.set('state', state);
        window.location.href = url.toString();
    };

    const goToSSO = () => {
        setPendingProvider('sso');
        // /login/sso reads these off its own query string, so they come along.
        window.location.href = withLoginTokens('/login/sso', {
            inviteUserToken,
            requestToken,
            joinToken,
            joinProjectToken
        });
    };

    // `captcha` is always rendered first so the widget (and its token) survives step changes.
    const captcha = env.enableCaptcha ? (
        <div className="hidden">
            <Turnstile
                ref={captchaRef}
                siteKey={env.captchaSiteKey}
                onSuccess={captchaHandlers.onSuccess}
                onError={captchaHandlers.onError}
                onExpire={captchaHandlers.onExpire}
            />
        </div>
    ) : null;

    let step: React.ReactNode;
    if (isVerificationSuccess) {
        const via = isSocialCallback
            ? `with ${socialApp === 'github' ? 'GitHub' : 'Google'}`
            : email
              ? `as ${email}`
              : '';
        step = <SuccessStep via={via} />;
    } else if (isSocialCallback && isLoading) {
        step = <SigningInStep />;
    } else if (isVerificationPage) {
        step = (
            <CodeStep
                email={email}
                codeRef={otpRef}
                otp={otp}
                setOtp={setOtp}
                otpError={otpError}
                onOtpChange={() => setOtpError(null)}
                onComplete={(code) => void handleVerificationSubmit(code)}
                isVerifying={isVerifying}
                resendIn={counter}
                isResending={isResendLoading}
                canResend={(isResendOtpSet || counter <= 0) && !isResendLoading}
                onResend={handleResendCode}
                onBack={() => {
                    setCameBack(true);
                    backToLoginClick();
                }}
            />
        );
    } else {
        step = (
            <EmailStep
                enterFrom={cameBack ? 'back' : 'fwd'}
                field={register('email')}
                email={email}
                emailValid={emailIsValid}
                error={formState.errors.email?.message?.toString()}
                shakeKey={shakeKey}
                onSubmit={(event) => void submit(event)}
                onEmailKeyDown={handleEmailKeyDown}
                applyEmail={setEmail}
                isSubmitting={isSubmitInFlight}
                loadingText={isAwaitingCaptcha ? 'Verifying…' : 'Checking…'}
                pendingProvider={pendingProvider}
                onGoogle={() => goToSocialLogin('google', googleAuthUrl)}
                onGithub={() => goToSocialLogin('github', githubAuthUrl)}
                onSso={goToSSO}
                captchaError={captchaStatus === 'error' ? { onRetry: resetCaptcha } : null}
            />
        );
    }

    return (
        <>
            {captcha}
            {step}
        </>
    );
};

export default LoginView;
