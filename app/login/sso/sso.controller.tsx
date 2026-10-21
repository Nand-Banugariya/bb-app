'use client';

import * as React from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import type { TurnstileInstance } from '@marsidev/react-turnstile';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { verifySSOEmailAPI } from '@redux/services/auth.api';
import { readJoinTokens, stashSSOJoinTokens } from '@lib/auth/joinTokens';
import { env } from '@lib/env';
import { logger } from '@lib/logger';
import { type LoginFormInputs, LoginFormValidateSchema } from '@lib/schemas/loginFormSchema';
import type { CaptchaStatus } from '../login.controller';
import SSOView from './sso.view';

const SSOController = () => {
    const { register, formState, handleSubmit, watch } = useForm<LoginFormInputs>({
        resolver: yupResolver(LoginFormValidateSchema)
    });

    const searchParams = useSearchParams();
    const inviteUserToken = searchParams?.get('inviteUserToken');
    const requestToken = searchParams?.get('requestToken');
    // Invite links reach /login/sso via "Continue with SSO", which forwards whatever /login was
    // carrying (see login.view).
    const { joinToken, joinProjectToken } = readJoinTokens(searchParams);
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const captchaRef = React.useRef<TurnstileInstance>(null);
    const [captchaStatus, setCaptchaStatus] = React.useState<CaptchaStatus>(
        env.enableCaptcha ? 'pending' : 'ready'
    );
    // A submit made before Turnstile had a token waits here and goes out in onSuccess.
    const pendingSubmitRef = React.useRef<LoginFormInputs | null>(null);
    const [isAwaitingCaptcha, setIsAwaitingCaptcha] = React.useState(false);

    const resetCaptcha = () => {
        if (!env.enableCaptcha) return;
        setCaptchaStatus('pending');
        captchaRef.current?.reset();
    };

    const verifyEmail = async (values: LoginFormInputs) => {
        const payload: Record<string, unknown> = { email: values.email };
        // bb-api puts these in the SAML RelayState, the only thing that survives the trip out to
        // the customer's IdP and back — the callback lands on
        // `/login/sso/callback?saml_access_code=…` with nothing else left of where the user started.
        if (joinToken) payload.inviteLinkToken = joinToken;
        if (joinProjectToken) payload.projectInviteLinkToken = joinProjectToken;
        setIsLoading(true);
        setErrorMessage('');
        try {
            const resp = (await verifySSOEmailAPI(payload as never)) as
                | { redirectUrl?: string }
                | undefined;
            if (resp?.redirectUrl) {
                window.sessionStorage.setItem('ssoEmail', values.email);
                if (inviteUserToken)
                    window.sessionStorage.setItem('inviteUserToken', inviteUserToken);
                if (requestToken) window.sessionStorage.setItem('requestToken', requestToken);
                // Same-tab fallback for an API without the RelayState change; the RelayState copy
                // is what makes cross-tab and IdP-initiated flows work.
                stashSSOJoinTokens({ joinToken, joinProjectToken });
                // Stay in the loading state: the page is navigating away.
                window.location.href = resp.redirectUrl;
                return;
            }
            setIsLoading(false);
            setErrorMessage('SSO isn’t set up for this email’s domain.');
        } catch (err) {
            logger.error(err);
            setIsLoading(false);
            setErrorMessage(
                'We couldn’t find SSO for this email. Check the address, or sign in with email instead.'
            );
            resetCaptcha();
        }
    };

    const onSubmit = (values: LoginFormInputs) => {
        if (captchaStatus !== 'ready') {
            pendingSubmitRef.current = values;
            setIsAwaitingCaptcha(true);
            if (captchaStatus === 'error') resetCaptcha();
            return;
        }
        void verifyEmail(values);
    };

    const captchaHandlers = {
        onSuccess: () => {
            setCaptchaStatus('ready');
            const pending = pendingSubmitRef.current;
            if (pending) {
                pendingSubmitRef.current = null;
                setIsAwaitingCaptcha(false);
                void verifyEmail(pending);
            }
        },
        onError: () => {
            setCaptchaStatus('error');
            pendingSubmitRef.current = null;
            setIsAwaitingCaptcha(false);
        },
        onExpire: () => setCaptchaStatus('pending')
    };

    return (
        <SSOView
            register={register}
            formState={formState}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            watch={watch}
            isLoading={isLoading}
            captchaRef={captchaRef}
            captchaStatus={captchaStatus}
            captchaHandlers={captchaHandlers}
            isAwaitingCaptcha={isAwaitingCaptcha}
            resetCaptcha={resetCaptcha}
            errorMessage={errorMessage}
            // A changed address clears the "no SSO for this domain" message.
            onEmailChange={() => setErrorMessage('')}
        />
    );
};

export default SSOController;
