'use client';

import * as React from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '../command';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Avatar, AvatarFallback, AvatarImage } from '../avatar';
import { Spinner } from '../spinner';
import { CheckIcon, ExpandMoreIcon } from '@components/icons/material';
import { cn } from '@lib/utils';
import { fieldLabelClasses, fieldOpenClasses, fieldVariants } from './field-variants';

export interface ComboboxOption {
    value: string;
    label: string;
    email?: string;
    /** Avatar: a full image URL, or any node (an icon or letter tile). */
    image?: string | React.ReactNode;
    /** Shown after the option's text in the list, e.g. an "Invited" tag. */
    suffix?: React.ReactNode;
}

export interface BbComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    buttonClassName?: string;
    popoverClassName?: string;
    commandListClassName?: string;
    disabled?: boolean;
    label?: string;
    required?: boolean;
    error?: boolean;
    loading?: boolean;
    /** Trigger height: sm 32 · default 36 · lg 44 (design "Dropdown field"). */
    size?: 'sm' | 'default' | 'lg';
    /** `data-guide` on the trigger itself (a Get Started tour target). */
    dataGuide?: string;
    id?: string;
    /** Field name for a combobox without a visible label; the selection is read after it. */
    'aria-label'?: string;
    /** Control the dropdown from outside (a keyboard shortcut); uncontrolled when left out. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

/**
 * Searchable single select. Options with an `email` render as people (avatar, name, email);
 * search matches label and email. Selecting the current option again clears it.
 */
export function BbCombobox({
    options = [],
    value,
    onValueChange,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyText = 'No option found.',
    className,
    error,
    buttonClassName,
    popoverClassName,
    commandListClassName,
    disabled = false,
    label,
    required,
    loading = false,
    size = 'default',
    dataGuide,
    id,
    'aria-label': ariaLabel,
    open: openProp,
    onOpenChange
}: BbComboboxProps) {
    const autoId = React.useId();
    const triggerId = id ?? autoId;
    const listId = `${triggerId}-list`;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = openProp ?? internalOpen;
    const setOpen = (next: boolean) => {
        setInternalOpen(next);
        onOpenChange?.(next);
    };
    const [internalValue, setInternalValue] = React.useState('');
    const currentValue = value !== undefined ? String(value) : internalValue;

    const handleSelect = (selected: string) => {
        const next = selected === currentValue ? '' : selected;
        setInternalValue(next);
        onValueChange?.(next);
        setOpen(false);
    };

    const selectedOption = options.find((option) => String(option.value) === currentValue);

    return (
        <div className="flex max-w-full flex-col gap-1.5">
            {label && (
                <label htmlFor={triggerId} className={fieldLabelClasses}>
                    {label}
                    {required && (
                        <span aria-hidden className="ml-0.5 text-danger">
                            *
                        </span>
                    )}
                </label>
            )}
            <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)} modal>
                <PopoverTrigger disabled={disabled} asChild>
                    <button
                        type="button"
                        id={triggerId}
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-haspopup="listbox"
                        aria-invalid={error || undefined}
                        aria-label={
                            ariaLabel
                                ? `${ariaLabel}: ${selectedOption ? selectedOption.label : placeholder}`
                                : undefined
                        }
                        disabled={disabled}
                        data-guide={dataGuide}
                        className={cn(
                            fieldVariants({ size }),
                            fieldOpenClasses,
                            'max-w-full cursor-pointer items-center justify-between gap-2 text-left',
                            selectedOption ? 'text-foreground' : 'text-muted-foreground',
                            buttonClassName,
                            className
                        )}>
                        <span className="truncate">
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        <ExpandMoreIcon
                            aria-hidden
                            className="size-5 shrink-0 text-muted-foreground"
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    id={listId}
                    className={cn(
                        'w-(--radix-popover-trigger-width) min-w-48 p-0',
                        popoverClassName
                    )}
                    align="start">
                    {loading ? (
                        <div className="flex items-center justify-center p-6 text-muted-foreground">
                            <Spinner className="size-5" />
                        </div>
                    ) : (
                        <Command
                            filter={(itemValue, search) => {
                                if (!search) return 1;
                                const option = options.find((opt) => opt.value === itemValue);
                                if (!option) return 0;
                                const term = search.toLowerCase().trim();
                                return option.label?.toLowerCase().includes(term) ||
                                    option.email?.toLowerCase().includes(term)
                                    ? 1
                                    : 0;
                            }}>
                            <CommandInput placeholder={searchPlaceholder} />
                            <CommandList className={commandListClassName}>
                                <CommandEmpty>{emptyText}</CommandEmpty>
                                <CommandGroup>
                                    {options.map((option, index) => (
                                        <CommandItem
                                            key={`${option.value}-${index}`}
                                            value={option.value}
                                            onSelect={handleSelect}
                                            className={cn(option.email && 'h-auto py-1.5')}>
                                            {option.email ? (
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    <Avatar size="lg" className="shrink-0">
                                                        {typeof option.image === 'string' ||
                                                        option.image === undefined ? (
                                                            <>
                                                                {option.image && (
                                                                    <AvatarImage
                                                                        src={option.image}
                                                                        alt={option.label}
                                                                    />
                                                                )}
                                                                <AvatarFallback>
                                                                    {(
                                                                        option.label?.[0] ||
                                                                        option.email?.[0] ||
                                                                        '?'
                                                                    ).toUpperCase()}
                                                                </AvatarFallback>
                                                            </>
                                                        ) : (
                                                            <span className="flex size-full items-center justify-center">
                                                                {option.image}
                                                            </span>
                                                        )}
                                                    </Avatar>
                                                    <div className="flex min-w-0 flex-col">
                                                        <p
                                                            className="truncate text-sm font-medium text-foreground"
                                                            title={option.label}>
                                                            {option.label}
                                                        </p>
                                                        <p
                                                            className="truncate text-xs text-muted-foreground"
                                                            title={option.email}>
                                                            {option.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Shrinks so a suffix (e.g. Invited) stays in view.
                                                <span className="min-w-0 truncate">
                                                    {option.label}
                                                </span>
                                            )}
                                            {option.suffix}
                                            <CheckIcon
                                                aria-hidden
                                                className={cn(
                                                    'ml-auto size-4 shrink-0 text-success',
                                                    currentValue === option.value
                                                        ? 'opacity-100'
                                                        : 'opacity-0'
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default BbCombobox;
