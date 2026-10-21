'use client';

import * as React from 'react';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { Spinner } from '@components/base_shadcn/spinner';
import { CheckIcon, CloseIcon, RefreshIcon } from '@components/icons/material';
import NewBbLogo from '@components/newIcons/bb-logo';
import EnvIcon from '@components/reusable/envIcon';
import { cn } from '@lib/utils';

export type LoadingScreenType = 'success' | 'loading' | 'error' | 'celebration' | 'reportFirstBug';

interface UnifiedLoadingScreenProps {
    title?: string;
    message?: string;
    additionalMessage?: string;
    /** Picks the icon tile: spinner (loading), green check (success/celebration), red × (error). */
    type?: LoadingScreenType;
    showButton?: boolean;
    buttonText?: string;
    onButtonClick?: () => void;
    /** Error screens: shows "Try again". */
    onRetry?: () => void;
    /** A second, quieter action next to the main one (e.g. "Use email instead"). */
    secondaryAction?: { label: string; onClick: () => void };
    className?: string;
}

const ICON_TILE: Record<'loading' | 'success' | 'error', string> = {
    loading: 'bg-spot text-success',
    success: 'bg-spot text-success',
    error: 'bg-danger-subtle text-danger'
};

/**
 * Full-screen interstitial for redirects (sign-in, onboarding hand-offs) and their failure state.
 * Design system v2: 48px icon tile (spinner, check or ×), 20/600 title, one sentence, one action.
 * bb-app's Lottie animations are replaced by the tile; the success check pops in.
 * Announces its state to screen readers.
 */
const UnifiedLoadingScreen = ({
    title = 'Loading…',
    message = 'Sit tight while we redirect you.',
    additionalMessage,
    type = 'loading',
    showButton = false,
    buttonText = 'Continue',
    onButtonClick,
    onRetry,
    secondaryAction,
    className
}: UnifiedLoadingScreenProps) => {
    const tone = type === 'error' ? 'error' : type === 'loading' ? 'loading' : 'success';

    const primary =
        type === 'error' && onRetry ? (
            <BbButton onClick={onRetry}>
                <RefreshIcon />
                Try again
            </BbButton>
        ) : showButton && onButtonClick ? (
            <BbButton onClick={onButtonClick}>{buttonText}</BbButton>
        ) : null;

    return (
        <div
            className={cn(
                'fixed inset-0 z-50 flex size-full flex-col items-center justify-between bg-background py-8 md:py-12',
                className
            )}>
            <div className="mt-8 flex items-center justify-center gap-2 py-4 md:mt-12 md:p-0">
                <NewBbLogo aria-label="BetterBugs" className="h-6 w-auto text-foreground" />
                <EnvIcon />
            </div>

            <div className="flex flex-1 items-center justify-center">
                <div
                    role={type === 'error' ? 'alert' : 'status'}
                    aria-live={type === 'error' ? 'assertive' : 'polite'}
                    className="flex max-w-lg animate-reveal flex-col items-center gap-5 px-4 text-center">
                    <div
                        aria-hidden
                        className={cn(
                            'flex size-12 items-center justify-center rounded-lg [&_svg]:size-6',
                            ICON_TILE[tone]
                        )}>
                        {tone === 'loading' ? (
                            <Spinner aria-hidden role={undefined} aria-label={undefined} className="size-5" />
                        ) : tone === 'success' ? (
                            <CheckIcon className="motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:fade-in-0 motion-safe:duration-base" />
                        ) : (
                            <CloseIcon />
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h1>
                        {message && <p className="text-md text-muted-foreground">{message}</p>}
                        {additionalMessage && (
                            <p className="text-md text-muted-foreground">{additionalMessage}</p>
                        )}
                    </div>

                    {(primary || secondaryAction) && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {primary}
                            {secondaryAction && (
                                <BbButton variant="secondary" onClick={secondaryAction.onClick}>
                                    {secondaryAction.label}
                                </BbButton>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div aria-hidden className="h-8" />
        </div>
    );
};

export default UnifiedLoadingScreen;
