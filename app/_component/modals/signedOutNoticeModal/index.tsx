'use client';

import * as React from 'react';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import {
    BBDialog,
    BBDialogContent,
    BBDialogDescription,
    BBDialogFooter,
    BBDialogHeader,
    BBDialogTitle
} from '@components/base_shadcn/custom/bbdialog';
import { LockIcon, ScheduleIcon } from '@components/icons/material';
import type { AuthNotice } from '@lib/auth/authNotice';
import { cn } from '@lib/utils';

interface DisplayNotice {
    reason: AuthNotice['reason'];
    message: string;
}

interface SignedOutNoticeModalProps {
    notice: DisplayNotice | null;
    onDismiss: () => void;
}

const PRESENTATION: Record<
    AuthNotice['reason'],
    { title: string; Icon: typeof LockIcon; tileClassName: string }
> = {
    SESSION_REVOKED: {
        title: 'You’ve been signed out',
        Icon: LockIcon,
        tileClassName: 'bg-danger-subtle text-danger'
    },
    REFRESH_FAILED: {
        title: 'Your session expired',
        Icon: ScheduleIcon,
        tileClassName: 'bg-d100 text-muted-foreground'
    },
    // INVALID_TOKEN never opens this modal (no message, per spec); kept so the map stays
    // exhaustive over AuthNotice['reason'].
    INVALID_TOKEN: {
        title: 'You’ve been signed out',
        Icon: LockIcon,
        tileClassName: 'bg-danger-subtle text-danger'
    }
};

/**
 * Why the user landed back on the login page unexpectedly. A modal rather than a toast: a toast
 * is easy to miss on a page that's mid-redirect. The caller resolves the message (bb-api's own,
 * or a client fallback) and never opens this for INVALID_TOKEN.
 */
const SignedOutNoticeModal = ({ notice, onDismiss }: SignedOutNoticeModalProps) => {
    const presentation = notice ? PRESENTATION[notice.reason] : null;
    const Icon = presentation?.Icon;

    return (
        <BBDialog open={!!notice} onOpenChange={(open) => !open && onDismiss()}>
            <BBDialogContent size="sm">
                <BBDialogHeader className="items-start text-left">
                    {presentation && Icon && (
                        <div
                            aria-hidden
                            className={cn(
                                'mb-3 flex size-11 items-center justify-center rounded-lg [&_svg]:size-[1.375rem]',
                                presentation.tileClassName
                            )}>
                            <Icon />
                        </div>
                    )}
                    <BBDialogTitle>{presentation?.title}</BBDialogTitle>
                    <BBDialogDescription>{notice?.message}</BBDialogDescription>
                </BBDialogHeader>
                <BBDialogFooter>
                    <BbButton onClick={onDismiss}>Got it</BbButton>
                </BBDialogFooter>
            </BBDialogContent>
        </BBDialog>
    );
};

export default SignedOutNoticeModal;
