'use client';

import * as React from 'react';
import { cn } from '@lib/utils';
import { Slider as SliderPrimitive } from 'radix-ui';

function Slider({
    className,
    defaultValue,
    value,
    min = 0,
    max = 100,
    ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
    const _values = React.useMemo(
        () =>
            Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
        [value, defaultValue, min, max]
    );

    return (
        <SliderPrimitive.Root
            data-slot="slider"
            defaultValue={defaultValue}
            value={value}
            min={min}
            max={max}
            className={cn(
                'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
                className
            )}
            {...props}>
            <SliderPrimitive.Track
                data-slot="slider-track"
                className={cn(
                    'relative grow overflow-hidden rounded-full bg-d100 data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5'
                )}>
                <SliderPrimitive.Range
                    data-slot="slider-range"
                    className={cn(
                        'absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
                    )}
                />
            </SliderPrimitive.Track>
            {Array.from({ length: _values.length }, (_, index) => (
                <SliderPrimitive.Thumb
                    data-slot="slider-thumb"
                    key={index}
                    className="block size-4 shrink-0 cursor-grab rounded-full bg-white shadow-[0_0_0_1px_var(--primary),0_1px_2px_rgba(0,0,0,.2)] transition-shadow duration-fast hover:shadow-focus focus-visible:shadow-focus focus-visible:outline-hidden active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
                />
            ))}
        </SliderPrimitive.Root>
    );
}

export { Slider };
