'use client';

import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Table: 40px header on the sidebar surface (12/500 muted), 52px rows
 * with a d100 divider, d100 hover, `sel` for the selected row. Narrow screens keep the
 * table's min-width and scroll sideways.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table
                data-slot="table"
                className={cn('w-full caption-bottom text-md', className)}
                {...props}
            />
        </div>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead
            data-slot="table-header"
            className={cn(
                'bg-side [&_tr]:border-y [&_tr]:border-d200 [&_tr]:hover:bg-side',
                className
            )}
            {...props}
        />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'border-t border-d200 text-sm text-muted-foreground [&>tr]:last:border-b-0',
                className
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'border-b border-d100 transition-colors duration-fast hover:bg-d100 has-aria-expanded:bg-d100 data-[state=selected]:bg-sel',
                className
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
                className
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot="table-cell"
            className={cn(
                'h-[3.25rem] px-3 align-middle whitespace-nowrap first:pl-4 last:pr-4 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
                className
            )}
            {...props}
        />
    );
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('mt-4 text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
