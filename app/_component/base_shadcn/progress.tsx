'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { Progress as ProgressPrimitive } from 'radix-ui';

/** Design system v2 · Progress (uploads, usage): 6px d100 track, primary fill, base-speed ease-out. */
function Progress({
    className,
    value,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-d100', className)}
            {...props}>
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className="h-full w-full flex-1 rounded-full bg-primary transition-transform duration-base ease-out"
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    );
}

export { Progress };
