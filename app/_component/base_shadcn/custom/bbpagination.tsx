'use client';

import * as React from 'react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '../pagination';
import { Button } from '../button';
import { ChevronLeftIcon, ChevronRightIcon } from '@components/icons/material';
import { cn } from '@lib/utils';

export interface BbPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    /**
     * `pages` — numbered pages with ellipses (default).
     * `compact` — design-system table footer: ‹ Page 1 of 43 ›.
     */
    variant?: 'pages' | 'compact';
}

/** Page numbers to show: all when ≤ 5, else first/last with the current page's neighbours. */
function pageList(current: number, total: number): (number | 'ellipsis-start' | 'ellipsis-end')[] {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 'ellipsis-end', total];
    if (current >= total - 2) return [1, 'ellipsis-start', total - 2, total - 1, total];
    return [1, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total];
}

function BbPagination({
    currentPage,
    totalPages,
    onPageChange,
    className,
    variant = 'pages'
}: BbPaginationProps) {
    const go = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return;
        onPageChange(page);
    };
    const atStart = currentPage <= 1;
    const atEnd = currentPage >= totalPages;

    if (variant === 'compact') {
        return (
            <nav
                aria-label="pagination"
                className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
                <Button
                    variant="secondary"
                    size="icon-md"
                    aria-label="Previous page"
                    disabled={atStart}
                    onClick={() => go(currentPage - 1)}
                    className="disabled:bg-d100 disabled:shadow-none">
                    <ChevronLeftIcon className="size-[1.125rem]" />
                </Button>
                <span className="px-1.5 text-foreground tabular-nums">
                    Page {currentPage} of {Math.max(totalPages, 1)}
                </span>
                <Button
                    variant="secondary"
                    size="icon-md"
                    aria-label="Next page"
                    disabled={atEnd}
                    onClick={() => go(currentPage + 1)}
                    className="disabled:bg-d100 disabled:shadow-none">
                    <ChevronRightIcon className="size-[1.125rem]" />
                </Button>
            </nav>
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <Pagination className="justify-end">
                <PaginationContent>
                    <PaginationItem>
                        <Button
                            variant="ghost"
                            size="md"
                            disabled={atStart}
                            onClick={() => go(currentPage - 1)}
                            className="gap-1 pl-1.5 text-foreground">
                            <ChevronLeftIcon className="size-[1.125rem]" />
                            <span>Previous</span>
                        </Button>
                    </PaginationItem>
                    {pageList(currentPage, totalPages).map((page) =>
                        typeof page === 'number' ? (
                            <PaginationItem key={page}>
                                <Button
                                    variant={page === currentPage ? 'secondary' : 'ghost'}
                                    size="icon-md"
                                    onClick={() => go(page)}
                                    aria-label={`Page ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                    className="text-sm text-foreground tabular-nums">
                                    {page}
                                </Button>
                            </PaginationItem>
                        ) : (
                            <PaginationItem key={page}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        )
                    )}
                    <PaginationItem>
                        <Button
                            variant="ghost"
                            size="md"
                            disabled={atEnd}
                            onClick={() => go(currentPage + 1)}
                            className="gap-1 pr-1.5 text-foreground">
                            <span>Next</span>
                            <ChevronRightIcon className="size-[1.125rem]" />
                        </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export default BbPagination;
export { BbPagination };
