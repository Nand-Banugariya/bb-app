'use client';

import * as React from 'react';
import { Input } from '../input';
import { ErrorIcon } from '@components/icons/material';
import { cn } from '@lib/utils';
import { fieldLabelClasses } from './field-variants';

interface BbInputProps extends React.ComponentProps<typeof Input> {
    label?: React.ReactNode;
    labelRight?: React.ReactNode;
    labelClassName?: string;
    containerClassName?: string;
    leftIcon?: React.ReactNode;
    /** Marks the field invalid (red ring, `aria-invalid`). */
    error?: boolean;
    /** Shown under the field and announced; implies `error`. */
    errorMessage?: React.ReactNode;
    /** Helper text under the field (hidden while an error shows). */
    hint?: React.ReactNode;
}

/**
 * Text field with optional label, icon, hint and error (design system v2: label 12/500 muted
 * above, help and error 12px below). The label is always linked to the input, and errors are
 * wired with `aria-invalid` + `aria-describedby`.
 */
function BbInput({
    className,
    label,
    labelRight,
    labelClassName,
    containerClassName,
    leftIcon,
    id,
    required,
    error,
    errorMessage,
    hint,
    'aria-describedby': ariaDescribedBy,
    ...rest
}: BbInputProps) {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const invalid = Boolean(error || errorMessage);
    const describedBy =
        [ariaDescribedBy, errorMessage ? errorId : hint ? hintId : undefined]
            .filter(Boolean)
            .join(' ') || undefined;

    return (
        <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
            {(label || labelRight) && (
                <div className="flex items-center justify-between gap-2">
                    {label && (
                        <label htmlFor={inputId} className={cn(fieldLabelClasses, labelClassName)}>
                            {label}
                            {required && (
                                <span aria-hidden className="ml-0.5 text-danger">
                                    *
                                </span>
                            )}
                        </label>
                    )}
                    {labelRight}
                </div>
            )}
            <div className="relative">
                {leftIcon && (
                    <span
                        aria-hidden
                        className="pointer-events-none absolute top-1/2 left-2.5 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:size-[1.125rem]">
                        {leftIcon}
                    </span>
                )}
                <Input
                    id={inputId}
                    required={required}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={cn(leftIcon && 'pl-9', className)}
                    {...rest}
                />
            </div>
            {errorMessage ? (
                <p
                    id={errorId}
                    role="alert"
                    className="flex items-center gap-1 text-xs text-danger">
                    <ErrorIcon aria-hidden className="size-3.5 shrink-0" />
                    {errorMessage}
                </p>
            ) : hint ? (
                <p id={hintId} className="text-xs text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

export default BbInput;
export { BbInput };
export type { BbInputProps };
