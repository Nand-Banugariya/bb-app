'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem as BreadcrumbListItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from '../breadcrumb';
import { ExpandMoreIcon } from '@components/icons/material';
import { cn } from '@lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
    isDropdown?: boolean;
    onClick?: () => void;
    customDropdown?: React.ReactNode;
}

interface BBHeaderProps {
    breadcrumbs: BreadcrumbItem[];
    title: string;
    className?: string;
    showTitle?: boolean;
    rightContent?: React.ReactNode;
    customDropdown?: React.ReactNode;
}

/** Design system v2 · Breadcrumbs: 13px muted, chevron separators, current page 500 foreground. */
function Crumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <React.Fragment key={`${item.label}-${index}`}>
                            <BreadcrumbListItem>
                                {item.customDropdown ? (
                                    item.customDropdown
                                ) : item.href ? (
                                    <BreadcrumbLink asChild>
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                ) : item.onClick || item.isDropdown ? (
                                    <button
                                        type="button"
                                        onClick={item.onClick}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-1 rounded-sm transition-colors duration-fast hover:text-foreground',
                                            isLast && 'font-medium text-foreground'
                                        )}>
                                        {item.label}
                                        {item.isDropdown && <ExpandMoreIcon className="size-4" />}
                                    </button>
                                ) : (
                                    <span
                                        aria-current={isLast ? 'page' : undefined}
                                        className={cn(isLast && 'font-medium text-foreground')}>
                                        {item.label}
                                    </span>
                                )}
                            </BreadcrumbListItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

const Title = ({ children }: { children: React.ReactNode }) => (
    <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{children}</h1>
);

/**
 * Breadcrumb bar (bb-app renders breadcrumbs + an optional custom dropdown here; the title is
 * shown by the page). Horizontal padding follows the breakpoint page padding.
 */
function BBHeader({ breadcrumbs, className, customDropdown }: BBHeaderProps) {
    return (
        <div className={cn('relative bg-background py-4 page-padding', className)}>
            <Crumbs items={breadcrumbs} />
            {customDropdown}
        </div>
    );
}
BBHeader.displayName = 'BBHeader';

interface BBHeaderCompactProps extends Omit<BBHeaderProps, 'showTitle'> {
    subtitle?: string;
}

/** Breadcrumbs, 20px page title and subtitle, actions on the right; bottom divider. */
function BBHeaderCompact({
    breadcrumbs,
    title,
    subtitle,
    className,
    rightContent
}: BBHeaderCompactProps) {
    return (
        <div className={cn('border-b border-d200 bg-background py-3 page-padding', className)}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Crumbs items={breadcrumbs} />
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <Title>{title}</Title>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
            </div>
        </div>
    );
}
BBHeaderCompact.displayName = 'BBHeaderCompact';

interface BBHeaderWithSidebarProps extends BBHeaderProps {
    sidebarTrigger?: React.ReactNode;
}

/** Sidebar trigger + breadcrumbs, then title and actions. */
function BBHeaderWithSidebar({
    sidebarTrigger,
    breadcrumbs,
    title,
    showTitle,
    rightContent,
    className
}: BBHeaderWithSidebarProps) {
    return (
        <div className={cn('border-b border-d200 bg-background py-4 page-padding', className)}>
            <div className="mb-4 flex items-center gap-4">
                {sidebarTrigger}
                <div className="min-w-0 flex-1">
                    <Crumbs items={breadcrumbs} />
                </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                {showTitle && (
                    <div className="min-w-0 flex-1">
                        <Title>{title}</Title>
                    </div>
                )}
                {rightContent && <div className="flex items-center gap-2">{rightContent}</div>}
            </div>
        </div>
    );
}
BBHeaderWithSidebar.displayName = 'BBHeaderWithSidebar';

export {
    BBHeader,
    BBHeaderCompact,
    BBHeaderWithSidebar,
    type BBHeaderProps,
    type BreadcrumbItem,
    type BBHeaderCompactProps,
    type BBHeaderWithSidebarProps
};
