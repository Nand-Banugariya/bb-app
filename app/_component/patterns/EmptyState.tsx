import * as React from 'react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from '@components/base_shadcn/empty';
import { cn } from '@lib/utils';

interface EmptyStateProps {
    /** A Material icon element, e.g. `<BugReportIcon />`. Static — no looping animation. */
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** The action that resolves the emptiness ("New session", "Clear filters"). */
    action?: React.ReactNode;
    secondaryAction?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    /**
     * Icon tile colour (design system v2): `brand` for first-run empties ("No sessions yet"),
     * `default` for no results, `danger` for errors.
     */
    tone?: 'default' | 'brand' | 'danger';
    /** Sit it on its own card (1px ring, 8px radius). */
    bordered?: boolean;
    /** `alert` for error states so screen readers announce them. */
    role?: 'status' | 'alert';
    className?: string;
    children?: React.ReactNode;
}

const TILE = { default: 'icon', brand: 'brand', danger: 'danger' } as const;

/**
 * The one empty state (design system v2 · 11): icon tile, one-line title, one sentence,
 * one action. Copy: no trailing period in the title, sentence case, no jokes.
 */
const EmptyState = ({
    icon,
    title,
    description,
    action,
    secondaryAction,
    size = 'md',
    tone = 'default',
    bordered = false,
    role,
    className,
    children
}: EmptyStateProps) => (
    <Empty
        role={role}
        bordered={bordered}
        className={cn(
            'mx-auto w-full max-w-md flex-none motion-safe:animate-reveal',
            size === 'sm' && 'gap-2 py-6',
            size === 'lg' && 'py-16',
            bordered && 'max-w-none',
            className
        )}>
        <EmptyHeader className={cn(size === 'sm' && 'gap-2')}>
            {icon && (
                <EmptyMedia
                    aria-hidden
                    variant={TILE[tone]}
                    className={cn(size === 'sm' && "size-9 [&_svg:not([class*='size-'])]:size-5")}>
                    {icon}
                </EmptyMedia>
            )}
            <EmptyTitle
                className={cn(
                    size === 'lg' && 'text-xl',
                    size === 'sm' && '-mb-1 text-md font-semibold'
                )}>
                {title}
            </EmptyTitle>
            {description && (
                <EmptyDescription className={cn(size === 'sm' && 'text-sm')}>
                    {description}
                </EmptyDescription>
            )}
        </EmptyHeader>
        {children}
        {(action || secondaryAction) && (
            <EmptyContent className="flex-row flex-wrap justify-center gap-2">
                {action}
                {secondaryAction}
            </EmptyContent>
        )}
    </Empty>
);

export { EmptyState };
export type { EmptyStateProps };
