'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';
import { Toggle as TogglePrimitive } from 'radix-ui';

/**
 * Design system v2 · Toggle.
 *   default — toolbar toggle: transparent, d100 hover, `sel` when on.
 *   primary — annotation tool: solid primary when on (screenshot editor toolbar).
 *   outline — filter / tag chip: hairline ring off, spot tint + primary ring when on.
 * Sizes: sm 28 · default 32 (toolbar tools) · lg 36.
 */
const toggleVariants = cva(
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap text-foreground transition-[color,background-color,box-shadow] duration-fast ease-out outline-none hover:bg-d100 focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:shadow-error [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.125rem]",
    {
        variants: {
            variant: {
                default: 'bg-transparent on:bg-sel',
                primary:
                    'bg-transparent on:bg-primary on:text-primary-foreground on:hover:bg-primary-hover',
                outline:
                    'bg-background shadow-hairline on:bg-spot on:shadow-[0_0_0_1px_var(--primary)]'
            },
            size: {
                default: 'h-8 min-w-8 px-1.5',
                sm: 'h-7 min-w-7 px-2.5 text-xs',
                lg: 'h-9 min-w-9 px-2.5 text-md'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

function Toggle({
    className,
    variant,
    size,
    ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
    return (
        <TogglePrimitive.Root
            data-slot="toggle"
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Toggle, toggleVariants };
