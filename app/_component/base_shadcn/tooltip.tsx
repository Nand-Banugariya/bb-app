'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

function TooltipProvider({
    delayDuration = 0,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/** Design system v2 · Tooltip: inverted (foreground surface), 12/500, radius 6, no arrow. */
function TooltipContent({
    className,
    sideOffset = 6,
    container,
    children,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
    /** Portal target — point it at a fullscreen element so the tooltip stays visible there. */
    container?: HTMLElement | null;
}) {
    return (
        <TooltipPrimitive.Portal container={container}>
            <TooltipPrimitive.Content
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    'z-50 flex w-fit origin-(--radix-tooltip-content-transform-origin) animate-in items-center gap-1.5 rounded-md bg-foreground px-2 py-[0.3125rem] text-xs font-medium text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                    className
                )}
                {...props}>
                {children}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
