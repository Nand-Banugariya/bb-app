'use client';

import * as React from 'react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../input-otp';
import { cn } from '@lib/utils';

const variantClasses = {
    spaced: 'gap-2',
    compact: 'gap-1'
};

type BbInputOtpProps = Omit<
    React.ComponentProps<typeof InputOTP>,
    'children' | 'render' | 'maxLength'
> & {
    variant?: 'spaced' | 'compact';
    maxLength?: number;
};

/**
 * One-time-code input: digits only, autofills from SMS/email codes. Separate 44×48 boxes with
 * the hairline ring, green focus ring on the active slot, red ring when `aria-invalid`.
 */
function BbInputOtp({ variant = 'spaced', className, maxLength = 6, ...props }: BbInputOtpProps) {
    return (
        <InputOTP
            maxLength={maxLength}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            className={className}
            autoFocus
            {...props}>
            <InputOTPGroup className={cn(variantClasses[variant])}>
                {Array.from({ length: maxLength }, (_, i) => (
                    <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-12 w-11 rounded-md border text-lg tabular-nums first:rounded-md last:rounded-md"
                    />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

export default BbInputOtp;
export { BbInputOtp };
export type { BbInputOtpProps };
