'use client';

import * as React from 'react';
import { Input } from '../input';
import { Kbd } from '../kbd';
import { CloseIcon, SearchIcon } from '@components/icons/material';
import { formatKey } from '@lib/customHooks/useHotkeys';
import { cn } from '@lib/utils';

export interface BbSearchBarProps
    extends Omit<React.ComponentProps<typeof Input>, 'type' | 'size'> {
    /** Search query (omit for uncontrolled use). */
    value?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Wraps the field in a form and calls this on Enter. */
    onSubmit?: (e: React.FormEvent) => void;
    /** @default "Search" */
    placeholder?: string;
    /** Width classes. @default "w-full sm:w-64" */
    width?: string;
    /** default 36 (forms, top bar) · sm 32 (table filter bars). */
    size?: 'default' | 'sm';
    /** Keyboard hint shown on the right while empty, e.g. `['mod', 'K']` → ⌘K. */
    shortcut?: string[];
    containerClassName?: string;
}

/**
 * Design system v2 · Search input: search icon left, optional ⌘K hint right, × to clear once
 * there's a value. 36px; `size="sm"` (32px, 13px text) for filter bars.
 */
function BbSearchBar({
    value,
    onChange,
    onSubmit,
    placeholder = 'Search',
    width = 'w-full sm:w-64',
    size = 'default',
    shortcut,
    containerClassName,
    className,
    ...rest
}: BbSearchBarProps) {
    const hasValue = value !== undefined && value !== null && value !== '';
    const compact = size === 'sm';

    const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onChange({
            target: { value: '' },
            currentTarget: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    const field = (
        <div className="relative w-full">
            <SearchIcon
                aria-hidden
                className={cn(
                    'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
                    compact ? 'left-2.5 size-4' : 'left-2.5 size-[1.125rem]'
                )}
            />
            <Input
                type="text"
                role="searchbox"
                aria-label={rest['aria-label'] ?? placeholder}
                placeholder={placeholder}
                {...(value !== undefined ? { value } : {})}
                onChange={onChange}
                className={cn(
                    compact ? 'h-8 pl-8 text-sm' : 'pl-9',
                    (hasValue || shortcut) && 'pr-10',
                    className
                )}
                {...rest}
            />
            {hasValue ? (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors duration-fast outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring">
                    <CloseIcon className="size-4" />
                </button>
            ) : shortcut?.length ? (
                <Kbd aria-hidden className="absolute top-1/2 right-2 -translate-y-1/2">
                    {shortcut.map(formatKey).join('')}
                </Kbd>
            ) : null}
        </div>
    );

    const containerClasses = cn('relative', width, containerClassName);

    if (onSubmit) {
        return (
            <form role="search" onSubmit={onSubmit} className={containerClasses}>
                {field}
            </form>
        );
    }
    return <div className={containerClasses}>{field}</div>;
}

export default BbSearchBar;
export { BbSearchBar };
