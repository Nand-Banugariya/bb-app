import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';
import { Slot } from 'radix-ui';

/**
 * Design system v2 · Status pills and counts.
 *   Status pill: 22px, 12/500, tinted bg + readable fg, optional 6px dot (`dot`).
 *     open → info · in progress → warning · done → success · urgent → danger · closed → secondary
 *   Count: size="sm" (18px, 11/600) — default variant for the green count, `dark` for "New".
 */
const badgeVariants = cva(
    'inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-ring [&>svg]:pointer-events-none [&>svg]:size-3',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary-hover',
                secondary: 'bg-d100 text-muted-foreground',
                info: 'bg-info-subtle text-info',
                success: 'bg-success-subtle text-success',
                warning: 'bg-warning-subtle text-warning',
                danger: 'bg-danger-subtle text-danger',
                dark: 'bg-foreground text-background',
                destructive: 'bg-destructive text-destructive-foreground',
                outline: 'bg-background text-foreground shadow-hairline [a&]:hover:bg-d100',
                ghost: 'text-foreground [a&]:hover:bg-d100',
                link: 'text-success underline-offset-4 [a&]:hover:underline'
            },
            size: {
                default: 'h-[1.375rem] px-2 text-xs',
                sm: 'h-[1.125rem] min-w-[1.125rem] px-[0.3125rem] text-2xs font-semibold'
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

function Badge({
    className,
    variant = 'default',
    size = 'default',
    dot = false,
    asChild = false,
    children,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean }) {
    const Comp = asChild ? Slot.Root : 'span';

    return (
        <Comp
            data-slot="badge"
            data-variant={variant}
            className={cn(badgeVariants({ variant, size }), className)}
            {...props}>
            {dot && !asChild && (
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
            )}
            {children}
        </Comp>
    );
}

export { Badge, badgeVariants };
