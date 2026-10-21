'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../table';
import { Skeleton } from '../skeleton';
import { Checkbox } from '../checkbox';
import { useLatch } from '@lib/customHooks/useLatch';
import { cn } from '@lib/utils';
import BbPagination from './bbpagination';
import BbSelect, {
    BbSelectContent,
    BbSelectItem,
    BbSelectTrigger,
    BbSelectValue
} from './bbselect';

interface BbTableColumn<T> {
    key: string;
    title: React.ReactNode;
    render?: (value: unknown, item: T, index: number) => React.ReactNode;
    headerRender?: () => React.ReactNode;
    /** Placeholder for this column's cells while `loading` (defaults to a bar). */
    skeleton?: () => React.ReactNode;
    className?: string;
    /** Any CSS width (`'200px'`, `'20%'`, `'12rem'`). Applied inline. */
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface BbTablePagination {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: string[];
    showTotal?: (total: number, range: [number, number]) => string;
}

interface BbTableProps<T> {
    data: T[];
    columns: BbTableColumn<T>[];
    className?: string;
    headerClassName?: string;
    rowClassName?: string;
    cellClassName?: string;
    emptyText?: React.ReactNode;
    caption?: string;
    onRowClick?: (item: T, index: number, event?: React.MouseEvent | React.KeyboardEvent) => void;
    /** Rows behave like links: click/Enter opens in place, ⌘/Ctrl-click or middle-click a new tab. */
    rowHref?: (item: T) => string | undefined;
    /** Accessible name for a clickable row (read when it receives focus). */
    rowLabel?: (item: T) => string;
    /** Highlighted row (index in the current page), shown with the `sel` fill. */
    selectedRow?: number | null;
    pagination?: BbTablePagination;
    onPaginationChange?: (page: number, pageSize: number) => void;
    /** Data is already one page from the server; don't slice. */
    serverSide?: boolean;
    /** Row density: sm 40 · default 52 (design) · lg 56. */
    size?: 'sm' | 'lg' | 'default';
    /** Keeps header and pagination and fills the body with skeleton rows (one per page slot). */
    loading?: boolean;
    /** Skeleton rows while `loading`, for short lists; defaults to the page size. */
    skeletonRows?: number;
    /** Below this width the table scrolls sideways instead of squashing columns (e.g. 760). */
    minWidth?: number | string;
    /** Stable row key (defaults to `item.id ?? item._id ?? index`). */
    rowKey?: (item: T, index: number) => React.Key;
    /** Clickable rows take keyboard focus; `false` when a cell already holds the row's link. */
    rowFocusable?: boolean;
    /** Adds a checkbox column (with select-all for the page). Keys come from `rowKey`. */
    selectable?: boolean;
    selectedKeys?: React.Key[];
    onSelectionChange?: (keys: React.Key[]) => void;
    /** Footer pager: `compact` = design "‹ Page 1 of 43 ›" (default) · `pages` = numbered. */
    paginationVariant?: 'compact' | 'pages';
    /** Sits the table on its own card surface (1px ring, radius 8). */
    bordered?: boolean;
}

// Clicks on controls inside a row (menus, checkboxes, links) and on portaled content opened
// from it must not also activate the row.
const isFromNestedControl = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    if (!e.currentTarget.contains(target)) return true;
    const control = target.closest(
        'button, a, input, select, textarea, label, [role="menuitem"], [role="checkbox"], [role="switch"], [data-row-click-ignore]'
    );
    return Boolean(control && control !== e.currentTarget && e.currentTarget.contains(control));
};

const SIZE_CLASSES = {
    sm: { head: 'h-8', cell: 'h-10 text-sm' },
    default: { head: '', cell: '' },
    lg: { head: 'h-12', cell: 'h-14' }
} as const;

const alignClass = (align?: 'left' | 'center' | 'right') =>
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : undefined;

/**
 * Design system v2 · Table: 40px header on the sidebar surface, 52px rows, d100 hover, `sel`
 * for the selected row, footer with "1–3 of 128" and the pager. Column-config based.
 */
function BbTable<T extends Record<string, unknown>>({
    data,
    columns,
    className,
    headerClassName,
    rowClassName,
    cellClassName,
    emptyText = 'Nothing here yet',
    caption,
    onRowClick,
    rowHref,
    rowLabel,
    selectedRow,
    pagination,
    onPaginationChange,
    serverSide = false,
    size = 'default',
    loading = false,
    skeletonRows,
    minWidth,
    rowKey,
    rowFocusable = true,
    selectable = false,
    selectedKeys,
    onSelectionChange,
    paginationVariant = 'compact',
    bordered = false
}: BbTableProps<T>) {
    const router = useRouter();
    const sizeLabelId = React.useId();
    const [currentPage, setCurrentPage] = React.useState(pagination?.current ?? 1);
    const [pageSize, setPageSize] = React.useState(pagination?.pageSize ?? 10);
    const [internalSelection, setInternalSelection] = React.useState<React.Key[]>([]);
    const selection = selectedKeys ?? internalSelection;

    // Follow page / page-size changes from the parent (adjusting state during render).
    const [syncedPagination, setSyncedPagination] = React.useState([
        pagination?.current,
        pagination?.pageSize
    ]);
    if (
        syncedPagination[0] !== pagination?.current ||
        syncedPagination[1] !== pagination?.pageSize
    ) {
        setSyncedPagination([pagination?.current, pagination?.pageSize]);
        if (pagination?.current) setCurrentPage(pagination.current);
        if (pagination?.pageSize) setPageSize(pagination.pageSize);
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = pagination && !serverSide ? data.slice(startIndex, endIndex) : data;

    // Rows replacing skeleton rows fade in; skeleton rows on a refetch wait 150ms before fading
    // in, so a quick page change doesn't flash.
    const hasShownSkeleton = useLatch(loading);
    const hasShownRows = useLatch(!loading && pageData.length > 0);

    const total = pagination ? pagination.total : data.length;
    const totalPages = Math.ceil(total / pageSize);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        onPaginationChange?.(page, pageSize);
    };

    const handlePageSizeChange = (next: number) => {
        setPageSize(next);
        setCurrentPage(1);
        onPaginationChange?.(1, next);
    };

    const sizeClasses = SIZE_CLASSES[size];
    const isClickable = Boolean(onRowClick || rowHref);
    const isRowFocusable = isClickable && rowFocusable;

    const getKey = (item: T, index: number): React.Key =>
        rowKey?.(item, index) ?? (item.id as React.Key) ?? (item._id as React.Key) ?? index;

    const pageKeys = pageData.map(getKey);
    const selectedOnPage = pageKeys.filter((k) => selection.includes(k)).length;
    const setSelection = (keys: React.Key[]) => {
        if (selectedKeys === undefined) setInternalSelection(keys);
        onSelectionChange?.(keys);
    };
    const toggleAll = (checked: boolean) =>
        setSelection(
            checked
                ? [...new Set([...selection, ...pageKeys])]
                : selection.filter((k) => !pageKeys.includes(k))
        );
    const toggleRow = (key: React.Key, checked: boolean) =>
        setSelection(checked ? [...selection, key] : selection.filter((k) => k !== key));

    const activateRow = (
        item: T,
        index: number,
        event: React.MouseEvent | React.KeyboardEvent,
        newTab = false
    ) => {
        const href = rowHref?.(item);
        if (href) {
            if (newTab) window.open(href, '_blank', 'noopener');
            else router.push(href);
        }
        onRowClick?.(item, index, event);
    };

    const rangeStart = total === 0 ? 0 : startIndex + 1;
    const rangeEnd = Math.min(endIndex, total);
    const pageSizeOptions = pagination?.pageSizeOptions ?? ['10', '25', '50', '100'];
    const colCount = columns.length + (selectable ? 1 : 0);
    const checkboxCellClass = 'w-10 pr-0';

    return (
        <div
            className={cn(
                'w-full',
                bordered && 'overflow-hidden rounded-lg bg-card shadow-sh',
                className
            )}>
            <Table
                className="table-fixed"
                style={minWidth !== undefined ? { minWidth } : undefined}>
                {caption && <TableCaption>{caption}</TableCaption>}
                <TableHeader className={headerClassName}>
                    <TableRow>
                        {selectable && (
                            <TableHead className={cn(checkboxCellClass, sizeClasses.head)}>
                                <Checkbox
                                    aria-label="Select all rows on this page"
                                    disabled={loading || pageKeys.length === 0}
                                    checked={
                                        selectedOnPage === 0
                                            ? false
                                            : selectedOnPage === pageKeys.length
                                              ? true
                                              : 'indeterminate'
                                    }
                                    onCheckedChange={(next) => toggleAll(next === true)}
                                />
                            </TableHead>
                        )}
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                style={column.width ? { width: column.width } : undefined}
                                className={cn(
                                    sizeClasses.head,
                                    alignClass(column.align),
                                    column.className
                                )}>
                                {column.headerRender ? column.headerRender() : column.title}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody
                    // A fresh body each time loading flips, so each fade runs once.
                    key={loading ? 'loading' : 'loaded'}
                    className={cn(
                        loading
                            ? hasShownRows && 'motion-safe:animate-skeleton-in'
                            : hasShownSkeleton && 'motion-safe:animate-reveal'
                    )}>
                    {loading ? (
                        Array.from({ length: skeletonRows ?? pageSize }, (_, index) => (
                            <TableRow
                                key={`loading-${index}`}
                                aria-hidden
                                className="hover:bg-transparent">
                                {selectable && (
                                    <TableCell className={cn(checkboxCellClass, sizeClasses.cell)}>
                                        <Skeleton className="size-4 rounded-sm" />
                                    </TableCell>
                                )}
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.key}
                                        className={cn(
                                            sizeClasses.cell,
                                            cellClassName,
                                            column.className
                                        )}>
                                        {column.skeleton ? (
                                            column.skeleton()
                                        ) : (
                                            <Skeleton
                                                className={cn(
                                                    'h-3 w-3/4',
                                                    column.align === 'center' && 'mx-auto',
                                                    column.align === 'right' && 'ml-auto'
                                                )}
                                            />
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : pageData.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={colCount}
                                className="h-24 text-center whitespace-normal text-muted-foreground">
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    ) : (
                        pageData.map((item, index) => {
                            const key = getKey(item, index);
                            const isChecked = selection.includes(key);
                            const isSelected = selectedRow === index || isChecked;
                            return (
                                <TableRow
                                    key={key}
                                    className={cn(
                                        rowClassName,
                                        isClickable && 'cursor-pointer',
                                        isRowFocusable &&
                                            'focus-visible:bg-d100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset'
                                    )}
                                    tabIndex={isRowFocusable ? 0 : undefined}
                                    aria-label={isRowFocusable ? rowLabel?.(item) : undefined}
                                    aria-selected={isSelected || undefined}
                                    data-state={isSelected ? 'selected' : undefined}
                                    onClick={
                                        isClickable
                                            ? (e) => {
                                                  if (isFromNestedControl(e)) return;
                                                  activateRow(
                                                      item,
                                                      index,
                                                      e,
                                                      e.metaKey || e.ctrlKey
                                                  );
                                              }
                                            : undefined
                                    }
                                    onAuxClick={
                                        rowHref
                                            ? (e) => {
                                                  if (e.button === 1 && !isFromNestedControl(e))
                                                      activateRow(item, index, e, true);
                                              }
                                            : undefined
                                    }
                                    onKeyDown={
                                        isRowFocusable
                                            ? (e) => {
                                                  if (e.target !== e.currentTarget) return;
                                                  if (e.key === 'Enter' || e.key === ' ') {
                                                      e.preventDefault();
                                                      activateRow(
                                                          item,
                                                          index,
                                                          e,
                                                          e.metaKey || e.ctrlKey
                                                      );
                                                  }
                                              }
                                            : undefined
                                    }>
                                    {selectable && (
                                        <TableCell
                                            className={cn(checkboxCellClass, sizeClasses.cell)}>
                                            <Checkbox
                                                aria-label={`Select row ${index + 1}`}
                                                checked={isChecked}
                                                onCheckedChange={(next) =>
                                                    toggleRow(key, next === true)
                                                }
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={cn(
                                                sizeClasses.cell,
                                                alignClass(column.align),
                                                cellClassName,
                                                column.className
                                            )}>
                                            {column.render
                                                ? column.render(item[column.key], item, index)
                                                : (item[column.key] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
            {/* No footer while the first page loads (total not known yet). */}
            {pagination && !(loading && !(totalPages > 0)) && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-d200 px-4 py-2.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3 tabular-nums">
                        <span>
                            {pagination.showTotal
                                ? pagination.showTotal(total, [rangeStart, rangeEnd])
                                : `${rangeStart}–${rangeEnd} of ${total.toLocaleString()}`}
                        </span>
                        {pagination.showSizeChanger && (
                            <div className="flex items-center gap-2">
                                <span id={sizeLabelId}>Rows per page</span>
                                <BbSelect
                                    value={String(pageSize)}
                                    onValueChange={(v) => handlePageSizeChange(Number(v))}>
                                    <BbSelectTrigger
                                        size="sm"
                                        aria-labelledby={sizeLabelId}
                                        className="w-18">
                                        <BbSelectValue />
                                    </BbSelectTrigger>
                                    <BbSelectContent>
                                        {pageSizeOptions.map((option) => (
                                            <BbSelectItem key={option} value={option}>
                                                {option}
                                            </BbSelectItem>
                                        ))}
                                    </BbSelectContent>
                                </BbSelect>
                            </div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <BbPagination
                            variant={paginationVariant}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            className="w-auto"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default BbTable;
export { BbTable };
export type { BbTableColumn, BbTableProps, BbTablePagination };
