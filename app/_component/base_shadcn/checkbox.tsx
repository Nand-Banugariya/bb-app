'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { CheckIcon, RemoveIcon } from '@components/icons/material';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';

/** Design system v2 · Checkbox: 16px, radius 4, d300 ring when off, solid primary when on. */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer size-4 shrink-0 cursor-pointer rounded-sm bg-background shadow-hairline-strong outline-none',
                'transition-[background-color,box-shadow] duration-fast ease-out',
                'focus-visible:ring-[3px] focus-visible:ring-ring',
                'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-none',
                'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground data-[state=indeterminate]:shadow-none',
                'aria-invalid:shadow-error',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}>
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="group grid place-content-center text-current transition-none">
                <CheckIcon className="size-3.5 group-data-[state=indeterminate]:hidden" />
                <RemoveIcon className="hidden size-3.5 group-data-[state=indeterminate]:block" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
