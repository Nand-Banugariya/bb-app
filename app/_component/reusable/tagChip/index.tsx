import * as React from 'react';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Tag chips. A pill tinted 14% of the label colour with a dot in the full
 * colour. Static chips (in fields, rows) are 24px; pass `onPressedChange` for the 28px
 * toggleable filter chip — off it sits on the background with a 1px ring.
 *
 * `color` is any CSS colour; use the label tokens: var(--label-green|amber|purple|pink|blue|gray|ink).
 */
interface TagChipProps extends Omit<React.ComponentProps<'span'>, 'color'> {
    label: React.ReactNode;
    color?: string;
}

const tint = (color: string) => `color-mix(in oklab, ${color} 14%, transparent)`;

function TagChip({ label, color = 'var(--label-gray)', className, style, ...props }: TagChipProps) {
    return (
        <span
            data-slot="tag-chip"
            className={cn(
                'inline-flex h-6 max-w-full shrink-0 items-center gap-[0.3125rem] rounded-full px-[0.5625rem] text-xs text-foreground',
                className
            )}
            style={{ background: tint(color), ...style }}
            {...props}>
            <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full"
                style={{ background: color }}
            />
            <span className="truncate">{label}</span>
        </span>
    );
}

interface TagChipToggleProps extends Omit<React.ComponentProps<'button'>, 'color' | 'onChange'> {
    label: React.ReactNode;
    color?: string;
    pressed: boolean;
    onPressedChange: (pressed: boolean) => void;
}

function TagChipToggle({
    label,
    color = 'var(--label-gray)',
    pressed,
    onPressedChange,
    className,
    style,
    ...props
}: TagChipToggleProps) {
    return (
        <button
            type="button"
            data-slot="tag-chip-toggle"
            aria-pressed={pressed}
            onClick={() => onPressedChange(!pressed)}
            className={cn(
                'relative inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-foreground outline-none hit-area',
                'transition-[background-color,box-shadow] duration-fast ease-out focus-visible:ring-[3px] focus-visible:ring-ring',
                !pressed && 'bg-background shadow-hairline hover:bg-d100',
                className
            )}
            style={pressed ? { background: tint(color), ...style } : style}
            {...props}>
            <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ background: color }}
            />
            {label}
        </button>
    );
}

export { TagChip, TagChipToggle };
export type { TagChipProps, TagChipToggleProps };
