'use client';

import * as React from 'react';
import { Slider as SliderPrimitive } from 'radix-ui';
import { cn } from '@lib/utils';

type BbRangeSliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
    trackClassName?: string;
    rangeClassName?: string;
    thumbClassName?: string;
};

/**
 * Range slider with the design-system `Slider` look: 6px d100 track, primary range, white 16px
 * thumbs with a primary ring and the focus glow. Pass two values for a range
 * (`defaultValue={[20, 80]}`); one thumb is rendered per value. `aria-label` names every thumb.
 */
function BbRangeSlider({
    className,
    defaultValue,
    trackClassName,
    rangeClassName,
    thumbClassName,
    value,
    min = 0,
    max = 100,
    'aria-label': ariaLabel,
    ...props
}: BbRangeSliderProps) {
    const values = Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max];

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
                    'relative grow overflow-hidden rounded-full bg-d100 data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5',
                    trackClassName
                )}>
                <SliderPrimitive.Range
                    data-slot="slider-range"
                    className={cn(
                        'absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full',
                        rangeClassName
                    )}
                />
            </SliderPrimitive.Track>
            {values.map((_, index) => (
                <SliderPrimitive.Thumb
                    data-slot="slider-thumb"
                    key={index}
                    aria-label={ariaLabel}
                    className={cn(
                        'block size-4 shrink-0 cursor-grab rounded-full bg-white shadow-[0_0_0_1px_var(--primary),0_1px_2px_rgba(0,0,0,.2)] transition-shadow duration-fast hover:shadow-focus focus-visible:shadow-focus focus-visible:outline-hidden active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50',
                        thumbClassName
                    )}
                />
            ))}
        </SliderPrimitive.Root>
    );
}

export { BbRangeSlider };
export type { BbRangeSliderProps };
