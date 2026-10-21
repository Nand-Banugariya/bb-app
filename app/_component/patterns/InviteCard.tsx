import * as React from 'react';
import { cn } from '@lib/utils';
import BbButton from '@components/base_shadcn/custom/bbbutton';
import { Reveal } from './Reveal';

interface InviteCardDetail {
    label: string;
    value: React.ReactNode;
}

interface InviteCardProps {
    /** Small line above the title: "You’re invited to join". */
    eyebrow?: React.ReactNode;
    /** Workspace / project name — the page's <h1>. */
    title: React.ReactNode;
    /** Workspace avatar or logo. */
    avatar?: React.ReactNode;
    description?: React.ReactNode;
    /** Role, invited by, expires … shown as a label/value list. */
    details?: InviteCardDetail[];
    /** "Signed in as …" line with a way to switch accounts. */
    signedInAs?: React.ReactNode;
    /** Primary (Accept / Join / Approve) first, then secondary actions. */
    actions?: React.ReactNode;
    /** Error or status message inside the card. */
    message?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

/**
 * Shared card for invite, join, join-project and approve-request pages, so the
 * four flows look and read the same.
 */
const InviteCard = ({
    eyebrow,
    title,
    avatar,
    description,
    details,
    signedInAs,
    actions,
    message,
    footer,
    className
}: InviteCardProps) => (
    // The card itself stays put (its skeleton draws the same frame); its
    // contents fade in, top to bottom.
    <Reveal
        stagger
        className={cn(
            'mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg bg-card p-6 text-card-foreground shadow-sh-lg sm:p-8',
            className
        )}>
        <div className="flex flex-col items-center gap-3 text-center">
            {avatar && <div className="flex items-center justify-center">{avatar}</div>}
            <div className="flex flex-col gap-1">
                {eyebrow && <p className="text-sm text-muted-foreground">{eyebrow}</p>}
                <h1 className="text-2xl font-semibold tracking-tighter break-words text-foreground">
                    {title}
                </h1>
                {description && <p className="text-md text-muted-foreground">{description}</p>}
            </div>
        </div>

        {details && details.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-md bg-side px-4 py-3 text-sm shadow-sh">
                {details.map((detail) => (
                    <React.Fragment key={detail.label}>
                        <dt className="text-muted-foreground">{detail.label}</dt>
                        <dd className="min-w-0 truncate text-right font-medium text-foreground">
                            {detail.value}
                        </dd>
                    </React.Fragment>
                ))}
            </dl>
        )}

        {message}

        {actions && <div className="flex flex-col gap-2">{actions}</div>}

        {signedInAs && <p className="text-center text-xs text-muted-foreground">{signedInAs}</p>}
        {footer}
    </Reveal>
);

export { InviteCard };
export type { InviteCardProps, InviteCardDetail };

/** Workspace / project mark for invite cards: logo when there is one, else a letter tile. */
const InviteAvatar = ({
    name,
    imageSrc,
    className
}: {
    name?: string;
    imageSrc?: string;
    className?: string;
}) =>
    imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote logos of unknown size
        <img
            src={imageSrc}
            alt=""
            className={cn('size-14 rounded-lg object-cover shadow-sh', className)}
        />
    ) : (
        <div
            aria-hidden
            className={cn(
                'flex size-14 items-center justify-center rounded-lg bg-label-blue text-xl font-bold text-white',
                className
            )}>
            {(name || '?').charAt(0).toUpperCase()}
        </div>
    );

/** "Signed in as you@x.com · Switch account" — so people notice when a link was meant for another account. */
const SignedInAs = ({
    email,
    onSwitchAccount,
    isSwitching
}: {
    email?: string;
    onSwitchAccount?: () => void;
    isSwitching?: boolean;
}) => {
    if (!email) return null;
    return (
        <span className="inline-flex flex-wrap items-center justify-center gap-x-1">
            Signed in as <span className="font-medium text-foreground">{email}</span>
            {onSwitchAccount && (
                <>
                    <span aria-hidden>·</span>
                    <BbButton
                        variant="link"
                        size="xs"
                        className="text-xs"
                        loading={isSwitching}
                        onClick={onSwitchAccount}>
                        Switch account
                    </BbButton>
                </>
            )}
        </span>
    );
};

export { InviteAvatar, SignedInAs };
