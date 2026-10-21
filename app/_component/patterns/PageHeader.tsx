import * as React from 'react';
import { cn } from '@lib/utils';

interface PageHeaderProps {
    /** Page title — rendered as the page's <h1> (20px / 600, design system "Page title"). */
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Right-aligned controls; wraps under the title on narrow widths. */
    actions?: React.ReactNode;
    /** Rendered above the title (e.g. a breadcrumb or back link). */
    breadcrumb?: React.ReactNode;
    /** Leading icon/avatar next to the title. */
    icon?: React.ReactNode;
    /** Rendered under the title row (tabs, filters). */
    tabs?: React.ReactNode;
    titleAs?: 'h1' | 'h2';
    bordered?: boolean;
    className?: string;
    titleClassName?: string;
    children?: React.ReactNode;
}

/**
 * The one page header: 56px band with title, optional description, breadcrumb,
 * actions and a tabs slot. Horizontal padding follows the breakpoint page padding
 * (16 / 24 / 32 / 40). Use it at the top of every list, detail and settings page.
 */
const PageHeader = ({
    title,
    description,
    actions,
    breadcrumb,
    icon,
    tabs,
    titleAs: Title = 'h1',
    bordered = true,
    className,
    titleClassName,
    children
}: PageHeaderProps) => (
    <header className={cn('flex flex-col', bordered && 'border-b border-d200', className)}>
        <div className="page-padding flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {icon && <div className="flex shrink-0 items-center">{icon}</div>}
                <div className="flex min-w-0 flex-col gap-0.5">
                    {breadcrumb && (
                        <div className="flex min-w-0 items-center text-xs text-muted-foreground">
                            {breadcrumb}
                        </div>
                    )}
                    <Title
                        className={cn(
                            'truncate text-xl font-semibold tracking-tight text-foreground',
                            titleClassName
                        )}>
                        {title}
                    </Title>
                    {description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {children}
        {tabs && <div className="page-padding">{tabs}</div>}
    </header>
);

export { PageHeader };
export type { PageHeaderProps };
