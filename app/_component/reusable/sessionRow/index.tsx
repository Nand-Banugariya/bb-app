import * as React from 'react';
import { PlayCircleIcon } from '@components/icons/material';
import { UserAvatar } from '@components/reusable/userAvatar';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Session row: 64×40 thumbnail (canvas fill, inset ring, play icon until the
 * image loads), 14/500 title on one line, 12px meta line ("BB-2041 · 0:42 · 2h ago"), and a
 * trailing slot (status pill, Open button…). Hover tints d100. Render as a link with `asLink`.
 */
interface SessionRowProps extends Omit<React.ComponentProps<'div'>, 'title'> {
    title: React.ReactNode;
    /** Pieces of the meta line; joined with " · ". */
    meta?: React.ReactNode[];
    thumbnail?: string | null;
    /** Right side: StatusPill, actions… */
    trailing?: React.ReactNode;
    href?: string;
}

function SessionRow({
    title,
    meta = [],
    thumbnail,
    trailing,
    href,
    className,
    ...props
}: SessionRowProps) {
    const body = (
        <>
            <span className="relative grid h-10 w-16 shrink-0 place-items-center overflow-hidden rounded-sm bg-canvas shadow-[inset_0_0_0_1px_var(--d200)] text-muted-foreground">
                {thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element -- user-uploaded thumbnails from the CDN
                    <img src={thumbnail} alt="" className="size-full object-cover" />
                ) : (
                    <PlayCircleIcon className="size-[1.125rem]" />
                )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-md font-medium">{title}</span>
                {meta.length > 0 && (
                    <span className="truncate text-xs text-muted-foreground">
                        {meta.map((part, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && ' · '}
                                {part}
                            </React.Fragment>
                        ))}
                    </span>
                )}
            </span>
        </>
    );

    return (
        <div
            data-slot="session-row"
            className={cn(
                'flex items-center gap-3 rounded-md p-2 transition-colors duration-fast hover:bg-d100',
                className
            )}
            {...props}>
            {href ? (
                <a
                    href={href}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                    {body}
                </a>
            ) : (
                <span className="flex min-w-0 flex-1 items-center gap-3">{body}</span>
            )}
            {trailing && <span className="flex shrink-0 items-center gap-2">{trailing}</span>}
        </div>
    );
}

/**
 * Design system v2 · Comment / activity entry: 28px avatar, "Name · time" (13px, name 600,
 * time muted), 14px body.
 */
interface CommentItemProps extends React.ComponentProps<'div'> {
    author: { name: string; avatar?: string | null; id?: string };
    time: React.ReactNode;
    /** Actions shown on the right of the header (menu, reactions…). */
    actions?: React.ReactNode;
}

function CommentItem({ author, time, actions, className, children, ...props }: CommentItemProps) {
    return (
        <div data-slot="comment-item" className={cn('flex gap-2.5 p-2', className)} {...props}>
            <UserAvatar name={author.name} src={author.avatar} colorSeed={author.id} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm">
                        <span className="font-semibold">{author.name}</span>{' '}
                        <span className="text-muted-foreground">· {time}</span>
                    </span>
                    {actions}
                </div>
                <div className="text-md break-words">{children}</div>
            </div>
        </div>
    );
}

export { SessionRow, CommentItem };
export type { SessionRowProps, CommentItemProps };
