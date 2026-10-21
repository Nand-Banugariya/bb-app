import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Input: 36px, radius 6, 1px ring (box-shadow), 14px text.
 * Focus: green 1px ring + 3px glow. Error (aria-invalid): red 1px ring. Disabled: d100 fill.
 */
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'h-9 w-full min-w-0 rounded-md border-0 bg-background px-3 text-md text-foreground shadow-hairline outline-none',
                'transition-[box-shadow,background-color] duration-fast ease-out',
                'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
                'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
                'focus-visible:shadow-focus',
                'aria-invalid:shadow-error',
                'disabled:cursor-not-allowed disabled:bg-d100 disabled:text-muted-foreground',
                className
            )}
            {...props}
        />
    );
}

export { Input };
