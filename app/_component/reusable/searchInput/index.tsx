'use client';

import * as React from 'react';
import { SearchIcon } from '@components/icons/material';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@components/base_shadcn/input-group';
import { Kbd } from '@components/base_shadcn/kbd';
import { formatKey } from '@lib/customHooks/useHotkeys';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Search input: search icon, hairline ring, green focus ring + glow, and an
 * optional shortcut hint (⌘K). `size="default"` is 36px (forms, page headers); `size="sm"` is
 * the 32px compact version for table filter bars.
 */
interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
    size?: 'default' | 'sm';
    /** Keys shown on the right, e.g. ['mod', 'K']. Hidden while the field has a value. */
    shortcut?: string[];
    containerClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
    { size = 'default', shortcut, containerClassName, className, placeholder = 'Search', ...props },
    ref
) {
    const sm = size === 'sm';
    const hasValue = props.value !== undefined && props.value !== '';
    return (
        <InputGroup className={cn(sm ? 'h-8' : 'h-9', containerClassName)}>
            <InputGroupAddon className="pl-2.5">
                <SearchIcon
                    className={cn('text-muted-foreground', sm ? 'size-4' : 'size-[1.125rem]')}
                />
            </InputGroupAddon>
            <InputGroupInput
                ref={ref}
                type="search"
                placeholder={placeholder}
                className={cn(sm && 'text-sm', className)}
                {...props}
            />
            {shortcut?.length && !hasValue ? (
                <InputGroupAddon align="inline-end" className="pr-2">
                    <Kbd suppressHydrationWarning>
                        {shortcut.map((key) => formatKey(key)).join('')}
                    </Kbd>
                </InputGroupAddon>
            ) : null}
        </InputGroup>
    );
});

export { SearchInput };
export type { SearchInputProps };
