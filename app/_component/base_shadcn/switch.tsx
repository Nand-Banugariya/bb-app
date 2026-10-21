'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { Switch as SwitchPrimitive } from 'radix-ui';

/**
 * Design system v2 · Switch: 36×20 pill, 16px white thumb, primary when on, d300 when off.
 * The thumb moves with the spring easing. `sm` is a 28×16 variant for dense rows.
 */
function Switch({
    className,
    size = 'default',
    ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
    size?: 'sm' | 'default';
}) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            className={cn(
                'peer group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none',
                'transition-colors duration-base ease-out',
                'data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7',
                'data-[state=checked]:bg-primary data-[state=unchecked]:bg-d300',
                'focus-visible:ring-[3px] focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}>
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className={cn(
                    'pointer-events-none block rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.2)]',
                    'transition-transform duration-base ease-spring',
                    'group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3',
                    'data-[state=unchecked]:translate-x-0',
                    'group-data-[size=default]/switch:data-[state=checked]:translate-x-4 group-data-[size=sm]/switch:data-[state=checked]:translate-x-3'
                )}
            />
        </SwitchPrimitive.Root>
    );
}

export { Switch };
