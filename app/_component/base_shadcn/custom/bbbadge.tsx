import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Status/label pill (22px, 12/500, tinted bg + readable fg). Not interactive.
 * Variants keep bb-app's names: `partial` is an alias of `warning`, `neutral` is the grey
 * "Closed" pill, `destructive` is the solid red pill. Use `dot` for the 6px status dot.
 */
const bbbadgeVariants = cva(
    'inline-flex h-[1.375rem] w-fit items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground',
                secondary: 'bg-d100 text-foreground',
                neutral: 'bg-d100 text-muted-foreground',
                destructive: 'bg-destructive text-destructive-foreground',
                danger: 'bg-danger-subtle text-danger',
                success: 'bg-success-subtle text-success',
                warning: 'bg-warning-subtle text-warning',
                partial: 'bg-warning-subtle text-warning',
                info: 'bg-info-subtle text-info',
                outline: 'bg-background text-foreground shadow-hairline'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

export interface BBBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof bbbadgeVariants> {
    /** 6px dot in the current colour before the label (status pills). */
    dot?: boolean;
}

function BBBadge({ className, variant, dot = false, children, ...props }: BBBadgeProps) {
    return (
        <div className={cn(bbbadgeVariants({ variant }), className)} {...props}>
            {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />}
            {children}
        </div>
    );
}

export { BBBadge, bbbadgeVariants };
