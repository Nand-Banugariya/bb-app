'use client';
import React from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@components/base_shadcn/input-otp';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { InlineError } from '@components/patterns/ErrorState';

interface OtpInputComponentProps {
    otp: string | undefined;
    setOtp: React.Dispatch<React.SetStateAction<string>>;
    handleVerificationSubmit: (userOtp?: string) => Promise<void>;
    isVerificationLoading: boolean;
    loginUserState?: { isLoading?: boolean } | null;
    handleResendCode?: () => void;
    isResendOtpSet?: boolean;
    isResendLoading?: boolean;
    counter: number;
    email?: string;
    maxLength?: number;
    /** Inline error for a rejected code (announced to screen readers). */
    otpError?: string | null;
    /** Called whenever the digits change (e.g. to clear `otpError`). */
    onOtpChange?: (otp: string) => void;
    /** Render the "Check your email" heading. Turn off when a surrounding card supplies it. */
    showHeading?: boolean;
}

/**
 * The 6-digit code step. It's its own <form>: Enter or the Verify button
 * submits the code, and nothing in here can submit the email form around it.
 */
const OtpInputComponent = ({
    otp,
    setOtp,
    handleVerificationSubmit,
    isVerificationLoading,
    loginUserState,
    handleResendCode,
    isResendOtpSet,
    isResendLoading,
    counter,
    email,
    maxLength = 6,
    otpError,
    onOtpChange,
    showHeading = true
}: OtpInputComponentProps) => {
    const isVerifying = isVerificationLoading || Boolean(loginUserState?.isLoading);
    const canResend = (isResendOtpSet || counter <= 0) && !isResendLoading;
    const errorId = 'otp-error';

    return (
        <form
            noValidate
            onSubmit={(e) => {
                e.preventDefault();
                if (!isVerifying && otp?.length === maxLength) {
                    handleVerificationSubmit();
                }
            }}
            className="flex flex-col">
            {showHeading && (
                <div className="flex flex-col gap-1 pt-11 pb-7 text-center">
                    <h1 className="text-2xl font-semibold tracking-tighter text-foreground">
                        Check your email
                    </h1>
                    <p className="text-md text-muted-foreground">
                        We sent a {maxLength}-digit code to{' '}
                        {email ? (
                            <span className="font-medium text-foreground">{email}</span>
                        ) : (
                            'your email'
                        )}
                        .
                    </p>
                </div>
            )}
            <div id="otpInputContainer" className="flex flex-col items-center gap-2">
                <InputOTP
                    value={otp ?? ''}
                    maxLength={maxLength}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    containerClassName="justify-center"
                    aria-label={`${maxLength}-digit verification code`}
                    aria-invalid={otpError ? true : undefined}
                    aria-describedby={otpError ? errorId : undefined}
                    onChange={(newOtp: string) => {
                        onOtpChange?.(newOtp);
                        setOtp(newOtp);
                        if (newOtp.length === maxLength && !isVerifying) {
                            handleVerificationSubmit(newOtp);
                        }
                    }}>
                    <InputOTPGroup className="gap-2">
                        {Array.from({ length: maxLength }, (_, i) => (
                            <InputOTPSlot
                                key={i}
                                index={i}
                                aria-invalid={otpError ? true : undefined}
                                className="rounded-md border tabular-nums first:rounded-md last:rounded-md"
                            />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
                {otpError && <InlineError id={errorId}>{otpError}</InlineError>}
            </div>
            <BbButton
                type="submit"
                loading={isVerifying}
                className="mt-6 w-full"
                disabled={!otp || otp.length !== maxLength}>
                Verify
            </BbButton>
            <div className="flex items-center justify-between py-5">
                <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">Didn’t get it?</span>
                    <BbButton
                        variant="link"
                        size="sm"
                        loading={isResendLoading}
                        disabled={!canResend}
                        onClick={handleResendCode}>
                        Resend code
                    </BbButton>
                </div>
                {counter > 0 && (
                    <span
                        className="text-sm text-muted-foreground tabular-nums"
                        aria-label={`You can resend in ${counter} seconds`}>
                        {Math.floor(counter / 60)
                            .toString()
                            .padStart(2, '0')}
                        :{(counter % 60).toString().padStart(2, '0')}
                    </span>
                )}
            </div>
        </form>
    );
};

export default OtpInputComponent;
export type { OtpInputComponentProps };
