import { cn } from '@lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
    return (
        <kbd
            data-slot="kbd"
            className={cn(
                // Design system v2 · Kbd: 20px, radius 4, d100 fill with an inset d200 ring, 11/500 muted.
                'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-d100 px-[0.3125rem] font-sans text-2xs font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--d200)] select-none',
                "[&_svg:not([class*='size-'])]:size-3",
                '[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10',
                className
            )}
            {...props}
        />
    );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <kbd
            data-slot="kbd-group"
            className={cn('inline-flex items-center gap-1', className)}
            {...props}
        />
    );
}

export { Kbd, KbdGroup };
