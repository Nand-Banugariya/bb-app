import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Empty & error states: icon tile, one-line title, one sentence, one action.
 * 48px tile (radius 8): `brand` for first-run empties, `default` for no results, `danger` for errors.
 * Add `bordered` to sit it on its own card (40/24 padding, 1px ring).
 */
function Empty({
    className,
    bordered = false,
    ...props
}: React.ComponentProps<'div'> & { bordered?: boolean }) {
    return (
        <div
            data-slot="empty"
            className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center text-balance',
                bordered && 'rounded-lg bg-card shadow-sh',
                className
            )}
            {...props}
        />
    );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty-header"
            className={cn('flex max-w-sm flex-col items-center gap-3 text-center', className)}
            {...props}
        />
    );
}

const emptyMediaVariants = cva(
    'flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-transparent',
                icon: "size-12 rounded-lg bg-d100 text-muted-foreground [&_svg:not([class*='size-'])]:size-6",
                brand: "size-12 rounded-lg bg-spot text-success [&_svg:not([class*='size-'])]:size-6",
                danger: "size-12 rounded-lg bg-danger-subtle text-danger [&_svg:not([class*='size-'])]:size-6"
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

function EmptyMedia({
    className,
    variant = 'default',
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
    return (
        <div
            data-slot="empty-icon"
            data-variant={variant}
            className={cn(emptyMediaVariants({ variant, className }))}
            {...props}
        />
    );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty-title"
            className={cn('-mb-2 text-lg font-semibold tracking-tight', className)}
            {...props}
        />
    );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
    return (
        <div
            data-slot="empty-description"
            className={cn(
                'max-w-[17.5rem] text-md text-muted-foreground [&>a]:text-success [&>a]:underline-offset-4 [&>a:hover]:underline',
                className
            )}
            {...props}
        />
    );
}

function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="empty-content"
            className={cn(
                'flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-md text-balance',
                className
            )}
            {...props}
        />
    );
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
