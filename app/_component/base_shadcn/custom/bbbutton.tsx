import * as React from 'react';
import { Button } from '../button';
import { Spinner } from '../spinner';
import { cn } from '@lib/utils';

interface BbButtonProps extends React.ComponentProps<typeof Button> {
    /** Shows a spinner over the label, keeps the button's width, sets aria-busy. */
    loading?: boolean;
    /** Replaces the label while loading (the width may change to fit it). */
    loadingText?: string;
}

/**
 * The app's button: `Button` plus a loading state (design system v2 · "Creating…").
 * All visual states live in `buttonVariants`; don't add per-variant state classes here.
 */
function BbButton({
    children,
    loading = false,
    loadingText,
    disabled,
    className,
    variant = 'default',
    size = 'default',
    asChild,
    ...props
}: BbButtonProps) {
    if (asChild) {
        return (
            <Button
                asChild
                variant={variant}
                size={size}
                className={className}
                aria-disabled={disabled || undefined}
                {...props}>
                {children}
            </Button>
        );
    }

    return (
        <Button
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            variant={variant}
            size={size}
            className={className}
            {...props}>
            {loading && loadingText ? (
                <>
                    <Spinner aria-hidden aria-label={undefined} role={undefined} />
                    {loadingText}
                </>
            ) : (
                <>
                    <span className={cn('contents', loading && 'invisible')}>{children}</span>
                    {loading && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <Spinner aria-hidden aria-label={undefined} role={undefined} />
                        </span>
                    )}
                </>
            )}
        </Button>
    );
}

export default BbButton;
export { BbButton };
export type { BbButtonProps };
