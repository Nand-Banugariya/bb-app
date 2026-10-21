import { cn } from '@lib/utils';

/**
 * Design system v2 · Spinner: 2px ring in the current colour with a transparent gap, 0.7s.
 * Only inside buttons and for short waits — page loads use Skeleton. Size with size-*
 * (14px in buttons, 20px standalone).
 */
function Spinner({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            role="status"
            aria-label="Loading"
            data-slot="spinner"
            className={cn(
                'inline-block size-3.5 shrink-0 animate-spin-fast rounded-full border-2 border-current border-r-transparent',
                className
            )}
            {...props}
        />
    );
}

export { Spinner };
