import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/utils';

/**
 * Design system v2 · Alert: tinted surface, radius 6, 10/12px padding, 13px text, 18px icon.
 *   info (permissions) · warning (credits, limits) · destructive (errors) · success (sent, saved)
 * Title is the bold lead-in; description inherits the variant colour.
 */
const alertVariants = cva(
    'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-md px-3 py-2.5 text-sm has-[>svg]:grid-cols-[1.125rem_1fr] has-[>svg]:gap-x-2 [&>svg]:size-[1.125rem] [&>svg]:text-current',
    {
        variants: {
            variant: {
                default:
                    'bg-card text-card-foreground shadow-sh *:data-[slot=alert-description]:text-muted-foreground',
                info: 'bg-info-subtle text-info',
                warning: 'bg-warning-subtle text-warning',
                destructive: 'bg-danger-subtle text-danger',
                success: 'bg-success-subtle text-success'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

function Alert({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn('col-start-2 line-clamp-1 font-semibold', className)}
            {...props}
        />
    );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed',
                className
            )}
            {...props}
        />
    );
}

export { Alert, AlertTitle, AlertDescription };
