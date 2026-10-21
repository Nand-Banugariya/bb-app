'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { Popover, PopoverTrigger } from '../popover';
import { cn } from '@lib/utils';

type BBPopoverProps = React.ComponentProps<typeof Popover>;

interface BBPopoverContentProps extends React.ComponentProps<typeof PopoverPrimitive.Content> {
    /** Hide the content once the trigger scrolls out of view instead of leaving it detached. */
    hideWhenDetached?: boolean;
    /** Portal target — point it at the fullscreen element so the content stays visible there. */
    container?: HTMLElement | null;
}

type BBPopoverTriggerProps = React.ComponentProps<typeof PopoverTrigger>;

const BBPopover = (props: BBPopoverProps) => <Popover {...props} />;
BBPopover.displayName = 'BBPopover';

/**
 * Popover panel (design system v2: card surface, radius 8, menu shadow). No padding by default;
 * scrolls instead of clipping when taller than the space available.
 */
const BBPopoverContent = ({
    className,
    align = 'start',
    side = 'bottom',
    sideOffset = 8,
    alignOffset = 0,
    hideWhenDetached = false,
    container,
    ...props
}: BBPopoverContentProps) => (
    <PopoverPrimitive.Portal container={container}>
        <PopoverPrimitive.Content
            data-slot="popover-content"
            align={align}
            side={side}
            sideOffset={sideOffset}
            alignOffset={alignOffset}
            hideWhenDetached={hideWhenDetached}
            className={cn(
                'z-50 max-h-[min(24rem,var(--radix-popover-content-available-height))] w-80 origin-(--radix-popover-content-transform-origin) overflow-y-auto rounded-lg bg-popover p-0 text-popover-foreground shadow-sh-lg outline-hidden',
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                className
            )}
            {...props}
        />
    </PopoverPrimitive.Portal>
);
BBPopoverContent.displayName = 'BBPopoverContent';

const BBPopoverTrigger = (props: BBPopoverTriggerProps) => <PopoverTrigger {...props} />;
BBPopoverTrigger.displayName = 'BBPopoverTrigger';

export { BBPopover, BBPopoverContent, BBPopoverTrigger };
export type { BBPopoverProps, BBPopoverContentProps, BBPopoverTriggerProps };
