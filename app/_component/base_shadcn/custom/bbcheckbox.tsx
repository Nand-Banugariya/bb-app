'use client';

import * as React from 'react';
import { Checkbox } from '../checkbox';
import { cn } from '@lib/utils';

const SIZES = {
    sm: 'size-3.5 [&_svg]:size-3',
    md: 'size-4',
    lg: 'size-5 [&_svg]:size-4'
} as const;

interface BBCheckboxProps
    extends Omit<React.ComponentProps<typeof Checkbox>, 'checked' | 'onCheckedChange'> {
    /** `'indeterminate'` renders a dash (partial selection). */
    checked?: boolean | 'indeterminate';
    onCheckedChange?: (checked: boolean) => void;
    size?: keyof typeof SIZES;
    /** Shows the indeterminate dash while unchecked (partial selection). */
    showMinusWhenUnchecked?: boolean;
}

/** Design system v2 · Checkbox: 16px, radius 4, d300 ring off, solid primary on. */
function BBCheckbox({
    className,
    checked,
    onCheckedChange,
    size = 'md',
    showMinusWhenUnchecked = false,
    ...props
}: BBCheckboxProps) {
    const state: boolean | 'indeterminate' =
        checked === 'indeterminate' || (!checked && showMinusWhenUnchecked)
            ? 'indeterminate'
            : Boolean(checked);

    return (
        <div className="flex h-full items-center justify-center">
            <Checkbox
                checked={state}
                // Indeterminate → checked on click, like a native select-all.
                onCheckedChange={(next) => onCheckedChange?.(next === true)}
                className={cn(SIZES[size], className)}
                {...props}
            />
        </div>
    );
}

interface BBCheckboxGroupProps extends React.ComponentProps<'div'> {
    orientation?: 'horizontal' | 'vertical';
    spacing?: 'sm' | 'md' | 'lg';
}

const SPACING = { sm: 'gap-2', md: 'gap-3', lg: 'gap-4' } as const;

function BBCheckboxGroup({
    className,
    orientation = 'vertical',
    spacing = 'md',
    ...props
}: BBCheckboxGroupProps) {
    return (
        <div
            role="group"
            className={cn(
                'flex',
                orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
                SPACING[spacing],
                className
            )}
            {...props}
        />
    );
}

interface BBCheckboxLabelProps extends React.ComponentProps<'label'> {
    required?: boolean;
}

function BBCheckboxLabel({
    children,
    className,
    required = false,
    ...props
}: BBCheckboxLabelProps) {
    return (
        <label
            className={cn(
                'cursor-pointer text-md leading-none text-foreground',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
                className
            )}
            {...props}>
            {children}
            {required && (
                <span aria-hidden className="ml-0.5 text-danger">
                    *
                </span>
            )}
        </label>
    );
}

interface BBCheckboxItemProps {
    children: React.ReactNode;
    className?: string;
    checkboxId?: string;
    checkboxProps?: Omit<BBCheckboxProps, 'id'>;
    labelProps?: Omit<BBCheckboxLabelProps, 'htmlFor' | 'children'>;
    required?: boolean;
}

/** Checkbox + label row, 10px apart (design: "Checked" / "Unchecked"). */
function BBCheckboxItem({
    children,
    className,
    checkboxId,
    checkboxProps,
    labelProps,
    required = false
}: BBCheckboxItemProps) {
    const autoId = React.useId();
    const id = checkboxId || autoId;
    const {
        checked,
        onCheckedChange,
        size = 'md',
        className: checkboxClassName,
        ...rest
    } = checkboxProps ?? {};

    return (
        <div className={cn('flex items-center gap-2.5', className)}>
            <Checkbox
                id={id}
                required={required}
                checked={checked}
                onCheckedChange={(next) => onCheckedChange?.(next === true)}
                className={cn(SIZES[size], checkboxClassName)}
                {...rest}
            />
            <BBCheckboxLabel htmlFor={id} required={required} {...labelProps}>
                {children}
            </BBCheckboxLabel>
        </div>
    );
}

export { BBCheckbox, BBCheckboxGroup, BBCheckboxLabel, BBCheckboxItem };
export type { BBCheckboxProps, BBCheckboxGroupProps, BBCheckboxLabelProps, BBCheckboxItemProps };
