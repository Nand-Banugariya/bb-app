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
import { Spinner } from '../spinner';
import { AddIcon, CheckIcon, CloseIcon, UnfoldMoreIcon } from '@components/icons/material';
import { cn } from '@lib/utils';
import { fieldVariants } from './field-variants';

/* ------------------------------------------------------------------ */
/* Tag chip (design system v2 · "Tag chips")                           */
/* ------------------------------------------------------------------ */

interface BbTagChipProps extends Omit<React.ComponentProps<'span'>, 'prefix'> {
    label: React.ReactNode;
    /** Label colour (e.g. `var(--label-green)` or a hex). Chip is tinted 14% of it, with a dot. */
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
    prefix?: string;
    /** Shows a × that calls this. */
    onRemove?: () => void;
    /** `span` when the chip sits inside another button (no nested buttons). */
    removeAs?: 'button' | 'span';
    disabled?: boolean;
}

/** 24px pill, 12px text, 6px dot in the label colour on a 14% tint (neutral d100 without colour). */
function BbTagChip({
    label,
    color,
    icon: Icon,
    prefix,
    onRemove,
    removeAs = 'button',
    disabled,
    className,
    style,
    ...props
}: BbTagChipProps) {
    const title = typeof label === 'string' ? label : undefined;
    const stopAndRemove = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onRemove?.();
    };
    const removeClass =
        'flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring';

    return (
        <span
            data-slot="tag-chip"
            className={cn(
                'inline-flex h-6 max-w-[12.5rem] min-w-0 items-center gap-[0.3125rem] rounded-full pl-[0.5625rem] text-xs text-foreground',
                onRemove ? 'pr-1' : 'pr-[0.5625rem]',
                !color && 'bg-d100',
                className
            )}
            style={
                color
                    ? {
                          backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
                          ...style
                      }
                    : style
            }
            {...props}>
            {color && (
                <span
                    aria-hidden
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                />
            )}
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span className="min-w-0 truncate" title={title}>
                {prefix}
                {label}
            </span>
            {onRemove &&
                (removeAs === 'button' ? (
                    <button
                        type="button"
                        aria-label={`Remove ${title ?? ''}`.trim()}
                        disabled={disabled}
                        className={removeClass}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={stopAndRemove}>
                        <CloseIcon className="size-3.5" />
                    </button>
                ) : (
                    // Inside a trigger button: pointer users click it, keyboard users deselect
                    // from the list or with Backspace.
                    <span
                        aria-hidden
                        title={`Remove ${title ?? ''}`.trim()}
                        className={removeClass}
                        onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={stopAndRemove}>
                        <CloseIcon className="size-3.5" />
                    </span>
                ))}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Tags input field                                                    */
/* ------------------------------------------------------------------ */

export interface TagOption {
    id: string;
    label: string;
    value?: string;
    /** Label colour; the chip is tinted with it. */
    color?: string;
    icon?: React.ComponentType<{ className?: string }>;
    [key: string]: unknown;
}

export interface TagsInputFieldProps {
    value?: TagOption[];
    defaultValue?: TagOption[];
    onValueChange?: (tags: TagOption[]) => void;

    onSearch?: (searchTerm: string, signal?: AbortSignal) => Promise<TagOption[]>;
    onCreateTag?: (label: string) => Promise<TagOption>;
    onLoadTags?: () => Promise<TagOption[]>;

    placeholder?: string;
    createPlaceholder?: string;
    emptyMessage?: string;
    maxTags?: number;
    maxTagLength?: number;
    showTagCount?: boolean;
    tagPrefix?: string;

    debounceMs?: number;
    allowCreate?: boolean;
    allowDuplicate?: boolean;
    caseSensitive?: boolean;
    modalPopover?: boolean;

    className?: string;
    inputClassName?: string;
    popoverClassName?: string;
    badgeClassName?: string;
    error?: string;
    disabled?: boolean;

    renderTag?: (tag: TagOption, onRemove: () => void) => React.ReactNode;
    renderCreateOption?: (label: string, onCreate: () => void) => React.ReactNode;
    renderEmpty?: () => React.ReactNode;

    onTagAdd?: (tag: TagOption) => void;
    onTagRemove?: (tag: TagOption) => void;
    onTagCreate?: (tag: TagOption) => void;
}

const norm = (text: string, caseSensitive: boolean) =>
    caseSensitive ? text.trim() : text.trim().toLowerCase();

/**
 * Tags field (design system v2 · "Tags field · wraps to show every tag"): chips wrap inside a
 * 44px-min card-surface field; type to search, Enter to pick or create, Backspace removes the
 * last tag. Suggestions come from `onLoadTags` (once) and/or `onSearch` (debounced, abortable).
 */
export function TagsInputField({
    value: controlledValue,
    defaultValue = [],
    onValueChange,
    onSearch,
    onCreateTag,
    onLoadTags,
    placeholder = 'Add tags...',
    createPlaceholder = 'Create new tag',
    emptyMessage = 'No tags found. Type to create a new tag.',
    maxTags,
    maxTagLength = 25,
    showTagCount = false,
    tagPrefix = '#',
    debounceMs = 1000,
    allowCreate = true,
    allowDuplicate = false,
    caseSensitive = false,
    modalPopover = false,
    className,
    inputClassName,
    popoverClassName,
    badgeClassName,
    error,
    disabled = false,
    renderTag,
    renderCreateOption,
    renderEmpty,
    onTagAdd,
    onTagRemove,
    onTagCreate
}: TagsInputFieldProps) {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<TagOption[]>(defaultValue);
    const [searchValue, setSearchValue] = React.useState('');
    const [allTags, setAllTags] = React.useState<TagOption[]>([]);
    const [searchResults, setSearchResults] = React.useState<TagOption[] | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isCreating, setIsCreating] = React.useState(false);
    const hasLoadedTagsRef = React.useRef(false);
    const inputId = React.useId();

    const tags = controlledValue ?? internalValue;
    const setTags = (next: TagOption[]) => {
        if (controlledValue === undefined) setInternalValue(next);
        onValueChange?.(next);
    };

    const term = norm(searchValue, caseSensitive);
    const isSelectedTag = (tag: TagOption) => tags.some((t) => t.id === tag.id);

    // Suggestions: server results for the current search, else the loaded list filtered locally.
    const pool = term && searchResults ? searchResults : allTags;
    const suggestions = pool.filter(
        (tag) => !isSelectedTag(tag) && (!term || norm(tag.label, caseSensitive).includes(term))
    );
    const exactSuggestion = suggestions.find((t) => norm(t.label, caseSensitive) === term);
    const isTagSelected = Boolean(term) && tags.some((t) => norm(t.label, caseSensitive) === term);
    const isMaxReached = maxTags !== undefined && tags.length >= maxTags;
    const canCreate =
        allowCreate &&
        Boolean(onCreateTag) &&
        Boolean(term) &&
        !exactSuggestion &&
        !isTagSelected &&
        !isCreating &&
        !isLoading;

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (next && onLoadTags && !hasLoadedTagsRef.current) {
            hasLoadedTagsRef.current = true;
            setIsLoading(true);
            onLoadTags()
                .then(setAllTags)
                .catch(() => {
                    hasLoadedTagsRef.current = false;
                })
                .finally(() => setIsLoading(false));
        }
    };

    // Debounced, abortable server search (only when `onSearch` is given).
    React.useEffect(() => {
        if (!onSearch || !term) return;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await onSearch(searchValue.trim(), controller.signal);
                if (!controller.signal.aborted) setSearchResults(results);
            } catch (e) {
                if ((e as Error)?.name !== 'AbortError') setSearchResults([]);
            } finally {
                if (!controller.signal.aborted) setIsLoading(false);
            }
        }, debounceMs);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [onSearch, term, searchValue, debounceMs]);

    const handleSelectTag = (tag: TagOption) => {
        if (isMaxReached) return;
        if (!allowDuplicate && isSelectedTag(tag)) return;
        setTags([...tags, tag]);
        setSearchValue('');
        onTagAdd?.(tag);
        setOpen(false);
    };

    const handleCreateTag = async () => {
        if (!onCreateTag || !canCreate || isMaxReached) return;
        setIsCreating(true);
        try {
            const newTag = await onCreateTag(searchValue.trim());
            if (newTag) {
                setAllTags((prev) => [...prev, newTag]);
                setTags([...tags, newTag]);
                setSearchValue('');
                onTagCreate?.(newTag);
                onTagAdd?.(newTag);
                setOpen(false);
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleRemoveTag = (tag: TagOption) => {
        setTags(tags.filter((t) => t.id !== tag.id));
        onTagRemove?.(tag);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (isCreating || isLoading) return;
            if (exactSuggestion) handleSelectTag(exactSuggestion);
            else if (canCreate) void handleCreateTag();
        } else if (e.key === 'Backspace' && searchValue === '' && tags.length > 0) {
            handleRemoveTag(tags[tags.length - 1]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const handleInputChange = (next: string) => {
        // Strip the tag prefix (and repeated #) if the user types it.
        setSearchValue(
            next.replace(new RegExp(`^(${escapeRegExp(tagPrefix)})+`), '').replace(/^#+/, '')
        );
        setSearchResults(null);
    };

    return (
        <div className={cn('relative w-full', className)}>
            <Popover open={open} onOpenChange={handleOpenChange} modal={modalPopover}>
                <PopoverTrigger asChild>
                    <div
                        aria-invalid={error ? true : undefined}
                        className={cn(
                            fieldVariants({ size: 'lg', multiline: true }),
                            'min-h-11 cursor-text items-center gap-2 py-2 pr-2.5 pl-3 font-normal focus-within:shadow-focus',
                            error && 'shadow-error hover:shadow-error',
                            disabled && 'pointer-events-none bg-d100 opacity-60',
                            inputClassName
                        )}>
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                            {tags.map((tag) =>
                                renderTag ? (
                                    <React.Fragment key={tag.id}>
                                        {renderTag(tag, () => handleRemoveTag(tag))}
                                    </React.Fragment>
                                ) : (
                                    <BbTagChip
                                        key={tag.id}
                                        label={tag.label}
                                        prefix={tagPrefix}
                                        color={tag.color}
                                        icon={tag.icon}
                                        disabled={disabled}
                                        onRemove={() => handleRemoveTag(tag)}
                                        className={badgeClassName}
                                    />
                                )
                            )}
                            <input
                                id={inputId}
                                value={searchValue}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => handleOpenChange(true)}
                                placeholder={tags.length === 0 ? placeholder : ''}
                                disabled={disabled || isMaxReached}
                                maxLength={maxTagLength}
                                autoComplete="off"
                                className="h-6 min-w-24 flex-1 bg-transparent text-md outline-none placeholder:text-muted-foreground"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                            {showTagCount && maxTags && (
                                <span className="text-xs tabular-nums">
                                    {tags.length}/{maxTags}
                                </span>
                            )}
                            <UnfoldMoreIcon aria-hidden className="size-[1.125rem]" />
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    // Content-sized, so capped: a long tag name truncates instead of widening it.
                    className={cn(
                        'w-(--radix-popover-trigger-width) max-w-80 p-0',
                        popoverClassName
                    )}
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search or create tag..."
                            value={searchValue}
                            onValueChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                        />
                        <CommandList>
                            {isLoading && (
                                <div className="flex items-center justify-center py-6 text-muted-foreground">
                                    <Spinner />
                                </div>
                            )}
                            {!isLoading && suggestions.length === 0 && !canCreate && (
                                <CommandEmpty className="p-6">
                                    {!term
                                        ? renderEmpty
                                            ? renderEmpty()
                                            : emptyMessage
                                        : isTagSelected
                                          ? 'Tag is already selected'
                                          : 'No matching tags found'}
                                </CommandEmpty>
                            )}
                            {!isLoading && suggestions.length > 0 && (
                                <CommandGroup className="max-h-64 overflow-auto">
                                    {suggestions.map((tag) => {
                                        const Icon = tag.icon;
                                        return (
                                            <CommandItem
                                                key={tag.id}
                                                value={tag.id}
                                                onSelect={() => handleSelectTag(tag)}>
                                                {tag.color && (
                                                    <span
                                                        aria-hidden
                                                        className="size-1.5 shrink-0 rounded-full"
                                                        style={{ backgroundColor: tag.color }}
                                                    />
                                                )}
                                                {Icon && <Icon className="size-4 shrink-0" />}
                                                <span
                                                    className="min-w-0 truncate"
                                                    title={tag.label}>
                                                    {tagPrefix}
                                                    {tag.label}
                                                </span>
                                                <CheckIcon
                                                    aria-hidden
                                                    className={cn(
                                                        'ml-auto size-4 shrink-0 text-success',
                                                        isSelectedTag(tag)
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                    )}
                                                />
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            )}
                            {canCreate && (
                                <CommandGroup>
                                    {renderCreateOption ? (
                                        renderCreateOption(
                                            searchValue.trim(),
                                            () => void handleCreateTag()
                                        )
                                    ) : (
                                        <CommandItem
                                            value="__create__"
                                            onSelect={() => void handleCreateTag()}
                                            disabled={isCreating}>
                                            {isCreating ? (
                                                <>
                                                    <Spinner />
                                                    Creating…
                                                </>
                                            ) : (
                                                <>
                                                    <AddIcon className="size-4 shrink-0" />
                                                    <span className="min-w-0 truncate">
                                                        {createPlaceholder}: {tagPrefix}
                                                        {searchValue.trim()}
                                                    </span>
                                                </>
                                            )}
                                        </CommandItem>
                                    )}
                                </CommandGroup>
                            )}
                            {isMaxReached && (
                                <div className="px-2 py-1.5 text-center text-xs text-muted-foreground">
                                    Maximum {maxTags} tags allowed
                                </div>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        </div>
    );
}

function escapeRegExp(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default TagsInputField;
export { BbTagChip };
export type { BbTagChipProps };
