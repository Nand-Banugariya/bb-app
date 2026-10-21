'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

function RadioGroup({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
    return (
        <RadioGroupPrimitive.Root
            data-slot="radio-group"
            className={cn('grid gap-3', className)}
            {...props}
        />
    );
}

/** Design system v2 · Radio: 16px circle, d300 ring when off, primary ring + 8px dot when on. */
function RadioGroupItem({
    className,
    ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
    return (
        <RadioGroupPrimitive.Item
            data-slot="radio-group-item"
            className={cn(
                'aspect-square size-4 shrink-0 cursor-pointer rounded-full bg-background shadow-hairline-strong outline-none',
                'transition-shadow duration-fast ease-out',
                'data-[state=checked]:shadow-[inset_0_0_0_1px_var(--primary)]',
                'focus-visible:ring-[3px] focus-visible:ring-ring',
                'aria-invalid:shadow-error',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}>
            <RadioGroupPrimitive.Indicator
                data-slot="radio-group-indicator"
                className="flex size-full items-center justify-center">
                <span className="size-2 rounded-full bg-primary" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
}

export { RadioGroup, RadioGroupItem };
