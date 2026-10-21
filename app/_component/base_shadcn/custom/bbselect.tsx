'use client';

import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from '../select';
import { CloseIcon, ExpandMoreIcon } from '@components/icons/material';
import { cn } from '@lib/utils';
import { fieldLabelClasses, fieldOpenClasses, fieldVariants } from './field-variants';

type BbSelectProps = React.ComponentProps<typeof Select> & {
    label?: React.ReactNode;
    error?: boolean;
    /** Applied to the trigger. */
    className?: string;
};

const SelectContext = React.createContext<{
    id?: string;
    error?: boolean;
    className?: string;
    hasValue?: boolean;
}>({});

/**
 * Select with optional label (12/500 muted). Pair with `BbSelectTrigger` (size sm 32 · default 36
 * · lg 44 "dropdown field"), `BbSelectContent`, `BbSelectItem`.
 *
 * Radix Select doesn't fire onValueChange when the same item is re-selected after an external
 * clear (value → undefined), so a controlled value is passed to Radix as "" when empty.
 */
function BbSelect(props: BbSelectProps) {
    const { label, required, error, className, value, defaultValue, onValueChange, ...rest } =
        props;
    const selectId = React.useId();
    const controlled = 'value' in props;
    const [internalValue, setInternalValue] = React.useState<string>(defaultValue ?? '');
    const radixValue = controlled ? (value ?? '') : internalValue;

    const handleValueChange = (next: string) => {
        if (!controlled) setInternalValue(next);
        onValueChange?.(next);
    };

    return (
        <SelectContext.Provider
            value={{ id: selectId, error, className, hasValue: Boolean(radixValue) }}>
            <div className={label ? 'flex flex-col gap-1.5' : 'flex items-end'}>
                {label && (
                    <label htmlFor={selectId} className={fieldLabelClasses}>
                        {label}
                        {required && (
                            <span aria-hidden className="ml-0.5 text-danger">
                                *
                            </span>
                        )}
                    </label>
                )}
                <Select
                    value={radixValue}
                    onValueChange={handleValueChange}
                    required={required}
                    {...rest}
                />
            </div>
        </SelectContext.Provider>
    );
}

type BbSelectTriggerProps = React.ComponentProps<typeof SelectTrigger> & {
    /** Shows a × instead of the chevron while a value is selected; Backspace/Delete also clears. */
    clearable?: boolean;
    onClear?: () => void;
};

function BbSelectTrigger({
    className,
    clearable,
    onClear,
    children,
    onKeyDown,
    size = 'default',
    ...props
}: BbSelectTriggerProps) {
    const { id, error, className: contextClassName, hasValue } = React.useContext(SelectContext);

    if (!clearable) {
        return (
            <SelectTrigger
                id={id}
                size={size}
                aria-invalid={error || undefined}
                className={cn('w-full', fieldOpenClasses, contextClassName, className)}
                onKeyDown={onKeyDown}
                {...props}>
                {children}
            </SelectTrigger>
        );
    }

    return (
        <SelectPrimitive.Trigger
            id={id}
            data-slot="select-trigger"
            aria-invalid={error || undefined}
            className={cn(
                fieldVariants({ size }),
                fieldOpenClasses,
                'cursor-pointer items-center justify-between gap-2 text-left whitespace-nowrap data-[placeholder]:text-muted-foreground',
                contextClassName,
                className
            )}
            // Backspace/Delete clears from the keyboard; the × is the pointer path.
            onKeyDown={(e) => {
                if (hasValue && (e.key === 'Backspace' || e.key === 'Delete')) {
                    e.preventDefault();
                    onClear?.();
                }
                onKeyDown?.(e);
            }}
            {...props}>
            <span className="flex-1 truncate text-left">{children}</span>
            {hasValue ? (
                // Not a nested button (the trigger already is one). Stops Radix pointerdown
                // so the dropdown stays closed on clear.
                <span
                    aria-hidden
                    title="Clear selection"
                    className="flex size-4 shrink-0 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear?.();
                    }}>
                    <CloseIcon className="size-4" />
                </span>
            ) : (
                <ExpandMoreIcon aria-hidden className="size-5 shrink-0 text-muted-foreground" />
            )}
        </SelectPrimitive.Trigger>
    );
}

function BbSelectContent({ className, ...props }: React.ComponentProps<typeof SelectContent>) {
    return <SelectContent className={cn('max-h-[50vh]', className)} {...props} />;
}

function BbSelectSeparator(props: React.ComponentProps<typeof SelectSeparator>) {
    return <SelectSeparator {...props} />;
}

function BbSelectItem({ className, ...props }: React.ComponentProps<typeof SelectItem>) {
    return <SelectItem className={cn('[&_span]:truncate', className)} {...props} />;
}

function BbSelectValue({ className, ...props }: React.ComponentProps<typeof SelectValue>) {
    return <SelectValue className={cn('[&_span]:truncate', className)} {...props} />;
}

export default BbSelect;
export {
    BbSelect,
    BbSelectContent,
    BbSelectItem,
    BbSelectSeparator,
    BbSelectTrigger,
    BbSelectValue
};
export type { BbSelectProps, BbSelectTriggerProps };
