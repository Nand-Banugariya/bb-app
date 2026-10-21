import * as React from 'react';
import { cn } from '@lib/utils';
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizIcon } from '@components/icons/material';

import { Button, buttonVariants } from '@components/base_shadcn/button';

/**
 * Design system v2 · Pagination. Tables use `PaginationBar`:
 *   "1–3 of 128" on the left, "Page 1 of 43" with 32px prev/next buttons on the right.
 * The numbered parts (`Pagination`, `PaginationLink` …) stay for link-based paging.
 */
function PaginationBar({
    from,
    to,
    total,
    page,
    pageCount,
    onPrevious,
    onNext,
    className,
    ...props
}: Omit<React.ComponentProps<'nav'>, 'children'> & {
    from: number;
    to: number;
    total: number;
    page: number;
    pageCount: number;
    onPrevious?: () => void;
    onNext?: () => void;
}) {
    const fmt = (n: number) => n.toLocaleString();
    return (
        <nav
            aria-label="pagination"
            data-slot="pagination-bar"
            className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground',
                className
            )}
            {...props}>
            <span>
                {fmt(from)}–{fmt(to)} of {fmt(total)}
            </span>
            <span className="flex-1" />
            <Button
                variant="secondary"
                size="icon-md"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={onPrevious}
                className="disabled:bg-d100 disabled:shadow-none">
                <ChevronLeftIcon className="size-[1.125rem]" />
            </Button>
            <span className="px-1.5 text-foreground">
                Page {fmt(page)} of {fmt(pageCount)}
            </span>
            <Button
                variant="secondary"
                size="icon-md"
                aria-label="Next page"
                disabled={page >= pageCount}
                onClick={onNext}
                className="disabled:bg-d100 disabled:shadow-none">
                <ChevronRightIcon className="size-[1.125rem]" />
            </Button>
        </nav>
    );
}

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            data-slot="pagination-content"
            className={cn('flex flex-row items-center gap-1', className)}
            {...props}
        />
    );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
    isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
    React.ComponentProps<'a'>;

function PaginationLink({ className, isActive, size = 'icon-md', ...props }: PaginationLinkProps) {
    return (
        <a
            aria-current={isActive ? 'page' : undefined}
            data-slot="pagination-link"
            data-active={isActive}
            className={cn(
                buttonVariants({
                    variant: isActive ? 'secondary' : 'ghost',
                    size
                }),
                'text-sm',
                isActive && 'text-foreground',
                className
            )}
            {...props}
        />
    );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to previous page"
            size="md"
            className={cn('gap-1 px-2', className)}
            {...props}>
            <ChevronLeftIcon />
            <span className="hidden sm:block">Previous</span>
        </PaginationLink>
    );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
    return (
        <PaginationLink
            aria-label="Go to next page"
            size="md"
            className={cn('gap-1 px-2', className)}
            {...props}>
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon />
        </PaginationLink>
    );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn(
                'flex size-8 items-center justify-center text-muted-foreground',
                className
            )}
            {...props}>
            <MoreHorizIcon className="size-4" />
            <span className="sr-only">More pages</span>
        </span>
    );
}

export {
    Pagination,
    PaginationBar,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis
};
