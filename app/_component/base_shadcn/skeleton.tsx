import { cn } from '@lib/utils';

/**
 * Design system v2 · Skeleton: `sk` fill, 1.6s pulse, radius 6. Use tone="subtle" (d100) for
 * secondary lines. Skeletons match the real layout; don't use a spinner for page loads.
 */
function Skeleton({
    className,
    tone = 'default',
    ...props
}: React.ComponentProps<'div'> & { tone?: 'default' | 'subtle' }) {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                'animate-pulse-sk rounded-md',
                tone === 'subtle' ? 'bg-d100' : 'bg-sk',
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
