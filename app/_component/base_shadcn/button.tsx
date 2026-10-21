import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';
import { Slot } from 'radix-ui';

/**
 * Design system v2 · Buttons. Radius 6, weight 500, one primary per view.
 *
 * Variants (design name → variant):
 *   Primary → default · Secondary → secondary (alias: outline) · Soft → soft · Ghost → ghost
 *   Dark → dark · Destructive (red text) → destructive-outline · Delete (solid red) → destructive
 *   Link button → link
 * Sizes: sm 28 · md 32 · default 36 · xl 44 (lg is an alias of default). icon-* are squares.
 * Responsive: below 1024px icon-md grows to 40px and every button's hit area is at least 44×44.
 */
const buttonVariants = cva(
    [
        'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap select-none',
        // Below Desktop (1024px) every button gets at least a 44×44 hit area.
        'hit-area',
        'transition-[color,background-color,box-shadow,opacity] duration-fast ease-out outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:cursor-not-allowed aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed',
        'aria-invalid:shadow-error',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
    ],
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-45 aria-disabled:opacity-45',
                secondary:
                    'bg-background text-foreground shadow-[0_0_0_1px_var(--d200),0_1px_2px_rgba(0,0,0,.04)] hover:bg-d100 disabled:opacity-60',
                outline:
                    'bg-background text-foreground shadow-[0_0_0_1px_var(--d200),0_1px_2px_rgba(0,0,0,.04)] hover:bg-d100 disabled:opacity-60',
                soft: 'bg-d100 text-foreground hover:bg-d200 disabled:text-muted-foreground disabled:opacity-60',
                ghost: 'bg-transparent text-muted-foreground hover:bg-d100 hover:text-foreground disabled:opacity-60',
                dark: 'bg-foreground text-background hover:bg-foreground/90 disabled:opacity-60',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-danger-subtle disabled:opacity-60',
                'destructive-outline':
                    'bg-background text-danger shadow-hairline hover:bg-danger-subtle focus-visible:ring-danger-subtle disabled:opacity-60',
                link: 'h-auto bg-transparent px-0 text-sm text-success hover:underline underline-offset-4 disabled:opacity-60'
            },
            size: {
                xs: 'h-6 gap-1 px-2 text-xs',
                sm: 'h-7 gap-1 px-2.5 text-xs',
                md: 'h-8 px-3 text-sm',
                default: "h-9 px-3.5 text-md [&_svg:not([class*='size-'])]:size-[1.125rem]",
                lg: "h-9 px-3.5 text-md [&_svg:not([class*='size-'])]:size-[1.125rem]",
                xl: "h-11 px-[1.125rem] text-md [&_svg:not([class*='size-'])]:size-[1.125rem]",
                'icon-xs': 'size-6',
                'icon-sm': 'size-7',
                // 32px icon buttons grow to 40px below Desktop (design system v2 · touch targets).
                'icon-md': "size-8 max-md:size-10 [&_svg:not([class*='size-'])]:size-5",
                icon: "size-9 [&_svg:not([class*='size-'])]:size-5",
                'icon-lg': "size-9 [&_svg:not([class*='size-'])]:size-5",
                'icon-xl': "size-11 [&_svg:not([class*='size-'])]:size-5"
            }
        },
        compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
        defaultVariants: {
            variant: 'default',
            size: 'default'
        }
    }
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    type,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            // Only explicit type="submit" buttons submit a form.
            type={asChild ? type : (type ?? 'button')}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
