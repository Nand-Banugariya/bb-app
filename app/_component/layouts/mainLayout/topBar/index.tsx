'use client';

import * as React from 'react';
import { AddIcon, NotificationsIcon, UnfoldMoreIcon } from '@components/icons/material';
import { SidebarTrigger } from '@components/base_shadcn/sidebar';
import { BbButton } from '@components/base_shadcn/custom/bbbutton';
import { BBTooltip } from '@components/base_shadcn/custom/bbtooltip';
import { cn } from '@lib/utils';

/**
 * Design system v2 · App shell top bar: 60px, inset bottom ring.
 *   left   — sidebar trigger (Mobile/Tablet only) + workspace switcher
 *   centre — search (hidden below Tablet; `search` slot, e.g. <SearchInput shortcut={['mod','K']} />)
 *   right  — notifications (red dot when unread) + primary "New session" (icon-only on Mobile)
 * Presentational: wire the switcher into a DropdownMenu via `workspaceTrigger`, or pass handlers.
 * `withSidebarTrigger` needs a surrounding <SidebarProvider>.
 */
interface WorkspaceSwitcherButtonProps extends React.ComponentProps<'button'> {
    name: string;
    /** Logo URL; otherwise a letter tile in `color`. */
    logo?: string | null;
    color?: string;
}

/** Letter tile (or logo) + workspace name + unfold_more. Use as a DropdownMenuTrigger child. */
const WorkspaceSwitcherButton = React.forwardRef<HTMLButtonElement, WorkspaceSwitcherButtonProps>(
    function WorkspaceSwitcherButton(
        { name, logo, color = 'var(--label-blue)', className, ...props },
        ref
    ) {
        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    'flex min-w-0 cursor-pointer items-center gap-2 rounded-md py-1 pr-1.5 pl-1 whitespace-nowrap outline-none',
                    'transition-colors duration-fast hover:bg-d100 focus-visible:ring-[3px] focus-visible:ring-ring',
                    className
                )}
                {...props}>
                {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- workspace logos from the CDN
                    <img src={logo} alt="" className="size-7 shrink-0 rounded-md object-cover" />
                ) : (
                    <span
                        aria-hidden
                        className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold text-white"
                        style={{ background: color }}>
                        {name.trim().charAt(0).toUpperCase()}
                    </span>
                )}
                <span className="truncate text-md font-semibold">{name}</span>
                <UnfoldMoreIcon className="size-4 shrink-0 text-muted-foreground" />
            </button>
        );
    }
);

interface TopBarProps extends React.ComponentProps<'header'> {
    /** Workspace switcher, usually <DropdownMenu><DropdownMenuTrigger asChild><WorkspaceSwitcherButton/>… */
    workspaceTrigger?: React.ReactNode;
    /** Centre search field. Hidden below Tablet (640px). */
    search?: React.ReactNode;
    hasUnreadNotifications?: boolean;
    onNotificationsClick?: () => void;
    /** Hide the "New session" button by passing null, or replace it. */
    primaryAction?: React.ReactNode;
    onNewSession?: () => void;
    /** Extra actions before notifications. */
    actions?: React.ReactNode;
    /** Shows the SidebarTrigger on Mobile/Tablet (requires SidebarProvider). */
    withSidebarTrigger?: boolean;
}

function TopBar({
    workspaceTrigger,
    search,
    hasUnreadNotifications = false,
    onNotificationsClick,
    primaryAction,
    onNewSession,
    actions,
    withSidebarTrigger = false,
    className,
    ...props
}: TopBarProps) {
    return (
        <header
            data-slot="top-bar"
            className={cn(
                'grid h-[3.75rem] shrink-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 bg-background page-padding shadow-[inset_0_-1px_0_var(--d200)]',
                'sm:grid-cols-[auto_minmax(0,20rem)_minmax(0,1fr)]',
                className
            )}
            {...props}>
            <div className="flex min-w-0 items-center gap-1">
                {withSidebarTrigger && <SidebarTrigger className="md:hidden" />}
                {workspaceTrigger}
            </div>
            {search ? (
                <div className="hidden min-w-0 sm:block">{search}</div>
            ) : (
                <span className="hidden sm:block" />
            )}
            <div className="flex items-center justify-end gap-2">
                {actions}
                <BBTooltip content="Notifications">
                    <BbButton
                        variant="ghost"
                        size="icon-md"
                        aria-label={
                            hasUnreadNotifications ? 'Notifications (unread)' : 'Notifications'
                        }
                        onClick={onNotificationsClick}>
                        <NotificationsIcon />
                        {hasUnreadNotifications && (
                            <span
                                aria-hidden
                                className="absolute top-1.5 right-[0.4375rem] size-[0.4375rem] rounded-full bg-destructive shadow-[0_0_0_1.5px_var(--bg)]"
                            />
                        )}
                    </BbButton>
                </BBTooltip>
                {primaryAction !== undefined ? (
                    primaryAction
                ) : (
                    <BbButton size="md" onClick={onNewSession} className="max-sm:px-2">
                        <AddIcon className="size-4" />
                        <span className="max-sm:sr-only">New session</span>
                    </BbButton>
                )}
            </div>
        </header>
    );
}

export { TopBar, WorkspaceSwitcherButton };
export type { TopBarProps, WorkspaceSwitcherButtonProps };
