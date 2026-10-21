'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import type {
    FormState,
    UseFormHandleSubmit,
    UseFormRegister,
    UseFormWatch
} from 'react-hook-form';
import { Button } from '@components/base_shadcn/button';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { Input } from '@components/base_shadcn/input';
import { Label } from '@components/base_shadcn/label';
import { AuthCard, WordReveal } from '@components/common/authCard';
import { motion, shake } from '@components/common/authCard/authMotion';
import {
    ArrowBackIcon,
    CheckCircleIcon,
    DomainIcon,
    ErrorIcon,
    RefreshIcon
} from '@components/icons/material';
import { withLoginTokens } from '@lib/auth/joinTokens';
import { env } from '@lib/env';
import type { LoginFormInputs } from '@lib/schemas/loginFormSchema';
import { cn } from '@lib/utils';
import type { CaptchaStatus } from '../login.controller';
import { BUTTON, FieldMessage } from '../loginSteps';

interface SSOViewProps {
    register: UseFormRegister<LoginFormInputs>;
    formState: FormState<LoginFormInputs>;
    handleSubmit: UseFormHandleSubmit<LoginFormInputs>;
    onSubmit: (values: LoginFormInputs) => void;
    watch: UseFormWatch<LoginFormInputs>;
    isLoading: boolean;
    captchaRef: React.Ref<TurnstileInstance>;
    captchaStatus: CaptchaStatus;
    captchaHandlers: { onSuccess: () => void; onError: () => void; onExpire: () => void };
    isAwaitingCaptcha: boolean;
    resetCaptcha: () => void;
    errorMessage: string;
    onEmailChange: () => void;
}

const DOMAIN_PATTERN =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,6}$/;

const SSOView = ({
    register,
    formState,
    handleSubmit,
    onSubmit,
    watch,
    isLoading,
    captchaRef,
    captchaStatus,
    captchaHandlers,
    isAwaitingCaptcha,
    resetCaptcha,
    errorMessage,
    onEmailChange
}: SSOViewProps) => {
    const searchParams = useSearchParams();

    // Going back must not drop what brought the user here: /login reads these off its own query
    // string, and an invite link silently lost here would sign them in to the wrong place.
    const loginHref = withLoginTokens('/login', {
        inviteUserToken: searchParams?.get('inviteUserToken'),
        requestToken: searchParams?.get('requestToken'),
        joinToken: searchParams?.get('joinToken'),
        joinProjectToken: searchParams?.get('joinProjectToken')
    });

    const email = watch('email') ?? '';
    const domain = email.split('@')[1];
    const emailIsValid =
        Boolean(email) && !formState.errors.email && Boolean(domain && DOMAIN_PATTERN.test(domain));
    const isBusy = formState.isSubmitting || isLoading || isAwaitingCaptcha;
    const emailField = register('email', { onChange: onEmailChange });
    const fieldError = formState.errors.email?.message?.toString();

    const formRef = React.useRef<HTMLFormElement>(null);
    const [focused, setFocused] = React.useState(false);
    // Shake on a rejected submit: invalid email (counter) or no SSO for the domain (message).
    const [invalidCount, setInvalidCount] = React.useState(0);
    React.useEffect(() => {
        if (errorMessage || invalidCount > 0) shake(formRef.current);
    }, [errorMessage, invalidCount]);
    const submit = handleSubmit(onSubmit, () => setInvalidCount((n) => n + 1));

    return (
        <>
            {env.enableCaptcha && (
                <div className="hidden">
                    <Turnstile
                        ref={captchaRef}
                        siteKey={env.captchaSiteKey}
                        onSuccess={captchaHandlers.onSuccess}
                        onError={captchaHandlers.onError}
                        onExpire={captchaHandlers.onExpire}
                    />
                </div>
            )}
            <AuthCard>
                <div className="flex flex-col gap-6" style={{ animation: motion.step('fwd') }}>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="-ml-1.5 h-[1.875rem] self-start rounded-lg pr-2.5 pl-1.5 text-sm font-normal">
                        <Link href={loginHref}>
                            <ArrowBackIcon className="size-4" />
                            Back
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-2">
                        <WordReveal text="Sign in with SSO" />
                        <p className="text-md text-muted-foreground">
                            Use a work email to easily collaborate with your teammates
                        </p>
                    </div>

                    <form
                        ref={formRef}
                        id="loginForm"
                        noValidate
                        onSubmit={(event) => void submit(event)}
                        className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label
                                htmlFor="email"
                                className="px-0 text-sm font-medium text-foreground">
                                Work Email
                            </Label>
                            <div className="relative">
                                <DomainIcon
                                    aria-hidden
                                    className={cn(
                                        'pointer-events-none absolute top-3.5 left-3 size-4 transition-colors',
                                        focused ? 'text-primary' : 'text-muted-foreground'
                                    )}
                                />
                                <Input
                                    {...emailField}
                                    id="email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    disabled={isBusy}
                                    autoFocus
                                    placeholder="you@company.com"
                                    aria-invalid={fieldError || errorMessage ? true : undefined}
                                    onFocus={() => setFocused(true)}
                                    onBlur={(event) => {
                                        setFocused(false);
                                        void emailField.onBlur(event);
                                    }}
                                    className="h-11 rounded-[0.75rem] pr-[2.375rem] pl-[2.375rem] text-md"
                                />
                                {emailIsValid && (
                                    <CheckCircleIcon
                                        aria-hidden
                                        className="absolute top-3.5 right-3 size-4 text-primary"
                                        style={{
                                            animation: 'bb-scale .35s cubic-bezier(.34,1.56,.64,1)'
                                        }}
                                    />
                                )}
                            </div>
                            {fieldError && (
                                <FieldMessage role="alert" tone="error" icon={<ErrorIcon />}>
                                    {fieldError}
                                </FieldMessage>
                            )}
                            {errorMessage && (
                                <FieldMessage role="alert" tone="error" icon={<ErrorIcon />}>
                                    {errorMessage}{' '}
                                    <Link
                                        href={loginHref}
                                        className="font-medium text-foreground underline underline-offset-[3px]">
                                        Use email instead
                                    </Link>
                                </FieldMessage>
                            )}
                            {captchaStatus === 'error' && (
                                <div className="flex flex-col items-start gap-2 rounded-[0.625rem] bg-danger-subtle px-3 py-2.5">
                                    <FieldMessage tone="error" icon={<ErrorIcon />}>
                                        We couldn’t verify your browser. Turn off content blockers
                                        for this page, then try again.
                                    </FieldMessage>
                                    <BbButton variant="secondary" size="sm" onClick={resetCaptcha}>
                                        <RefreshIcon />
                                        Try again
                                    </BbButton>
                                </div>
                            )}
                        </div>
                        <BbButton
                            type="submit"
                            loading={isBusy}
                            loadingText={
                                isAwaitingCaptcha ? 'Verifying…' : 'Looking up your organization…'
                            }
                            className={cn(BUTTON, 'h-11 rounded-[0.75rem] text-md font-semibold')}>
                            Continue
                        </BbButton>
                    </form>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span aria-hidden className="h-px flex-1 bg-border" />
                        Or
                        <span aria-hidden className="h-px flex-1 bg-border" />
                    </div>
                    <Link
                        href={loginHref}
                        className="self-center rounded-sm p-1 text-sm font-medium text-foreground underline underline-offset-[3px] hover:text-muted-foreground">
                        Login without SSO
                    </Link>
                </div>
            </AuthCard>
        </>
    );
};

export default SSOView;
