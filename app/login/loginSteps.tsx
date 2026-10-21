'use client';

import * as React from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Button } from '@components/base_shadcn/button';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { Input } from '@components/base_shadcn/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/base_shadcn/input-otp';
import { Label } from '@components/base_shadcn/label';
import { Spinner } from '@components/base_shadcn/spinner';
import { AuthCard, WordReveal } from '@components/common/authCard';
import { motion, shake } from '@components/common/authCard/authMotion';
import {
    ArrowBackIcon,
    CheckCircleIcon,
    ErrorIcon,
    InfoIcon,
    LockIcon,
    RefreshIcon,
    SpellcheckIcon,
    TimerIcon
} from '@components/icons/material';
import GithubIcon from '@components/newIcons/github';
import GoogleIcon from '@components/newIcons/google';
import { cn } from '@lib/utils';

/* -------------------------------------------------------------------------------------------- */
/* Shared bits                                                                                  */
/* -------------------------------------------------------------------------------------------- */

const FIELD = 'h-10 rounded-[0.625rem] px-3.5 text-lg';
const BUTTON =
    'h-10 rounded-[0.625rem] text-lg font-medium transition-[color,background-color,box-shadow,opacity,transform] hover:-translate-y-px active:scale-[.97] disabled:translate-y-0';

function FieldMessage({
    icon,
    tone = 'muted',
    children,
    role
}: {
    icon: React.ReactNode;
    tone?: 'muted' | 'error';
    children: React.ReactNode;
    role?: 'alert';
}) {
    return (
        <span
            role={role}
            className={cn(
                'flex items-start gap-1.5 text-sm leading-[1.45] [&>svg]:mt-px [&>svg]:size-3.5 [&>svg]:shrink-0',
                tone === 'error' ? 'text-destructive' : 'text-muted-foreground'
            )}
            style={{ animation: motion.pop() }}>
            {icon}
            <span>{children}</span>
        </span>
    );
}

function BackButton({ onClick, disabled, children }: React.ComponentProps<'button'>) {
    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={onClick}
            className="-ml-1.5 h-[1.875rem] self-start rounded-lg pr-2.5 pl-1.5 text-sm font-normal">
            <ArrowBackIcon className="size-4" />
            {children}
        </Button>
    );
}

/* -------------------------------------------------------------------------------------------- */
/* Email                                                                                        */
/* -------------------------------------------------------------------------------------------- */

const PERSONAL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'proton.me'
];
const DOMAIN_TYPOS: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.con': 'gmail.com',
    'hotmial.com': 'hotmail.com',
    'yaho.com': 'yahoo.com',
    'outlok.com': 'outlook.com',
    'icloud.co': 'icloud.com'
};

const domainOf = (email: string) => (email.split('@')[1] ?? '').toLowerCase().trim();

type EmailStepProps = {
    /** Slide in from the right (first visit) or the left (back from the code step). */
    enterFrom?: 'fwd' | 'back';
    field: UseFormRegisterReturn<'email'>;
    email: string;
    /** Email passes the form's validation (shows the ✓ and the ↵ hint). */
    emailValid: boolean;
    error?: string;
    /** Increments on every rejected submit, to replay the shake. */
    shakeKey: number;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onEmailKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    applyEmail: (email: string) => void;
    isSubmitting: boolean;
    loadingText?: string;
    pendingProvider: 'google' | 'github' | 'sso' | null;
    onGoogle: () => void;
    onGithub: () => void;
    onSso: () => void;
    /** Captcha failed to load: message + retry, shown under the field. */
    captchaError?: { onRetry: () => void } | null;
};

function EmailStep({
    enterFrom = 'fwd',
    field,
    email,
    emailValid,
    error,
    shakeKey,
    onSubmit,
    onEmailKeyDown,
    applyEmail,
    isSubmitting,
    loadingText,
    pendingProvider,
    onGoogle,
    onGithub,
    onSso,
    captchaError
}: EmailStepProps) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const [focused, setFocused] = React.useState(false);
    const busy = isSubmitting || pendingProvider !== null;

    React.useEffect(() => {
        if (shakeKey > 0) shake(formRef.current);
    }, [shakeKey]);

    const domain = domainOf(email);
    const typoFix =
        email.includes('@') && DOMAIN_TYPOS[domain]
            ? `${email.split('@')[0]}@${DOMAIN_TYPOS[domain]}`
            : '';
    const isPersonal = emailValid && PERSONAL_DOMAINS.includes(domain);

    return (
        <AuthCard>
            <div className="flex flex-col gap-7" style={{ animation: motion.step(enterFrom) }}>
                <div className="flex flex-col gap-1.5">
                    <h1
                        className="text-xl leading-[1.25] font-semibold tracking-[-0.02em]"
                        style={{ animation: motion.up(0.2) }}>
                        Sign in
                    </h1>
                    <p
                        className="text-lg text-muted-foreground"
                        style={{ animation: motion.up(0.3) }}>
                        Enter your email to continue with your BetterBugs account
                    </p>
                </div>

                <form
                    ref={formRef}
                    id="loginForm"
                    noValidate
                    onSubmit={onSubmit}
                    className="flex flex-col gap-[1.625rem]">
                    <div className="flex flex-col gap-2.5" style={{ animation: motion.up(0.45) }}>
                        <Label htmlFor="email" className="px-0 text-lg font-medium text-foreground">
                            Email
                        </Label>
                        <div className="relative">
                            <Input
                                {...field}
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                autoFocus
                                placeholder="Enter your email"
                                aria-invalid={error ? true : undefined}
                                disabled={busy}
                                onKeyDown={onEmailKeyDown}
                                onFocus={() => setFocused(true)}
                                onBlur={(event) => {
                                    setFocused(false);
                                    void field.onBlur(event);
                                }}
                                className={cn(FIELD, 'pr-[2.375rem]')}
                            />
                            {emailValid && (
                                <CheckCircleIcon
                                    aria-hidden
                                    className="absolute top-3 right-3 size-4 text-primary"
                                    style={{
                                        animation: 'bb-scale .35s cubic-bezier(.34,1.56,.64,1)'
                                    }}
                                />
                            )}
                        </div>
                        {error && (
                            <FieldMessage role="alert" tone="error" icon={<ErrorIcon />}>
                                {error}
                            </FieldMessage>
                        )}
                        {typoFix && !error && (
                            <FieldMessage icon={<SpellcheckIcon />}>
                                Did you mean{' '}
                                <button
                                    type="button"
                                    onClick={() => applyEmail(typoFix)}
                                    className="cursor-pointer font-semibold text-foreground underline underline-offset-[3px]">
                                    {typoFix}
                                </button>
                                ?
                            </FieldMessage>
                        )}
                        {isPersonal && (
                            <FieldMessage icon={<InfoIcon />}>
                                Use a work email to easily collaborate with your teammates
                            </FieldMessage>
                        )}
                        {captchaError && (
                            <div className="flex flex-col items-start gap-2 rounded-[0.625rem] bg-danger-subtle px-3 py-2.5">
                                <FieldMessage tone="error" icon={<ErrorIcon />}>
                                    We couldn’t verify your browser. Turn off content blockers for
                                    this page, then try again.
                                </FieldMessage>
                                <BbButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={captchaError.onRetry}>
                                    <RefreshIcon />
                                    Try again
                                </BbButton>
                            </div>
                        )}
                    </div>

                    <BbButton
                        type="submit"
                        loading={isSubmitting}
                        loadingText={loadingText ?? 'Checking…'}
                        disabled={pendingProvider !== null}
                        className={BUTTON}
                        style={{ animation: motion.up(0.55) }}>
                        Continue
                        {emailValid && focused && !busy && (
                            <span
                                aria-hidden
                                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md bg-primary-foreground/12 px-1.5 py-px font-mono text-2xs"
                                style={{ animation: motion.pop() }}>
                                ↵ Enter
                            </span>
                        )}
                    </BbButton>
                </form>

                <div
                    className="flex items-center gap-4 text-sm text-muted-foreground"
                    style={{ animation: motion.fade(0.65) }}>
                    <span aria-hidden className="h-px flex-1 bg-border" />
                    Or continue with
                    <span aria-hidden className="h-px flex-1 bg-border" />
                </div>

                <div className="flex flex-col gap-[1.625rem]">
                    <BbButton
                        variant="secondary"
                        onClick={onGoogle}
                        loading={pendingProvider === 'google'}
                        disabled={busy && pendingProvider !== 'google'}
                        className={BUTTON}
                        style={{ animation: motion.up(0.7) }}>
                        <GoogleIcon className="size-4" />
                        Continue With Google
                    </BbButton>
                    <BbButton
                        variant="secondary"
                        onClick={onGithub}
                        loading={pendingProvider === 'github'}
                        disabled={busy && pendingProvider !== 'github'}
                        className={BUTTON}
                        style={{ animation: motion.up(0.76) }}>
                        <GithubIcon className="size-4" />
                        Continue With Github
                    </BbButton>
                    <BbButton
                        variant="secondary"
                        onClick={onSso}
                        loading={pendingProvider === 'sso'}
                        disabled={busy && pendingProvider !== 'sso'}
                        className={BUTTON}
                        style={{ animation: motion.up(0.82) }}>
                        Continue with SSO
                    </BbButton>
                </div>

                <p
                    className="-mt-2 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground"
                    style={{ animation: motion.fade(0.95) }}>
                    <LockIcon aria-hidden className="size-4 shrink-0" />
                    No password needed. We&apos;ll email you a secure 6-digit code.
                </p>
            </div>
        </AuthCard>
    );
}

/* -------------------------------------------------------------------------------------------- */
/* Code                                                                                         */
/* -------------------------------------------------------------------------------------------- */

const CODE_LENGTH = 6;
const CODE_LIFETIME_S = 600;

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Ten-minute countdown for the emailed code. Remount (key) to restart after a resend. */
function CodeExpiry() {
    const [left, setLeft] = React.useState(CODE_LIFETIME_S);

    React.useEffect(() => {
        const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <div className="h-[3px] overflow-hidden rounded-full bg-muted">
                <div
                    className={cn(
                        'h-full rounded-full transition-[width,background-color] duration-1000 ease-linear',
                        left < 60 ? 'bg-destructive' : 'bg-primary'
                    )}
                    style={{ width: `${(left / CODE_LIFETIME_S) * 100}%` }}
                />
            </div>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
                <TimerIcon aria-hidden className="size-3.5" />
                Code expires in {mmss(left)}
            </span>
        </>
    );
}

type CodeStepProps = {
    email: string;
    /** Changes when a new code is sent; restarts the expiry. */
    codeRef: string | null;
    otp: string;
    setOtp: (otp: string) => void;
    otpError: string | null;
    onOtpChange: () => void;
    onComplete: (otp: string) => void;
    isVerifying: boolean;
    resendIn: number;
    isResending: boolean;
    canResend: boolean;
    onResend: () => void;
    onBack: () => void;
};

function CodeStep({
    email,
    codeRef,
    otp,
    setOtp,
    otpError,
    onOtpChange,
    onComplete,
    isVerifying,
    resendIn,
    isResending,
    canResend,
    onResend,
    onBack
}: CodeStepProps) {
    const groupRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (otpError) shake(groupRef.current);
    }, [otpError]);

    return (
        <AuthCard>
            <div className="flex flex-col gap-6" style={{ animation: motion.step('fwd') }}>
                <BackButton onClick={onBack} disabled={isVerifying}>
                    Use a different email
                </BackButton>
                <div className="flex flex-col gap-2">
                    <WordReveal text="Check your email" delay={0.1} />
                    <p className="text-md text-muted-foreground">
                        We sent a 6-digit code to{' '}
                        <span className="font-medium text-foreground">{email || 'your email'}</span>
                        .
                    </p>
                </div>

                <div className="flex flex-col gap-2.5">
                    <div ref={groupRef} className="relative">
                        {isVerifying && (
                            <div
                                aria-hidden
                                className="pointer-events-none absolute -inset-[3px] z-10 overflow-hidden rounded-[0.875rem]">
                                <div
                                    className="h-full w-[35%] bg-[linear-gradient(90deg,transparent,rgba(0,218,146,.35),transparent)]"
                                    style={{ animation: motion.sweep }}
                                />
                            </div>
                        )}
                        <InputOTP
                            value={otp}
                            maxLength={CODE_LENGTH}
                            pattern={REGEXP_ONLY_DIGITS}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            disabled={isVerifying}
                            containerClassName="w-full"
                            aria-label="Verification code"
                            aria-invalid={otpError ? true : undefined}
                            onChange={(value: string) => {
                                onOtpChange();
                                setOtp(value);
                                if (value.length === CODE_LENGTH && !isVerifying) onComplete(value);
                            }}>
                            <InputOTPGroup className="grid w-full grid-cols-6 gap-2">
                                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                                    <InputOTPSlot
                                        key={i}
                                        index={i}
                                        aria-invalid={otpError ? true : undefined}
                                        className={cn(
                                            'h-[3.375rem] w-full rounded-[0.875rem] border font-mono text-xl font-medium first:rounded-[0.875rem] last:rounded-[0.875rem]',
                                            'transition-[border-color,background-color,transform] duration-150',
                                            otp[i] &&
                                                !otpError &&
                                                'border-primary bg-primary/8 -translate-y-0.5'
                                        )}
                                        style={{
                                            animation: motion.up(+(0.25 + i * 0.05).toFixed(2), 0.5)
                                        }}
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    {otpError && (
                        <FieldMessage role="alert" tone="error" icon={<ErrorIcon />}>
                            {otpError}
                        </FieldMessage>
                    )}
                    {isVerifying && (
                        <span
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                            style={{ animation: motion.pop() }}>
                            <Spinner className="size-3" />
                            Verifying…
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-2 text-sm text-muted-foreground tabular-nums">
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 [&>div]:basis-full">
                        <CodeExpiry key={codeRef ?? 'code'} />
                        <span className="flex items-center gap-1 whitespace-nowrap">
                            Didn&apos;t get it?
                            <Button
                                variant="link"
                                disabled={!canResend}
                                onClick={onResend}
                                className="h-auto p-0.5 text-sm font-medium text-foreground disabled:text-muted-foreground disabled:opacity-100">
                                {isResending
                                    ? 'Sending…'
                                    : resendIn > 0
                                      ? `Resend in ${mmss(resendIn)}`
                                      : 'Resend code'}
                            </Button>
                        </span>
                    </div>
                </div>
            </div>
        </AuthCard>
    );
}

/* -------------------------------------------------------------------------------------------- */
/* Done / signing in                                                                            */
/* -------------------------------------------------------------------------------------------- */

const PARTICLE_COLORS = [
    'var(--primary)',
    'var(--primary)',
    'color-mix(in oklab, var(--primary) 50%, white)',
    'var(--fg)',
    'var(--primary)',
    'color-mix(in oklab, var(--primary) 30%, white)'
];

function SuccessStep({ via }: { via: string }) {
    return (
        <AuthCard>
            <div
                className="flex flex-col items-center gap-5 text-center"
                style={{ animation: motion.step('fwd') }}>
                <div className="relative flex size-[5.5rem] items-center justify-center">
                    {Array.from({ length: 14 }, (_, i) => (
                        <span
                            key={i}
                            aria-hidden
                            className="absolute top-11 left-11 size-0"
                            style={{ transform: `rotate(${(i * 360) / 14}deg)` }}>
                            <span
                                className="absolute top-[-3px] left-[30px] rounded-full"
                                style={{
                                    width: i % 3 === 0 ? 7 : 5,
                                    height: i % 3 === 0 ? 7 : 5,
                                    background: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
                                    animation: `bb-shoot .8s cubic-bezier(.16,1,.3,1) ${(0.45 + (i % 4) * 0.03).toFixed(2)}s both`
                                }}
                            />
                        </span>
                    ))}
                    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
                        <circle
                            cx="36"
                            cy="36"
                            r="34"
                            fill="rgba(0,218,146,.1)"
                            stroke="var(--primary)"
                            strokeWidth="3"
                            strokeDasharray="214"
                            strokeDashoffset="214"
                            style={{ animation: 'bb-draw .6s ease-out .1s forwards' }}
                        />
                        <path
                            d="M23 37l9 9 17-19"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="40"
                            strokeDashoffset="40"
                            style={{ animation: 'bb-draw .4s ease-out .55s forwards' }}
                        />
                    </svg>
                </div>
                <div className="flex flex-col gap-2">
                    <h1
                        className="text-xl leading-[1.25] font-semibold tracking-[-0.02em]"
                        style={{ animation: motion.up(0.3) }}>
                        You&apos;re in
                    </h1>
                    <p
                        className="text-md text-muted-foreground"
                        style={{ animation: motion.up(0.4) }}>
                        Signed in {via}. Setting up your workspace…
                    </p>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary"
                        style={{ animation: motion.bar(1.8, 0.3) }}
                    />
                </div>
            </div>
        </AuthCard>
    );
}

/** A Google / GitHub callback being exchanged for a session. */
function SigningInStep() {
    return (
        <AuthCard>
            <div
                className="flex flex-col items-center gap-4 py-4 text-center"
                style={{ animation: motion.step('fwd') }}>
                <Spinner className="size-8 text-primary" />
                <div className="flex flex-col gap-2">
                    <WordReveal text="Signing you in" className="justify-center" />
                    <p className="text-md text-muted-foreground">
                        Sit tight while we redirect you.
                    </p>
                </div>
            </div>
        </AuthCard>
    );
}

export { EmailStep, CodeStep, SuccessStep, SigningInStep, BUTTON, FIELD, BackButton, FieldMessage };
