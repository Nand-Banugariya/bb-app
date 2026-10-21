import * as React from 'react';
import { cn } from '@lib/utils';

/** Design system v2 · Textarea: same ring, focus and error states as Input; 10/12px padding. */
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(
                'flex field-sizing-content min-h-20 w-full resize-y rounded-md border-0 bg-background px-3 py-2.5 text-md leading-normal text-foreground shadow-hairline outline-none',
                'transition-[box-shadow,background-color] duration-fast ease-out placeholder:text-muted-foreground',
                'focus-visible:shadow-focus',
                'aria-invalid:shadow-error',
                'disabled:cursor-not-allowed disabled:bg-d100 disabled:text-muted-foreground',
                className
            )}
            {...props}
        />
    );
}

export { Textarea };
