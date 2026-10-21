'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { ErrorState } from '@components/patterns/ErrorState';
import { ErrorIcon } from '@components/icons/material';
import { logger } from '@lib/logger';
import { contactSupport } from '@lib/support';
import { cn } from '@lib/utils';

export interface RouteErrorProps {
    // Next.js hands `error` and `reset` to every error boundary.
    error?: Error & { digest?: string };
    reset?: () => void;
}

interface RouteErrorViewProps extends RouteErrorProps {
    // What failed to load, e.g. "the API settings".
    description?: string;
    // A full sentence to show instead of the default guidance.
    message?: string;
    // Outside the dashboard shell (login, session, invite…): fill the screen.
    isFullScreen?: boolean;
}

// The body of every route's error.tsx: log what broke and offer a retry
// instead of a dead end that only a reload clears. The raw error stays in the
// logs; people get a reference they can quote to support.
const RouteError = ({
    error,
    reset,
    description,
    message,
    isFullScreen = false
}: RouteErrorViewProps) => {
    useEffect(() => {
        if (error) logger.error('route error: ', error);
    }, [error]);

    return (
        <div
            className={cn(
                'flex w-full items-center justify-center p-6',
                isFullScreen ? 'min-h-dvh bg-background' : 'h-full'
            )}>
            <ErrorState
                size="lg"
                icon={<ErrorIcon />}
                title={`We couldn’t load ${description || 'this page'}`}
                description={
                    message ||
                    'Something went wrong on our side. Try again — if it keeps happening, contact support.'
                }
                reference={error?.digest}
                onRetry={reset}
                actions={
                    <>
                        <BbButton asChild variant="secondary">
                            <Link href="/">Go home</Link>
                        </BbButton>
                        <BbButton
                            variant="ghost"
                            onClick={() =>
                                contactSupport(
                                    error?.digest ? `Error reference ${error.digest}` : 'Page error'
                                )
                            }>
                            Contact support
                        </BbButton>
                    </>
                }
            />
        </div>
    );
};

export default RouteError;
