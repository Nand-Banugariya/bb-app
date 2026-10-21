'use client';

import * as React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '../dialog';
import { Input } from '../input';
import { Label } from '../label';
import BbButton from './bbbutton';
import { BbAlert } from './bbalert';
import { CalendarTodayIcon, InfoIcon } from '@components/icons/material';
import { cn } from '@lib/utils';

interface BbPopconfirmProps {
    /** The trigger. Leave it out when the dialog is opened with `open` (e.g. from a menu item). */
    children?: React.ReactNode;
    /** The question with its object: "Delete 3 sessions?" */
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    /** The consequence, in one sentence. */
    description?: React.ReactNode;
    /** A verb that matches the title ("Delete"), not "OK"/"Continue". */
    okText?: React.ReactNode;
    cancelText?: string;
    /**
     * Return a promise to keep the dialog open with the confirm button loading until it settles.
     * Resolves → closes; rejects → stays open (show the error yourself, e.g. a toast).
     */
    onConfirm?: (e?: React.MouseEvent) => unknown | Promise<unknown>;
    onCancel?: (e?: React.MouseEvent) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    okButtonProps?: React.ComponentProps<typeof BbButton>;
    cancelButtonProps?: React.ComponentProps<typeof BbButton>;
    /** @deprecated Confirms are always centred dialogs. */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    /** Shown in the 44px tile above the title (red tile for destructive confirms). */
    icon?: React.ReactNode;
    infoMessage?: React.ReactNode;
    infoMessageVariant?: 'default' | 'warning' | 'success' | 'error' | 'info';
    whatThisMeans?: {
        title?: string;
        description?: string;
        bulletPoints?: string[];
    };
    featuresToLose?: string[];
    subscriptionActiveUntil?: string;
    pauseSubscriptionMessage?: string;
    footerClassName?: string;
    /** `destructive` makes the confirm button red and focuses Cancel first, so Enter never destroys. */
    variant?: 'default' | 'destructive';
    /**
     * Typed confirmation for irreversible actions with a wide blast radius: the confirm button
     * stays disabled until the user types exactly this text.
     */
    confirmText?: string;
    /** Label above the typed-confirmation field. Defaults to "Type {confirmText} to confirm". */
    confirmTextLabel?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS = {
    sm: 'sm:max-w-[25rem]',
    md: 'sm:max-w-[30rem]',
    lg: 'sm:max-w-[40rem]'
} as const;

const Bullets = ({ points }: { points: string[] }) => (
    <ul className="flex flex-col gap-2">
        {points.map((point) => (
            <li key={point} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span aria-hidden className="size-1 shrink-0 rounded-full bg-muted-foreground" />
                {point}
            </li>
        ))}
    </ul>
);

const Note = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-start gap-2 rounded-md bg-d100 px-3 py-2.5 text-sm [&_svg]:size-[1.125rem] [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
        {icon}
        <p>{children}</p>
    </div>
);

/**
 * Design system v2 · Confirm dialog: 44px icon tile above the title, one-sentence consequence,
 * Cancel (secondary) + verb button. Destructive confirms use the solid red button and focus
 * Cancel first. Supports async confirm and typed confirmation.
 */
function BbPopconfirm(props: BbPopconfirmProps) {
    const { children, open, onOpenChange, disabled = false, className, size = 'md' } = props;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [pending, setPending] = React.useState(false);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const setOpen = (next: boolean) => {
        if (!isControlled) setInternalOpen(next);
        onOpenChange?.(next);
    };

    // Esc / outside click can't dismiss a confirm that's still running.
    const handleOpenChange = (next: boolean) => {
        if (pending && !next) return;
        setOpen(next);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {children && (
                <DialogTrigger asChild disabled={disabled}>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent
                showCloseButton={false}
                role="alertdialog"
                className={cn(SIZE_CLASS[size], className)}
                // Portaled, but React events still bubble to whatever rendered the trigger
                // (e.g. a clickable table row) — stop them here.
                onClick={(e) => e.stopPropagation()}>
                {/* Mounted only while open, so typed text resets every time it opens. */}
                <PopconfirmBody
                    {...props}
                    pending={pending}
                    setPending={setPending}
                    close={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
BbPopconfirm.displayName = 'BbPopconfirm';

function PopconfirmBody({
    title,
    subtitle,
    description,
    okText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    disabled = false,
    okButtonProps,
    cancelButtonProps,
    icon,
    infoMessage,
    infoMessageVariant = 'success',
    whatThisMeans,
    featuresToLose,
    subscriptionActiveUntil,
    pauseSubscriptionMessage,
    footerClassName,
    variant,
    confirmText,
    confirmTextLabel,
    pending,
    setPending,
    close
}: BbPopconfirmProps & {
    pending: boolean;
    setPending: (pending: boolean) => void;
    close: () => void;
}) {
    const [typed, setTyped] = React.useState('');
    const typedId = React.useId();
    const isDestructive = variant === 'destructive' || okButtonProps?.variant === 'destructive';
    const typedOk = !confirmText || typed === confirmText;
    const hasCancelSubscriptionLayout = featuresToLose || subscriptionActiveUntil;
    const descriptionNode = subtitle ?? description;

    const handleConfirm = async (e?: React.MouseEvent) => {
        if (!typedOk) return;
        const result = onConfirm?.(e);
        if (result && typeof (result as Promise<unknown>).then === 'function') {
            setPending(true);
            try {
                await result;
            } catch {
                // The caller reports the failure; keep the dialog open to retry.
                setPending(false);
                return;
            }
            setPending(false);
        }
        close();
    };

    const handleCancel = (e: React.MouseEvent) => {
        onCancel?.(e);
        if (!pending) close();
    };

    return (
        <>
            <DialogHeader className="gap-1.5">
                {icon && (
                    <div
                        aria-hidden
                        className={cn(
                            'mb-3 flex size-11 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[1.375rem]',
                            isDestructive
                                ? 'bg-danger-subtle text-danger'
                                : 'bg-d100 text-foreground'
                        )}>
                        {icon}
                    </div>
                )}
                <DialogTitle>{title}</DialogTitle>
                {descriptionNode && <DialogDescription>{descriptionNode}</DialogDescription>}
            </DialogHeader>

            {featuresToLose && featuresToLose.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-medium">If you cancel, you’ll lose:</h4>
                    <Bullets points={featuresToLose} />
                </div>
            )}

            {subscriptionActiveUntil && (
                <Note icon={<CalendarTodayIcon />}>
                    <span className="font-medium">
                        Your plan stays active until {subscriptionActiveUntil}.
                    </span>{' '}
                    <span className="text-muted-foreground">You keep full access until then.</span>
                </Note>
            )}

            {pauseSubscriptionMessage && (
                <Note icon={<InfoIcon />}>
                    <span className="text-muted-foreground">{pauseSubscriptionMessage}</span>
                </Note>
            )}

            {whatThisMeans && !hasCancelSubscriptionLayout && (
                <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-medium">
                        {whatThisMeans.title || 'What this means'}
                    </h4>
                    {whatThisMeans.description && (
                        <p className="text-sm text-muted-foreground">{whatThisMeans.description}</p>
                    )}
                    {whatThisMeans.bulletPoints && whatThisMeans.bulletPoints.length > 0 && (
                        <Bullets points={whatThisMeans.bulletPoints} />
                    )}
                </div>
            )}

            {infoMessage && !hasCancelSubscriptionLayout && (
                <BbAlert variant={infoMessageVariant} description={infoMessage} />
            )}

            {confirmText && (
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor={typedId}>
                        {confirmTextLabel ?? (
                            <span>
                                Type{' '}
                                <span className="font-semibold text-foreground">{confirmText}</span>{' '}
                                to confirm
                            </span>
                        )}
                    </Label>
                    <Input
                        id={typedId}
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && typedOk && !pending) {
                                e.preventDefault();
                                void handleConfirm();
                            }
                        }}
                    />
                </div>
            )}

            <DialogFooter className={footerClassName}>
                <BbButton
                    variant="secondary"
                    disabled={pending}
                    autoFocus={isDestructive && !confirmText}
                    {...cancelButtonProps}
                    onClick={handleCancel}>
                    {cancelText}
                </BbButton>
                <BbButton
                    variant={isDestructive ? 'destructive' : 'default'}
                    autoFocus={!isDestructive && !confirmText}
                    {...okButtonProps}
                    loading={pending || okButtonProps?.loading || false}
                    disabled={disabled || !typedOk || okButtonProps?.disabled}
                    onClick={(e) => void handleConfirm(e)}>
                    {okButtonProps?.children || okText}
                </BbButton>
            </DialogFooter>
        </>
    );
}

export { BbPopconfirm };
export type { BbPopconfirmProps };
