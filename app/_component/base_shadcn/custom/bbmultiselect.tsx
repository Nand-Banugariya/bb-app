'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '../command';
import { CheckIcon, UnfoldMoreIcon } from '@components/icons/material';
import { cn } from '@lib/utils';
import { fieldOpenClasses, fieldVariants } from './field-variants';
import { BbTagChip } from './bbtaginput';

export interface Option {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    /** Label colour; the chip is tinted with it (design "Tag chips"). */
    color?: string;
}

interface MultiSelectProps {
    options: Option[];
    onValueChange: (value: string[]) => void;
    /** Controlled selection. */
    value?: string[];
    defaultValue?: string[];
    placeholder?: string;
    modalPopover?: boolean;
    className?: string;
    error?: string;
    id?: string;
    'aria-label'?: string;
    /** Trigger minimum height: default 36 · lg 44 (design "Dropdown field"). */
    size?: 'default' | 'lg';
}

/**
 * Multi-select combobox. Selected options show as tag chips that wrap inside the trigger; toggle
 * them from the list (keyboard) or remove a chip with its × (pointer). Backspace in the search
 * box removes the last chip.
 */
export function MultiSelect({
    options,
    onValueChange,
    value,
    defaultValue = [],
    placeholder = 'Select items',
    modalPopover = false,
    className,
    error,
    id,
    'aria-label': ariaLabel,
    size = 'default'
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const fallbackId = React.useId();
    const listId = `${id ?? fallbackId}-list`;
    const [internal, setInternal] = React.useState<string[]>(defaultValue);
    const selected = value ?? internal;

    const update = (next: string[]) => {
        if (value === undefined) setInternal(next);
        onValueChange(next);
    };

    const toggle = (item: string) =>
        update(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = e.target as HTMLInputElement;
        if (input.value === '' && e.key === 'Backspace' && selected.length) {
            update(selected.slice(0, -1));
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    id={id}
                    role="combobox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-haspopup="listbox"
                    aria-label={ariaLabel}
                    aria-invalid={error ? true : undefined}
                    className={cn(
                        fieldVariants({ size, multiline: true }),
                        fieldOpenClasses,
                        'cursor-pointer items-center justify-between gap-2 py-1.5 pr-2.5 pl-1.5 text-left font-normal',
                        size === 'lg' && 'min-h-11',
                        className
                    )}>
                    <span className="flex min-w-0 flex-wrap gap-1.5">
                        {selected.map((item) => {
                            const option = options.find((o) => o.value === item);
                            return (
                                <BbTagChip
                                    key={item}
                                    label={option?.label ?? item}
                                    color={option?.color}
                                    icon={option?.icon}
                                    removeAs="span"
                                    onRemove={() => toggle(item)}
                                />
                            );
                        })}
                        {selected.length === 0 && (
                            <span className="px-1.5 leading-6 text-muted-foreground">
                                {placeholder}
                            </span>
                        )}
                    </span>
                    <UnfoldMoreIcon
                        aria-hidden
                        className="size-[1.125rem] shrink-0 text-muted-foreground"
                    />
                </button>
            </PopoverTrigger>
            <PopoverContent
                id={listId}
                className="w-(--radix-popover-trigger-width) max-w-80 min-w-48 p-0"
                align="start">
                <Command>
                    <CommandInput placeholder="Search…" onKeyDown={handleKeyDown} />
                    <CommandList>
                        <CommandEmpty>No matches</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => {
                                const Icon = option.icon;
                                const isSelected = selected.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => toggle(option.value)}>
                                        {option.color && (
                                            <span
                                                aria-hidden
                                                className="size-1.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: option.color }}
                                            />
                                        )}
                                        {Icon && <Icon className="size-4 shrink-0" />}
                                        <span className="min-w-0 truncate" title={option.label}>
                                            {option.label}
                                        </span>
                                        <CheckIcon
                                            aria-hidden
                                            className={cn(
                                                'ml-auto size-4 shrink-0 text-success',
                                                isSelected ? 'opacity-100' : 'opacity-0'
                                            )}
                                        />
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default MultiSelect;
