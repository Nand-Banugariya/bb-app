'use client';

import * as React from 'react';
import { ErrorIcon, RefreshIcon, WifiOffIcon } from '@components/icons/material';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { cn } from '@lib/utils';

interface ErrorStateProps {
    /** What failed, plainly: "We couldn’t load this page". */
    title?: React.ReactNode;
    /** What to do next. Never a raw `error.message`. */
    description?: React.ReactNode;
    onRetry?: () => void;
    retryLabel?: string;
    /** Short reference users can quote to support (e.g. an error digest). */
    reference?: string;
    /** Extra actions (Home, Contact support). */
    actions?: React.ReactNode;
    /** Tile icon; defaults to the design system's "wifi off". */
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

/**
 * Full-area error with retry (design system v2 · 11: red icon tile, title, one sentence,
 * secondary "Try again"). Announced to screen readers.
 */
const ErrorState = ({
    title = 'We couldn’t load this',
    description = 'Check your connection and try again. If it keeps happening, contact support.',
    onRetry,
    retryLabel = 'Try again',
    reference,
    actions,
    icon = <WifiOffIcon />,
    size = 'md',
    className
}: ErrorStateProps) => (
    <div
        role="alert"
        className={cn(
            'mx-auto flex w-full max-w-md flex-col items-center justify-center gap-3 px-6 text-center motion-safe:animate-reveal',
            size === 'sm' ? 'gap-2 py-6' : size === 'lg' ? 'py-16' : 'py-10',
            className
        )}>
        <div
            aria-hidden
            className={cn(
                'flex items-center justify-center rounded-lg bg-danger-subtle text-danger',
                size === 'sm' ? 'size-9 [&_svg]:size-5' : 'size-12 [&_svg]:size-6'
            )}>
            {icon}
        </div>
        <div className="flex flex-col gap-1">
            <p
                className={cn(
                    'font-semibold tracking-tight text-foreground',
                    size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-md' : 'text-lg'
                )}>
                {title}
            </p>
            {description && (
                <p
                    className={cn(
                        'mx-auto max-w-[17.5rem] text-muted-foreground',
                        size === 'sm' ? 'text-sm' : 'text-md'
                    )}>
                    {description}
                </p>
            )}
            {reference && (
                <p className="text-xs text-muted-foreground">
                    Reference: <span className="font-medium text-foreground">{reference}</span>
                </p>
            )}
        </div>
        {(onRetry || actions) && (
            <div className="flex flex-wrap items-center justify-center gap-2">
                {onRetry && (
                    <BbButton variant="secondary" onClick={onRetry}>
                        <RefreshIcon />
                        {retryLabel}
                    </BbButton>
                )}
                {actions}
            </div>
        )}
    </div>
);

interface InlineErrorProps {
    id?: string;
    children: React.ReactNode;
    className?: string;
}

/** One-line error under a field or inside a row (12px, red text, 14px icon). */
const InlineError = ({ id, children, className }: InlineErrorProps) => (
    <p
        id={id}
        role="alert"
        className={cn('flex items-center gap-1 text-xs text-danger', className)}>
        <ErrorIcon aria-hidden className="size-3.5 shrink-0" />
        <span>{children}</span>
    </p>
);

export { ErrorState, InlineError };
export type { ErrorStateProps, InlineErrorProps };
