'use client';

import { formatDistanceToNowStrict } from 'date-fns';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import {
    BBDialog,
    BBDialogContent,
    BBDialogDescription,
    BBDialogFooter,
    BBDialogHeader,
    BBDialogTitle
} from '@components/base_shadcn/custom/bbdialog';
import { ComputerIcon } from '@components/icons/material';
import type { SessionConflictState } from '@redux/slices/auth';

interface SessionConflictModalProps {
    conflict: SessionConflictState | null;
    isConfirming: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const lastActiveLabel = (value: string | number | Date) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : formatDistanceToNowStrict(date, { addSuffix: true });
};

/**
 * Shown when a login hits bb-api's SESSION_CONFLICT (409): the account already has an active
 * session on another device under the opt-in single-active-session flow. Confirming calls
 * /auth/login/confirm, which signs the other device out and completes this login.
 */
const SessionConflictModal = ({
    conflict,
    isConfirming,
    onConfirm,
    onCancel
}: SessionConflictModalProps) => {
    const deviceLabel = conflict?.existingSession?.deviceLabel || 'another device';
    const ipAddress = conflict?.existingSession?.ipAddress;
    const lastActiveAt = conflict?.existingSession?.lastActiveAt;
    const lastActive = lastActiveAt ? lastActiveLabel(lastActiveAt) : null;

    return (
        <BBDialog open={!!conflict} onOpenChange={(open) => !open && !isConfirming && onCancel()}>
            <BBDialogContent
                size="sm"
                showCloseButton={!isConfirming}
                onInteractOutside={(event) => isConfirming && event.preventDefault()}
                onEscapeKeyDown={(event) => isConfirming && event.preventDefault()}>
                <BBDialogHeader className="items-start text-left">
                    <div
                        aria-hidden
                        className="mb-3 flex size-11 items-center justify-center rounded-lg bg-warning-subtle text-warning [&_svg]:size-[1.375rem]">
                        <ComputerIcon />
                    </div>
                    <BBDialogTitle>You’re already signed in elsewhere</BBDialogTitle>
                    {/* Prefer bb-api's own wording so copy changes there need no client release. */}
                    <BBDialogDescription>
                        {conflict?.message || 'Continue here and sign that device out?'}
                    </BBDialogDescription>
                </BBDialogHeader>

                <div className="flex flex-col gap-1 rounded-md bg-side px-4 py-3 shadow-sh">
                    <div className="flex items-center justify-between gap-3">
                        <span className="truncate text-md font-medium text-foreground">
                            {deviceLabel}
                        </span>
                        {lastActive && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                                Active {lastActive}
                            </span>
                        )}
                    </div>
                    {ipAddress && <span className="text-xs text-muted-foreground">{ipAddress}</span>}
                </div>

                <BBDialogFooter>
                    <BbButton variant="secondary" disabled={isConfirming} onClick={onCancel}>
                        Cancel
                    </BbButton>
                    <BbButton loading={isConfirming} loadingText="Signing in…" onClick={onConfirm}>
                        Continue here
                    </BbButton>
                </BBDialogFooter>
            </BBDialogContent>
        </BBDialog>
    );
};

export default SessionConflictModal;
